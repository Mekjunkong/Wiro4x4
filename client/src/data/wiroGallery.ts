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
    stem: "4x4_water_splash",
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
    stem: "wiro_waterfall",
    en: "Your guide",
    he: "המדריך שלכם",
    ratio: "1/1",
  },
  {
    stem: "doi_suthep_temple_panoramic",
    en: "Golden chedi, Doi Suthep",
    he: "צ׳די הזהב בדוי סוטפ",
    ratio: "4/5",
  },
  {
    stem: "hero-wiro",
    en: "Mud trail after the rain",
    he: "שביל בוץ אחרי הגשם",
    ratio: "3/2",
  },
  {
    stem: "tourist_akha_woman",
    en: "Hill-tribe village",
    he: "כפר שבטי ההרים",
    ratio: "1/1",
  },
  {
    stem: "food_preparation",
    en: "Lunch on the trail",
    he: "ארוחת צהריים בשטח",
    ratio: "4/5",
  },
  {
    stem: "twin_waterfalls",
    en: "Twin falls in the jungle",
    he: "מפלים תאומים בג׳ונגל",
    ratio: "3/2",
  },
  {
    stem: "elephant_group_wash",
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
    stem: "wiro_with_vehicle",
    en: "Ready to roll",
    he: "מוכנים לצאת",
    ratio: "1/1",
  },
  {
    stem: "waterfall_freedom",
    en: "Under the waterfall",
    he: "מתחת למפל",
    ratio: "4/5",
  },
  {
    stem: "river_sunrise",
    en: "River at sunset",
    he: "נהר בשקיעה",
    ratio: "3/2",
  },
];
