import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { createAuthContext, createPublicContext } from "./test-helpers";
import { getDb } from "./db/connection";

vi.mock("./db/connection", () => ({
  getDb: vi.fn(),
}));

type LeadSeed = {
  sourceCode: string | null;
  sourceChannel: string | null;
  status: "new" | "contacted" | "quoted" | "converted" | "lost";
  estimatedValueThb: number | null;
  lostReason: string | null;
  completedAt: Date | null;
  convertedToBookingId: number | null;
  email?: string | null;
};

const completedBookingIds = new Set([101, 102]);

const leadSeeds: LeadSeed[] = [
  {
    sourceCode: "HOME-HERO-EN",
    sourceChannel: "organic",
    status: "new",
    estimatedValueThb: 10_000,
    lostReason: null,
    completedAt: null,
    convertedToBookingId: null,
    email: null,
  },
  {
    sourceCode: "HOME-HERO-EN",
    sourceChannel: "organic",
    status: "converted",
    estimatedValueThb: 50_000,
    lostReason: null,
    completedAt: new Date("2026-07-01T00:00:00.000Z"),
    convertedToBookingId: null,
  },
  {
    sourceCode: "HOME-HERO-EN",
    sourceChannel: "organic",
    status: "converted",
    estimatedValueThb: 70_000,
    lostReason: null,
    completedAt: new Date("2026-07-02T00:00:00.000Z"),
    convertedToBookingId: 101,
  },
  {
    sourceCode: "HOME-HERO-EN",
    sourceChannel: "organic",
    status: "lost",
    estimatedValueThb: 90_000,
    lostReason: "Dates did not work",
    completedAt: null,
    convertedToBookingId: null,
  },
  {
    sourceCode: "KOSHER-PAGE-HE",
    sourceChannel: null,
    status: "contacted",
    estimatedValueThb: 30_000,
    lostReason: null,
    completedAt: null,
    convertedToBookingId: null,
  },
  {
    sourceCode: "KOSHER-PAGE-HE",
    sourceChannel: null,
    status: "converted",
    estimatedValueThb: 80_000,
    lostReason: null,
    completedAt: null,
    convertedToBookingId: 103,
  },
  {
    sourceCode: null,
    sourceChannel: null,
    status: "quoted",
    estimatedValueThb: 40_000,
    lostReason: null,
    completedAt: null,
    convertedToBookingId: null,
  },
  {
    sourceCode: null,
    sourceChannel: null,
    status: "converted",
    estimatedValueThb: null,
    lostReason: null,
    completedAt: null,
    convertedToBookingId: 102,
    email: null,
  },
  {
    sourceCode: null,
    sourceChannel: null,
    status: "lost",
    estimatedValueThb: null,
    lostReason: "No response",
    completedAt: null,
    convertedToBookingId: null,
  },
  {
    sourceCode: null,
    sourceChannel: null,
    status: "lost",
    estimatedValueThb: null,
    lostReason: null,
    completedAt: null,
    convertedToBookingId: null,
  },
];

function sourceRowsFromSeeds() {
  const rows = new Map<
    string,
    {
      sourceCode: string;
      sourceChannel: string;
      leads: number;
      confirmed: number;
      completed: number;
      estimatedConfirmedValueThb: number;
    }
  >();

  for (const lead of leadSeeds) {
    const sourceCode = lead.sourceCode?.trim() || "Unknown";
    const sourceChannel = lead.sourceChannel?.trim() || "Unknown";
    const key = `${sourceCode}\0${sourceChannel}`;
    const row = rows.get(key) ?? {
      sourceCode,
      sourceChannel,
      leads: 0,
      confirmed: 0,
      completed: 0,
      estimatedConfirmedValueThb: 0,
    };
    row.leads += 1;
    if (lead.status === "converted") {
      row.confirmed += 1;
      row.estimatedConfirmedValueThb += lead.estimatedValueThb ?? 0;
    }
    if (
      lead.completedAt !== null ||
      (lead.convertedToBookingId !== null &&
        completedBookingIds.has(lead.convertedToBookingId))
    ) {
      row.completed += 1;
    }
    rows.set(key, row);
  }

  return [...rows.values()];
}

function lossRowsFromSeeds() {
  const counts = new Map<string, number>();
  for (const lead of leadSeeds.filter(lead => lead.status === "lost")) {
    const reason = lead.lostReason?.trim() || "Unknown";
    counts.set(reason, (counts.get(reason) ?? 0) + 1);
  }
  return [...counts].map(([reason, count]) => ({ reason, count }));
}

function funnelRowsFromSeeds() {
  const counts = new Map<string, number>();
  for (const lead of leadSeeds) {
    counts.set(lead.status, (counts.get(lead.status) ?? 0) + 1);
  }
  return [...counts].map(([status, count]) => ({ status, count }));
}

function queryReturning<T>(rows: T[]) {
  const chain: Record<string, unknown> = {};
  for (const method of [
    "from",
    "leftJoin",
    "where",
    "groupBy",
    "orderBy",
    "limit",
  ]) {
    chain[method] = vi.fn(() => chain);
  }
  chain.then = (
    resolve: (value: T[]) => unknown,
    reject?: (reason: unknown) => unknown
  ) => Promise.resolve(rows).then(resolve, reject);
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
  const groupedResults = [
    sourceRowsFromSeeds(),
    lossRowsFromSeeds(),
    funnelRowsFromSeeds(),
  ];
  vi.mocked(getDb).mockResolvedValue({
    select: vi.fn(() => queryReturning(groupedResults.shift() ?? [])),
  } as never);
});

describe("analytics.attribution", () => {
  it("reports source, confirmation, completion, value, loss, and funnel metrics", async () => {
    const caller = appRouter.createCaller(createAuthContext().ctx);

    const report = await caller.analytics.attribution();

    expect(report.sources).toEqual([
      {
        sourceCode: "HOME-HERO-EN",
        sourceChannel: "organic",
        leads: 4,
        confirmed: 2,
        completed: 2,
        leadToConfirmedRate: 50,
        confirmedToCompletedRate: 100,
        estimatedConfirmedValueThb: 120_000,
      },
      {
        sourceCode: "Unknown",
        sourceChannel: "Unknown",
        leads: 4,
        confirmed: 1,
        completed: 1,
        leadToConfirmedRate: 25,
        confirmedToCompletedRate: 100,
        estimatedConfirmedValueThb: 0,
      },
      {
        sourceCode: "KOSHER-PAGE-HE",
        sourceChannel: "Unknown",
        leads: 2,
        confirmed: 1,
        completed: 0,
        leadToConfirmedRate: 50,
        confirmedToCompletedRate: 0,
        estimatedConfirmedValueThb: 80_000,
      },
    ]);
    expect(report.lossReasons).toEqual([
      { reason: "Dates did not work", count: 1 },
      { reason: "No response", count: 1 },
      { reason: "Unknown", count: 1 },
    ]);
    expect(report.funnel).toEqual({
      new: 1,
      contacted: 1,
      quoted: 1,
      converted: 4,
      lost: 3,
    });
    expect(report.summary).toEqual({
      leads: 10,
      confirmed: 4,
      completed: 3,
      leadToConfirmedRate: 40,
      confirmedToCompletedRate: 75,
      estimatedConfirmedValueThb: 200_000,
    });
    expect(report).not.toHaveProperty("totalRevenue");
    expect(report.summary).not.toHaveProperty("revenue");
  });

  it("uses zero for conversion rates when a denominator is zero", async () => {
    vi.mocked(getDb).mockResolvedValue({
      select: vi
        .fn()
        .mockReturnValueOnce(
          queryReturning([
            {
              sourceCode: "GOOGLE-PROFILE",
              sourceChannel: "organic",
              leads: 1,
              confirmed: 0,
              completed: 0,
              estimatedConfirmedValueThb: 0,
            },
          ])
        )
        .mockReturnValueOnce(queryReturning([]))
        .mockReturnValueOnce(queryReturning([{ status: "new", count: 1 }])),
    } as never);
    const caller = appRouter.createCaller(createAuthContext().ctx);

    const report = await caller.analytics.attribution();

    expect(report.sources[0]).toMatchObject({
      leadToConfirmedRate: 0,
      confirmedToCompletedRate: 0,
    });
    expect(report.summary).toMatchObject({
      leadToConfirmedRate: 0,
      confirmedToCompletedRate: 0,
    });
  });

  it("requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext().ctx);

    await expect(caller.analytics.attribution()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
