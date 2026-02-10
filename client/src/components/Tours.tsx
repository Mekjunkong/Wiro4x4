import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    image: "/images/1000000126_compressed.jpg",
    title: "Waterfall Adventure Tour",
    titleHe: "הרפתקת מפלים",
    description:
      "Explore hidden waterfalls and jungle trails in premium 4x4 vehicles",
    descriptionHe: "מפלים נסתרים ושבילי ג'ונגל ברכבי 4x4 מפנקים",
    duration: "6-8 hours",
    durationHe: "6-8 שעות",
    difficulty: "moderate" as const,
    kosher: true,
    private: true,
    shabbat: true,
  },
  {
    id: 2,
    image: "/images/vietnam_rice_terraces.jpg",
    title: "Mountain & Valley Explorer",
    titleHe: "טיול הרים ועמקים",
    description:
      "Scenic mountain routes with breathtaking valley views and local villages",
    descriptionHe:
      "מסלולי הרים מרהיבים עם נופים עוצרי נשימה, עמקים וכפרים מקומיים",
    duration: "Full Day",
    durationHe: "יום שלם",
    difficulty: "moderate" as const,
    kosher: true,
    private: true,
    shabbat: true,
  },
  {
    id: 3,
    image: "/images/laos_jungle.jpg",
    title: "Jungle & River Expedition",
    titleHe: "טיול ג'ונגל ונהרות",
    description:
      "Deep jungle exploration with river crossings and natural pools",
    descriptionHe: "טרק ג'ונגל עמוק עם חציית נהרות ובריכות טבעיות",
    duration: "8-10 hours",
    durationHe: "8-10 שעות",
    difficulty: "challenging" as const,
    kosher: true,
    private: true,
    shabbat: false,
  },
  {
    id: 4,
    image: "/images/1000000149.jpg",
    title: "Rice Fields & Culture Tour",
    titleHe: "שדות אורז ותרבות מקומית",
    description:
      "Experience traditional Thai culture, rice terraces, and local communities",
    descriptionHe: "היכרות עם התרבות התאילנדית, טרסות אורז וכפרים מקומיים",
    duration: "4-6 hours",
    durationHe: "4-6 שעות",
    difficulty: "easy" as const,
    kosher: true,
    private: true,
    shabbat: true,
  },
  {
    id: 5,
    image: "/images/1000000140.jpg",
    title: "Elephant Sanctuary Visit",
    titleHe: "ביקור במקלט פילים",
    description:
      "Ethical elephant interaction and care experience in natural habitat",
    descriptionHe: "מפגש אתי עם פילים וטיפול בהם בסביבתם הטבעית",
    duration: "Half Day",
    durationHe: "חצי יום",
    difficulty: "easy" as const,
    kosher: true,
    private: true,
    shabbat: true,
  },
  {
    id: 6,
    image: "/images/1000000135.jpg",
    title: "Hill Tribe Cultural Journey",
    titleHe: "מסע תרבותי לשבטי ההרים",
    description:
      "Visit authentic hill tribe villages and learn about local traditions",
    descriptionHe: "ביקור בכפרי שבטי ההרים והיכרות עם המסורות המקומיות",
    duration: "6-8 hours",
    durationHe: "6-8 שעות",
    difficulty: "moderate" as const,
    kosher: true,
    private: true,
    shabbat: true,
  },
];

const DIFFICULTY_LABELS: Record<string, { en: string; he: string }> = {
  easy: { en: "Easy", he: "קל" },
  moderate: { en: "Moderate", he: "בינוני" },
  challenging: { en: "Challenging", he: "מאתגר" },
};

export function Tours() {
  const { t } = useLanguage();
  const { data: dbTours } = trpc.tour.list.useQuery();

  const tours =
    dbTours && dbTours.length > 0
      ? dbTours.map(tour => ({
          id: tour.id,
          image: tour.imageUrl,
          title: t(tour.name, tour.nameHe),
          description: t(tour.description, tour.descriptionHe),
          duration: tour.duration,
          difficulty: tour.difficulty,
          kosher: tour.isKosher === 1,
          private: tour.isPrivate === 1,
          shabbat: tour.isShabbatOk === 1,
        }))
      : HARDCODED_TOURS.map(tour => ({
          id: tour.id,
          image: tour.image,
          title: t(tour.title, tour.titleHe),
          description: t(tour.description, tour.descriptionHe),
          duration: t(tour.duration, tour.durationHe),
          difficulty: tour.difficulty,
          kosher: tour.kosher,
          private: tour.private,
          shabbat: tour.shabbat,
        }));

  const handleBookTour = (tour: (typeof tours)[0]) => {
    const diffLabel =
      DIFFICULTY_LABELS[tour.difficulty] || DIFFICULTY_LABELS.moderate;
    const tourDetails = t(
      `Tour: ${tour.title}\nDuration: ${tour.duration}\nDifficulty: ${diffLabel.en}\n\nGroup Size: [Please specify 1-4 people]\nPreferred Date: [Please specify]\n\nI would like to know about pricing and availability.`,
      `טיול: ${tour.title}\nמשך: ${tour.duration}\nרמת קושי: ${diffLabel.he}\n\nגודל קבוצה: [ציינו 1-4 אנשים]\nתאריך מועדף: [ציינו תאריך]\n\nאשמח לשמוע על מחירים וזמינות.`
    );
    const greeting = t("Hi WIRO 4x4!", "היי WIRO 4x4!");
    const message = encodeURIComponent(`${greeting}\n\n${tourDetails}`);
    window.open(`https://wa.me/66929894495?text=${message}`, "_blank");
  };

  return (
    <section id="tours" className="py-16 md:py-20 bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            {t("Our Premium Tours", "הטיולים שלנו")}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            {t(
              "Choose from our carefully curated selection of kosher-friendly off-road adventures.",
              "בחרו מתוך מגוון טיולי השטח שלנו -- כולם עם אפשרות לאוכל כשר."
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4 md:px-0">
          {tours.map(tour => (
            <Card
              key={tour.id}
              className="overflow-hidden hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="relative h-72 overflow-hidden">
                <img
                  src={tour.image}
                  alt={tour.title}
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${
                    tour.id === 6 ? "object-[50%_30%]" : "object-center"
                  }`}
                  loading="lazy"
                />
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold">{tour.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {tour.description}
                </p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mountain className="h-4 w-4 text-primary" />
                    <span>
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
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      <Utensils className="h-3 w-3" />
                      {t("Kosher", "כשר")}
                    </span>
                  )}
                  {tour.private && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary-foreground text-xs rounded-full">
                      <Users className="h-3 w-3" />
                      {t("Private", "פרטי")}
                    </span>
                  )}
                  {tour.shabbat && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent-foreground text-xs rounded-full">
                      <Calendar className="h-3 w-3" />
                      {t("Shabbat OK", "מתאים לשבת")}
                    </span>
                  )}
                </div>

                <Button
                  onClick={() => handleBookTour(tour)}
                  className="w-full gap-2 mt-4"
                  variant="default"
                >
                  {t("Book via WhatsApp", "הזמינו בוואטסאפ")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
