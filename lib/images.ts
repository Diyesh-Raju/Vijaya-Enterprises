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
import agreementSigning from "@/assets/images/agreement-signing.jpg";
import bankReception from "@/assets/images/bank-reception.jpg";
import backdropFabric from "@/assets/images/backdrop-fabric.jpg";
/**
 * The footer's backdrop. Two are kept on disk and one is imported: swapping
 * the footer means changing which file this line names, and nothing else.
 *
 * - `backdrop-footer-living.jpg`    — a living and dining room open to a
 *                                     planted balcony (in use)
 * - `backdrop-interior.jpg`         — a lit apartment looking out over the
 *                                     city at dusk (the Reviews section is
 *                                     set on it)
 * - `city-sunset.jpg`               — the skyline at sunset
 * - `backdrop-footer-penthouse.jpg` — a penthouse at dusk, city below
 * - `backdrop-footer-terrace.jpg`   — a roof terrace at dusk
 * - `backdrop-footer-interior.jpg`  — a warmly lit apartment at night
 *
 * The footer lays its copy straight over whichever is chosen, with no scrim
 * of any kind, so a brighter picture is a less readable footer. See the
 * warning in `site-footer.tsx`.
 */
import backdropFooter from "@/assets/images/backdrop-footer-living.jpg";
import backdropHibiscus from "@/assets/images/backdrop-hibiscus.jpg";
import backdropInterior from "@/assets/images/backdrop-interior.jpg";
import balconyFamily from "@/assets/images/balcony-family.jpg";
import balconyFamilyEvening from "@/assets/images/balcony-family-evening.jpg";
import balconyFamilyTower from "@/assets/images/balcony-family-tower.jpg";
import blueprintCraft from "@/assets/images/blueprint-craft.jpg";
import cityNight from "@/assets/images/city-night.jpg";
import citySunset from "@/assets/images/city-sunset.jpg";
import cranesSkyline from "@/assets/images/cranes-skyline.jpg";
import drawingBoard from "@/assets/images/drawing-board.jpg";
import heroPoster from "@/assets/images/hero-poster.jpg";
import haraVijayaConcept from "@/assets/images/hara-vijaya-concept.jpg";
import haraVijayaHeights from "@/assets/images/hara-vijaya-heights.jpg";
import haraVijayaHeightsHero from "@/assets/images/hara-vijaya-heights-hero.jpg";
import haraVijayaVision from "@/assets/images/hara-vijaya-vision.jpg";
import homeDusk from "@/assets/images/home-dusk.jpg";
import homeScrollEnd from "@/assets/images/home-scroll-end.jpg";
import homeScrollPoster from "@/assets/images/home-scroll-poster.jpg";
import homeLawn from "@/assets/images/home-lawn.jpg";
import industrialEngineer from "@/assets/images/industrial-engineer.jpg";
import institutionCampus from "@/assets/images/institution-campus.jpg";
import institutionHospital from "@/assets/images/institution-hospital.jpg";
import interiorFamily from "@/assets/images/interior-family.jpg";
import interiorLiving from "@/assets/images/interior-living.jpg";
import legacyPoster from "@/assets/images/legacy-poster.jpg";
import meetingHands from "@/assets/images/meeting-hands.jpg";
import menuInterior from "@/assets/images/menu-interior.jpg";
import officeInterior from "@/assets/images/office-interior.jpg";
import plotWalkover from "@/assets/images/plot-walkover.jpg";
import rebarWorkers from "@/assets/images/rebar-workers.jpg";
import residentialInterior from "@/assets/images/residential-interior.jpg";
import siteTeam from "@/assets/images/site-team.jpg";
import slabDusk from "@/assets/images/slab-dusk.jpg";
import steelRebar from "@/assets/images/steel-rebar.jpg";
import towerOccupied from "@/assets/images/tower-occupied.jpg";
import towersGlass from "@/assets/images/towers-glass.jpg";
import villaPool from "@/assets/images/villa-pool.jpg";
import warehouseAisle from "@/assets/images/warehouse-aisle.jpg";

export const img = {
  aerialLand,
  agreementSigning,
  backdropFabric,
  backdropFooter,
  backdropHibiscus,
  backdropInterior,
  balconyFamily,
  balconyFamilyEvening,
  balconyFamilyTower,
  bankReception,
  blueprintCraft,
  cityNight,
  citySunset,
  cranesSkyline,
  drawingBoard,
  heroPoster,
  haraVijayaConcept,
  haraVijayaHeights,
  haraVijayaHeightsHero,
  haraVijayaVision,
  homeDusk,
  homeLawn,
  homeScrollEnd,
  homeScrollPoster,
  industrialEngineer,
  institutionCampus,
  institutionHospital,
  interiorFamily,
  interiorLiving,
  legacyPoster,
  meetingHands,
  menuInterior,
  officeInterior,
  plotWalkover,
  rebarWorkers,
  residentialInterior,
  siteTeam,
  slabDusk,
  steelRebar,
  towerOccupied,
  towersGlass,
  villaPool,
  warehouseAisle,
} as const;

/** Descriptive alt text, kept next to the images so it never drifts. */
export const alt = {
  aerialLand: "Aerial view of a residential development laid out across open land",
  agreementSigning:
    "Two people either side of a desk, one signing an agreement while the other holds the papers steady",
  backdropFabric:
    "Soft folds of cream fabric, lit from one side",
  backdropFooter:
    "A living and dining room opening onto a planted balcony through sliding glass",
  backdropHibiscus:
    "Red hibiscus blooms against a soft cream ground",
  backdropInterior:
    "A living and dining room at dusk, lit warmly, looking out over the city",
  bankReception: "Banking hall interior with a curved reception counter",
  blueprintCraft: "Hands marking up a construction drawing at a desk",
  cityNight: "Long-exposure traffic trails running through a city at night",
  citySunset: "City skyline and arterial roads at sunset",
  cranesSkyline: "Tower cranes rising over buildings under construction",
  drawingBoard:
    "A floor plan on a drawing board, with a scale rule, drafting pens and a drawing tube laid across it",
  heroPoster: "Tower cranes working above a city skyline under construction",
  homeScrollEnd:
    "The entrance foyer of a completed home, softly out of focus",
  homeScrollPoster:
    "A landscaped residential development of white apartment towers seen from the air",
  haraVijayaConcept:
    "Hara Vijaya Heights lit at twilight, its towers rising over the open lawn",
  haraVijayaVision:
    "An architect at a drawing board, reviewing elevations of the development on screen",
  haraVijayaHeights:
    "Hara Vijaya Heights seen from the landscaped frontage, its towers stepping back behind mature trees",
  haraVijayaHeightsHero:
    "Architectural view of Hara Vijaya Heights, with the tree-lined approach to the entrance lobby",
  homeDusk: "Entrance of a newly completed home lit at dusk",
  balconyFamily:
    "A family on their apartment balcony at dusk, looking out over tree cover and the city beyond",
  balconyFamilyEvening:
    "A family sitting out together on their balcony at sunset, the city skyline beyond the tree line",
  balconyFamilyTower:
    "A family at the rail of their high balcony, a daughter pointing out across the treetops to the skyline",
  homeLawn: "Contemporary family home with a landscaped lawn",
  industrialEngineer: "Engineer working at an automated production line",
  institutionCampus: "Institutional campus building with landscaped grounds",
  institutionHospital: "Hospital building entrance and approach road",
  interiorFamily: "Family living room with a dog resting by the sofa",
  interiorLiving: "Open-plan living and dining space in a completed apartment",
  legacyPoster: "A building frame and tower crane silhouetted against the sunrise",
  meetingHands: "A project discussion in progress across a meeting table",
  menuInterior:
    "A balcony shrine at dusk, warmly lit, with a marble platform, brass lamps and bamboo either side, open to the city skyline",
  officeInterior: "Completed commercial office interior with glazed partitions",
  plotWalkover:
    "Three men standing together on a cleared plot, two of them in hard hats, an excavator tipping earth behind them",
  rebarWorkers: "Site team tying reinforcement steel on a column cage",
  residentialInterior:
    "Warmly lit living and dining room in a completed Vijaya home, with a sofa, armchair and planting",
  siteTeam: "Site engineers and workers walking a large concrete deck",
  slabDusk:
    "Workers silhouetted at dusk against a pink sky, on the reinforcement cage of a floor going up",
  steelRebar: "Reinforcement steel being placed on an active construction site",
  towerOccupied:
    "A completed apartment block at night with its windows lit, the building in use",
  towersGlass: "Glass office towers seen from street level",
  villaPool: "Completed villa with a swimming pool and terrace",
  warehouseAisle: "Aisle inside a completed warehouse facility",
} as const;

/** Background video files (these do live in `public/`, served by URL). */
export const video = {
  homeScrollDesktop: "/video/home-scroll.mp4",
  homeScrollMobile: "/video/home-scroll-mobile.mp4",
  heroDesktop: "/video/hero.mp4",
  heroMobile: "/video/hero-mobile.mp4",
  // Renamed when the clip was reversed into a sunrise. `/video/*` is cached
  // for thirty days, so re-encoding a file in place leaves every browser that
  // has already been here playing the old one — the name is the cache key.
  legacyDesktop: "/video/legacy-sunrise.mp4",
  legacyMobile: "/video/legacy-sunrise-mobile.mp4",
  craft: "/video/craft.mp4",
} as const;
