import { createElement, type ImgHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CinematicHeroBackground } from "./CinematicHeroBackground";

vi.mock("@/components/OptimizedImage", async () => {
  const { createElement: createMockElement } = await import("react");

  return {
    OptimizedImage: ({
      priority: _priority,
      ...imgProps
    }: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) =>
      createMockElement("img", imgProps),
  };
});

describe("CinematicHeroBackground", () => {
  it("renders one semantic base image and two decorative scene overlays", () => {
    const markup = renderToStaticMarkup(
      createElement(CinematicHeroBackground, {
        alt: "WIRO 4x4 vehicle on a jungle road in Chiang Mai",
      })
    );

    expect(markup).toContain('data-testid="cinematic-hero-background"');
    expect(markup).toContain('data-cinematic-hero-layer="base"');
    expect(markup).toContain('src="banner"');
    expect(markup).toContain(
      'alt="WIRO 4x4 vehicle on a jungle road in Chiang Mai"'
    );
    expect(markup).not.toContain("tourists_with_4x4");
    expect(markup).not.toContain("offroad_vehicle_forest_trail");

    expect(markup).toContain('data-cinematic-hero-layer="landscape"');
    expect(markup).toContain('src="mountain_sunset_golden"');
    expect(markup).toContain('data-cinematic-hero-layer="action"');
    expect(markup).toContain('src="4x4_water_splash"');

    expect(markup.match(/data-cinematic-hero-overlay="true"/g)).toHaveLength(2);
    expect(markup.match(/aria-hidden="true"/g)).toHaveLength(2);
    expect(markup.match(/alt=""/g)).toHaveLength(2);
  });
});
