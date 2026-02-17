import { useEffect, useState } from "react";

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      setIsTouch(true);
      return;
    }

    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const hoverIn = () => setIsHovering(true);
    const hoverOut = () => setIsHovering(false);

    window.addEventListener("mousemove", move);

    const interactiveSelector =
      "a, button, [role='button'], input, select, textarea, [data-cursor-hover]";

    const trackedElements = new Set<Element>();

    const addListeners = (el: Element) => {
      if (trackedElements.has(el)) return;
      el.addEventListener("mouseenter", hoverIn);
      el.addEventListener("mouseleave", hoverOut);
      trackedElements.add(el);
    };

    const observer = new MutationObserver(() => {
      document.querySelectorAll(interactiveSelector).forEach(addListeners);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.querySelectorAll(interactiveSelector).forEach(addListeners);

    return () => {
      window.removeEventListener("mousemove", move);
      observer.disconnect();
      trackedElements.forEach(el => {
        el.removeEventListener("mouseenter", hoverIn);
        el.removeEventListener("mouseleave", hoverOut);
      });
      trackedElements.clear();
    };
  }, []);

  if (isTouch) return null;

  return (
    <div
      className="fixed pointer-events-none z-[99999] rounded-full bg-[#D4AF37] mix-blend-difference transition-transform duration-150 ease-out"
      style={{
        left: pos.x,
        top: pos.y,
        width: isHovering ? 40 : 8,
        height: isHovering ? 40 : 8,
        transform: `translate(-50%, -50%)`,
        opacity: 0.8,
      }}
    />
  );
}
