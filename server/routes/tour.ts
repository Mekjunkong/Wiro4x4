import { z } from "zod";
import {
  router,
  securePublicProcedure,
  secureProtectedProcedure,
  checkAdminRateLimit,
  logAdminAction,
  TRPCError,
} from "./_helpers";
import {
  getAllActiveTours,
  getAllTours,
  getAllToursPaginated,
  createTour,
  updateTour,
  deleteTour,
  getTourBySlug,
} from "../db";
import {
  tourAndPackageSlugSchema,
  tourInputSchema,
  paginationInput,
} from "../../shared/schemas";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function resolveTourCreateSlug(
  name: string,
  suppliedSlug?: string
): string {
  const result = tourAndPackageSlugSchema.safeParse(
    suppliedSlug || generateSlug(name)
  );
  if (!result.success) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: result.error.issues[0]?.message ?? "Invalid tour slug",
      cause: result.error,
    });
  }
  return result.data;
}

export const tourRouter = router({
  list: securePublicProcedure.query(async () => {
    return await getAllActiveTours();
  }),

  getBySlug: securePublicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return await getTourBySlug(input.slug);
    }),

  listAll: secureProtectedProcedure.query(async () => {
    return await getAllTours();
  }),

  listAllPaginated: secureProtectedProcedure
    .input(paginationInput)
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const { items, total } = await getAllToursPaginated(page, pageSize);
      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),

  create: secureProtectedProcedure
    .input(tourInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const slug = resolveTourCreateSlug(input.name, input.slug);
      await createTour({
        ...input,
        slug,
        isKosher: input.isKosher ? 1 : 0,
        isPrivate: input.isPrivate ? 1 : 0,
        isShabbatOk: input.isShabbatOk ? 1 : 0,
        isActive: input.isActive ? 1 : 0,
      });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "tour",
        newValue: JSON.stringify({ name: input.name }),
      });
      return { success: true, message: "Tour created successfully" };
    }),

  update: secureProtectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: tourInputSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const updateData: Record<string, unknown> = {};
      const fields = [
        "name",
        "nameHe",
        "slug",
        "description",
        "descriptionHe",
        "duration",
        "difficulty",
        "price",
        "groupMinSize",
        "groupMaxSize",
        "imageUrl",
        "highlights",
        "highlightsHe",
        "includedItems",
        "itinerary",
        "sortOrder",
      ] as const;
      for (const field of fields) {
        if (input.data[field] !== undefined)
          updateData[field] = input.data[field];
      }
      if (input.data.isKosher !== undefined)
        updateData.isKosher = input.data.isKosher ? 1 : 0;
      if (input.data.isPrivate !== undefined)
        updateData.isPrivate = input.data.isPrivate ? 1 : 0;
      if (input.data.isShabbatOk !== undefined)
        updateData.isShabbatOk = input.data.isShabbatOk ? 1 : 0;
      if (input.data.isActive !== undefined)
        updateData.isActive = input.data.isActive ? 1 : 0;
      await updateTour(input.id, updateData as any);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "tour",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),

  delete: secureProtectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await deleteTour(input.id);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "tour",
        resourceId: input.id,
      });
      return { success: true };
    }),
});
