import { beforeEach, describe, expect, it, vi } from "vitest";
import { drizzle } from "drizzle-orm/mysql2";
import { appRouter } from "./routers";
import { createAuthContext, createPublicContext } from "./test-helpers";
import { getDb } from "./db/connection";
import { buildAttributionQueries } from "./db/analytics";

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
    sourceCode: "",
    sourceChannel: "   ",
    status: "quoted",
    estimatedValueThb: 40_000,
    lostReason: null,
    completedAt: null,
    convertedToBookingId: null,
  },
  {
    sourceCode: "   ",
    sourceChannel: "",
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

function summaryRowFromSeeds(seeds: LeadSeed[] = leadSeeds) {
  return seeds.reduce(
    (summary, lead) => {
      summary.leads += 1;
      if (lead.status === "converted") {
        summary.confirmed += 1;
        summary.estimatedConfirmedValueThb += lead.estimatedValueThb ?? 0;
      }
      if (
        lead.completedAt !== null ||
        (lead.convertedToBookingId !== null &&
          completedBookingIds.has(lead.convertedToBookingId))
      ) {
        summary.completed += 1;
      }
      return summary;
    },
    {
      leads: 0,
      confirmed: 0,
      completed: 0,
      estimatedConfirmedValueThb: 0,
    }
  );
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
    [summaryRowFromSeeds()],
    lossRowsFromSeeds(),
    funnelRowsFromSeeds(),
  ];
  vi.mocked(getDb).mockResolvedValue({
    select: vi.fn(() => queryReturning(groupedResults.shift() ?? [])),
  } as never);
});

describe("analytics.attribution", () => {
  it("builds completion and Unknown semantics into both source and summary SQL", () => {
    const db = drizzle.mock();
    const { sourceQuery, summaryQuery } = buildAttributionQueries(db);

    for (const query of [sourceQuery, summaryQuery]) {
      const { sql } = query.toSQL();
      const normalizedSql = sql.replace(/\s+/g, " ").toLowerCase();

      expect(normalizedSql).toContain("left join `bookings`");
      expect(normalizedSql).toContain(
        "`leads`.`convertedtobookingid` = `bookings`.`id`"
      );
      expect(normalizedSql).toMatch(
        /case when `leads`\.`completedat` is not null or `bookings`\.`status` = 'completed' then 1 else 0 end/
      );
      expect(normalizedSql).not.toMatch(
        /completedat` is not null\s+and\s+`bookings`\.`status`/
      );
      expect(
        normalizedSql.match(
          /case when [^)]*completedat[^)]* then 1 else 0 end/g
        )
      ).toHaveLength(1);
    }

    const sourceSql = sourceQuery
      .toSQL()
      .sql.replace(/\s+/g, " ")
      .toLowerCase();
    const sourceSelectSql = sourceSql.split(" from ")[0];
    expect(sourceSelectSql.match(/coalesce\(nullif\(trim\(/g)).toHaveLength(2);
    expect(sourceSelectSql.match(/\), ''\), 'unknown'\)/g)).toHaveLength(2);
    expect(sourceSql).toContain("as `normalized_source_code`");
    expect(sourceSql).toContain("as `normalized_source_channel`");
    const sourceGroupBySql = sourceSql
      .split(" group by ")[1]
      ?.split(" order by ")[0];
    expect(sourceGroupBySql).toBeDefined();
    expect(sourceGroupBySql?.match(/coalesce\(nullif\(trim\(/g)).toHaveLength(
      2
    );
    expect(sourceGroupBySql).not.toBe("`sourcecode`, `sourcechannel`");
    expect(sourceSql).toContain("`leads`.`status` = 'converted'");

    const summarySql = summaryQuery
      .toSQL()
      .sql.replace(/\s+/g, " ")
      .toLowerCase();
    expect(summarySql).not.toContain(" group by ");
    expect(summarySql).not.toContain(" limit ");
  });

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
    const unknownRows = report.sources.filter(
      source =>
        source.sourceCode === "Unknown" && source.sourceChannel === "Unknown"
    );
    expect(unknownRows).toEqual([
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
    ]);
    const reactKeys = report.sources.map(
      source => `${source.sourceCode}:${source.sourceChannel}`
    );
    expect(new Set(reactKeys).size).toBe(reactKeys.length);
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
        .mockReturnValueOnce(
          queryReturning([
            {
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

  it("keeps the summary authoritative when source display rows are capped", async () => {
    const allSourceRows = Array.from({ length: 101 }, (_, index) => ({
      sourceCode: `SOURCE-${String(index).padStart(3, "0")}`,
      sourceChannel: `channel-${index}`,
      leads: 1,
      confirmed: 1,
      completed: 1,
      estimatedConfirmedValueThb: 1_000,
    }));
    const displayedSourceRows = allSourceRows.slice(0, 100);
    const authoritativeSummary = allSourceRows.reduce(
      (summary, source) => ({
        leads: summary.leads + source.leads,
        confirmed: summary.confirmed + source.confirmed,
        completed: summary.completed + source.completed,
        estimatedConfirmedValueThb:
          summary.estimatedConfirmedValueThb +
          source.estimatedConfirmedValueThb,
      }),
      {
        leads: 0,
        confirmed: 0,
        completed: 0,
        estimatedConfirmedValueThb: 0,
      }
    );
    vi.mocked(getDb).mockResolvedValue({
      select: vi
        .fn()
        .mockReturnValueOnce(queryReturning(displayedSourceRows))
        .mockReturnValueOnce(queryReturning([authoritativeSummary]))
        .mockReturnValueOnce(queryReturning([]))
        .mockReturnValueOnce(
          queryReturning([{ status: "converted", count: 101 }])
        ),
    } as never);
    const caller = appRouter.createCaller(createAuthContext().ctx);

    const report = await caller.analytics.attribution();

    expect(report.sources).toHaveLength(100);
    expect(report.summary).toEqual({
      leads: 101,
      confirmed: 101,
      completed: 101,
      leadToConfirmedRate: 100,
      confirmedToCompletedRate: 100,
      estimatedConfirmedValueThb: 101_000,
    });
  });

  it("requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext().ctx);

    await expect(caller.analytics.attribution()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
