const REFERRAL_KEY = "wiro_referral_code";

/**
 * Reads `?ref=` from the current URL and persists it to sessionStorage.
 * Returns the referral code if found, or null.
 */
export function captureReferralFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref) {
    sessionStorage.setItem(REFERRAL_KEY, ref);
    return ref;
  }
  return sessionStorage.getItem(REFERRAL_KEY);
}

/**
 * Returns the stored referral code without touching the URL, or null.
 */
export function getStoredReferralCode(): string | null {
  return sessionStorage.getItem(REFERRAL_KEY);
}

/**
 * Removes the referral code from sessionStorage after it has been used.
 */
export function clearReferralCode(): void {
  sessionStorage.removeItem(REFERRAL_KEY);
}
