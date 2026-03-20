import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

/** Hardcoded fallback reviews shown when Google API is not configured. */
const FALLBACK_REVIEWS = [
  {
    author: "David Cohen",
    rating: 5,
    text: "Wiro was an incredible guide! He took us on an off-road adventure through Doi Inthanon that we'll never forget. The kosher meals were outstanding — fresh, authentic Thai flavors prepared with strict kashrut standards. Highly recommend for any Israeli family visiting Chiang Mai.",
    relativeTime: "2 months ago",
    profilePhoto: null,
    googleReviewUrl: null,
  },
  {
    author: "Sarah Levi",
    rating: 5,
    text: "Having a Hebrew-speaking guide made ALL the difference. Wiro explained the culture, history, and nature in our language which made the experience so much richer. The kids loved the waterfall trek at Mae Kampong. Best day of our Thailand trip!",
    relativeTime: "3 months ago",
    profilePhoto: null,
    googleReviewUrl: null,
  },
  {
    author: "Michael Ben-Ari",
    rating: 4,
    text: "The 4x4 ride through the jungle was exhilarating. Wiro is a skilled driver who knows every trail. We saw wild elephants at a distance which was magical. The only reason for 4 stars is I wish the tour was longer — I didn't want it to end!",
    relativeTime: "1 month ago",
    profilePhoto: null,
    googleReviewUrl: null,
  },
  {
    author: "Rachel Goldstein",
    rating: 5,
    text: "We booked the Samoeng Loop tour and it exceeded all expectations. Stunning mountain scenery, authentic hill tribe villages, and Wiro's knowledge of the area is encyclopedic. The kosher lunch he arranged at a local restaurant was delicious. A must-do in Chiang Mai!",
    relativeTime: "2 weeks ago",
    profilePhoto: null,
    googleReviewUrl: null,
  },
  {
    author: "Yonatan Shapira",
    rating: 5,
    text: "Third time booking with Wiro and each tour is better than the last. This time we did Doi Suthep beyond the temple — trails most tourists never see. He's patient, fun, and genuinely passionate about sharing northern Thailand. Already planning our next trip!",
    relativeTime: "3 weeks ago",
    profilePhoto: null,
    googleReviewUrl: null,
  },
];

/** Google "G" logo as inline SVG to avoid external dependency. */
function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={`text-lg ${star <= rating ? "text-accent" : "text-muted"}`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
}

function AuthorInitials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center shrink-0">
      {initials}
    </div>
  );
}

interface ReviewData {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
  profilePhoto: string | null;
  googleReviewUrl: string | null;
}

function ReviewCard({ review }: { review: ReviewData }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLanguage();
  const isLong = review.text.length > 180;
  const displayText =
    isLong && !expanded ? review.text.slice(0, 180) + "..." : review.text;

  return (
    <Card className="rounded-sm border border-border min-w-[300px] max-w-[400px] snap-start shrink-0 lg:min-w-0 lg:max-w-none lg:shrink">
      <CardContent className="pt-5 pb-4 px-5 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          {review.profilePhoto ? (
            <img
              src={review.profilePhoto}
              alt={review.author}
              className="w-10 h-10 rounded-full object-cover shrink-0"
              loading="lazy"
            />
          ) : (
            <AuthorInitials name={review.author} />
          )}
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{review.author}</p>
            <div className="flex items-center gap-2">
              <StarDisplay rating={review.rating} />
              <span className="text-xs text-muted-foreground">
                {review.relativeTime}
              </span>
            </div>
          </div>
          <GoogleLogo className="ml-auto shrink-0 opacity-70" />
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {displayText}
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-1 text-accent hover:underline text-sm font-medium"
            >
              {expanded
                ? t("Show less", "הצג פחות")
                : t("Read more", "קרא עוד")}
            </button>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

export function GoogleReviewsSection() {
  const { t, language } = useLanguage();
  const isHebrew = language === "he";
  const { data: googleReviews } = trpc.googleReviews.list.useQuery();

  const reviews =
    googleReviews && googleReviews.length > 0
      ? googleReviews
      : FALLBACK_REVIEWS;
  const isFallback = !googleReviews || googleReviews.length === 0;

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  }, [reviews]);

  // Horizontal scroll helpers for mobile carousel
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    if (!scrollRef) return;
    setCanScrollLeft(scrollRef.scrollLeft > 10);
    setCanScrollRight(
      scrollRef.scrollLeft < scrollRef.scrollWidth - scrollRef.clientWidth - 10
    );
  };

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef;
    if (!el) return;
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    return () => el.removeEventListener("scroll", updateScrollButtons);
  }, [scrollRef]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef) return;
    const amount = 340;
    scrollRef.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // Inject AggregateRating JSON-LD for SEO
  useEffect(() => {
    if (reviews.length === 0) return;
    const scriptId = "google-reviews-aggregate-json-ld";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      name: "WIRO 4x4",
      url: "https://www.wiro4x4indochina.com",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating,
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
    });
    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [reviews, avgRating]);

  return (
    <section className="py-10 md:py-14">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <GoogleLogo className="w-6 h-6" />
          <h2 className="text-2xl md:text-3xl font-serif font-medium">
            {t(
              "Google Reviews",
              "\u05D1\u05D9\u05E7\u05D5\u05E8\u05D5\u05EA \u05D2\u05D5\u05D2\u05DC"
            )}
          </h2>
        </div>

        {/* Aggregate rating summary */}
        <div className="flex items-center justify-center gap-3 text-sm">
          <span className="text-3xl font-bold text-foreground">
            {avgRating}
          </span>
          <div>
            <StarDisplay rating={Math.round(avgRating)} />
            <p className="text-muted-foreground">
              {t(
                `Based on ${reviews.length} review${reviews.length !== 1 ? "s" : ""}`,
                `\u05DE\u05D1\u05D5\u05E1\u05E1 \u05E2\u05DC ${reviews.length} \u05D1\u05D9\u05E7\u05D5\u05E8\u05D5\u05EA`
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews carousel (mobile) / grid (desktop) */}
      <div className="relative">
        {/* Scroll buttons — mobile/tablet only */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors lg:hidden"
            aria-label={t(
              "Previous reviews",
              "\u05D1\u05D9\u05E7\u05D5\u05E8\u05D5\u05EA \u05E7\u05D5\u05D3\u05DE\u05D5\u05EA"
            )}
          >
            {isHebrew ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors lg:hidden"
            aria-label={t(
              "Next reviews",
              "\u05D1\u05D9\u05E7\u05D5\u05E8\u05D5\u05EA \u05D4\u05D1\u05D0\u05D5\u05EA"
            )}
          >
            {isHebrew ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Mobile: horizontal scroll | Desktop: grid */}
        <div
          ref={setScrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide lg:grid lg:grid-cols-3 lg:overflow-x-visible lg:pb-0"
        >
          {reviews.map((review, i) => (
            <ReviewCard key={`${review.author}-${i}`} review={review} />
          ))}
        </div>
      </div>

      {/* Footer: fallback notice or "See all on Google" link */}
      <div className="text-center mt-6">
        {isFallback ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground italic">
              {t(
                "Sample reviews — Connect Google Reviews for live data",
                "\u05D1\u05D9\u05E7\u05D5\u05E8\u05D5\u05EA \u05DC\u05D3\u05D5\u05D2\u05DE\u05D4 \u2014 \u05D7\u05D1\u05E8\u05D5 \u05D0\u05EA Google Reviews \u05DC\u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05D7\u05D9\u05D9\u05DD"
              )}
            </p>
            <a
              href="https://g.page/r/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
            >
              <GoogleLogo className="w-4 h-4" />
              {t(
                "Leave us a review on Google!",
                "\u05D4\u05E9\u05D0\u05D9\u05E8\u05D5 \u05DC\u05E0\u05D5 \u05D1\u05D9\u05E7\u05D5\u05E8\u05EA \u05D1\u05D2\u05D5\u05D2\u05DC!"
              )}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <a
            href="https://search.google.com/local/reviews?placeid="
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            <GoogleLogo className="w-4 h-4" />
            {t(
              "See all reviews on Google",
              "\u05E6\u05E4\u05D5 \u05D1\u05DB\u05DC \u05D4\u05D1\u05D9\u05E7\u05D5\u05E8\u05D5\u05EA \u05D1\u05D2\u05D5\u05D2\u05DC"
            )}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </section>
  );
}
