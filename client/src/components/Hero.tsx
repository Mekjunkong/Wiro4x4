import { useEffect, useRef, useState } from "react";
import { ArrowDown, MessageCircle, Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";

export function Hero() {
  const { t, language } = useLanguage();
  const heroRef = useRef<HTMLElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const filmRef = useRef<HTMLVideoElement>(null);
  const [backgroundReady, setBackgroundReady] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [filmReady, setFilmReady] = useState(false);
  const whatsappMessage =
    language === "he"
      ? "שלום WIRO 4x4, אשמח לתכנן טיול שטח פרטי מצ'יאנג מאי.\nתאריכים: __\nמספר מטיילים: __\nמלון או אזור איסוף: __\nצרכי כשרות / שבת / מדריך בעברית: __"
      : "Hi WIRO 4x4, I'd like to plan a private off-road trip from Chiang Mai.\nDates: __\nGroup size: __\nPickup area or hotel: __\nKosher / Shabbat / Hebrew-guide needs: __";

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & {
        connection?: { effectiveType?: string; saveData?: boolean };
      }
    ).connection;

    const updateMotionAvailability = () => {
      const constrainedNetwork =
        connection?.saveData || connection?.effectiveType?.includes("2g");
      setMotionEnabled(!reducedMotion.matches && !constrainedNetwork);
    };

    updateMotionAvailability();
    reducedMotion.addEventListener("change", updateMotionAvailability);
    return () => {
      reducedMotion.removeEventListener("change", updateMotionAvailability);
    };
  }, []);

  useEffect(() => {
    const video = backgroundVideoRef.current;
    if (!motionEnabled || !video) return;

    const updatePlayback = () => {
      video.playbackRate = 0.72;
      if (document.hidden) {
        video.pause();
        return;
      }
      void video.play().catch(() => undefined);
    };

    updatePlayback();
    document.addEventListener("visibilitychange", updatePlayback);
    return () => {
      document.removeEventListener("visibilitychange", updatePlayback);
    };
  }, [motionEnabled, backgroundReady]);

  useEffect(() => {
    const video = filmRef.current;
    if (!video) return;

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const updatePlayback = () => {
      if (motionPreference.matches || document.hidden) {
        video.pause();
        return;
      }
      void video.play().catch(() => undefined);
    };

    updatePlayback();
    motionPreference.addEventListener("change", updatePlayback);
    document.addEventListener("visibilitychange", updatePlayback);
    return () => {
      motionPreference.removeEventListener("change", updatePlayback);
      document.removeEventListener("visibilitychange", updatePlayback);
    };
  }, []);

  const scrollToJourney = () =>
    document
      .getElementById("journey-heading")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section
      ref={heroRef}
      className={`wiro-hero ${backgroundReady ? "has-motion" : ""}`}
      aria-labelledby="home-hero-title"
    >
      <div className="wiro-hero__stage">
        <div className="wiro-hero__media" aria-hidden="true">
          <img
            src="/media/hero/wiro-seedance-poster.jpg"
            alt=""
            fetchPriority="high"
            decoding="async"
            className="wiro-hero__image"
          />
          {motionEnabled && (
            <video
              ref={backgroundVideoRef}
              className="wiro-hero__video"
              muted
              autoPlay
              loop
              playsInline
              preload="auto"
              poster="/media/hero/wiro-seedance-poster.jpg"
              onLoadedMetadata={() => setBackgroundReady(true)}
              tabIndex={-1}
            >
              <source
                src="/media/hero/wiro-seedance-2-5-720p.mp4"
                type="video/mp4"
              />
            </video>
          )}
          <div className="wiro-hero__wash" />
        </div>

        <div className="container wiro-hero__layout">
          <div className="wiro-hero__content">
            <p className="wiro-hero__eyebrow">
              {t(
                "Private 4×4 journeys · Chiang Mai",
                "טיולי 4×4 פרטיים · צ׳יאנג מאי"
              )}
            </p>
            <h1 id="home-hero-title">
              {t(
                "Go beyond the roads everyone knows.",
                "צאו מעבר לדרכים שכולם מכירים."
              )}
            </h1>
            <p className="wiro-hero__lede">
              {t(
                "Private journeys through mountain roads, villages and forest routes, personally planned with WIRO.",
                "מסעות פרטיים בדרכי הרים, כפרים ושבילי יער, בתכנון אישי עם WIRO."
              )}
            </p>
            <div className="wiro-hero__actions">
              <TrackedWhatsAppLink
                sourceCode={language === "he" ? "HOME-HERO-HE" : "HOME-HERO-EN"}
                humanMessage={whatsappMessage}
                target="_blank"
                rel="noopener noreferrer"
                className="wiro-hero__primary"
              >
                <MessageCircle aria-hidden="true" />
                {t("Plan your journey", "תכננו את המסע")}
              </TrackedWhatsAppLink>
              <button
                type="button"
                onClick={scrollToJourney}
                className="wiro-hero__secondary"
              >
                {t("Explore the routes", "גלו את המסלולים")}
                <ArrowDown aria-hidden="true" />
              </button>
            </div>
            <p className="wiro-hero__trust">
              {t(
                "Private tours · Chiang Mai pickup · Hebrew-speaking guide",
                "טיולים פרטיים · איסוף מצ׳יאנג מאי · מדריך דובר עברית"
              )}
            </p>
            <p className="wiro-hero__scroll-cue" aria-hidden="true">
              <span />
              {t("Scroll to explore", "גללו כדי לגלות")}
            </p>
          </div>

          <figure className={`wiro-hero__film ${filmReady ? "is-ready" : ""}`}>
            <video
              ref={filmRef}
              muted
              loop
              playsInline
              preload="metadata"
              poster="/media/field/forest-drive-poster.jpg"
              onCanPlay={() => setFilmReady(true)}
              aria-label={t(
                "Real WIRO 4x4 trip crossing a forest log bridge",
                "טיול אמיתי של WIRO 4x4 חוצה גשר עץ ביער"
              )}
            >
              <source src="/media/field/forest-drive.mp4" type="video/mp4" />
            </video>
            <figcaption>
              <span className="wiro-hero__film-icon" aria-hidden="true">
                <Play />
              </span>
              <span>
                <strong>{t("Real trip film", "סרטון מטיול אמיתי")}</strong>
                <small>{t("Mae Wang · 00:31", "מאה ואנג · 00:31")}</small>
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
