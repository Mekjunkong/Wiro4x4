import { describe, expect, it } from "vitest";
import { withCurrentWhatsApp } from "./blog";

describe("withCurrentWhatsApp", () => {
  it("rewrites the retired number in links and display text", () => {
    const post = withCurrentWhatsApp({
      content:
        '<a href="https://wa.me/66929894495?text=Hi">Call +66 92-989-4495</a> or 092 989 4495',
    });
    expect(post.content).toBe(
      '<a href="https://wa.me/66816401397?text=Hi">Call +66 81 640 1397</a> or +66 81 640 1397'
    );
  });

  it("leaves posts without the old number untouched", () => {
    const post = { content: "Message us on wa.me/66816401397" };
    expect(withCurrentWhatsApp(post)).toBe(post);
  });
});
