import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { GoldDivider } from "@/components/GoldDivider";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";

interface FeaturedPhoto {
  id: number;
  title: string;
  imageUrl: string;
  category?: string;
}

interface FeaturedCarouselProps {
  photos: FeaturedPhoto[];
  onPhotoClick: (index: number) => void;
}

export function FeaturedCarousel({
  photos,
  onPhotoClick,
}: FeaturedCarouselProps) {
  const { t } = useLanguage();
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!api) return;
    setActiveIndex(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    setScrollSnaps(api.scrollSnapList());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", () => {
      setScrollSnaps(api.scrollSnapList());
      onSelect();
    });
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  if (photos.length === 0) return null;

  const isSingle = photos.length === 1;

  return (
    <section className="bg-[#1C1C1C] py-8 md:py-12">
      <div className="text-center max-w-3xl mx-auto mb-8 px-4">
        <h2 className="text-3xl md:text-4xl font-medium text-[#D4AF37]">
          {t("Featured Photos", "תמונות נבחרות")}
        </h2>
        <GoldDivider />
      </div>

      <div className="relative px-4 md:px-12">
        <Carousel
          opts={{
            align: "center",
            loop: !isSingle,
            slidesToScroll: 1,
          }}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent>
            {photos.map((photo, index) => (
              <CarouselItem
                key={photo.id}
                className={
                  isSingle ? "basis-full" : "basis-[85%] md:basis-[60%]"
                }
              >
                <button
                  type="button"
                  onClick={() => onPhotoClick(index)}
                  className={`relative w-full aspect-[16/9] overflow-hidden rounded-sm transition-all duration-300 block ${
                    index === activeIndex
                      ? "opacity-100 scale-100 border-2 border-[#D4AF37]"
                      : "opacity-50 scale-95 border-2 border-transparent"
                  }`}
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover rounded-sm"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-12 pb-4 px-4">
                    <p className="text-white text-sm md:text-base font-medium text-left">
                      {photo.title}
                    </p>
                  </div>
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>

          {!isSingle && (
            <>
              <CarouselPrevious className="bg-black/40 hover:bg-black/60 border-none text-white left-2 md:left-4" />
              <CarouselNext className="bg-black/40 hover:bg-black/60 border-none text-white right-2 md:right-4" />
            </>
          )}
        </Carousel>
      </div>

      {!isSingle && scrollSnaps.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === activeIndex ? "bg-[#D4AF37]" : "bg-white/30"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
