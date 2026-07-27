import type { Metadata } from "next";
import { Suspense } from "react";

import { PaymentCallbackClient } from "./PaymentCallbackClient";

export const metadata: Metadata = {
  title: "Payment confirmation",
  description: "Confirming your Raf's Souq payment.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-cream" />}>
      <PaymentCallbackClient />
    </Suspense>
  );
}
