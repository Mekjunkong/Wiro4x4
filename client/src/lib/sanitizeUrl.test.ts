import { describe, it, expect } from "vitest";
import { sanitizeUrl } from "./sanitizeUrl";

describe("sanitizeUrl", () => {
  it("allows https URLs", () => {
    expect(sanitizeUrl("https://example.com")).toBe("https://example.com");
  });

  it("allows http URLs", () => {
    expect(sanitizeUrl("http://example.com")).toBe("http://example.com");
  });

  it("allows relative paths", () => {
    expect(sanitizeUrl("/images/photo.jpg")).toBe("/images/photo.jpg");
  });

  it("allows anchor links", () => {
    expect(sanitizeUrl("#section")).toBe("#section");
  });

  it("allows mailto links", () => {
    expect(sanitizeUrl("mailto:test@example.com")).toBe(
      "mailto:test@example.com"
    );
  });

  it("allows tel links", () => {
    expect(sanitizeUrl("tel:+1234567890")).toBe("tel:+1234567890");
  });

  it("blocks javascript: protocol", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("#");
  });

  it("blocks JAVASCRIPT: (case insensitive)", () => {
    expect(sanitizeUrl("JAVASCRIPT:alert(1)")).toBe("#");
  });

  it("blocks javascript: with control characters", () => {
    expect(sanitizeUrl("java\tscript:alert(1)")).toBe("#");
  });

  it("blocks data: protocol", () => {
    expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe("#");
  });

  it("blocks vbscript: protocol", () => {
    expect(sanitizeUrl("vbscript:alert(1)")).toBe("#");
  });

  it("blocks javascript: with leading whitespace", () => {
    expect(sanitizeUrl("  javascript:alert(1)  ")).toBe("#");
  });

  it("strips control characters from safe URLs", () => {
    expect(sanitizeUrl("https://example.com\x00")).toBe("https://example.com");
  });

  it("handles empty string", () => {
    expect(sanitizeUrl("")).toBe("");
  });
});
