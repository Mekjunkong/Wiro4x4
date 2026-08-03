import React, { useEffect, useState } from "react";
import { OptimizedImage } from "@/components/OptimizedImage";

type CinematicHeroBackgroundProps = {
  alt: string;
};

const HERO_SCENES = {
  base: {
    src: "banner",
    width: 1537,
    height: 1023,
  },
  landscape: {
    src: "mountain_sunset_golden",
    width: 1200,
    height: 800,
  },
  action: {
    src: "4x4_water_splash",
    width: 1200,
    height: 991,
  },
} as const;

export function CinematicHeroBackground({ alt }: CinematicHeroBackgroundProps) {
  const [showOverlays, setShowOverlays] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    // Let the LCP frame establish itself before fetching decorative scenes.
    const timer = window.setTimeout(() => setShowOverlays(true), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div data-testid="cinematic-hero-background" className="cinematic-hero">
      <div
        data-cinematic-hero-layer="base"
        className="cinematic-hero__layer cinematic-hero__base"
      >
        <OptimizedImage
          src={HERO_SCENES.base.src}
          alt={alt}
          width={HERO_SCENES.base.width}
          height={HERO_SCENES.base.height}
          className="cinematic-hero__image cinematic-hero__image--base"
          sizes="100vw"
          priority
        />
      </div>

      {showOverlays && (
        <>
          <div
            data-cinematic-hero-layer="landscape"
            data-cinematic-hero-overlay="true"
            className="cinematic-hero__layer cinematic-hero__overlay cinematic-hero__overlay--landscape"
          >
            <OptimizedImage
              src={HERO_SCENES.landscape.src}
              alt=""
              aria-hidden="true"
              width={HERO_SCENES.landscape.width}
              height={HERO_SCENES.landscape.height}
              className="cinematic-hero__image cinematic-hero__image--landscape"
              sizes="100vw"
            />
          </div>

          <div
            data-cinematic-hero-layer="action"
            data-cinematic-hero-overlay="true"
            className="cinematic-hero__layer cinematic-hero__overlay cinematic-hero__overlay--action"
          >
            <OptimizedImage
              src={HERO_SCENES.action.src}
              alt=""
              aria-hidden="true"
              width={HERO_SCENES.action.width}
              height={HERO_SCENES.action.height}
              className="cinematic-hero__image cinematic-hero__image--action"
              sizes="100vw"
            />
          </div>
        </>
      )}

      <div className="cinematic-hero__grain" />
    </div>
  );
}
