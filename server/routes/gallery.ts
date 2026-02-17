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
  createGalleryPhoto,
  getAllPublishedPhotos,
  getAllGalleryPhotos,
  getAllGalleryPhotosPaginated,
  updateGalleryPhoto,
  deleteGalleryPhoto,
} from "../db";
import { storagePut } from "../storage";
import { paginationInput } from "../../shared/schemas";

export const galleryRouter = router({
  list: securePublicProcedure.query(async () => {
    const photos = await getAllPublishedPhotos();
    return photos.map(p => ({ ...p, imageUrl: p.s3Url }));
  }),

  listAll: secureProtectedProcedure.query(async () => {
    const photos = await getAllGalleryPhotos();
    return photos.map(p => ({ ...p, imageUrl: p.s3Url }));
  }),

  listAllPaginated: secureProtectedProcedure
    .input(paginationInput)
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const { items, total } = await getAllGalleryPhotosPaginated(
        page,
        pageSize
      );
      return {
        items: items.map(p => ({ ...p, imageUrl: p.s3Url })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),

  create: secureProtectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        imageUrl: z.string().min(1),
        description: z.string().optional(),
        category: z
          .enum([
            "tours",
            "vehicles",
            "destinations",
            "activities",
            "food",
            "accommodation",
            "other",
          ])
          .default("other"),
        sortOrder: z.number().default(0),
        isPublished: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const url = new URL(input.imageUrl, "https://placeholder.local");
      await createGalleryPhoto({
        title: input.title,
        s3Key: url.pathname,
        s3Url: input.imageUrl,
        description: input.description,
        category: input.category,
        sortOrder: input.sortOrder,
        isPublished: input.isPublished ? 1 : 0,
      });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "gallery",
        newValue: JSON.stringify({
          title: input.title,
          category: input.category,
        }),
      });
      return { success: true };
    }),

  update: secureProtectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          title: z.string().optional(),
          imageUrl: z.string().optional(),
          description: z.string().optional(),
          category: z
            .enum([
              "tours",
              "vehicles",
              "destinations",
              "activities",
              "food",
              "accommodation",
              "other",
            ])
            .optional(),
          sortOrder: z.number().optional(),
          isPublished: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const updateData: Record<string, unknown> = {};
      if (input.data.title !== undefined) updateData.title = input.data.title;
      if (input.data.imageUrl !== undefined) {
        updateData.s3Url = input.data.imageUrl;
        const url = new URL(input.data.imageUrl, "https://placeholder.local");
        updateData.s3Key = url.pathname;
      }
      if (input.data.description !== undefined)
        updateData.description = input.data.description;
      if (input.data.category !== undefined)
        updateData.category = input.data.category;
      if (input.data.sortOrder !== undefined)
        updateData.sortOrder = input.data.sortOrder;
      if (input.data.isPublished !== undefined)
        updateData.isPublished = input.data.isPublished ? 1 : 0;
      await updateGalleryPhoto(input.id, updateData as any);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "gallery",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),

  delete: secureProtectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await deleteGalleryPhoto(input.id);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "gallery",
        resourceId: input.id,
      });
      return { success: true };
    }),

  upload: secureProtectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        base64Data: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);

      // Whitelist content types (Task 1.6)
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

      // Max file size: 10MB
      const fileSize = Buffer.byteLength(input.base64Data, "base64");
      if (fileSize > 10 * 1024 * 1024) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File too large. Maximum size is 10MB.",
        });
      }

      // Sanitize filename - use UUID instead of user-provided name
      const ext =
        input.contentType.split("/")[1] === "jpeg"
          ? "jpg"
          : input.contentType.split("/")[1];
      const safeFilename = `${randomUUID()}.${ext}`;
      const key = `gallery/${safeFilename}`;

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
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "gallery_upload",
        newValue: JSON.stringify({ key: result.key }),
      });
      return { url: result.url, key: result.key };
    }),
});
