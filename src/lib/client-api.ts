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
  city: string;
  country: string;
  deliveryArea: string;
  fulfillment: "delivery" | "pickup";
  deliveryFee: number;
};

async function getCsrfToken() {
  const response = await fetch(`${apiBaseUrl()}/csrf/`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Could not prepare checkout. Please try again.");
  }

  const data = (await response.json()) as { csrfToken: string };
  return data.csrfToken;
}

export async function createOrder(form: CheckoutForm, items: CartItem[]) {
  const csrfToken = await getCsrfToken();
  const missingBackendProducts = items.some((item) => !item.product.backendId);

  if (missingBackendProducts) {
    throw new Error("Checkout needs live backend products. Please refresh the shop.");
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
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      country: form.country,
      deliveryArea: form.deliveryArea,
      fulfillment: form.fulfillment,
      items: items.map((item) => ({
        productId: item.product.backendId,
        quantity: item.quantity,
      })),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Order could not be placed. Please try again.");
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
