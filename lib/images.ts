/**
 * Every photograph on the site, imported statically.
 *
 * Static imports give Next the intrinsic dimensions (no layout shift) and a
 * generated blur placeholder, and let the optimiser emit AVIF/WebP at the
 * exact sizes each breakpoint asks for. Files live outside `public/` so the
 * originals are not also shipped verbatim in the deployment.
 *
 * ⚠️ These are licensed stock photographs standing in for the real thing.
 * The brand brief is explicit — "use real project photography wherever
 * possible" — so replace these with Vijaya's own project photography.
 * Nothing else needs to change: the keys below are the only references.
 */

import aerialLand from "@/assets/images/aerial-land.jpg";
import bankReception from "@/assets/images/bank-reception.jpg";
import backdropHibiscus from "@/assets/images/backdrop-hibiscus.jpg";
import backdropInterior from "@/assets/images/backdrop-interior.jpg";
import blueprintCraft from "@/assets/images/blueprint-craft.jpg";
import cityNight from "@/assets/images/city-night.jpg";
import citySunset from "@/assets/images/city-sunset.jpg";
import cranesSkyline from "@/assets/images/cranes-skyline.jpg";
import heroPoster from "@/assets/images/hero-poster.jpg";
import haraVijayaConcept from "@/assets/images/hara-vijaya-concept.jpg";
import haraVijayaHeights from "@/assets/images/hara-vijaya-heights.jpg";
import haraVijayaHeightsHero from "@/assets/images/hara-vijaya-heights-hero.jpg";
import haraVijayaVision from "@/assets/images/hara-vijaya-vision.jpg";
import homeDusk from "@/assets/images/home-dusk.jpg";
import homeLawn from "@/assets/images/home-lawn.jpg";
import industrialEngineer from "@/assets/images/industrial-engineer.jpg";
import institutionCampus from "@/assets/images/institution-campus.jpg";
import institutionHospital from "@/assets/images/institution-hospital.jpg";
import interiorFamily from "@/assets/images/interior-family.jpg";
import interiorLiving from "@/assets/images/interior-living.jpg";
import legacyPoster from "@/assets/images/legacy-poster.jpg";
import meetingHands from "@/assets/images/meeting-hands.jpg";
import officeInterior from "@/assets/images/office-interior.jpg";
import rebarWorkers from "@/assets/images/rebar-workers.jpg";
import residentialInterior from "@/assets/images/residential-interior.jpg";
import siteTeam from "@/assets/images/site-team.jpg";
import steelRebar from "@/assets/images/steel-rebar.jpg";
import towersGlass from "@/assets/images/towers-glass.jpg";
import villaPool from "@/assets/images/villa-pool.jpg";
import warehouseAisle from "@/assets/images/warehouse-aisle.jpg";

export const img = {
  aerialLand,
  backdropHibiscus,
  backdropInterior,
  bankReception,
  blueprintCraft,
  cityNight,
  citySunset,
  cranesSkyline,
  heroPoster,
  haraVijayaConcept,
  haraVijayaHeights,
  haraVijayaHeightsHero,
  haraVijayaVision,
  homeDusk,
  homeLawn,
  industrialEngineer,
  institutionCampus,
  institutionHospital,
  interiorFamily,
  interiorLiving,
  legacyPoster,
  meetingHands,
  officeInterior,
  rebarWorkers,
  residentialInterior,
  siteTeam,
  steelRebar,
  towersGlass,
  villaPool,
  warehouseAisle,
} as const;

/** Descriptive alt text, kept next to the images so it never drifts. */
export const alt = {
  aerialLand: "Aerial view of a residential development laid out across open land",
  backdropHibiscus:
    "Red hibiscus blooms against a soft cream ground",
  backdropInterior:
    "A living and dining room at dusk, lit warmly, looking out over the city",
  bankReception: "Banking hall interior with a curved reception counter",
  blueprintCraft: "Hands marking up a construction drawing at a desk",
  cityNight: "Long-exposure traffic trails running through a city at night",
  citySunset: "City skyline and arterial roads at sunset",
  cranesSkyline: "Tower cranes rising over buildings under construction",
  heroPoster: "Tower cranes working above a city skyline under construction",
  haraVijayaConcept:
    "Hara Vijaya Heights lit at twilight, its towers rising over the open lawn",
  haraVijayaVision:
    "An architect at a drawing board, reviewing elevations of the development on screen",
  haraVijayaHeights:
    "Hara Vijaya Heights seen from the landscaped frontage, its towers stepping back behind mature trees",
  haraVijayaHeightsHero:
    "Architectural view of Hara Vijaya Heights, with the tree-lined approach to the entrance lobby",
  homeDusk: "Entrance of a newly completed home lit at dusk",
  homeLawn: "Contemporary family home with a landscaped lawn",
  industrialEngineer: "Engineer working at an automated production line",
  institutionCampus: "Institutional campus building with landscaped grounds",
  institutionHospital: "Hospital building entrance and approach road",
  interiorFamily: "Family living room with a dog resting by the sofa",
  interiorLiving: "Open-plan living and dining space in a completed apartment",
  legacyPoster: "A building frame and tower crane silhouetted against the sunset",
  meetingHands: "A project discussion in progress across a meeting table",
  officeInterior: "Completed commercial office interior with glazed partitions",
  rebarWorkers: "Site team tying reinforcement steel on a column cage",
  residentialInterior:
    "Warmly lit living and dining room in a completed Vijaya home, with a sofa, armchair and planting",
  siteTeam: "Site engineers and workers walking a large concrete deck",
  steelRebar: "Reinforcement steel being placed on an active construction site",
  towersGlass: "Glass office towers seen from street level",
  villaPool: "Completed villa with a swimming pool and terrace",
  warehouseAisle: "Aisle inside a completed warehouse facility",
} as const;

/** Background video files (these do live in `public/`, served by URL). */
export const video = {
  heroDesktop: "/video/hero.mp4",
  heroMobile: "/video/hero-mobile.mp4",
  legacyDesktop: "/video/legacy.mp4",
  legacyMobile: "/video/legacy-mobile.mp4",
  craft: "/video/craft.mp4",
} as const;
