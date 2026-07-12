export type AttributionLanguage = "en" | "he";

export interface WhatsAppSource {
  code: string;
  page: string;
  placement: string;
  language: AttributionLanguage;
  channelFallback: string;
}

/**
 * Canonical public WhatsApp source registry. Codes are durable reporting keys;
 * change metadata deliberately and never recycle a code for another surface.
 */
export const WHATSAPP_SOURCES = [
  {
    code: "HOME-HERO-EN",
    page: "/",
    placement: "hero",
    language: "en",
    channelFallback: "direct",
  },
  {
    code: "HOME-HERO-HE",
    page: "/",
    placement: "hero",
    language: "he",
    channelFallback: "direct",
  },
  {
    code: "GLOBAL-HEADER-EN",
    page: "global",
    placement: "header",
    language: "en",
    channelFallback: "direct",
  },
  {
    code: "GLOBAL-HEADER-HE",
    page: "global",
    placement: "header",
    language: "he",
    channelFallback: "direct",
  },
  {
    code: "GLOBAL-FLOAT-EN",
    page: "global",
    placement: "floating",
    language: "en",
    channelFallback: "direct",
  },
  {
    code: "HOME-FLOAT-HE",
    page: "/",
    placement: "floating",
    language: "he",
    channelFallback: "direct",
  },
  {
    code: "GLOBAL-FLOAT-HE",
    page: "global",
    placement: "floating",
    language: "he",
    channelFallback: "direct",
  },
  {
    code: "HOME-INQUIRY-EN",
    page: "/",
    placement: "inquiry-form",
    language: "en",
    channelFallback: "direct",
  },
  {
    code: "HOME-INQUIRY-HE",
    page: "/",
    placement: "inquiry-form",
    language: "he",
    channelFallback: "direct",
  },
  {
    code: "GLOBAL-FOOTER-EN",
    page: "global",
    placement: "footer",
    language: "en",
    channelFallback: "direct",
  },
  {
    code: "GLOBAL-FOOTER-HE",
    page: "global",
    placement: "footer",
    language: "he",
    channelFallback: "direct",
  },
  {
    code: "ESTIMATE-RESULT-EN",
    page: "/estimate",
    placement: "result",
    language: "en",
    channelFallback: "direct",
  },
  {
    code: "ESTIMATE-RESULT-HE",
    page: "/estimate",
    placement: "result",
    language: "he",
    channelFallback: "direct",
  },
  {
    code: "CHAT-HANDOFF-EN",
    page: "global",
    placement: "chat-handoff",
    language: "en",
    channelFallback: "direct",
  },
  {
    code: "CHAT-HANDOFF-HE",
    page: "global",
    placement: "chat-handoff",
    language: "he",
    channelFallback: "direct",
  },
  {
    code: "PACKAGE-BUILDER-EN",
    page: "/estimate",
    placement: "package-builder",
    language: "en",
    channelFallback: "direct",
  },
  {
    code: "PACKAGE-BUILDER-HE",
    page: "/estimate",
    placement: "package-builder",
    language: "he",
    channelFallback: "direct",
  },
  {
    code: "BLOG-CTA-EN",
    page: "/blog/:slug",
    placement: "article-cta",
    language: "en",
    channelFallback: "organic",
  },
  {
    code: "BLOG-CTA-HE",
    page: "/blog/:slug",
    placement: "article-cta",
    language: "he",
    channelFallback: "organic",
  },
  {
    code: "KOSHER-PAGE-EN",
    page: "/kosher-tours",
    placement: "page",
    language: "en",
    channelFallback: "organic",
  },
  {
    code: "KOSHER-PAGE-HE",
    page: "/he/kosher-tours-chiang-mai",
    placement: "page",
    language: "he",
    channelFallback: "direct",
  },
  {
    code: "HEBREW-GUIDE-EN",
    page: "/hebrew-guide",
    placement: "page",
    language: "en",
    channelFallback: "organic",
  },
  {
    code: "HEBREW-GUIDE-HE",
    page: "/he/hebrew-guide-chiang-mai",
    placement: "page",
    language: "he",
    channelFallback: "direct",
  },
  {
    code: "TOUR-DETAIL-EN",
    page: "/tours/:slug",
    placement: "booking",
    language: "en",
    channelFallback: "organic",
  },
  {
    code: "TOUR-DETAIL-HE",
    page: "/tours/:slug",
    placement: "booking",
    language: "he",
    channelFallback: "organic",
  },
  {
    code: "PRICING-TOUR-EN",
    page: "/pricing",
    placement: "tour-card",
    language: "en",
    channelFallback: "organic",
  },
  {
    code: "PRICING-TOUR-HE",
    page: "/pricing",
    placement: "tour-card",
    language: "he",
    channelFallback: "organic",
  },
  {
    code: "PRICING-PACKAGE-EN",
    page: "/pricing",
    placement: "package-card",
    language: "en",
    channelFallback: "organic",
  },
  {
    code: "PRICING-PACKAGE-HE",
    page: "/pricing",
    placement: "package-card",
    language: "he",
    channelFallback: "organic",
  },
  {
    code: "PACKAGES-REQUEST-EN",
    page: "/packages",
    placement: "builder-result",
    language: "en",
    channelFallback: "organic",
  },
  {
    code: "PACKAGES-REQUEST-HE",
    page: "/packages",
    placement: "builder-result",
    language: "he",
    channelFallback: "organic",
  },
  {
    code: "PACKAGE-DETAIL-EN",
    page: "/packages/:slug",
    placement: "booking",
    language: "en",
    channelFallback: "organic",
  },
  {
    code: "PACKAGE-DETAIL-HE",
    page: "/packages/:slug",
    placement: "booking",
    language: "he",
    channelFallback: "organic",
  },
  {
    code: "BOOKING-SUBMIT-EN",
    page: "/book",
    placement: "submit-success",
    language: "en",
    channelFallback: "direct",
  },
  {
    code: "BOOKING-SUBMIT-HE",
    page: "/book",
    placement: "submit-success",
    language: "he",
    channelFallback: "direct",
  },
  {
    code: "BOOKING-SUCCESS-EN",
    page: "/booking/success",
    placement: "contact",
    language: "en",
    channelFallback: "direct",
  },
  {
    code: "BOOKING-SUCCESS-HE",
    page: "/booking/success",
    placement: "contact",
    language: "he",
    channelFallback: "direct",
  },
  {
    code: "BOOKING-CANCEL-EN",
    page: "/booking/cancel",
    placement: "contact",
    language: "en",
    channelFallback: "direct",
  },
  {
    code: "BOOKING-CANCEL-HE",
    page: "/booking/cancel",
    placement: "contact",
    language: "he",
    channelFallback: "direct",
  },
  {
    code: "TRIP-ALBUM-EN",
    page: "/album/:token",
    placement: "contact",
    language: "en",
    channelFallback: "direct",
  },
  {
    code: "TRIP-ALBUM-HE",
    page: "/album/:token",
    placement: "contact",
    language: "he",
    channelFallback: "direct",
  },
  {
    code: "FAQ-PAGE-EN",
    page: "/faq",
    placement: "page-cta",
    language: "en",
    channelFallback: "organic",
  },
  {
    code: "FAQ-PAGE-HE",
    page: "/faq",
    placement: "page-cta",
    language: "he",
    channelFallback: "organic",
  },
  {
    code: "CONTACT-CARD-EN",
    page: "/contact",
    placement: "contact-card",
    language: "en",
    channelFallback: "direct",
  },
  {
    code: "CONTACT-CARD-HE",
    page: "/contact",
    placement: "contact-card",
    language: "he",
    channelFallback: "direct",
  },
  {
    code: "CONTACT-SUCCESS-EN",
    page: "/contact",
    placement: "form-success",
    language: "en",
    channelFallback: "direct",
  },
  {
    code: "CONTACT-SUCCESS-HE",
    page: "/contact",
    placement: "form-success",
    language: "he",
    channelFallback: "direct",
  },
  {
    code: "CAR-RENTAL-EN",
    page: "/car-rental",
    placement: "inquiry",
    language: "en",
    channelFallback: "organic",
  },
  {
    code: "CAR-RENTAL-HE",
    page: "/car-rental",
    placement: "inquiry",
    language: "he",
    channelFallback: "organic",
  },
  {
    code: "ACCESSIBLE-PAGE-EN",
    page: "/accessible-tours",
    placement: "page",
    language: "en",
    channelFallback: "organic",
  },
  {
    code: "ACCESSIBLE-PAGE-HE",
    page: "/accessible-tours",
    placement: "page",
    language: "he",
    channelFallback: "organic",
  },
  {
    code: "FAMILY-PAGE-EN",
    page: "/private-family-tours",
    placement: "page",
    language: "en",
    channelFallback: "direct",
  },
  {
    code: "TOUR-DOI-INTHANON-EN",
    page: "/tours/doi-inthanon-roof-of-thailand",
    placement: "tour",
    language: "en",
    channelFallback: "direct",
  },
] as const satisfies readonly WhatsAppSource[];

export type WhatsAppSourceCode = (typeof WHATSAPP_SOURCES)[number]["code"];

export function getWhatsAppSource(code: string): WhatsAppSource | undefined {
  return WHATSAPP_SOURCES.find(source => source.code === code);
}

export function isWhatsAppSourceCode(code: string): code is WhatsAppSourceCode {
  return getWhatsAppSource(code) !== undefined;
}

export interface AttributionCapsuleInput {
  sourceCode: string;
  channel?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  landingPath?: string | null;
}

export interface ParsedAttributionCapsule {
  version: "v1";
  sourceCode: WhatsAppSourceCode;
  channel: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  landingPath: string | null;
}

// Decoded values use lowercase ASCII letters, digits, dot, underscore, tilde,
// and hyphen. Landing paths additionally allow slash. Bounds apply pre-encoding.
const CHANNEL_MAX_LENGTH = 24;
const UTM_MAX_LENGTH = 64;
const LANDING_PATH_MAX_LENGTH = 240;
const MAX_ATTRIBUTION_DECODE_PASSES = 4;

function isSensitiveOrStructural(value: string): boolean {
  return (
    /[^\s/@]+@[^\s/@]+\.[^\s/@]+/.test(value) ||
    /\d(?:[\s()+.-]*\d){6,}/.test(value) ||
    /:\/\//.test(value) ||
    /[\[\]|\r\n\uFFFD]/.test(value)
  );
}

/**
 * Decodes only attribution values, with a fixed pass limit. Malformed,
 * excessively encoded, structural, or personal values fail closed.
 */
export function decodeAndValidateAttributionValue(
  value: string
): string | null {
  let decoded = value;
  for (let pass = 0; pass < MAX_ATTRIBUTION_DECODE_PASSES; pass += 1) {
    if (!decoded.includes("%")) {
      return isSensitiveOrStructural(decoded) ? null : decoded;
    }
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      return null;
    }
  }
  return decoded.includes("%") || isSensitiveOrStructural(decoded)
    ? null
    : decoded;
}

function normalizeToken(
  value: string | null | undefined,
  maxLength: number,
  field: string
): string {
  if (value == null || value.trim() === "") return "-";
  const decoded = decodeAndValidateAttributionValue(value);
  if (decoded === null) throw new Error(`${field} contains disallowed data`);
  if (decoded.length > maxLength)
    throw new Error(`${field} exceeds maximum length`);

  const normalized = decoded
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._~-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "-";
}

function normalizeLandingPath(value: string | null | undefined): string {
  if (value == null || value.trim() === "") return "-";
  if (value.length > LANDING_PATH_MAX_LENGTH) {
    throw new Error("landingPath exceeds maximum length");
  }
  const decoded = decodeAndValidateAttributionValue(value);
  if (!decoded?.startsWith("/") || /[?#]/.test(decoded)) {
    throw new Error("landingPath contains disallowed data");
  }

  const normalized = decoded.replace(/[^A-Za-z0-9/_~.-]+/g, "-");
  return encodeURIComponent(normalized);
}

export function buildAttributionCapsule(
  input: AttributionCapsuleInput
): string {
  const source = getWhatsAppSource(input.sourceCode);
  if (!source)
    throw new Error(`Unknown WhatsApp source code: ${input.sourceCode}`);

  const channel = normalizeToken(
    input.channel ?? source.channelFallback,
    CHANNEL_MAX_LENGTH,
    "channel"
  );
  const utmSource = normalizeToken(
    input.utmSource,
    UTM_MAX_LENGTH,
    "utmSource"
  );
  const utmMedium = normalizeToken(
    input.utmMedium,
    UTM_MAX_LENGTH,
    "utmMedium"
  );
  const utmCampaign = normalizeToken(
    input.utmCampaign,
    UTM_MAX_LENGTH,
    "utmCampaign"
  );
  const landingPath = normalizeLandingPath(input.landingPath);

  return `[WIRO:v1|${source.code}|${channel}|${utmSource}|${utmMedium}|${utmCampaign}|${landingPath}]`;
}

function parseCanonicalToken(
  raw: string,
  maxLength: number,
  field: string
): string | null {
  if (raw === "-") return null;
  if (!/^[a-z0-9._~-]+$/.test(raw)) return null;
  try {
    return normalizeToken(raw, maxLength, field) === raw ? raw : null;
  } catch {
    return null;
  }
}

function parseCanonicalLanding(raw: string): string | null {
  if (raw === "-") return null;
  if (!/^[A-Za-z0-9._~%-]+$/.test(raw)) return null;
  try {
    const decoded = decodeURIComponent(raw);
    return normalizeLandingPath(decoded) === raw ? decoded : null;
  } catch {
    return null;
  }
}

export function parseAttributionCapsule(
  capsule: string
): ParsedAttributionCapsule | null {
  if (!capsule.startsWith("[WIRO:") || !capsule.endsWith("]")) return null;
  const parts = capsule.slice(1, -1).split("|");
  if (parts.length !== 7 || parts[0] !== "WIRO:v1") return null;

  const [
    ,
    sourceCode,
    rawChannel,
    rawSource,
    rawMedium,
    rawCampaign,
    rawLanding,
  ] = parts;
  if (!isWhatsAppSourceCode(sourceCode)) return null;

  const channel = parseCanonicalToken(
    rawChannel,
    CHANNEL_MAX_LENGTH,
    "channel"
  );
  const utmSource = parseCanonicalToken(rawSource, UTM_MAX_LENGTH, "utmSource");
  const utmMedium = parseCanonicalToken(rawMedium, UTM_MAX_LENGTH, "utmMedium");
  const utmCampaign = parseCanonicalToken(
    rawCampaign,
    UTM_MAX_LENGTH,
    "utmCampaign"
  );
  const landingPath = parseCanonicalLanding(rawLanding);
  if (
    channel === null ||
    (rawSource !== "-" && utmSource === null) ||
    (rawMedium !== "-" && utmMedium === null) ||
    (rawCampaign !== "-" && utmCampaign === null) ||
    (rawLanding !== "-" && landingPath === null)
  ) {
    return null;
  }

  return {
    version: "v1",
    sourceCode,
    channel,
    utmSource,
    utmMedium,
    utmCampaign,
    landingPath,
  };
}
