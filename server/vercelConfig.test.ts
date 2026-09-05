import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("Vercel canonical host routing", () => {
  it("redirects the apex domain before the server rewrites", () => {
    const config = JSON.parse(readFileSync("vercel.json", "utf8")) as {
      redirects?: unknown[];
      rewrites?: Array<{ source: string; destination: string }>;
    };

    expect(config.redirects).toContainEqual({
      source: "/:path*",
      has: [{ type: "host", value: "wiro4x4indochina.com" }],
      destination: "https://www.wiro4x4indochina.com/:path*",
      permanent: true,
    });
    expect(config.redirects).toContainEqual({
      source: "/booking",
      destination: "/book",
      permanent: true,
    });
    expect(config.rewrites).toEqual(
      expect.arrayContaining([
        { source: "/api/(.*)", destination: "/api" },
        { source: "/", destination: "/api" },
        { source: "/(.*)", destination: "/api" },
      ])
    );
  });
});
