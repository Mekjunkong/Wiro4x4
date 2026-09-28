import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

interface Options {
  /** Milliseconds between automatic advances. */
  interval?: number;
  /** How long a touch, drag or arrow press pauses auto-advance. */
  idleAfterInteraction?: number;
}

const smooth = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";

/**
 * Auto-advancing horizontal scroll strip; slides are the elements marked
 * `data-slide` inside it. Positions are measured with getBoundingClientRect, so it works
 * the same in LTR and RTL. Auto-advance is off for reduced motion and pauses
 * while the strip is hovered, focused, touched, dragged or off screen.
 * Desktop mouse users can drag the strip. Nothing moves when the slides
 * already fit, and listeners re-attach when `count` changes, so a strip
 * that renders after data loads is picked up.
 */
export function useAutoScroller(
  stripRef: RefObject<HTMLElement | null>,
  count: number,
  { interval = 5000, idleAfterInteraction = 8000 }: Options = {}
) {
  const [index, setIndex] = useState(0);
  const hovered = useRef(false);
  const focused = useRef(false);
  const visible = useRef(false);
  const pausedUntil = useRef(0);

  /** False when every slide already fits (e.g. a desktop grid layout). */
  const overflows = () => {
    const strip = stripRef.current;
    return !!strip && strip.scrollWidth > strip.clientWidth + 1;
  };

  const slides = () =>
    Array.from(
      stripRef.current?.querySelectorAll<HTMLElement>("[data-slide]") ?? []
    );

  /** Slide whose centre is closest to the strip's centre. */
  const nearest = useCallback(() => {
    const strip = stripRef.current;
    if (!strip) return 0;
    const r = strip.getBoundingClientRect();
    const mid = r.left + r.width / 2;
    let best = 0,
      bestD = Infinity;
    slides().forEach((el, i) => {
      const b = el.getBoundingClientRect();
      const d = Math.abs(b.left + b.width / 2 - mid);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  }, [stripRef]);

  const goTo = useCallback(
    (i: number) => {
      const strip = stripRef.current;
      const el = slides()[((i % count) + count) % count];
      if (!strip || !el) return;
      const r = strip.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      // Physical delta, so scrollBy moves the right way in RTL too.
      strip.scrollBy({
        left: b.left + b.width / 2 - (r.left + r.width / 2),
        behavior: smooth(),
      });
    },
    [stripRef, count]
  );

  const pause = useCallback(() => {
    pausedUntil.current = Date.now() + idleAfterInteraction;
  }, [idleAfterInteraction]);

  /** For arrow buttons: move one slide and pause auto-advance. */
  const step = useCallback(
    (dir: 1 | -1) => {
      pause();
      goTo(nearest() + dir);
    },
    [goTo, nearest, pause]
  );

  // Track the current slide as the strip scrolls.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return undefined;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setIndex(nearest()));
    };
    strip.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      strip.removeEventListener("scroll", onScroll);
    };
  }, [stripRef, nearest, count]);

  // Pause triggers and visibility.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return undefined;
    const on = (el: HTMLElement, type: string, fn: (e: Event) => void) => {
      el.addEventListener(type, fn);
      return () => el.removeEventListener(type, fn);
    };
    const offs = [
      on(strip, "mouseenter", () => (hovered.current = true)),
      on(strip, "mouseleave", () => (hovered.current = false)),
      on(strip, "focusin", () => (focused.current = true)),
      on(strip, "focusout", () => (focused.current = false)),
      on(strip, "touchstart", pause),
      on(strip, "wheel", pause),
    ];
    const io = new IntersectionObserver(
      es => (visible.current = es[0]?.isIntersecting ?? false),
      { threshold: 0.5 }
    );
    io.observe(strip);
    return () => {
      offs.forEach(off => off());
      io.disconnect();
    };
  }, [stripRef, pause, count]);

  // Auto-advance, looping back to the first slide.
  useEffect(() => {
    if (count < 2) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
      return undefined;
    const id = window.setInterval(() => {
      if (
        hovered.current ||
        focused.current ||
        !visible.current ||
        document.hidden ||
        Date.now() < pausedUntil.current
      )
        return;
      if (overflows()) goTo(nearest() + 1);
    }, interval);
    return () => window.clearInterval(id);
  }, [count, interval, goTo, nearest]);

  // Mouse drag (touch already scrolls natively). Snapping is suspended
  // while dragging, then the nearest slide is centred.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return undefined;
    let startX = 0,
      startScroll = 0,
      dragging = false,
      moved = false;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0 || !overflows()) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startScroll = strip.scrollLeft;
      strip.style.scrollSnapType = "none";
      strip.style.scrollBehavior = "auto";
      strip.style.cursor = "grabbing";
      pause();
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      strip.scrollLeft = startScroll - dx;
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      strip.style.cursor = "";
      strip.style.scrollBehavior = "";
      goTo(nearest());
      // Restore snapping once the settle animation has had time to run.
      window.setTimeout(() => (strip.style.scrollSnapType = ""), 450);
    };
    // A drag should not also count as a click on a slide.
    const click = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };
    strip.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    strip.addEventListener("click", click, true);
    return () => {
      strip.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      strip.removeEventListener("click", click, true);
    };
  }, [stripRef, goTo, nearest, pause, count]);

  /** For dots: jump to a slide and pause auto-advance. */
  const jump = useCallback(
    (i: number) => {
      pause();
      goTo(i);
    },
    [goTo, pause]
  );

  return { index, jump, step };
}
