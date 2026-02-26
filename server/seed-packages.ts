/**
 * Tour Packages Seed Script
 *
 * Run with: npx tsx server/seed-packages.ts
 *
 * Inserts 3 curated multi-day tour packages into the tourPackages table.
 * Skips duplicates (safe to re-run).
 *
 * Requires DATABASE_URL environment variable.
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { tourPackages } from "../drizzle/schema";
import dotenv from "dotenv";

dotenv.config();

const packages = [
  {
    name: "Weekend Adventure",
    nameHe: "הרפתקת סוף שבוע",
    slug: "weekend-adventure",
    description:
      "Perfect weekend getaway combining Chiang Mai's most iconic destinations. Two days of mountain peaks, hidden villages, and authentic Northern Thai culture — all with full kosher support.",
    descriptionHe:
      "חופשת סוף שבוע מושלמת המשלבת את היעדים האיקוניים ביותר של צ'יאנג מאי. יומיים של פסגות הרים, כפרים נסתרים ותרבות צפון תאילנדית אותנטית — הכל עם תמיכה כשרה מלאה.",
    tourSlugs: JSON.stringify([
      "doi-inthanon-roof-of-thailand",
      "mae-kampong-hidden-village",
    ]),
    coverImage: "/images/optimized/doi_inthanon_summit.webp",
    isPublished: 1,
  },
  {
    name: "Northern Explorer",
    nameHe: "חוקר הצפון",
    slug: "northern-explorer",
    description:
      "Three days exploring the best of Northern Thailand's mountains and waterfalls. From Thailand's highest peak to natural sticky waterfalls and a scenic mountain loop — the ultimate adventure trio.",
    descriptionHe:
      "שלושה ימים של חקירת ההרים והמפלים הטובים ביותר של צפון תאילנד. מהפסגה הגבוהה ביותר בתאילנד דרך מפלים דביקים טבעיים ועד לולאת הרים ציורית — שלישיית ההרפתקאות האולטימטיבית.",
    tourSlugs: JSON.stringify([
      "doi-inthanon-roof-of-thailand",
      "maerim-sticky-waterfalls",
      "samoeng-loop-mountain-circuit",
    ]),
    coverImage: "/images/optimized/sticky_waterfall_climb.webp",
    isPublished: 1,
  },
  {
    name: "Ultimate Chiang Mai",
    nameHe: "צ'יאנג מאי האולטימטיבי",
    slug: "ultimate-chiang-mai",
    description:
      "The complete Chiang Mai experience — five days covering all six of our signature tours. Mountains, waterfalls, temples, jungles, villages, and scenic loops. Our best value package with the biggest discount.",
    descriptionHe:
      "חוויית צ'יאנג מאי המלאה — חמישה ימים הכוללים את כל ששת הטיולים המיוחדים שלנו. הרים, מפלים, מקדשים, ג'ונגלים, כפרים ולולאות נוף. החבילה המשתלמת ביותר שלנו עם ההנחה הגדולה ביותר.",
    tourSlugs: JSON.stringify([
      "doi-inthanon-roof-of-thailand",
      "mae-kampong-hidden-village",
      "maerim-sticky-waterfalls",
      "doi-suthep-pui-beyond-temple",
      "mae-wang-jungle-wilderness",
      "samoeng-loop-mountain-circuit",
    ]),
    coverImage: "/images/optimized/wiro_4x4_mountain.webp",
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
        console.log(`  ~ ${pkg.slug} (already exists, skipping)`);
      } else {
        console.error(`  ! ${pkg.slug}: ${e.message}`);
      }
    }
  }

  await connection.end();
  console.log("\nDone! Tour packages seeded successfully.");
}

seed().catch(console.error);
