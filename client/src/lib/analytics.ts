import {
  decodeAndValidateAttributionValue,
  isWhatsAppSourceCode,
} from "@shared/whatsappAttribution";

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
  "chat_open",
  "chat_message_sent",
  "chat_reply_received",
  "chat_handoff_shown",
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
  provider?: "levi-vps" | "fallback";
  latencyBucket?: "under-3s" | "3-6s" | "6-12s" | "over-12s";
  bookingStage?: "general" | "started" | "qualified";
}

const PAGE_MAX_LENGTH = 240;
const PLACEMENT_MAX_LENGTH = 80;
const TOUR_MAX_LENGTH = 120;
const CHANNEL_MAX_LENGTH = 24;
const UTM_MAX_LENGTH = 64;

const PAGE_PATTERN = /^(?:global|\/[A-Za-z0-9/_~.:-]*)$/;
const LABEL_PATTERN = /^[A-Za-z0-9._~:-]+$/;
const TOUR_PATTERN = /^[A-Za-z0-9._~-]+$/;
const LOWER_TOKEN_PATTERN = /^[a-z0-9._~-]+$/;

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

  const safeString = (
    value: unknown,
    maxLength: number,
    pattern: RegExp
  ): string | undefined => {
    if (typeof value !== "string") return undefined;
    const decoded = decodeAndValidateAttributionValue(value);
    if (
      decoded === null ||
      decoded.length === 0 ||
      decoded.length > maxLength ||
      !pattern.test(decoded)
    )
      return undefined;
    return decoded;
  };

  const page = safeString(source.page, PAGE_MAX_LENGTH, PAGE_PATTERN);
  if (page !== undefined) safe.page = page;

  const placement = safeString(
    source.placement,
    PLACEMENT_MAX_LENGTH,
    LABEL_PATTERN
  );
  if (placement !== undefined) safe.placement = placement;

  if (source.language === "en" || source.language === "he") {
    safe.language = source.language;
  }

  const tour = safeString(source.tour, TOUR_MAX_LENGTH, TOUR_PATTERN);
  if (tour !== undefined) safe.tour = tour;

  if (source.depth === 25 || source.depth === 50 || source.depth === 90) {
    safe.depth = source.depth;
  }

  const sourceChannel = safeString(
    source.sourceChannel,
    CHANNEL_MAX_LENGTH,
    LOWER_TOKEN_PATTERN
  );
  if (sourceChannel !== undefined) safe.sourceChannel = sourceChannel;

  for (const key of ["utmSource", "utmMedium", "utmCampaign"] as const) {
    const value = safeString(source[key], UTM_MAX_LENGTH, LOWER_TOKEN_PATTERN);
    if (value !== undefined) Object.assign(safe, { [key]: value });
  }

  if (
    typeof source.sourceCode === "string" &&
    isWhatsAppSourceCode(source.sourceCode)
  ) {
    safe.sourceCode = source.sourceCode;
  }

  if (source.provider === "levi-vps" || source.provider === "fallback") {
    safe.provider = source.provider;
  }

  if (
    source.latencyBucket === "under-3s" ||
    source.latencyBucket === "3-6s" ||
    source.latencyBucket === "6-12s" ||
    source.latencyBucket === "over-12s"
  ) {
    safe.latencyBucket = source.latencyBucket;
  }

  if (
    source.bookingStage === "general" ||
    source.bookingStage === "started" ||
    source.bookingStage === "qualified"
  ) {
    safe.bookingStage = source.bookingStage;
  }

  return safe;
}

function isAnalyticsEventName(value: unknown): value is AnalyticsEventName {
  return (
    typeof value === "string" &&
    CANONICAL_EVENTS.includes(value as AnalyticsEventName)
  );
}

/** Dispatches a privacy-bounded event without ever blocking user actions. */
export function trackEvent(
  eventName: AnalyticsEventName,
  properties: AnalyticsEventProperties = {}
): void {
  if (typeof window === "undefined") return;

  try {
    if (!isAnalyticsEventName(eventName)) return;
    const plausible = (window as PlausibleWindow).plausible;
    if (typeof plausible !== "function") return;
    plausible(eventName, { props: sanitizeProperties(properties) });
  } catch {
    // Analytics is best-effort and must never block navigation or interaction.
  }
}
