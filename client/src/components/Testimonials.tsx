import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Star, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import useEmblaCarousel from "embla-carousel-react";
import { trpc } from "@/lib/trpc";

const FALLBACK_TESTIMONIALS = [
  {
    name: "David & Sarah Cohen",
    location: "Tel Aviv, Israel",
    locationHe:
      "\u05ea\u05dc \u05d0\u05d1\u05d9\u05d1, \u05d9\u05e9\u05e8\u05d0\u05dc",
    rating: 5,
    text: "WIRO 4x4 exceeded all expectations! The kosher meals were fresh and delicious, our guide spoke perfect Hebrew, and the waterfalls were absolutely stunning. Highly recommend!",
    textHe:
      "WIRO 4x4 \u05e2\u05dc\u05d5 \u05e2\u05dc \u05db\u05dc \u05d4\u05e6\u05d9\u05e4\u05d9\u05d5\u05ea! \u05d4\u05d0\u05d5\u05db\u05dc \u05d4\u05db\u05e9\u05e8 \u05d4\u05d9\u05d4 \u05d8\u05e8\u05d9 \u05d5\u05d8\u05e2\u05d9\u05dd, \u05d4\u05de\u05d3\u05e8\u05d9\u05da \u05d3\u05d9\u05d1\u05e8 \u05e2\u05d1\u05e8\u05d9\u05ea \u05de\u05d5\u05e9\u05dc\u05de\u05ea, \u05d5\u05d4\u05de\u05e4\u05dc\u05d9\u05dd \u05d4\u05d9\u05d5 \u05e4\u05e9\u05d5\u05d8 \u05de\u05d3\u05d4\u05d9\u05de\u05d9\u05dd. \u05de\u05de\u05dc\u05d9\u05e6\u05d9\u05dd \u05d1\u05d7\u05d5\u05dd!",
  },
  {
    name: "\u05de\u05e9\u05e4\u05d7\u05ea \u05dc\u05d5\u05d9",
    location: "Jerusalem, Israel",
    locationHe:
      "\u05d9\u05e8\u05d5\u05e9\u05dc\u05d9\u05dd, \u05d9\u05e9\u05e8\u05d0\u05dc",
    rating: 5,
    text: "Perfect for families! They scheduled our tour to finish before Shabbat, provided mehadrin kosher food, and the kids loved the elephant sanctuary.",
    textHe:
      "\u05de\u05d5\u05e9\u05dc\u05dd \u05dc\u05de\u05e9\u05e4\u05d7\u05d5\u05ea! \u05ea\u05d9\u05d0\u05de\u05d5 \u05dc\u05e0\u05d5 \u05d0\u05ea \u05d4\u05d8\u05d9\u05d5\u05dc \u05db\u05da \u05e9\u05e0\u05e1\u05d9\u05d9\u05dd \u05dc\u05e4\u05e0\u05d9 \u05e9\u05d1\u05ea, \u05e1\u05d9\u05e4\u05e7\u05d5 \u05d0\u05d5\u05db\u05dc \u05db\u05e9\u05e8 \u05de\u05d4\u05d3\u05e8\u05d9\u05df, \u05d5\u05d4\u05d9\u05dc\u05d3\u05d9\u05dd \u05d4\u05ea\u05dc\u05d4\u05d1\u05d5 \u05de\u05d4\u05e4\u05d9\u05dc\u05d9\u05dd.",
  },
  {
    name: "Yossi Mizrahi",
    location: "Haifa, Israel",
    locationHe: "\u05d7\u05d9\u05e4\u05d4, \u05d9\u05e9\u05e8\u05d0\u05dc",
    rating: 5,
    text: "Best off-road experience in Thailand! Real trails, not tourist traps. The guide knew every hidden spot and the 4x4 vehicles were top quality.",
    textHe:
      "\u05d7\u05d5\u05d5\u05d9\u05d9\u05ea \u05d4\u05e9\u05d8\u05d7 \u05d4\u05db\u05d9 \u05d8\u05d5\u05d1\u05d4 \u05d1\u05ea\u05d0\u05d9\u05dc\u05e0\u05d3! \u05e9\u05d1\u05d9\u05dc\u05d9\u05dd \u05d0\u05de\u05d9\u05ea\u05d9\u05d9\u05dd, \u05dc\u05d0 \u05de\u05dc\u05db\u05d5\u05d3\u05d5\u05ea \u05ea\u05d9\u05d9\u05e8\u05d9\u05dd. \u05d4\u05de\u05d3\u05e8\u05d9\u05da \u05d4\u05db\u05d9\u05e8 \u05db\u05dc \u05e4\u05d9\u05e0\u05d4 \u05d7\u05d1\u05d5\u05d9\u05d4 \u05d5\u05d4\u05d2'\u05d9\u05e4\u05d9\u05dd \u05d4\u05d9\u05d5 \u05d1\u05e8\u05de\u05d4 \u05d2\u05d1\u05d5\u05d4\u05d4.",
  },
  {
    name: "Rachel & Avi Goldstein",
    location: "Netanya, Israel",
    locationHe:
      "\u05e0\u05ea\u05e0\u05d9\u05d4, \u05d9\u05e9\u05e8\u05d0\u05dc",
    rating: 5,
    text: "The attention to kosher details was impressive. Sealed packaging, dedicated utensils, and they even helped us find a minyan in Chiang Mai.",
    textHe:
      "\u05ea\u05e9\u05d5\u05de\u05ea \u05d4\u05dc\u05d1 \u05dc\u05e4\u05e8\u05d8\u05d9 \u05d4\u05db\u05e9\u05e8\u05d5\u05ea \u05d4\u05d9\u05d9\u05ea\u05d4 \u05de\u05e8\u05e9\u05d9\u05de\u05d4. \u05d0\u05e8\u05d9\u05d6\u05d4 \u05d0\u05d8\u05d5\u05de\u05d4, \u05db\u05dc\u05d9\u05dd \u05d9\u05d9\u05e2\u05d5\u05d3\u05d9\u05d9\u05dd, \u05d5\u05d4\u05dd \u05d0\u05e4\u05d9\u05dc\u05d5 \u05e2\u05d6\u05e8\u05d5 \u05dc\u05e0\u05d5 \u05dc\u05de\u05e6\u05d5\u05d0 \u05de\u05e0\u05d9\u05d9\u05df \u05d1\u05e6'\u05d9\u05d0\u05e0\u05d2 \u05de\u05d0\u05d9.",
  },
  {
    name: "Michael Ben-David",
    location: "Ramat Gan, Israel",
    locationHe:
      "\u05e8\u05de\u05ea \u05d2\u05df, \u05d9\u05e9\u05e8\u05d0\u05dc",
    rating: 5,
    text: "Incredible rice field landscapes and authentic hill tribe villages. The WhatsApp support was instant and helpful. WIRO 4x4 made our Thailand trip unforgettable!",
    textHe:
      "\u05e9\u05d3\u05d5\u05ea \u05d0\u05d5\u05e8\u05d6 \u05de\u05d3\u05d4\u05d9\u05de\u05d9\u05dd \u05d5\u05db\u05e4\u05e8\u05d9 \u05e9\u05d1\u05d8\u05d9\u05dd \u05d0\u05d5\u05ea\u05e0\u05d8\u05d9\u05d9\u05dd. \u05d4\u05ea\u05de\u05d9\u05db\u05d4 \u05d1\u05d5\u05d5\u05d0\u05d8\u05e1\u05d0\u05e4 \u05d4\u05d9\u05d9\u05ea\u05d4 \u05de\u05d9\u05d9\u05d3\u05d9\u05ea. WIRO 4x4 \u05d4\u05e4\u05db\u05d5 \u05dc\u05e0\u05d5 \u05d0\u05ea \u05d4\u05d8\u05d9\u05d5\u05dc \u05dc\u05ea\u05d0\u05d9\u05dc\u05e0\u05d3 \u05dc\u05d1\u05dc\u05ea\u05d9 \u05e0\u05e9\u05db\u05d7!",
  },
  {
    name: "\u05e9\u05e8\u05d4 \u05d5\u05d9\u05e2\u05e7\u05d1 \u05db\u05d4\u05df",
    location: "Ashdod, Israel",
    locationHe:
      "\u05d0\u05e9\u05d3\u05d5\u05d3, \u05d9\u05e9\u05e8\u05d0\u05dc",
    rating: 5,
    text: "From booking to the end of the tour, everything was perfect. They understand Israeli travelers and go above and beyond.",
    textHe:
      "\u05de\u05d4\u05d4\u05d6\u05de\u05e0\u05d4 \u05d5\u05e2\u05d3 \u05e1\u05d5\u05e3 \u05d4\u05d8\u05d9\u05d5\u05dc, \u05d4\u05db\u05dc \u05d4\u05d9\u05d4 \u05de\u05d5\u05e9\u05dc\u05dd. \u05d4\u05dd \u05de\u05d1\u05d9\u05e0\u05d9\u05dd \u05de\u05d8\u05d9\u05d9\u05dc\u05d9\u05dd \u05d9\u05e9\u05e8\u05d0\u05dc\u05d9\u05dd \u05d5\u05e0\u05d5\u05ea\u05e0\u05d9\u05dd \u05e9\u05d9\u05e8\u05d5\u05ea \u05de\u05e2\u05dc \u05d5\u05de\u05e2\u05d1\u05e8.",
  },
];

export function Testimonials() {
  const { t, language } = useLanguage();
  const isHebrew = language === "he";
  const sectionRef = useScrollReveal<HTMLElement>({ y: 40, duration: 0.6 });

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

  // Auto-advance every 6 seconds, pausing on hover/focus for WCAG 2.2.2
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => {
    if (!emblaApi || isPaused) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 6000);
    return () => clearInterval(interval);
  }, [emblaApi, isPaused]);

  const { data: dbReviews } = trpc.review.listPublic.useQuery();

  const reviews =
    dbReviews && dbReviews.length > 0
      ? dbReviews.slice(0, 9).map(r => ({
          name: r.name,
          location: "",
          rating: r.rating,
          text: r.text,
        }))
      : FALLBACK_TESTIMONIALS.map(fb => ({
          name: fb.name,
          location: t(fb.location, fb.locationHe),
          rating: fb.rating,
          text: t(fb.text, fb.textHe),
        }));

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 px-4">
          <h2 className="text-4xl md:text-5xl font-medium mb-6 text-foreground">
            {t(
              "What Our Travelers Say",
              "\u05de\u05d4 \u05d4\u05de\u05d8\u05d9\u05d9\u05dc\u05d9\u05dd \u05e9\u05dc\u05e0\u05d5 \u05d0\u05d5\u05de\u05e8\u05d9\u05dd"
            )}
          </h2>
          <GoldDivider />
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-accent text-accent" />
              ))}
            </div>
            <span className="text-lg font-bold text-foreground">5.0</span>
            <span className="text-muted-foreground">
              {t(
                "from 120+ travelers",
                "\u05de-120+ \u05de\u05d8\u05d9\u05d9\u05dc\u05d9\u05dd"
              )}
            </span>
          </div>
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex gap-6">
              {reviews.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                >
                  <div className="h-full p-6 bg-card border-l-4 border-accent rounded-sm shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col h-full">
                      <span className="text-5xl text-accent leading-none mb-4">
                        {"\u201C"}
                      </span>
                      <div className="flex gap-0.5 mb-3">
                        {Array.from({ length: testimonial.rating }).map(
                          (_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-accent text-accent"
                            />
                          )
                        )}
                      </div>
                      <p className="italic text-lg leading-relaxed text-muted-foreground mb-4 flex-grow">
                        {testimonial.text}
                      </p>
                      <div>
                        <p className="font-semibold text-foreground">
                          <span className="text-accent">{"\u2014 "}</span>
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {testimonial.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arrows */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 hidden md:flex items-center justify-center w-10 h-10 bg-card border border-accent/30 rounded-full text-accent hover:bg-accent hover:text-card transition-colors"
            aria-label={t("Previous", "\u05d4\u05e7\u05d5\u05d3\u05dd")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 hidden md:flex items-center justify-center w-10 h-10 bg-card border border-accent/30 rounded-full text-accent hover:bg-accent hover:text-card transition-colors"
            aria-label={t("Next", "\u05d4\u05d1\u05d0")}
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
                index === selectedIndex ? "bg-accent" : "bg-muted"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/reviews">
            <span
              className={`inline-flex items-center gap-2 text-accent font-semibold hover:underline cursor-pointer ${isHebrew ? "flex-row-reverse" : ""}`}
            >
              {t(
                "See All Reviews",
                "\u05dc\u05db\u05dc \u05d7\u05d5\u05d5\u05ea \u05d4\u05d3\u05e2\u05ea"
              )}
              <ArrowRight
                className={`h-4 w-4 ${isHebrew ? "rotate-180" : ""}`}
              />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
