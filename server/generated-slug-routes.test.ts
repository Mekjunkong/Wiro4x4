import { beforeEach, describe, expect, it, vi } from "vitest";

import { appRouter } from "./routers";
import { createTour, createTourPackage, logAdminAction } from "./db";
import { checkRateLimit } from "./rateLimit";
import { resolvePackageCreateSlug } from "./routes/package";
import { resolveTourCreateSlug } from "./routes/tour";
import { createAuthContext } from "./test-helpers";

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    createTour: vi.fn(),
    createTourPackage: vi.fn(),
    logAdminAction: vi.fn(),
  };
});

vi.mock("./rateLimit", async importOriginal => {
  const actual = await importOriginal<typeof import("./rateLimit")>();
  return {
    ...actual,
    checkRateLimit: vi.fn(),
  };
});

const tourInput = {
  name: "Family Adventure Tour",
  nameHe: "טיול הרפתקה משפחתי",
  description: "A private family adventure in northern Thailand.",
  descriptionHe: "הרפתקה משפחתית פרטית בצפון תאילנד.",
  duration: "Full day",
  price: 12_000,
  imageUrl: "/images/family-adventure.webp",
};

const packageInput = {
  name: "Family Adventure Package",
  nameHe: "חבילת הרפתקה משפחתית",
  tourSlugs: ["doi-inthanon", "mae-kampong"],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(checkRateLimit).mockReturnValue({
    allowed: true,
    remaining: 99,
    resetAt: Date.now() + 300_000,
  });
  vi.mocked(createTour).mockResolvedValue({} as never);
  vi.mocked(createTourPackage).mockResolvedValue({} as never);
  vi.mocked(logAdminAction).mockResolvedValue(undefined);
});

describe.each([
  ["tour", resolveTourCreateSlug],
  ["package", resolvePackageCreateSlug],
] as const)("%s generated create slug", (_resource, resolveCreateSlug) => {
  it("rejects a name that generates an empty slug", () => {
    expect(() => resolveCreateSlug("טיול משפחתי")).toThrowError(
      expect.objectContaining({ code: "BAD_REQUEST" })
    );
  });

  it("rejects a generated slug over the database column length", () => {
    expect(() => resolveCreateSlug("a".repeat(256))).toThrowError(
      expect.objectContaining({ code: "BAD_REQUEST" })
    );
  });

  it("returns a valid generated slug and preserves a supplied slug", () => {
    expect(resolveCreateSlug("Family Adventure Tour")).toBe(
      "family-adventure-tour"
    );
    expect(resolveCreateSlug("Ignored Name", "custom-family-tour")).toBe(
      "custom-family-tour"
    );
  });
});

describe("tour.create generated slug validation", () => {
  it("rejects empty and overlength generated slugs before writing", async () => {
    const caller = appRouter.createCaller(createAuthContext().ctx);

    await expect(
      caller.tour.create({ ...tourInput, name: "טיול משפחתי" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(
      caller.tour.create({ ...tourInput, name: "a".repeat(256) })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(createTour).not.toHaveBeenCalled();
  });

  it("writes a valid generated slug", async () => {
    const caller = appRouter.createCaller(createAuthContext().ctx);

    await expect(caller.tour.create(tourInput)).resolves.toMatchObject({
      success: true,
    });
    expect(createTour).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "family-adventure-tour" })
    );
  });
});

describe("package.create generated slug validation", () => {
  it("rejects empty and overlength generated slugs before writing", async () => {
    const caller = appRouter.createCaller(createAuthContext().ctx);

    await expect(
      caller.package.create({ ...packageInput, name: "חבילה משפחתית" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(
      caller.package.create({ ...packageInput, name: "a".repeat(256) })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(createTourPackage).not.toHaveBeenCalled();
  });

  it("writes a valid generated slug", async () => {
    const caller = appRouter.createCaller(createAuthContext().ctx);

    await expect(caller.package.create(packageInput)).resolves.toMatchObject({
      success: true,
    });
    expect(createTourPackage).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "family-adventure-package" })
    );
  });
});
