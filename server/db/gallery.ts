import { eq, sql } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { getDb } from "./connection";
import { galleryPhotos, InsertGalleryPhoto } from "../../drizzle/schema";

export async function createGalleryPhoto(photo: InsertGalleryPhoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(galleryPhotos).values(photo);
}

export async function getAllPublishedPhotos() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(galleryPhotos)
    .where(eq(galleryPhotos.isPublished, 1))
    .orderBy(galleryPhotos.sortOrder, desc(galleryPhotos.createdAt));
}

export async function getAllGalleryPhotos() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(galleryPhotos)
    .orderBy(galleryPhotos.sortOrder, desc(galleryPhotos.createdAt));
}

export async function updateGalleryPhoto(
  id: number,
  data: Partial<InsertGalleryPhoto>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(galleryPhotos)
    .set(data)
    .where(eq(galleryPhotos.id, id));
}

export async function deleteGalleryPhoto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(galleryPhotos).where(eq(galleryPhotos.id, id));
}

export async function getAllGalleryPhotosPaginated(page = 1, pageSize = 20) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const offset = (page - 1) * pageSize;
  const items = await db
    .select()
    .from(galleryPhotos)
    .orderBy(galleryPhotos.sortOrder, desc(galleryPhotos.createdAt))
    .limit(pageSize)
    .offset(offset);
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(galleryPhotos);
  const total = Number(countResult[0]?.count ?? 0);
  return { items, total };
}
