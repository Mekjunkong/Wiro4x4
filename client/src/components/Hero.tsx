import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_NUMBER } from "@/const";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Calculator } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const HERO_IMAGE = {
  webp: "/images/optimized/hero-waterfall.webp",
  jpg: "/images/optimized/hero-waterfall.jpg",
  alt: "Chiang Mai Waterfall Adventure",
};

export function Hero() {
  const { t } = useLanguage();

  const heroContentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const valuePropRef = useRef<HTMLParagraphElement>(null);
  const locationRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Show everything immediately — no GSAP
      [
        titleRef,
        dividerRef,
        taglineRef,
        valuePropRef,
        locationRef,
        ctaRef,
        trustRef,
      ].forEach(ref => {
        if (ref.current) {
          ref.current.style.opacity = "1";
          ref.current.style.transform = "none";
        }
      });
      if (dividerRef.current) {
        dividerRef.current.style.transform = "scaleX(1)";
      }
      return;
    }

    // Set initial states
    gsap.set(titleRef.current, { y: 30, opacity: 0 });
    gsap.set(dividerRef.current, { scaleX: 0 });
    gsap.set(taglineRef.current, { y: 20, opacity: 0 });
    gsap.set(valuePropRef.current, { y: 20, opacity: 0 });
    gsap.set(locationRef.current, { y: 20, opacity: 0 });
    gsap.set(ctaRef.current, { opacity: 0 });
    gsap.set(trustRef.current, { opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    tl.to(titleRef.current, { y: 0, opacity: 1, duration: 0.8 })
      .to(dividerRef.current, { scaleX: 1, duration: 0.6 }, "-=0.3")
      .to(taglineRef.current, { y: 0, opacity: 1, duration: 0.6 }, "-=0.1")
      .to(valuePropRef.current, { y: 0, opacity: 1, duration: 0.5 }, "-=0.2")
      .to(locationRef.current, { y: 0, opacity: 1, duration: 0.6 }, "-=0.3")
      .to(ctaRef.current, { opacity: 1, duration: 0.5 }, "-=0.2")
      .to(trustRef.current, { opacity: 1, duration: 0.5 }, "-=0.2");

    return () => {
      tl.kill();
    };
  }, []);

  const handleBookNow = () => {
    const element = document.getElementById("tours");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      t(
        "Hi WIRO 4x4 – I want to book a Kosher tour.",
        "היי WIRO 4x4 — אשמח לשמוע על הטיולים הכשרים שלכם."
      )
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const trustItems = [
    t("Hebrew Speaking", "דוברי עברית"),
    t("Kosher Meals Available", "ארוחות כשרות"),
    t("Shabbat Friendly", "מותאם לשומרי שבת"),
    t("Private Tours", "טיולים פרטיים"),
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Ken Burns Effect */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source srcSet={HERO_IMAGE.webp} type="image/webp" />
          <img
            src={HERO_IMAGE.jpg}
            alt={HERO_IMAGE.alt}
            className="w-full h-full object-cover animate-ken-burns"
            loading="eager"
            fetchPriority="high"
          />
        </picture>
        {/* Dual gradient overlay — left-to-right + bottom-to-top */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div
        ref={heroContentRef}
        className="container relative z-10 text-left text-white py-20"
      >
        <div className="max-w-3xl space-y-6">
          {/* Title */}
          <h1
            ref={titleRef}
            className="font-bold text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wide text-white leading-[0.9]"
            style={{ opacity: 0 }}
          >
            {t("WIRO", "WIRO")}
            <br />
            {t("4\u00D74", "4\u00D74")}
          </h1>

          {/* Gold Divider */}
          <div
            ref={dividerRef}
            className="h-0.5 w-16 bg-[#D4AF37]"
            style={{ transform: "scaleX(0)" }}
          />

          {/* Tagline */}
          <p
            ref={taglineRef}
            className="text-sm sm:text-base uppercase tracking-[0.25em] font-medium text-white/90"
            style={{ fontFamily: "'Oswald', sans-serif", opacity: 0 }}
          >
            {t("Kosher Off-Road Adventures", "טיולי שטח כשרים")}
          </p>

          {/* Value Proposition */}
          <p
            ref={valuePropRef}
            className="text-base sm:text-lg text-[#D4AF37] font-normal tracking-wide"
            style={{ opacity: 0 }}
          >
            {t(
              "The only kosher 4×4 experience in Southeast Asia",
              "חוויית השטח הכשרה היחידה בדרום-מזרח אסיה"
            )}
          </p>

          {/* Location */}
          <p
            ref={locationRef}
            className="text-lg sm:text-xl md:text-2xl text-white/90 font-light"
            style={{ opacity: 0 }}
          >
            {t("in Chiang Mai", "בצ'יאנג מאי")}
          </p>

          {/* CTAs */}
          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row gap-4 items-start pt-4"
            style={{ opacity: 0 }}
          >
            <Button
              variant="hero-primary"
              size="xl"
              onClick={handleBookNow}
              className="gap-3 w-full sm:w-auto"
            >
              {t("Book Your Adventure", "הזמינו עכשיו")}
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              variant="hero-secondary"
              size="xl"
              onClick={handleWhatsApp}
              className="gap-3 w-full sm:w-auto"
            >
              <MessageCircle className="h-5 w-5" />
              {t("WhatsApp Concierge", "שלחו לנו וואטסאפ")}
            </Button>
            <Button
              variant="hero-secondary"
              size="xl"
              onClick={() => (window.location.href = "/estimate")}
              className="gap-3 w-full sm:w-auto border-[#D4AF37]/40"
            >
              <Calculator className="h-5 w-5" />
              {t("Estimate Your Trip", "חשבו את העלות")}
            </Button>
          </div>

          {/* Trust Indicators */}
          <div
            ref={trustRef}
            className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-8 text-xs uppercase tracking-[0.15em] text-[#D4AF37]"
            style={{ opacity: 0 }}
          >
            {trustItems.map((item, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 && (
                  <span className="text-white/40" aria-hidden="true">
                    |
                  </span>
                )}
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-8 sm:left-12 md:left-16 z-10 animate-subtle-pulse">
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-white/60">
            {t("Discover", "גלו")}
          </span>
          <div className="w-px h-8 bg-[#D4AF37]/60 mx-auto" />
        </div>
      </div>
    </section>
  );
}
