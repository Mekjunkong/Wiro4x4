/**
 * Tour Packages Seed Script
 *
 * Run with: npx tsx server/seed-packages.ts
 *
 * Inserts 2 curated multi-day tour packages into the tourPackages table:
 *   1. northern-thailand-3d2n — 3 Days / 2 Nights Northern Thailand
 *   2. grand-tour-laos-14d — 14-Day Grand Tour: Thailand to Laos
 *
 * Skips duplicates (safe to re-run).
 *
 * Requires DATABASE_URL environment variable.
 */

import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import mysql from "mysql2/promise";
import { tourPackages } from "../drizzle/schema";
import dotenv from "dotenv";

dotenv.config();

const packages = [
  {
    name: "3 Days / 2 Nights — Northern Thailand Mountain Loop",
    nameHe: "3 ימים / 2 לילות — לולאת ההרים של צפון תאילנד",
    slug: "northern-thailand-3d2n",
    description:
      "An unforgettable 3-day off-road adventure through the mountains of Northern Thailand. Explore hidden caves in Chiang Dao, taste tea at Mae Salong's hilltop plantations, and wind through the legendary Mae Hong Son loop.",
    descriptionHe:
      "הרפתקת שטח בת 3 ימים בלתי נשכחת דרך ההרים של צפון תאילנד. חקרו מערות נסתרות בצ'יאנג דאו, טעמו תה במטעי מאה סאלונג, וסעו דרך לולאת מאה הונג סון האגדית.",
    tourSlugs: JSON.stringify([
      "doi-inthanon-roof-of-thailand",
      "mae-kampong-hidden-village",
      "samoeng-loop-mountain-circuit",
    ]),
    discountPercent: 15,
    coverImage: "/images/optimized/mountain_peak_sunrise_golden.jpg",
    isPublished: 1,
  },
  {
    name: "14-Day Grand Tour: Thailand to Laos by 4x4",
    nameHe: "מסע גדול 14 ימים: מתאילנד ללאוס ברכב 4x4",
    slug: "grand-tour-laos-14d",
    description:
      "The ultimate overland expedition from Chiang Mai through the mountains of Northern Thailand, across the Mekong River into Laos, and back. Two weeks of epic off-road driving and cross-border adventure.",
    descriptionHe:
      "המסע היבשתי האולטימטיבי מצ'יאנג מאי דרך ההרים של צפון תאילנד, חציית נהר המקונג ללאוס וחזרה. שבועיים של נהיגת שטח אפית והרפתקת חציית גבולות.",
    tourSlugs: JSON.stringify([
      "doi-inthanon-roof-of-thailand",
      "mae-kampong-hidden-village",
      "maerim-sticky-waterfalls",
      "doi-suthep-pui-beyond-temple",
      "mae-wang-jungle-wilderness",
      "samoeng-loop-mountain-circuit",
    ]),
    discountPercent: 25,
    coverImage: "/images/optimized/pickup_truck_dirt_road_mountains.jpg",
    isPublished: 1,
  },
];

async function seed() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is not set. Cannot seed packages.");
    console.log("\nTo use this script, run:");
    console.log("  DATABASE_URL=mysql://... npx tsx server/seed-packages.ts");
    process.exit(1);
  }

  const connection = await mysql.createConnection(dbUrl);
  const db = drizzle(connection);

  console.log(`Seeding ${packages.length} tour packages...`);

  for (const pkg of packages) {
    try {
      await db.insert(tourPackages).values(pkg);
      console.log(`  + ${pkg.slug}`);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e.code === "ER_DUP_ENTRY") {
        await db
          .update(tourPackages)
          .set({
            name: pkg.name,
            nameHe: pkg.nameHe,
            description: pkg.description,
            descriptionHe: pkg.descriptionHe,
            tourSlugs: pkg.tourSlugs,
            discountPercent: pkg.discountPercent,
            coverImage: pkg.coverImage,
            isPublished: pkg.isPublished,
          })
          .where(eq(tourPackages.slug, pkg.slug));
        console.log(`  ~ ${pkg.slug} (already exists, updated)`);
      } else {
        console.error(`  ! ${pkg.slug}: ${e.message}`);
      }
    }
  }

  await connection.end();
  console.log("\nDone! Tour packages seeded successfully.");
}

seed().catch(console.error);
