export {
  COOKIE_NAME,
  ONE_YEAR_MS,
  COMPANY_WHATSAPP as WHATSAPP_NUMBER,
  COMPANY_WHATSAPP_URL as WHATSAPP_URL,
  COMPANY_WHATSAPP_URL,
  COMPANY_WHATSAPP_DISPLAY,
  COMPANY_PHONE,
  COMPANY_EMAIL,
  COMPANY_NAME,
  COMPANY_WEBSITE,
  COMPANY_FACEBOOK_URL,
  COMPANY_INSTAGRAM_URL,
} from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

// Self-hosted logo (previously hot-linked from a temporary Manus CDN
// session URL that could expire at any time; also 820KB vs 36KB now).
export const APP_LOGO = "/images/wiro-logo.png";

export const LOGIN_URL = "/login";
