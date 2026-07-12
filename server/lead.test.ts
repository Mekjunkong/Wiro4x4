import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { createLead, getLeadById, logAdminAction, updateLead } from "./db";
import { checkRateLimit } from "./rateLimit";
import { createAuthContext, createPublicContext } from "./test-helpers";
import { adminLeadInputSchema, leadInputSchema } from "../shared/schemas";

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    createLead: vi.fn(),
    findOrCreateCustomer: vi.fn().mockResolvedValue(undefined),
    getAllLeads: vi.fn().mockResolvedValue([]),
    getLeadById: vi.fn(),
    logAdminAction: vi.fn(),
    updateLead: vi.fn(),
    updateLeadScore: vi.fn(),
  };
});

vi.mock("./rateLimit", async importOriginal => {
  const actual = await importOriginal<typeof import("./rateLimit")>();
  return {
    ...actual,
    checkRateLimit: vi.fn(),
  };
});

const validCapsule =
  "[WIRO:v1|HOME-HERO-EN|organic|google|cpc|summer-2026|%2Fpricing]";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(checkRateLimit).mockReturnValue({
    allowed: true,
    remaining: 99,
    resetAt: Date.now() + 300_000,
  });
  vi.mocked(createLead).mockResolvedValue({} as never);
  vi.mocked(updateLead).mockResolvedValue({} as never);
  vi.mocked(logAdminAction).mockResolvedValue(undefined);
});

describe("lead validation", () => {
  it("keeps a valid email required for public leads", () => {
    expect(leadInputSchema.safeParse({ name: "No Email" }).success).toBe(false);
    expect(
      leadInputSchema.safeParse({ name: "Bad Email", email: "not-an-email" })
        .success
    ).toBe(false);
    expect(
      leadInputSchema.safeParse({
        name: "Public Lead",
        email: "lead@example.com",
      }).success
    ).toBe(true);
  });

  it("requires a recognizable label and phone for admin WhatsApp leads", () => {
    expect(
      adminLeadInputSchema.safeParse({ phone: "+66912345678" }).success
    ).toBe(false);
    expect(
      adminLeadInputSchema.safeParse({ name: "WhatsApp Dana" }).success
    ).toBe(false);
    expect(
      adminLeadInputSchema.safeParse({
        name: "WhatsApp Dana",
        phone: "+66912345678",
      }).success
    ).toBe(true);
  });

  it("accepts optional email and a valid attribution capsule", () => {
    const parsed = adminLeadInputSchema.safeParse({
      name: "Dana",
      phone: "+66912345678",
      email: "dana@example.com",
      attributionCapsule: validCapsule,
      travelDate: "2026-12-24",
      groupSize: 4,
      estimatedValueThb: 45_000,
      language: "en",
    });

    expect(parsed.success).toBe(true);
  });

  it.each([-1, 1.5])("rejects invalid estimated THB value %s", value => {
    expect(
      adminLeadInputSchema.safeParse({
        name: "Dana",
        phone: "+66912345678",
        estimatedValueThb: value,
      }).success
    ).toBe(false);
  });

  it("validates language, group size, travel date, capsules, and source registry codes", () => {
    const base = { name: "Dana", phone: "+66912345678" };

    expect(
      adminLeadInputSchema.safeParse({ ...base, language: "th" }).success
    ).toBe(false);
    expect(
      adminLeadInputSchema.safeParse({ ...base, groupSize: 0 }).success
    ).toBe(false);
    expect(
      adminLeadInputSchema.safeParse({ ...base, groupSize: 2.5 }).success
    ).toBe(false);
    expect(
      adminLeadInputSchema.safeParse({ ...base, travelDate: "tomorrow" })
        .success
    ).toBe(false);
    expect(
      adminLeadInputSchema.safeParse({ ...base, travelDate: "2026-02-30" })
        .success
    ).toBe(false);
    expect(
      adminLeadInputSchema.safeParse({
        ...base,
        attributionCapsule: "[WIRO:bad]",
      }).success
    ).toBe(false);
    expect(
      adminLeadInputSchema.safeParse({ ...base, sourceCode: "ARBITRARY-CODE" })
        .success
    ).toBe(false);
  });

  it("requires a lost reason when submitted status is lost", () => {
    const base = { name: "Dana", phone: "+66912345678", status: "lost" };

    expect(adminLeadInputSchema.safeParse(base).success).toBe(false);
    expect(
      adminLeadInputSchema.safeParse({
        ...base,
        lostReason: "Dates did not work",
      }).success
    ).toBe(true);
  });
});

describe("lead.create", () => {
  it("creates a lead from the public form", async () => {
    const caller = appRouter.createCaller(createPublicContext().ctx);

    const result = await caller.lead.create({
      name: "David Levi",
      email: "david@example.com",
      phone: "+972501234567",
      source: "website",
      interestedTours: "Waterfall Adventure, Mountain Explorer",
      message: "Interested in a 3-day tour for 4 people",
    });

    expect(result).toEqual({
      success: true,
      message: "Lead captured successfully",
    });
    expect(createLead).toHaveBeenCalledWith(
      expect.objectContaining({ email: "david@example.com" })
    );
  });
});

describe("lead.createFromWhatsApp", () => {
  it("rejects unauthenticated creation", async () => {
    const caller = appRouter.createCaller(createPublicContext().ctx);

    await expect(
      caller.lead.createFromWhatsApp({
        name: "Dana",
        phone: "+66912345678",
      })
    ).rejects.toThrow();
    expect(createLead).not.toHaveBeenCalled();
  });

  it("creates an authenticated WhatsApp lead without a fake email and audits it", async () => {
    const caller = appRouter.createCaller(createAuthContext().ctx);

    await expect(
      caller.lead.createFromWhatsApp({
        name: "WhatsApp +66 91",
        phone: "+66912345678",
      })
    ).resolves.toEqual({ success: true });

    expect(createLead).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "WhatsApp +66 91",
        phone: "+66912345678",
        email: null,
        source: "whatsapp",
      })
    );
    expect(logAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        action: "create",
        resourceType: "lead",
      })
    );
  });

  it("parses and persists a valid capsule on the server", async () => {
    const caller = appRouter.createCaller(createAuthContext().ctx);

    await caller.lead.createFromWhatsApp({
      name: "Dana",
      phone: "+66912345678",
      attributionCapsule: validCapsule,
    });

    expect(createLead).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceCode: "HOME-HERO-EN",
        sourceChannel: "organic",
        landingPage: "/pricing",
        language: "en",
        utmSource: "google",
        utmMedium: "cpc",
        utmCampaign: "summer-2026",
      })
    );
  });

  it("uses the registry fallback and leaves unknown attribution empty", async () => {
    const caller = appRouter.createCaller(createAuthContext().ctx);

    await caller.lead.createFromWhatsApp({
      name: "Dana",
      phone: "+66912345678",
      sourceCode: "KOSHER-PAGE-HE",
    });

    expect(createLead).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceCode: "KOSHER-PAGE-HE",
        sourceChannel: "direct",
        language: "he",
        landingPage: null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
      })
    );
  });

  it("applies the admin rate limit before inserting", async () => {
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 300_000,
    });
    const caller = appRouter.createCaller(createAuthContext().ctx);

    await expect(
      caller.lead.createFromWhatsApp({
        name: "Dana",
        phone: "+66912345678",
      })
    ).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });

    expect(checkRateLimit).toHaveBeenCalledWith("admin:1", 100, 300_000);
    expect(createLead).not.toHaveBeenCalled();
    expect(logAdminAction).not.toHaveBeenCalled();
  });
});

describe("lead.update attribution outcomes", () => {
  it("sets and unsets the completion milestone", async () => {
    vi.mocked(getLeadById).mockResolvedValue({
      id: 21,
      status: "converted",
      lostReason: null,
    } as never);
    const caller = appRouter.createCaller(createAuthContext().ctx);

    await caller.lead.update({ id: 21, data: { completed: true } });
    expect(updateLead).toHaveBeenLastCalledWith(21, {
      completedAt: expect.any(Date),
    });

    await caller.lead.update({ id: 21, data: { completed: false } });
    expect(updateLead).toHaveBeenLastCalledWith(21, { completedAt: null });
  });

  it("requires a lost reason during partial status updates", async () => {
    vi.mocked(getLeadById).mockResolvedValue({
      id: 22,
      status: "contacted",
      lostReason: null,
    } as never);
    const caller = appRouter.createCaller(createAuthContext().ctx);

    await expect(
      caller.lead.update({ id: 22, data: { status: "lost" } })
    ).rejects.toThrow(/lost reason/i);
    expect(updateLead).not.toHaveBeenCalled();
  });

  it("uses the existing lost reason for unrelated partial updates", async () => {
    vi.mocked(getLeadById).mockResolvedValue({
      id: 23,
      status: "lost",
      lostReason: "No response",
    } as never);
    const caller = appRouter.createCaller(createAuthContext().ctx);

    await expect(
      caller.lead.update({ id: 23, data: { notes: "Follow up next quarter" } })
    ).resolves.toEqual({ success: true });
    expect(updateLead).toHaveBeenCalledWith(23, {
      notes: "Follow up next quarter",
    });
  });
});
