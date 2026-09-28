import { describe, expect, it } from "vitest";

import {
  INVITE_DELAY_MS,
  INVITE_SNOOZE_MS,
  addElapsed,
  isInviteExcludedPath,
  isInviteSnoozed,
  shouldShowInvite,
  snoozeInvite,
  type InviteStorage,
} from "./whatsappInvite";

const NOW = Date.UTC(2026, 8, 28);

class MemoryStorage implements InviteStorage {
  private values = new Map<string, string>();
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const base = {
  elapsedMs: INVITE_DELAY_MS,
  path: "/tours",
  snoozed: false,
  cookieBannerOpen: false,
};

describe("WhatsApp invitation rules", () => {
  it("waits until the visitor has spent the delay on the site", () => {
    expect(shouldShowInvite({ ...base, elapsedMs: INVITE_DELAY_MS - 1 })).toBe(
      false
    );
    expect(shouldShowInvite(base)).toBe(true);
  });

  it("sums visible time across pages and reloads in the same tab", () => {
    const session = new MemoryStorage();
    addElapsed(session, 25_000);
    expect(addElapsed(session, 15_000)).toBe(40_000);
    expect(addElapsed(session, -5)).toBe(40_000);
  });

  it("recovers from a corrupted elapsed value", () => {
    const session = new MemoryStorage();
    session.setItem("wiro_invite_elapsed_ms", "not-a-number");
    expect(addElapsed(session, 1_000)).toBe(1_000);
  });

  it("stays hidden for the snooze period after it was shown or closed", () => {
    const persistent = new MemoryStorage();
    expect(isInviteSnoozed(persistent, NOW)).toBe(false);
    snoozeInvite(persistent, NOW);
    expect(isInviteSnoozed(persistent, NOW + INVITE_SNOOZE_MS - 1)).toBe(true);
    expect(isInviteSnoozed(persistent, NOW + INVITE_SNOOZE_MS)).toBe(false);
    expect(shouldShowInvite({ ...base, snoozed: true })).toBe(false);
  });

  it("never covers the cookie banner", () => {
    expect(shouldShowInvite({ ...base, cookieBannerOpen: true })).toBe(false);
  });

  it("stays out of booking, account and admin flows", () => {
    for (const path of [
      "/book",
      "/booking/success",
      "/plan-trip",
      "/admin",
      "/login",
      "/album/abc",
    ]) {
      expect(isInviteExcludedPath(path)).toBe(true);
      expect(shouldShowInvite({ ...base, path })).toBe(false);
    }
    for (const path of ["/", "/tours", "/tours/samoeng", "/bookmarks-page"]) {
      expect(isInviteExcludedPath(path)).toBe(false);
    }
  });
});
