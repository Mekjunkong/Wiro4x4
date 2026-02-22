import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";

import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
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
    image: "/images/vietnam_rice_terraces.jpg",
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
    image: "/images/1000000149.jpg",
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
    image: "/images/1000000126_compressed.jpg",
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
    image: "/images/1000000139_compressed.jpg",
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
    image: "/images/laos_jungle.jpg",
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
    image: "/images/1000000135.jpg",
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

const DIFFICULTY_LABELS: Record<string, { en: string; he: string }> = {
  easy: { en: "Easy", he: "קל" },
  moderate: { en: "Moderate", he: "בינוני" },
  challenging: { en: "Challenging", he: "מאתגר" },
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function Tours() {
  const { t } = useLanguage();
  const gridRef = useScrollReveal<HTMLDivElement>({ stagger: 0.15 });

  const { data: dbTours } = trpc.tour.list.useQuery();

  const tours =
    dbTours && dbTours.length > 0
      ? dbTours.map(tour => ({
          id: tour.id,
          slug: tour.slug || generateSlug(tour.name),
          image: tour.imageUrl,
          title: t(tour.name, tour.nameHe),
          description: t(tour.description, tour.descriptionHe),
          duration: tour.duration,
          difficulty: tour.difficulty,
          kosher: tour.isKosher === 1,
          private: tour.isPrivate === 1,
          shabbat: tour.isShabbatOk === 1,
          price: tour.price ?? null,
        }))
      : HARDCODED_TOURS.map(tour => ({
          id: tour.id,
          slug: tour.slug,
          image: tour.image,
          title: t(tour.title, tour.titleHe),
          description: t(tour.description, tour.descriptionHe),
          duration: t(tour.duration, tour.durationHe),
          difficulty: tour.difficulty,
          kosher: tour.kosher,
          private: tour.private,
          shabbat: tour.shabbat,
          price: tour.price,
        }));

  return (
    <section
      id="tours"
      className="py-24 md:py-32 bg-[#0F0F0F] relative overflow-hidden"
    >
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-4 md:mb-6 text-white">
            {t("Our Premium Tours", "הטיולים שלנו")}
          </h2>
          <p className="text-base md:text-lg text-[#9B9590]">
            {t(
              "Choose from our carefully curated selection of kosher-friendly off-road adventures.",
              "בחרו מתוך מגוון טיולי השטח שלנו -- כולם עם אפשרות לאוכל כשר."
            )}
          </p>
          <GoldDivider />
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-0"
        >
          {tours.map(tour => (
            <a
              key={tour.id}
              href={`/tours/${tour.slug}`}
              className="block group"
            >
              <Card className="overflow-hidden hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-300 hover:-translate-y-1 h-full border-l-4 border-[#D4AF37] rounded-sm bg-[#1C1C1C]">
                <div className="relative h-72 overflow-hidden bg-muted">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                      tour.id === 6 ? "object-[50%_30%]" : "object-center"
                    }`}
                    loading="lazy"
                  />
                  {tour.price != null && (
                    <div className="absolute top-4 right-4 bg-[#1C1C1C]/80 backdrop-blur-sm text-[#D4AF37] px-3 py-1.5 rounded-sm text-sm font-medium shadow-lg">
                      {t("From", "החל מ-")} &#3647;{tour.price.toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-medium text-white">
                    {tour.title}
                  </h3>
                  <p className="text-sm text-[#9B9590]">{tour.description}</p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#D4AF37]" />
                      <span className="text-white">{tour.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mountain className="h-4 w-4 text-[#D4AF37]" />
                      <span className="text-white">
                        {t(
                          DIFFICULTY_LABELS[tour.difficulty]?.en ||
                            tour.difficulty,
                          DIFFICULTY_LABELS[tour.difficulty]?.he ||
                            tour.difficulty
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {tour.kosher && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-xs rounded-sm">
                        <Utensils className="h-3 w-3" />
                        {t("Kosher", "כשר")}
                      </span>
                    )}
                    {tour.private && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-xs rounded-sm">
                        <Users className="h-3 w-3" />
                        {t("Private", "פרטי")}
                      </span>
                    )}
                    {tour.shabbat && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-xs rounded-sm">
                        <Calendar className="h-3 w-3" />
                        {t("Shabbat OK", "מתאים לשבת")}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[#D4AF37] font-medium text-sm pt-2">
                    {t("View Details", "לפרטים נוספים")}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/estimate"
            className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#E8C84A] font-medium text-lg transition-colors"
          >
            {t("Estimate Your Trip Cost", "חשבו את עלות הטיול")}
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
