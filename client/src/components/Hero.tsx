import { useRef } from "react";
import { ChevronDown, MessageCircle, ShieldCheck, Clock3 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { COMPANY_WHATSAPP_URL } from "@/const";
import { OptimizedImage } from "@/components/OptimizedImage";
import { trackEvent } from "@/lib/analytics";

export function Hero() {
  const { t, language } = useLanguage();
  const chevronRef = useRef<HTMLDivElement>(null);

  const whatsappMessage =
    language === "he"
      ? encodeURIComponent(
          "שלום WIRO 4x4, אשמח לתכנן טיול שטח פרטי מצ'יאנג מאי.\nתאריכים: __\nמספר מטיילים: __\nמלון או אזור איסוף: __\nרעיון למסלול: __\nצרכי כשרות / שבת / מדריך בעברית: __"
        )
      : encodeURIComponent(
          "Hi WIRO 4x4, I'd like to plan a private off-road trip from Chiang Mai.\nDates: __\nGroup size: __\nPickup area or hotel: __\nRoute idea: __\nKosher / Shabbat / Hebrew-guide needs: __"
        );

  const whatsappUrl = `${COMPANY_WHATSAPP_URL}?text=${whatsappMessage}`;

  const trackHeroAction = (action: string) => {
    trackEvent("hero_cta_click", { action, language });
  };

  const scrollToTours = () => {
    trackHeroAction("view_tours");
    document.getElementById("tours")?.scrollIntoView({ behavior: "smooth" });
  };

  const responseProof = [
    {
      icon: Clock3,
      en: "Personal WhatsApp reply",
      he: "מענה אישי בוואטסאפ",
    },
    {
      icon: ShieldCheck,
      en: "Private route planning",
      he: "תכנון מסלול פרטי",
    },
    {
      icon: MessageCircle,
      en: "English / Hebrew support",
      he: "מענה בעברית / אנגלית",
    },
  ];

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background image - high quality */}
      <OptimizedImage
        src="banner"
        alt={t(
          "Travelers with WIRO 4x4 vehicle on jungle road in Chiang Mai",
          "מטיילים עם רכב WIRO 4x4 בדרך ג'ונגל בצ'יאנג מאי"
        )}
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover object-[30%_center] md:object-center"
        priority
        sizes="100vw"
      />

      {/* Bottom gradient overlay - stronger for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent md:from-primary/80 md:via-primary/30" />

      {/* Content — CSS stagger animation (respects prefers-reduced-motion) */}
      <div className="absolute bottom-0 left-0 right-0 pb-20 px-5 md:pb-24 md:px-12 lg:px-20 text-white">
        {/* Brand eyebrow — small, elegant */}
        <p className="text-xs md:text-sm font-semibold tracking-[0.25em] uppercase text-accent mb-3 md:mb-4 animate-hero-reveal [animation-delay:0.1s]">
          WIRO 4×4 &nbsp;·&nbsp;{" "}
          {t("Chiang Mai, Thailand", "צ'יאנג מאי, תאילנד")}
        </p>

        <h1 className="text-[clamp(2.25rem,1rem+5vw,4.75rem)] leading-[1.04] mb-4 md:mb-5 max-w-[22rem] sm:max-w-3xl lg:max-w-4xl text-balance drop-shadow-2xl animate-hero-reveal [animation-delay:0.2s]">
          {language === "he" ? (
            <>
              טיולי 4×4 <span className="text-accent">כשרים</span> בצ'יאנג מאי
            </>
          ) : (
            <>
              <span className="italic text-accent">Kosher</span> 4×4 Adventures
              in Chiang Mai
            </>
          )}
        </h1>

        <p className="text-sm min-[380px]:text-base md:text-lg lg:text-xl font-light text-white/90 mb-6 md:mb-8 max-w-[21rem] sm:max-w-xl drop-shadow-lg animate-hero-reveal [animation-delay:0.35s] relative">
          {t(
            "Private off-road routes with Hebrew-speaking guides, kosher meals, and Shabbat-friendly planning for families and groups.",
            "מסלולי שטח פרטיים עם מדריכים דוברי עברית, ארוחות כשרות ותכנון מותאם שבת למשפחות וקבוצות."
          )}
          <span className="absolute -bottom-3 start-0 h-[2px] w-14 bg-accent" />
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 md:mb-6 animate-hero-reveal [animation-delay:0.5s] mt-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackHeroAction("whatsapp")}
            className="min-h-12 bg-[#25D366] hover:bg-[#20BA5A] active:bg-[#1EA653] text-white font-bold px-8 py-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-2xl w-full sm:w-auto tracking-wide uppercase text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-primary"
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            {t("Check Availability on WhatsApp", "בדיקת זמינות בוואטסאפ")}
          </a>
          <button
            type="button"
            onClick={scrollToTours}
            className="min-h-12 text-white font-bold px-4 py-3 rounded-lg transition-all w-full sm:w-auto tracking-wide uppercase text-sm md:text-base hover:bg-white/10 underline decoration-accent underline-offset-8 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary"
          >
            {t("See Route Ideas", "רעיונות למסלולים")}
          </button>
        </div>

        <div className="max-w-[22rem] sm:max-w-2xl animate-hero-reveal [animation-delay:0.65s] space-y-3">
          <p className="text-sm md:text-base leading-relaxed text-white/85">
            {t(
              "Send dates, group size, pickup area, and kosher or Shabbat needs. We confirm availability and price personally in English or Hebrew.",
              "שלחו תאריכים, מספר מטיילים, אזור איסוף וצרכי כשרות או שבת. נאשר זמינות ומחיר אישית בעברית או באנגלית."
            )}
          </p>
          <div
            className="flex flex-wrap gap-2"
            aria-label={t(
              "Trip planning trust markers",
              "סימני אמון לתכנון הטיול"
            )}
          >
            {responseProof.map(item => (
              <span
                key={item.en}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-primary/45 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur"
              >
                <item.icon
                  className="h-3.5 w-3.5 text-accent"
                  aria-hidden="true"
                />
                {t(item.en, item.he)}
              </span>
            ))}
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
