import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

describe("frontend performance assets", () => {
  it("uses local critical fonts and a single HTML preload path", () => {
    const indexHtml = readFileSync(
      path.join(root, "client/index.html"),
      "utf8"
    );
    const css = readFileSync(path.join(root, "client/src/index.css"), "utf8");
    const optimizedImageSource = readFileSync(
      path.join(root, "client/src/components/OptimizedImage.tsx"),
      "utf8"
    );

    expect(indexHtml).not.toContain("fonts.googleapis.com");
    expect(indexHtml).not.toContain("fonts.gstatic.com");
    expect(indexHtml).toContain("/fonts/dm-serif-display-regular.woff2");
    expect(css).toContain('font-family: "DM Serif Display"');
    expect(css).toContain("font-display: swap");
    expect(optimizedImageSource).not.toContain(
      'document.createElement("link")'
    );

    for (const font of [
      "dm-serif-display-regular.woff2",
      "dm-serif-display-italic.woff2",
      "source-sans-3-latin.woff2",
      "source-sans-3-italic-latin.woff2",
    ]) {
      expect(existsSync(path.join(root, "client/public/fonts", font))).toBe(
        true
      );
    }
  });

  it("keeps hero WebP quality at or below the mobile budget", () => {
    const optimizer = readFileSync(
      path.join(root, "scripts/optimize-images.ts"),
      "utf8"
    );
    const quality = optimizer.match(/HERO_WEBP_QUALITY\s*=\s*(\d+)/)?.[1];
    expect(quality).toBeTruthy();
    expect(Number(quality)).toBeLessThanOrEqual(72);
  });
});
