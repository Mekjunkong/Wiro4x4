export const SERVICE_CAROUSEL_AUTOPLAY_DELAY_MS = 6_500;

export type ServiceCarouselAutoplayState = {
  hasMultipleSlides: boolean;
  userPaused: boolean;
  reducedMotion: boolean;
  documentHidden: boolean;
  inViewport: boolean;
  hovered: boolean;
  focusWithin: boolean;
  dragging: boolean;
  dialogOpen: boolean;
};

export function canServiceCarouselAutoplay({
  hasMultipleSlides,
  userPaused,
  reducedMotion,
  documentHidden,
  inViewport,
  hovered,
  focusWithin,
  dragging,
  dialogOpen,
}: ServiceCarouselAutoplayState): boolean {
  return (
    hasMultipleSlides &&
    !userPaused &&
    !reducedMotion &&
    !documentHidden &&
    inViewport &&
    !hovered &&
    !focusWithin &&
    !dragging &&
    !dialogOpen
  );
}
