import { useLanguage } from "@/contexts/LanguageContext";
import { COMPANY_TRIPADVISOR_URL } from "@/const";
import {
  TRIPADVISOR_REVIEWS,
  TRIPADVISOR_REVIEW_SNAPSHOT,
} from "@/data/tripadvisorReviews";

/**
 * Checkable proof for the tour page: the Tripadvisor snapshot and one
 * verbatim excerpt linking to its review. Never DB stats or sample reviews
 * (PRODUCT.md claims policy).
 */
export function TourSocialProof() {
  const { t } = useLanguage();
  const review = TRIPADVISOR_REVIEWS[0];
  if (!review) return null;

  return (
    <figure className="wx-quote">
      <a
        href={COMPANY_TRIPADVISOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="wx-rating"
      >
        <strong>{TRIPADVISOR_REVIEW_SNAPSHOT.rating}</strong>{" "}
        {t(
          `on Tripadvisor · ${TRIPADVISOR_REVIEW_SNAPSHOT.reviewCount} public reviews ↗`,
          `ב-Tripadvisor · ${TRIPADVISOR_REVIEW_SNAPSHOT.reviewCount} ביקורות ציבוריות ↗`
        )}
      </a>
      <blockquote dir="ltr" cite={review.url}>
        “{review.excerpt}”
      </blockquote>
      <figcaption>
        <a href={review.url} target="_blank" rel="noopener noreferrer">
          {review.author}, {review.visited} ↗
        </a>
      </figcaption>
    </figure>
  );
}
