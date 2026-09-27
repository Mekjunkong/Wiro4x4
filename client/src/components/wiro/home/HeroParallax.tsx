import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { photo } from "@/data/wiroTours";
import { WaCta } from "../WaCta";
import { ArrowIcon } from "../icons";
import { prefersReducedMotion } from "../useViewport";

/**
 * Home hero — the "parallax" variant from the design: a real river-crossing
 * photo that drifts with the pointer and scroll, two real trip photos
 * floating on the right, and the WIRO 4×4 wordmark.
 */
export function HeroParallax() {
  const { t } = useLanguage();
  const bgRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const m = { x: 0, y: 0, tx: 0, ty: 0 };
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      m.tx = (e.clientX / window.innerWidth) * 2 - 1;
      m.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const sy = Math.min(window.scrollY, window.innerHeight * 1.2);
      m.x += (m.tx - m.x) * 0.08;
      m.y += (m.ty - m.y) * 0.08;
      if (bgRef.current)
        bgRef.current.style.transform = `translate3d(${(m.x * -18).toFixed(1)}px,${(m.y * -12 + sy * 0.25).toFixed(1)}px,0) scale(1.06)`;
      if (stackRef.current)
        stackRef.current.style.transform = `translate3d(${(m.x * 26).toFixed(1)}px,${(m.y * 18 - sy * 0.15).toFixed(1)}px,0)`;
      if (backRef.current)
        backRef.current.style.transform = `rotate(-5deg) translate3d(${(m.x * 16).toFixed(1)}px,${(m.y * 12).toFixed(1)}px,0)`;
      if (titleRef.current)
        titleRef.current.style.transform = `translate3d(${(m.x * -8).toFixed(1)}px,0,0)`;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section className="wx-hero" aria-labelledby="wx-hero-title">
      <div
        ref={bgRef}
        className="wx-hero__bg"
        role="img"
        aria-label={t(
          "WIRO 4x4 crossing a river in Chiang Mai",
          "רכב WIRO 4x4 חוצה נהר בצ'יאנג מאי"
        )}
        style={{
          backgroundImage: `url(${photo("wiro_4x4_river_splash").lg})`,
          transform: "scale(1.06)",
        }}
      />
      <div className="wx-hero__shade" />
      <div ref={stackRef} className="wx-hero__stack" aria-hidden="true">
        <img
          src={photo("single_cascade_waterfall").md}
          alt=""
          aria-hidden="true"
          style={{
            width: "56%",
            aspectRatio: "3 / 4",
            insetInlineEnd: 0,
            top: 0,
            transform: "rotate(4deg)",
          }}
        />
        <img
          ref={backRef}
          src={photo("hilltribe_community_visit").md}
          alt=""
          aria-hidden="true"
          style={{
            width: "48%",
            aspectRatio: "4 / 5",
            insetInlineStart: 0,
            top: "30%",
            transform: "rotate(-5deg)",
          }}
        />
      </div>
      <div className="wx-hero__copy">
        <p
          className="wx-caps"
          style={{ color: "var(--wx-gold)", margin: "0 0 14px" }}
        >
          {t(
            "Private 4×4 day trips · Chiang Mai",
            "טיולי 4×4 פרטיים · צ'יאנג מאי"
          )}
        </p>
        <h1
          id="wx-hero-title"
          ref={titleRef}
          className="wx-hero__title"
          dir="ltr"
        >
          <span className="sr-only">
            {t(
              "Private 4x4 tours from Chiang Mai — ",
              "טיולי 4x4 פרטיים מצ'יאנג מאי — "
            )}
          </span>
          WIRO 4×4
        </h1>
        <p className="wx-hero__sub">
          {t(
            "The Thailand most tourists never see. Private 4×4 days, Hebrew planning, and meals planned around your kashrut.",
            "התאילנד שרוב התיירים לא רואים. ימי 4×4 פרטיים, תכנון בעברית וארוחות שמתוכננות לפי הכשרות שלכם."
          )}
        </p>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}
        >
          <WaCta source="HOME-HERO">
            {t("Check availability on WhatsApp", "בדיקת זמינות בוואטסאפ")}
          </WaCta>
          <Link href="/tours" className="wx-btn wx-btn--ghost-light">
            {t("Explore tours", "לכל הטיולים")}
            <ArrowIcon />
          </Link>
        </div>
        <ul
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 26,
            padding: 0,
            listStyle: "none",
          }}
        >
          {[
            t("Hebrew-speaking planning", "תכנון בעברית"),
            t("Kosher-friendly meals", "תכנון אוכל כשר"),
            t("Shabbat-aware scheduling", "תכנון מותאם שבת"),
            t("Private tours only", "טיולים פרטיים בלבד"),
          ].map(c => (
            <li key={c} className="wx-chip">
              {c}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
