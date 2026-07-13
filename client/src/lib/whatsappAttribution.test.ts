import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { COMPANY_WHATSAPP_URL } from "@shared/const";
import { parseAttributionCapsule } from "@shared/whatsappAttribution";

import type { FirstTouchAttribution } from "./attribution";
import {
  buildTrackedWhatsAppLink,
  buildTrackedWhatsAppUrl,
} from "./whatsappAttribution";

const attribution: FirstTouchAttribution = {
  landingPath: "/kosher-tours",
  referrerHost: "google.com",
  utmSource: "google",
  utmMedium: "organic",
  utmCampaign: null,
  utmContent: null,
  hasGoogleClickId: false,
  initialLanguage: "en",
  firstVisitAt: Date.UTC(2026, 6, 12),
};

const readAttributionRunbook = () =>
  readFileSync(
    new URL("../../../docs/seo-attribution-operations.md", import.meta.url),
    "utf8"
  );

const normalizeMarkdown = (markdown: string) =>
  markdown.replace(/\s+/g, " ").trim();

describe("buildTrackedWhatsAppUrl", () => {
  it("appends the capsule as the final message line and encodes the wa.me URL", () => {
    const humanMessage =
      "Hello WIRO, I'd like a family tour.\n2 adults & 2 children";
    const url = buildTrackedWhatsAppUrl({
      sourceCode: "HOME-HERO-EN",
      humanMessage,
      attribution,
    });
    const parsed = new URL(url);
    const decodedMessage = parsed.searchParams.get("text");

    expect(url.startsWith(`${COMPANY_WHATSAPP_URL}?text=`)).toBe(true);
    expect(decodedMessage).toBe(
      `${humanMessage}\n[WIRO:v1|HOME-HERO-EN|organic|google|organic|-|%2Fkosher-tours]`
    );
    expect(decodedMessage?.split("\n").at(-1)).toMatch(/^\[WIRO:v1\|/);
  });

  it("keeps the runbook console command compatible with canonical capsules", () => {
    const runbook = readAttributionRunbook();
    const commandSection = runbook.match(
      /With that link still selected[\s\S]*?```js\n\s*(?<command>[^\n]+)\n\s*```/
    );
    const command = commandSection?.groups?.command.trim();

    expect(command).toBeTruthy();

    const href = buildTrackedWhatsAppUrl({
      sourceCode: "KOSHER-PAGE-EN",
      humanMessage: "Hello WIRO",
      attribution: {
        ...attribution,
        utmSource: "runbook",
        utmMedium: "manual",
        utmCampaign: "attribution-test",
      },
    });
    const runCommand = new Function(
      "$0",
      `return ${command}`
    ) as (selectedLink: { href: string }) => string;
    const capsule = runCommand({ href }).split("\n").at(-1);

    expect(capsule).toBe(
      "[WIRO:v1|KOSHER-PAGE-EN|manual|runbook|manual|attribution-test|%2Fkosher-tours]"
    );
    expect(parseAttributionCapsule(capsule ?? "")).toMatchObject({
      sourceCode: "KOSHER-PAGE-EN",
      landingPath: "/kosher-tours",
    });
  });

  it("defines the scorecard week as exactly seven complete days ending yesterday", () => {
    const runbook = normalizeMarkdown(readAttributionRunbook());

    expect(runbook).toContain(
      "**Current scorecard week:** The seven consecutive complete calendar days immediately before the snapshot date."
    );
  });

  it("defines the comparison as the immediately preceding 28 complete days", () => {
    const runbook = normalizeMarkdown(readAttributionRunbook());

    expect(runbook).toContain(
      "**Previous four-week comparison period:** The 28 consecutive complete calendar days immediately before the current scorecard week. This period excludes the current scorecard week."
    );
  });

  it("uses unique funnel visitors rather than event totals for entrants and rate", () => {
    const runbook = normalizeMarkdown(readAttributionRunbook());

    expect(runbook).toContain(
      "This is the number of unique step-one entrants for that date range, not the goal's **Total conversions**."
    );
    expect(runbook).toContain(
      "Verify it as unique step-two completers divided by unique step-one entrants, multiplied by 100, for the same date range."
    );
    expect(runbook).toContain("don't divide the two goal event totals.");
  });

  it("uses unique funnel entrants for the 20-visitor low-sample threshold", () => {
    const runbook = normalizeMarkdown(readAttributionRunbook());

    expect(runbook).toContain(
      "fewer than 20 unique step-one commercial funnel entrants"
    );
    expect(runbook).toContain(
      "Don't use `commercial_page_view` total conversions for the 20-entrant threshold."
    );
  });

  it("keeps repeatable WhatsApp event volume separate from unique completers", () => {
    const runbook = normalizeMarkdown(readAttributionRunbook());

    expect(runbook).toContain(
      "This count includes unique visitors who completed step 1 before step 2 in the configured sequential funnel."
    );
    expect(runbook).toContain(
      "**WhatsApp click events:** Plausible **Total conversions** for `whatsapp_click` during the current scorecard week."
    );
    expect(runbook).toContain(
      "This is event volume and can include repeated actions by one visitor; it isn't the unique funnel completer count."
    );
  });

  it("prepares matching privacy-safe analytics properties for a tracked link", () => {
    const link = buildTrackedWhatsAppLink({
      sourceCode: "HOME-HERO-EN",
      humanMessage: "Hello",
      attribution,
    });

    expect(link.href).toBe(
      buildTrackedWhatsAppUrl({
        sourceCode: "HOME-HERO-EN",
        humanMessage: "Hello",
        attribution,
      })
    );
    expect(link.eventProperties).toEqual({
      page: "/",
      placement: "hero",
      language: "en",
      sourceCode: "HOME-HERO-EN",
      sourceChannel: "organic",
      utmSource: "google",
      utmMedium: "organic",
    });
    expect(link.eventProperties).not.toHaveProperty("landingPath");
    expect(link.eventProperties).not.toHaveProperty("referrerHost");
  });

  it("derives paid, referral, and registered fallback channels deterministically", () => {
    const channelFor = (changes: Partial<FirstTouchAttribution>) => {
      const url = buildTrackedWhatsAppUrl({
        sourceCode: "HOME-HERO-EN",
        humanMessage: "Hello",
        attribution: {
          ...attribution,
          utmMedium: null,
          referrerHost: null,
          ...changes,
        },
      });
      return new URL(url).searchParams.get("text")?.split("|")[2];
    };

    expect(channelFor({ hasGoogleClickId: true })).toBe("paid");
    expect(channelFor({ referrerHost: "partner.example" })).toBe("referral");
    expect(channelFor({})).toBe("direct");
  });

  it("can capture browser inputs through injected adapters without a global window", () => {
    const values = new Map<string, string>();
    const url = buildTrackedWhatsAppUrl({
      sourceCode: "HOME-HERO-EN",
      humanMessage: "Hello",
      environment: {
        location: {
          pathname: "/",
          search: "?utm_source=google&utm_medium=cpc&gclid=hidden",
        },
        referrer: "https://google.com/search?q=private",
        language: "en",
        now: () => 1,
      },
      storage: {
        getItem: key => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
      },
    });
    const message = new URL(url).searchParams.get("text");

    expect(message).toContain("|paid|google|cpc|-|%2F]");
    expect([...values.values()].join(" ")).not.toContain("hidden");
  });

  it("bounds a long captured medium without blocking URL construction", () => {
    expect(() =>
      buildTrackedWhatsAppUrl({
        sourceCode: "HOME-HERO-EN",
        humanMessage: "Hello",
        environment: {
          location: { pathname: "/", search: `?utm_medium=${"x".repeat(200)}` },
          now: () => 1,
        },
      })
    ).not.toThrow();
  });

  it("rejects unknown source codes and keeps message content out of the capsule", () => {
    expect(() =>
      buildTrackedWhatsAppUrl({
        sourceCode: "UNKNOWN",
        humanMessage: "hello",
        attribution,
      })
    ).toThrow(/source code/i);

    const message = "My name is Ada, ada@example.com, +972541234567";
    const url = buildTrackedWhatsAppUrl({
      sourceCode: "HOME-HERO-EN",
      humanMessage: message,
      attribution,
    });
    const lines = new URL(url).searchParams.get("text")?.split("\n") ?? [];

    expect(lines.slice(0, -1).join("\n")).toBe(message);
    expect(lines.at(-1)).not.toMatch(/Ada|example\.com|972541234567/);
  });
});
