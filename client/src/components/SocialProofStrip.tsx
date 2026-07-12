import { useLanguage } from "@/contexts/LanguageContext";
import {
  Star,
  CheckCircle,
  Clock,
  Languages,
  Utensils,
  Lock,
  Flame,
  ExternalLink,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { COMPANY_TRIPADVISOR_URL } from "@/const";
import { trackEvent } from "@/lib/analytics";

const TRUST_BADGES = [
  {
    en: "Hebrew / English support",
    he: "מענה בעברית / אנגלית",
    icon: Languages,
  },
  { en: "Kosher meal planning", he: "תכנון אוכל כשר", icon: Utensils },
  { en: "Private tours only", he: "טיולים פרטיים בלבד", icon: Lock },
  { en: "Shabbat-aware scheduling", he: "תכנון מותאם שבת", icon: Flame },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-accent fill-accent" : "text-muted-foreground/40"}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function SocialProofStrip() {
  const { t, language } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>({ y: 30, duration: 0.5 });
  const { data: reviews } = trpc.review.listPublic.useQuery();

  const topReviews = (reviews || [])
    .filter(review => review.rating >= 4 && review.text?.trim())
    .slice(0, 3);

  // No reviews yet? Don't advertise the absence of proof — skip the
  // review cards and lead with the trust badges instead.
  const hasReviews = topReviews.length > 0;

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className="py-16 md:py-20 bg-background"
    >
      <div className="container max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-3">
            {t("Proof You Can Check", "הוכחות שאפשר לבדוק")}
          </h2>
          <GoldDivider />
          <p className="mx-auto mt-3 max-w-2xl text-sm md:text-base text-muted-foreground">
            {t(
              hasReviews
                ? "These approved website submissions come from our guests. You can also check our public review listing."
                : "No approved website reviews are shown yet. Check our public listing for independent traveler feedback.",
              hasReviews
                ? "הביקורות המאושרות באתר נשלחו על ידי האורחים שלנו. אפשר לבדוק גם את עמוד הביקורות הציבורי."
                : "עדיין לא מוצגות ביקורות מאושרות באתר. אפשר לבדוק משוב עצמאי של מטיילים בעמוד הציבורי שלנו."
            )}
          </p>
        </div>

        {hasReviews && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {topReviews.map(review => (
              <article
                key={`${review.name}-${review.createdAt ?? review.text}`}
                className="bg-card rounded-xl p-6 shadow-sm border border-border"
              >
                <div className="flex items-center justify-between gap-3">
                  <StarRating rating={review.rating} />
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {t("Approved website review", "ביקורת מאושרת באתר")}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-4">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                    {review.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {review.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("Submitted through this website", "נשלח דרך האתר")}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {TRUST_BADGES.map(badge => (
            <div
              key={badge.en}
              className="flex items-center gap-2 bg-card rounded-full px-4 py-2 border border-accent/20 shadow-sm"
            >
              <badge.icon className="h-4 w-4 text-accent" aria-hidden="true" />
              <span className="text-sm font-medium">
                {t(badge.en, badge.he)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center text-center">
          <a
            href={COMPANY_TRIPADVISOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("proof_open", {
                page: "/",
                placement: "tripadvisor",
                language,
              })
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
          >
            {t(
              "Read public reviews on Tripadvisor",
              "קראו ביקורות ציבוריות ב-Tripadvisor"
            )}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          <div className="inline-flex max-w-2xl items-center gap-2 rounded-full border border-accent/30 bg-card px-5 py-2 shadow-sm">
            <CheckCircle className="w-4 h-4 text-accent" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">
              {t(
                "Ask for route examples, review sources, and recent availability before you book.",
                "אפשר לבקש דוגמאות מסלול, מקורות ביקורות וזמינות עדכנית לפני ההזמנה."
              )}
            </span>
            <Clock
              className="hidden h-4 w-4 text-accent sm:block"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
