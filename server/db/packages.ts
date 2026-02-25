import { eq, desc } from "drizzle-orm";
import { getDb } from "./connection";
import { tourPackages, InsertTourPackage } from "../../drizzle/schema";

export async function createTourPackage(pkg: InsertTourPackage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(tourPackages).values(pkg);
}

export async function getPublishedTourPackages() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(tourPackages)
    .where(eq(tourPackages.isPublished, 1))
    .orderBy(desc(tourPackages.createdAt));
}

export async function getAllTourPackages() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(tourPackages)
    .orderBy(desc(tourPackages.createdAt));
}

export async function getTourPackageBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(tourPackages)
    .where(eq(tourPackages.slug, slug))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTourPackage(
  id: number,
  data: Partial<InsertTourPackage>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(tourPackages).set(data).where(eq(tourPackages.id, id));
}

export async function deleteTourPackage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(tourPackages).where(eq(tourPackages.id, id));
}
