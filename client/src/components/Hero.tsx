import { useRef } from "react";
import { ChevronDown, MessageCircle, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CinematicHeroBackground } from "@/components/CinematicHeroBackground";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";

export function Hero() {
  const { t, language } = useLanguage();
  const chevronRef = useRef<HTMLDivElement>(null);

  const whatsappMessage =
    language === "he"
      ? "שלום WIRO 4x4, אשמח לתכנן טיול שטח פרטי מצ'יאנג מאי.\nתאריכים: __\nמספר מטיילים: __\nמלון או אזור איסוף: __\nרעיון למסלול: __\nצרכי כשרות / שבת / מדריך בעברית: __"
      : "Hi WIRO 4x4, I'd like to plan a private off-road trip from Chiang Mai.\nDates: __\nGroup size: __\nPickup area or hotel: __\nRoute idea: __\nKosher / Shabbat / Hebrew-guide needs: __";

  const scrollToTours = () => {
    document.getElementById("tours")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-primary">
      <CinematicHeroBackground
        alt={t(
          "Travelers with WIRO 4x4 vehicle on jungle road in Chiang Mai",
          "מטיילים עם רכב WIRO 4x4 בדרך ג'ונגל בצ'יאנג מאי"
        )}
      />

      {/* Bottom gradient overlay - stronger for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/55 to-primary/10 md:from-primary/85 md:via-primary/30" />

      {/* Content — CSS stagger animation (respects prefers-reduced-motion) */}
      <div className="relative z-10 flex min-h-[100svh] items-end px-5 pb-24 pt-28 text-white sm:pb-16 md:px-12 md:pb-20 lg:px-20">
        <div className="w-full max-w-4xl">
          {/* Brand eyebrow — small, elegant */}
          <p className="text-xs md:text-sm font-semibold tracking-[0.25em] uppercase text-accent mb-3 md:mb-4 animate-hero-reveal [animation-delay:0.1s]">
            WIRO 4×4 &nbsp;·&nbsp;{" "}
            {t("Chiang Mai, Thailand", "צ'יאנג מאי, תאילנד")}
          </p>

          <h1 className="text-[clamp(2.5rem,1rem+5vw,4.75rem)] leading-[1.02] mb-4 md:mb-5 max-w-[22rem] sm:max-w-3xl lg:max-w-4xl text-balance drop-shadow-2xl animate-hero-reveal [animation-delay:0.2s]">
            {language === "he" ? (
              <>
                טיולי 4×4 <span className="text-accent">כשרים</span> בצ'יאנג מאי
              </>
            ) : (
              <>Private 4×4 Adventures, Planned Around Your Trip</>
            )}
          </h1>

          <p className="text-sm min-[380px]:text-base md:text-lg lg:text-xl font-light text-white/90 mb-6 md:mb-8 max-w-[21rem] sm:max-w-xl drop-shadow-lg animate-hero-reveal [animation-delay:0.35s] relative">
            {t(
              "Real off-road routes from Chiang Mai with Hebrew support, kosher-aware meal planning, and Shabbat-sensitive scheduling.",
              "מסלולי שטח אמיתיים מצ'יאנג מאי, עם מענה בעברית, תכנון ארוחות מותאם כשרות ולוחות זמנים המתחשבים בשבת."
            )}
            <span className="absolute -bottom-3 start-0 h-[2px] w-14 bg-accent" />
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 md:mb-6 animate-hero-reveal [animation-delay:0.5s] mt-4">
            <TrackedWhatsAppLink
              sourceCode={language === "he" ? "HOME-HERO-HE" : "HOME-HERO-EN"}
              humanMessage={whatsappMessage}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-12 bg-[#075E54] hover:bg-[#064C44] active:bg-[#053D37] text-white font-bold px-8 py-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-2xl w-full sm:w-auto tracking-wide uppercase text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#075E54] focus:ring-offset-2 focus:ring-offset-primary"
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              {t("Check Availability on WhatsApp", "בדיקת זמינות בוואטסאפ")}
            </TrackedWhatsAppLink>
            <button
              type="button"
              onClick={scrollToTours}
              className="min-h-12 text-white font-bold px-4 py-3 rounded-lg transition-all w-full sm:w-auto tracking-wide uppercase text-sm md:text-base hover:bg-white/10 underline decoration-accent underline-offset-8 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary"
            >
              {t("See Route Ideas", "רעיונות למסלולים")}
            </button>
          </div>

          <div className="max-w-[22rem] sm:max-w-2xl animate-hero-reveal [animation-delay:0.65s]">
            <p className="flex items-start gap-2 text-sm md:text-base leading-relaxed text-white/85">
              <ShieldCheck
                className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                aria-hidden="true"
              />
              <span>
                {t(
                  "A real guide replies personally in English or Hebrew. Send dates, group size, pickup area, and any food or Shabbat needs.",
                  "מדריך אמיתי עונה אישית בעברית או באנגלית. שלחו תאריכים, מספר מטיילים, אזור איסוף וצרכי אוכל או שבת."
                )}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Animated scroll chevron */}
      <div
        ref={chevronRef}
        className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-1 cursor-pointer group"
        onClick={scrollToTours}
      >
        <span className="text-white/50 text-xs tracking-[0.2em] uppercase">
          {t("Scroll", "גלילה")}
        </span>
        <ChevronDown className="w-6 h-6 text-accent animate-hero-chevron" />
      </div>
    </section>
  );
}
