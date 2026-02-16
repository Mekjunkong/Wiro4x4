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

    const observer = new MutationObserver(() => {
      document.querySelectorAll(interactiveSelector).forEach(el => {
        el.addEventListener("mouseenter", hoverIn);
        el.addEventListener("mouseleave", hoverOut);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.querySelectorAll(interactiveSelector).forEach(el => {
      el.addEventListener("mouseenter", hoverIn);
      el.addEventListener("mouseleave", hoverOut);
    });

    return () => {
      window.removeEventListener("mousemove", move);
      observer.disconnect();
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
