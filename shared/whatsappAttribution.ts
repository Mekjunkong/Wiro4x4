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
    code: "HOME-FLOAT-HE",
    page: "/",
    placement: "floating",
    language: "he",
    channelFallback: "direct",
  },
  {
    code: "KOSHER-PAGE-HE",
    page: "/he/kosher-tours-chiang-mai",
    placement: "page",
    language: "he",
    channelFallback: "direct",
  },
  {
    code: "HEBREW-GUIDE-HE",
    page: "/he/hebrew-guide-chiang-mai",
    placement: "page",
    language: "he",
    channelFallback: "direct",
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
const MAX_PATH_DECODE_PASSES = 4;

function isSensitiveOrStructural(value: string): boolean {
  return (
    /[^\s/@]+@[^\s/@]+\.[^\s/@]+/.test(value) ||
    /\d(?:[\s()+.-]*\d){6,}/.test(value) ||
    /:\/\//.test(value) ||
    /[|[\]\r\n]/.test(value)
  );
}

function normalizeToken(
  value: string | null | undefined,
  maxLength: number,
  field: string
): string {
  if (value == null || value.trim() === "") return "-";
  if (value.length > maxLength)
    throw new Error(`${field} exceeds maximum length`);
  if (isSensitiveOrStructural(value))
    throw new Error(`${field} contains disallowed data`);

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._~-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "-";
}

function decodePathSafely(pathname: string): string | null {
  let decoded = pathname;
  for (let pass = 0; pass < MAX_PATH_DECODE_PASSES; pass += 1) {
    if (!decoded.includes("%")) return decoded;
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      return null;
    }
  }
  return decoded.includes("%") ? null : decoded;
}

function normalizeLandingPath(value: string | null | undefined): string {
  if (value == null || value.trim() === "") return "-";
  if (value.length > LANDING_PATH_MAX_LENGTH) {
    throw new Error("landingPath exceeds maximum length");
  }
  const decoded = decodePathSafely(value);
  if (
    !decoded?.startsWith("/") ||
    /[?#]/.test(decoded) ||
    isSensitiveOrStructural(decoded)
  ) {
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
