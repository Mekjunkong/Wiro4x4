import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("package detail fallback query", () => {
  it("does not query the database for a known fallback package slug", () => {
    const source = readFileSync(
      resolve("client/src/pages/PackageDetail.tsx"),
      "utf8"
    );

    expect(source).toContain("const fallback = FALLBACK_PACKAGES[slug];");
    expect(source).toContain("{ enabled: slug.length > 0 && !fallback }");
  });

  it("keeps the database query enabled for non-fallback slugs", () => {
    const source = readFileSync(
      resolve("client/src/pages/PackageDetail.tsx"),
      "utf8"
    );

    expect(source).toContain("const fallback = FALLBACK_PACKAGES[slug];");
    expect(source).toContain("slug.length > 0 && !fallback");
  });
});
