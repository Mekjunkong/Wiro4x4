import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createAuthContext, createPublicContext, itWithDb } from "./test-helpers";

describe("gallery.create", () => {
  itWithDb("creates a gallery photo entry", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.gallery.create({
      title: "Doi Inthanon Summit",
      imageUrl: "https://example.com/gallery/doi-inthanon.webp",
      description: "View from the highest peak in Thailand",
      category: "destinations",
      sortOrder: 1,
      isPublished: true,
    });

    expect(result).toEqual({ success: true });
  });
});

describe("gallery.list (public)", () => {
  it("returns published photos", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.gallery.list();

    expect(Array.isArray(result)).toBe(true);
    for (const photo of result) {
      expect(photo).toHaveProperty("imageUrl");
    }
  });
});

describe("gallery.listAll (admin)", () => {
  it("returns all photos including unpublished", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.gallery.listAll();

    expect(Array.isArray(result)).toBe(true);
  });
});
