"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { toast } from "@/components/ui/Toast";

export function ContactClient() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.show("Please fill in all required fields", "info");
      return;
    }
    setSent(true);
    toast.show("Message sent! We'll get back to you soon.");
  };

  return (
    <>
      <div
        className="relative overflow-hidden pt-36 pb-16 px-5 text-center border-b border-[#a6514b]/10"
        style={{
          background:
            "radial-gradient(circle at 82% 12%, rgba(166,81,75,0.18), transparent 30%), radial-gradient(circle at 12% 110%, rgba(201,162,39,0.15), transparent 32%), linear-gradient(135deg, #f3eee6 0%, #f7e5df 52%, #f3eee6 100%)",
        }}
      >
      
        <h1
          className="font-playfair text-charcoal mb-3 font-normal"
          style={{ fontSize: "clamp(2.8rem,5vw,4.8rem)", letterSpacing: "-0.035em" }}
        >
          Contact Us
        </h1>
        <p className="font-cormorant text-[#a6514b] text-xl italic">We&apos;d love to hear from you</p>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Info */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
          <h2 className="font-playfair text-3xl text-charcoal mb-6">We&apos;re Here to Help</h2>
          <p className="text-muted font-inter leading-relaxed mb-10 text-[0.93rem]">
            Whether you have a question about sizing, need styling advice, or want to discuss a wholesale enquiry, our team is ready to assist with the care and attention every Raf&apos;s Souq customer deserves.
          </p>

          <div className="space-y-6">
            {[
              { Icon: Mail, label: "Email", value: "rafssouqgh@gmail.com" },
              { Icon: Phone, label: "Phone", value: "+233558821133" },
              { Icon: MapPin, label: "Address", value: "Accra, Ghana" },
              
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-gold" />
                </div>
                <div>
                  <p className="text-[0.72rem] tracking-[0.16em] uppercase font-inter font-medium text-charcoal mb-0.5">{label}</p>
                  <p className="text-muted text-[0.9rem] font-inter">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
          {sent ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center">
                <span className="text-gold text-2xl">✓</span>
              </div>
              <h3 className="font-playfair text-2xl text-charcoal">Message Sent</h3>
              <p className="text-muted font-inter text-[0.93rem] max-w-xs">
                Thank you for reaching out. We&apos;ll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-[0.72rem] tracking-[0.14em] uppercase font-inter font-medium text-charcoal mb-2">
                    Name <span className="text-gold">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-charcoal/15 bg-white px-4 py-3 text-[0.88rem] font-inter outline-none focus:border-gold transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-[0.72rem] tracking-[0.14em] uppercase font-inter font-medium text-charcoal mb-2">
                    Email <span className="text-gold">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-charcoal/15 bg-white px-4 py-3 text-[0.88rem] font-inter outline-none focus:border-gold transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-[0.72rem] tracking-[0.14em] uppercase font-inter font-medium text-charcoal mb-2">
                    Phone <span className="normal-case tracking-normal text-muted/60">(optional)</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-charcoal/15 bg-white px-4 py-3 text-[0.88rem] font-inter outline-none focus:border-gold transition-colors"
                    placeholder="+233 55 882 1133"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-[0.72rem] tracking-[0.14em] uppercase font-inter font-medium text-charcoal mb-2">
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full border border-charcoal/15 bg-white px-4 py-3 text-[0.88rem] font-inter outline-none focus:border-gold transition-colors"
                    placeholder="How can we help?"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-[0.72rem] tracking-[0.14em] uppercase font-inter font-medium text-charcoal mb-2">
                  Message <span className="text-gold">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full border border-charcoal/15 bg-white px-4 py-3 text-[0.88rem] font-inter outline-none focus:border-gold transition-colors resize-none"
                  placeholder="Tell us more..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-charcoal text-white py-4 text-[0.78rem] tracking-luxury uppercase font-inter font-medium hover:bg-gold transition-all duration-300"
              >
                Send Message
              </button>
            </form>
          )}
        </motion.div>
      </div>

      <Footer />
    </>
  );
}
