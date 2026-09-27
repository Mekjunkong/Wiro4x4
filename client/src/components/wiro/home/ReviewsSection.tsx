import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { COMPANY_TRIPADVISOR_URL } from "@/const";
import { TRIPADVISOR_REVIEW_SNAPSHOT } from "@/components/SocialProofStrip";
import { Stars } from "../icons";

/**
 * Reviews come only from approved guest reviews (`review.listPublic`) plus
 * the public Tripadvisor listing. With no approved reviews we show the
 * Tripadvisor proof instead of sample quotes.
 */
export function ReviewsSection() {
  const { t } = useLanguage();
  const { data } = trpc.review.listPublic.useQuery();
  const reviews = (data ?? [])
    .filter(r => r.rating >= 4 && r.text?.trim())
    .slice(0, 3);

  return (
    <section
      id="reviews"
      className="wx wx-reviews"
      aria-labelledby="wx-reviews-title"
    >
      <div className="wx-wrap" style={{ padding: 0 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 24,
            marginBottom: 40,
          }}
        >
          <div>
            <p className="wx-caps wx-eyebrow" style={{ margin: 0 }}>
              {t("Reviews", "ביקורות")}
            </p>
            <h2
              id="wx-reviews-title"
              className="wx-h2"
              style={{ fontSize: "clamp(36px,5vw,60px)", lineHeight: 1 }}
            >
              {t("Proof you can check", "הוכחות שאפשר לבדוק")}
            </h2>
          </div>
          <a
            href={COMPANY_TRIPADVISOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="wx-rating"
          >
            <span className="wx-latin" style={{ fontSize: 44, lineHeight: 1 }}>
              {TRIPADVISOR_REVIEW_SNAPSHOT.rating}
            </span>
            <span>
              <Stars />
              <span
                style={{
                  display: "block",
                  fontSize: 13,
                  color: "var(--wx-muted)",
                  marginTop: 4,
                }}
              >
                {t(
                  `Read ${TRIPADVISOR_REVIEW_SNAPSHOT.reviewCount} public reviews on Tripadvisor`,
                  `קראו ${TRIPADVISOR_REVIEW_SNAPSHOT.reviewCount} ביקורות ציבוריות ב-Tripadvisor`
                )}
              </span>
            </span>
          </a>
        </div>

        {reviews.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: 20,
            }}
          >
            {reviews.map(r => (
              <figure key={r.id} className="wx-quote">
                <Stars />
                <blockquote>“{r.text}”</blockquote>
                <figcaption>
                  <span className="wx-avatar">{r.name.trim().charAt(0)}</span>
                  <span
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      minWidth: 0,
                    }}
                  >
                    <strong style={{ fontWeight: 600, fontSize: 15 }}>
                      {r.name}
                    </strong>
                    {r.tourType && (
                      <span style={{ fontSize: 13, color: "var(--wx-muted)" }}>
                        {r.tourType}
                      </span>
                    )}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.6,
              color: "var(--wx-muted)",
              maxWidth: 640,
              margin: 0,
            }}
          >
            {t(
              "Independent traveler feedback is on our public Tripadvisor listing. Guest-submitted reviews appear here once approved.",
              "משוב עצמאי של מטיילים נמצא בעמוד ה-Tripadvisor הציבורי שלנו. ביקורות אורחים יופיעו כאן לאחר אישורן."
            )}
          </p>
        )}
      </div>
    </section>
  );
}
