import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { WaCta } from "../WaCta";
import { prefersReducedMotion } from "../useViewport";

const POSTER = "/media/hero/wiro-seedance-poster.webp";
const POSTER_SRCSET =
  "/media/hero/wiro-seedance-poster-sm.webp 828w, /media/hero/wiro-seedance-poster.webp 1536w";
const VIDEO_DESKTOP = "/media/hero/wiro-seedance-720p-optimized.mp4";
const VIDEO_MOBILE = "/media/hero/wiro-seedance-mobile.mp4";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/**
 * Home hero — the design's "night drive": the WIRO video plays inside the
 * giant "WIRO 4×4" letters; scrolling zooms through them into the full video,
 * then the "Your journey in the North" banner rises in. With reduced motion
 * the banner is shown straight away.
 */
export function NightDriveHero() {
  const { t, language } = useLanguage();
  const trackRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduce] = useState(prefersReducedMotion);
  const [p, setP] = useState(reduce ? 1 : 0);
  // Chosen during the first render (not in an effect) so the video request
  // starts as soon as the hero mounts; it is the page's largest element.
  const [videoSrc] = useState<string | null>(() => {
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (reduce || connection?.saveData) return null;
    return window.innerWidth < 720 ? VIDEO_MOBILE : VIDEO_DESKTOP;
  });

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoSrc) return undefined;
    v.muted = true;
    const play = () => {
      v.playbackRate = 0.72;
      if (document.hidden) v.pause();
      else void v.play().catch(() => undefined);
    };
    v.addEventListener("loadedmetadata", play);
    document.addEventListener("visibilitychange", play);
    play();
    return () => {
      v.removeEventListener("loadedmetadata", play);
      document.removeEventListener("visibilitychange", play);
    };
  }, [videoSrc]);

  useEffect(() => {
    if (reduce) return undefined;
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = trackRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      setP(span > 0 ? clamp(-r.top / span, 0, 1) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduce]);

  // Keyboard users tabbing into the (still hidden) banner jump to its end state.
  const revealBanner = () => {
    const el = trackRef.current;
    if (reduce || !el || p > 0.56) return;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo(0, el.offsetTop + span * 0.6);
  };

  const z = clamp(p / 0.34, 0, 1);
  const e = z * z * z;
  const end = reduce ? 1 : clamp((p - 0.42) / 0.14, 0, 1);
  const textScale = 1 + e * 42;
  const maskOp = clamp(1 - (z - 0.88) / 0.12, 0, 1);
  const vidScale = 1.18 - p * 0.12;
  const washOp = reduce ? 1 : clamp((z - 0.7) / 0.3, 0, 1);
  const introOp = reduce ? 0 : clamp(1 - p / 0.06, 0, 1);

  return (
    <section
      ref={trackRef}
      className="wx-night"
      data-header-dark
      style={{ height: reduce ? "100vh" : "340vh" }}
      aria-labelledby="wx-night-title"
    >
      <div className="wx-night__stage">
        <img
          src={POSTER}
          srcSet={POSTER_SRCSET}
          sizes="100vw"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="wx-night__media"
          style={{ transform: `scale(${vidScale.toFixed(3)})` }}
        />
        {videoSrc && (
          <video
            ref={videoRef}
            className="wx-night__media"
            src={videoSrc}
            poster={POSTER}
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
            tabIndex={-1}
            aria-hidden="true"
            style={{ transform: `scale(${vidScale.toFixed(3)})` }}
          />
        )}
        {maskOp > 0.001 && (
          <div
            className="wx-night__mask"
            aria-hidden="true"
            style={{ opacity: maskOp }}
          >
            <div
              dir="ltr"
              className="wx-night__word"
              style={{ transform: `scale(${textScale.toFixed(3)})` }}
            >
              WIRO 4×4
            </div>
          </div>
        )}
        <div className="wx-night__wash" style={{ opacity: washOp }} />
        <div
          className="wx-night__intro"
          style={{ opacity: introOp }}
          aria-hidden="true"
        >
          <div
            className="wx-caps"
            style={{ color: "var(--wx-gold)", letterSpacing: "0.3em" }}
          >
            {t(
              "Private access · Northern Thailand",
              "טיולי 4×4 פרטיים · צ׳יאנג מאי"
            )}
          </div>
          <div
            className="wx-caps"
            style={{
              fontSize: 11,
              letterSpacing: "0.3em",
              color: "rgba(251,248,241,0.7)",
              marginTop: 36,
            }}
          >
            {t("Scroll to ride in", "גללו כדי לעלות לרכב")}
          </div>
        </div>

        <div
          className="wx-night__end"
          onFocusCapture={revealBanner}
          style={{
            opacity: end,
            pointerEvents: end > 0.5 ? "auto" : "none",
            transform: `translateY(${((1 - end) * 40).toFixed(1)}px)`,
          }}
        >
          <p
            className="wx-caps wx-eyebrow wx-eyebrow--light"
            style={{ margin: 0, letterSpacing: "0.24em" }}
          >
            {t("Private 4×4 · Chiang Mai", "4×4 פרטי · צ׳יאנג מאי")}
          </p>
          <h1 id="wx-night-title" className="wx-night__title">
            {language === "he"
              ? "המסע שלכם בצפון"
              : "Your journey in the North"}
            <br />
            <em>{language === "he" ? "מתחיל איתנו." : "starts with us."}</em>
          </h1>
          <p className="wx-night__lede">
            {t(
              "Explore Northern Thailand by Jeep with a route, pickup and pace planned around your group.",
              "גלו את צפון תאילנד בג׳יפ, עם מסלול, איסוף וקצב שמתוכננים סביב הקבוצה שלכם."
            )}
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 30,
            }}
          >
            <WaCta
              source="HOME-HERO"
              className="wx-btn wx-btn--gold wx-btn--sharp"
            >
              {t("Plan with WIRO", "תכננו עם WIRO")}
            </WaCta>
            <a
              href="#wx-trail-title"
              className="wx-btn wx-btn--ghost-light wx-btn--sharp"
            >
              {t("Explore the routes", "גלו את המסלולים")}
            </a>
          </div>
          <p
            style={{
              fontSize: 14,
              color: "rgba(251,248,241,0.75)",
              margin: "22px 0 0",
            }}
          >
            {t(
              "Private vehicle · Chiang Mai pickup · Hebrew planning · Kosher-friendly meals",
              "רכב פרטי · איסוף מצ׳יאנג מאי · תכנון בעברית · תכנון אוכל כשר"
            )}
          </p>
        </div>

        {!reduce && (
          <div className="wx-night__progress" aria-hidden="true">
            <div style={{ height: `${(p * 100).toFixed(1)}%` }} />
          </div>
        )}
      </div>
    </section>
  );
}
