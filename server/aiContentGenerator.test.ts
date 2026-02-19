import { describe, expect, it, vi } from "vitest";

// Set env var before module import so getClient() doesn't throw
vi.stubEnv("ANTHROPIC_API_KEY", "test-key-for-mocking");

import { generateBlogDraft } from "./aiContentGenerator";

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = {
      create: vi.fn().mockResolvedValue({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              title: "Best Time to Visit Chiang Mai",
              titleHe:
                "\u05d4\u05d6\u05de\u05df \u05d4\u05d8\u05d5\u05d1 \u05d1\u05d9\u05d5\u05ea\u05e8 \u05dc\u05d1\u05e7\u05e8 \u05d1\u05e6'\u05d9\u05d0\u05e0\u05d2 \u05de\u05d0\u05d9",
              slug: "best-time-visit-chiang-mai",
              excerpt: "A guide to seasons and weather.",
              excerptHe:
                "\u05de\u05d3\u05e8\u05d9\u05da \u05dc\u05e2\u05d5\u05e0\u05d5\u05ea \u05d5\u05de\u05d6\u05d2 \u05d4\u05d0\u05d5\u05d5\u05d9\u05e8.",
              content: "# Best Time to Visit\n\nNovember to February is ideal.",
              contentHe:
                "# \u05d4\u05d6\u05de\u05df \u05d4\u05d8\u05d5\u05d1 \u05d1\u05d9\u05d5\u05ea\u05e8\n\n\u05e0\u05d5\u05d1\u05de\u05d1\u05e8 \u05e2\u05d3 \u05e4\u05d1\u05e8\u05d5\u05d0\u05e8 \u05d4\u05d5\u05d0 \u05d0\u05d9\u05d3\u05d9\u05d0\u05dc\u05d9.",
              category: "Travel Tips",
              tags: "weather,seasons,chiang-mai",
            }),
          },
        ],
      }),
    };
  },
}));

describe("generateBlogDraft", () => {
  it("returns bilingual draft with all required fields", async () => {
    const result = await generateBlogDraft({
      topic: "Best Time to Visit Chiang Mai",
      tone: "informative",
      length: 1000,
      tourData: [],
    });

    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("titleHe");
    expect(result).toHaveProperty("slug");
    expect(result).toHaveProperty("content");
    expect(result).toHaveProperty("contentHe");
    expect(result).toHaveProperty("excerpt");
    expect(result).toHaveProperty("excerptHe");
    expect(result).toHaveProperty("category");
    expect(result).toHaveProperty("tags");
  });

  it("handles missing fields gracefully with defaults", async () => {
    const result = await generateBlogDraft({
      topic: "Test Topic",
      tone: "adventurous",
      length: 500,
      tourData: [],
    });

    expect(typeof result.title).toBe("string");
    expect(result.title.length).toBeGreaterThan(0);
  });
});
