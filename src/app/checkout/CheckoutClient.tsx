"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Building2, ChevronRight, Check, CreditCard, LockKeyhole, MapPin, Smartphone, Store, Truck } from "lucide-react";
import { cartItemKey, useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { createOrder } from "@/lib/client-api";

const STEPS = ["Bag", "Delivery", "Payment"];

const DELIVERY_FIELDS = [
  { id: "firstName", label: "First Name", type: "text", autoComplete: "given-name", placeholder: "Ama", colSpan: false },
  { id: "lastName", label: "Last Name", type: "text", autoComplete: "family-name", placeholder: "Mensah", colSpan: false },
  { id: "address", label: "Address", type: "text", autoComplete: "street-address", placeholder: "123 Independence Avenue", colSpan: true },
  { id: "apartment", label: "Apartment, suite, etc. (optional)", type: "text", autoComplete: "address-line2", placeholder: "Apartment, suite, etc.", colSpan: true },
  { id: "city", label: "City", type: "text", autoComplete: "address-level2", placeholder: "Accra", colSpan: false },
  { id: "postalCode", label: "Postal code (optional)", type: "text", autoComplete: "postal-code", placeholder: "GA-123-4567", colSpan: false },
  { id: "phone", label: "Phone", type: "tel", autoComplete: "tel", placeholder: "+233 24 000 0000", colSpan: true },
] as const;

type DeliveryFieldId = (typeof DELIVERY_FIELDS)[number]["id"];

type FormState = Record<DeliveryFieldId, string> & {
  email: string;
  country: string;
  deliveryArea: string;
};

const DELIVERY_METHODS = [
  { id: "ashanti-region", name: "Ashanti Region (pay rider on delivery)", timing: "2 to 3 business days", detail: "GH₵50 doorstep delivery, paid to rider", fee: 0 },
  { id: "tema-ashaiman-kasoa", name: "Kasoa / Tema / Ashaiman (pay rider on delivery)", timing: "1 to 2 business days", detail: "GH₵40 doorstep delivery, paid to rider", fee: 0 },
  { id: "other-regions", name: "Other regions (pay rider on delivery)", timing: "1 to 3 business days", detail: "GH₵50 doorstep delivery, paid to rider", fee: 0 },
  { id: "within-accra", name: "Within Accra (pay rider on delivery)", timing: "2 to 3 business days", detail: "GH₵35 doorstep delivery, paid to rider", fee: 0 },
] as const;

const DELIVERY_FEES = new Map<string, number>(
  DELIVERY_METHODS.map((method) => [method.id, method.fee] as const)
);

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  apartment: "",
  city: "",
  postalCode: "",
  country: "GH",
  deliveryArea: "",
};

function PaymentMethodsPanel() {
  return (
    <div className="mt-8" aria-labelledby="payment-methods-heading">
      <h2 id="payment-methods-heading" className="font-playfair text-lg text-charcoal">
        Payment
      </h2>
      <p className="mt-1 text-sm text-muted font-inter">
        All transactions are secure and encrypted.
      </p>

      <div className="mt-4 overflow-hidden rounded-xl border border-[#a6514b]/45 bg-white">
        <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-inter text-sm font-semibold text-charcoal">Paystack</p>
            <p className="mt-1 flex items-center gap-1.5 text-[0.7rem] text-muted font-inter">
              <LockKeyhole size={12} aria-hidden="true" />
              Secure checkout
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2" aria-label="Accepted payment providers">
            <span className="relative flex h-9 w-14 items-center justify-center rounded-md bg-[#161616]" title="Mastercard">
              <span className="h-5 w-5 rounded-full bg-[#eb001b]" />
              <span className="-ml-2 h-5 w-5 rounded-full bg-[#f79e1b]/95" />
              <span className="sr-only">Mastercard</span>
            </span>
            <span className="flex h-9 w-14 items-center justify-center rounded-md bg-[#1739b7] text-[0.85rem] font-black italic text-white" title="Visa">
              VISA
            </span>
            <span className="flex h-9 min-w-14 items-center justify-center rounded-md border border-charcoal/10 bg-[#ffcc00] px-2 text-center text-[0.58rem] font-extrabold leading-tight text-[#111]" title="MTN Mobile Money">
              MTN<br />MoMo
            </span>
            <span className="flex h-9 items-center justify-center rounded-md border border-charcoal/10 bg-white px-2.5 text-[0.7rem] font-semibold text-charcoal" title="AirtelTigo and Telecel">
              +2
            </span>
          </div>
        </div>

        <div className="border-t border-charcoal/10 bg-cream/55 px-4 py-4">
          <p className="text-center text-sm text-charcoal font-inter">
            You&apos;ll be redirected to Paystack to choose and complete your payment.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.72rem] text-muted font-inter">
            <span className="flex items-center gap-1.5"><Smartphone size={14} className="text-[#a6514b]" />Mobile Money</span>
            <span className="flex items-center gap-1.5"><CreditCard size={14} className="text-[#a6514b]" />Card</span>
            <span className="flex items-center gap-1.5"><Building2 size={14} className="text-[#a6514b]" />Bank Transfer</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckoutClient() {
  const [step, setStep] = useState(1);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [saveInformation, setSaveInformation] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const { items, totalPrice } = useCartStore();
  const total = typeof totalPrice === "function" ? totalPrice() : 0;
  const deliveryFee = fulfillment === "pickup" ? 0 : (DELIVERY_FEES.get(form.deliveryArea) ?? 0);
  const selectedDeliveryMethod = DELIVERY_METHODS.find((method) => method.id === form.deliveryArea);
  const orderTotal = total + deliveryFee;

  const requiredDelivery = useMemo(
    () => ["firstName", "lastName", "email", "phone", ...(fulfillment === "delivery" ? ["address", "city"] : [])] as (keyof FormState)[],
    [fulfillment]
  );

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("rafs-souq-checkout-details");
      if (saved) {
        const details = JSON.parse(saved) as Partial<FormState>;
        setForm((current) => ({ ...current, ...details, country: "GH", deliveryArea: "" }));
        setSaveInformation(true);
      }
    } catch {
      window.localStorage.removeItem("rafs-souq-checkout-details");
    }
  }, []);

  const setField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateDelivery = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    requiredDelivery.forEach((field) => {
      if (!form[field].trim()) nextErrors[field] = "Required";
    });
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address";
    }
    if (form.postalCode && !/^[A-Za-z0-9][A-Za-z0-9 -]{1,10}[A-Za-z0-9]$/.test(form.postalCode)) {
      nextErrors.postalCode = "Enter a valid postal code for Ghana";
    }
    if (fulfillment === "delivery" && !form.deliveryArea) {
      nextErrors.deliveryArea = "Choose a delivery area";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2 && !validateDelivery()) {
      toast.show("Please complete your delivery details", "info");
      return;
    }
    if (step === 2) {
      if (saveInformation) {
        window.localStorage.setItem("rafs-souq-checkout-details", JSON.stringify({ ...form, deliveryArea: "" }));
      } else {
        window.localStorage.removeItem("rafs-souq-checkout-details");
      }
      try {
        setIsPlacingOrder(true);
        const result = await createOrder({ ...form, fulfillment, deliveryFee }, items);
        window.location.assign(result.payment.authorizationUrl);
      } catch (error) {
        toast.show(
          error instanceof Error ? error.message : "Order could not be placed.",
          "info"
        );
      } finally {
        setIsPlacingOrder(false);
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-24 px-5 text-center">
        <p className="font-cormorant text-2xl italic text-muted">Your cart is empty</p>
        <Link href="/shop" className="bg-charcoal text-white text-xs tracking-luxury uppercase px-8 py-3 hover:bg-gold transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16 px-5">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center mb-8" aria-label="Raf's Souq - Home">
            <BrandLogo tone="dark" size="checkout" />
          </Link>
          <ol className="flex items-center justify-center gap-0" aria-label="Checkout progress">
            {STEPS.map((stepLabel, i) => (
              <li key={stepLabel} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-inter font-medium transition-all ${i + 1 <= step ? "bg-gold text-white" : "bg-sand text-muted"}`}>
                    {i + 1 < step ? <Check size={14} aria-hidden="true" /> : i + 1}
                  </div>
                  <span className={`text-[0.65rem] tracking-wide uppercase mt-1 font-inter ${i + 1 === step ? "text-charcoal" : "text-muted"}`}>{stepLabel}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-12 sm:w-16 h-px mx-1 mb-4 transition-all ${i + 1 < step ? "bg-gold" : "bg-sand"}`} aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
          <section className="bg-white p-6 sm:p-8" aria-labelledby="checkout-step-heading">
            {step === 1 && (
              <div>
                <h1 id="checkout-step-heading" className="font-playfair text-xl text-charcoal mb-6">Your Bag</h1>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={cartItemKey(item)} className="flex gap-4 pb-4 border-b border-charcoal/6">
                      <div className="w-16 h-20 bg-sand overflow-hidden flex-shrink-0">
                        {item.product.images[0] && (
                          <Image src={item.product.images[0]} alt={item.product.name} width={64} height={80} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-playfair text-sm text-charcoal">{item.product.name}</p>
                        {(item.selectedColor || item.selectedSize) && (
                          <p className="text-xs text-muted font-inter mt-0.5">
                            {[item.selectedColor?.name, item.selectedSize].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        <p className="text-xs text-muted font-inter mt-0.5">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium text-charcoal mt-1">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 id="checkout-step-heading" className="font-playfair text-xl text-charcoal mb-6">How would you like your order?</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
                  <button
                    type="button"
                    onClick={() => setFulfillment("delivery")}
                    className={`flex items-center gap-3 border p-4 text-left transition-colors ${fulfillment === "delivery" ? "border-[#a6514b] bg-[#f7e5df]" : "border-charcoal/15 hover:border-charcoal/40"}`}
                  >
                    <Truck size={20} className={fulfillment === "delivery" ? "text-[#a6514b]" : "text-muted"} />
                    <span><strong className="block text-sm font-inter text-charcoal">Delivery</strong><small className="text-muted font-inter">Delivered to your address</small></span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFulfillment("pickup")}
                    className={`flex items-center gap-3 border p-4 text-left transition-colors ${fulfillment === "pickup" ? "border-[#a6514b] bg-[#f7e5df]" : "border-charcoal/15 hover:border-charcoal/40"}`}
                  >
                    <Store size={20} className={fulfillment === "pickup" ? "text-[#a6514b]" : "text-muted"} />
                    <span><strong className="block text-sm font-inter text-charcoal">Pick up from store</strong><small className="text-muted font-inter">Free · we&apos;ll confirm when ready</small></span>
                  </button>
                </div>

                <h2 className="font-playfair text-lg text-charcoal mb-4">Contact</h2>
                <div>
                  <label htmlFor="email" className="block text-[0.7rem] tracking-[0.14em] uppercase font-inter font-medium text-charcoal mb-1.5">Email</label>
                  <input
                    id="email"
                    type="text"
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) => setField("email", event.target.value)}
                    placeholder="you@example.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className="w-full rounded-lg border border-charcoal/15 px-4 py-3 text-[0.88rem] font-inter outline-none focus:border-gold transition-colors"
                  />
                  {errors.email && <p id="email-error" className="mt-1 text-xs text-red-600 font-inter">{errors.email}</p>}
                </div>

                <h2 className="font-playfair text-lg text-charcoal mt-8 mb-4">Delivery</h2>
                {fulfillment === "delivery" && (
                  <div className="mb-4">
                    <label htmlFor="country" className="block text-[0.7rem] tracking-[0.14em] uppercase font-inter font-medium text-charcoal mb-1.5">Country / Region</label>
                    <select id="country" value={form.country} onChange={(event) => setField("country", event.target.value)} className="w-full rounded-lg border border-charcoal/15 bg-white px-4 py-3 text-[0.88rem] font-inter outline-none focus:border-gold">
                      <option value="GH">Ghana</option>
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {DELIVERY_FIELDS.filter(({ id }) => fulfillment === "delivery" || ["firstName", "lastName", "phone"].includes(id)).map(({ id, label, placeholder, colSpan, type, autoComplete }) => (
                    <div key={id} className={colSpan ? "sm:col-span-2" : ""}>
                      <label htmlFor={id} className="block text-[0.7rem] tracking-[0.14em] uppercase font-inter font-medium text-charcoal mb-1.5">{label}</label>
                      <input
                        id={id}
                        type={type}
                        autoComplete={autoComplete}
                        value={form[id]}
                        onChange={(event) => setField(id, event.target.value)}
                        placeholder={placeholder}
                        aria-invalid={Boolean(errors[id])}
                        aria-describedby={errors[id] ? `${id}-error` : undefined}
                        className="w-full rounded-lg border border-charcoal/15 px-4 py-3 text-[0.88rem] font-inter outline-none focus:border-gold transition-colors"
                      />
                      {errors[id] && <p id={`${id}-error`} className="mt-1 text-xs text-red-600 font-inter">{errors[id]}</p>}
                    </div>
                  ))}
                </div>

                <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-charcoal font-inter">
                  <input type="checkbox" checked={saveInformation} onChange={(event) => setSaveInformation(event.target.checked)} className="h-4 w-4 accent-[#a6514b]" />
                  Save this information for next time
                </label>

                {fulfillment === "delivery" ? (
                  <div className="mt-8">
                    <h2 className="font-playfair text-lg text-charcoal mb-4">Shipping method</h2>
                    <div className="overflow-hidden rounded-xl border border-charcoal/15">
                      {DELIVERY_METHODS.map((method) => {
                        const selected = form.deliveryArea === method.id;
                        return (
                          <label key={method.id} className={`flex cursor-pointer gap-3 border-b border-charcoal/10 p-4 last:border-b-0 ${selected ? "bg-[#fdf3ef] ring-1 ring-inset ring-[#a6514b]" : "bg-white hover:bg-cream/60"}`}>
                            <input type="radio" name="deliveryArea" value={method.id} checked={selected} onChange={() => setField("deliveryArea", method.id)} className="mt-1 h-4 w-4 flex-shrink-0 accent-[#a6514b]" />
                            <span className="min-w-0 flex-1 font-inter">
                              <span className="flex items-start justify-between gap-3">
                                <strong className="text-sm text-charcoal">{method.name}</strong>
                                <strong className="whitespace-nowrap text-sm text-charcoal">Free</strong>
                              </span>
                              <span className="mt-1 block text-xs text-muted">{method.timing}</span>
                              <span className="mt-0.5 block text-xs text-muted">{method.detail}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.deliveryArea && <p className="mt-1 text-xs text-red-600 font-inter">{errors.deliveryArea}</p>}
                    <div className="mt-4 flex gap-3 bg-cream border border-gold/20 p-4">
                      <MapPin size={17} className="mt-0.5 flex-shrink-0 text-gold" />
                      <p className="text-xs leading-relaxed text-muted font-inter">The rider fee is paid separately when your order arrives. Please contact us on WhatsApp if you need help choosing your region.</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 flex gap-3 bg-cream border border-[#a6514b]/20 p-4">
                    <Store size={18} className="mt-0.5 flex-shrink-0 text-[#a6514b]" />
                    <div><p className="text-sm font-medium text-charcoal font-inter">Store pickup is free</p><p className="mt-1 text-xs leading-relaxed text-muted font-inter">We&apos;ll contact you by phone or email with the pickup location and collection time when your order is ready.</p></div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && <PaymentMethodsPanel />}

            <button
              type="button"
              onClick={handleNext}
              disabled={isPlacingOrder}
              className={`${step === 2 ? "mt-4" : "mt-8"} w-full bg-charcoal text-white py-4 text-[0.78rem] tracking-luxury uppercase font-inter font-medium hover:bg-gold transition-all duration-300 flex items-center justify-center gap-2`}
            >
              {isPlacingOrder
                ? "Opening Paystack..."
                : step === 2
                  ? `Continue to Paystack · ${formatPrice(orderTotal)}`
                  : "Continue"}
              <ChevronRight size={15} aria-hidden="true" />
            </button>
          </section>

          <aside className="bg-white p-6 h-fit" aria-labelledby="order-summary-heading">
            <h2 id="order-summary-heading" className="font-playfair text-lg text-charcoal mb-5">Order Summary</h2>
            <div className="space-y-3 mb-5">
              {items.map((item) => (
                <div key={cartItemKey(item)} className="flex justify-between gap-3 text-[0.85rem] font-inter">
                  <span className="text-muted">{item.product.name}{(item.selectedColor || item.selectedSize) && <small className="block">{[item.selectedColor?.name, item.selectedSize].filter(Boolean).join(" · ")}</small>} <span className="text-charcoal/50">x{item.quantity}</span></span>
                  <span className="text-charcoal font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-charcoal/8 pt-4 space-y-2">
              <div className="flex justify-between text-[0.85rem] font-inter">
                <span className="text-muted">Subtotal</span>
                <span className="text-charcoal">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-[0.85rem] font-inter">
                <span className="text-muted">Delivery</span>
                <span className="text-gold text-right">{fulfillment === "pickup" ? "Store pickup · Free" : selectedDeliveryMethod ? "Free · pay rider on delivery" : "Select shipping method"}</span>
              </div>
              <div className="border-t border-charcoal/8 pt-3 flex justify-between">
                <span className="font-playfair text-base text-charcoal">Total</span>
                <span className="font-playfair text-xl text-charcoal font-semibold">
                  {formatPrice(orderTotal)}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
