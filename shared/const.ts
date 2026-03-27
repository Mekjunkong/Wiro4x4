export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const UNAUTHED_ERR_MSG = "Please login (10001)";
export const NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// ── Company Contact Info (single source of truth) ──────────────────
// When you get your new WhatsApp Business number, change ONLY here.
export const COMPANY_WHATSAPP = "66929894495";
export const COMPANY_WHATSAPP_URL = `https://wa.me/${COMPANY_WHATSAPP}`;
export const COMPANY_WHATSAPP_DISPLAY = "+66 92-989-4495";
export const COMPANY_PHONE = "+66 92-989-4495";
export const COMPANY_EMAIL = "wiro.adventures@gmail.com";
export const COMPANY_SENDER_EMAIL = "bookings@wiro4x4indochina.com";
export const COMPANY_NAME = "WIRO 4x4 - Kosher Off-Road Adventures";
export const COMPANY_WEBSITE = "https://www.wiro4x4indochina.com";

// ── Email Sender Addresses (verified domain: wiro4x4indochina.com) ──
export const EMAIL_SENDERS = {
  bookings: "bookings@wiro4x4indochina.com",
  updates: "updates@wiro4x4indochina.com",
  support: "support@wiro4x4indochina.com",
};

// ── Social Media ────────────────────────────────────────────────────
// Update these URLs when you create your Facebook/Instagram pages.
export const COMPANY_FACEBOOK_URL = "https://www.facebook.com/"; // TODO: Replace with your Facebook page URL
export const COMPANY_INSTAGRAM_URL = "https://www.instagram.com/"; // TODO: Replace with your Instagram URL
