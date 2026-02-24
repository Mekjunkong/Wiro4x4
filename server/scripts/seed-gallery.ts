/**
 * Gallery Photo Seed Script
 *
 * Run on Manus (where DATABASE_URL is available):
 *   npx tsx server/scripts/seed-gallery.ts
 *
 * This inserts all curated photos into the galleryPhotos table.
 * Photos are served from /images/optimized/ (public static files).
 * Safe to re-run: skips photos whose s3Url already exists.
 */

import { getDb } from "../db/connection";
import { galleryPhotos } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

interface SeedPhoto {
  title: string;
  s3Url: string;
  s3Key: string;
  description: string;
  category:
    | "tours"
    | "vehicles"
    | "destinations"
    | "activities"
    | "food"
    | "accommodation"
    | "other";
  sortOrder: number;
  isPublished: number;
}

const PHOTOS: SeedPhoto[] = [
  // ── Vehicles ──────────────────────────────────────────
  {
    title: "WIRO 4x4 — Mud Trail Action",
    s3Url: "/images/optimized/hero-wiro.webp",
    s3Key: "/images/optimized/hero-wiro.webp",
    description:
      "The WIRO 4x4 powering through a muddy jungle trail with headlights blazing",
    category: "vehicles",
    sortOrder: 1,
    isPublished: 1,
  },
  {
    title: "4x4 Water Splash Crossing",
    s3Url: "/images/optimized/4x4_water_splash.webp",
    s3Key: "/images/optimized/4x4_water_splash.webp",
    description: "Epic water crossing — the WIRO 4x4 plowing through a river",
    category: "vehicles",
    sortOrder: 2,
    isPublished: 1,
  },
  {
    title: "Guide Wiro with the 4x4",
    s3Url: "/images/optimized/wiro_with_vehicle.webp",
    s3Key: "/images/optimized/wiro_with_vehicle.webp",
    description: "Guide Wiro posing proudly next to his off-road vehicle",
    category: "vehicles",
    sortOrder: 3,
    isPublished: 1,
  },
  {
    title: "Jungle Convoy",
    s3Url: "/images/optimized/wiro_jungle_convoy.webp",
    s3Key: "/images/optimized/wiro_jungle_convoy.webp",
    description:
      "Wiro leading the convoy through the jungle with multiple 4x4 vehicles",
    category: "vehicles",
    sortOrder: 4,
    isPublished: 1,
  },
  {
    title: "Vehicle Fleet in the Jungle",
    s3Url: "/images/optimized/vehicle_fleet_jungle.webp",
    s3Key: "/images/optimized/vehicle_fleet_jungle.webp",
    description: "The full WIRO 4x4 fleet lined up in the jungle with crew",
    category: "vehicles",
    sortOrder: 5,
    isPublished: 1,
  },
  {
    title: "WIRO Fleet Lineup",
    s3Url: "/images/optimized/wiro_fleet_lineup.webp",
    s3Key: "/images/optimized/wiro_fleet_lineup.webp",
    description:
      "The WIRO 4x4 team and their vehicle fleet ready for adventure",
    category: "vehicles",
    sortOrder: 6,
    isPublished: 1,
  },
  {
    title: "Crew Selfie with Vehicles",
    s3Url: "/images/optimized/wiro_crew_selfie.webp",
    s3Key: "/images/optimized/wiro_crew_selfie.webp",
    description:
      "WIRO crew taking a selfie with the 4x4 vehicles on the street",
    category: "vehicles",
    sortOrder: 7,
    isPublished: 1,
  },
  {
    title: "Couple with WIRO 4x4",
    s3Url: "/images/optimized/couple_with_4x4.webp",
    s3Key: "/images/optimized/couple_with_4x4.webp",
    description:
      "Happy couple posing with the WIRO 4x4 on a dirt mountain road",
    category: "vehicles",
    sortOrder: 8,
    isPublished: 1,
  },
  {
    title: "Tourists with WIRO 4x4",
    s3Url: "/images/optimized/tourists_with_4x4.webp",
    s3Key: "/images/optimized/tourists_with_4x4.webp",
    description:
      "Happy tourists posing with the WIRO 4x4 on a dirt road surrounded by rice paddies",
    category: "vehicles",
    sortOrder: 9,
    isPublished: 1,
  },
  {
    title: "Wiro Between the 4x4s",
    s3Url: "/images/optimized/wiro_between_4x4s.webp",
    s3Key: "/images/optimized/wiro_between_4x4s.webp",
    description:
      "Guide Wiro standing between two WIRO 4x4 vehicles in the jungle",
    category: "vehicles",
    sortOrder: 10,
    isPublished: 1,
  },

  // ── Destinations ──────────────────────────────────────
  {
    title: "Waterfall Base — Chiang Mai",
    s3Url: "/images/optimized/waterfall_base.webp",
    s3Key: "/images/optimized/waterfall_base.webp",
    description: "Spectacular tall waterfall with visitors at the base",
    category: "destinations",
    sortOrder: 11,
    isPublished: 1,
  },
  {
    title: "Twin Waterfalls",
    s3Url: "/images/optimized/twin_waterfalls.webp",
    s3Key: "/images/optimized/twin_waterfalls.webp",
    description:
      "Beautiful twin waterfalls cascading through lush jungle greenery",
    category: "destinations",
    sortOrder: 12,
    isPublished: 1,
  },
  {
    title: "Hidden Waterfalls in the Forest",
    s3Url: "/images/optimized/waterfalls_forest.webp",
    s3Key: "/images/optimized/waterfalls_forest.webp",
    description: "Waterfalls glimpsed through the forest canopy",
    category: "destinations",
    sortOrder: 13,
    isPublished: 1,
  },
  {
    title: "Golden Mountain Sunset",
    s3Url: "/images/optimized/mountain_sunset_golden.webp",
    s3Key: "/images/optimized/mountain_sunset_golden.webp",
    description:
      "Golden sunset over the mountains of Chiang Mai with pine tree silhouette",
    category: "destinations",
    sortOrder: 14,
    isPublished: 1,
  },
  {
    title: "Valley Panorama — Northern Thailand",
    s3Url: "/images/optimized/valley_panorama.webp",
    s3Key: "/images/optimized/valley_panorama.webp",
    description:
      "Breathtaking panoramic view of the Chiang Mai valley with misty mountain layers",
    category: "destinations",
    sortOrder: 15,
    isPublished: 1,
  },
  {
    title: "Cave Exploration by Flashlight",
    s3Url: "/images/optimized/cave_exploration.webp",
    s3Key: "/images/optimized/cave_exploration.webp",
    description:
      "Exploring a dramatic cave with flashlights illuminating ancient stalactites",
    category: "destinations",
    sortOrder: 16,
    isPublished: 1,
  },
  {
    title: "Cave Boat Adventure",
    s3Url: "/images/optimized/cave_boat.webp",
    s3Key: "/images/optimized/cave_boat.webp",
    description:
      "Exploring a hidden cave by boat — light streaming through the entrance",
    category: "destinations",
    sortOrder: 17,
    isPublished: 1,
  },
  {
    title: "Mountain Village Viewpoint",
    s3Url: "/images/optimized/mountain_village_view.webp",
    s3Key: "/images/optimized/mountain_village_view.webp",
    description:
      "Stunning view of a hilltop village overlooking karst mountain peaks",
    category: "destinations",
    sortOrder: 18,
    isPublished: 1,
  },
  {
    title: "Sticky Waterfalls",
    s3Url: "/images/optimized/sticky_waterfalls.webp",
    s3Key: "/images/optimized/sticky_waterfalls.webp",
    description:
      "The famous Bua Tong Sticky Waterfalls — walk up the limestone cascade",
    category: "destinations",
    sortOrder: 19,
    isPublished: 1,
  },
  {
    title: "Green Rice Terraces",
    s3Url: "/images/optimized/rice_terraces_green.webp",
    s3Key: "/images/optimized/rice_terraces_green.webp",
    description:
      "Lush green rice terraces in the highlands with traditional huts",
    category: "destinations",
    sortOrder: 20,
    isPublished: 1,
  },
  {
    title: "Golden Triangle — Mekong River",
    s3Url: "/images/optimized/golden_triangle.webp",
    s3Key: "/images/optimized/golden_triangle.webp",
    description:
      "The iconic Golden Triangle where Thailand, Laos, and Myanmar meet at the Mekong River",
    category: "destinations",
    sortOrder: 21,
    isPublished: 1,
  },
  {
    title: "Mountain Sunset",
    s3Url: "/images/optimized/mountain_sunset.webp",
    s3Key: "/images/optimized/mountain_sunset.webp",
    description: "Stunning sunset with sun rays over the Chiang Mai mountains",
    category: "destinations",
    sortOrder: 22,
    isPublished: 1,
  },
  {
    title: "Hill Tribe Village Market",
    s3Url: "/images/optimized/village_market_street.webp",
    s3Key: "/images/optimized/village_market_street.webp",
    description: "Walking through a traditional hill tribe village market",
    category: "destinations",
    sortOrder: 23,
    isPublished: 1,
  },
  {
    title: "Chiang Mai Valley View",
    s3Url: "/images/optimized/chiang_mai_valley.webp",
    s3Key: "/images/optimized/chiang_mai_valley.webp",
    description:
      "Panoramic view of the Chiang Mai valley with banana trees in the foreground",
    category: "destinations",
    sortOrder: 24,
    isPublished: 1,
  },
  {
    title: "Jungle Waterfall",
    s3Url: "/images/optimized/jungle_waterfall_tall.webp",
    s3Key: "/images/optimized/jungle_waterfall_tall.webp",
    description: "Tall waterfall hidden deep in the jungle",
    category: "destinations",
    sortOrder: 25,
    isPublished: 1,
  },
  {
    title: "Forest Waterfall Pool",
    s3Url: "/images/optimized/forest_waterfall_pool.webp",
    s3Key: "/images/optimized/forest_waterfall_pool.webp",
    description:
      "A serene waterfall flowing into a natural rock pool in the forest",
    category: "destinations",
    sortOrder: 26,
    isPublished: 1,
  },
  {
    title: "River Sunrise",
    s3Url: "/images/optimized/river_sunrise.webp",
    s3Key: "/images/optimized/river_sunrise.webp",
    description: "Magical sunrise over a misty river in Northern Thailand",
    category: "destinations",
    sortOrder: 27,
    isPublished: 1,
  },
  {
    title: "Misty Morning River",
    s3Url: "/images/optimized/river_misty_morning.webp",
    s3Key: "/images/optimized/river_misty_morning.webp",
    description: "A peaceful misty morning along the river",
    category: "destinations",
    sortOrder: 28,
    isPublished: 1,
  },

  // ── Activities ────────────────────────────────────────
  {
    title: "Bamboo Rafting Adventure",
    s3Url: "/images/optimized/bamboo_rafting.webp",
    s3Key: "/images/optimized/bamboo_rafting.webp",
    description:
      "Tour group on a bamboo raft floating down the river through the jungle",
    category: "activities",
    sortOrder: 29,
    isPublished: 1,
  },
  {
    title: "Elephant Bathing",
    s3Url: "/images/optimized/elephant_bathing.webp",
    s3Key: "/images/optimized/elephant_bathing.webp",
    description:
      "Tourists bathing an elephant in the river — a highlight of the Mae Wang tour",
    category: "activities",
    sortOrder: 30,
    isPublished: 1,
  },
  {
    title: "Elephant Encounter",
    s3Url: "/images/optimized/elephant_encounter.webp",
    s3Key: "/images/optimized/elephant_encounter.webp",
    description:
      "Mother and daughter having a close encounter with friendly elephants",
    category: "activities",
    sortOrder: 31,
    isPublished: 1,
  },
  {
    title: "Elephant Group Wash",
    s3Url: "/images/optimized/elephant_group_wash.webp",
    s3Key: "/images/optimized/elephant_group_wash.webp",
    description: "Tour group washing and caring for elephants at the sanctuary",
    category: "activities",
    sortOrder: 32,
    isPublished: 1,
  },
  {
    title: "Waterfall Freedom",
    s3Url: "/images/optimized/waterfall_freedom.webp",
    s3Key: "/images/optimized/waterfall_freedom.webp",
    description:
      "Embracing the power of a waterfall — arms outstretched in the spray",
    category: "activities",
    sortOrder: 33,
    isPublished: 1,
  },
  {
    title: "Couple on Mountain Trail",
    s3Url: "/images/optimized/couple_mountain_trail.webp",
    s3Key: "/images/optimized/couple_mountain_trail.webp",
    description:
      "Couple standing on a red earth mountain trail with panoramic views",
    category: "activities",
    sortOrder: 34,
    isPublished: 1,
  },
  {
    title: "Bridge Jump — Pai",
    s3Url: "/images/optimized/bridge_jump.webp",
    s3Key: "/images/optimized/bridge_jump.webp",
    description: "Fun jump shot on the historic iron bridge in Pai",
    category: "activities",
    sortOrder: 35,
    isPublished: 1,
  },
  {
    title: "Accessibility Tour — Off-Road for Everyone",
    s3Url: "/images/optimized/accessibility_tour.webp",
    s3Key: "/images/optimized/accessibility_tour.webp",
    description:
      "Guide Wiro with a wheelchair-accessible tour guest beside the WIRO 4x4",
    category: "activities",
    sortOrder: 36,
    isPublished: 1,
  },

  // ── Food ──────────────────────────────────────────────
  {
    title: "Kosher Meal Buffet",
    s3Url: "/images/optimized/kosher_meal.webp",
    s3Key: "/images/optimized/kosher_meal.webp",
    description:
      "Fresh kosher meals prepared by our chefs — rice, meat, vegetables, and more",
    category: "food",
    sortOrder: 37,
    isPublished: 1,
  },
  {
    title: "Chefs in the Kitchen",
    s3Url: "/images/optimized/chefs_kitchen.webp",
    s3Key: "/images/optimized/chefs_kitchen.webp",
    description: "Our professional kosher kitchen team ready to serve",
    category: "food",
    sortOrder: 38,
    isPublished: 1,
  },
  {
    title: "Chef Cooking Kosher",
    s3Url: "/images/optimized/chef_cooking.webp",
    s3Key: "/images/optimized/chef_cooking.webp",
    description: "Chef carefully preparing fresh kosher food",
    category: "food",
    sortOrder: 39,
    isPublished: 1,
  },
  {
    title: "Food Preparation Outdoors",
    s3Url: "/images/optimized/food_preparation.webp",
    s3Key: "/images/optimized/food_preparation.webp",
    description: "Wiro and crew preparing meals outdoors during a tour stop",
    category: "food",
    sortOrder: 40,
    isPublished: 1,
  },

  // ── Tours (culture, people, groups) ───────────────────
  {
    title: "Meet Guide Wiro",
    s3Url: "/images/optimized/guide_wiro.webp",
    s3Key: "/images/optimized/guide_wiro.webp",
    description:
      "Guide Wiro giving a thumbs up from the driver seat — your adventure guide",
    category: "tours",
    sortOrder: 41,
    isPublished: 1,
  },
  {
    title: "Tourist with Akha Hill Tribe Woman",
    s3Url: "/images/optimized/tourist_akha_woman.webp",
    s3Key: "/images/optimized/tourist_akha_woman.webp",
    description:
      "Tourist trying on traditional Akha headdress with a local woman",
    category: "tours",
    sortOrder: 42,
    isPublished: 1,
  },
  {
    title: "Traditional Umbrella Making",
    s3Url: "/images/optimized/umbrella_making.webp",
    s3Key: "/images/optimized/umbrella_making.webp",
    description: "Watching artisans hand-craft traditional Bo Sang umbrellas",
    category: "tours",
    sortOrder: 43,
    isPublished: 1,
  },
  {
    title: "Evening Entertainment",
    s3Url: "/images/optimized/evening_entertainment.webp",
    s3Key: "/images/optimized/evening_entertainment.webp",
    description:
      "Friends enjoying an evening out with live music and country vibes",
    category: "tours",
    sortOrder: 44,
    isPublished: 1,
  },
  {
    title: "Hill Tribe Artisan",
    s3Url: "/images/optimized/hill_tribe_woman.webp",
    s3Key: "/images/optimized/hill_tribe_woman.webp",
    description: "A smiling Akha hill tribe woman at the village market",
    category: "tours",
    sortOrder: 45,
    isPublished: 1,
  },
  {
    title: "Long Neck Tribe Visit",
    s3Url: "/images/optimized/long_neck_tribe.webp",
    s3Key: "/images/optimized/long_neck_tribe.webp",
    description: "Crew member posing with a Karen Long Neck tribe woman",
    category: "tours",
    sortOrder: 46,
    isPublished: 1,
  },
  {
    title: "Karen Village Music Session",
    s3Url: "/images/optimized/karen_village_music.webp",
    s3Key: "/images/optimized/karen_village_music.webp",
    description:
      "Wiro playing guitar with a tourist and Karen long-neck tribe woman",
    category: "tours",
    sortOrder: 47,
    isPublished: 1,
  },
  {
    title: "Long Neck Tribe Weaving",
    s3Url: "/images/optimized/long_neck_weaving.webp",
    s3Key: "/images/optimized/long_neck_weaving.webp",
    description:
      "Karen Long Neck tribe woman demonstrating traditional weaving",
    category: "tours",
    sortOrder: 48,
    isPublished: 1,
  },
  {
    title: "Hill Tribe Market Woman",
    s3Url: "/images/optimized/hill_tribe_market_woman.webp",
    s3Key: "/images/optimized/hill_tribe_market_woman.webp",
    description:
      "A hill tribe woman in traditional colorful dress at the market",
    category: "tours",
    sortOrder: 49,
    isPublished: 1,
  },
  {
    title: "Hill Tribe Child",
    s3Url: "/images/optimized/hill_tribe_child.webp",
    s3Key: "/images/optimized/hill_tribe_child.webp",
    description:
      "A hill tribe child in traditional clothing at a colorful market stall",
    category: "tours",
    sortOrder: 50,
    isPublished: 1,
  },
  {
    title: "Wiro the Photographer",
    s3Url: "/images/optimized/wiro_photographer.webp",
    s3Key: "/images/optimized/wiro_photographer.webp",
    description:
      "Guide Wiro with his professional camera — capturing every moment of your adventure",
    category: "tours",
    sortOrder: 51,
    isPublished: 1,
  },
  {
    title: "Wiro with Colleague",
    s3Url: "/images/optimized/wiro_with_colleague.webp",
    s3Key: "/images/optimized/wiro_with_colleague.webp",
    description:
      "Wiro and a fellow guide giving thumbs up — ready for the next adventure",
    category: "tours",
    sortOrder: 52,
    isPublished: 1,
  },
  {
    title: "WIRO Crew Team",
    s3Url: "/images/optimized/wiro_crew_team.webp",
    s3Key: "/images/optimized/wiro_crew_team.webp",
    description: "The WIRO 4x4 crew team — Wiro and his guides",
    category: "tours",
    sortOrder: 53,
    isPublished: 1,
  },
  {
    title: "Crew Jungle Group Photo",
    s3Url: "/images/optimized/crew_jungle_group.webp",
    s3Key: "/images/optimized/crew_jungle_group.webp",
    description: "The whole WIRO crew together in the jungle after a great day",
    category: "tours",
    sortOrder: 54,
    isPublished: 1,
  },
  {
    title: "Hill Tribe Village Visit",
    s3Url: "/images/optimized/hilltribe_visit.webp",
    s3Key: "/images/optimized/hilltribe_visit.webp",
    description:
      "Tourists visiting a hill tribe village during a WIRO 4x4 tour",
    category: "tours",
    sortOrder: 55,
    isPublished: 1,
  },
  {
    title: "Tourists at Canyon Trail",
    s3Url: "/images/optimized/tourists_canyon_trail.webp",
    s3Key: "/images/optimized/tourists_canyon_trail.webp",
    description: "Tour group exploring a canyon viewpoint trail",
    category: "tours",
    sortOrder: 56,
    isPublished: 1,
  },
  {
    title: "River Crossing Adventure",
    s3Url: "/images/optimized/tourists_river_crossing.webp",
    s3Key: "/images/optimized/tourists_river_crossing.webp",
    description: "Tourists crossing a river during an off-road tour",
    category: "tours",
    sortOrder: 57,
    isPublished: 1,
  },
  {
    title: "Canyon Edge Viewpoint",
    s3Url: "/images/optimized/couple_canyon_edge.webp",
    s3Key: "/images/optimized/couple_canyon_edge.webp",
    description: "Couple standing at a canyon edge viewpoint during a tour",
    category: "tours",
    sortOrder: 58,
    isPublished: 1,
  },
  {
    title: "Canyon Viewpoint Stop",
    s3Url: "/images/optimized/couple_canyon_viewpoint.webp",
    s3Key: "/images/optimized/couple_canyon_viewpoint.webp",
    description: "Couple at a scenic canyon viewpoint overlook",
    category: "tours",
    sortOrder: 59,
    isPublished: 1,
  },

  // ── Accessibility Tours ───────────────────────────────
  {
    title: "Wheelchair Carry — No Barrier Too Great",
    s3Url: "/images/optimized/wheelchair_carry_stairs.webp",
    s3Key: "/images/optimized/wheelchair_carry_stairs.webp",
    description:
      "The WIRO crew carrying a wheelchair user up stairs — adventure for everyone",
    category: "activities",
    sortOrder: 60,
    isPublished: 1,
  },
  {
    title: "Accessible Doi Inthanon — Royal Garden",
    s3Url: "/images/optimized/accessible_doi_inthanon_garden.webp",
    s3Key: "/images/optimized/accessible_doi_inthanon_garden.webp",
    description:
      "Wheelchair accessible group tour at the Doi Inthanon Royal Flower Garden",
    category: "activities",
    sortOrder: 61,
    isPublished: 1,
  },
  {
    title: "Accessible Doi Suthep Temple Visit",
    s3Url: "/images/optimized/accessible_doi_suthep_temple.webp",
    s3Key: "/images/optimized/accessible_doi_suthep_temple.webp",
    description:
      "Wheelchair accessible group photo at the beautiful Doi Suthep Temple",
    category: "activities",
    sortOrder: 62,
    isPublished: 1,
  },
  {
    title: "Accessible Doi Suthep — Golden Pagoda",
    s3Url: "/images/optimized/accessible_doi_suthep_golden.webp",
    s3Key: "/images/optimized/accessible_doi_suthep_golden.webp",
    description:
      "Two guests in wheelchairs enjoying the stunning golden pagoda at Doi Suthep",
    category: "activities",
    sortOrder: 63,
    isPublished: 1,
  },
  {
    title: "Accessible Group Gathering",
    s3Url: "/images/optimized/accessible_group_gathering.webp",
    s3Key: "/images/optimized/accessible_group_gathering.webp",
    description: "Accessibility tour group gathering by the WIRO 4x4 vehicles",
    category: "activities",
    sortOrder: 64,
    isPublished: 1,
  },
  {
    title: "Accessible Waterfall Group Photo",
    s3Url: "/images/optimized/accessible_waterfall_group.webp",
    s3Key: "/images/optimized/accessible_waterfall_group.webp",
    description:
      "Wheelchair accessible tour group at Wachirathan Waterfall, Doi Inthanon",
    category: "activities",
    sortOrder: 65,
    isPublished: 1,
  },
  {
    title: "Wheelchair Assist on Trail",
    s3Url: "/images/optimized/accessible_wheelchair_assist.webp",
    s3Key: "/images/optimized/accessible_wheelchair_assist.webp",
    description: "Crew helping a wheelchair user navigate an outdoor trail",
    category: "activities",
    sortOrder: 66,
    isPublished: 1,
  },
  {
    title: "Accessible Doi Inthanon Summit",
    s3Url: "/images/optimized/accessible_doi_inthanon_summit.webp",
    s3Key: "/images/optimized/accessible_doi_inthanon_summit.webp",
    description:
      "Accessible tour group at the Doi Inthanon summit pagoda — roof of Thailand",
    category: "activities",
    sortOrder: 67,
    isPublished: 1,
  },
  {
    title: "Wiro Carrying Wheelchair Up Stairs",
    s3Url: "/images/optimized/wiro_carrying_wheelchair.webp",
    s3Key: "/images/optimized/wiro_carrying_wheelchair.webp",
    description:
      "Wiro personally carrying a wheelchair down stairs — going above and beyond",
    category: "activities",
    sortOrder: 68,
    isPublished: 1,
  },
  {
    title: "Accessible Couple at Garden Waterfall",
    s3Url: "/images/optimized/accessible_couple_garden.webp",
    s3Key: "/images/optimized/accessible_couple_garden.webp",
    description:
      "Happy couple in wheelchairs enjoying a beautiful garden waterfall",
    category: "activities",
    sortOrder: 69,
    isPublished: 1,
  },
  {
    title: "Crew Lifting Wheelchair",
    s3Url: "/images/optimized/crew_lifting_chair.webp",
    s3Key: "/images/optimized/crew_lifting_chair.webp",
    description:
      "WIRO crew member lifting a plastic chair overhead — ready for anything",
    category: "activities",
    sortOrder: 70,
    isPublished: 1,
  },
  {
    title: "Accessible 4x4 Thumbs Up",
    s3Url: "/images/optimized/accessible_4x4_thumbsup.webp",
    s3Key: "/images/optimized/accessible_4x4_thumbsup.webp",
    description:
      "Wheelchair-accessible guest giving thumbs up beside the WIRO 4x4",
    category: "activities",
    sortOrder: 71,
    isPublished: 1,
  },
];

async function seed() {
  const db = await getDb();
  if (!db) {
    console.error("❌ DATABASE_URL not available. Run this on Manus.");
    process.exit(1);
  }

  let inserted = 0;
  let skipped = 0;

  for (const photo of PHOTOS) {
    // Check if already exists (idempotent)
    const existing = await db
      .select()
      .from(galleryPhotos)
      .where(eq(galleryPhotos.s3Url, photo.s3Url))
      .limit(1);

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    await db.insert(galleryPhotos).values(photo);
    inserted++;
    console.log(`✓ ${photo.title}`);
  }

  console.log(
    `\n✅ Done! Inserted: ${inserted}, Skipped (already exist): ${skipped}`
  );
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
