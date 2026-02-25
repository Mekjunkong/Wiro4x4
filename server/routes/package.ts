import { z } from "zod";
import {
  router,
  securePublicProcedure,
  secureProtectedProcedure,
  checkAdminRateLimit,
  logAdminAction,
} from "./_helpers";
import {
  getPublishedTourPackages,
  getAllTourPackages,
  getTourPackageBySlug,
  createTourPackage,
  updateTourPackage,
  deleteTourPackage,
  getAllActiveTours,
} from "../db";
import { tourPackageInputSchema } from "../../shared/schemas";
import { calculatePackageDiscount } from "../../shared/pricing";
import type { Tour, TourPackage } from "../../drizzle/schema";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Resolve a package's tourSlugs to full tour objects and calculate pricing. */
function resolvePackage(pkg: TourPackage, toursMap: Map<string, Tour>) {
  const tourSlugs: string[] = JSON.parse(pkg.tourSlugs);
  const resolvedTours = tourSlugs
    .map(slug => toursMap.get(slug))
    .filter((t): t is Tour => t != null);

  const originalPrice = resolvedTours.reduce((sum, t) => sum + t.price, 0);
  const { discountedPrice, savings, discountPercent } =
    calculatePackageDiscount(
      resolvedTours.length,
      originalPrice,
      pkg.discountPercent ?? undefined
    );

  return {
    ...pkg,
    tourSlugs,
    resolvedTours,
    originalPrice,
    discountedPrice,
    savings,
    discountPercent,
  };
}

export const packageRouter = router({
  /** Public: list published packages with resolved tour data + pricing */
  list: securePublicProcedure.query(async () => {
    const [packages, tours] = await Promise.all([
      getPublishedTourPackages(),
      getAllActiveTours(),
    ]);
    const toursMap = new Map(tours.map(t => [t.slug, t]));
    return packages.map(pkg => resolvePackage(pkg, toursMap));
  }),

  /** Public: single package by slug */
  getBySlug: securePublicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const pkg = await getTourPackageBySlug(input.slug);
      if (!pkg) return undefined;

      const tours = await getAllActiveTours();
      const toursMap = new Map(tours.map(t => [t.slug, t]));
      return resolvePackage(pkg, toursMap);
    }),

  /** Admin: list all packages including unpublished */
  listAll: secureProtectedProcedure.query(async () => {
    const [packages, tours] = await Promise.all([
      getAllTourPackages(),
      getAllActiveTours(),
    ]);
    const toursMap = new Map(tours.map(t => [t.slug, t]));
    return packages.map(pkg => resolvePackage(pkg, toursMap));
  }),

  /** Admin: create a package */
  create: secureProtectedProcedure
    .input(tourPackageInputSchema)
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      const slug = input.slug || generateSlug(input.name);
      await createTourPackage({
        name: input.name,
        nameHe: input.nameHe,
        slug,
        description: input.description ?? null,
        descriptionHe: input.descriptionHe ?? null,
        tourSlugs: JSON.stringify(input.tourSlugs),
        discountPercent: input.discountPercent ?? null,
        coverImage: input.coverImage ?? null,
        isPublished: input.isPublished ? 1 : 0,
      });
      await logAdminAction({
        userId: ctx.user?.id,
        action: "create",
        resourceType: "tourPackage",
        newValue: JSON.stringify({ name: input.name }),
      });
      return { success: true, message: "Package created successfully" };
    }),

  /** Admin: update a package */
  update: secureProtectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: tourPackageInputSchema.partial(),
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
        "coverImage",
      ] as const;
      for (const field of fields) {
        if (input.data[field] !== undefined)
          updateData[field] = input.data[field];
      }
      if (input.data.tourSlugs !== undefined)
        updateData.tourSlugs = JSON.stringify(input.data.tourSlugs);
      if (input.data.discountPercent !== undefined)
        updateData.discountPercent = input.data.discountPercent;
      if (input.data.isPublished !== undefined)
        updateData.isPublished = input.data.isPublished ? 1 : 0;

      await updateTourPackage(input.id, updateData as any);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "update",
        resourceType: "tourPackage",
        resourceId: input.id,
        newValue: JSON.stringify(input.data),
      });
      return { success: true };
    }),

  /** Admin: delete a package */
  delete: secureProtectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      checkAdminRateLimit(ctx);
      await deleteTourPackage(input.id);
      await logAdminAction({
        userId: ctx.user?.id,
        action: "delete",
        resourceType: "tourPackage",
        resourceId: input.id,
      });
      return { success: true };
    }),
});
