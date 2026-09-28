import type { TourOption } from "@shared/motorcycleTours";

/**
 * A point on a motorcycle loop. Stops with a `name` get a pin and a label;
 * unnamed ones are road waypoints that only bend the line along the real
 * highway instead of cutting straight over the mountains.
 */
export interface RouteStop {
  lat: number;
  lon: number;
  name?: readonly [en: string, he: string];
}

const CHIANG_MAI: RouteStop = {
  lat: 18.788,
  lon: 98.985,
  name: ["Chiang Mai", "צ׳יאנג מאי"],
};
const INTHANON: RouteStop = {
  lat: 18.588,
  lon: 98.487,
  name: ["Doi Inthanon", "דוי אינתנון"],
};
const MAE_CHAEM: RouteStop = { lat: 18.5, lon: 98.36 };
const KHUN_YUAM: RouteStop = { lat: 18.826, lon: 97.93 };
const MAE_HONG_SON: RouteStop = {
  lat: 19.301,
  lon: 97.969,
  name: ["Mae Hong Son", "מאה הונג סון"],
};
const THAM_LOD: RouteStop = {
  lat: 19.568,
  lon: 98.278,
  name: ["Tham Lod Cave", "מערת תאם לוד"],
};
const PAI: RouteStop = { lat: 19.358, lon: 98.441, name: ["Pai", "פאי"] };
const MOK_FA: RouteStop = { lat: 19.11, lon: 98.77 };
const MAE_TAENG: RouteStop = { lat: 19.12, lon: 98.94 };
const CHIANG_DAO: RouteStop = { lat: 19.36, lon: 98.96 };
const FANG: RouteStop = { lat: 19.92, lon: 99.21 };
const THATON: RouteStop = {
  lat: 20.061,
  lon: 99.356,
  name: ["Thaton", "תאטן"],
};
const MAE_SALONG: RouteStop = {
  lat: 20.165,
  lon: 99.623,
  name: ["Doi Mae Salong", "דוי מאה סאלונג"],
};
const GOLDEN_TRIANGLE: RouteStop = {
  lat: 20.354,
  lon: 100.083,
  name: ["Golden Triangle", "משולש הזהב"],
};
const CHIANG_SAEN: RouteStop = { lat: 20.27, lon: 100.08 };
const CHIANG_RAI: RouteStop = {
  lat: 19.91,
  lon: 99.84,
  name: ["Chiang Rai", "צ׳יאנג ראי"],
};
const WHITE_TEMPLE: RouteStop = { lat: 19.824, lon: 99.763 };
const WIANG_PA_PAO: RouteStop = { lat: 19.35, lon: 99.51 };

/** Ordered loops; each starts and ends in Chiang Mai. */
export const MOTORCYCLE_ROUTES: Record<
  Exclude<TourOption["id"], "custom">,
  readonly RouteStop[]
> = {
  three: [
    CHIANG_MAI,
    MOK_FA,
    PAI,
    THAM_LOD,
    MAE_HONG_SON,
    KHUN_YUAM,
    MAE_CHAEM,
    INTHANON,
    CHIANG_MAI,
  ],
  five: [
    CHIANG_MAI,
    INTHANON,
    MAE_CHAEM,
    KHUN_YUAM,
    MAE_HONG_SON,
    THAM_LOD,
    PAI,
    MAE_TAENG,
    CHIANG_DAO,
    FANG,
    THATON,
    MAE_SALONG,
    GOLDEN_TRIANGLE,
    CHIANG_SAEN,
    CHIANG_RAI,
    WHITE_TEMPLE,
    WIANG_PA_PAO,
    CHIANG_MAI,
  ],
};

/** Every named place, for the "build your own" option (pins, no line). */
export const MOTORCYCLE_PLACES: readonly RouteStop[] = Array.from(
  new Set(Object.values(MOTORCYCLE_ROUTES).flat())
).filter(stop => stop.name);

/** A loop with named stages: each stage is a range of stop indices. */
export interface StagedRoute {
  stops: readonly RouteStop[];
  stages: Record<string, readonly [from: number, to: number]>;
}

/**
 * Mae Hong Son Loop (counter-clockwise, as the guide runs it). Stage ids
 * match `MAE_HONG_SON_STAGES` in shared/maeHongSonLoop.ts.
 */
export const MAE_HONG_SON_LOOP_ROUTE: StagedRoute = {
  stops: [
    CHIANG_MAI, // 0
    { lat: 18.63, lon: 98.9 }, // San Pa Tong
    { lat: 18.42, lon: 98.68 }, // Chom Thong
    { lat: 18.19, lon: 98.61 }, // Hot
    { lat: 18.158, lon: 97.934, name: ["Mae Sariang", "מאה סאריאנג"] }, // 4
    { lat: 18.39, lon: 97.94 }, // Mae La Noi
    { ...KHUN_YUAM, name: ["Khun Yuam", "קון יואם"] }, // 6
    MAE_HONG_SON, // 7
    { lat: 19.535, lon: 97.92, name: ["Ban Rak Thai", "באן רק תאי"] }, // 8
    MAE_HONG_SON, // 9
    { ...THAM_LOD, name: ["Pang Mapha", "פאנג מאפה"] }, // 10
    PAI, // 11
    MOK_FA,
    MAE_TAENG,
    CHIANG_MAI, // 14
  ],
  stages: {
    "mae-sariang": [0, 4],
    "khun-yuam": [4, 6],
    "mae-hong-son-town": [6, 7],
    "northern-detours": [7, 9],
    "pang-mapha-pai": [9, 11],
    "return-chiang-mai": [11, 14],
  },
};

/** Samoeng Loop: Route 1096 out through Mae Rim, Route 1269 back. */
export const SAMOENG_LOOP_ROUTE: StagedRoute = {
  stops: [
    CHIANG_MAI, // 0
    { lat: 18.915, lon: 98.945, name: ["Mae Rim", "מאה רים"] }, // 1
    { lat: 18.906, lon: 98.897 }, // Mae Sa Waterfall
    { lat: 18.878, lon: 98.822, name: ["Pong Yaeng", "פונג יאנג"] }, // 3
    { lat: 18.88, lon: 98.76 },
    { lat: 18.85, lon: 98.73, name: ["Samoeng", "סמואנג"] }, // 5
    { lat: 18.79, lon: 98.8 },
    { lat: 18.72, lon: 98.87 },
    { lat: 18.759, lon: 98.919, name: ["Doi Kham", "דוי קאם"] }, // 8
    CHIANG_MAI, // 9
  ],
  // Same order as SAMOENG_ROUTE_STAGES (the guide's four chapters).
  stages: {
    "0": [0, 1],
    "1": [1, 3],
    "2": [3, 8],
    "3": [8, 9],
  },
};
