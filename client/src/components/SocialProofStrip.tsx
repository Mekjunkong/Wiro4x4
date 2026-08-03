import { useLanguage } from "@/contexts/LanguageContext";
import {
  Star,
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

const TRIPADVISOR_REVIEW_SNAPSHOT = {
  rating: "5.0",
  reviewCount: 7,
} as const;

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

  // No reviews yet? Don't advertise the absence of proof. Skip the
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
                ? "Guest-submitted reviews appear here when approved. You can also check our independent Tripadvisor listing."
                : "Independent traveler feedback is available on Tripadvisor. Guest-submitted reviews will appear here when approved.",
              hasReviews
                ? "ביקורות אורחים שאושרו מופיעות כאן. אפשר לבדוק גם את עמוד Tripadvisor העצמאי שלנו."
                : "משוב עצמאי של מטיילים זמין ב-Tripadvisor. ביקורות אורחים יופיעו כאן לאחר אישורן."
            )}
          </p>
        </div>

        {hasReviews && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {topReviews.map(review => (
              <article
                key={`${review.name}-${review.createdAt ?? review.text}`}
                className="border border-border bg-card p-6 shadow-sm"
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
                <div className="mt-5 border-t border-border pt-4">
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

        <div className="mb-10 grid border-y border-border sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_BADGES.map(badge => (
            <div
              key={badge.en}
              className="flex min-h-20 items-center justify-center gap-3 border-border px-5 py-4 text-center sm:border-r last:sm:border-r-0"
            >
              <badge.icon
                className="h-5 w-5 shrink-0 text-accent"
                aria-hidden="true"
              />
              <span className="text-sm font-semibold text-foreground">
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
            className="inline-flex items-center gap-4 rounded-sm border border-accent/40 bg-card px-6 py-4 text-sm font-semibold text-accent-readable shadow-sm transition-colors hover:border-accent hover:bg-accent/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <span className="text-start">
              <span className="block text-base leading-tight">
                {t(
                  "Tripadvisor public reviews",
                  "ביקורות ציבוריות ב-Tripadvisor"
                )}
              </span>
              <span className="mt-1 block text-xs font-medium text-muted-foreground">
                {t(
                  `${TRIPADVISOR_REVIEW_SNAPSHOT.rating}/5 from ${TRIPADVISOR_REVIEW_SNAPSHOT.reviewCount} reviews`,
                  `${TRIPADVISOR_REVIEW_SNAPSHOT.rating}/5 מתוך ${TRIPADVISOR_REVIEW_SNAPSHOT.reviewCount} ביקורות`
                )}
              </span>
            </span>
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
