import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
const smoothstep = (start: number, end: number, value: number) => {
  const x = clamp((value - start) / (end - start));
  return x * x * (3 - 2 * x);
};

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const { t, language } = useLanguage();
  const journeyRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [heroVideoReady, setHeroVideoReady] = useState(false);
  const heroVideoUrl =
    (import.meta.env.VITE_WIRO_BANNER_VIDEO_URL as string | undefined) ??
    "/media/generated/wiro-banner-kling-optimized.mp4";
  const whatsappMessage =
    language === "he"
      ? "שלום WIRO 4x4, אשמח לתכנן טיול שטח פרטי מצ'יאנג מאי.\nתאריכים: __\nמספר מטיילים: __\nמלון או אזור איסוף: __\nצרכי כשרות / שבת / מדריך בעברית: __"
      : "Hi WIRO 4x4, I'd like to plan a private off-road trip from Chiang Mai.\nDates: __\nGroup size: __\nPickup area or hotel: __\nKosher / Shabbat / Hebrew-guide needs: __";

  useLayoutEffect(() => {
    const section = journeyRef.current;
    if (!section) return;

    const stage = section.querySelector<HTMLElement>(".route-journey__stage");
    if (!stage) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.style.setProperty("--journey-progress", "0");
      section.style.setProperty("--journey-one", "1");
      section.style.setProperty("--journey-two", "0");
      section.style.setProperty("--journey-three", "0");
      section.style.setProperty("--journey-four", "0");
      section.style.setProperty("--journey-wipe-two", "0");
      section.style.setProperty("--journey-wipe-three", "0");
      section.style.setProperty("--journey-wipe-four", "0");
      return;
    }

    const context = gsap.context(() => {
      const updateJourney = (progress: number) => {
        const one = 1 - smoothstep(0.12, 0.2, progress);
        const two =
          smoothstep(0.28, 0.33, progress) *
          (1 - smoothstep(0.5, 0.54, progress));
        const three =
          smoothstep(0.6, 0.65, progress) *
          (1 - smoothstep(0.77, 0.81, progress));
        const four = smoothstep(0.87, 0.92, progress);
        const wipeTwo = smoothstep(0.22, 0.28, progress);
        const wipeThree = smoothstep(0.54, 0.6, progress);
        const wipeFour = smoothstep(0.81, 0.87, progress);

        section.style.setProperty("--journey-progress", String(progress));
        section.style.setProperty("--journey-one", String(one));
        section.style.setProperty("--journey-two", String(two));
        section.style.setProperty("--journey-three", String(three));
        section.style.setProperty("--journey-four", String(four));
        section.style.setProperty("--journey-wipe-two", String(wipeTwo));
        section.style.setProperty("--journey-wipe-three", String(wipeThree));
        section.style.setProperty("--journey-wipe-four", String(wipeFour));
        const video = heroVideoRef.current;
        if (
          heroVideoReady &&
          video?.duration &&
          Number.isFinite(video.duration)
        ) {
          const targetTime = progress * video.duration;
          if (Math.abs(video.currentTime - targetTime) > 0.04) {
            video.currentTime = targetTime;
          }
        }
      };

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        pin: stage,
        pinSpacing: false,
        scrub: 0.35,
        onUpdate: self => updateJourney(self.progress),
      });

      updateJourney(trigger.progress);
    }, section);

    return () => context.revert();
  }, [heroVideoReady]);

  const scrollToTours = () =>
    document.getElementById("tours")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      ref={journeyRef}
      className="route-journey"
      aria-label={t("WIRO route story", "סיפור הדרך של WIRO")}
    >
      <div className="route-journey__stage">
        <div className="route-journey__scene" aria-hidden="true">
          <img
            className="route-journey__image route-journey__image--road"
            src="/images/banner.jpeg"
            alt=""
          />
          {heroVideoUrl && (
            <video
              ref={heroVideoRef}
              className={`route-journey__image route-journey__image--hero-video ${heroVideoReady ? "is-ready" : ""}`}
              src={heroVideoUrl}
              poster="/images/banner.jpeg"
              muted
              playsInline
              preload="none"
              aria-hidden="true"
              onLoadedMetadata={() => setHeroVideoReady(true)}
              onError={() => setHeroVideoReady(false)}
            />
          )}
          <img
            className="route-journey__image route-journey__image--crossing"
            src="/media/field/bridge-wide.jpeg"
            alt=""
          />
          <img
            className="route-journey__image route-journey__image--water"
            src="/images/optimized/sticky_waterfalls-md.webp"
            alt=""
          />
          <img
            className="route-journey__image route-journey__image--summit"
            src="/images/optimized/mountain_sunset-lg.webp"
            alt=""
          />
          <div className="route-journey__shade" />
          <div className="route-journey__grain" />
        </div>
        <div className="route-journey__index" aria-hidden="true">
          <span>01</span>
          <span>02</span>
          <span>03</span>
          <span>04</span>
        </div>

        <div className="route-journey__copy route-journey__copy--opening">
          <p className="route-journey__eyebrow">
            WIRO 4×4 · {t("Chiang Mai", "צ'יאנג מאי")}
          </p>
          <h1>WIRO</h1>
          <p className="route-journey__lede">
            {t(
              "Northern Thailand, shaped around your people.",
              "צפון תאילנד, מותאם לאנשים שלכם."
            )}
          </p>
          <span className="route-journey__scroll">
            {t("Scroll to enter", "גללו כדי להתחיל")}{" "}
            <ArrowDown aria-hidden="true" />
          </span>
        </div>

        <section
          className="route-journey__copy route-journey__copy--crossing"
          aria-label={t("The road changes", "כשהדרך משתנה")}
        >
          <p className="route-journey__eyebrow">
            01 · {t("Mae Wang", "מאה ואנג")}
          </p>
          <h2>
            {t(
              "When the road changes, the day opens up.",
              "כשהדרך משתנה, היום נפתח."
            )}
          </h2>
          <p>
            {t(
              "Forest tracks and river crossings are where a private route starts to feel like yours.",
              "שבילי יער וחציית נהרות הם המקום שבו מסלול פרטי מתחיל להרגיש שלכם."
            )}
          </p>
        </section>

        <section
          className="route-journey__copy route-journey__copy--water"
          aria-label={t("A slower rhythm", "קצב איטי יותר")}
        >
          <p className="route-journey__eyebrow">
            02 · {t("The pauses", "העצירות")}
          </p>
          <h2>
            {t(
              "There is room to stop when it matters.",
              "יש מקום לעצור כשזה חשוב."
            )}
          </h2>
          <p>
            {t(
              "A riverside pause, a cool trail, a local lunch. The route flexes around your family and your day.",
              "עצירה ליד הנהר, שביל קריר, ארוחה מקומית. המסלול גמיש סביב המשפחה והיום שלכם."
            )}
          </p>
        </section>

        <section
          className="route-journey__copy route-journey__copy--arrival"
          aria-label={t("Plan your route", "תכננו את המסלול")}
        >
          <p className="route-journey__eyebrow">
            03 · {t("Your route", "המסלול שלכם")}
          </p>
          <h2>
            {t(
              "Start with the details. We will take it from there.",
              "התחילו בפרטים. אנחנו ניקח את זה משם."
            )}
          </h2>
          <p>
            {t(
              "Dates, group size, pickup, food, Shabbat, Hebrew. Send what matters and WIRO will shape the route around it.",
              "תאריכים, גודל קבוצה, איסוף, אוכל, שבת, עברית. שלחו מה חשוב, ו-WIRO תבנה סביבו מסלול."
            )}
          </p>
          <div className="route-journey__actions">
            <TrackedWhatsAppLink
              sourceCode={language === "he" ? "HOME-HERO-HE" : "HOME-HERO-EN"}
              humanMessage={whatsappMessage}
              target="_blank"
              rel="noopener noreferrer"
              className="route-journey__primary-action"
            >
              <MessageCircle aria-hidden="true" />
              {t("Check availability", "בדיקת זמינות")}
            </TrackedWhatsAppLink>
            <button
              type="button"
              onClick={scrollToTours}
              className="route-journey__secondary-action"
            >
              {t("See route ideas", "רעיונות למסלולים")}
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
