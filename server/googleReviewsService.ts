/**
 * Google Places API integration for fetching Google Business reviews.
 *
 * Lazy init: only calls the API when both GOOGLE_PLACES_API_KEY and
 * GOOGLE_PLACE_ID environment variables are set. Returns an empty array
 * otherwise (no crash).
 *
 * Results are cached in-memory for 1 hour to avoid excessive API calls.
 */

export interface GoogleReview {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
  profilePhoto: string | null;
  googleReviewUrl: string | null;
}

interface CacheEntry {
  reviews: GoogleReview[];
  fetchedAt: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
let cache: CacheEntry | null = null;

function getConfig(): { apiKey: string; placeId: string } | null {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return null;
  return { apiKey, placeId };
}

export function isGoogleReviewsConfigured(): boolean {
  return getConfig() !== null;
}

export function getCacheStatus(): {
  configured: boolean;
  cacheAge: number | null;
  reviewCount: number;
} {
  const configured = isGoogleReviewsConfigured();
  if (!cache) {
    return { configured, cacheAge: null, reviewCount: 0 };
  }
  return {
    configured,
    cacheAge: Date.now() - cache.fetchedAt,
    reviewCount: cache.reviews.length,
  };
}

/**
 * Fetch Google reviews. Returns cached result if fresh, otherwise calls
 * the Google Places API (New) Place Details endpoint.
 */
export async function fetchGoogleReviews(
  forceRefresh = false
): Promise<GoogleReview[]> {
  const config = getConfig();
  if (!config) return [];

  // Return cached data if still valid
  if (!forceRefresh && cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.reviews;
  }

  try {
    // Google Places API (New) — Place Details with reviews field mask
    const url = `https://places.googleapis.com/v1/places/${config.placeId}?fields=reviews,displayName&languageCode=en`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": config.apiKey,
        "X-Goog-FieldMask": "reviews,displayName",
      },
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      console.error(
        `[GoogleReviews] API request failed (${response.status}): ${errText}`
      );
      // Return stale cache if available
      return cache?.reviews ?? [];
    }

    const data = await response.json();

    const reviews: GoogleReview[] = (data.reviews ?? []).map(
      (r: any): GoogleReview => ({
        author: r.authorAttribution?.displayName ?? "Anonymous",
        rating: r.rating ?? 5,
        text: r.text?.text ?? r.originalText?.text ?? "",
        relativeTime: r.relativePublishTimeDescription ?? "",
        profilePhoto: r.authorAttribution?.photoUri ?? null,
        googleReviewUrl: r.googleMapsUri ?? null,
      })
    );

    cache = { reviews, fetchedAt: Date.now() };
    return reviews;
  } catch (err) {
    console.error("[GoogleReviews] Failed to fetch:", err);
    // Return stale cache on network error
    return cache?.reviews ?? [];
  }
}

/** Clear the in-memory cache (used by admin refresh). */
export function clearGoogleReviewsCache(): void {
  cache = null;
}
