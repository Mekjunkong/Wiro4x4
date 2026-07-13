import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("AnalyticsTab data sources", () => {
  it("renders the lead funnel from the attribution response without a duplicate query", () => {
    const source = readFileSync(
      "client/src/components/admin/AnalyticsTab.tsx",
      "utf8"
    );

    expect(source).not.toContain("trpc.analytics.leadFunnel.useQuery()");
    expect(source).not.toMatch(/\b(?:funnelData|loadingFunnel)\b/);
    expect(source).toMatch(/funnel=\{\s*attribution\?\.funnel\s*\?\?/);
  });
});
