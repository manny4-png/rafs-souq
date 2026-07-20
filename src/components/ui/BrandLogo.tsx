import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  tone?: "dark" | "light";
  size?: "nav" | "footer" | "checkout";
  className?: string;
};

const sizeClasses = {
  nav: "h-12 w-[62px]",
  footer: "h-24 w-[124px]",
  checkout: "h-20 w-[104px]",
};

export function BrandLogo({
  tone = "dark",
  size = "nav",
  className,
}: BrandLogoProps) {
  return (
    <Image
      src="/brand/rafs-souq-logo-cropped.png"
      alt="Raf's Souq"
      width={579}
      height={448}
      priority={size === "nav"}
      className={cn(
        "object-contain transition-all duration-300",
        sizeClasses[size],
        tone === "light" ? "brightness-0 invert opacity-90" : "opacity-95",
        className
      )}
    />
  );
}
