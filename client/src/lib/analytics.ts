export const CANONICAL_EVENTS = [
  "commercial_page_view",
  "tour_view",
  "pricing_view",
  "itinerary_expand",
  "proof_open",
  "faq_expand",
  "inquiry_start",
  "whatsapp_click",
  "booking_start",
  "booking_complete",
  "scroll_depth",
] as const;

export type AnalyticsEventName = (typeof CANONICAL_EVENTS)[number];

export interface AnalyticsEventProperties {
  page?: string;
  placement?: string;
  language?: string;
  tour?: string;
  depth?: number;
  sourceChannel?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  sourceCode?: string;
}

const ALLOWED_PROPERTY_KEYS = [
  "page",
  "placement",
  "language",
  "tour",
  "depth",
  "sourceChannel",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "sourceCode",
] as const satisfies readonly (keyof AnalyticsEventProperties)[];

type PlausibleWindow = Window & {
  plausible?: (
    eventName: AnalyticsEventName,
    options: { props: AnalyticsEventProperties }
  ) => void;
};

function sanitizeProperties(
  properties: AnalyticsEventProperties
): AnalyticsEventProperties {
  const safe: AnalyticsEventProperties = {};
  const source = properties as Record<string, unknown>;

  for (const key of ALLOWED_PROPERTY_KEYS) {
    const value = source[key];
    if (typeof value === "string" || typeof value === "number") {
      Object.assign(safe, { [key]: value });
    }
  }

  return safe;
}

/** Dispatches a privacy-bounded event without ever blocking user actions. */
export function trackEvent(
  eventName: AnalyticsEventName,
  properties: AnalyticsEventProperties = {}
): void {
  if (typeof window === "undefined") return;

  try {
    const plausible = (window as PlausibleWindow).plausible;
    if (typeof plausible !== "function") return;
    plausible(eventName, { props: sanitizeProperties(properties) });
  } catch {
    // Analytics is best-effort and must never block navigation or interaction.
  }
}
