import { beforeEach, describe, expect, it, vi } from "vitest";

import { appRouter } from "./routers";
import { createTripPhoto, getTripPhotoAlbumById } from "./db";
import { storagePut } from "./storage";
import { createAuthContext } from "./test-helpers";

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    createTripPhoto: vi.fn(),
    getTripPhotoAlbumById: vi.fn(),
    logAdminAction: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("./storage", () => ({
  storagePut: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getTripPhotoAlbumById).mockResolvedValue({
    id: 7,
    accessToken: "album-token",
  } as never);
  vi.mocked(storagePut).mockResolvedValue({
    key: "trip-photos/album-token/photo.jpg",
    url: "https://cdn.example.com/photo.jpg",
  });
  vi.mocked(createTripPhoto).mockResolvedValue({} as never);
});

describe("tripPhotos.uploadPhoto", () => {
  it("accepts a 255-character caption and rejects 256 characters", async () => {
    const caller = appRouter.createCaller(createAuthContext().ctx);
    const input = {
      albumId: 7,
      filename: "photo.jpg",
      contentType: "image/jpeg",
      base64Data: Buffer.from("photo").toString("base64"),
    };

    await expect(
      caller.tripPhotos.uploadPhoto({ ...input, caption: "a".repeat(255) })
    ).resolves.toEqual({
      key: "trip-photos/album-token/photo.jpg",
      url: "https://cdn.example.com/photo.jpg",
    });

    await expect(
      caller.tripPhotos.uploadPhoto({ ...input, caption: "a".repeat(256) })
    ).rejects.toThrow();
    expect(createTripPhoto).toHaveBeenCalledTimes(1);
  });
});
