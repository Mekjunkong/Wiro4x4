import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getTableColumns, getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import {
  tourAvailability,
  tripPhotoAlbums,
  tripPhotos,
} from "../drizzle/schema";

const drizzleDirectory = resolve(process.cwd(), "drizzle");
const metadataDirectory = resolve(drizzleDirectory, "meta");
const journal = JSON.parse(
  readFileSync(resolve(metadataDirectory, "_journal.json"), "utf8")
) as { entries: Array<{ idx: number; tag: string }> };

describe("hand-authored migration integrity", () => {
  it("maps legacy production tables without asking migrations to rename them", () => {
    expect(getTableName(tourAvailability)).toBe("tour_availability");
    expect(getTableColumns(tourAvailability).tourId.name).toBe("tour_id");
    expect(getTableName(tripPhotoAlbums)).toBe("trip_photo_albums");
    expect(getTableColumns(tripPhotoAlbums).accessToken.name).toBe(
      "access_token"
    );
    expect(getTableName(tripPhotos)).toBe("trip_photos");
    expect(getTableColumns(tripPhotos).albumId.name).toBe("album_id");
  });

  it.each(["0009_post_tour_review_funnel", "0010_lead_attribution"])(
    "keeps %s discoverable through the journal and SQL history",
    tag => {
      expect(journal.entries.some(entry => entry.tag === tag)).toBe(true);
      expect(existsSync(resolve(drizzleDirectory, `${tag}.sql`))).toBe(true);
    }
  );

  it("links a verified 0009 production baseline to the truthful post-0010 snapshot", () => {
    const snapshotPaths = ["0008", "0009", "0010"].map(number =>
      resolve(metadataDirectory, `${number}_snapshot.json`)
    );
    expect(snapshotPaths.every(existsSync)).toBe(true);
    if (!snapshotPaths.every(existsSync)) return;

    const [snapshot0008, snapshot0009, snapshot0010] = snapshotPaths.map(
      path =>
        JSON.parse(readFileSync(path, "utf8")) as {
          id: string;
          prevId: string;
          tables: Record<
            string,
            { columns: Record<string, { notNull: boolean; type: string }> }
          >;
        }
    );

    expect(snapshot0009.prevId).toBe(snapshot0008.id);
    expect(snapshot0010.prevId).toBe(snapshot0009.id);
    expect(snapshot0009.tables).toHaveProperty("postTourReviewRequests");
    expect(snapshot0009.tables).toHaveProperty("postTourReviewEvents");
    expect(snapshot0009.tables.leads.columns.email.notNull).toBe(true);
    expect(snapshot0009.tables.leads.columns).not.toHaveProperty("sourceCode");
    expect(snapshot0010.tables.leads.columns.email.notNull).toBe(false);
    expect(snapshot0010.tables.leads.columns).toHaveProperty("sourceCode");
    expect(snapshot0010.tables.leads.columns).toHaveProperty("completedAt");
    expect(snapshot0010.tables.leads.columns.travelDate.type).toBe("date");
  });

  it("keeps the lead migration additive and scoped to the leads table", () => {
    const sql = readFileSync(
      resolve(drizzleDirectory, "0010_lead_attribution.sql"),
      "utf8"
    );

    expect(sql).toContain("ALTER TABLE `leads` MODIFY COLUMN `email`");
    expect(sql).toContain("ALTER TABLE `leads` ADD `sourceCode`");
    expect(sql).toContain("ALTER TABLE `leads` ADD `travelDate` date");
    expect(sql).not.toContain("ALTER TABLE `leads` ADD `travelDate` timestamp");
    expect(sql).toContain("CREATE INDEX `idx_leads_completedAt`");
    expect(sql).not.toMatch(/\b(?:CREATE|DROP|RENAME)\s+TABLE\b/i);
    expect(sql).not.toMatch(/\bDROP\s+(?:COLUMN|INDEX)\b/i);
    expect(sql).not.toMatch(/ALTER TABLE `(?!leads`)/i);
  });
});
