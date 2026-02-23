import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import useEmblaCarousel from "embla-carousel-react";
import { trpc } from "@/lib/trpc";

interface Photo {
  src: string;
  fallback: string;
  caption: string;
}

export function PhotoGallery() {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>({ y: 40, duration: 0.6 });

  const FALLBACK_PHOTOS: Photo[] = [
    {
      src: "/images/optimized/hero-waterfall.webp",
      fallback: "/images/hero-waterfall.jpg",
      caption: t(
        "Chasing waterfalls in Chiang Mai",
        "רודפים אחרי מפלים בצ'יאנג מאי"
      ),
    },
    {
      src: "/images/optimized/1000000135.webp",
      fallback: "/images/1000000135.jpg",
      caption: t("Off-road through the jungle", "שטח דרך הג'ונגל"),
    },
    {
      src: "/images/optimized/1000000149.webp",
      fallback: "/images/1000000149.jpg",
      caption: t("Hidden mountain villages", "כפרים נסתרים בהרים"),
    },
    {
      src: "/images/optimized/1000000126_compressed.webp",
      fallback: "/images/1000000126_compressed.jpg",
      caption: t("Sticky Waterfalls adventure", "הרפתקה במפלים הדביקים"),
    },
    {
      src: "/images/optimized/1000000140.webp",
      fallback: "/images/1000000140.jpg",
      caption: t("Scenic mountain roads", "כבישים ציוריים בהרים"),
    },
    {
      src: "/images/optimized/vietnam_rice_terraces.webp",
      fallback: "/images/vietnam_rice_terraces.jpg",
      caption: t("Rice terrace viewpoints", "תצפיות על מדרגות אורז"),
    },
  ];

  const { data: dbPhotos } = trpc.gallery.list.useQuery();

  const photos: Photo[] =
    dbPhotos && dbPhotos.length > 0
      ? dbPhotos.map(p => ({
          src: p.s3Url,
          fallback: p.s3Url,
          caption: t(
            p.title || "",
            ((p as Record<string, unknown>).titleHe as string) || p.title || ""
          ),
        }))
      : FALLBACK_PHOTOS;

  // Track which images failed to load
  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set());
  const handleImageError = useCallback((index: number) => {
    setBrokenImages(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
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

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-[#0F0F0F]">
      <div className="container">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 px-4">
          <h2 className="text-4xl md:text-5xl font-medium mb-6 text-white">
            {t("Adventure Highlights", "רגעי שיא מההרפתקה")}
          </h2>
          <GoldDivider />
        </div>

        {/* Carousel */}
        <div className="relative">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="flex-[0_0_100%] min-w-0"
                  style={
                    brokenImages.has(index) ? { display: "none" } : undefined
                  }
                >
                  <div className="relative aspect-[16/9] max-h-[500px] overflow-hidden">
                    <picture>
                      <source srcSet={photo.src} type="image/webp" />
                      <img
                        src={photo.fallback}
                        alt={photo.caption}
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding={index === 0 ? "sync" : "async"}
                        fetchPriority={index === 0 ? "high" : undefined}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(index)}
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
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 hidden md:flex items-center justify-center w-10 h-10 bg-[#1C1C1C] border border-[#D4AF37]/30 rounded-full text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1C1C1C] transition-colors"
            aria-label={t("Previous", "הקודם")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 hidden md:flex items-center justify-center w-10 h-10 bg-[#1C1C1C] border border-[#D4AF37]/30 rounded-full text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1C1C1C] transition-colors"
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
                index === selectedIndex ? "bg-[#D4AF37]" : "bg-[#2A2A25]"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
