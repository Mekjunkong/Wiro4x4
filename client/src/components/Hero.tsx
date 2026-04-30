import { useRef } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { COMPANY_WHATSAPP_URL } from "@/const";
import { OptimizedImage } from "@/components/OptimizedImage";

const TRUST_ITEMS = [
  { en: "Hebrew Speaking", he: "דוברי עברית" },
  { en: "Kosher Meals", he: "ארוחות כשרות" },
  { en: "Shabbat Friendly", he: "שומרי שבת" },
  { en: "Private Tours", he: "טיולים פרטיים" },
];

export function Hero() {
  const { t, language } = useLanguage();
  const chevronRef = useRef<HTMLDivElement>(null);

  const whatsappMessage =
    language === "he"
      ? encodeURIComponent(
          "שלום, אני מעוניין/ת בטיול שטח בצ'יאנג מאי. אשמח לפרטים נוספים!"
        )
      : encodeURIComponent(
          "Hi! I'm interested in an off-road tour in Chiang Mai. Can you tell me more?"
        );

  const whatsappUrl = `${COMPANY_WHATSAPP_URL}?text=${whatsappMessage}`;

  const scrollToTours = () => {
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent md:from-black/80 md:via-black/30" />

      {/* Content — CSS stagger animation (respects prefers-reduced-motion) */}
      <div className="absolute bottom-0 left-0 right-0 pb-20 px-5 md:pb-24 md:px-12 lg:px-20 text-white">
        {/* Brand eyebrow — small, elegant */}
        <p className="text-xs md:text-sm font-semibold tracking-[0.25em] uppercase text-accent mb-3 md:mb-4 animate-hero-reveal [animation-delay:0.1s]">
          WIRO 4×4 &nbsp;·&nbsp;{" "}
          {t("Chiang Mai, Thailand", "צ'יאנג מאי, תאילנד")}
        </p>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-3 md:mb-4 max-w-2xl drop-shadow-2xl animate-hero-reveal [animation-delay:0.2s]">
          {t("Adventures Made for Families", "הרפתקאות שנוצרו למשפחות")}
        </h1>

        <p className="text-base md:text-lg lg:text-xl font-normal text-white/85 mb-6 md:mb-8 max-w-xl drop-shadow-lg animate-hero-reveal [animation-delay:0.35s] relative">
          {t(
            "Explore Northern Thailand with Hebrew-speaking guides, kosher meals & full Shabbat support",
            "גלו את צפון תאילנד עם מדריכים דוברי עברית, ארוחות כשרות ותמיכה מלאה בשבת"
          )}
          <span className="absolute -bottom-3 left-0 h-[2px] w-14 bg-accent" />
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6 md:mb-8 animate-hero-reveal [animation-delay:0.5s] mt-4">
          <button
            onClick={scrollToTours}
            className="bg-accent hover:bg-accent/90 active:bg-accent/80 text-[#1c1c1c] font-bold px-8 py-4 text-lg rounded-lg transition-all shadow-2xl w-full sm:w-auto tracking-wide uppercase text-sm md:text-base"
          >
            {t("Explore Tours", "גלו את הטיולים")}
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-white hover:bg-white/20 active:bg-white/30 text-white font-bold px-8 py-4 text-lg rounded-lg transition-all flex items-center justify-center gap-2 shadow-2xl w-full sm:w-auto tracking-wide uppercase text-sm md:text-base"
          >
            <MessageCircle className="w-5 h-5" />
            {t("WhatsApp Us", "דברו איתנו בוואטסאפ")}
          </a>
        </div>

        {/* Gold separator */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent mb-4 animate-hero-reveal [animation-delay:0.6s]" />

        <div className="flex flex-wrap gap-2 md:gap-2.5 animate-hero-reveal [animation-delay:0.7s]">
          {TRUST_ITEMS.map(item => (
            <span
              key={item.en}
              className="bg-white/10 backdrop-blur-md text-white text-sm font-medium px-4 py-2 md:text-sm md:px-4 md:py-1.5 rounded-full border border-white/20 shadow-lg"
            >
              {t(item.en, item.he)}
            </span>
          ))}
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
