/**
 * Gallery Photo Seed Script
 *
 * Run with: npx tsx server/seed-gallery-photos.ts
 *
 * Inserts all optimized local photos into the galleryPhotos table.
 * Excludes wheelchair/accessibility photos and responsive variants (-sm, -md, -lg).
 * Skips duplicates based on s3Url (safe to re-run).
 *
 * Requires DATABASE_URL environment variable.
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });
dotenv.config();

// ── Excluded filenames (wheelchair/accessibility photos) ──────────────
const EXCLUDED_FILES = new Set([
  "crew_lifting_chair",
  "accessibility_tour",
  "icon-192",
  "icon-512",
  "banner",
]);

// ── Category detection by filename keywords ──────────────────────────
type Category =
  | "tours"
  | "vehicles"
  | "destinations"
  | "activities"
  | "food"
  | "accommodation"
  | "other";

function categorize(name: string): Category {
  const n = name.toLowerCase();

  // Vehicles
  if (
    n.includes("4x4") ||
    n.includes("truck") ||
    n.includes("vehicle") ||
    n.includes("fleet") ||
    n.includes("offroad") ||
    n.includes("mudtrail") ||
    n.includes("convoy") ||
    n.includes("pickup") ||
    n.includes("utv") ||
    n.includes("atv") ||
    n.includes("buggy")
  )
    return "vehicles";

  // Food
  if (
    n.includes("kosher") ||
    n.includes("food") ||
    n.includes("meal") ||
    n.includes("chef") ||
    n.includes("cooking") ||
    n.includes("kitchen")
  )
    return "food";

  // Activities
  if (
    n.includes("elephant") ||
    n.includes("rafting") ||
    n.includes("hiking") ||
    n.includes("bridge_jump") ||
    n.includes("cave") ||
    n.includes("waterfall_freedom") ||
    n.includes("splash") ||
    n.includes("stream_crossing") ||
    n.includes("river_crossing") ||
    n.includes("bamboo")
  )
    return "activities";

  // Destinations / scenery
  if (
    n.includes("doi_inthanon") ||
    n.includes("doi_suthep") ||
    n.includes("mae_") ||
    n.includes("samoeng") ||
    n.includes("golden_triangle") ||
    n.includes("mekong") ||
    n.includes("luang_prabang") ||
    n.includes("vang_vieng") ||
    n.includes("vientiane") ||
    n.includes("nong_khiaw") ||
    n.includes("chiang_mai") ||
    n.includes("kuang_si") ||
    n.includes("temple") ||
    n.includes("pagoda") ||
    n.includes("sticky_waterfall")
  )
    return "destinations";

  // Tour group photos / people
  if (
    n.includes("wiro") ||
    n.includes("group") ||
    n.includes("crew") ||
    n.includes("tourist") ||
    n.includes("couple") ||
    n.includes("selfie") ||
    n.includes("guide") ||
    n.includes("tour_photo") ||
    n.includes("tour_activity") ||
    n.includes("trip")
  )
    return "tours";

  // Nature / landscapes
  if (
    n.includes("waterfall") ||
    n.includes("mountain") ||
    n.includes("valley") ||
    n.includes("jungle") ||
    n.includes("forest") ||
    n.includes("river") ||
    n.includes("rice") ||
    n.includes("sunset") ||
    n.includes("sunrise") ||
    n.includes("nature") ||
    n.includes("panorama") ||
    n.includes("scenic")
  )
    return "destinations";

  // Culture
  if (
    n.includes("tribe") ||
    n.includes("village") ||
    n.includes("karen") ||
    n.includes("hilltribe") ||
    n.includes("market") ||
    n.includes("umbrella") ||
    n.includes("weaving") ||
    n.includes("long_neck") ||
    n.includes("entertainment") ||
    n.includes("akha")
  )
    return "activities";

  return "other";
}

// ── Human-readable title from filename ───────────────────────────────
function titleFromFilename(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/4x4/gi, "4x4")
    .replace(/Wiro/g, "WIRO")
    .trim();
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  const imagesDir = path.resolve("client/public/images/optimized");
  const files = fs.readdirSync(imagesDir);

  // Get base .jpg files only (no responsive variants, no webp duplicates)
  const baseImages = files
    .filter(f => f.endsWith(".jpg"))
    .filter(f => !/-(?:sm|md|lg)\.jpg$/.test(f))
    .map(f => f.replace(/\.jpg$/, ""))
    .filter(name => !EXCLUDED_FILES.has(name));

  console.log(
    `Found ${baseImages.length} images to seed (excluding ${EXCLUDED_FILES.size} blocked)`
  );

  let inserted = 0;
  let skipped = 0;

  for (const name of baseImages) {
    const s3Url = `/images/optimized/${name}.jpg`;

    // Check if already exists
    const [existing] = await connection.execute(
      "SELECT id FROM galleryPhotos WHERE s3Url = ? LIMIT 1",
      [s3Url]
    );

    if ((existing as any[]).length > 0) {
      skipped++;
      continue;
    }

    const category = categorize(name);
    const title = titleFromFilename(name);

    await connection.execute(
      "INSERT INTO galleryPhotos (title, s3Key, s3Url, category, sortOrder, isPublished) VALUES (?, ?, ?, ?, ?, ?)",
      [title, s3Url, s3Url, category, 0, 1]
    );

    inserted++;
    console.log(`  ✅ ${title} [${category}]`);
  }

  console.log(
    `\nDone: ${inserted} inserted, ${skipped} skipped (already exist)`
  );

  await connection.end();
}

main().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
