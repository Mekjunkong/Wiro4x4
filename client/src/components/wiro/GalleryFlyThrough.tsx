import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowIcon } from "./icons";
import { prefersReducedMotion, useViewportWidth } from "./useViewport";

export interface FlyPhoto {
  key: string | number;
  src: string;
  caption: string;
  ratio: string;
}

const WIDTHS = [300, 240, 340, 260, 220, 320, 280];

/**
 * Gallery hero: scroll flies the camera forward through a field of real trip
 * photos; the pointer tilts the world. Click any photo for a lightbox.
 */
export function GalleryFlyThrough({
  photos,
  initialIndex = -1,
}: {
  photos: readonly FlyPhoto[];
  initialIndex?: number;
}) {
  const { t } = useLanguage();
  const w = useViewportWidth();
  const narrow = w < 900;
  const trackRef = useRef<HTMLElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const [lb, setLb] = useState(initialIndex);
  const n = photos.length;

  useEffect(() => {
    const reduce = prefersReducedMotion();
    const g = { x: 0, y: 0, tx: 0, ty: 0 };
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      g.tx = (e.clientX / window.innerWidth) * 2 - 1;
      g.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const tr = trackRef.current;
      const world = worldRef.current;
      if (!tr || !world) return;
      const r = tr.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? Math.max(0, Math.min(1, -r.top / span)) : 0;
      if (!reduce) {
        g.x += (g.tx - g.x) * 0.06;
        g.y += (g.ty - g.y) * 0.06;
      }
      const off = p * (n * 190 - 100);
      world.style.transform = `translateZ(${off}px) rotateX(${g.y * -7}deg) rotateY(${g.x * 9}deg)`;
      world.querySelectorAll<HTMLElement>("[data-z]").forEach(el => {
        const z = Number(el.dataset.z) + off;
        let o = 1;
        if (z > 250) o = Math.max(0, 1 - (z - 250) / 350);
        else if (z < -1300) o = Math.max(0, 1 - (-1300 - z) / 900);
        el.style.opacity = o.toFixed(3);
        el.style.pointerEvents = o < 0.25 ? "none" : "auto";
        el.style.visibility = o <= 0.001 ? "hidden" : "visible";
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [n]);

  useEffect(() => {
    if (lb < 0) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLb(-1);
      if (e.key === "ArrowRight") setLb(i => (i + 1) % n);
      if (e.key === "ArrowLeft") setLb(i => (i - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lb, n]);

  const cur = lb >= 0 ? photos[lb] : null;

  return (
    <>
      <section
        ref={trackRef}
        className="wx-fly"
        data-header-dark
        aria-labelledby="wx-gallery-title"
      >
        <div className="wx-fly__stage">
          <div ref={worldRef} className="wx-fly__world">
            {photos.map((ph, i) => (
              <button
                key={ph.key}
                type="button"
                data-z={-120 - i * 190}
                className="wx-fly__item"
                onClick={() => setLb(i)}
                aria-label={t(
                  `Open photo: ${ph.caption}`,
                  `פתחו תמונה: ${ph.caption}`
                )}
                style={{
                  left: `${(((i * 37) % 9) - 4) * (narrow ? 8 : 9.5)}vw`,
                  top: `${(((i * 53) % 7) - 3) * 9}vh`,
                  width: `min(${WIDTHS[i % WIDTHS.length]}px, 44vw)`,
                  transform: `translate(-50%,-50%) translateZ(${-120 - i * 190}px)`,
                }}
              >
                <img
                  src={ph.src}
                  alt=""
                  aria-hidden="true"
                  loading={i < 6 ? "eager" : "lazy"}
                  style={{ aspectRatio: ph.ratio }}
                />
                <span
                  className="wx-caps"
                  style={{
                    display: "block",
                    marginTop: 10,
                    fontSize: 11,
                    color: "rgba(251,248,241,0.75)",
                  }}
                >
                  {ph.caption}
                </span>
              </button>
            ))}
          </div>
          <div className="wx-fly__vignette" />
          <div
            style={{
              position: "absolute",
              insetInline: 0,
              top: 0,
              maxWidth: 1280,
              margin: "0 auto",
              padding: "clamp(96px,12vh,128px) var(--wx-gutter) 0",
              color: "var(--wx-light)",
              pointerEvents: "none",
            }}
          >
            <p
              className="wx-caps"
              style={{ color: "var(--wx-gold)", margin: 0 }}
            >
              {t("From the trail", "מהשטח")}
            </p>
            <h1
              id="wx-gallery-title"
              className="wx-serif"
              style={{
                fontSize: "clamp(44px,6vw,84px)",
                lineHeight: 0.95,
                margin: "10px 0 0",
                textShadow: "0 6px 30px rgba(0,0,0,0.6)",
              }}
            >
              {t("Photo Gallery", "גלריית תמונות")}
            </h1>
          </div>
          <p
            className="wx-caps"
            style={{
              position: "absolute",
              bottom: 28,
              insetInline: 0,
              textAlign: "center",
              fontSize: 11,
              color: "rgba(251,248,241,0.7)",
              pointerEvents: "none",
              margin: 0,
            }}
          >
            {t(
              "Move to look around · scroll to fly in",
              "הזיזו כדי להסתכל · גללו כדי לעוף פנימה"
            )}
          </p>
        </div>
      </section>

      {cur && (
        <div
          className="wx-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={cur.caption}
          onClick={() => setLb(-1)}
        >
          <img src={cur.src} alt={cur.caption} />
          <div
            style={{ display: "flex", alignItems: "center", gap: 20 }}
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="wx-round"
              aria-label={t("Previous photo", "התמונה הקודמת")}
              onClick={() => setLb(i => (i - 1 + n) % n)}
            >
              <ArrowIcon size={18} back />
            </button>
            <span
              className="wx-caps"
              style={{ minWidth: 200, textAlign: "center" }}
            >
              {cur.caption}
            </span>
            <button
              type="button"
              className="wx-round"
              aria-label={t("Next photo", "התמונה הבאה")}
              onClick={() => setLb(i => (i + 1) % n)}
            >
              <ArrowIcon size={18} />
            </button>
          </div>
          <button
            type="button"
            className="wx-round"
            style={{ position: "absolute", top: 16, insetInlineEnd: 16 }}
            aria-label={t("Close", "סגירה")}
            onClick={() => setLb(-1)}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
