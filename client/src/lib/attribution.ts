export const ATTRIBUTION_TTL_MS = 90 * 24 * 60 * 60 * 1_000;

const STORAGE_KEY = "wiro:first-touch:v1";
const UTM_MAX_LENGTH = 64;
const LANDING_PATH_MAX_LENGTH = 240;
const MAX_PATH_DECODE_PASSES = 4;

export interface AttributionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface AttributionLocation {
  pathname: string;
  search: string;
}

export interface AttributionEnvironment {
  location: AttributionLocation;
  referrer?: string;
  language?: string;
  now?: () => number;
}

export interface FirstTouchAttribution {
  landingPath: string;
  referrerHost: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  hasGoogleClickId: boolean;
  initialLanguage: "en" | "he";
  firstVisitAt: number;
}

export interface SessionAttribution {
  landingPath: string;
}

export type AttributionCapture = FirstTouchAttribution & {
  session: SessionAttribution;
};

function looksSensitive(value: string): boolean {
  return (
    /[^\s/@]+@[^\s/@]+\.[^\s/@]+/.test(value) ||
    /\d(?:[\s()+.-]*\d){6,}/.test(value)
  );
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

function normalizeLandingPath(pathname: string): string {
  const decoded = decodePathSafely(pathname);
  if (!decoded?.startsWith("/") || looksSensitive(decoded)) return "/";
  const normalized = decoded
    .replace(/[^A-Za-z0-9/_~.!$&'()*+,;=:@-]/g, "-")
    .slice(0, LANDING_PATH_MAX_LENGTH);
  return normalized || "/";
}

function normalizeUtm(value: string | null): string | null {
  if (!value || looksSensitive(value)) return null;
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._~-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, UTM_MAX_LENGTH);
  return normalized || null;
}

function extractReferrerHost(referrer?: string): string | null {
  if (!referrer) return null;
  try {
    const hostname = new URL(referrer).hostname.toLowerCase();
    return hostname.replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

function initialLanguage(language?: string): "en" | "he" {
  return language?.toLowerCase().startsWith("he") ? "he" : "en";
}

function isCanonicalUtm(value: unknown): value is string | null {
  return (
    value === null ||
    (typeof value === "string" && normalizeUtm(value) === value)
  );
}

function isSafeReferrerHost(value: unknown): value is string | null {
  return (
    value === null ||
    (typeof value === "string" &&
      value.length <= 253 &&
      /^[a-z0-9.-]+$/.test(value) &&
      !looksSensitive(value))
  );
}

function isFirstTouch(value: unknown): value is FirstTouchAttribution {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.landingPath === "string" &&
    normalizeLandingPath(candidate.landingPath) === candidate.landingPath &&
    isSafeReferrerHost(candidate.referrerHost) &&
    isCanonicalUtm(candidate.utmSource) &&
    isCanonicalUtm(candidate.utmMedium) &&
    isCanonicalUtm(candidate.utmCampaign) &&
    isCanonicalUtm(candidate.utmContent) &&
    typeof candidate.hasGoogleClickId === "boolean" &&
    (candidate.initialLanguage === "en" ||
      candidate.initialLanguage === "he") &&
    typeof candidate.firstVisitAt === "number" &&
    Number.isFinite(candidate.firstVisitAt)
  );
}

function readStored(
  storage?: AttributionStorage
): FirstTouchAttribution | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isFirstTouch(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStored(
  storage: AttributionStorage | undefined,
  value: FirstTouchAttribution
) {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage can be blocked or full. Attribution must never block navigation.
  }
}

function createFirstTouch(
  environment: AttributionEnvironment,
  now: number,
  landingPath: string
): FirstTouchAttribution {
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(environment.location.search);
  } catch {
    params = new URLSearchParams();
  }

  return {
    landingPath,
    referrerHost: extractReferrerHost(environment.referrer),
    utmSource: normalizeUtm(params.get("utm_source")),
    utmMedium: normalizeUtm(params.get("utm_medium")),
    utmCampaign: normalizeUtm(params.get("utm_campaign")),
    utmContent: normalizeUtm(params.get("utm_content")),
    hasGoogleClickId: ["gclid", "gbraid", "wbraid"].some(key =>
      params.has(key)
    ),
    initialLanguage: initialLanguage(environment.language),
    firstVisitAt: now,
  };
}

export function captureFirstTouch(
  environment: AttributionEnvironment,
  storage?: AttributionStorage
): AttributionCapture {
  const now = environment.now?.() ?? Date.now();
  const session = {
    landingPath: normalizeLandingPath(environment.location.pathname),
  };
  const stored = readStored(storage);
  const validStored =
    stored &&
    now >= stored.firstVisitAt &&
    now - stored.firstVisitAt < ATTRIBUTION_TTL_MS
      ? stored
      : null;
  const firstTouch =
    validStored ?? createFirstTouch(environment, now, session.landingPath);

  if (!validStored) writeStored(storage, firstTouch);
  return { ...firstTouch, session };
}
