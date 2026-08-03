export type ScrollDepth = 25 | 50 | 90;

export interface BehaviorTrackingState {
  page: string;
  emittedDepths: ScrollDepth[];
  claimedKeys: string[];
}

export interface CommercialRoute {
  id: string;
  matches: (page: string) => boolean;
}

const SCROLL_DEPTHS = [25, 50, 90] as const;

function exact(path: string): (page: string) => boolean {
  return page => page === path;
}

export const COMMERCIAL_ROUTES: readonly CommercialRoute[] = [
  { id: "home", matches: exact("/") },
  { id: "pricing", matches: exact("/pricing") },
  { id: "tours", matches: exact("/tours") },
  { id: "tour-detail", matches: page => /^\/tours\/[^/]+$/.test(page) },
  { id: "packages", matches: exact("/packages") },
  {
    id: "package-detail",
    matches: page => /^\/packages\/[^/]+$/.test(page),
  },
  { id: "booking", matches: exact("/book") },
  { id: "kosher-tours", matches: exact("/kosher-tours") },
  {
    id: "kosher-tours",
    matches: exact("/he/kosher-tours-chiang-mai"),
  },
  { id: "hebrew-guide", matches: exact("/hebrew-guide") },
  {
    id: "hebrew-guide",
    matches: exact("/he/hebrew-guide-chiang-mai"),
  },
  {
    id: "private-family-tours",
    matches: exact("/private-family-tours"),
  },
  {
    id: "private-family-tours",
    matches: exact("/he/private-family-tours-chiang-mai"),
  },
  { id: "accessible-tours", matches: exact("/accessible-tours") },
  { id: "car-rental", matches: exact("/car-rental") },
  { id: "contact", matches: exact("/contact") },
] as const;

export function createBehaviorTrackingState(
  page: string
): BehaviorTrackingState {
  return { page, emittedDepths: [], claimedKeys: [] };
}

export function recordScrollDepth(
  state: BehaviorTrackingState,
  page: string,
  percentage: number
): { state: BehaviorTrackingState; depths: ScrollDepth[] } {
  const current =
    state.page === page ? state : createBehaviorTrackingState(page);
  const depths = SCROLL_DEPTHS.filter(
    depth => percentage >= depth && !current.emittedDepths.includes(depth)
  );

  return {
    state: {
      ...current,
      emittedDepths: [...current.emittedDepths, ...depths],
    },
    depths,
  };
}

export function claimOnce(
  state: BehaviorTrackingState,
  page: string,
  key: string
): { state: BehaviorTrackingState; claimed: boolean } {
  const current =
    state.page === page ? state : createBehaviorTrackingState(page);
  if (current.claimedKeys.includes(key))
    return { state: current, claimed: false };

  return {
    state: { ...current, claimedKeys: [...current.claimedKeys, key] },
    claimed: true,
  };
}

export function getCommercialRoute(page: string): CommercialRoute | undefined {
  return COMMERCIAL_ROUTES.find(route => route.matches(page));
}
