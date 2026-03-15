import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @aws-sdk/client-s3 before importing storage
vi.mock("@aws-sdk/client-s3", () => {
  const mockSend = vi.fn().mockResolvedValue({});
  return {
    S3Client: vi.fn().mockImplementation(() => ({ send: mockSend })),
    PutObjectCommand: vi.fn().mockImplementation(params => params),
  };
});

// Set env vars before import
process.env.R2_ACCOUNT_ID = "test-account";
process.env.R2_ACCESS_KEY_ID = "test-key";
process.env.R2_SECRET_ACCESS_KEY = "test-secret";
process.env.R2_BUCKET_NAME = "test-bucket";
process.env.R2_PUBLIC_URL = "https://pub-test.r2.dev";
process.env.JWT_SECRET = "test-secret-32-chars-minimum-length";
process.env.DATABASE_URL = "mysql://test";
process.env.OWNER_EMAIL = "test@test.com";

describe("storage module", () => {
  let storagePut: typeof import("./storage").storagePut;
  let storageGet: typeof import("./storage").storageGet;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("./storage");
    storagePut = mod.storagePut;
    storageGet = mod.storageGet;
  });

  describe("storagePut", () => {
    it("returns correct public URL format", async () => {
      const result = await storagePut(
        "photos/test.jpg",
        Buffer.from("data"),
        "image/jpeg"
      );
      expect(result.url).toBe("https://pub-test.r2.dev/photos/test.jpg");
      expect(result.key).toBe("photos/test.jpg");
    });

    it("strips leading slashes from keys", async () => {
      const result = await storagePut(
        "/leading/slash.jpg",
        Buffer.from("data")
      );
      expect(result.key).toBe("leading/slash.jpg");
      expect(result.url).toBe("https://pub-test.r2.dev/leading/slash.jpg");
    });

    it("handles string data by converting to Buffer", async () => {
      const { PutObjectCommand } = await import("@aws-sdk/client-s3");
      await storagePut("test.txt", "hello world", "text/plain");
      expect(PutObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          ContentType: "text/plain",
          Key: "test.txt",
        })
      );
    });

    it("sets correct ContentType header", async () => {
      const { PutObjectCommand } = await import("@aws-sdk/client-s3");
      await storagePut("img.webp", Buffer.from("data"), "image/webp");
      expect(PutObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({ ContentType: "image/webp" })
      );
    });

    it("uses default content type when not specified", async () => {
      const { PutObjectCommand } = await import("@aws-sdk/client-s3");
      await storagePut("file.bin", Buffer.from("data"));
      expect(PutObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({ ContentType: "application/octet-stream" })
      );
    });
  });

  describe("storageGet", () => {
    it("returns public URL for existing key", async () => {
      const result = await storageGet("photos/beach.jpg");
      expect(result.url).toBe("https://pub-test.r2.dev/photos/beach.jpg");
      expect(result.key).toBe("photos/beach.jpg");
    });

    it("strips leading slashes", async () => {
      const result = await storageGet("///multiple/slashes.jpg");
      expect(result.key).toBe("multiple/slashes.jpg");
    });
  });

  describe("error handling", () => {
    it("propagates S3 upload errors", async () => {
      const { S3Client: MockS3 } = await import("@aws-sdk/client-s3");
      const mockInstance = new MockS3({});
      (mockInstance.send as any).mockRejectedValueOnce(
        new Error("Network timeout")
      );

      // Re-import to get fresh module with mocked client
      vi.resetModules();
      const freshMod = await import("./storage");
      // The error will propagate from send()
      await expect(
        freshMod.storagePut("fail.jpg", Buffer.from("data"))
      ).rejects.toThrow();
    });
  });
});
