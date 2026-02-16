import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GoldDivider } from "@/components/GoldDivider";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  Clock,
  Mountain,
  Users,
  Utensils,
  Calendar,
  Check,
  ArrowLeft,
  MessageCircle,
  MapPin,
} from "lucide-react";
import { useParams, useLocation } from "wouter";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";

/** Hardcoded fallback data matching Tours.tsx + Pricing.tsx */
const FALLBACK_TOURS: Record<
  string,
  {
    name: string;
    nameHe: string;
    description: string;
    descriptionHe: string;
    duration: string;
    durationHe: string;
    difficulty: "easy" | "moderate" | "challenging";
    price: number;
    imageUrl: string;
    isKosher: number;
    isPrivate: number;
    isShabbatOk: number;
    groupMinSize: number;
    groupMaxSize: number;
    included: { en: string; he: string }[];
  }
> = {
  "waterfall-adventure-tour": {
    name: "Waterfall Adventure Tour",
    nameHe: "הרפתקת מפלים",
    description:
      "Explore hidden waterfalls and jungle trails in premium 4x4 vehicles. This full-day adventure takes you deep into the Chiang Mai highlands, visiting Bua Tong Sticky Waterfalls where you can climb up the limestone cascades barefoot, and several hidden swimming holes accessible only by off-road vehicles.",
    descriptionHe:
      "חקרו מפלים נסתרים ושבילי ג'ונגל ברכבי 4x4 מפנקים. הרפתקה של יום שלם שלוקחת אתכם עמוק אל הרמות של צ'יאנג מאי.",
    duration: "6-8 hours",
    durationHe: "6-8 שעות",
    difficulty: "moderate",
    price: 3500,
    imageUrl: "/images/1000000126_compressed.jpg",
    isKosher: 1,
    isPrivate: 1,
    isShabbatOk: 1,
    groupMinSize: 1,
    groupMaxSize: 10,
    included: [
      { en: "Private 4x4 vehicle with driver", he: "רכב 4x4 פרטי עם נהג" },
      { en: "Hebrew-speaking guide", he: "מדריך דובר עברית" },
      { en: "Kosher packed lunch", he: "ארוחת צהריים כשרה ארוזה" },
      { en: "Water and snacks", he: "מים וחטיפים" },
      { en: "Entrance fees", he: "דמי כניסה" },
      { en: "Insurance coverage", he: "כיסוי ביטוחי" },
    ],
  },
  "mountain-valley-explorer": {
    name: "Mountain & Valley Explorer",
    nameHe: "טיול הרים ועמקים",
    description:
      "Scenic mountain routes with breathtaking valley views and local villages. Journey through Doi Inthanon — Thailand's highest peak — with stops at ancient pagodas, cloud-forest trails, and hill tribe markets. A photographer's dream.",
    descriptionHe:
      "מסלולי הרים מרהיבים עם נופים עוצרי נשימה, עמקים וכפרים מקומיים. מסע דרך דוי אינתנון — הפסגה הגבוהה בתאילנד.",
    duration: "Full Day (8-10 hours)",
    durationHe: "יום שלם (8-10 שעות)",
    difficulty: "moderate",
    price: 4200,
    imageUrl: "/images/vietnam_rice_terraces.jpg",
    isKosher: 1,
    isPrivate: 1,
    isShabbatOk: 1,
    groupMinSize: 1,
    groupMaxSize: 10,
    included: [
      { en: "Private 4x4 vehicle with driver", he: "רכב 4x4 פרטי עם נהג" },
      { en: "Hebrew-speaking guide", he: "מדריך דובר עברית" },
      {
        en: "Kosher lunch at local restaurant",
        he: "ארוחת צהריים כשרה במסעדה מקומית",
      },
      { en: "Water and refreshments", he: "מים ומשקאות" },
      { en: "All entrance fees", he: "כל דמי הכניסה" },
      {
        en: "Photo stops at scenic viewpoints",
        he: "עצירות צילום בנקודות תצפית",
      },
    ],
  },
  "jungle-river-expedition": {
    name: "Jungle & River Expedition",
    nameHe: "טיול ג'ונגל ונהרות",
    description:
      "Deep jungle exploration with river crossings and natural pools. This challenging adventure pushes into remote forest trails, fording rivers and discovering secluded waterfalls. Not for the faint of heart — but an unforgettable experience.",
    descriptionHe:
      "טרק ג'ונגל עמוק עם חציית נהרות ובריכות טבעיות. הרפתקה מאתגרת שחודרת לשבילי יער מרוחקים.",
    duration: "8-10 hours",
    durationHe: "8-10 שעות",
    difficulty: "challenging",
    price: 4800,
    imageUrl: "/images/laos_jungle.jpg",
    isKosher: 1,
    isPrivate: 1,
    isShabbatOk: 0,
    groupMinSize: 1,
    groupMaxSize: 10,
    included: [
      {
        en: "Private 4x4 vehicle with experienced driver",
        he: "רכב 4x4 פרטי עם נהג מנוסה",
      },
      {
        en: "Hebrew-speaking adventure guide",
        he: "מדריך הרפתקאות דובר עברית",
      },
      { en: "Kosher meals and snacks", he: "ארוחות וחטיפים כשרים" },
      { en: "Safety equipment", he: "ציוד בטיחות" },
      { en: "First aid kit", he: "ערכת עזרה ראשונה" },
      { en: "Waterproof bags for belongings", he: "שקיות עמידות למים לציוד" },
    ],
  },
  "rice-fields-culture-tour": {
    name: "Rice Fields & Culture Tour",
    nameHe: "שדות אורז ותרבות מקומית",
    description:
      "Experience traditional Thai culture, rice terraces, and local communities. A gentle half-day journey through emerald-green paddies, visiting working farms and sampling local life. Perfect for families and first-time visitors.",
    descriptionHe:
      "היכרות עם התרבות התאילנדית, טרסות אורז וכפרים מקומיים. מסע חצי יום עדין דרך שדות ירוקים.",
    duration: "4-6 hours",
    durationHe: "4-6 שעות",
    difficulty: "easy",
    price: 2800,
    imageUrl: "/images/1000000149.jpg",
    isKosher: 1,
    isPrivate: 1,
    isShabbatOk: 1,
    groupMinSize: 1,
    groupMaxSize: 10,
    included: [
      { en: "Private vehicle with driver", he: "רכב פרטי עם נהג" },
      { en: "Hebrew-speaking cultural guide", he: "מדריך תרבות דובר עברית" },
      { en: "Light kosher refreshments", he: "כיבוד קל כשר" },
      { en: "Village visit permissions", he: "אישורי ביקור בכפרים" },
      {
        en: "Cultural interaction opportunities",
        he: "מפגש עם התרבות המקומית",
      },
    ],
  },
  "elephant-sanctuary-visit": {
    name: "Elephant Sanctuary Visit",
    nameHe: "ביקור במקלט פילים",
    description:
      "Ethical elephant interaction and care experience in natural habitat. Spend a peaceful half-day feeding, bathing, and walking alongside rescued elephants in a certified ethical sanctuary. A life-changing experience for all ages.",
    descriptionHe:
      "מפגש אתי עם פילים וטיפול בהם בסביבתם הטבעית. חצי יום שליו של האכלה, רחצה והליכה לצד פילים שניצלו.",
    duration: "Half Day (4-5 hours)",
    durationHe: "חצי יום (4-5 שעות)",
    difficulty: "easy",
    price: 3200,
    imageUrl: "/images/1000000140.jpg",
    isKosher: 1,
    isPrivate: 1,
    isShabbatOk: 1,
    groupMinSize: 1,
    groupMaxSize: 10,
    included: [
      { en: "Private transportation", he: "הסעה פרטית" },
      { en: "Hebrew-speaking guide", he: "מדריך דובר עברית" },
      { en: "Sanctuary entrance and activities", he: "כניסה ופעילויות במקלט" },
      { en: "Kosher snacks", he: "חטיפים כשרים" },
      { en: "Ethical elephant interaction", he: "מפגש אחראי עם פילים" },
    ],
  },
  "hill-tribe-cultural-journey": {
    name: "Hill Tribe Cultural Journey",
    nameHe: "מסע תרבותי לשבטי ההרים",
    description:
      "Visit authentic hill tribe villages and learn about local traditions. Drive into the mountains to meet Karen, Hmong, and Akha communities. See traditional weaving, taste local cuisine, and hear stories passed down through generations.",
    descriptionHe:
      "ביקור בכפרי שבטי ההרים והיכרות עם המסורות המקומיות. נסיעה אל ההרים לפגישה עם קהילות קארן, המונג ואקה.",
    duration: "6-8 hours",
    durationHe: "6-8 שעות",
    difficulty: "moderate",
    price: 3800,
    imageUrl: "/images/1000000135.jpg",
    isKosher: 1,
    isPrivate: 1,
    isShabbatOk: 1,
    groupMinSize: 1,
    groupMaxSize: 10,
    included: [
      { en: "Private 4x4 vehicle", he: "רכב 4x4 פרטי" },
      { en: "Hebrew-speaking cultural guide", he: "מדריך תרבות דובר עברית" },
      { en: "Kosher packed lunch", he: "ארוחת צהריים כשרה ארוזה" },
      { en: "Village visit permissions", he: "אישורי ביקור בכפרים" },
      { en: "Cultural gifts for communities", he: "מתנות לקהילות המקומיות" },
    ],
  },
};

const DIFFICULTY_LABELS: Record<string, { en: string; he: string }> = {
  easy: { en: "Easy", he: "קל" },
  moderate: { en: "Moderate", he: "בינוני" },
  challenging: { en: "Challenging", he: "מאתגר" },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  moderate: "bg-yellow-100 text-yellow-700",
  challenging: "bg-red-100 text-red-700",
};

interface NormalizedTour {
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  duration: string;
  difficulty: string;
  price: number;
  imageUrl: string;
  isKosher: number;
  isPrivate: number;
  isShabbatOk: number;
  groupMinSize: number;
  groupMaxSize: number;
  includedItems: string | null;
  itinerary: string | null;
  highlights: string | null;
  highlightsHe: string | null;
  fallbackIncluded?: { en: string; he: string }[];
}

export default function TourDetail() {
  const { t } = useLanguage();
  const params = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const slug = params.slug ?? "";

  const { data: dbTour, isLoading } = trpc.tour.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  // Normalize into a common shape
  const fallback = FALLBACK_TOURS[slug];
  let tour: NormalizedTour | null = null;
  if (dbTour) {
    tour = {
      name: dbTour.name,
      nameHe: dbTour.nameHe,
      description: dbTour.description,
      descriptionHe: dbTour.descriptionHe,
      duration: dbTour.duration,
      difficulty: dbTour.difficulty,
      price: dbTour.price,
      imageUrl: dbTour.imageUrl,
      isKosher: dbTour.isKosher,
      isPrivate: dbTour.isPrivate,
      isShabbatOk: dbTour.isShabbatOk,
      groupMinSize: dbTour.groupMinSize ?? 1,
      groupMaxSize: dbTour.groupMaxSize ?? 10,
      includedItems: dbTour.includedItems ?? null,
      itinerary: dbTour.itinerary ?? null,
      highlights: dbTour.highlights ?? null,
      highlightsHe: dbTour.highlightsHe ?? null,
    };
  } else if (fallback) {
    tour = {
      name: fallback.name,
      nameHe: fallback.nameHe,
      description: fallback.description,
      descriptionHe: fallback.descriptionHe,
      duration: fallback.duration,
      difficulty: fallback.difficulty,
      price: fallback.price,
      imageUrl: fallback.imageUrl,
      isKosher: fallback.isKosher,
      isPrivate: fallback.isPrivate,
      isShabbatOk: fallback.isShabbatOk,
      groupMinSize: fallback.groupMinSize,
      groupMaxSize: fallback.groupMaxSize,
      includedItems: null,
      itinerary: null,
      highlights: null,
      highlightsHe: null,
      fallbackIncluded: fallback.included,
    };
  }

  usePageMeta(tour ? tour.name : "Tour Details");

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">
            {t("Tour Not Found", "הטיול לא נמצא")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t(
              "The tour you're looking for doesn't exist.",
              "הטיול שחיפשתם לא קיים."
            )}
          </p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("Back to Home", "חזרה לעמוד הבית")}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Parse included items (from DB or fallback)
  let includedItems: { en: string; he: string }[] = [];
  if (tour.includedItems) {
    try {
      includedItems = JSON.parse(tour.includedItems);
    } catch {
      /* ignore parse errors */
    }
  }
  if (includedItems.length === 0 && tour.fallbackIncluded) {
    includedItems = tour.fallbackIncluded;
  }
  // Fallback: use highlights if no includedItems
  if (includedItems.length === 0 && tour.highlights) {
    try {
      const hl: string[] = JSON.parse(tour.highlights);
      const hlHe: string[] = tour.highlightsHe
        ? JSON.parse(tour.highlightsHe)
        : [];
      includedItems = hl.map((h, i) => ({ en: h, he: hlHe[i] || h }));
    } catch {
      /* ignore */
    }
  }

  // Parse itinerary
  let itinerary: {
    title: string;
    titleHe: string;
    description: string;
    descriptionHe: string;
  }[] = [];
  if (tour.itinerary) {
    try {
      itinerary = JSON.parse(tour.itinerary);
    } catch {
      /* ignore */
    }
  }

  const diffLabel =
    DIFFICULTY_LABELS[tour.difficulty] ?? DIFFICULTY_LABELS.moderate;
  const diffColor =
    DIFFICULTY_COLORS[tour.difficulty] ?? DIFFICULTY_COLORS.moderate;

  const handleBookWhatsApp = () => {
    const msg = encodeURIComponent(
      t(
        `Hi WIRO 4x4! I'm interested in the ${tour.name}. Can you share pricing and availability?`,
        `היי WIRO 4x4! מתעניינים ב${t(tour.name, tour.nameHe)}. אפשר לשמוע על מחירים וזמינות?`
      )
    );
    window.open(`https://wa.me/66929894495?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        {/* Full-bleed Hero Image (60vh) */}
        <section className="relative min-h-[60vh] overflow-hidden">
          <img
            src={tour.imageUrl}
            alt={t(tour.name, tour.nameHe)}
            className="w-full h-full absolute inset-0 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="container">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("All Tours", "כל הטיולים")}
              </button>
              <h1
                className="text-4xl md:text-5xl font-medium text-white mb-3"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {t(tour.name, tour.nameHe)}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-white/90 text-sm">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {tour.duration}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${diffColor}`}
                >
                  {t(diffLabel.en, diffLabel.he)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {t("Chiang Mai, Thailand", "צ'יאנג מאי, תאילנד")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Overlapping Content Card */}
        <div className="container -mt-20 relative z-10 pb-10 md:pb-14">
          <div className="bg-card rounded-sm shadow-premium p-6 md:p-10">
            <GoldDivider className="mx-0 mt-0 mb-8" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div>
                  <h2
                    className="text-2xl font-bold mb-4"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {t("About This Tour", "אודות הטיול")}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(tour.description, tour.descriptionHe)}
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-3">
                  {tour.isKosher === 1 && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] text-sm rounded-sm font-medium">
                      <Utensils className="h-4 w-4" />
                      {t("Kosher Meals Included", "ארוחות כשרות כלולות")}
                    </span>
                  )}
                  {tour.isPrivate === 1 && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary/10 text-secondary-foreground text-sm rounded-sm font-medium">
                      <Users className="h-4 w-4" />
                      {t("Private Tour", "טיול פרטי")}
                    </span>
                  )}
                  {tour.isShabbatOk === 1 && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent/10 text-accent-foreground text-sm rounded-sm font-medium">
                      <Calendar className="h-4 w-4" />
                      {t("Shabbat Friendly", "מתאים לשבת")}
                    </span>
                  )}
                </div>

                {/* What's Included */}
                {includedItems.length > 0 && (
                  <div>
                    <h2
                      className="text-2xl font-bold mb-4"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {t("What's Included", "מה כלול")}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {includedItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-sm bg-[#D4AF37]/5"
                        >
                          <Check className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                          <span className="text-sm">{t(item.en, item.he)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Itinerary */}
                {itinerary.length > 0 && (
                  <div>
                    <h2
                      className="text-2xl font-bold mb-4"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {t("Day-by-Day Itinerary", "מסלול יום-יומי")}
                    </h2>
                    <div className="space-y-4">
                      {itinerary.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex gap-4 p-4 border border-border rounded-sm"
                        >
                          <div
                            className="w-10 h-10 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center font-bold text-2xl shrink-0"
                            style={{
                              fontFamily: "'Cormorant Garamond', serif",
                            }}
                          >
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">
                              {t(step.title, step.titleHe)}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {t(step.description, step.descriptionHe)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar - Booking Card */}
              <div>
                <Card className="p-6 sticky top-24 space-y-5 rounded-sm">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {t("Starting from", "החל מ-")}
                    </div>
                    <div className="text-4xl font-bold text-[#D4AF37]">
                      &#3647;{tour.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("per group (1-4 people)", "לקבוצה (1-4 אנשים)")}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {t("Duration", "משך")}
                      </span>
                      <span className="font-medium">{tour.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {t("Difficulty", "רמת קושי")}
                      </span>
                      <span className="font-medium">
                        {t(diffLabel.en, diffLabel.he)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {t("Group Size", "גודל קבוצה")}
                      </span>
                      <span className="font-medium">
                        {tour.groupMinSize}-{tour.groupMaxSize}{" "}
                        {t("people", "אנשים")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Button
                      onClick={handleBookWhatsApp}
                      className="w-full gap-2"
                      variant="default"
                      size="lg"
                    >
                      <MessageCircle className="w-5 h-5" />
                      {t("Book via WhatsApp", "הזמינו בוואטסאפ")}
                    </Button>
                    <a
                      href="#inquiry"
                      onClick={e => {
                        e.preventDefault();
                        navigate("/");
                        // Small delay so the homepage loads then scrolls
                        setTimeout(() => {
                          document
                            .getElementById("inquiry")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }, 300);
                      }}
                      className="block text-center text-sm text-[#D4AF37] hover:underline"
                    >
                      {t("Or request a free quote", "או בקשו הצעת מחיר חינם")}
                    </a>
                  </div>

                  <div className="pt-3 border-t text-xs text-muted-foreground space-y-1.5">
                    <p>
                      {t(
                        "50% deposit to confirm. Balance on tour day.",
                        "מקדמה 50% לאישור. יתרה ביום הטיול."
                      )}
                    </p>
                    <p>
                      {t(
                        "Free cancellation 7+ days before.",
                        "ביטול חינם 7+ ימים לפני."
                      )}
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <FloatingActionButtons />
      <Footer />
    </div>
  );
}
