/**
 * Track custom events with Plausible.
 * Falls back to no-op if analytics not loaded.
 */
export function trackEvent(
  eventName: string,
  props?: Record<string, string | number>
) {
  if (typeof window !== "undefined" && (window as any).plausible) {
    (window as any).plausible(eventName, { props });
  }
}

export const FUNNEL = {
  HOMEPAGE_VIEW: "homepage_view",
  TOUR_PAGE_VIEW: "tour_page_view",
  BOOKING_STARTED: "booking_started",
  BOOKING_COMPLETED: "booking_completed",
} as const;
