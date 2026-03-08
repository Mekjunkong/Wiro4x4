import { useRef, useEffect } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { COMPANY_WHATSAPP_URL } from "@/const";
import { OptimizedImage } from "@/components/OptimizedImage";
import gsap from "gsap";

const TRUST_ITEMS = [
  { en: "Hebrew Speaking", he: "דוברי עברית" },
  { en: "Kosher Meals", he: "ארוחות כשרות" },
  { en: "Shabbat Friendly", he: "שומרי שבת" },
  { en: "Private Tours", he: "טיולים פרטיים" },
];

export function Hero() {
  const { t, language } = useLanguage();
  const contentRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLDivElement>(null);

  const whatsappMessage =
    language === "he"
      ? encodeURIComponent(
          "שלום, אני מעוניין/ת בטיול שטח בצ'יאנג מאי. אשמח לפרטים נוספים!"
        )
      : encodeURIComponent(
          "Hi! I'm interested in an off-road tour in Chiang Mai. Can you tell me more?"
        );

  const whatsappUrl = `${COMPANY_WHATSAPP_URL}&text=${whatsappMessage}`;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion || !contentRef.current) return;

    const children = contentRef.current.children;
    gsap.set(children, { y: 30, opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.to(children[0], { y: 0, opacity: 1, duration: 0.8 })
      .to(children[1], { y: 0, opacity: 1, duration: 0.6 }, "-=0.3")
      .to(children[2], { y: 0, opacity: 1, duration: 0.6 }, "-=0.2")
      .to(children[3], { y: 0, opacity: 1, duration: 0.5 }, "-=0.2")
      .to(children[4], { y: 0, opacity: 1, duration: 0.5 }, "-=0.2");

    return () => {
      tl.kill();
    };
  }, []);

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

      {/* Content */}
      <div
        ref={contentRef}
        className="absolute bottom-0 left-0 right-0 pb-20 px-5 md:pb-24 md:px-12 lg:px-20 text-white"
      >
        {/* Heading - larger on mobile, better contrast */}
        <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-3 md:mb-4 drop-shadow-2xl">
          WIRO 4×4
        </h1>

        {/* Subtitle - better mobile sizing */}
        <p className="text-xl md:text-2xl lg:text-3xl font-medium mb-6 md:mb-8 max-w-2xl drop-shadow-lg">
          {t(
            "Kosher Off-Road Adventures in Chiang Mai",
            "הרפתקאות שטח כשרות בצ'יאנג מאי"
          )}
        </p>

        {/* CTAs - better mobile touch targets */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 md:mb-8">
          <button
            onClick={scrollToTours}
            className="bg-[#B8960F] hover:bg-[#a3850e] active:bg-[#8f7509] text-white font-bold px-8 py-4 text-lg md:px-8 md:py-3 md:text-lg rounded-lg transition-colors shadow-2xl w-full sm:w-auto"
          >
            {t("Explore Tours", "גלו את הטיולים")}
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-white hover:bg-white/20 active:bg-white/30 text-white font-bold px-8 py-4 text-lg md:px-8 md:py-3 md:text-lg rounded-lg transition-colors flex items-center justify-center gap-2 shadow-2xl w-full sm:w-auto"
          >
            <MessageCircle className="w-6 h-6" />
            {t("WhatsApp Us", "דברו איתנו בוואטסאפ")}
          </a>
        </div>

        {/* Trust badge pills - larger and more readable on mobile */}
        <div className="flex flex-wrap gap-2 md:gap-2.5">
          {TRUST_ITEMS.map(item => (
            <span
              key={item.en}
              className="bg-white/20 backdrop-blur-md text-white text-sm font-medium px-4 py-2 md:text-sm md:px-4 md:py-1.5 rounded-full border border-white/30 shadow-lg"
            >
              {t(item.en, item.he)}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll chevron */}
      <div
        ref={chevronRef}
        className="hidden md:block absolute bottom-6 left-1/2 -translate-x-1/2 animate-subtle-pulse cursor-pointer"
        onClick={scrollToTours}
      >
        <ChevronDown className="w-8 h-8 text-white/70" />
      </div>
    </section>
  );
}
