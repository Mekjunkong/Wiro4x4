import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import {
  createAuthContext,
  createPublicContext,
  itWithDb,
} from "./test-helpers";

describe("blog.list (public)", () => {
  it("returns published blog posts", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.blog.list();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("blog.getBySlug (public)", () => {
  it("returns undefined for non-existent slug", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.blog.getBySlug({ slug: "non-existent-slug" });

    expect(result).toBeUndefined();
  });
});

describe("blog.create", () => {
  itWithDb("creates a blog post", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.blog.create({
      title: "Test Blog Post",
      slug: `test-blog-${Date.now()}`,
      content: "This is test content for the blog post.",
      category: "Travel Tips",
      isPublished: true,
    });

    expect(result).toEqual({
      success: true,
      message: "Blog post created successfully",
    });
  });
});

describe("blog.uploadImage", () => {
  it("rejects non-admin users", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.blog.uploadImage({
        fileName: "test.jpg",
        fileData: "base64data",
        contentType: "image/jpeg",
      })
    ).rejects.toThrow();
  });
});

describe("blog.listAll (admin)", () => {
  it("returns all blog posts including drafts", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.blog.listAll();

    expect(Array.isArray(result)).toBe(true);
  });
});
