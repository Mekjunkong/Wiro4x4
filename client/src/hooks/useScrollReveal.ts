import { useEffect, useRef } from "react";

interface ScrollRevealOptions {
  y?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  once?: boolean;
}

export function useScrollReveal<T extends HTMLElement>(
  options: ScrollRevealOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    y = 40,
    duration = 0.6,
    delay = 0,
    stagger = 0,
    once = true,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return undefined;

    const targets: Element[] = stagger > 0 ? Array.from(el.children) : [el];

    // Set initial hidden state
    targets.forEach(child => {
      const htmlEl = child as HTMLElement;
      htmlEl.style.opacity = "0";
      htmlEl.style.transform = `translateY(${y}px)`;
      htmlEl.style.transition = "none";
    });

    const reveal = () => {
      targets.forEach((child, i) => {
        const htmlEl = child as HTMLElement;
        const itemDelay = delay + i * stagger;
        htmlEl.style.transition = `opacity ${duration}s cubic-bezier(0.33, 1, 0.68, 1) ${itemDelay}s, transform ${duration}s cubic-bezier(0.33, 1, 0.68, 1) ${itemDelay}s`;
        htmlEl.style.opacity = "1";
        htmlEl.style.transform = "translateY(0)";
      });
    };

    const hide = () => {
      targets.forEach(child => {
        const htmlEl = child as HTMLElement;
        htmlEl.style.transition = "none";
        htmlEl.style.opacity = "0";
        htmlEl.style.transform = `translateY(${y}px)`;
      });
    };

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            reveal();
            if (once) observer.disconnect();
          } else if (!once) {
            hide();
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -15% 0px" }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [y, duration, delay, stagger, once]);

  return ref;
}
