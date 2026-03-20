import { eq, sql, desc } from "drizzle-orm";
import { getDb } from "./connection";
import {
  tripPhotoAlbums,
  tripPhotos,
  bookings,
  InsertTripPhotoAlbum,
  InsertTripPhoto,
} from "../../drizzle/schema";

// ── Albums ───────────────────────────────────────────────────────────

export async function createTripPhotoAlbum(
  album: Omit<InsertTripPhotoAlbum, "id" | "createdAt" | "updatedAt">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(tripPhotoAlbums).values(album);
}

export async function getTripPhotoAlbumsByBookingId(bookingId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(tripPhotoAlbums)
    .where(eq(tripPhotoAlbums.bookingId, bookingId))
    .orderBy(desc(tripPhotoAlbums.createdAt));
}

export async function getTripPhotoAlbumByToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  const results = await db
    .select()
    .from(tripPhotoAlbums)
    .where(eq(tripPhotoAlbums.accessToken, token))
    .limit(1);
  return results[0] ?? null;
}

export async function getTripPhotoAlbumById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const results = await db
    .select()
    .from(tripPhotoAlbums)
    .where(eq(tripPhotoAlbums.id, id))
    .limit(1);
  return results[0] ?? null;
}

export async function getAllTripPhotoAlbums() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      album: tripPhotoAlbums,
      bookingContactName: bookings.contactName,
      bookingContactEmail: bookings.contactEmail,
    })
    .from(tripPhotoAlbums)
    .leftJoin(bookings, eq(tripPhotoAlbums.bookingId, bookings.id))
    .orderBy(desc(tripPhotoAlbums.createdAt));
}

export async function updateTripPhotoAlbum(
  id: number,
  data: Partial<{
    title: string;
    message: string | null;
    isActive: number;
    expiresAt: Date | null;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db
    .update(tripPhotoAlbums)
    .set(data)
    .where(eq(tripPhotoAlbums.id, id));
}

export async function incrementAlbumViewCount(id: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(tripPhotoAlbums)
    .set({ viewCount: sql`${tripPhotoAlbums.viewCount} + 1` })
    .where(eq(tripPhotoAlbums.id, id));
}

export async function deleteTripPhotoAlbum(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete photos first, then the album
  await db.delete(tripPhotos).where(eq(tripPhotos.albumId, id));
  return await db.delete(tripPhotoAlbums).where(eq(tripPhotoAlbums.id, id));
}

// ── Photos ───────────────────────────────────────────────────────────

export async function createTripPhoto(
  photo: Omit<InsertTripPhoto, "id" | "createdAt">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(tripPhotos).values(photo);
}

export async function getTripPhotosByAlbumId(albumId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(tripPhotos)
    .where(eq(tripPhotos.albumId, albumId))
    .orderBy(tripPhotos.sortOrder, desc(tripPhotos.createdAt));
}

export async function deleteTripPhoto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(tripPhotos).where(eq(tripPhotos.id, id));
}

export async function getTripPhotoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const results = await db
    .select()
    .from(tripPhotos)
    .where(eq(tripPhotos.id, id))
    .limit(1);
  return results[0] ?? null;
}

export async function getAlbumPhotoCount(albumId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(tripPhotos)
    .where(eq(tripPhotos.albumId, albumId));
  return result[0]?.count ?? 0;
}
