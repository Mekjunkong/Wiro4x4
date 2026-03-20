import { z } from "zod";
import {
  router,
  securePublicProcedure,
  secureProtectedProcedure,
  checkAdminRateLimit,
  logAdminAction,
} from "./_helpers";
import {
  getAllPublishedBlogPosts,
  getPublishedBlogPostBySlug,
  getAllBlogPosts,
  getAllBlogPostsPaginated,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getAllActiveTours,
} from "../db";
import { blogPostInputSchema, paginationInput } from "../../shared/schemas";
import { generateBlogDraft } from "../aiContentGenerator";
import { storagePut } from "../storage";
import { optimizeUploadedImage } from "../imageOptimizer";

export const blogRouter = router({
  list: securePublicProcedure.query(async () => {
    return await getAllPublishedBlogPosts();
  }),

  getBySlug: securePublicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return await getPublishedBlogPostBySlug(input.slug);
    }),

  listAll: secureProtectedProcedure.query(async () => {
    return await getAllBlogPosts();
  }),

  listAllPaginated: secureProtectedProcedure
    .input(paginationInput)
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const { items, total } = await getAllBlogPostsPaginated(page, pageSize);
      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),

  create: secureProtectedProcedure
    .input(blogPostInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const { scheduledAt, ...rest } = input;
      let publishedAt: Date | undefined;
      if (input.isPublished) {
        publishedAt = scheduledAt ? new Date(scheduledAt) : new Date();
      }
      await createBlogPost({
        ...rest,
        isPublished: input.isPublished ? 1 : 0,
        publishedAt,
      });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "blog",
        newValue: JSON.stringify({ title: input.title, slug: input.slug }),
      });
      return { success: true, message: "Blog post created successfully" };
    }),

  update: secureProtectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: blogPostInputSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const updateData: Record<string, unknown> = {};
      const fields = [
        "title",
        "titleHe",
        "slug",
        "excerpt",
        "excerptHe",
        "content",
        "contentHe",
        "coverImage",
        "category",
        "tags",
        "author",
      ] as const;
      for (const field of fields) {
        if (input.data[field] !== undefined)
          updateData[field] = input.data[field];
      }
      if (input.data.isPublished !== undefined) {
        updateData.isPublished = input.data.isPublished ? 1 : 0;
        if (input.data.isPublished) {
          // Use scheduledAt if provided, otherwise publish now
          updateData.publishedAt = input.data.scheduledAt
            ? new Date(input.data.scheduledAt)
            : new Date();
        }
      } else if (input.data.scheduledAt !== undefined) {
        // Allow updating just the scheduled date without changing publish status
        updateData.publishedAt = new Date(input.data.scheduledAt);
      }
      await updateBlogPost(input.id, updateData as any);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "blog",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),

  delete: secureProtectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await deleteBlogPost(input.id);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "blog",
        resourceId: input.id,
      });
      return { success: true };
    }),

  uploadImage: secureProtectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1),
        fileData: z.string().min(1), // base64
        contentType: z.string().default("image/jpeg"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const rawBuffer = Buffer.from(input.fileData, "base64");

      // Optimize: resize to max 1920x1080 and convert to WebP
      const {
        buffer,
        contentType: optimizedType,
        extension,
      } = await optimizeUploadedImage(rawBuffer, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 80,
      });

      const baseName = input.fileName.replace(/\.[^.]+$/, "");
      const key = `blog/${Date.now()}-${baseName}.${extension}`;
      const { url } = await storagePut(key, buffer, optimizedType);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "upload_image",
        resourceType: "blog",
        newValue: JSON.stringify({ fileName: input.fileName, url }),
      });
      return { url };
    }),

  generateDraft: secureProtectedProcedure
    .input(
      z.object({
        topic: z.string().min(1),
        tone: z
          .enum(["informative", "adventurous", "practical"])
          .default("informative"),
        length: z.number().min(300).max(3000).default(1000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const tours = await getAllActiveTours();
      const tourData = tours.map(t => ({
        name: t.name,
        nameHe: t.nameHe,
        slug: t.slug,
        description: t.description,
        price: t.price,
        duration: t.duration,
      }));
      const draft = await generateBlogDraft({ ...input, tourData });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "generate_draft",
        resourceType: "blog",
        newValue: JSON.stringify({ topic: input.topic }),
      });
      return draft;
    }),
});
