import type { CartItem } from "@/types";

const FALLBACK_API_URL = "http://127.0.0.1:8000/api";

function apiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || FALLBACK_API_URL).replace(/\/$/, "");
}

type CheckoutForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  postalCode: string;
  country: string;
  deliveryArea: string;
  fulfillment: "delivery" | "pickup";
  deliveryFee: number;
};

async function readJsonResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error(
      response.ok
        ? "The payment service returned an unexpected response."
        : `The payment service is unavailable (${response.status}). Please try again shortly.`
    );
  }

  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    throw new Error("The payment service returned an invalid response. Please try again.");
  }
}

async function getCsrfToken() {
  const response = await fetch(`${apiBaseUrl()}/csrf/`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Could not prepare checkout. Please try again.");
  }

  const data = await readJsonResponse(response);
  if (typeof data.csrfToken !== "string") {
    throw new Error("Could not prepare checkout. Please try again.");
  }
  return data.csrfToken;
}

export async function createOrder(form: CheckoutForm, items: CartItem[]) {
  const csrfToken = await getCsrfToken();
  const normalizedItems = items.map((item) => ({
    productId: Number(item.product.backendId),
    variantId: item.selectedVariantId ? Number(item.selectedVariantId) : null,
    quantity: item.quantity,
  }));
  const hasInvalidBackendIds = normalizedItems.some(
    (item) =>
      !Number.isInteger(item.productId) ||
      item.productId < 1 ||
      (item.variantId !== null &&
        (!Number.isInteger(item.variantId) || item.variantId < 1))
  );

  if (hasInvalidBackendIds) {
    throw new Error(
      "Your cart contains outdated product data. Please remove the item and add it again from the shop."
    );
  }

  const response = await fetch(`${apiBaseUrl()}/orders/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({
      firstName: form.firstName,
      lastName: form.lastName,
      contact: form.email,
      phone: form.phone,
      address: form.address,
      apartment: form.apartment,
      city: form.city,
      postalCode: form.postalCode,
      country: form.country,
      deliveryArea: form.deliveryArea,
      fulfillment: form.fulfillment,
      items: normalizedItems,
    }),
  });

  const data = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Order could not be placed. Please try again."
    );
  }

  return data as {
    order: {
      orderNumber: string;
      status: string;
      paymentStatus: string;
      total: string;
      currency: string;
    };
    payment: {
      authorizationUrl: string;
      reference: string;
    };
  };
}

export async function verifyPaystackPayment(reference: string) {
  const response = await fetch(
    `${apiBaseUrl()}/payments/paystack/verify/?reference=${encodeURIComponent(reference)}`,
    {
      credentials: "include",
      cache: "no-store",
    }
  );
  const data = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Payment could not be verified. Please try again."
    );
  }

  return data as {
    order: {
      orderNumber: string;
      status: string;
      paymentStatus: string;
      total: string;
      currency: string;
    };
  };
}
