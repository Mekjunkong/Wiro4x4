import { z } from "zod";
import { randomUUID } from "crypto";
import {
  router,
  TRPCError,
  securePublicProcedure,
  secureProtectedProcedure,
  checkAdminRateLimit,
  logAdminAction,
  captureException,
} from "./_helpers";
import {
  createTripPhotoAlbum,
  getTripPhotoAlbumByToken,
  getTripPhotoAlbumById,
  getAllTripPhotoAlbums,
  updateTripPhotoAlbum,
  incrementAlbumViewCount,
  deleteTripPhotoAlbum,
  createTripPhoto,
  getTripPhotosByAlbumId,
  deleteTripPhoto,
  getAlbumPhotoCount,
  getBookingById,
} from "../db";
import { storagePut } from "../storage";
import { sendTripPhotoAlbumEmail } from "../tripPhotoEmailService";
import { COMPANY_WEBSITE } from "../../shared/const";

export const tripPhotosRouter = router({
  // ── Admin: Create album for a booking ────────────────────────────
  createAlbum: secureProtectedProcedure
    .input(
      z.object({
        bookingId: z.number(),
        title: z.string().min(1).max(255),
        message: z.string().max(2000).optional(),
        expiresAt: z.string().optional(), // ISO date string
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);

      // Generate a cryptographically random access token
      const accessToken =
        randomUUID().replace(/-/g, "") +
        randomUUID().replace(/-/g, "").slice(0, 32);

      await createTripPhotoAlbum({
        bookingId: input.bookingId,
        accessToken,
        title: input.title,
        message: input.message ?? null,
        isActive: 1,
        viewCount: 0,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      });

      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "trip_photo_album",
        newValue: JSON.stringify({
          bookingId: input.bookingId,
          title: input.title,
        }),
      });

      return { success: true, accessToken };
    }),

  // ── Admin: Upload photo to an album ──────────────────────────────
  uploadPhoto: secureProtectedProcedure
    .input(
      z.object({
        albumId: z.number(),
        filename: z.string(),
        contentType: z.string(),
        base64Data: z.string(),
        caption: z.string().max(255).optional(),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);

      // Validate content type
      const ALLOWED_TYPES = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (!ALLOWED_TYPES.includes(input.contentType)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF",
        });
      }

      // Max file size: 15MB for trip photos
      const fileSize = Buffer.byteLength(input.base64Data, "base64");
      if (fileSize > 15 * 1024 * 1024) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File too large. Maximum size is 15MB.",
        });
      }

      // Verify album exists
      const album = await getTripPhotoAlbumById(input.albumId);
      if (!album) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Album not found",
        });
      }

      // Generate safe filename with UUID
      const ext =
        input.contentType.split("/")[1] === "jpeg"
          ? "jpg"
          : input.contentType.split("/")[1];
      const safeFilename = `${randomUUID()}.${ext}`;
      const key = `trip-photos/${album.accessToken}/${safeFilename}`;

      const buffer = Buffer.from(input.base64Data, "base64");
      let result: { key: string; url: string };
      try {
        result = await storagePut(key, buffer, input.contentType);
      } catch (err) {
        captureException(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload file to storage",
          cause: err,
        });
      }

      await createTripPhoto({
        albumId: input.albumId,
        s3Key: result.key,
        s3Url: result.url,
        caption: input.caption ?? null,
        sortOrder: input.sortOrder,
      });

      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "trip_photo",
        newValue: JSON.stringify({
          albumId: input.albumId,
          key: result.key,
        }),
      });

      return { url: result.url, key: result.key };
    }),

  // ── Admin: Delete photo from album ───────────────────────────────
  deletePhoto: secureProtectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await deleteTripPhoto(input.id);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "trip_photo",
        resourceId: input.id,
      });
      return { success: true };
    }),

  // ── Admin: List all albums with booking info ─────────────────────
  listAlbums: secureProtectedProcedure.query(async () => {
    const albums = await getAllTripPhotoAlbums();
    // Get photo counts for each album
    const albumsWithCounts = await Promise.all(
      albums.map(async a => {
        const photoCount = await getAlbumPhotoCount(a.album.id);
        return {
          ...a.album,
          title: a.album.title ?? "Untitled album",
          bookingContactName: a.bookingContactName,
          bookingContactEmail: a.bookingContactEmail,
          photoCount,
        };
      })
    );
    return albumsWithCounts;
  }),

  // ── Admin: Get album photos ──────────────────────────────────────
  getAlbumPhotos: secureProtectedProcedure
    .input(z.object({ albumId: z.number() }))
    .query(async ({ input }) => {
      const photos = await getTripPhotosByAlbumId(input.albumId);
      return photos
        .filter(photo => photo.s3Url !== null)
        .map(photo => ({ ...photo, s3Url: photo.s3Url! }));
    }),

  // ── Admin: Update album ──────────────────────────────────────────
  updateAlbum: secureProtectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          title: z.string().min(1).max(255).optional(),
          message: z.string().max(2000).nullable().optional(),
          isActive: z.boolean().optional(),
          expiresAt: z.string().nullable().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const updateData: Record<string, unknown> = {};
      if (input.data.title !== undefined) updateData.title = input.data.title;
      if (input.data.message !== undefined)
        updateData.message = input.data.message;
      if (input.data.isActive !== undefined)
        updateData.isActive = input.data.isActive ? 1 : 0;
      if (input.data.expiresAt !== undefined)
        updateData.expiresAt = input.data.expiresAt
          ? new Date(input.data.expiresAt)
          : null;

      await updateTripPhotoAlbum(input.id, updateData as any);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "trip_photo_album",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),

  // ── Admin: Delete album ──────────────────────────────────────────
  deleteAlbum: secureProtectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await deleteTripPhotoAlbum(input.id);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "trip_photo_album",
        resourceId: input.id,
      });
      return { success: true };
    }),

  // ── Admin: Send album email to customer ──────────────────────────
  sendAlbumEmail: secureProtectedProcedure
    .input(z.object({ albumId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);

      const album = await getTripPhotoAlbumById(input.albumId);
      if (!album) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Album not found",
        });
      }

      const booking = await getBookingById(album.bookingId);
      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found for this album",
        });
      }

      if (!booking.contactEmail) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No email address found for this booking",
        });
      }

      const photos = await getTripPhotosByAlbumId(album.id);
      const albumUrl = `${COMPANY_WEBSITE}/album/${album.accessToken}`;

      const success = await sendTripPhotoAlbumEmail({
        customerName: booking.contactName,
        customerEmail: booking.contactEmail,
        albumTitle: album.title ?? "Your WIRO 4x4 trip photos",
        albumUrl,
        personalMessage: album.message,
        photoCount: photos.length,
        firstPhotoUrl: photos[0]?.s3Url ?? null,
      });

      if (!success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send email. Check email configuration.",
        });
      }

      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "trip_photo_email",
        newValue: JSON.stringify({
          albumId: album.id,
          sentTo: booking.contactEmail,
        }),
      });

      return { success: true };
    }),

  // ── Public: Get album by access token ────────────────────────────
  getAlbum: securePublicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ input }) => {
      const album = await getTripPhotoAlbumByToken(input.token);

      if (!album) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Album not found",
        });
      }

      // Check if album is active
      if (!album.isActive) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This album is no longer available",
        });
      }

      // Check if album has expired
      if (album.expiresAt && new Date(album.expiresAt) < new Date()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This album has expired",
        });
      }

      // Increment view count (fire and forget)
      incrementAlbumViewCount(album.id).catch(() => {});

      // Get photos
      const photos = await getTripPhotosByAlbumId(album.id);

      // Get booking info for the "thank you" display
      const booking = await getBookingById(album.bookingId);

      return {
        title: album.title ?? "Your WIRO 4x4 trip photos",
        message: album.message,
        createdAt: album.createdAt,
        customerName: booking?.contactName ?? "Guest",
        photos: photos
          .filter(photo => photo.s3Url !== null)
          .map(photo => ({
            id: photo.id,
            url: photo.s3Url!,
            caption: photo.caption,
            sortOrder: photo.sortOrder,
          })),
      };
    }),
});
