import { useRef } from "react";
import {
  ChevronDown,
  MessageCircle,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { COMPANY_WHATSAPP_URL } from "@/const";
import { OptimizedImage } from "@/components/OptimizedImage";
import { trackEvent } from "@/lib/analytics";

const TRUST_ITEMS = [
  { en: "Hebrew Speaking", he: "דוברי עברית" },
  { en: "Kosher Meals", he: "ארוחות כשרות" },
  { en: "Shabbat Friendly", he: "שומרי שבת" },
  { en: "Private Tours", he: "טיולים פרטיים" },
];

const PLANNING_PROOF = [
  {
    en: "Private route before payment",
    he: "מסלול פרטי לפני תשלום",
  },
  {
    en: "Kosher logistics confirmed early",
    he: "תיאום כשרות מראש",
  },
  {
    en: "Hebrew support on WhatsApp",
    he: "ליווי בעברית בוואטסאפ",
  },
];

export function Hero() {
  const { t, language } = useLanguage();
  const chevronRef = useRef<HTMLDivElement>(null);

  const whatsappMessage =
    language === "he"
      ? encodeURIComponent(
          "שלום, אנחנו רוצים לבדוק זמינות ומחיר לטיול 4x4 פרטי בצ'יאנג מאי. תאריכים/גודל קבוצה:"
        )
      : encodeURIComponent(
          "Hi WIRO, we'd like to check availability and price for a private 4x4 tour in Chiang Mai. Dates/group size:"
        );

  const whatsappUrl = `${COMPANY_WHATSAPP_URL}?text=${whatsappMessage}`;

  const trackHeroAction = (action: string) => {
    trackEvent("hero_cta_click", { action, language });
  };

  const scrollToTours = () => {
    trackHeroAction("view_tours");
    document.getElementById("tours")?.scrollIntoView({ behavior: "smooth" });
  };

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
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-16 text-white md:px-12 md:pb-20 lg:px-20 lg:pb-24">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
          <div>
            {/* Brand eyebrow — small, elegant */}
            <p className="type-label text-accent mb-3 md:mb-4 animate-hero-reveal [animation-delay:0.1s]">
              WIRO 4×4 &nbsp;·&nbsp;{" "}
              {t("Chiang Mai, Thailand", "צ'יאנג מאי, תאילנד")}
            </p>

            <h1 className="type-display mb-4 max-w-3xl drop-shadow-2xl animate-hero-reveal [animation-delay:0.2s]">
              {t(
                "Kosher 4×4 Adventures in Chiang Mai",
                "טיולי 4×4 כשרים בצ'יאנג מאי"
              )}
            </h1>

            <p className="type-lede font-normal text-white/90 mb-6 md:mb-8 drop-shadow-lg animate-hero-reveal [animation-delay:0.35s] relative">
              {t(
                "Private off-road routes with Hebrew-speaking guides, kosher meals, and Shabbat-friendly planning for families and groups.",
                "מסלולי שטח פרטיים עם מדריכים דוברי עברית, ארוחות כשרות ותכנון מותאם שבת למשפחות וקבוצות."
              )}
              <span className="absolute -bottom-3 left-0 h-[2px] w-14 bg-accent" />
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5 md:mb-6 animate-hero-reveal [animation-delay:0.5s] mt-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackHeroAction("whatsapp")}
                className="bg-accent-cta hover:bg-accent-cta-hover active:bg-accent-cta-hover text-white font-bold px-8 py-4 rounded-sm transition-all flex min-h-12 items-center justify-center gap-2 shadow-2xl w-full sm:w-auto tracking-wide uppercase text-sm md:text-base"
              >
                <MessageCircle className="w-5 h-5" />
                {t("Ask Availability on WhatsApp", "בדקו זמינות בוואטסאפ")}
              </a>
              <a
                href="#inquiry"
                onClick={() => trackHeroAction("quote")}
                className="border border-white/45 bg-white/5 hover:bg-white/10 active:bg-white/15 text-white font-bold px-8 py-4 rounded-sm transition-all flex min-h-12 items-center justify-center gap-2 shadow-2xl w-full sm:w-auto tracking-wide uppercase text-sm md:text-base"
              >
                <Calendar className="w-5 h-5" />
                {t("Quick Quote", "הצעה מהירה")}
              </a>
              <button
                type="button"
                onClick={scrollToTours}
                className="min-h-12 text-white/80 hover:text-white text-sm tracking-wide underline-offset-4 hover:underline transition-colors w-full sm:w-auto text-center sm:text-left"
              >
                {t("See tours ↓", "ראו טיולים ↓")}
              </button>
            </div>

            <p className="type-caps max-w-xl text-[0.72rem] text-white/70 animate-hero-reveal [animation-delay:0.58s]">
              {t(
                "Private tours · Hebrew-speaking guide · Kosher planning",
                "טיולים פרטיים · מדריך דובר עברית · תכנון כשר"
              )}
            </p>

            <div className="w-full max-w-2xl h-px bg-accent/55 mb-4 mt-5 animate-hero-reveal [animation-delay:0.6s]" />

            <div className="flex flex-wrap gap-2 md:gap-2.5 animate-hero-reveal [animation-delay:0.7s]">
              {TRUST_ITEMS.map(item => (
                <span
                  key={item.en}
                  className="bg-primary/45 text-white text-sm font-medium px-4 py-2 md:text-sm md:px-4 md:py-1.5 rounded-sm border border-accent/25 shadow-lg"
                >
                  {t(item.en, item.he)}
                </span>
              ))}
            </div>
          </div>

          <aside className="hidden lg:block animate-hero-reveal [animation-delay:0.65s]">
            <div className="border border-accent/35 bg-primary/72 px-5 py-5 text-white shadow-2xl backdrop-blur-sm">
              <p className="type-caps text-[0.68rem] text-accent">
                {t("Before you book", "לפני שמזמינים")}
              </p>
              <p className="mt-2 font-heading text-2xl leading-tight">
                {t(
                  "We confirm the route, meals, and timing first.",
                  "קודם סוגרים מסלול, אוכל וזמנים."
                )}
              </p>
              <ul className="mt-4 space-y-3">
                {PLANNING_PROOF.map(item => (
                  <li
                    key={item.en}
                    className="flex items-start gap-3 text-sm text-white/82"
                  >
                    <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-accent" />
                    <span>{t(item.en, item.he)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Animated scroll chevron */}
      <div
        ref={chevronRef}
        className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-1 cursor-pointer group"
        onClick={scrollToTours}
      >
        <span className="text-white/50 text-xs tracking-[0.2em] uppercase">
          Scroll
        </span>
        <ChevronDown className="w-6 h-6 text-accent animate-hero-chevron" />
      </div>
    </section>
  );
}
