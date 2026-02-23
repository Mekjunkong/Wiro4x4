import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_NUMBER } from "@/const";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

/* ─── Slide Data ─── */
const SLIDES = [
  {
    webp: "/images/optimized/hero-wiro.webp",
    jpg: "/images/optimized/hero-wiro.jpg",
    alt: "WIRO 4x4 Indochina Adventure — Off-road in Chiang Mai",
    taglineEn: "Kosher Off-Road Adventures",
    taglineHe: "טיולי שטח כשרים",
    infoEn: "Chiang Mai, Thailand",
    infoHe: "צ'יאנג מאי, תאילנד",
  },
  {
    webp: "/images/optimized/accessible_doi_inthanon_summit.webp",
    jpg: "/images/optimized/accessible_doi_inthanon_summit.jpg",
    alt: "Doi Inthanon Summit — Highest peak in Thailand",
    taglineEn: "Conquer the Roof of Thailand",
    taglineHe: "כבשו את גג תאילנד",
    infoEn: "Doi Inthanon · Full Day",
    infoHe: "דוי אינתנון · יום שלם",
  },
  {
    webp: "/images/optimized/sticky_waterfalls.webp",
    jpg: "/images/optimized/sticky_waterfalls.jpg",
    alt: "Sticky Waterfalls — Walk up a waterfall in Chiang Mai",
    taglineEn: "Walk Up a Waterfall",
    taglineHe: "טיפסו על מפל מים",
    infoEn: "Maerim Sticky Falls · Half Day",
    infoHe: "מפלי סטיקי מארים · חצי יום",
  },
] as const;

const AUTOPLAY_DELAY = 6000;

export function Hero() {
  const { t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  /* ─── Embla Carousel ─── */
  const autoplayPlugin = useRef(
    Autoplay({
      delay: AUTOPLAY_DELAY,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    autoplayPlugin.current,
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  /* ─── GSAP Entrance Animation ─── */
  const titleRef = useRef<HTMLHeadingElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const infoRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const refs = [titleRef, dividerRef, taglineRef, infoRef, ctaRef, trustRef];

    if (prefersReducedMotion) {
      refs.forEach(ref => {
        if (ref.current) {
          ref.current.style.opacity = "1";
          ref.current.style.transform = "none";
        }
      });
      return;
    }

    gsap.set(titleRef.current, { y: 30, opacity: 0 });
    gsap.set(dividerRef.current, { scaleX: 0 });
    gsap.set(taglineRef.current, { y: 20, opacity: 0 });
    gsap.set(infoRef.current, { y: 20, opacity: 0 });
    gsap.set(ctaRef.current, { opacity: 0 });
    gsap.set(trustRef.current, { opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.to(titleRef.current, { y: 0, opacity: 1, duration: 0.8 })
      .to(dividerRef.current, { scaleX: 1, duration: 0.6 }, "-=0.3")
      .to(taglineRef.current, { y: 0, opacity: 1, duration: 0.6 }, "-=0.1")
      .to(infoRef.current, { y: 0, opacity: 1, duration: 0.6 }, "-=0.3")
      .to(ctaRef.current, { opacity: 1, duration: 0.5 }, "-=0.2")
      .to(trustRef.current, { opacity: 1, duration: 0.5 }, "-=0.2");

    return () => {
      tl.kill();
    };
  }, []);

  /* ─── Handlers ─── */
  const handleBookNow = () => {
    document.getElementById("tours")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      t(
        "Hi WIRO 4x4 – I want to book a Kosher tour.",
        "היי WIRO 4x4 -- אשמח לשמוע על הטיולים הכשרים שלכם."
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

  const currentSlide = SLIDES[selectedIndex];

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ─── Background Carousel ─── */}
      <div className="absolute inset-0 z-0" ref={emblaRef}>
        <div className="hero-carousel-fade embla__container h-full">
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className={`embla__slide h-full ${i === selectedIndex ? "embla__slide--active" : ""}`}
            >
              <picture>
                <source srcSet={slide.webp} type="image/webp" />
                <img
                  src={slide.jpg}
                  alt={slide.alt}
                  className="w-full h-full object-cover scale-105"
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : undefined}
                />
              </picture>
            </div>
          ))}
        </div>
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* ─── Navigation Arrows (desktop hover) ─── */}
      <button
        onClick={scrollPrev}
        className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-white/30 text-white/70 hover:text-white hover:border-white/60 transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={scrollNext}
        className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-white/30 text-white/70 hover:text-white hover:border-white/60 transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* ─── Content Overlay ─── */}
      <div className="container relative z-10 text-white py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title */}
          <h1
            ref={titleRef}
            className="text-white leading-[0.9] tracking-wide"
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(5rem, 12vw, 12rem)",
              opacity: 0,
            }}
          >
            WIRO 4×4
          </h1>

          {/* Gold Divider */}
          <div
            ref={dividerRef}
            className="h-1 w-24 bg-[#D4AF37] mx-auto"
            style={{ transform: "scaleX(0)" }}
          />

          {/* Tagline — changes per slide */}
          <p
            ref={taglineRef}
            className="text-xl sm:text-2xl md:text-3xl uppercase tracking-[0.25em] font-medium text-white/90"
            style={{ fontFamily: "'Oswald', sans-serif", opacity: 0 }}
          >
            {t(currentSlide.taglineEn, currentSlide.taglineHe)}
          </p>

          {/* Tour Info — changes per slide */}
          <p
            ref={infoRef}
            className="text-2xl sm:text-3xl md:text-4xl text-white/90"
            style={{ opacity: 0 }}
          >
            {t(currentSlide.infoEn, currentSlide.infoHe)}
          </p>

          {/* CTAs */}
          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row gap-4 pt-4 justify-center items-center"
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
          </div>

          {/* Trust Indicators */}
          <div
            ref={trustRef}
            className="flex flex-wrap items-center gap-3 pt-8 justify-center"
            style={{ opacity: 0 }}
          >
            {trustItems.map((item, index) => (
              <span
                key={index}
                className="px-4 py-1.5 border border-[#D4AF37]/40 rounded-full text-xs uppercase tracking-[0.15em] text-[#D4AF37]"
              >
                {item}
              </span>
            ))}
          </div>

          {/* Dot Navigation */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === selectedIndex
                    ? "bg-[#D4AF37] scale-125"
                    : "bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Progress Bar ─── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/10">
        <div
          key={selectedIndex}
          className={`h-full bg-[#D4AF37] hero-progress-bar ${isHovered ? "hero-progress-bar--paused" : ""}`}
        />
      </div>

      {/* ─── Scroll Indicator ─── */}
      <div className="absolute bottom-12 z-10 animate-subtle-pulse left-1/2 -translate-x-1/2">
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
