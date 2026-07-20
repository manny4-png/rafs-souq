import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-5"
      style={{ background: "linear-gradient(135deg, #1a1510 0%, #2d2218 100%)" }}
    >
      <span className="font-playfair text-[8rem] font-bold text-gold/10 leading-none select-none">
        404
      </span>
      <h1 className="font-playfair text-3xl text-white -mt-8 mb-4">Page Not Found</h1>
      <p className="font-cormorant text-white/50 text-xl italic mb-8 max-w-md">
        The page you&apos;re looking for seems to have drifted away like silk in the breeze.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="bg-gold text-white text-[0.78rem] tracking-luxury uppercase px-8 py-3.5 hover:bg-gold-light transition-colors font-inter font-medium"
        >
          Go Home
        </Link>
        <Link
          href="/shop"
          className="border border-white/20 text-white text-[0.78rem] tracking-luxury uppercase px-8 py-3.5 hover:border-gold hover:text-gold transition-colors font-inter"
        >
          Shop Collection
        </Link>
      </div>
    </div>
  );
}
