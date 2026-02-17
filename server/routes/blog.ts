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
  getBlogPostBySlug,
  getAllBlogPosts,
  getAllBlogPostsPaginated,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getAllActiveTours,
} from "../db";
import { blogPostInputSchema, paginationInput } from "../../shared/schemas";
import { generateBlogDraft } from "../aiContentGenerator";

export const blogRouter = router({
  list: securePublicProcedure.query(async () => {
    return await getAllPublishedBlogPosts();
  }),

  getBySlug: securePublicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return await getBlogPostBySlug(input.slug);
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
      await createBlogPost({
        ...input,
        isPublished: input.isPublished ? 1 : 0,
        publishedAt: input.isPublished ? new Date() : undefined,
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
          updateData.publishedAt = new Date();
        }
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
