"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const portraits = [
  { src: "/hero/turban-pink.jpeg", alt: "Pink embellished turban", label: "Rose shimmer" },
  { src: "/hero/turban-multicolour.jpeg", alt: "Multicolour woven turban", label: "Souq mosaic" },
  { src: "/hero/turban-red.jpeg", alt: "Red metallic turban", label: "Ember red" },
];

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = section.current;
      if (!root) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-portrait]", root);
      const products = gsap.utils.toArray<HTMLElement>("[data-product]", root);
      const counter = root.querySelector<HTMLElement>("[data-counter]");
      const progress = root.querySelector<HTMLElement>("[data-progress]");
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(cards, { transformPerspective: 1200, transformOrigin: "50% 50%" });
        gsap.set(cards[0], { autoAlpha: 1, xPercent: 0, yPercent: 0, z: 90, rotateY: 0, rotateZ: -1, scale: 1, filter: "blur(0px)" });
        gsap.set(cards[1], { autoAlpha: 0.42, xPercent: 10, yPercent: 2, z: -100, rotateY: -12, rotateZ: 4, scale: 0.91, filter: "blur(1px)" });
        gsap.set(cards[2], { autoAlpha: 0.22, xPercent: 17, yPercent: 5, z: -210, rotateY: -18, rotateZ: 7, scale: 0.84, filter: "blur(2px)" });
        gsap.set(products, { autoAlpha: 0, scale: 0.62, z: -280, yPercent: 30, filter: "blur(5px)" });

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.85,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (progress) progress.style.transform = `scaleX(${self.progress})`;
              if (counter) counter.textContent = self.progress < 0.3 ? "01" : self.progress < 0.62 ? "02" : "03";
            },
          },
        });

        tl.to(cards[0], { autoAlpha: 0.18, xPercent: -18, yPercent: 3, z: -230, rotateY: 18, rotateZ: -7, scale: 0.84, filter: "blur(3px)", duration: 1 }, 0.55)
          .to(cards[1], { autoAlpha: 1, xPercent: 0, yPercent: 0, z: 100, rotateY: 0, rotateZ: 1.2, scale: 1, filter: "blur(0px)", duration: 1 }, 0.55)
          .to(cards[1], { autoAlpha: 0.18, xPercent: -17, yPercent: 3, z: -220, rotateY: 18, rotateZ: -6, scale: 0.84, filter: "blur(3px)", duration: 1 }, 1.65)
          .to(cards[2], { autoAlpha: 1, xPercent: 0, yPercent: 0, z: 110, rotateY: 0, rotateZ: -1, scale: 1, filter: "blur(0px)", duration: 1 }, 1.65)
          .to(cards, { xPercent: -12, scale: 0.82, autoAlpha: 0.28, filter: "blur(2px)", duration: 0.85 }, 2.65)
          .to(products[0], { autoAlpha: 1, scale: 1, z: 150, yPercent: 0, rotateZ: -5, filter: "blur(0px)", duration: 1 }, 2.62)
          .to(products[1], { autoAlpha: 1, scale: 0.93, z: 80, yPercent: -7, rotateZ: 6, filter: "blur(0px)", duration: 1 }, 2.77);

        mm.add("(hover: hover) and (pointer: fine)", () => {
          const xTo = gsap.quickTo(scene.current, "x", { duration: 0.8, ease: "power3.out" });
          const yTo = gsap.quickTo(scene.current, "y", { duration: 0.8, ease: "power3.out" });
          const move = (event: PointerEvent) => {
            xTo((event.clientX / window.innerWidth - 0.5) * 16);
            yTo((event.clientY / window.innerHeight - 0.5) * 12);
          };
          window.addEventListener("pointermove", move, { passive: true });
          return () => window.removeEventListener("pointermove", move);
        });
      });

      return () => mm.revert();
    },
    { scope: section }
  );

  return (
    <section ref={section} className={styles.scrollSection} aria-label="Raf's Souq signature collection">
      <div className={styles.stickyHero}>
        <div className={styles.noise} aria-hidden="true" />
        <div className={styles.glow} aria-hidden="true" />

        <div className={styles.copy}>
          <p className={styles.eyebrow}><span /> Luxury Turbans & more</p>
          <h1>Wear the<br />moment <em>boldly.</em></h1>
          <p className={styles.lede}></p>
          <div className={styles.actions}>
            <Link href="/shop" className={styles.primary}>Shop now <ArrowRight size={15} /></Link>
            
          </div>
          <div className={styles.scrollCue} aria-hidden="true"></div>
        </div>

        <div ref={scene} className={styles.scene} aria-live="polite">
          <div className={styles.portraitStack}>
            {portraits.map((portrait, index) => (
              <figure className={styles.portrait} data-portrait key={portrait.src}>
                <Image src={portrait.src} alt={portrait.alt} fill priority={index === 0} sizes="(max-width: 767px) 82vw, 46vw" />
                <figcaption><span>0{index + 1}</span>{portrait.label}</figcaption>
              </figure>
            ))}
          </div>

          <figure className={`${styles.product} ${styles.goldCard}`} data-product>
            <Image src="/hero/scarf-gold.jpeg" alt="Gold floral silk scarf" fill sizes="(max-width: 767px) 48vw, 24vw" />
            <figcaption><span>Silk stories</span>Gold bloom</figcaption>
          </figure>
          <figure className={`${styles.product} ${styles.tealCard}`} data-product>
            <Image src="/hero/scarf-teal.jpeg" alt="Teal floral silk scarf" fill sizes="(max-width: 767px) 48vw, 24vw" />
            <figcaption><span>New arrival</span>Teal garden</figcaption>
          </figure>
        </div>

        <div className={styles.mobileActions}>
          <Link href="/shop" className={styles.primary}>Shop now <ArrowRight size={15} /></Link>
        </div>

      
      </div>
    </section>
  );
}
