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
 * The footer's backdrop. Several are kept on disk and one is imported:
 * swapping the footer means changing which file this line names, and nothing
 * else.
 *
 * - `backdrop-footer-room.jpg`      — a living room open to a planted
 *                                     courtyard, a Krishna pichwai above the
 *                                     sofa (in use)
 * - `backdrop-footer-living.jpg`    — a living and dining room open to a
 *                                     planted balcony
 * - `backdrop-interior.jpg`         — a lit apartment looking out over the
 *                                     city at dusk (the Reviews section is
 *                                     set on it)
 * - `city-sunset.jpg`               — the skyline at sunset
 * - `backdrop-footer-penthouse.jpg` — a penthouse at dusk, city below
 * - `backdrop-footer-terrace.jpg`   — a roof terrace at dusk
 * - `backdrop-footer-interior.jpg`  — a warmly lit apartment at night
 *
 * The footer now carries a scrim, so a bright picture no longer breaks it
 * outright — but the scrim is tuned to this photograph's range, and a much
 * darker or much brighter one will want it re-tuned. See the note in
 * `site-footer.tsx`.
 */
import backdropFooter from "@/assets/images/backdrop-footer-room.jpg";
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
/* The four steps of a joint venture, for the band on the Joint Ventures
   page: the conversation, the study, the agreement on paper, and the work
   itself. See `ProcessReveal`. */
import familyConversation from "@/assets/images/family-conversation.jpg";
import designReviewMeeting from "@/assets/images/design-review-meeting.jpg";
import officeDocumentReview from "@/assets/images/office-document-review.jpg";
import planAndAgreement from "@/assets/images/plan-and-agreement.jpg";
import slabPour from "@/assets/images/slab-pour.jpg";
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
/* The four kinds of partner, for the band on the Joint Ventures page: the
   land, the family that holds it, the property already standing on it, and
   the people who build. See `PartnerPanels`. */
import partnerBungalow from "@/assets/images/partner-bungalow.jpg";
import partnerLandHolding from "@/assets/images/partner-land-holding.jpg";
import partnerPlansSite from "@/assets/images/partner-plans-site.jpg";
/* The five reasons to partner, for the accordion further down the same page:
   the fifty years, the crew that built them, what has been built, a building
   settled into the city, and the family living in one. Each is read both as a
   narrow slat and as a full panel, so all five are compositions that survive a
   hard vertical crop. See `ReasonPanels`. */
import fiftyYearsLegacy from "@/assets/images/fifty-years-legacy.jpg";
import masonBrickwork from "@/assets/images/mason-brickwork.jpg";
import residentialTowers from "@/assets/images/residential-towers.jpg";
import bengaluruDusk from "@/assets/images/bengaluru-dusk.jpg";
import familyLivingRoom from "@/assets/images/family-living-room.jpg";
import plotWalkover from "@/assets/images/plot-walkover.jpg";
import rebarWorkers from "@/assets/images/rebar-workers.jpg";
import residenceBlueHour from "@/assets/images/residence-blue-hour.jpg";
import scaleModelHands from "@/assets/images/scale-model-hands.jpg";
import residentialInterior from "@/assets/images/residential-interior.jpg";
import residentialLivingDusk from "@/assets/images/residential-living-dusk.jpg";
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
  familyConversation,
  designReviewMeeting,
  officeDocumentReview,
  planAndAgreement,
  slabPour,
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
  partnerBungalow,
  partnerLandHolding,
  fiftyYearsLegacy,
  masonBrickwork,
  residentialTowers,
  bengaluruDusk,
  familyLivingRoom,
  partnerPlansSite,
  plotWalkover,
  rebarWorkers,
  residenceBlueHour,
  scaleModelHands,
  residentialInterior,
  residentialLivingDusk,
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
    "A living room open to a planted courtyard through full-height glass, a large Krishna pichwai hung above the sofa",
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
  familyConversation:
    "A family talking together in their living room, the father in the foreground and his son and wife listening across from him",
  designReviewMeeting:
    "Three colleagues around a table reading a floor plan together, a structural model of the building on the screen beside them and the site itself under construction through the window",
  officeDocumentReview:
    "Four colleagues standing over an open file together, reading the same page",
  planAndAgreement:
    "A hard hat, a rolled floor plan and a signed agreement laid out on a table in raking sunlight",
  slabPour:
    "A site crew spreading and levelling fresh concrete across a floor slab, the city behind them",
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
  legacyPoster: "A building frame and tower crane silhouetted against the sunset",
  meetingHands: "A project discussion in progress across a meeting table",
  menuInterior:
    "A balcony shrine at dusk, warmly lit, with a marble platform, brass lamps and bamboo either side, open to the city skyline",
  officeInterior: "Completed commercial office interior with glazed partitions",
  partnerBungalow:
    "A long tiled-roof bungalow at the head of its own paved walk, planting either side and rain trees overhead",
  partnerLandHolding:
    "A single old tree standing in open land at sunset, the field boundaries running away from it to the horizon",
  partnerPlansSite:
    "Two men reading a layout drawing spread across a car bonnet, brickwork going up on the plot behind them",
  fiftyYearsLegacy:
    "Vijaya Enterprises' fifty-year mark: a gold '50 Years' set on cream, the digits cut out over rooms and a valley view, above the company logo and 'Since 1973'",
  masonBrickwork:
    "A mason's hands bedding a brick down onto fresh mortar against the line, trowel still in the other hand",
  residentialTowers:
    "Residential towers in Bengaluru seen from the foot of the block, their balconies stepping away up the elevation",
  bengaluruDusk:
    "A Bengaluru building at dusk, its upper floors lit gold against a deepening sky",
  familyLivingRoom:
    "A family sitting together on the sofa in their living room, a printed hanging on the wall behind them and sweets on the table",
  plotWalkover:
    "Three men standing together on a cleared plot, two of them in hard hats, an excavator tipping earth behind them",
  rebarWorkers: "Site team tying reinforcement steel on a column cage",
  residenceBlueHour:
    "A completed residence at blue hour, its stone portico and teak entrance lit warmly above a lawn and wet paving",
  scaleModelHands:
    "Two hands lowering a lit scale model of a low-rise building onto a site plan, the city skyline behind it at sunset",
  residentialInterior:
    "Warmly lit living and dining room in a completed Vijaya home, with a sofa, armchair and planting",
  residentialLivingDusk:
    "A warmly lit living room at dusk, floor-to-ceiling glass open to the city lights, with a Ganesha idol, marigolds and embroidered cushions",
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
  legacyDesktop: "/video/legacy.mp4",
  legacyMobile: "/video/legacy-mobile.mp4",
  craft: "/video/craft.mp4",
} as const;
