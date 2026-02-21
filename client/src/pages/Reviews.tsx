import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, MessageSquare, Send, ArrowUpDown } from "lucide-react";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Breadcrumb } from "@/components/Breadcrumb";

const TOUR_TYPES = [
  { id: "waterfall", en: "Waterfall Adventure", he: "טיול מפלים" },
  { id: "mountain", en: "Mountain Explorer", he: "טיול הרים" },
  { id: "cultural", en: "Cultural Journey", he: "טיול תרבותי" },
  { id: "multi-day", en: "Multi-Day Expedition", he: "טיול רב-יומי" },
  { id: "custom", en: "Custom Tour", he: "טיול בהתאמה אישית" },
];

function StarRating({
  rating,
  onRate,
  interactive = false,
}: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
}) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const { t } = useLanguage();

  const displayRating =
    interactive && hoveredStar !== null ? hoveredStar : rating;

  if (!interactive) {
    return (
      <div
        className="flex gap-1"
        role="img"
        aria-label={t(`${rating} out of 5 stars`, `${rating} מתוך 5 כוכבים`)}
      >
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`text-2xl ${star <= rating ? "text-[#D4AF37]" : "text-[#E8E2DA]"}`}
            aria-hidden="true"
          >
            ★
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex gap-1"
      role="radiogroup"
      aria-label={t("Star rating", "דירוג כוכבים")}
    >
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 ${
            star <= displayRating ? "text-[#D4AF37]" : "text-[#E8E2DA]"
          } hover:scale-110`}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => setHoveredStar(star)}
          onMouseLeave={() => setHoveredStar(null)}
          aria-label={t(
            `Rate ${star} out of 5 stars`,
            `דרג ${star} מתוך 5 כוכבים`
          )}
          role="radio"
          aria-checked={star === rating}
        >
          <span
            className="text-2xl leading-none select-none"
            style={{ fontSize: "24px" }}
            aria-hidden="true"
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export default function Reviews() {
  const { t, language } = useLanguage();
  const isHebrew = language === "he";
  usePageMeta(
    "Guest Reviews",
    "Read what our guests say about their WIRO 4x4 kosher off-road adventures in Chiang Mai."
  );
  const sectionRef = useScrollReveal<HTMLDivElement>({ y: 40, duration: 0.6 });
  const [filterTourType, setFilterTourType] = useState("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "highest" | "lowest"
  >("newest");
  const [showSuccess, setShowSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const REVIEWS_PER_PAGE = 6;
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 5,
    text: "",
    tourType: "",
  });

  const { data: reviewsList, isLoading } = trpc.review.listPublic.useQuery();
  const utils = trpc.useUtils();

  const createReview = trpc.review.create.useMutation({
    onSuccess: () => {
      setShowSuccess(true);
      setFormError("");
      setFormData({ name: "", email: "", rating: 5, text: "", tourType: "" });
      utils.review.listPublic.invalidate();
    },
    onError: error => {
      setFormError(
        error.message ||
          (isHebrew ? "שגיאה בשליחת חוות הדעת" : "Error submitting review")
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError(isHebrew ? "יש למלא שם" : "Name is required");
      return;
    }
    if (!formData.email.trim()) {
      setFormError(isHebrew ? "יש למלא מייל" : "Email is required");
      return;
    }
    if (!formData.text.trim()) {
      setFormError(isHebrew ? "יש לכתוב חוות דעת" : "Review text is required");
      return;
    }

    createReview.mutate({
      ...formData,
      tourType: formData.tourType || undefined,
    });
  };

  const filteredReviews = useMemo(() => {
    const filtered =
      reviewsList?.filter(
        review => filterTourType === "all" || review.tourType === filterTourType
      ) || [];
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });
  }, [reviewsList, filterTourType, sortBy]);

  const visibleReviews = filteredReviews.slice(0, visibleCount);
  const hasMore = visibleCount < filteredReviews.length;

  return (
    <div className="min-h-screen">
      <Header />
      <Breadcrumb
        items={[
          { label: t("Reviews", "\u05D1\u05D9\u05E7\u05D5\u05E8\u05D5\u05EA") },
        ]}
      />
      <main id="main-content">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#1C1C1C] to-[#1C1C1C]/90 py-16 md:py-20 text-center text-[#FAF7F2] mt-20">
          <div className="container">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl md:text-5xl font-serif font-medium mb-3 md:mb-4">
              {t("Guest Reviews", "חוות דעת של אורחים")}
            </h1>
            <GoldDivider className="my-4" />
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              {t(
                "Read what our guests say about their WIRO 4x4 adventures and share your own experience",
                "קראו מה אומרים המטיילים שלנו ושתפו גם את החוויה שלכם"
              )}
            </p>
          </div>
        </section>

        <div ref={sectionRef} className="container py-8 md:py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Review Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {showSuccess ? (
                  <Card className="border-green-200 bg-green-50 rounded-sm">
                    <CardContent className="pt-6 text-center">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-green-800 mb-2">
                        {t("Thank You!", "תודה!")}
                      </h3>
                      <p className="text-green-700 mb-4">
                        {t(
                          "Your review has been submitted and will appear after approval.",
                          "חוות הדעת נשלחה ותופיע אחרי אישור."
                        )}
                      </p>
                      <Button
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-100"
                        onClick={() => setShowSuccess(false)}
                      >
                        {t("Write Another Review", "כתבו חוות דעת נוספת")}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border border-[#D4AF37]/30 rounded-sm">
                    <CardHeader>
                      <CardTitle className="text-[#D4AF37]">
                        {t("Share Your Experience", "שתפו את החוויה שלכם")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {formError && (
                          <Alert variant="destructive">
                            <AlertDescription>{formError}</AlertDescription>
                          </Alert>
                        )}

                        <div>
                          <label className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1">
                            {t("Your Name *", "השם שלך *")}
                          </label>
                          <Input
                            value={formData.name}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder={isHebrew ? "שם מלא" : "Full Name"}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1">
                            {t("Email *", "מייל *")}
                          </label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            placeholder="email@example.com"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1">
                            {t("Rating *", "דירוג *")}
                          </label>
                          <StarRating
                            rating={formData.rating}
                            onRate={r =>
                              setFormData(prev => ({ ...prev, rating: r }))
                            }
                            interactive
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1">
                            {t("Tour Type", "סוג הטיול")}
                          </label>
                          <select
                            value={formData.tourType}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                tourType: e.target.value,
                              }))
                            }
                            className="w-full h-9 rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                          >
                            <option value="">
                              {isHebrew
                                ? "בחרו סוג טיול..."
                                : "Select tour type..."}
                            </option>
                            {TOUR_TYPES.map(type => (
                              <option key={type.id} value={type.id}>
                                {isHebrew ? type.he : type.en}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1">
                            {t("Your Review *", "חוות הדעת שלכם *")}
                          </label>
                          <Textarea
                            value={formData.text}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                text: e.target.value,
                              }))
                            }
                            placeholder={
                              isHebrew
                                ? "ספרו לנו על החוויה שלכם..."
                                : "Tell us about your experience..."
                            }
                            rows={4}
                          />
                        </div>

                        <Button
                          type="submit"
                          variant="default"
                          className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white"
                          disabled={createReview.isPending}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {createReview.isPending
                            ? isHebrew
                              ? "שולחים..."
                              : "Submitting..."
                            : isHebrew
                              ? "שלחו חוות דעת"
                              : "Submit Review"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <Button
                  variant={filterTourType === "all" ? "default" : "outline"}
                  className={`rounded-full ${filterTourType === "all" ? "bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white" : ""}`}
                  onClick={() => {
                    setFilterTourType("all");
                    setVisibleCount(REVIEWS_PER_PAGE);
                  }}
                  size="sm"
                >
                  {t("All", "הכל")}
                </Button>
                {TOUR_TYPES.map(type => (
                  <Button
                    key={type.id}
                    variant={filterTourType === type.id ? "default" : "outline"}
                    className={`rounded-full ${filterTourType === type.id ? "bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white" : ""}`}
                    onClick={() => {
                      setFilterTourType(type.id);
                      setVisibleCount(REVIEWS_PER_PAGE);
                    }}
                    size="sm"
                  >
                    {isHebrew ? type.he : type.en}
                  </Button>
                ))}

                <div className="ml-auto flex items-center gap-1.5">
                  <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                  <select
                    value={sortBy}
                    onChange={e => {
                      setSortBy(e.target.value as typeof sortBy);
                      setVisibleCount(REVIEWS_PER_PAGE);
                    }}
                    className="h-8 rounded-sm border border-input bg-transparent px-2 text-sm shadow-xs"
                  >
                    <option value="newest">
                      {isHebrew ? "חדש ביותר" : "Newest"}
                    </option>
                    <option value="oldest">
                      {isHebrew ? "ישן ביותר" : "Oldest"}
                    </option>
                    <option value="highest">
                      {isHebrew ? "דירוג גבוה" : "Highest Rated"}
                    </option>
                    <option value="lowest">
                      {isHebrew ? "דירוג נמוך" : "Lowest Rated"}
                    </option>
                  </select>
                </div>
              </div>

              {isLoading && (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full mx-auto"></div>
                </div>
              )}

              {!isLoading && filteredReviews.length === 0 && (
                <div className="text-center py-16">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                    {t("No reviews yet", "אין חוות דעת עדיין")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t(
                      "Be the first to share your experience!",
                      "היו הראשונים לכתוב!"
                    )}
                  </p>
                </div>
              )}

              {!isLoading && filteredReviews.length > 0 && (
                <div className="space-y-4">
                  {visibleReviews.map(review => (
                    <Card key={review.id} className="rounded-sm">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {review.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <StarRating rating={review.rating} />
                              {review.tourType && (
                                <Badge variant="secondary" className="text-xs">
                                  {TOUR_TYPES.find(
                                    t => t.id === review.tourType
                                  )?.[isHebrew ? "he" : "en"] ||
                                    review.tourType}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {review.createdAt
                              ? new Date(review.createdAt).toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span
                            className="text-4xl text-[#D4AF37] leading-none select-none"
                            aria-hidden="true"
                          >
                            {"\u201C"}
                          </span>
                          <p
                            className="text-foreground/80 leading-relaxed italic"
                            style={{
                              fontFamily: "'Cormorant Garamond', serif",
                            }}
                          >
                            {review.text}
                          </p>
                        </div>

                        {review.adminResponse && (
                          <div className="mt-4 pl-4 border-l-4 border-[#D4AF37] bg-[#D4AF37]/5 rounded-r-sm p-3">
                            <p className="text-sm font-semibold text-[#D4AF37] mb-1">
                              {t("Response from WIRO 4x4", "תגובה מ-WIRO 4x4")}
                            </p>
                            <p className="text-sm text-foreground/70">
                              {review.adminResponse}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {/* Show More / Show Less controls */}
                  <div className="flex justify-center gap-3 pt-4">
                    {hasMore && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          setVisibleCount(prev => prev + REVIEWS_PER_PAGE)
                        }
                      >
                        {t(
                          `Show More (${filteredReviews.length - visibleCount} remaining)`,
                          `הצג עוד (${filteredReviews.length - visibleCount} נשארו)`
                        )}
                      </Button>
                    )}
                    {visibleCount > REVIEWS_PER_PAGE && (
                      <Button
                        variant="ghost"
                        onClick={() => setVisibleCount(REVIEWS_PER_PAGE)}
                      >
                        {t("Show Less", "הצג פחות")}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <FloatingActionButtons />
      <Footer />
    </div>
  );
}
