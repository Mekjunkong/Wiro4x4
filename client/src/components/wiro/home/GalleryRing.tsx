import { useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { photo } from "@/data/wiroTours";
import { TRAIL_PHOTOS } from "@/data/wiroGallery";
import { ArrowIcon } from "../icons";
import { prefersReducedMotion, useViewportWidth } from "../useViewport";

/** "Days like these" — a slowly turning 3D ring of real trip photos. */
export function GalleryRing() {
  const { t, language } = useLanguage();
  const [, navigate] = useLocation();
  const w = useViewportWidth();
  const worldRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; a: number } | null>(null);
  const moved = useRef(false);
  const angle = useRef(0);

  const narrow = w < 900;
  const rw = Math.round(
    Math.min(380, Math.max(200, w * (narrow ? 0.5 : 0.24)))
  );
  const rh = Math.round(rw * 1.3);
  const N = TRAIL_PHOTOS.length;
  const R = Math.round(((rw * N) / (2 * Math.PI)) * 1.1);

  useEffect(() => {
    const reduce = prefersReducedMotion();
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      if (Math.abs(dx) > 5) moved.current = true;
      angle.current = d.a + dx * 0.25;
    };
    const onUp = () => {
      if (!drag.current) return;
      drag.current = null;
      window.setTimeout(() => (moved.current = false), 60);
    };
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!drag.current && !reduce) angle.current -= 0.06;
      if (worldRef.current)
        worldRef.current.style.transform = `translateZ(-${R}px) rotateY(${angle.current.toFixed(2)}deg)`;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [R]);

  return (
    <section
      className="wx wx-dark"
      aria-labelledby="wx-ring-title"
      style={{ padding: "clamp(56px,6vw,88px) 0", overflow: "hidden" }}
    >
      <div className="wx-wrap" style={{ textAlign: "center" }}>
        <p
          className="wx-caps wx-eyebrow"
          style={{ margin: 0, justifyContent: "center" }}
        >
          {t("From the trail", "מהשטח")}
        </p>
        <h2 id="wx-ring-title" className="wx-h2">
          {t("Days like these", "ימים כאלה")}
        </h2>
      </div>
      <div
        className="wx-ring"
        style={{ height: rh + 80, marginTop: "clamp(24px,3vw,40px)" }}
        onPointerDown={e => {
          drag.current = { x: e.clientX, a: angle.current };
          moved.current = false;
        }}
      >
        <div ref={worldRef} className="wx-ring__world">
          {TRAIL_PHOTOS.map((p, i) => {
            const cap = language === "he" ? p.he : p.en;
            return (
              <button
                key={p.stem}
                type="button"
                className="wx-ring__item"
                tabIndex={-1}
                aria-hidden="true"
                onClick={() => {
                  if (!moved.current) navigate(`/gallery?photo=${i}`);
                }}
                style={{
                  left: -rw / 2,
                  top: -rh / 2,
                  width: rw,
                  height: rh,
                  transform: `rotateY(${(360 / N) * i}deg) translateZ(${R}px)`,
                }}
              >
                <img
                  src={photo(p.stem).md}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  loading="lazy"
                />
                <span className="wx-ring__cap">{cap}</span>
              </button>
            );
          })}
        </div>
        <div className="wx-ring__edge" />
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          justifyContent: "center",
          alignItems: "center",
          marginTop: "clamp(20px,3vw,32px)",
          padding: "0 20px",
        }}
      >
        <span
          className="wx-caps"
          style={{ fontSize: 11, color: "rgba(251,248,241,0.6)" }}
        >
          {t("Drag to spin", "גררו כדי לסובב")}
        </span>
        <Link href="/gallery" className="wx-btn wx-btn--gold wx-btn--sharp">
          {t("Open the gallery", "לגלריה")}
          <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}
