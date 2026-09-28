import type { StagedRoute } from "@/data/motorcycleRoutes";

/**
 * Routes for the hard-coded multi-day packages in PackageDetail.tsx, keyed by
 * package slug. Each stage is one itinerary day (key = day number). Unnamed
 * stops are road waypoints that keep the line on the real highways.
 */
export const PACKAGE_ROUTES: Record<string, StagedRoute> = {
  "northern-thailand-3d2n": {
    stops: [
      { lat: 18.788, lon: 98.985, name: ["Chiang Mai", "צ׳יאנג מאי"] }, // 0
      { lat: 19.12, lon: 98.94 }, // Mae Taeng
      { lat: 19.4, lon: 98.93, name: ["Chiang Dao", "צ׳יאנג דאו"] }, // 2
      { lat: 19.9, lon: 99.04, name: ["Doi Ang Khang", "דוי אנג חאנג"] }, // 3
      { lat: 19.92, lon: 99.21 }, // Fang
      { lat: 20.061, lon: 99.356 }, // Thaton
      { lat: 20.165, lon: 99.623, name: ["Mae Salong", "מאה סאלונג"] }, // 6
      { lat: 19.91, lon: 99.84, name: ["Chiang Rai", "צ׳יאנג ראי"] }, // 7
      { lat: 19.824, lon: 99.763, name: ["White Temple", "המקדש הלבן"] }, // 8
      { lat: 19.35, lon: 99.51 }, // Wiang Pa Pao
      { lat: 18.788, lon: 98.985, name: ["Chiang Mai", "צ׳יאנג מאי"] }, // 10
    ],
    stages: { "1": [0, 2], "2": [2, 6], "3": [6, 10] },
  },
  "grand-tour-laos-14d": {
    stops: [
      { lat: 18.788, lon: 98.985, name: ["Chiang Mai", "צ׳יאנג מאי"] }, // 0
      { lat: 18.588, lon: 98.487, name: ["Doi Inthanon", "דוי אינתנון"] }, // 1
      { lat: 18.69, lon: 98.92 }, // Hang Dong
      { lat: 19.12, lon: 98.94 }, // Mae Taeng
      { lat: 19.4, lon: 98.93, name: ["Chiang Dao", "צ׳יאנג דאו"] }, // 4
      { lat: 19.92, lon: 99.21 }, // Fang
      { lat: 20.061, lon: 99.356 }, // Thaton
      { lat: 20.165, lon: 99.623, name: ["Mae Salong", "מאה סאלונג"] }, // 7
      {
        lat: 20.354,
        lon: 100.083,
        name: ["Golden Triangle", "משולש הזהב"],
      }, // 8
      { lat: 19.91, lon: 99.84, name: ["Chiang Rai", "צ׳יאנג ראי"] }, // 9
      { lat: 20.26, lon: 100.4 }, // Chiang Khong
      { lat: 20.28, lon: 100.42, name: ["Huay Xai", "הואי שאי"] }, // 11
      { lat: 20.67, lon: 101.07 }, // Vieng Phouka
      { lat: 21.0, lon: 101.4, name: ["Luang Namtha", "לואנג נאמטה"] }, // 13
      { lat: 20.69, lon: 101.99 }, // Udomxay
      { lat: 20.57, lon: 102.61, name: ["Nong Khiaw", "נונג קיאו"] }, // 15
      { lat: 20.2, lon: 102.3 },
      {
        lat: 19.886,
        lon: 102.135,
        name: ["Luang Prabang", "לואנג פרבאנג"],
      }, // 17
      { lat: 19.749, lon: 101.994, name: ["Kuang Si Falls", "מפלי קואנג סי"] }, // 18
      {
        lat: 19.886,
        lon: 102.135,
        name: ["Luang Prabang", "לואנג פרבאנג"],
      }, // 19
      { lat: 19.45, lon: 102.44 }, // Phou Khoun
      { lat: 19.22, lon: 102.25 }, // Kasi
      { lat: 18.92, lon: 102.45, name: ["Vang Vieng", "וואנג ויאנג"] }, // 22
      { lat: 18.4, lon: 102.55 },
      { lat: 17.975, lon: 102.63, name: ["Vientiane", "ויינטיאן"] }, // 24
      { lat: 17.87, lon: 102.72 }, // Friendship Bridge
      { lat: 17.49, lon: 101.73, name: ["Loei", "לואי"] }, // 26
      { lat: 17.9, lon: 101.67, name: ["Chiang Khan", "צ׳יאנג קאן"] }, // 27
      { lat: 17.28, lon: 101.15 }, // Dan Sai
      { lat: 16.82, lon: 100.26, name: ["Phitsanulok", "פיצנולוק"] }, // 29
      { lat: 17.02, lon: 99.7, name: ["Sukhothai", "סוקוטאי"] }, // 30
      { lat: 18.29, lon: 99.49 }, // Lampang
      { lat: 18.788, lon: 98.985, name: ["Chiang Mai", "צ׳יאנג מאי"] }, // 32
    ],
    stages: {
      "1": [0, 1],
      "2": [1, 4],
      "3": [4, 7],
      "4": [7, 9],
      "5": [9, 11],
      "6": [11, 13],
      "7": [13, 15],
      "8": [15, 17],
      "9": [17, 19],
      "10": [19, 22],
      "11": [22, 24],
      "12": [24, 26],
      "13": [26, 29],
      "14": [29, 32],
    },
  },
};
