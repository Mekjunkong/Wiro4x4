import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import {
  createAuthContext,
  createPublicContext,
  itWithDb,
} from "./test-helpers";

describe("package.list (public)", () => {
  it("returns published packages", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.package.list();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("package.getBySlug (public)", () => {
  it("returns undefined for non-existent slug", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.package.getBySlug({
      slug: "non-existent-package",
    });

    expect(result).toBeUndefined();
  });
});

describe("package.create", () => {
  itWithDb("creates a tour package", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.package.create({
      name: "Weekend Adventure",
      nameHe: "הרפתקת סוף שבוע",
      tourSlugs: [
        "doi-inthanon-roof-of-thailand",
        "mae-kampong-hidden-village",
      ],
      isPublished: true,
    });

    expect(result).toEqual({
      success: true,
      message: "Package created successfully",
    });
  });
});

describe("package.listAll (admin)", () => {
  it("returns all packages including unpublished", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.package.listAll();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("package.update", () => {
  itWithDb("updates a tour package", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create first
    await caller.package.create({
      name: "Temp Package",
      nameHe: "חבילה זמנית",
      tourSlugs: [
        "doi-inthanon-roof-of-thailand",
        "mae-kampong-hidden-village",
      ],
    });

    // Get the list to find our package
    const packages = await caller.package.listAll();
    const pkg = packages.find(p => p.name === "Temp Package");
    if (!pkg) throw new Error("Package not found");

    const result = await caller.package.update({
      id: pkg.id,
      data: { name: "Updated Package" },
    });

    expect(result).toEqual({ success: true });
  });
});

describe("package.delete", () => {
  itWithDb("deletes a tour package", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create first
    await caller.package.create({
      name: "To Delete",
      nameHe: "למחיקה",
      slug: `to-delete-${Date.now()}`,
      tourSlugs: ["doi-inthanon-roof-of-thailand", "maerim-sticky-waterfalls"],
    });

    const packages = await caller.package.listAll();
    const pkg = packages.find(p => p.name === "To Delete");
    if (!pkg) throw new Error("Package not found");

    const result = await caller.package.delete({ id: pkg.id });

    expect(result).toEqual({ success: true });
  });
});
