import { describe, expect, it } from "vitest";
import { markdownToHtml } from "./seoPageBody";

describe("markdownToHtml", () => {
  it("renders headings, lists and paragraphs, dropping a repeated title", () => {
    const html = markdownToHtml(
      "# My Post\n\nIntro line\ncontinues.\n\n## Part\n- one\n- two\n\n1. first\n2. second",
      "My Post"
    );
    expect(html).toBe(
      "<p>Intro line continues.</p><h2>Part</h2><ul><li>one</li><li>two</li></ul><ol><li>first</li><li>second</li></ol>"
    );
  });

  it("keeps a first Hebrew heading that differs from the title", () => {
    expect(markdownToHtml("# כותרת אחרת\n\nטקסט", "כותרת")).toContain(
      "<h2>כותרת אחרת</h2>"
    );
  });

  it("escapes HTML and only links http(s) or root-relative URLs", () => {
    const html = markdownToHtml(
      '<script>alert(1)</script> [bad](javascript:alert(1)) [ok](/tours) [x](https://a.b/?q="><img)'
    );
    expect(html).not.toContain("<script>");
    expect(html).not.toContain('href="javascript');
    expect(html).toContain('<a href="/tours">ok</a>');
    expect(html).not.toMatch(/href="[^"]*"[^>]*><img/);
    expect(html).not.toContain("<img");
  });
});
