/**
 * Real WIRO trip photos used by the home ring and the gallery fly-through.
 * Stems point to `client/public/images/optimized/`. Captions describe what
 * the photo actually shows (source filenames are not always accurate).
 */
export interface TrailPhoto {
  stem: string;
  en: string;
  he: string;
  /** Width / height, used to reserve layout space. */
  ratio: "4/5" | "3/2" | "1/1";
}

export const TRAIL_PHOTOS: readonly TrailPhoto[] = [
  {
    stem: "wiro_4x4_river_splash",
    en: "River crossing",
    he: "חציית נהר",
    ratio: "4/5",
  },
  {
    stem: "single_cascade_waterfall",
    en: "Waterfall stop",
    he: "עצירה במפל",
    ratio: "3/2",
  },
  {
    stem: "wiro_guide_thumbsup_portrait",
    en: "Your guide",
    he: "המדריך שלכם",
    ratio: "1/1",
  },
  {
    stem: "doi_inthanon_kings_pagoda",
    en: "Temple relief carving",
    he: "תבליט במקדש",
    ratio: "4/5",
  },
  {
    stem: "wiro_4x4_mudtrail_headlights",
    en: "Mud trail after the rain",
    he: "שביל בוץ אחרי הגשם",
    ratio: "3/2",
  },
  {
    stem: "hilltribe_community_visit",
    en: "Hill-tribe village",
    he: "כפר שבטי ההרים",
    ratio: "1/1",
  },
  {
    stem: "wiro_preparing_food_outdoors",
    en: "Lunch on the trail",
    he: "ארוחת צהריים בשטח",
    ratio: "4/5",
  },
  {
    stem: "jungle_waterfall_cascade_rocks",
    en: "Cascade on the rocks",
    he: "מפל על הסלעים",
    ratio: "3/2",
  },
  {
    stem: "elephant_sanctuary_chiangmai",
    en: "Elephant sanctuary",
    he: "מקלט הפילים",
    ratio: "1/1",
  },
  {
    stem: "mountain_sunset_golden",
    en: "Evening on the ridge",
    he: "ערב על הרכס",
    ratio: "4/5",
  },
  {
    stem: "offroad_vehicle_forest_trail",
    en: "Forest river at dawn",
    he: "נהר ביער עם שחר",
    ratio: "3/2",
  },
  {
    stem: "wiro_thumbsup_between_trucks",
    en: "Ready to roll",
    he: "מוכנים לצאת",
    ratio: "1/1",
  },
  {
    stem: "hero-waterfall",
    en: "Jungle waterfall",
    he: "מפל בג'ונגל",
    ratio: "4/5",
  },
  {
    stem: "wiro_vehicle_scenic_stop",
    en: "River at sunset",
    he: "נהר בשקיעה",
    ratio: "3/2",
  },
];
