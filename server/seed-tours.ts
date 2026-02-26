/**
 * Tour Seed Script
 *
 * Run with: npx tsx server/seed-tours.ts
 *
 * Inserts the 6 core Chiang Mai tours into the tours table.
 * Skips duplicates (safe to re-run).
 *
 * Requires DATABASE_URL environment variable.
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { tours } from "../drizzle/schema";
import dotenv from "dotenv";

dotenv.config();

const tourData = [
  {
    name: "Doi Inthanon — Roof of Thailand",
    nameHe: "דוי אינתנון — גג תאילנד",
    slug: "doi-inthanon-roof-of-thailand",
    description:
      "Thailand's highest peak, cloud forest trails, and a hidden Karen village coffee farm",
    descriptionHe:
      "הפסגה הגבוהה בתאילנד, שבילי יער ענן וחוות קפה נסתרת בכפר קארן",
    duration: "7-8 hours",
    difficulty: "moderate" as const,
    price: 5000,
    imageUrl: "/images/optimized/accessible_doi_inthanon_summit.jpg",
    isKosher: 1,
    isPrivate: 1,
    isShabbatOk: 1,
    isActive: 1,
    sortOrder: 1,
  },
  {
    name: "Mae Kampong — Hidden Mountain Village",
    nameHe: "מאה קמפונג — הכפר הנסתר בהרים",
    slug: "mae-kampong-hidden-village",
    description:
      "A 700-year-old eco-village, wild gibbon spotting, ancient tea ceremony, and panoramic viewpoint hike",
    descriptionHe:
      "כפר אקולוגי בן 700 שנה, תצפית על גיבונים, טקס תה עתיק וטיול לתצפית פנורמית",
    duration: "5-7 hours",
    difficulty: "easy" as const,
    price: 3500,
    imageUrl: "/images/optimized/mountain_village_view.jpg",
    isKosher: 1,
    isPrivate: 1,
    isShabbatOk: 1,
    isActive: 1,
    sortOrder: 2,
  },
  {
    name: "Maerim & Sticky Waterfalls",
    nameHe: "מאה רים ומפלים דביקים",
    slug: "maerim-sticky-waterfalls",
    description:
      "Climb UP a waterfall barefoot, walk a sky-high canopy walkway, and explore upper waterfall tiers no one reaches",
    descriptionHe:
      "טפסו למעלה על מפל יחפים, הלכו על גשר צמרות בגובה 20 מטר וגלו קומות מפל שאף אחד לא מגיע אליהן",
    duration: "7-8 hours",
    difficulty: "easy" as const,
    price: 4500,
    imageUrl: "/images/optimized/sticky_waterfalls.jpg",
    isKosher: 1,
    isPrivate: 1,
    isShabbatOk: 1,
    isActive: 1,
    sortOrder: 3,
  },
  {
    name: "Doi Suthep-Pui — Beyond the Temple",
    nameHe: "דוי סוטפ-פוי — מעבר למקדש",
    slug: "doi-suthep-pui-beyond-temple",
    description:
      "Hike the ancient Monk's Trail, then keep going where tourists turn back — Hmong village, hidden coffee farm, secluded waterfall",
    descriptionHe:
      "טיילו בשביל הנזירים העתיק, ואז המשיכו לאן שהתיירים חוזרים — כפר המונג, חוות קפה נסתרת ומפל מבודד",
    duration: "5-7 hours",
    difficulty: "easy" as const,
    price: 3500,
    imageUrl: "/images/optimized/accessible_doi_suthep_temple.jpg",
    isKosher: 1,
    isPrivate: 1,
    isShabbatOk: 1,
    isActive: 1,
    sortOrder: 4,
  },
  {
    name: "Mae Wang — Jungle & River Wilderness",
    nameHe: "מאה וואנג — ג'ונגל ונהרות פראיים",
    slug: "mae-wang-jungle-wilderness",
    description:
      "Real 4x4 off-road through jungle, Pha Chor canyon, ethical elephants, bamboo rafting, and hidden waterfalls",
    descriptionHe:
      "שטח אמיתי ברכב 4x4 דרך ג'ונגל, קניון פה-צ'ור, פילים אתיים, שייט במבוק ומפלים נסתרים",
    duration: "8-9 hours",
    difficulty: "challenging" as const,
    price: 5500,
    imageUrl: "/images/optimized/elephant_encounter.jpg",
    isKosher: 1,
    isPrivate: 1,
    isShabbatOk: 0,
    isActive: 1,
    sortOrder: 5,
  },
  {
    name: "Samoeng Loop — The Mountain Circuit",
    nameHe: "לולאת סמאנג — המעגל ההררי",
    slug: "samoeng-loop-mountain-circuit",
    description:
      "100km mountain loop — rare wooden Lanna temple, hilltop farm above the clouds, Hmong village, and lakeside sunset",
    descriptionHe:
      'מעגל הרים של 100 ק"מ — מקדש עץ לאנה נדיר, חווה על פסגת הר מעל העננים, כפר המונג ושקיעה על שפת אגם',
    duration: "8-10 hours",
    difficulty: "moderate" as const,
    price: 5000,
    imageUrl: "/images/optimized/chiang_mai_valley.jpg",
    isKosher: 1,
    isPrivate: 1,
    isShabbatOk: 1,
    isActive: 1,
    sortOrder: 6,
  },
];

async function seed() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is not set. Cannot seed tours.");
    console.log("\nTo use this script, run:");
    console.log("  DATABASE_URL=mysql://... npx tsx server/seed-tours.ts");
    process.exit(1);
  }

  const connection = await mysql.createConnection(dbUrl);
  const db = drizzle(connection);

  console.log(`Seeding ${tourData.length} tours...`);

  for (const tour of tourData) {
    try {
      await db.insert(tours).values(tour);
      console.log(`  + ${tour.slug} (${tour.price} THB)`);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e.code === "ER_DUP_ENTRY") {
        console.log(`  ~ ${tour.slug} (already exists, skipping)`);
      } else {
        console.error(`  ! ${tour.slug}: ${e.message}`);
      }
    }
  }

  await connection.end();
  console.log("\nDone! Tours seeded successfully.");
}

seed().catch(console.error);
