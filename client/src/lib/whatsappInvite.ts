/**
 * Rules for the timed WhatsApp invitation: it appears once a visitor has
 * spent INVITE_DELAY_MS on the site (summed across pages and reloads in the
 * same tab), never on pages where it would get in the way, and at most once
 * per visitor every INVITE_SNOOZE_MS.
 */

export const INVITE_DELAY_MS = 40_000;
export const INVITE_SNOOZE_MS = 7 * 86_400_000;
export const INVITE_HIDDEN_UNTIL_KEY = "wiro_invite_hidden_until";
export const INVITE_ELAPSED_KEY = "wiro_invite_elapsed_ms";

export interface InviteStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** Pages where an invitation would interrupt a task already under way. */
const EXCLUDED_PREFIXES = [
  "/admin",
  "/book",
  "/booking",
  "/plan-trip",
  "/login",
  "/register",
  "/forgot-password",
  "/album",
];

export function isInviteExcludedPath(path: string): boolean {
  return EXCLUDED_PREFIXES.some(
    prefix => path === prefix || path.startsWith(`${prefix}/`)
  );
}

export function isInviteSnoozed(persistent: InviteStorage, now: number) {
  const until = Number(persistent.getItem(INVITE_HIDDEN_UNTIL_KEY));
  return Number.isFinite(until) && now < until;
}

/** Hide the invitation for the snooze period (shown, closed, or converted). */
export function snoozeInvite(persistent: InviteStorage, now: number) {
  persistent.setItem(INVITE_HIDDEN_UNTIL_KEY, String(now + INVITE_SNOOZE_MS));
}

/** Add visible time for this tab and return the running total. */
export function addElapsed(session: InviteStorage, ms: number): number {
  const previous = Number(session.getItem(INVITE_ELAPSED_KEY));
  const total = (Number.isFinite(previous) ? previous : 0) + Math.max(0, ms);
  session.setItem(INVITE_ELAPSED_KEY, String(total));
  return total;
}

export function shouldShowInvite(options: {
  elapsedMs: number;
  path: string;
  snoozed: boolean;
  cookieBannerOpen: boolean;
}): boolean {
  return (
    options.elapsedMs >= INVITE_DELAY_MS &&
    !options.snoozed &&
    !options.cookieBannerOpen &&
    !isInviteExcludedPath(options.path)
  );
}
