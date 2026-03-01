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
      {/* Background image */}
      <OptimizedImage
        src="banner"
        alt={t(
          "Travelers with WIRO 4x4 vehicle on jungle road in Chiang Mai",
          "מטיילים עם רכב WIRO 4x4 בדרך ג'ונגל בצ'יאנג מאי"
        )}
        className="absolute inset-0 w-full h-full object-cover"
        priority
        sizes="100vw"
      />

      {/* Bottom gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content */}
      <div
        ref={contentRef}
        className="absolute bottom-0 left-0 right-0 pb-24 px-6 md:px-12 lg:px-20 text-white"
      >
        {/* Heading */}
        <h1 className="font-heading text-4xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4">
          WIRO 4×4
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-2xl lg:text-3xl font-light mb-8 max-w-2xl opacity-90">
          {t(
            "Kosher Off-Road Adventures in Chiang Mai",
            "הרפתקאות שטח כשרות בצ'יאנג מאי"
          )}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={scrollToTours}
            className="bg-[#d4af37] hover:bg-[#c5a033] text-white font-bold px-6 py-2.5 text-base md:px-8 md:py-3 md:text-lg rounded-lg transition-colors shadow-lg"
          >
            {t("Explore Tours", "גלו את הטיולים")}
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-white/80 hover:bg-white/10 text-white font-bold px-6 py-2.5 text-base md:px-8 md:py-3 md:text-lg rounded-lg transition-colors flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            {t("WhatsApp Us", "דברו איתנו בוואטסאפ")}
          </a>
        </div>

        {/* Trust badge pills */}
        <div className="flex flex-wrap gap-2">
          {TRUST_ITEMS.map(item => (
            <span
              key={item.en}
              className="bg-white/15 backdrop-blur-sm text-white text-xs px-3 py-1 md:text-sm md:px-4 md:py-1.5 rounded-full border border-white/20"
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
