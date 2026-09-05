import { useEffect, useRef, useState } from "react";
import { ArrowDown, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";

export function Hero() {
  const { t, language } = useLanguage();
  const heroRef = useRef<HTMLElement>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const [backgroundReady, setBackgroundReady] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [motionReadyToLoad, setMotionReadyToLoad] = useState(false);
  const [motionSource, setMotionSource] = useState(
    "/media/hero/wiro-seedance-720p-optimized.mp4"
  );
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
      setMotionSource(
        window.matchMedia("(max-width: 720px)").matches
          ? "/media/hero/wiro-seedance-mobile.mp4"
          : "/media/hero/wiro-seedance-720p-optimized.mp4"
      );
    };

    updateMotionAvailability();
    reducedMotion.addEventListener("change", updateMotionAvailability);
    return () => {
      reducedMotion.removeEventListener("change", updateMotionAvailability);
    };
  }, []);

  useEffect(() => {
    if (!motionEnabled) {
      setMotionReadyToLoad(false);
      return;
    }

    let cancelled = false;
    const loadMotion = () => {
      if (!cancelled) setMotionReadyToLoad(true);
    };
    const idleWindow = window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number }
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const idleHandle = idleWindow.requestIdleCallback
      ? idleWindow.requestIdleCallback(loadMotion, { timeout: 1200 })
      : undefined;
    const timeoutHandle = window.setTimeout(loadMotion, 900);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutHandle);
      if (idleHandle !== undefined) idleWindow.cancelIdleCallback?.(idleHandle);
    };
  }, [motionEnabled]);

  useEffect(() => {
    const video = backgroundVideoRef.current;
    if (!motionEnabled || !motionReadyToLoad || !video) return;

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
  }, [motionEnabled, motionReadyToLoad, backgroundReady]);

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
            aria-hidden="true"
            fetchPriority="high"
            decoding="async"
            className="wiro-hero__image"
          />
          {motionEnabled && motionReadyToLoad && (
            <video
              ref={backgroundVideoRef}
              className="wiro-hero__video"
              muted
              autoPlay
              loop
              playsInline
              preload="metadata"
              poster="/media/hero/wiro-seedance-poster.jpg"
              onLoadedMetadata={() => setBackgroundReady(true)}
              tabIndex={-1}
            >
              <source src={motionSource} type="video/mp4" />
            </video>
          )}
          <div className="wiro-hero__wash" />
        </div>

        <div className="container wiro-hero__layout">
          <div className="wiro-hero__content">
            <p className="wiro-hero__eyebrow">
              {t(
                "Private access · Northern Thailand",
                "טיולי 4×4 פרטיים · צ׳יאנג מאי"
              )}
            </p>
            <h1 id="home-hero-title">
              {t(
                "Private Chiang Mai 4x4 tours into Northern Thailand.",
                "טיולי 4x4 פרטיים מצ׳יאנג מאי אל צפון תאילנד."
              )}
            </h1>
            <p className="wiro-hero__lede">
              {t(
                "Explore Northern Thailand by Jeep with a route, pickup and pace planned around your group.",
                "גלו את צפון תאילנד בג׳יפ, עם מסלול, איסוף וקצב שמתוכננים סביב הקבוצה שלכם."
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
                {t("Plan with WIRO", "תכננו עם WIRO")}
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
                "Private vehicle · Chiang Mai pickup · Hebrew planning",
                "רכב פרטי · איסוף מצ׳יאנג מאי · תכנון בעברית"
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
