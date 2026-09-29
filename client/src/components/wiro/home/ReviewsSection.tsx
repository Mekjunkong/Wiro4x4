import { useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { COMPANY_TRIPADVISOR_URL } from "@/const";
import {
  TRIPADVISOR_REVIEWS,
  TRIPADVISOR_REVIEW_SNAPSHOT,
  formatCheckedOn,
} from "@/data/tripadvisorReviews";
import { useAutoScroller } from "@/hooks/useAutoScroller";
import { Stars } from "../icons";

/**
 * Every claim here can be checked: verbatim Tripadvisor excerpts, each
 * linking to that review on Tripadvisor, and a dated rating snapshot.
 * Approved on-site reviews (`review.listPublic`) follow, labelled as such.
 */
export function ReviewsSection() {
  const { t, language } = useLanguage();
  const { data } = trpc.review.listPublic.useQuery();
  const reviews = (data ?? [])
    .filter(r => r.rating >= 4 && r.text?.trim())
    .slice(0, 3);
  // Phones show the quotes as a swipe strip (see .wx-quotes); on wider
  // screens they fit as a grid and the scroller stays idle.
  const stripRef = useRef<HTMLDivElement>(null);
  useAutoScroller(stripRef, TRIPADVISOR_REVIEWS.length, { interval: 6000 });

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
                  `Read all ${TRIPADVISOR_REVIEW_SNAPSHOT.reviewCount} public reviews on Tripadvisor ↗`,
                  `קראו את כל ${TRIPADVISOR_REVIEW_SNAPSHOT.reviewCount} הביקורות הציבוריות ב-Tripadvisor ↗`
                )}
                <span style={{ display: "block", fontSize: 12, marginTop: 2 }}>
                  {t(
                    `Rating as shown on Tripadvisor, checked ${formatCheckedOn(language)}`,
                    `הדירוג כפי שמופיע ב-Tripadvisor, נבדק ב${formatCheckedOn(language)}`
                  )}
                </span>
              </span>
            </span>
          </a>
        </div>

        <div ref={stripRef} className="wx-quotes">
          {TRIPADVISOR_REVIEWS.map(r => (
            <figure key={r.id} className="wx-quote" data-slide>
              <Stars />
              <blockquote cite={r.url} lang="en" dir="ltr">
                <strong style={{ display: "block", fontWeight: 600 }}>
                  {r.title}
                </strong>
                “{r.excerpt}”
              </blockquote>
              <figcaption>
                <span className="wx-avatar" aria-hidden="true">
                  {r.author.trim().charAt(0)}
                </span>
                <span className="wx-quote__who">
                  <strong>{r.author}</strong>
                  <span>{[r.from, r.visited].filter(Boolean).join(" · ")}</span>
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    {t(
                      "Read this review on Tripadvisor ↗",
                      "לביקורת המלאה ב-Tripadvisor ↗"
                    )}
                  </a>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="wx-quotes__note">
          {t(
            "Short excerpts quoted word for word from Tripadvisor; “…” marks a cut.",
            "קטעים קצרים מצוטטים מילה במילה מ-Tripadvisor (באנגלית); ״…״ מסמן קיצור."
          )}
        </p>

        {reviews.length > 0 && (
          <>
            <h3 className="wx-quotes__sub">
              {t("Sent to us directly", "נשלחו אלינו ישירות")}
            </h3>
            <div className="wx-quotes">
              {reviews.map(r => (
                <figure key={r.id} className="wx-quote">
                  <Stars />
                  <blockquote>“{r.text}”</blockquote>
                  <figcaption>
                    <span className="wx-avatar" aria-hidden="true">
                      {r.name.trim().charAt(0)}
                    </span>
                    <span className="wx-quote__who">
                      <strong>{r.name}</strong>
                      {r.tourType && <span>{r.tourType}</span>}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
