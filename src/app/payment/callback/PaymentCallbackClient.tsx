"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, LoaderCircle, RefreshCw, TriangleAlert } from "lucide-react";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { verifyPaystackPayment } from "@/lib/client-api";
import { useCartStore } from "@/lib/store";

type PaymentState =
  | { status: "verifying" }
  | { status: "success"; orderNumber: string }
  | { status: "error"; message: string };

export function PaymentCallbackClient() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref") || "";
  const clearCart = useCartStore((state) => state.clearCart);
  const [paymentState, setPaymentState] = useState<PaymentState>({ status: "verifying" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!reference) {
        setPaymentState({ status: "error", message: "The payment reference is missing." });
        return;
      }

      setPaymentState({ status: "verifying" });
      try {
        const result = await verifyPaystackPayment(reference);
        if (!cancelled) {
          clearCart();
          setPaymentState({
            status: "success",
            orderNumber: result.order.orderNumber,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setPaymentState({
            status: "error",
            message: error instanceof Error ? error.message : "Payment could not be verified.",
          });
        }
      }
    }

    void verify();
    return () => {
      cancelled = true;
    };
  }, [attempt, clearCart, reference]);

  return (
    <main className="min-h-screen bg-cream px-5 pt-28 pb-16">
      <div className="mx-auto max-w-lg bg-white p-8 text-center shadow-sm sm:p-12">
        <Link href="/" className="mb-9 inline-flex" aria-label="Raf's Souq - Home">
          <BrandLogo tone="dark" size="checkout" />
        </Link>

        {paymentState.status === "verifying" && (
          <>
            <LoaderCircle className="mx-auto h-16 w-16 animate-spin text-gold" aria-hidden="true" />
            <h1 className="mt-6 font-playfair text-3xl text-charcoal">Confirming payment</h1>
            <p className="mt-3 font-inter text-sm text-muted">
              Please keep this page open while we confirm your payment with Paystack.
            </p>
          </>
        )}

        {paymentState.status === "success" && (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold">
              <Check className="h-9 w-9 text-white" aria-hidden="true" />
            </div>
            <h1 className="mt-6 font-playfair text-3xl text-charcoal">Payment confirmed</h1>
            <p className="mt-3 font-inter text-sm text-muted">
              Thank you. Your order <strong className="text-charcoal">{paymentState.orderNumber}</strong> is confirmed.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex bg-charcoal px-10 py-4 font-inter text-xs uppercase tracking-luxury text-white transition-colors hover:bg-gold"
            >
              Continue shopping
            </Link>
          </>
        )}

        {paymentState.status === "error" && (
          <>
            <TriangleAlert className="mx-auto h-16 w-16 text-[#a6514b]" aria-hidden="true" />
            <h1 className="mt-6 font-playfair text-3xl text-charcoal">We could not confirm payment</h1>
            <p className="mt-3 font-inter text-sm leading-relaxed text-muted">{paymentState.message}</p>
            <p className="mt-2 font-inter text-xs text-muted">
              Your cart has been kept. If you were charged, retry verification before paying again.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              {reference && (
                <button
                  type="button"
                  onClick={() => setAttempt((current) => current + 1)}
                  className="inline-flex items-center justify-center gap-2 bg-charcoal px-7 py-4 font-inter text-xs uppercase tracking-wide text-white transition-colors hover:bg-gold"
                >
                  <RefreshCw size={14} aria-hidden="true" />
                  Check again
                </button>
              )}
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center border border-charcoal/20 px-7 py-4 font-inter text-xs uppercase tracking-wide text-charcoal"
              >
                Return to checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
