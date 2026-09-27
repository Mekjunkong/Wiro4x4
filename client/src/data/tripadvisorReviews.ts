/**
 * Public proof from the WIRO Tripadvisor listing (COMPANY_TRIPADVISOR_URL).
 *
 * Everything here is copied from Tripadvisor as it appeared on `checkedOn`,
 * so a visitor can click through and read the same words. Excerpts are
 * verbatim (typos included) with "…" marking cuts. When the listing
 * changes, re-check it and update the snapshot and date together — never
 * edit a number or quote without re-reading the listing.
 */
export const TRIPADVISOR_REVIEW_SNAPSHOT = {
  rating: "5.0",
  reviewCount: 8,
  checkedOn: "2026-09-27",
} as const;

export type TripadvisorReview = {
  id: string;
  /** Direct link to this review on Tripadvisor. */
  url: string;
  author: string;
  from?: string;
  /** Month of the trip as shown on Tripadvisor. */
  visited: string;
  title: string;
  excerpt: string;
};

export const TRIPADVISOR_REVIEWS: readonly TripadvisorReview[] = [
  {
    id: "r1071726943",
    url: "https://www.tripadvisor.com/ShowUserReviews-g293917-d8610288-r1071726943-Wiro_4x4_Indochina_Adventure_Day_Tours-Chiang_Mai.html",
    author: "Journey53715305533",
    visited: "Aug 2026",
    title: "Amazing family experience with Nicky & Wiro!",
    excerpt:
      "Everything was organized perfectly from beginning to end. … The kosher food was excellent, fresh and delicious, and every detail was taken care of with great attention.",
  },
  {
    id: "r603471429",
    url: "https://www.tripadvisor.com/ShowUserReviews-g293917-d8610288-r603471429-Wiro_4x4_Indochina_Adventure_Day_Tours-Chiang_Mai.html",
    author: "Tony Fernando",
    from: "Dubai, United Arab Emirates",
    visited: "Jun 2018",
    title: "4x4 Adventure through the jungle - Amazing",
    excerpt:
      "One of the best adventure trips done through the jungle in a 4x4. Very well organized. Very skilled and friendly staff.",
  },
  {
    id: "r351361321",
    url: "https://www.tripadvisor.com/ShowUserReviews-g293917-d8610288-r351361321-Wiro_4x4_Indochina_Adventure_Day_Tours-Chiang_Mai.html",
    author: "Tsahi G",
    from: "Kefar Sava, Israel",
    visited: "Feb 2016",
    title: "Great off roading and lots of fun,",
    excerpt:
      "We did a 2 days private trip from Chaing Mai to Pai. Visit alot of hill tribes villages, Lots of attractions, Great food and great crew.",
  },
];

/** "September 2026" / "ספטמבר 2026" for the "checked on" label. */
export function formatCheckedOn(language: "en" | "he") {
  return new Date(
    `${TRIPADVISOR_REVIEW_SNAPSHOT.checkedOn}T00:00:00Z`
  ).toLocaleDateString(language === "he" ? "he-IL" : "en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
