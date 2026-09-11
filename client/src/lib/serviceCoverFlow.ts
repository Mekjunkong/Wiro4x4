export type ServiceCoverFlowPosition =
  | "active"
  | "previous"
  | "next"
  | "far-previous"
  | "far-next";

export function getServiceCoverFlowPosition(
  index: number,
  selectedIndex: number,
  slideCount: number
): ServiceCoverFlowPosition {
  if (slideCount <= 0) return "active";

  const normalizedDistance =
    (((index - selectedIndex) % slideCount) + slideCount) % slideCount;
  const signedDistance =
    normalizedDistance > slideCount / 2
      ? normalizedDistance - slideCount
      : normalizedDistance;

  if (signedDistance === 0) return "active";
  if (signedDistance === -1) return "previous";
  if (signedDistance === 1) return "next";
  return signedDistance < 0 ? "far-previous" : "far-next";
}
