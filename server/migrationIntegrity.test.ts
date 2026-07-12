import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const drizzleDirectory = resolve(process.cwd(), "drizzle");
const metadataDirectory = resolve(drizzleDirectory, "meta");
const journal = JSON.parse(
  readFileSync(resolve(metadataDirectory, "_journal.json"), "utf8")
) as { entries: Array<{ idx: number; tag: string }> };

describe("hand-authored migration integrity", () => {
  it.each(["0009_post_tour_review_funnel", "0010_lead_attribution"])(
    "keeps %s discoverable without claiming a generated snapshot",
    tag => {
      const migrationNumber = tag.slice(0, 4);

      expect(journal.entries.some(entry => entry.tag === tag)).toBe(true);
      expect(existsSync(resolve(drizzleDirectory, `${tag}.sql`))).toBe(true);
      expect(
        existsSync(
          resolve(metadataDirectory, `${migrationNumber}_snapshot.json`)
        )
      ).toBe(false);
    }
  );

  it("keeps the lead migration additive and scoped to the leads table", () => {
    const sql = readFileSync(
      resolve(drizzleDirectory, "0010_lead_attribution.sql"),
      "utf8"
    );

    expect(sql).toContain("ALTER TABLE `leads` MODIFY COLUMN `email`");
    expect(sql).toContain("ALTER TABLE `leads` ADD `sourceCode`");
    expect(sql).toContain("CREATE INDEX `idx_leads_completedAt`");
    expect(sql).not.toMatch(/\b(?:CREATE|DROP|RENAME)\s+TABLE\b/i);
    expect(sql).not.toMatch(/\bDROP\s+(?:COLUMN|INDEX)\b/i);
    expect(sql).not.toMatch(/ALTER TABLE `(?!leads`)/i);
  });
});
