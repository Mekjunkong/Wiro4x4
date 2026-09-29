import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { WaCta } from "../WaCta";
import { prefersReducedMotion } from "../useViewport";

const POSTER = "/media/hero/wiro-seedance-poster.webp";
const POSTER_SM = "/media/hero/wiro-seedance-poster-sm.webp";
const POSTER_SRCSET = `${POSTER_SM} 828w, ${POSTER} 1536w`;
const VIDEO_DESKTOP = "/media/hero/wiro-seedance-720p-optimized.mp4";

/**
 * Home hero: the WIRO video plays full-frame behind the "Your journey in
 * the North" banner, which is visible from the first frame (no scroll-scrub).
 * With reduced motion or Save-Data only the poster is shown.
 */
export function NightDriveHero() {
  const { t, language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  // Chosen during the first render (not in an effect) so the video request
  // starts as soon as the hero mounts; it is the page's largest element.
  const [videoSrc] = useState<string | null>(() => {
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (prefersReducedMotion() || connection?.saveData) return null;
    // The 640x360 mobile cut is stretched ~7x to fill a portrait screen and
    // looks blurry; the 1 MB 720p cut holds up on phones.
    return VIDEO_DESKTOP;
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

  return (
    <section
      className="wx-night"
      data-header-dark
      aria-labelledby="wx-night-title"
    >
      <div className="wx-night__stage">
        <img
          src={POSTER_SM}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="wx-night__backdrop"
        />
        <img
          src={POSTER}
          srcSet={POSTER_SRCSET}
          sizes="100vw"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="wx-night__media"
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
          />
        )}
        <div className="wx-night__wash" />

        <div className="wx-night__end">
          <p
            className="wx-caps wx-eyebrow wx-eyebrow--light"
            style={{
              margin: 0,
              letterSpacing: language === "he" ? 0 : "0.24em",
            }}
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
      </div>
    </section>
  );
}
