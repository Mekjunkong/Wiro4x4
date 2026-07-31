import { describe, expect, it } from "vitest";
import { getHardcodedPosts } from "./hardcodedPosts";

describe("fallback blog posts", () => {
  it("provides complete English content for every fallback blog card", () => {
    const posts = getHardcodedPosts(english => english);
    const expectedSlugs = [
      "kosher-dining-guide",
      "israeli-traveler-tips",
      "cultural-etiquette",
      "off-road-adventure-guide",
      "doi-inthanon-experience",
      "elephant-sanctuary-guide",
    ];

    expect(Object.keys(posts)).toEqual(expectedSlugs);
    for (const slug of expectedSlugs) {
      expect(posts[slug].title.length, slug).toBeGreaterThan(10);
      expect(posts[slug].content, slug).toMatch(/^# /);
      expect(posts[slug].content.length, slug).toBeGreaterThan(1_000);
    }
  });

  it("provides complete Hebrew content for every fallback blog card", () => {
    const posts = getHardcodedPosts((_english, hebrew) => hebrew);

    for (const [slug, post] of Object.entries(posts)) {
      expect(post.title, slug).toMatch(/[\u0590-\u05ff]/);
      expect(post.content, slug).toMatch(/^# /);
      expect(post.content.length, slug).toBeGreaterThan(1_000);
    }
  });
});
