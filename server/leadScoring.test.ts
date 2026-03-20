import { describe, expect, it } from "vitest";
import { calculateLeadScore, getScoreTier } from "./leadScoring";
import type { LeadData } from "./leadScoring";

function makeLead(overrides: Partial<LeadData> = {}): LeadData {
  return {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: null,
    source: null,
    interestedTours: null,
    message: null,
    status: "new",
    createdAt: new Date(), // just created -> max recency
    updatedAt: new Date(),
    recoveryEmailSentAt: null,
    ...overrides,
  };
}

describe("calculateLeadScore", () => {
  it("returns score, tier, and details breakdown", () => {
    const result = calculateLeadScore(makeLead());
    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("tier");
    expect(result).toHaveProperty("details");
    expect(result.details).toHaveProperty("sourceQuality");
    expect(result.details).toHaveProperty("contactCompleteness");
    expect(result.details).toHaveProperty("messageQuality");
    expect(result.details).toHaveProperty("recency");
    expect(result.details).toHaveProperty("engagementSignals");
    expect(result.details).toHaveProperty("statusBonus");
  });

  it("gives 20 points for booking-form source", () => {
    const result = calculateLeadScore(makeLead({ source: "booking-form" }));
    expect(result.details.sourceQuality.points).toBe(20);
  });

  it("gives 15 points for contact-page and whatsapp sources", () => {
    const contact = calculateLeadScore(makeLead({ source: "contact-page" }));
    const whatsapp = calculateLeadScore(makeLead({ source: "whatsapp" }));
    expect(contact.details.sourceQuality.points).toBe(15);
    expect(whatsapp.details.sourceQuality.points).toBe(15);
  });

  it("gives 10 points for quick-inquiry source", () => {
    const result = calculateLeadScore(makeLead({ source: "quick-inquiry" }));
    expect(result.details.sourceQuality.points).toBe(10);
  });

  it("gives 5 points for unknown source", () => {
    const result = calculateLeadScore(makeLead({ source: "other" }));
    expect(result.details.sourceQuality.points).toBe(5);
  });

  it("scores contact completeness: name=5, email=5, phone=10 (max 15)", () => {
    const full = calculateLeadScore(
      makeLead({ name: "John", email: "j@e.com", phone: "+66123" })
    );
    expect(full.details.contactCompleteness.points).toBe(15);

    const noPhone = calculateLeadScore(
      makeLead({ name: "John", email: "j@e.com", phone: null })
    );
    expect(noPhone.details.contactCompleteness.points).toBe(10);
  });

  it("scores message quality: length, dates, group size, kosher (max 20)", () => {
    // Detailed message with all signals
    const full = calculateLeadScore(
      makeLead({
        message:
          "We are a group of 6 people arriving on 15/03. We need kosher meals for the entire trip. Please provide details.",
      })
    );
    expect(full.details.messageQuality.points).toBe(20);

    // Empty message
    const empty = calculateLeadScore(makeLead({ message: null }));
    expect(empty.details.messageQuality.points).toBe(0);
  });

  it("gives points for mentioning dates in message", () => {
    const withDate = calculateLeadScore(
      makeLead({ message: "We arrive on 15/03 and want a tour" })
    );
    // short message (5) + dates (5) = 10
    expect(withDate.details.messageQuality.points).toBeGreaterThanOrEqual(10);
  });

  it("gives points for mentioning kosher/shabbat", () => {
    const withKosher = calculateLeadScore(
      makeLead({ message: "We need kosher food" })
    );
    expect(withKosher.details.messageQuality.points).toBeGreaterThanOrEqual(10);
  });

  it("applies recency decay correctly", () => {
    const fresh = calculateLeadScore(makeLead({ createdAt: new Date() }));
    expect(fresh.details.recency.points).toBe(20);

    const twoDays = calculateLeadScore(
      makeLead({
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      })
    );
    expect(twoDays.details.recency.points).toBe(15);

    const fiveDays = calculateLeadScore(
      makeLead({
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      })
    );
    expect(fiveDays.details.recency.points).toBe(10);

    const tenDays = calculateLeadScore(
      makeLead({
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      })
    );
    expect(tenDays.details.recency.points).toBe(5);

    const old = calculateLeadScore(
      makeLead({
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      })
    );
    expect(old.details.recency.points).toBe(0);
  });

  it("gives engagement points for recovery email sent", () => {
    const withRecovery = calculateLeadScore(
      makeLead({ recoveryEmailSentAt: new Date() })
    );
    expect(
      withRecovery.details.engagementSignals.points
    ).toBeGreaterThanOrEqual(5);
  });

  it("gives engagement points for repeat inquiries from same email", () => {
    const allEmails = [
      "john@example.com",
      "other@example.com",
      "john@example.com",
    ];
    const result = calculateLeadScore(makeLead(), allEmails);
    expect(result.details.engagementSignals.points).toBeGreaterThanOrEqual(10);
  });

  it("gives status bonus: quoted=10, contacted=5, new=0", () => {
    const quoted = calculateLeadScore(makeLead({ status: "quoted" }));
    expect(quoted.details.statusBonus.points).toBe(10);

    const contacted = calculateLeadScore(makeLead({ status: "contacted" }));
    expect(contacted.details.statusBonus.points).toBe(5);

    const newLead = calculateLeadScore(makeLead({ status: "new" }));
    expect(newLead.details.statusBonus.points).toBe(0);
  });

  it("clamps score to 0-100 range", () => {
    const minimal = calculateLeadScore(
      makeLead({
        name: "",
        email: "",
        source: "other",
        status: "lost",
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      })
    );
    expect(minimal.score).toBeGreaterThanOrEqual(0);
    expect(minimal.score).toBeLessThanOrEqual(100);

    // Maximally engaged lead
    const allEmails = Array(5).fill("john@example.com");
    const maxLead = calculateLeadScore(
      makeLead({
        source: "booking-form",
        phone: "+1234567890",
        message:
          "We are a group of 8 people arriving on 15/03. We need kosher meals and shabbat arrangements for the entire trip. Please provide full details and pricing.",
        interestedTours: JSON.stringify(["Tour A", "Tour B"]),
        status: "quoted",
        recoveryEmailSentAt: new Date(),
      }),
      allEmails
    );
    expect(maxLead.score).toBeLessThanOrEqual(100);
    expect(maxLead.score).toBeGreaterThanOrEqual(80);
  });

  it("returns correct tier for score ranges", () => {
    const hot = calculateLeadScore(
      makeLead({
        source: "booking-form",
        phone: "+123",
        message:
          "Group of 5 people arriving 20/04, need kosher meals for the entire trip please.",
        status: "quoted",
      })
    );
    expect(hot.tier).toBe("hot");
  });
});

describe("getScoreTier", () => {
  it("returns correct tier labels", () => {
    expect(getScoreTier(100)).toBe("hot");
    expect(getScoreTier(75)).toBe("hot");
    expect(getScoreTier(74)).toBe("warm");
    expect(getScoreTier(50)).toBe("warm");
    expect(getScoreTier(49)).toBe("cool");
    expect(getScoreTier(25)).toBe("cool");
    expect(getScoreTier(24)).toBe("cold");
    expect(getScoreTier(0)).toBe("cold");
  });
});
