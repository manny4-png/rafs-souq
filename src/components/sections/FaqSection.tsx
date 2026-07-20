import Link from "next/link";

export const TURBAN_FAQS = [
  ["What is a turban cap?", "A turban cap is a pre-styled head covering that gives the elegant look of a turban without the need for wrapping. It is easy to wear, comfortable, and stylish."],
  ["Who can wear turban caps?", "Turban caps are suitable for women of all ages. They are commonly worn for fashion, religious purposes, hair protection, or during hair loss due to medical conditions."],
  ["Are turban caps one-size-fits-all?", "Yes. Most turban caps are made with stretchable fabric to comfortably fit different head sizes. Check the product page when a design has specific size options."],
  ["What materials are used?", "Our turban caps are made from soft, breathable fabrics such as cotton, jersey, satin-lined fabric, velvet, or silk blends, depending on the design."],
  ["Can I wear a turban cap all day?", "Absolutely. Turban caps are designed to be lightweight, breathable, and non-tight, making them suitable for all-day wear."],
  ["Are turban caps suitable for hot weather?", "Yes. We offer breathable and lightweight options ideal for warm climates, including summer-friendly fabrics."],
  ["Will a turban cap damage my hair?", "No. Our turban caps are gentle on hair and help reduce friction. Satin or silk-lined options are especially good for protecting natural hair."],
  ["How do I wash my turban cap?", "We recommend hand washing with mild detergent and air drying. Avoid bleach and machine drying to maintain the fabric quality."],
  ["Do turban caps slip off?", "No. They are designed with a secure fit and stretch fabric to stay in place without pins or clips."],
  ["Can I wear a turban cap for special occasions?", "Yes. Turban caps come in plain, patterned, and embellished styles that are perfect for casual wear, parties, weddings, and formal events."],
  ["Are turban caps suitable for hair loss or chemo patients?", "Yes. Turban caps are soft, non-irritating, and provide full head coverage, making them suitable for individuals experiencing hair loss."],
  ["Do you offer different colours and styles?", "Yes. We offer a wide variety of colours, textures, and designs to suit different outfits and occasions."],
  ["Can I return or exchange my turban cap?", "Returns or exchanges are accepted according to our store policy. Please review our Terms & Conditions for the applicable return and exchange requirements."],
  ["How long does delivery take?", "Delivery times depend on your location. Orders are usually processed within 1–3 business days, and the estimated delivery window is shown at checkout."],
  ["How do I place an order?", "Select your preferred style, colour, and size, add it to your bag, and proceed through checkout. You can also contact our social media shop if you need assistance."],
] as const;

export function FaqSection({ fullPage = false }: { fullPage?: boolean }) {
  return (
    <section className={fullPage ? "px-5 pb-20 pt-12" : "bg-cream px-5 py-20"} aria-labelledby="faq-heading">
      <div className="mx-auto max-w-[980px]">

        <h2 id="faq-heading" className="mb-4 text-center font-playfair text-3xl text-charcoal sm:text-4xl">Frequently Asked Questions</h2>
        <p className="mx-auto mb-10 max-w-xl text-center font-inter text-sm leading-relaxed text-muted">Everything you need to know about choosing, wearing, and caring for Raf&apos;s Souq turban caps.</p>
        <div className="divide-y divide-charcoal/10 border-y border-charcoal/10">
          {TURBAN_FAQS.map(([question, answer], index) => (
            <details key={question} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-4 font-inter text-sm font-medium text-charcoal marker:content-none">
                <span><span className="mr-3 text-gold">{String(index + 1).padStart(2, "0")}</span>{question}</span>
                <span className="text-xl font-light text-gold transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="pb-5 pl-9 pr-8 font-inter text-sm leading-7 text-muted">{answer}</p>
            </details>
          ))}
        </div>
        {!fullPage && <div className="mt-8 text-center"><Link href="/faq" className="border-b border-charcoal pb-1 font-inter text-xs uppercase tracking-luxury text-charcoal hover:text-gold">View all FAQs</Link></div>}
      </div>
    </section>
  );
}
