import { describe, expect, it } from "vitest";
import { calculateLeadScore } from "./leadScoring";

function makeLead(
  overrides: Partial<Parameters<typeof calculateLeadScore>[0]> = {}
) {
  return {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: null,
    source: null,
    interestedTours: null,
    message: null,
    status: "new",
    createdAt: new Date(), // just created → max recency
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("calculateLeadScore", () => {
  it("scores a minimal lead with low engagement", () => {
    const lead = makeLead({ name: "Jo", source: "other" });
    const score = calculateLeadScore(lead);
    // source: other=5, phone=0, message=0, tours=0, name short=0, status new=5, recency <1d=20
    expect(score).toBe(30);
  });

  it("gives higher score for referral source", () => {
    const referral = calculateLeadScore(makeLead({ source: "referral" }));
    const website = calculateLeadScore(makeLead({ source: "website" }));
    expect(referral).toBeGreaterThan(website);
  });

  it("gives points for phone number", () => {
    const withPhone = calculateLeadScore(makeLead({ phone: "+66812345678" }));
    const noPhone = calculateLeadScore(makeLead({ phone: null }));
    expect(withPhone - noPhone).toBe(10);
  });

  it("gives points for detailed message", () => {
    const detailed = calculateLeadScore(
      makeLead({
        message:
          "I am interested in a 3-day trek with my family of 5, kosher meals required please.",
      })
    );
    const short = calculateLeadScore(makeLead({ message: "Hello" }));
    const none = calculateLeadScore(makeLead({ message: null }));
    expect(detailed).toBeGreaterThan(short);
    expect(short).toBeGreaterThan(none);
  });

  it("gives points for interested tours (JSON array)", () => {
    const withTours = calculateLeadScore(
      makeLead({
        interestedTours: JSON.stringify(["Doi Inthanon", "Elephant Sanctuary"]),
      })
    );
    const noTours = calculateLeadScore(makeLead({ interestedTours: null }));
    expect(withTours - noTours).toBe(10);
  });

  it("handles non-JSON interestedTours string", () => {
    const withText = calculateLeadScore(
      makeLead({ interestedTours: "any tour" })
    );
    const noTours = calculateLeadScore(makeLead({ interestedTours: null }));
    expect(withText - noTours).toBe(5);
  });

  it("scores higher for quoted status than new", () => {
    const quoted = calculateLeadScore(makeLead({ status: "quoted" }));
    const newLead = calculateLeadScore(makeLead({ status: "new" }));
    expect(quoted).toBeGreaterThan(newLead);
  });

  it("applies recency decay for older leads", () => {
    const fresh = calculateLeadScore(makeLead({ createdAt: new Date() }));
    const weekOld = calculateLeadScore(
      makeLead({
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      })
    );
    const old = calculateLeadScore(
      makeLead({
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      })
    );
    expect(fresh).toBeGreaterThan(weekOld);
    expect(weekOld).toBeGreaterThan(old);
  });

  it("clamps score to 1-100 range", () => {
    // Even a minimal lead should be at least 1
    const minimal = calculateLeadScore(
      makeLead({
        name: "",
        source: "other",
        status: "lost",
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      })
    );
    expect(minimal).toBeGreaterThanOrEqual(1);
    expect(minimal).toBeLessThanOrEqual(100);

    // A maximally-engaged lead should not exceed 100
    const maxLead = calculateLeadScore(
      makeLead({
        source: "referral",
        phone: "+1234567890",
        message:
          "I want a full week tour for my family of 8, all kosher, budget is generous.",
        interestedTours: JSON.stringify(["Tour A", "Tour B", "Tour C"]),
        status: "quoted",
      })
    );
    expect(maxLead).toBeLessThanOrEqual(100);
    expect(maxLead).toBeGreaterThanOrEqual(80); // should be very high
  });
});
