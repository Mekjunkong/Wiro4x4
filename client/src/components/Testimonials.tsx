import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Star, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import useEmblaCarousel from "embla-carousel-react";

export function Testimonials() {
  const { t } = useLanguage();
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

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 6000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  const testimonials = [
    {
      name: "David & Sarah Cohen",
      location: t("Tel Aviv, Israel", "תל אביב, ישראל"),
      rating: 5,
      text: t(
        "WIRO 4x4 exceeded all expectations! The kosher meals were fresh and delicious, our guide spoke perfect Hebrew, and the waterfalls were absolutely stunning. Highly recommend!",
        "WIRO 4x4 עלו על כל הציפיות! האוכל הכשר היה טרי וטעים, המדריך דיבר עברית מושלמת, והמפלים היו פשוט מדהימים. ממליצים בחום!"
      ),
    },
    {
      name: "משפחת לוי",
      location: t("Jerusalem, Israel", "ירושלים, ישראל"),
      rating: 5,
      text: t(
        "Perfect for families! They scheduled our tour to finish before Shabbat, provided mehadrin kosher food, and the kids loved the elephant sanctuary.",
        "מושלם למשפחות! תיאמו לנו את הטיול כך שנסיים לפני שבת, סיפקו אוכל כשר מהדרין, והילדים התלהבו מהפילים."
      ),
    },
    {
      name: "Yossi Mizrahi",
      location: t("Haifa, Israel", "חיפה, ישראל"),
      rating: 5,
      text: t(
        "Best off-road experience in Thailand! Real trails, not tourist traps. The guide knew every hidden spot and the 4x4 vehicles were top quality.",
        "חוויית השטח הכי טובה בתאילנד! שבילים אמיתיים, לא מלכודות תיירים. המדריך הכיר כל פינה חבויה והג'יפים היו ברמה גבוהה."
      ),
    },
    {
      name: "Rachel & Avi Goldstein",
      location: t("Netanya, Israel", "נתניה, ישראל"),
      rating: 5,
      text: t(
        "The attention to kosher details was impressive. Sealed packaging, dedicated utensils, and they even helped us find a minyan in Chiang Mai.",
        "תשומת הלב לפרטי הכשרות הייתה מרשימה. אריזה אטומה, כלים ייעודיים, והם אפילו עזרו לנו למצוא מניין בצ'יאנג מאי."
      ),
    },
    {
      name: "Michael Ben-David",
      location: t("Ramat Gan, Israel", "רמת גן, ישראל"),
      rating: 5,
      text: t(
        "Incredible rice field landscapes and authentic hill tribe villages. The WhatsApp support was instant and helpful. WIRO 4x4 made our Thailand trip unforgettable!",
        "שדות אורז מדהימים וכפרי שבטים אותנטיים. התמיכה בוואטסאפ הייתה מיידית. WIRO 4x4 הפכו לנו את הטיול לתאילנד לבלתי נשכח!"
      ),
    },
    {
      name: "שרה ויעקב כהן",
      location: t("Ashdod, Israel", "אשדוד, ישראל"),
      rating: 5,
      text: t(
        "From booking to the end of the tour, everything was perfect. They understand Israeli travelers and go above and beyond.",
        "מההזמנה ועד סוף הטיול, הכל היה מושלם. הם מבינים מטיילים ישראלים ונותנים שירות מעל ומעבר."
      ),
    },
  ];

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-[#141414]">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 px-4">
          <h2 className="text-4xl md:text-5xl font-medium mb-6 text-white">
            {t("What Our Travelers Say", "מה המטיילים שלנו אומרים")}
          </h2>
          <GoldDivider />
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]"
                />
              ))}
            </div>
            <span className="text-lg font-bold text-white">5.0</span>
            <span className="text-[#9B9590]">
              {t("from 120+ travelers", "מ-120+ מטיילים")}
            </span>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                >
                  <div className="h-full p-6 bg-[#1C1C1C] border-l-2 border-[#D4AF37] rounded-sm">
                    <div className="flex flex-col h-full">
                      <span className="text-5xl text-[#D4AF37] leading-none mb-4">
                        {"\u201C"}
                      </span>
                      <div className="flex gap-0.5 mb-3">
                        {Array.from({ length: testimonial.rating }).map(
                          (_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]"
                            />
                          )
                        )}
                      </div>
                      <p className="italic text-lg leading-relaxed text-[#9B9590] mb-4 flex-grow">
                        {testimonial.text}
                      </p>
                      <div>
                        <p className="font-semibold text-white">
                          <span className="text-[#D4AF37]">{"\u2014 "}</span>
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-[#9B9590]">
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

        <div className="text-center mt-8">
          <Link href="/reviews">
            <span className="inline-flex items-center gap-2 text-[#D4AF37] font-semibold hover:underline cursor-pointer">
              {t("See All Reviews", "לכל חוות הדעת")}
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
