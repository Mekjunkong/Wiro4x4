import { useState, useMemo, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  getEffectiveGroupSize,
  isCustomQuoteRequired,
  detectShabbatNights,
  type TourSelection,
} from "../../../shared/pricing";
import { WIRO_TOUR_CATALOG } from "../../../shared/wiroTourCatalog";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { Breadcrumb } from "@/components/Breadcrumb";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buildTrackedWhatsAppLink } from "@/lib/whatsappAttribution";
import { trackEvent } from "@/lib/analytics";
import { buildSelectedToursBookingUrl } from "@/lib/bookingTourContext";
import {
  Package,
  Check,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  Users,
  Plus,
  Minus,
  Trash2,
  Calendar,
  Hotel,
  Utensils,
  Mountain,
  MessageCircle,
  Baby,
  Star,
  ChevronRight,
  Send,
  Sparkles,
  Loader2,
} from "lucide-react";

// ── Tour image map ──────────────────────────────────────────
const TOUR_IMAGE_MAP: Record<string, { webp: string; jpg: string }> = {
  "doi-inthanon-roof-of-thailand": {
    webp: "/images/optimized/doi_inthanon_peak.webp",
    jpg: "/images/optimized/doi_inthanon_peak.jpg",
  },
  "mae-kampong-hidden-village": {
    webp: "/images/optimized/mountain_village_view.webp",
    jpg: "/images/optimized/mountain_village_view.jpg",
  },
  "maerim-sticky-waterfalls": {
    webp: "/images/optimized/sticky_waterfalls.webp",
    jpg: "/images/optimized/sticky_waterfalls.jpg",
  },
  "doi-suthep-pui-beyond-temple": {
    webp: "/images/optimized/doi_suthep_temple.webp",
    jpg: "/images/optimized/doi_suthep_temple.jpg",
  },
  "mae-wang-jungle-wilderness": {
    webp: "/images/optimized/mae_wang_elephants.webp",
    jpg: "/images/optimized/mae_wang_elephants.jpg",
  },
  "samoeng-loop-mountain-circuit": {
    webp: "/images/optimized/samoeng_valley.webp",
    jpg: "/images/optimized/samoeng_valley.jpg",
  },
};

// ── Duration options ────────────────────────────────────────
const DURATION_OPTIONS = [
  { days: 2, labelEn: "2-Day", labelHe: "2 ימים" },
  { days: 3, labelEn: "3-Day", labelHe: "3 ימים" },
  { days: 5, labelEn: "5-Day", labelHe: "5 ימים" },
  { days: 7, labelEn: "7-Day", labelHe: "7 ימים" },
];

// ── Pre-built suggested packages ────────────────────────────
interface SuggestedPackage {
  nameEn: string;
  nameHe: string;
  descEn: string;
  descHe: string;
  days: number;
  tourSlugs: string[];
  image: string;
}

const SUGGESTED_PACKAGES: SuggestedPackage[] = [
  {
    nameEn: "Chiang Mai Highlights",
    nameHe: "דגשי צ'יאנג מאי",
    descEn:
      "The best of Chiang Mai in 3 days: Thailand's highest peak, magical sticky waterfalls, and the iconic Doi Suthep temple.",
    descHe:
      "המיטב של צ'יאנג מאי ב-3 ימים: הפסגה הגבוהה בתאילנד, מפלים דביקים קסומים, ומקדש דוי סוטפ האייקוני.",
    days: 3,
    tourSlugs: [
      "doi-inthanon-roof-of-thailand",
      "maerim-sticky-waterfalls",
      "doi-suthep-pui-beyond-temple",
    ],
    image: "/images/optimized/doi_inthanon_peak.jpg",
  },
  {
    nameEn: "Northern Thailand Explorer",
    nameHe: "חוקר צפון תאילנד",
    descEn:
      "5 days of adventure covering all the must-see destinations: mountains, waterfalls, hidden villages, jungles, and scenic loops.",
    descHe:
      "5 ימים של הרפתקאות בכל היעדים שחובה לראות: הרים, מפלים, כפרים נסתרים, ג'ונגלים ולולאות נוף.",
    days: 5,
    tourSlugs: [
      "doi-inthanon-roof-of-thailand",
      "mae-kampong-hidden-village",
      "maerim-sticky-waterfalls",
      "doi-suthep-pui-beyond-temple",
      "mae-wang-jungle-wilderness",
    ],
    image: "/images/optimized/vehicle_fleet_jungle.jpg",
  },
  {
    nameEn: "Ultimate Adventure",
    nameHe: "ההרפתקה המושלמת",
    descEn:
      "7 days of the complete Northern Thailand experience. All 6 tours plus a rest day to explore Chiang Mai at your own pace.",
    descHe:
      "7 ימים של החוויה המלאה של צפון תאילנד. כל 6 הטיולים ויום מנוחה לחקור את צ'יאנג מאי בקצב שלכם.",
    days: 7,
    tourSlugs: [
      "doi-inthanon-roof-of-thailand",
      "mae-kampong-hidden-village",
      "maerim-sticky-waterfalls",
      "doi-suthep-pui-beyond-temple",
      "mae-wang-jungle-wilderness",
      "samoeng-loop-mountain-circuit",
    ],
    image: "/images/optimized/offroad_trail_driving.jpg",
  },
];

// ── Step type ───────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4;

export default function Packages() {
  const { t, language } = useLanguage();
  const isHebrew = language === "he";

  usePageMeta({
    title: t(
      "Multi-Day Tour Packages | WIRO 4x4",
      "חבילות סיור רב-יומיות | WIRO 4x4"
    ),
    description: t(
      "Build your multi-day adventure with 2-day, 3-day, 5-day, or 7-day tour packages in Chiang Mai.",
      "בנו את חבילת ההרפתקה הרב-יומית שלכם עם חבילות 2, 3, 5 או 7 ימים בצ'יאנג מאי."
    ),
    canonicalPath: "/packages",
  });

  const { data: dbTours = [] } = trpc.tour.list.useQuery();
  const leadMutation = trpc.lead.create.useMutation();

  // ── Builder state ─────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedTourSlugs, setSelectedTourSlugs] = useState<string[]>([]);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState<number[]>([]);
  const [includesHotels, setIncludesHotels] = useState(false);
  const [includesFood, setIncludesFood] = useState(false);
  const [includesAttractions, setIncludesAttractions] = useState(false);
  const [attractionCount, setAttractionCount] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [needsShabbatHotel, setNeedsShabbatHotel] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  // Lead form state
  const [quoteName, setQuoteName] = useState("");
  const [quoteEmail, setQuoteEmail] = useState("");
  const [quotePhone, setQuotePhone] = useState("");

  // Available tours (from DB or fallback)
  const availableTours = useMemo(() => {
    if (dbTours.length > 0) return dbTours;
    return WIRO_TOUR_CATALOG.map(tour => ({
      ...tour,
      imageUrl: null,
    }));
  }, [dbTours]);

  // ── Selected tours as TourSelection for pricing ───────────
  const selectedTours: TourSelection[] = useMemo(() => {
    return selectedTourSlugs
      .map(slug => {
        const tour = availableTours.find(t => t.slug === slug);
        if (!tour) return null;
        return {
          slug: tour.slug,
          nameEn: tour.name,
          nameHe: tour.nameHe || tour.name,
          basePrice: tour.price,
          bookingCount: 0,
        };
      })
      .filter(Boolean) as TourSelection[];
  }, [selectedTourSlugs, availableTours]);

  const bookingUrl = useMemo(
    () =>
      buildSelectedToursBookingUrl(
        selectedTourSlugs,
        availableTours.map(tour => tour.slug)
      ),
    [selectedTourSlugs, availableTours]
  );

  // ── Pricing calculations ──────────────────────────────────
  const totalTourDays = selectedTourSlugs.length;
  const endDate = useMemo(() => {
    if (!startDate || !selectedDuration) return "";
    const d = new Date(startDate);
    d.setDate(d.getDate() + selectedDuration);
    return d.toISOString().split("T")[0];
  }, [startDate, selectedDuration]);

  const shabbatAutoDetected = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return detectShabbatNights(new Date(startDate), new Date(endDate));
  }, [startDate, endDate]);

  const effectiveGroupSize = getEffectiveGroupSize({
    adults,
    children: children.map(age => ({ age })),
  });

  // ── Tour toggle ───────────────────────────────────────────
  const toggleTour = useCallback(
    (slug: string) => {
      setSelectedTourSlugs(prev => {
        if (prev.includes(slug)) {
          return prev.filter(s => s !== slug);
        }
        const maxTours = selectedDuration ?? 7;
        if (prev.length >= maxTours) return prev;
        return [...prev, slug];
      });
    },
    [selectedDuration]
  );

  const moveTourUp = (index: number) => {
    if (index === 0) return;
    setSelectedTourSlugs(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveTourDown = (index: number) => {
    setSelectedTourSlugs(prev => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  // ── Pre-built package selection ───────────────────────────
  const selectSuggestedPackage = (pkg: SuggestedPackage) => {
    setSelectedDuration(pkg.days);
    setSelectedTourSlugs(pkg.tourSlugs);
    setCurrentStep(3); // skip to customize
  };

  // ── Children helpers ──────────────────────────────────────
  const addChild = () => setChildren(prev => [...prev, 5]);
  const removeChild = (index: number) =>
    setChildren(prev => prev.filter((_, i) => i !== index));
  const updateChildAge = (index: number, age: number) =>
    setChildren(prev => prev.map((a, i) => (i === index ? age : a)));

  // ── WhatsApp handler ──────────────────────────────────────
  const handleWhatsApp = () => {
    const tourNames = selectedTours
      .map((t, i) => `${i + 1}. ${isHebrew ? t.nameHe : t.nameEn}`)
      .join("\n");

    const addons = [];
    if (includesHotels) addons.push(isHebrew ? "מלונות" : "Hotels");
    if (includesFood) addons.push(isHebrew ? "ארוחות כשרות" : "Kosher Meals");
    if (includesAttractions) addons.push(isHebrew ? "אטרקציות" : "Attractions");
    if (needsShabbatHotel) addons.push(isHebrew ? "מלון שבת" : "Shabbat Hotel");

    const message = isHebrew
      ? `היי WIRO 4x4! בניתי חבילה של ${selectedDuration} ימים באתר:\n\n${tourNames}\n\nקבוצה: ${adults} מבוגרים${children.length > 0 ? `, ${children.length} ילדים` : ""}\nתאריך: ${startDate}\n${addons.length > 0 ? `תוספות: ${addons.join(", ")}\n` : ""}\nאשמח לקבל הצעת מחיר מדויקת!`
      : `Hi WIRO 4x4! I built a ${selectedDuration}-day package on your site:\n\n${tourNames}\n\nGroup: ${adults} adults${children.length > 0 ? `, ${children.length} children` : ""}\nStart date: ${startDate}\n${addons.length > 0 ? `Add-ons: ${addons.join(", ")}\n` : ""}\nPlease send me an exact quote!`;

    const tracked = buildTrackedWhatsAppLink({
      sourceCode: isHebrew ? "PACKAGES-REQUEST-HE" : "PACKAGES-REQUEST-EN",
      humanMessage: message,
    });
    trackEvent("whatsapp_click", tracked.eventProperties);
    window.open(tracked.href, "_blank");
  };

  // ── Lead submission handler ───────────────────────────────
  const handleSubmitQuote = async () => {
    if (!quoteName || !quoteEmail) return;
    setQuoteSubmitting(true);

    const tourNames = selectedTours
      .map((t, i) => `${i + 1}. ${t.nameEn}`)
      .join(", ");
    const total = "To be confirmed personally";

    try {
      await leadMutation.mutateAsync({
        name: quoteName,
        email: quoteEmail,
        phone: quotePhone || undefined,
        source: "package-builder",
        interestedTours: tourNames,
        message: `${selectedDuration}-day package request. Group: ${adults} adults, ${children.length} children. Start: ${startDate}. Hotels: ${includesHotels}, Kosher meals: ${includesFood}. Est. total: ${total}`,
      });
      setQuoteSubmitted(true);
    } catch {
      // error handled by tRPC
    } finally {
      setQuoteSubmitting(false);
    }
  };

  // ── Step navigation ───────────────────────────────────────
  const canGoToStep2 = selectedDuration !== null;
  const canGoToStep3 = selectedTourSlugs.length >= 1;
  const canGoToStep4 = canGoToStep3;

  const goToStep = (step: Step) => {
    if (step === 2 && !canGoToStep2) return;
    if (step === 3 && !canGoToStep3) return;
    if (step === 4 && !canGoToStep4) return;
    setCurrentStep(step);
    // Scroll to builder
    const el = document.getElementById("package-builder");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Step indicators ───────────────────────────────────────
  const steps = [
    {
      num: 1 as Step,
      labelEn: "Duration",
      labelHe: "משך",
    },
    {
      num: 2 as Step,
      labelEn: "Select Tours",
      labelHe: "בחרו טיולים",
    },
    {
      num: 3 as Step,
      labelEn: "Customize",
      labelHe: "התאמה אישית",
    },
    {
      num: 4 as Step,
      labelEn: "Review & Quote",
      labelHe: "סקירה והצעת מחיר",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        {/* ── Hero Banner ──────────────────────────────────── */}
        <section className="relative h-64 md:h-80 overflow-hidden">
          <OptimizedImage
            src="wiro_fleet_lineup"
            alt={t(
              "WIRO 4x4 fleet of off-road vehicles",
              "צי רכבי השטח של WIRO 4x4"
            )}
            className="w-full h-full object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
            <Breadcrumb
              items={[
                {
                  label: t("Multi-Day Packages", "חבילות רב-יומיות"),
                },
              ]}
            />
            <h1 className="text-3xl md:text-5xl font-bold text-white mt-2">
              {t("Build Your Adventure Package", "בנו את חבילת ההרפתקה שלכם")}
            </h1>
            <p className="text-white/80 mt-2 max-w-xl text-lg">
              {t(
                "Combine multiple days. Choose a ready-made package or build your own.",
                "שלבו מספר ימים. בחרו חבילה מוכנה או בנו משלכם."
              )}
            </p>
          </div>
        </section>

        {/* ── Suggested Packages ───────────────────────────── */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-3">
                <Sparkles className="w-4 h-4" />
                {t("Popular Packages", "חבילות פופולריות")}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">
                {t("Start with a Suggested Package", "התחילו עם חבילה מומלצת")}
              </h2>
              <p className="text-muted-foreground mt-2">
                {t(
                  "Pick one and customize it to your needs, or build from scratch below.",
                  "בחרו אחת והתאימו לצרכים שלכם, או בנו מאפס למטה."
                )}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {SUGGESTED_PACKAGES.map(pkg => {
                return (
                  <Card
                    key={pkg.nameEn}
                    className="overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div className="relative h-44">
                      <img
                        src={pkg.image}
                        alt={t(pkg.nameEn, pkg.nameHe)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-3 left-3 bg-primary/60 text-white text-xs font-medium px-2.5 py-1 rounded">
                        {pkg.days} {t("days", "ימים")}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold mb-1">
                        {t(pkg.nameEn, pkg.nameHe)}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {t(pkg.descEn, pkg.descHe)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                        <MapPin className="w-3.5 h-3.5" />
                        {pkg.tourSlugs.length} {t("tours", "סיורים")}
                      </div>
                      <Button
                        onClick={() => selectSuggestedPackage(pkg)}
                        variant="outline"
                        className="w-full border-accent text-accent hover:bg-accent/10"
                      >
                        {t("Customize This Package", "התאימו חבילה זו")}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Package Builder ──────────────────────────────── */}
        <section id="package-builder" className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">
                {t("Build Your Own Package", "בנו את החבילה שלכם")}
              </h2>
              <p className="text-muted-foreground mt-2">
                {t(
                  "Follow the steps below to create your perfect multi-day adventure.",
                  "עקבו אחר השלבים למטה כדי ליצור את ההרפתקה הרב-יומית המושלמת."
                )}
              </p>
            </div>

            {/* Step Progress Bar */}
            <div className="max-w-3xl mx-auto mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, idx) => (
                  <div key={step.num} className="flex items-center flex-1">
                    <button
                      onClick={() => goToStep(step.num)}
                      className={`flex items-center gap-2 transition-colors ${
                        currentStep === step.num
                          ? "text-accent font-bold"
                          : currentStep > step.num
                            ? "text-green-600"
                            : "text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0 ${
                          currentStep === step.num
                            ? "border-accent bg-accent text-white"
                            : currentStep > step.num
                              ? "border-green-600 bg-green-600 text-white"
                              : "border-muted-foreground/30"
                        }`}
                      >
                        {currentStep > step.num ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          step.num
                        )}
                      </span>
                      <span className="hidden sm:inline text-sm">
                        {t(step.labelEn, step.labelHe)}
                      </span>
                    </button>
                    {idx < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 ${
                          currentStep > step.num
                            ? "bg-green-600"
                            : "bg-muted-foreground/20"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="max-w-3xl mx-auto">
              {/* ── Step 1: Choose Duration ────────────────── */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-accent" />
                    {t("Choose Your Package Duration", "בחרו את משך החבילה")}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {DURATION_OPTIONS.map(opt => (
                      <button
                        key={opt.days}
                        onClick={() => {
                          setSelectedDuration(opt.days);
                          // Trim tours if needed
                          setSelectedTourSlugs(prev => prev.slice(0, opt.days));
                        }}
                        className={`relative p-6 rounded-lg border-2 text-center transition-all hover:shadow-md ${
                          selectedDuration === opt.days
                            ? "border-accent bg-accent/5 ring-1 ring-accent"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        <div className="text-3xl font-bold text-primary mb-1">
                          {opt.days}
                        </div>
                        <div className="text-sm font-medium">
                          {t(opt.labelEn, opt.labelHe)}
                        </div>
                        <div className="mt-2 inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          {t("Personally planned", "בתכנון אישי")}
                        </div>
                        {selectedDuration === opt.days && (
                          <div className="absolute top-2 right-2 bg-accent text-white rounded-full p-0.5">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => goToStep(2)}
                      disabled={!canGoToStep2}
                      className="bg-accent hover:bg-accent-cta-hover text-white"
                    >
                      {t("Next: Select Tours", "הבא: בחרו טיולים")}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Select Tours ───────────────────── */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Mountain className="w-5 h-5 text-accent" />
                      {t("Select Your Tours", "בחרו את הטיולים שלכם")}
                    </h3>
                    <span className="text-sm font-medium bg-accent/10 text-accent px-3 py-1 rounded-full">
                      {totalTourDays} / {selectedDuration ?? "?"}{" "}
                      {t("days selected", "ימים נבחרו")}
                    </span>
                  </div>

                  {/* Tour grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {availableTours.map(tour => {
                      const isSelected = selectedTourSlugs.includes(tour.slug);
                      const imgMap = TOUR_IMAGE_MAP[tour.slug];
                      const imgSrc =
                        imgMap?.jpg ||
                        tour.imageUrl ||
                        "/images/optimized/samoeng_valley.jpg";
                      const isFull =
                        !isSelected &&
                        selectedTourSlugs.length >= (selectedDuration ?? 7);

                      return (
                        <Card
                          key={tour.id}
                          onClick={() => toggleTour(tour.slug)}
                          className={`cursor-pointer overflow-hidden transition-all ${
                            isSelected
                              ? "ring-2 ring-accent shadow-md"
                              : "hover:shadow-md"
                          } ${isFull ? "opacity-50 pointer-events-none" : ""}`}
                        >
                          <div className="relative h-36">
                            <img
                              src={imgSrc}
                              alt={t(tour.name, tour.nameHe || tour.name)}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-accent text-white rounded-full p-1">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <h4 className="font-semibold text-sm mb-1">
                              {t(tour.name, tour.nameHe || tour.name)}
                            </h4>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {tour.duration}
                              </span>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Selected order */}
                  {selectedTourSlugs.length > 0 && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4 text-accent" />
                        {t("Your Itinerary Order", "סדר המסלול שלכם")}
                      </h4>
                      <div className="space-y-2">
                        {selectedTourSlugs.map((slug, idx) => {
                          const tour = availableTours.find(
                            t => t.slug === slug
                          );
                          if (!tour) return null;
                          return (
                            <div
                              key={slug}
                              className="flex items-center gap-3 bg-background rounded-md px-3 py-2"
                            >
                              <span className="text-xs font-bold text-accent w-6 text-center">
                                {t(`Day ${idx + 1}`, `יום ${idx + 1}`)}
                              </span>
                              <span className="flex-1 text-sm font-medium truncate">
                                {t(tour.name, tour.nameHe || tour.name)}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    moveTourUp(idx);
                                  }}
                                  disabled={idx === 0}
                                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                  aria-label={t("Move up", "הזז למעלה")}
                                >
                                  <ArrowLeft className="w-3 h-3 rotate-90" />
                                </button>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    moveTourDown(idx);
                                  }}
                                  disabled={
                                    idx === selectedTourSlugs.length - 1
                                  }
                                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                  aria-label={t("Move down", "הזז למטה")}
                                >
                                  <ArrowLeft className="w-3 h-3 -rotate-90" />
                                </button>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    toggleTour(slug);
                                  }}
                                  className="p-1 text-red-500 hover:text-red-700"
                                  aria-label={t("Remove", "הסר")}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => goToStep(1)}>
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      {t("Back", "חזרה")}
                    </Button>
                    <Button
                      onClick={() => goToStep(3)}
                      disabled={!canGoToStep3}
                      className="bg-accent hover:bg-accent-cta-hover text-white"
                    >
                      {t("Next: Customize", "הבא: התאמה אישית")}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Step 3: Customize ──────────────────────── */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Group Size */}
                  <Card className="p-5 border border-accent/30 rounded-lg">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-accent" />
                      {t("Group Size", "גודל הקבוצה")}
                    </h3>

                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium">
                        {t("Adults", "מבוגרים")}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setAdults(a => Math.max(1, a - 1))}
                          className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          aria-label={t("Decrease adults", "הפחיתו מבוגרים")}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-lg">
                          {adults}
                        </span>
                        <button
                          onClick={() => setAdults(a => a + 1)}
                          className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          aria-label={t("Increase adults", "הוסיפו מבוגרים")}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium flex items-center gap-2">
                          <Baby className="w-4 h-4" />
                          {t("Children", "ילדים")}
                        </span>
                        <button
                          onClick={addChild}
                          className="text-sm text-accent hover:text-accent/80 font-medium flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          {t("Add child", "הוסיפו ילד")}
                        </button>
                      </div>

                      {children.length > 0 && (
                        <div className="space-y-2">
                          {children.map((age, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground w-20">
                                {t(`Child ${idx + 1}`, `ילד ${idx + 1}`)}
                              </span>
                              <select
                                value={age}
                                onChange={e =>
                                  updateChildAge(idx, parseInt(e.target.value))
                                }
                                aria-label={t(
                                  `Age of child ${idx + 1}`,
                                  `גיל ילד ${idx + 1}`
                                )}
                                className="flex-1 px-3 py-2 border border-border rounded-sm text-sm"
                              >
                                {Array.from({ length: 18 }, (_, i) => (
                                  <option key={i} value={i}>
                                    {i === 0
                                      ? t("Under 1", "מתחת לגיל 1")
                                      : t(`Age ${i}`, `גיל ${i}`)}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => removeChild(idx)}
                                className="text-red-500 hover:text-red-700 p-1"
                                aria-label={t("Remove child", "הסרת ילד")}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <p className="text-xs text-muted-foreground mt-1">
                            {t(
                              "Share each child’s age so we can tailor the trip.",
                              "ציינו את גיל כל ילד כדי שנוכל להתאים את הטיול."
                            )}
                          </p>
                        </div>
                      )}

                      {isCustomQuoteRequired(effectiveGroupSize) && (
                        <div className="mt-3 text-sm text-amber-600 font-medium">
                          {t(
                            "Groups of 7+ require a custom quote",
                            "קבוצות של 7+ דורשות הצעת מחיר מותאמת"
                          )}
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Add-ons */}
                  <Card className="p-5 border border-accent/30 rounded-lg">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-accent" />
                      {t("Add-ons & Services", "תוספות ושירותים")}
                    </h3>

                    <div className="space-y-3">
                      <ServiceToggle
                        icon={Hotel}
                        label={t("Hotel Accommodation", "לינה במלון")}
                        detail={t("Tailored to your trip", "בהתאמה לטיול שלכם")}
                        checked={includesHotels}
                        onChange={setIncludesHotels}
                      />
                      <ServiceToggle
                        icon={Utensils}
                        label={t("Kosher Meals", "ארוחות כשרות")}
                        detail={t("Tailored to your trip", "בהתאמה לטיול שלכם")}
                        checked={includesFood}
                        onChange={setIncludesFood}
                      />
                      <ServiceToggle
                        icon={Mountain}
                        label={t(
                          "Attractions & Activities",
                          "אטרקציות ופעילויות"
                        )}
                        detail={t("Tailored to your trip", "בהתאמה לטיול שלכם")}
                        checked={includesAttractions}
                        onChange={setIncludesAttractions}
                      />
                      {includesAttractions && (
                        <div className="ml-10 flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {t("Number of attractions:", "מספר אטרקציות:")}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setAttractionCount(c => Math.max(1, c - 1))
                              }
                              className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted text-sm"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-medium">
                              {attractionCount}
                            </span>
                            <button
                              onClick={() => setAttractionCount(c => c + 1)}
                              className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted text-sm"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                      <ServiceToggle
                        icon={Hotel}
                        label={t(
                          "Shabbat Hotel (near Chabad)",
                          'מלון שבת (ליד חב"ד)'
                        )}
                        detail={t("Tailored to your trip", "בהתאמה לטיול שלכם")}
                        checked={needsShabbatHotel}
                        onChange={setNeedsShabbatHotel}
                      />
                    </div>
                  </Card>

                  {/* Start Date */}
                  <Card className="p-5 border border-accent/30 rounded-lg">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-accent" />
                      {t("Preferred Start Date", "תאריך התחלה מועדף")}
                    </h3>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full max-w-xs px-4 py-3 border border-border rounded-sm focus:ring-2 focus:ring-accent focus:border-transparent text-base"
                    />
                    {shabbatAutoDetected > 0 && (
                      <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-sm text-sm text-amber-800">
                        {t(
                          `Your trip includes ${shabbatAutoDetected} Friday night${shabbatAutoDetected > 1 ? "s" : ""} (Shabbat)`,
                          `הטיול שלכם כולל ${shabbatAutoDetected} ליל${shabbatAutoDetected > 1 ? "ות" : ""} שישי (שבת)`
                        )}
                      </div>
                    )}
                  </Card>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => goToStep(2)}>
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      {t("Back", "חזרה")}
                    </Button>
                    <Button
                      onClick={() => goToStep(4)}
                      disabled={!canGoToStep4}
                      className="bg-accent hover:bg-accent-cta-hover text-white"
                    >
                      {t("Next: Review & Quote", "הבא: סקירה והצעת מחיר")}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Step 4: Review & Quote ─────────────────── */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Package className="w-5 h-5 text-accent" />
                    {t("Your Package Summary", "סיכום החבילה שלכם")}
                  </h3>

                  {/* Itinerary */}
                  <Card className="p-5 border border-accent/30 rounded-lg">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      {t("Day-by-Day Itinerary", "מסלול יום אחר יום")}
                    </h4>
                    <div className="space-y-3">
                      {selectedTourSlugs.map((slug, idx) => {
                        const tour = availableTours.find(t => t.slug === slug);
                        if (!tour) return null;
                        const imgMap = TOUR_IMAGE_MAP[slug];
                        const imgSrc =
                          imgMap?.jpg ||
                          tour.imageUrl ||
                          "/images/optimized/samoeng_valley.jpg";

                        return (
                          <div
                            key={slug}
                            className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                          >
                            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                              <img
                                src={imgSrc}
                                alt={t(tour.name, tour.nameHe || tour.name)}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-accent">
                                {t(`Day ${idx + 1}`, `יום ${idx + 1}`)}
                              </div>
                              <div className="font-medium text-sm truncate">
                                {t(tour.name, tour.nameHe || tour.name)}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {tour.duration}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Rest days for 7-day package */}
                      {selectedDuration &&
                        selectedTourSlugs.length < selectedDuration && (
                          <div className="text-sm text-muted-foreground italic px-3 py-2">
                            {t(
                              `+ ${selectedDuration - selectedTourSlugs.length} rest/free day(s) in Chiang Mai`,
                              `+ ${selectedDuration - selectedTourSlugs.length} ימי מנוחה/חופשי בצ'יאנג מאי`
                            )}
                          </div>
                        )}
                    </div>
                  </Card>

                  {/* Trip Details */}
                  <Card className="p-5 border border-accent/30 rounded-lg">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      {t("Trip Details", "פרטי הטיול")}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          {t("Duration", "משך")}
                        </span>
                        <div className="font-medium">
                          {selectedDuration} {t("days", "ימים")}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("Group", "קבוצה")}
                        </span>
                        <div className="font-medium">
                          {adults} {t("adults", "מבוגרים")}
                          {children.length > 0 &&
                            `, ${children.length} ${t("children", "ילדים")}`}
                        </div>
                      </div>
                      {startDate && (
                        <div>
                          <span className="text-muted-foreground">
                            {t("Start Date", "תאריך התחלה")}
                          </span>
                          <div className="font-medium">{startDate}</div>
                        </div>
                      )}
                    </div>
                  </Card>

                  <p className="rounded-lg border p-5">
                    {t(
                      "Send your itinerary to receive a personalized proposal from our team.",
                      "שלחו את המסלול לקבלת הצעה אישית מהצוות שלנו."
                    )}
                  </p>

                  {/* CTA Buttons */}
                  <div className="space-y-4">
                    <Button
                      onClick={handleWhatsApp}
                      className="w-full py-3 text-base bg-green-600 hover:bg-green-700 text-white"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      {t(
                        "Request This Package via WhatsApp",
                        "בקשו חבילה זו בוואטסאפ"
                      )}
                    </Button>

                    {/* Get Formal Quote form */}
                    {!quoteSubmitted ? (
                      <Card className="p-5 border border-accent/30 rounded-lg">
                        <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                          <Send className="w-4 h-4 text-accent" />
                          {t(
                            "Get a Formal Quote by Email",
                            "קבלו הצעת מחיר רשמית במייל"
                          )}
                        </h4>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={quoteName}
                            onChange={e => setQuoteName(e.target.value)}
                            placeholder={t("Your name", "השם שלכם")}
                            className="w-full px-4 py-2.5 border border-border rounded-sm text-sm focus:ring-2 focus:ring-accent focus:border-transparent"
                          />
                          <input
                            type="email"
                            value={quoteEmail}
                            onChange={e => setQuoteEmail(e.target.value)}
                            placeholder={t("Email address", "כתובת מייל")}
                            className="w-full px-4 py-2.5 border border-border rounded-sm text-sm focus:ring-2 focus:ring-accent focus:border-transparent"
                          />
                          <input
                            type="tel"
                            value={quotePhone}
                            onChange={e => setQuotePhone(e.target.value)}
                            placeholder={t(
                              "Phone (optional)",
                              "טלפון (אופציונלי)"
                            )}
                            className="w-full px-4 py-2.5 border border-border rounded-sm text-sm focus:ring-2 focus:ring-accent focus:border-transparent"
                          />
                          <Button
                            onClick={handleSubmitQuote}
                            disabled={
                              !quoteName || !quoteEmail || quoteSubmitting
                            }
                            variant="outline"
                            className="w-full border-accent text-accent hover:bg-accent/10"
                          >
                            {quoteSubmitting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t("Submitting...", "שולח...")}
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                {t("Get Formal Quote", "קבלו הצעת מחיר רשמית")}
                              </>
                            )}
                          </Button>
                        </div>
                      </Card>
                    ) : (
                      <Card className="p-5 border border-green-200 bg-green-50 rounded-lg text-center">
                        <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h4 className="font-bold text-green-800 mb-1">
                          {t("Quote Request Sent!", "בקשת הצעת מחיר נשלחה!")}
                        </h4>
                        <p className="text-sm text-green-700">
                          {t(
                            "We'll get back to you within 24 hours with a detailed quote.",
                            "נחזור אליכם תוך 24 שעות עם הצעת מחיר מפורטת."
                          )}
                        </p>
                      </Card>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    {t(
                      "Your proposal will be confirmed personally before booking.",
                      "ההצעה שלכם תאושר אישית לפני ההזמנה."
                    )}
                  </p>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => goToStep(3)}>
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      {t("Back", "חזרה")}
                    </Button>
                    <Link href={bookingUrl}>
                      <Button className="bg-accent-cta hover:bg-accent-cta-hover text-white">
                        {t("Book Now", "להזמנה")}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingActionButtons />
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function ServiceToggle({
  icon: Icon,
  label,
  detail,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  detail: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 p-3 rounded-sm hover:bg-muted/50 cursor-pointer transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-5 h-5 rounded border-border text-accent focus:ring-accent"
      />
      <Icon className="w-5 h-5 text-accent shrink-0" />
      <span className="font-medium flex-1">{label}</span>
      <span className="text-xs text-muted-foreground">{detail}</span>
    </label>
  );
}
