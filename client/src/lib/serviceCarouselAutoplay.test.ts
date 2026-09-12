import { describe, expect, it } from "vitest";

import {
  canServiceCarouselAutoplay,
  SERVICE_CAROUSEL_AUTOPLAY_DELAY_MS,
  type ServiceCarouselAutoplayState,
} from "./serviceCarouselAutoplay";

const readyState: ServiceCarouselAutoplayState = {
  hasMultipleSlides: true,
  userPaused: false,
  reducedMotion: false,
  documentHidden: false,
  inViewport: true,
  hovered: false,
  focusWithin: false,
  dragging: false,
  dialogOpen: false,
};

describe("service carousel autoplay", () => {
  it("uses the approved cinematic dwell time", () => {
    expect(SERVICE_CAROUSEL_AUTOPLAY_DELAY_MS).toBe(6_500);
  });

  it("runs only when the carousel is ready and visible", () => {
    expect(canServiceCarouselAutoplay(readyState)).toBe(true);
  });

  it.each([
    ["user paused", { userPaused: true }],
    ["reduced motion", { reducedMotion: true }],
    ["the document is hidden", { documentHidden: true }],
    ["outside the viewport", { inViewport: false }],
    ["hovered", { hovered: true }],
    ["focus is within the carousel", { focusWithin: true }],
    ["dragging", { dragging: true }],
    ["a dialog is open", { dialogOpen: true }],
    ["there is only one slide", { hasMultipleSlides: false }],
  ])("pauses when %s", (_reason, override) => {
    expect(canServiceCarouselAutoplay({ ...readyState, ...override })).toBe(
      false
    );
  });
});
