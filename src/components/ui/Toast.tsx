"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

// Simple global toast system
type ToastEvent = { message: string; type?: "success" | "info" };

class ToastEmitter extends EventTarget {
  show(message: string, type: ToastEvent["type"] = "success") {
    this.dispatchEvent(
      new CustomEvent("toast", { detail: { message, type } })
    );
  }
}

export const toast = new ToastEmitter();

export function Toast() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "info">("success");
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const event = e as CustomEvent<ToastEvent>;
      setMessage(event.detail.message);
      setType(event.detail.type ?? "success");
      setVisible(true);
      if (timer) clearTimeout(timer);
      const t = setTimeout(() => setVisible(false), 3000);
      setTimer(t);
    };

    toast.addEventListener("toast", handler);
    return () => {
      toast.removeEventListener("toast", handler);
      if (timer) clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 bg-charcoal text-white px-5 py-3 shadow-xl min-w-[240px] max-w-[90vw]"
          >
            <span className="w-5 h-5 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
              <Check size={11} strokeWidth={3} />
            </span>
            <span className="text-[0.82rem] font-inter tracking-wide">
              {message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
