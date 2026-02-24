import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import useEmblaCarousel from "embla-carousel-react";

interface Photo {
  src: string;
  fallback: string;
  caption: string;
}

export function PhotoGallery() {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>({ y: 40, duration: 0.6 });

  // Curated highlights — always used (DB gallery is for /gallery page)
  const photos: Photo[] = [
    {
      src: "/images/optimized/guide_wiro.webp",
      fallback: "/images/optimized/guide_wiro.jpg",
      caption: t(
        "Meet Guide Wiro — your adventure starts here",
        "הכירו את המדריך וירו — ההרפתקה מתחילה כאן"
      ),
    },
    {
      src: "/images/optimized/tourists_with_4x4.webp",
      fallback: "/images/optimized/tourists_with_4x4.jpg",
      caption: t("Your off-road adventure awaits", "הרפתקת השטח שלכם מחכה"),
    },
    {
      src: "/images/optimized/wiro_waterfall.webp",
      fallback: "/images/optimized/wiro_waterfall.jpg",
      caption: t(
        "Chasing waterfalls in the highlands",
        "מרדף אחרי מפלים ברמות"
      ),
    },
    {
      src: "/images/optimized/elephant_encounter.webp",
      fallback: "/images/optimized/elephant_encounter.jpg",
      caption: t("Elephant encounters in Mae Wang", "מפגש עם פילים במאה וואנג"),
    },
    {
      src: "/images/optimized/bamboo_rafting.webp",
      fallback: "/images/optimized/bamboo_rafting.jpg",
      caption: t(
        "Bamboo rafting through the jungle",
        "שייט על רפסודות במבוק בג'ונגל"
      ),
    },
    {
      src: "/images/optimized/mountain_sunset.webp",
      fallback: "/images/optimized/mountain_sunset.jpg",
      caption: t(
        "Sunset over the Chiang Mai mountains",
        "שקיעה מעל הרי צ'יאנג מאי"
      ),
    },
    {
      src: "/images/optimized/kosher_meal.webp",
      fallback: "/images/optimized/kosher_meal.jpg",
      caption: t("Kosher meals prepared fresh", "ארוחות כשרות טריות"),
    },
    {
      src: "/images/optimized/cave_boat.webp",
      fallback: "/images/optimized/cave_boat.jpg",
      caption: t("Explore hidden caves by boat", "גלו מערות נסתרות בסירה"),
    },
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    slidesToScroll: 1,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset auto-advance timer (called after any manual interaction)
  const resetAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    if (!emblaApi) return;
    autoplayRef.current = setInterval(() => emblaApi.scrollNext(), 5000);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
    resetAutoplay();
  }, [emblaApi, resetAutoplay]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
    resetAutoplay();
  }, [emblaApi, resetAutoplay]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
      resetAutoplay();
    },
    [emblaApi, resetAutoplay]
  );

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Auto-advance every 5 seconds (resets on manual interaction)
  useEffect(() => {
    if (!emblaApi) return;
    autoplayRef.current = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [emblaApi]);

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-background">
      <div className="container">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 px-4">
          <h2 className="text-4xl md:text-5xl font-medium mb-6 text-foreground">
            {t("Adventure Highlights", "רגעי שיא מההרפתקה")}
          </h2>
          <GoldDivider />
        </div>

        {/* Carousel */}
        <div className="relative">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {photos.map((photo, index) => (
                <div key={index} className="flex-[0_0_100%] min-w-0 px-4">
                  <div className="relative aspect-[16/9] max-h-[500px] mx-auto overflow-hidden rounded-lg">
                    <picture>
                      <source srcSet={photo.src} type="image/webp" />
                      <img
                        src={photo.fallback}
                        alt={photo.caption}
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding={index === 0 ? "sync" : "async"}
                        fetchPriority={index === 0 ? "high" : undefined}
                        className="w-full h-full object-cover object-center"
                      />
                    </picture>

                    {/* Caption overlay with gradient */}
                    {photo.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-16 pb-6 px-6">
                        <p className="text-white text-lg md:text-xl font-medium">
                          {photo.caption}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arrows — hidden on mobile, visible on md+ */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 hidden md:flex items-center justify-center w-10 h-10 bg-card border border-[#D4AF37]/30 rounded-full text-[#D4AF37] hover:bg-[#D4AF37] hover:text-card transition-colors"
            aria-label={t("Previous", "הקודם")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 hidden md:flex items-center justify-center w-10 h-10 bg-card border border-[#D4AF37]/30 rounded-full text-[#D4AF37] hover:bg-[#D4AF37] hover:text-card transition-colors"
            aria-label={t("Next", "הבא")}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === selectedIndex ? "bg-[#D4AF37]" : "bg-muted"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
