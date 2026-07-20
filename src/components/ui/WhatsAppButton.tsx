export function WhatsAppButton() {
  const message = encodeURIComponent(
    "Hello Raf's Souq, I'd like some help with your products."
  );

  return (
    <a
      href={`https://wa.me/233558821133?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Raf's Souq on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(24,79,48,0.3)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#1fbd5a] hover:shadow-[0_14px_35px_rgba(24,79,48,0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366] md:bottom-7 md:right-7"
    >
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-sm bg-charcoal px-3 py-2 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-white opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100 md:block">
        Chat with us
      </span>
      <svg
        viewBox="0 0 32 32"
        width="27"
        height="27"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M16.04 3C8.86 3 3.02 8.78 3.02 15.88c0 2.27.6 4.49 1.73 6.44L2.9 29l6.92-1.8a13.1 13.1 0 0 0 6.21 1.57h.01c7.17 0 13.02-5.78 13.02-12.88C29.06 8.78 23.22 3 16.04 3Zm0 23.6h-.01a10.9 10.9 0 0 1-5.55-1.5l-.4-.23-4.1 1.07 1.1-3.95-.26-.4a10.6 10.6 0 0 1-1.67-5.71c0-5.91 4.89-10.72 10.9-10.72 6 0 10.88 4.81 10.88 10.72 0 5.91-4.89 10.72-10.89 10.72Zm5.97-8.03c-.33-.16-1.94-.95-2.24-1.06-.3-.11-.52-.16-.74.16-.22.32-.85 1.06-1.04 1.27-.19.22-.38.24-.71.08-.33-.16-1.38-.5-2.63-1.59a9.8 9.8 0 0 1-1.82-2.23c-.19-.32-.02-.5.14-.66.15-.15.33-.38.49-.57.16-.19.22-.32.33-.54.11-.22.05-.41-.03-.57-.08-.16-.74-1.76-1.01-2.41-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.87.41-.3.32-1.14 1.11-1.14 2.71s1.17 3.14 1.33 3.36c.16.22 2.3 3.47 5.57 4.86.78.33 1.39.53 1.86.68.78.25 1.49.21 2.05.13.63-.09 1.94-.78 2.21-1.54.27-.76.27-1.41.19-1.54-.08-.14-.3-.22-.63-.38Z" />
      </svg>
    </a>
  );
}
