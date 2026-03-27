import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);
  const [rows] = await conn.execute(
    "SELECT COUNT(*) as cnt, isPublished, category FROM galleryPhotos GROUP BY isPublished, category ORDER BY category"
  );
  console.log("Counts by category/published:", rows);

  const [sample] = await conn.execute(
    "SELECT id, title, s3Url, isPublished, category FROM galleryPhotos ORDER BY id DESC LIMIT 5"
  );
  console.log("\nNewest 5 rows:", sample);

  const [total] = await conn.execute(
    "SELECT COUNT(*) as total FROM galleryPhotos"
  );
  console.log("\nTotal photos:", total);

  await conn.end();
}
void main();
