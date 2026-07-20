"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, Lock, Check, MapPin, Store, Truck } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { createOrder } from "@/lib/client-api";

const STEPS = ["Bag", "Delivery", "Payment", "Confirm"];

const DELIVERY_FIELDS = [
  { id: "firstName", label: "First Name", type: "text", autoComplete: "given-name", placeholder: "Ama", colSpan: false },
  { id: "lastName", label: "Last Name", type: "text", autoComplete: "family-name", placeholder: "Mensah", colSpan: false },
  { id: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "email@example.com", colSpan: true },
  { id: "phone", label: "Phone", type: "tel", autoComplete: "tel", placeholder: "+233 24 000 0000", colSpan: true },
  { id: "address", label: "Address", type: "text", autoComplete: "street-address", placeholder: "123 Independence Avenue", colSpan: true },
  { id: "city", label: "City", type: "text", autoComplete: "address-level2", placeholder: "Accra", colSpan: false },
] as const;

type DeliveryFieldId = (typeof DELIVERY_FIELDS)[number]["id"];

type FormState = Record<DeliveryFieldId, string> & {
  country: string;
  deliveryArea: string;
};

const DELIVERY_ZONES = [
  { fee: 28, areas: ["Klagon"] },
  { fee: 35, areas: ["Ashaiman Central", "Sakumono"] },
  { fee: 38, areas: ["Spintex"] },
  { fee: 40, areas: ["Nungua", "East Legon", "Accra Mall", "Borteyman"] },
  { fee: 42, areas: ["Teshie"] },
  { fee: 45, areas: ["Ashaiman Outskirts", "East Legon Hills", "Osu", "Palace Mall", "Labadi", "Haatso", "37 Military", "School Junction", "Embassy Gardens", "Legon", "Tse Addo"] },
  { fee: 50, areas: ["Dome", "Nima", "Pig Farm", "Madina", "Adenta", "Airport Area", "Kwabenya", "Accra Tudu", "Darkuman", "UPSA", "Lakeside", "Ministries"] },
  { fee: 60, areas: ["Pantang"] },
  { fee: 80, areas: ["Kasoa"] },
] as const;

const DELIVERY_FEES = new Map<string, number>(
  DELIVERY_ZONES.flatMap((zone) => zone.areas.map((area) => [area, zone.fee] as const))
);

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "GH",
  deliveryArea: "",
};

export function CheckoutClient() {
  const [step, setStep] = useState(1);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const { items, totalPrice, clearCart } = useCartStore();
  const total = typeof totalPrice === "function" ? totalPrice() : 0;
  const deliveryFee = fulfillment === "pickup" ? 0 : (DELIVERY_FEES.get(form.deliveryArea) ?? 0);
  const orderTotal = total + deliveryFee;

  const requiredDelivery = useMemo(
    () => DELIVERY_FIELDS.map((field) => field.id).filter((field) => fulfillment === "delivery" || (field !== "address" && field !== "city")),
    [fulfillment]
  );

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
      nextErrors.email = "Enter a valid email";
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
      setStep(3);
      return;
    }
    try {
      setIsPlacingOrder(true);
      const result = await createOrder({ ...form, fulfillment, deliveryFee }, items);
      toast.show(`Order ${result.order.orderNumber} placed successfully!`);
      clearCart();
      setStep(4);
    } catch (error) {
      toast.show(
        error instanceof Error ? error.message : "Order could not be placed.",
        "info"
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0 && step < 4) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-24 px-5 text-center">
        <p className="font-cormorant text-2xl italic text-muted">Your cart is empty</p>
        <Link href="/shop" className="bg-charcoal text-white text-xs tracking-luxury uppercase px-8 py-3 hover:bg-gold transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-5 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-gold rounded-full flex items-center justify-center">
          <Check size={32} className="text-white" aria-hidden="true" />
        </motion.div>
        <h1 className="font-playfair text-3xl text-charcoal">Order Confirmed</h1>
        <p className="text-muted font-inter max-w-sm">
          Thank you for your order. You&apos;ll receive a confirmation email shortly with tracking details.
        </p>
        <Link href="/shop" className="bg-charcoal text-white text-xs tracking-luxury uppercase px-10 py-4 hover:bg-gold transition-colors">
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
                    <div key={item.product.id} className="flex gap-4 pb-4 border-b border-charcoal/6">
                      <div className="w-16 h-20 bg-sand overflow-hidden flex-shrink-0">
                        {item.product.images[0] && (
                          <Image src={item.product.images[0]} alt={item.product.name} width={64} height={80} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-playfair text-sm text-charcoal">{item.product.name}</p>
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

                <h2 className="font-playfair text-lg text-charcoal mb-4">Contact details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {DELIVERY_FIELDS.filter(({ id }) => fulfillment === "delivery" || (id !== "address" && id !== "city")).map(({ id, label, placeholder, colSpan, type, autoComplete }) => (
                    <div key={id} className={colSpan ? "sm:col-span-2" : ""}>
                      <label htmlFor={id} className="block text-[0.7rem] tracking-[0.14em] uppercase font-inter font-medium text-charcoal mb-1.5">
                        {label}
                      </label>
                      <input
                        id={id}
                        type={type}
                        autoComplete={autoComplete}
                        value={form[id]}
                        onChange={(e) => setField(id, e.target.value)}
                        placeholder={placeholder}
                        aria-invalid={Boolean(errors[id])}
                        aria-describedby={errors[id] ? `${id}-error` : undefined}
                        className="w-full border border-charcoal/15 px-4 py-3 text-[0.88rem] font-inter outline-none focus:border-gold transition-colors"
                      />
                      {errors[id] && (
                        <p id={`${id}-error`} className="mt-1 text-xs text-red-600 font-inter">
                          {errors[id]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {fulfillment === "delivery" ? (
                  <div className="mt-5">
                    <label htmlFor="deliveryArea" className="block text-[0.7rem] tracking-[0.14em] uppercase font-inter font-medium text-charcoal mb-1.5">Delivery area</label>
                    <select
                      id="deliveryArea"
                      value={form.deliveryArea}
                      onChange={(event) => setField("deliveryArea", event.target.value)}
                      aria-invalid={Boolean(errors.deliveryArea)}
                      className="w-full border border-charcoal/15 bg-white px-4 py-3 text-[0.88rem] font-inter outline-none focus:border-gold transition-colors"
                    >
                      <option value="">Select your area</option>
                      {DELIVERY_ZONES.map((zone) => (
                        <optgroup key={zone.fee} label={`${formatPrice(zone.fee)} delivery`}>
                          {zone.areas.map((area) => <option key={area} value={area}>{area}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    {errors.deliveryArea && <p className="mt-1 text-xs text-red-600 font-inter">{errors.deliveryArea}</p>}
                    <div className="mt-4 flex gap-3 bg-cream border border-gold/20 p-4">
                      <MapPin size={17} className="mt-0.5 flex-shrink-0 text-gold" />
                      <p className="text-xs leading-relaxed text-muted font-inter">Can&apos;t find your area? Contact us on WhatsApp before placing your order for a delivery quote.</p>
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

            {step === 3 && (
              <div>
                <h1 id="checkout-step-heading" className="font-playfair text-xl text-charcoal mb-6">Payment</h1>
                <div className="border border-[#a6514b]/20 bg-[#fdf9f5] p-6">
                  <div className="flex items-center justify-between gap-4 border-b border-charcoal/10 pb-5">
                    <div><p className="font-playfair text-lg text-charcoal">Pay securely with Paystack</p><p className="mt-1 text-xs text-muted font-inter">You&apos;ll complete payment in Paystack&apos;s secure checkout.</p></div>
                    <div className="rounded bg-[#0ba4db] px-3 py-2 text-xs font-bold tracking-wide text-white">paystack</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-5 text-center text-[0.68rem] font-medium text-muted font-inter">
                    <span className="border border-charcoal/10 bg-white px-2 py-3">Card</span>
                    <span className="border border-charcoal/10 bg-white px-2 py-3">Mobile Money</span>
                    <span className="border border-charcoal/10 bg-white px-2 py-3">Bank</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted text-[0.78rem] font-inter">
                    <Lock size={13} className="text-gold" aria-hidden="true" />
                    Raf&apos;s Souq never receives or stores your payment details.
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={isPlacingOrder}
              className="mt-8 w-full bg-charcoal text-white py-4 text-[0.78rem] tracking-luxury uppercase font-inter font-medium hover:bg-gold transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isPlacingOrder ? "Preparing Payment..." : step === 3 ? `Pay ${formatPrice(orderTotal)} with Paystack` : "Continue"}
              <ChevronRight size={15} aria-hidden="true" />
            </button>
          </section>

          <aside className="bg-white p-6 h-fit" aria-labelledby="order-summary-heading">
            <h2 id="order-summary-heading" className="font-playfair text-lg text-charcoal mb-5">Order Summary</h2>
            <div className="space-y-3 mb-5">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between gap-3 text-[0.85rem] font-inter">
                  <span className="text-muted">{item.product.name} <span className="text-charcoal/50">x{item.quantity}</span></span>
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
                <span className="text-gold">{fulfillment === "pickup" ? "Store pickup · Free" : form.deliveryArea ? formatPrice(deliveryFee) : "Select area"}</span>
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
