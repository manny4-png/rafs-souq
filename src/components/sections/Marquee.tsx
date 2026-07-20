import { MARQUEE_ITEMS } from "@/lib/data";

export function MarqueeSection() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div
      className="bg-charcoal py-3.5 overflow-hidden marquee-wrapper"
      aria-hidden="true"
    >
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 font-cormorant text-sand italic text-[0.95rem] tracking-wide flex-shrink-0"
          >
            <span className="w-1 h-1 rounded-full bg-gold inline-block flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
