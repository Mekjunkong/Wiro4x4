import { COMPANY_WHATSAPP_URL } from "@shared/const";
import {
  buildAttributionCapsule,
  getWhatsAppSource,
} from "@shared/whatsappAttribution";

import {
  captureFirstTouch,
  type AttributionEnvironment,
  type AttributionStorage,
  type FirstTouchAttribution,
} from "./attribution";

export interface BuildTrackedWhatsAppUrlInput {
  sourceCode: string;
  humanMessage: string;
  attribution?: FirstTouchAttribution;
  environment?: AttributionEnvironment;
  storage?: AttributionStorage;
}

function browserEnvironment(): AttributionEnvironment | undefined {
  if (typeof window === "undefined") return undefined;
  return {
    location: {
      pathname: window.location.pathname,
      search: window.location.search,
    },
    referrer: typeof document === "undefined" ? "" : document.referrer,
    language: typeof navigator === "undefined" ? "en" : navigator.language,
    now: () => Date.now(),
  };
}

function browserStorage(): AttributionStorage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function resolveAttribution(
  input: BuildTrackedWhatsAppUrlInput
): FirstTouchAttribution {
  if (input.attribution) return input.attribution;
  const environment = input.environment ?? browserEnvironment();
  if (!environment) {
    return {
      landingPath: "/",
      referrerHost: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      hasGoogleClickId: false,
      initialLanguage: "en",
      firstVisitAt: Date.now(),
    };
  }
  return captureFirstTouch(environment, input.storage ?? browserStorage());
}

function attributionChannel(
  attribution: FirstTouchAttribution,
  fallback: string
): string {
  if (attribution.hasGoogleClickId) return "paid";
  if (attribution.utmMedium) return attribution.utmMedium.slice(0, 24);
  if (attribution.referrerHost) {
    return /(^|\.)google\./.test(attribution.referrerHost)
      ? "organic"
      : "referral";
  }
  return fallback;
}

export function buildTrackedWhatsAppUrl(
  input: BuildTrackedWhatsAppUrlInput
): string {
  const source = getWhatsAppSource(input.sourceCode);
  if (!source)
    throw new Error(`Unknown WhatsApp source code: ${input.sourceCode}`);
  const attribution = resolveAttribution(input);
  const capsule = buildAttributionCapsule({
    sourceCode: source.code,
    channel: attributionChannel(attribution, source.channelFallback),
    utmSource: attribution.utmSource,
    utmMedium: attribution.utmMedium,
    utmCampaign: attribution.utmCampaign,
    landingPath: attribution.landingPath,
  });
  const message = input.humanMessage
    ? `${input.humanMessage}\n${capsule}`
    : capsule;
  return `${COMPANY_WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}
