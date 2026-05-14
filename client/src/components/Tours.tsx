import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { OptimizedImage } from "@/components/OptimizedImage";
import { TourCardSkeleton } from "@/components/SkeletonLoader";
import {
  Clock,
  Mountain,
  Utensils,
  Users,
  Calendar,
  ArrowRight,
} from "lucide-react";

const HARDCODED_TOURS = [
  {
    id: 1,
    slug: "doi-inthanon-roof-of-thailand",
    image: "/images/optimized/mountain_sunset.jpg",
    title: "Doi Inthanon — Roof of Thailand",
    titleHe: "דוי אינתנון — גג תאילנד",
    description:
      "Thailand's highest peak, cloud forest trails, and a hidden Karen village coffee farm",
    descriptionHe:
      "הפסגה הגבוהה בתאילנד, שבילי יער ענן וחוות קפה נסתרת בכפר קארן",
    duration: "7-8 hours",
    durationHe: "7-8 שעות",
    difficulty: "moderate" as const,
    kosher: true,
    private: true,
    shabbat: true,
    price: 5000,
  },
  {
    id: 2,
    slug: "mae-kampong-hidden-village",
    image: "/images/optimized/mountain_village_view.jpg",
    title: "Mae Kampong — Hidden Mountain Village",
    titleHe: "מאה קמפונג — הכפר הנסתר בהרים",
    description:
      "A 700-year-old eco-village, wild gibbon spotting, ancient tea ceremony, and panoramic viewpoint hike",
    descriptionHe:
      "כפר אקולוגי בן 700 שנה, תצפית על גיבונים, טקס תה עתיק וטיול לתצפית פנורמית",
    duration: "5-7 hours",
    durationHe: "5-7 שעות",
    difficulty: "easy" as const,
    kosher: true,
    private: true,
    shabbat: true,
    price: 3500,
  },
  {
    id: 3,
    slug: "maerim-sticky-waterfalls",
    image: "/images/optimized/sticky_waterfalls.jpg",
    title: "Maerim & Sticky Waterfalls",
    titleHe: "מאה רים ומפלים דביקים",
    description:
      "Climb UP a waterfall barefoot, walk a sky-high canopy walkway, and explore upper waterfall tiers no one reaches",
    descriptionHe:
      "טפסו למעלה על מפל יחפים, הלכו על גשר צמרות בגובה 20 מטר וגלו קומות מפל שאף אחד לא מגיע אליהן",
    duration: "7-8 hours",
    durationHe: "7-8 שעות",
    difficulty: "easy" as const,
    kosher: true,
    private: true,
    shabbat: true,
    price: 4500,
  },
  {
    id: 4,
    slug: "doi-suthep-pui-beyond-temple",
    image: "/images/optimized/doi_suthep_golden_chedi.jpg",
    title: "Doi Suthep-Pui — Beyond the Temple",
    titleHe: "דוי סוטפ-פוי — מעבר למקדש",
    description:
      "Hike the ancient Monk's Trail, then keep going where tourists turn back — Hmong village, hidden coffee farm, secluded waterfall",
    descriptionHe:
      "טיילו בשביל הנזירים העתיק, ואז המשיכו לאן שהתיירים חוזרים — כפר המונג, חוות קפה נסתרת ומפל מבודד",
    duration: "5-7 hours",
    durationHe: "5-7 שעות",
    difficulty: "easy" as const,
    kosher: true,
    private: true,
    shabbat: true,
    price: 3500,
  },
  {
    id: 5,
    slug: "mae-wang-jungle-wilderness",
    image: "/images/optimized/elephant_encounter.jpg",
    title: "Mae Wang — Jungle & River Wilderness",
    titleHe: "מאה וואנג — ג'ונגל ונהרות פראיים",
    description:
      "Real 4x4 off-road through jungle, Pha Chor canyon, ethical elephants, bamboo rafting, and hidden waterfalls",
    descriptionHe:
      "שטח אמיתי ברכב 4x4 דרך ג'ונגל, קניון פה-צ'ור, פילים אתיים, שייט במבוק ומפלים נסתרים",
    duration: "8-9 hours",
    durationHe: "8-9 שעות",
    difficulty: "challenging" as const,
    kosher: true,
    private: true,
    shabbat: false,
    price: 5500,
  },
  {
    id: 6,
    slug: "samoeng-loop-mountain-circuit",
    image: "/images/optimized/chiang_mai_valley.jpg",
    title: "Samoeng Loop — The Mountain Circuit",
    titleHe: "לולאת סמאנג — המעגל ההררי",
    description:
      "100km mountain loop — rare wooden Lanna temple, hilltop farm above the clouds, Hmong village, and lakeside sunset",
    descriptionHe:
      'מעגל הרים של 100 ק"מ — מקדש עץ לאנה נדיר, חווה על פסגת הר מעל העננים, כפר המונג ושקיעה על שפת אגם',
    duration: "8-10 hours",
    durationHe: "8-10 שעות",
    difficulty: "moderate" as const,
    kosher: true,
    private: true,
    shabbat: true,
    price: 5000,
  },
];

// Local image overrides — always used instead of DB imageUrl
const TOUR_IMAGE_MAP: Record<string, string> = {
  "doi-inthanon-roof-of-thailand": "mountain_sunset",
  "mae-kampong-hidden-village": "mountain_village_view",
  "maerim-sticky-waterfalls": "sticky_waterfalls",
  "doi-suthep-pui-beyond-temple": "doi_suthep_golden_chedi",
  "mae-wang-jungle-wilderness": "elephant_encounter",
  "samoeng-loop-mountain-circuit": "chiang_mai_valley",
};

const DIFFICULTY_FILTERS = [
  { value: "all", en: "All", he: "הכל" },
  { value: "easy", en: "Easy", he: "קל" },
  { value: "moderate", en: "Moderate", he: "בינוני" },
  { value: "challenging", en: "Challenging", he: "מאתגר" },
];

const DURATION_FILTERS = [
  { value: "all", en: "All Durations", he: "כל הזמנים" },
  { value: "half", en: "Half Day (5-7h)", he: "חצי יום (5-7 שעות)" },
  { value: "full", en: "Full Day (7-10h)", he: "יום שלם (7-10 שעות)" },
];

function parseDurationHours(duration: string): number {
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 8;
}

const IMAGE_FOCAL_POINTS: Record<string, string> = {
  "samoeng-loop-mountain-circuit": "object-[50%_30%]",
};

const TOUR_BADGES: Record<string, { en: string; he: string }> = {
  "doi-inthanon-roof-of-thailand": { en: "Most Popular", he: "הכי פופולרי" },
  "mae-kampong-hidden-village": { en: "Hidden Gem", he: "פנינה נסתרת" },
  "maerim-sticky-waterfalls": { en: "Family Favorite", he: "מועדף למשפחות" },
  "doi-suthep-pui-beyond-temple": { en: "Limited Spots", he: "מקומות מוגבלים" },
  "mae-wang-jungle-wilderness": { en: "Adventure Pick", he: "בחירת הרפתקנים" },
  "samoeng-loop-mountain-circuit": { en: "New Route", he: "מסלול חדש" },
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function Tours() {
  const { t, language } = useLanguage();
  const isHebrew = language === "he";
  const sectionRef = useScrollReveal<HTMLElement>({ y: 40, duration: 0.6 });

  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [durationFilter, setDurationFilter] = useState<string>("all");

  const { data: dbTours, isLoading } = trpc.tour.list.useQuery();

  const tours =
    dbTours && dbTours.length > 0
      ? dbTours.map(tour => {
          const slug = tour.slug || generateSlug(tour.name);
          return {
            id: tour.id,
            slug,
            image: TOUR_IMAGE_MAP[slug] || tour.imageUrl,
            title: t(tour.name, tour.nameHe),
            description: t(tour.description, tour.descriptionHe),
            duration: tour.duration,
            difficulty: tour.difficulty,
            kosher: tour.isKosher === 1,
            private: tour.isPrivate === 1,
            shabbat: tour.isShabbatOk === 1,
            price: tour.price ?? null,
          };
        })
      : HARDCODED_TOURS.map(tour => {
          return {
            id: tour.id,
            slug: tour.slug,
            image: TOUR_IMAGE_MAP[tour.slug] || tour.image,
            title: t(tour.title, tour.titleHe),
            description: t(tour.description, tour.descriptionHe),
            duration: t(tour.duration, tour.durationHe),
            difficulty: tour.difficulty,
            kosher: tour.kosher,
            private: tour.private,
            shabbat: tour.shabbat,
            price: tour.price,
          };
        });

  const filteredTours = tours.filter(tour => {
    if (difficultyFilter !== "all" && tour.difficulty !== difficultyFilter)
      return false;
    if (durationFilter !== "all") {
      const hours = parseDurationHours(tour.duration);
      if (durationFilter === "half" && hours > 7) return false;
      if (durationFilter === "full" && hours <= 7) return false;
    }
    return true;
  });

  return (
    <section
      ref={sectionRef}
      id="tours"
      className="py-24 md:py-32 bg-background relative overflow-hidden"
    >
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-4 md:mb-6 text-foreground">
            {t("Our Premium Tours", "הטיולים שלנו")}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            {t(
              "Choose from our carefully curated selection of kosher-friendly off-road adventures.",
              "בחרו מתוך מגוון טיולי השטח שלנו -- כולם עם אפשרות לאוכל כשר."
            )}
          </p>
          <GoldDivider />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {DIFFICULTY_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setDifficultyFilter(f.value)}
              aria-pressed={difficultyFilter === f.value}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                difficultyFilter === f.value
                  ? "bg-accent-cta text-white"
                  : "bg-muted text-foreground hover:bg-accent/20"
              }`}
            >
              {t(f.en, f.he)}
            </button>
          ))}
          <span
            className="w-px h-8 bg-muted self-center mx-1"
            aria-hidden="true"
          />
          {DURATION_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setDurationFilter(f.value)}
              aria-pressed={durationFilter === f.value}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                durationFilter === f.value
                  ? "bg-accent-cta text-white"
                  : "bg-muted text-foreground hover:bg-accent/20"
              }`}
            >
              {t(f.en, f.he)}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {isLoading && <TourCardSkeleton count={6} />}

        {/* Tour grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTours.length === 0 && (
              <div className="col-span-full text-center py-16 text-muted-foreground">
                <p>
                  {t(
                    "No tours match the selected filters.",
                    "לא נמצאו טיולים התואמים לסינון שנבחר."
                  )}
                </p>
                <button
                  onClick={() => {
                    setDifficultyFilter("all");
                    setDurationFilter("all");
                  }}
                  className="mt-4 text-accent underline text-sm"
                >
                  {t("Clear filters", "נקה סינונים")}
                </button>
              </div>
            )}
            {filteredTours.map(tour => (
              <Link
                key={tour.id}
                href={`/tours/${tour.slug}`}
                className="block group"
              >
                <Card className="overflow-hidden hover:shadow-luxury transition-all duration-500 hover:-translate-y-1 h-full border border-accent/30 rounded-sm bg-card">
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <OptimizedImage
                      src={tour.image}
                      alt={tour.title}
                      width={800}
                      height={500}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                        IMAGE_FOCAL_POINTS[tour.slug] ?? "object-center"
                      }`}
                    />
                    {TOUR_BADGES[tour.slug] && (
                      <div className="absolute top-3 left-3 bg-primary/65 backdrop-blur-sm text-white text-[10px] uppercase tracking-[0.12em] font-medium px-2.5 py-1 rounded-sm">
                        {t(
                          TOUR_BADGES[tour.slug].en,
                          TOUR_BADGES[tour.slug].he
                        )}
                      </div>
                    )}
                    {tour.price != null && (
                      <div className="absolute top-3 right-3 bg-primary/85 backdrop-blur-sm px-3 py-1 rounded-sm">
                        <span className="text-accent font-semibold text-sm">
                          ${Math.round(tour.price * 0.028).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-medium text-foreground">
                      {tour.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {tour.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-accent" />
                        <span className="text-foreground">{tour.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mountain className="h-4 w-4 text-accent" />
                        <span className="text-foreground">
                          {t(
                            DIFFICULTY_FILTERS.find(
                              f => f.value === tour.difficulty
                            )?.en || tour.difficulty,
                            DIFFICULTY_FILTERS.find(
                              f => f.value === tour.difficulty
                            )?.he || tour.difficulty
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {tour.kosher && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent text-xs rounded-sm">
                          <Utensils className="h-3 w-3" />
                          {t("Kosher", "כשר")}
                        </span>
                      )}
                      {tour.private && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent text-xs rounded-sm">
                          <Users className="h-3 w-3" />
                          {t("Private", "פרטי")}
                        </span>
                      )}
                      {tour.shabbat && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent text-xs rounded-sm">
                          <Calendar className="h-3 w-3" />
                          {t("Shabbat OK", "מתאים לשבת")}
                        </span>
                      )}
                    </div>

                    <div
                      className={`flex items-center gap-2 text-accent font-medium text-sm pt-2 ${isHebrew ? "flex-row-reverse" : ""}`}
                    >
                      {t("View Details", "לפרטים נוספים")}
                      <ArrowRight
                        className={`h-4 w-4 group-hover:translate-x-1 transition-transform ${isHebrew ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/estimate"
            className={`inline-flex items-center gap-2 text-accent hover:text-accent/80 font-medium text-lg transition-colors ${isHebrew ? "flex-row-reverse" : ""}`}
          >
            {t("Estimate Your Trip Cost", "חשבו את עלות הטיול")}
            <ArrowRight className={`h-5 w-5 ${isHebrew ? "rotate-180" : ""}`} />
          </Link>
        </div>
      </div>
    </section>
  );
}
