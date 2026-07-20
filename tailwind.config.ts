import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F8F4EE",
        sand: "#D8C3A5",
        gold: {
          DEFAULT: "#C9A227",
          light: "#E4C35A",
          dark: "#8B6914",
        },
        charcoal: "#1A1A1A",
        "soft-white": "#FFFFFF",
        "text-muted": "#6B6055",
      },
      fontFamily: {
        sans: ["var(--font-raleway)", "sans-serif"],
        playfair: ["var(--font-raleway)", "sans-serif"],
        inter: ["var(--font-raleway)", "sans-serif"],
        cormorant: ["var(--font-raleway)", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.7s ease forwards",
        "fade-in": "fadeIn 0.5s ease forwards",
        marquee: "marquee 22s linear infinite",
        "spin-slow": "spin 20s linear infinite",
        float: "float 6s ease-in-out infinite",
        "scroll-line": "scrollLine 1.8s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        scrollLine: {
          "0%, 100%": { opacity: "0.3", transform: "scaleY(0.3) translateY(-20px)" },
          "50%": { opacity: "1", transform: "scaleY(1) translateY(0)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
    },
  },
  plugins: [],
};

export default config;
