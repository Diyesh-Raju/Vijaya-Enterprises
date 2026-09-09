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
/* The garden the amenities page is set on: it stays put behind the tiles
   while they scroll up over it. See the amenities page. */
import amenitiesGarden from "@/assets/images/amenities-garden.jpg";
import agreementSigning from "@/assets/images/agreement-signing.jpg";
import bankReception from "@/assets/images/bank-reception.jpg";
import backdropFabric from "@/assets/images/backdrop-fabric.jpg";
/* The same cloth, for the phone's shape of the residence-finder panel. A
   portrait frame with the fold running corner to corner, where the laptop's
   is landscape and folds across — see `FindResidences`. */
import backdropFabricPhone from "@/assets/images/backdrop-fabric-phone.jpg";
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
/* The commercial panel on /civil-contracts, in place of the stock office
   interior: a finished commercial block on a Bengaluru street. Supplied by
   the client at 1600px on the long edge, where the stock panels are 2400.

   Graded down off `commercial-street-block-ungraded.jpg`, which is kept
   beside it and is not imported:

     ffmpeg -i commercial-street-block-ungraded.jpg \
       -vf "curves=all='0/0 0.25/0.24 0.5/0.465 0.75/0.70 1/0.95'" \
       -q:v 2 commercial-street-block.jpg

   Ungraded, the worst line-sized patch under the phone's description read
   4.4:1 against the body ink — the one panel of the six under AA. The
   rolloff takes the sky and the road down and leaves the shadows: 4.7:1
   there, in line with the other five, and 13:1 under the desktop heading.
   Measure before changing it — see the note on `undertake` in
   `app/globals.css`. */
import commercialStreetBlock from "@/assets/images/commercial-street-block.jpg";
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
/* The last stage of a contract on /civil-contracts — the handover.
   Supplied by the client: the couple whose house it is, reading the
   drawings with the engineer at the site table. */
import handoverFamilyEngineer from "@/assets/images/handover-family-engineer.jpg";
import homeDusk from "@/assets/images/home-dusk.jpg";
import homeScrollEnd from "@/assets/images/home-scroll-end.jpg";
import homeScrollPoster from "@/assets/images/home-scroll-poster.jpg";
import homeLawn from "@/assets/images/home-lawn.jpg";
import industrialEngineer from "@/assets/images/industrial-engineer.jpg";
import institutionCampus from "@/assets/images/institution-campus.jpg";
import institutionHospital from "@/assets/images/institution-hospital.jpg";
/* The industrial panel on /civil-contracts, in place of the stock
   warehouse aisle: a finished PEB shed, its structure and its floor both
   on show, which is what that panel is about. Supplied by the client at
   1600px on the long edge, where the stock panels are 2400.

   Ungraded, unlike its neighbour on panel 01: a white floor that fills two
   thirds of the frame still measures 8.7:1 against white and 5.4:1 against
   the body ink under the phone's description — the best of the six — because
   what the description sits on is the scrim, and the floor is behind it. */
import industrialShedFloor from "@/assets/images/industrial-shed-floor.jpg";
import interiorFamily from "@/assets/images/interior-family.jpg";
import interiorLiving from "@/assets/images/interior-living.jpg";
/* The landscaping panel on /civil-contracts. Supplied by the client, and
   the one photograph here that is not stock: 1376px on the long edge where
   the other five panels are 2400, so it is the softest of the six on a wide
   window. Replace it with a larger copy of the same scene if one exists. */
import landscapeGardenPath from "@/assets/images/landscape-garden-path.jpg";
import legacyPoster from "@/assets/images/legacy-poster.jpg";
/* The second stage of a contract on /civil-contracts — the legal and
   statutory check before anything is drawn. Supplied by the client.

   Graded down off `legal-verification-desk-ungraded.jpg`, which is kept
   beside it and is not imported:

     ffmpeg -i legal-verification-desk-ungraded.jpg \
       -vf "curves=all='0/0 0.25/0.20 0.5/0.385 0.75/0.575 1/0.86'" \
       -q:v 2 legal-verification-desk.jpg

   The stage's copy runs across the bottom left and the folder on the desk
   is directly under the right-hand column of points: ungraded, the top two
   of those read 3.2:1 and 4.0:1 against the body ink, both under AA. The
   rolloff takes the paper down and leaves the room: 4.6:1 at the worst
   line, 6.4:1 under the line below the title. Measure before changing it —
   see [the note on `size-a-photo-grade-by-measuring`] in the project's
   memory, and `.stages__scrim` in `app/globals.css`. */
import legalVerificationDesk from "@/assets/images/legal-verification-desk.jpg";
import meetingHands from "@/assets/images/meeting-hands.jpg";
import menuInterior from "@/assets/images/menu-interior.jpg";
import officeInterior from "@/assets/images/office-interior.jpg";
/* The four kinds of partner, for the band on the Joint Ventures page: the
   land, the family that holds it, the property already standing on it, and
   the people who build. See `PartnerPanels`. */
import partnerBungalow from "@/assets/images/partner-bungalow.jpg";
import partnerLandHolding from "@/assets/images/partner-land-holding.jpg";
import partnerPlansSite from "@/assets/images/partner-plans-site.jpg";
/* The six reasons to partner, for the accordion further down the same page:
   the fifty years, the crew that built them, what has been built, the city it
   was built in, a building settled into it, and the family living in one. Each
   is read both as a narrow slat and as a full panel, so all six are
   compositions that survive a hard vertical crop. See `ReasonPanels`. */
import fiftyYearsLegacy from "@/assets/images/fifty-years-legacy.jpg";
import fiftyYearsLegacySlat from "@/assets/images/fifty-years-legacy-slat.jpg";
import masonBrickwork from "@/assets/images/mason-brickwork.jpg";
import residentialTowers from "@/assets/images/residential-towers.jpg";
import bengaluruMarket from "@/assets/images/bengaluru-market.jpg";
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
/* The residential panel on /civil-contracts. Supplied by the client: a
   finished private residence at dusk, lit, from the street. It replaces
   `homeDusk` there, which the closing call to action on /residential also
   uses — so the section no longer shares a photograph with another page.
   1376px on the long edge, where the stock panels are 2400. */
import villaStreetDusk from "@/assets/images/villa-street-dusk.jpg";
import towersGlass from "@/assets/images/towers-glass.jpg";
import villaPool from "@/assets/images/villa-pool.jpg";
import warehouseAisle from "@/assets/images/warehouse-aisle.jpg";

/* The phone home page's hero cycles through these four, one per build type
   the company is known for: the completed apartment towers, a development
   still on the boards, a private residence, and a commercial block. Two of
   them — Vijay Aqua Green and Vijaya Surya — are Vijaya's own, which is why
   they carry the name on the building and why the crop below must not cut
   the signage off. See `HomeHeroPhone`. */
import towersLawn from "@/assets/images/towers-lawn.jpg";
import vijayAquaGreen from "@/assets/images/vijay-aqua-green.jpg";
import courtyardHouse from "@/assets/images/courtyard-house.jpg";
import vijayaSurya from "@/assets/images/vijaya-surya.jpg";

export const img = {
  aerialLand,
  amenitiesGarden,
  agreementSigning,
  backdropFabric,
  backdropFabricPhone,
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
  commercialStreetBlock,
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
  handoverFamilyEngineer,
  homeDusk,
  homeLawn,
  homeScrollEnd,
  homeScrollPoster,
  industrialEngineer,
  industrialShedFloor,
  institutionCampus,
  institutionHospital,
  interiorFamily,
  interiorLiving,
  landscapeGardenPath,
  legacyPoster,
  legalVerificationDesk,
  meetingHands,
  menuInterior,
  officeInterior,
  partnerBungalow,
  partnerLandHolding,
  fiftyYearsLegacy,
  fiftyYearsLegacySlat,
  masonBrickwork,
  residentialTowers,
  bengaluruMarket,
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
  villaStreetDusk,
  villaPool,
  warehouseAisle,
  towersLawn,
  vijayAquaGreen,
  courtyardHouse,
  vijayaSurya,
} as const;

/** Descriptive alt text, kept next to the images so it never drifts. */
export const alt = {
  aerialLand: "Aerial view of a residential development laid out across open land",
  amenitiesGarden:
    "A planted garden walk winding between mature trees and low flowering beds, a pale concrete wall behind",
  agreementSigning:
    "Two people either side of a desk, one signing an agreement while the other holds the papers steady",
  backdropFabric:
    "Soft folds of cream fabric, lit from one side",
  backdropFabricPhone:
    "A single deep fold of cream fabric running corner to corner, lit from above",
  backdropFooter:
    "A living room open to a planted courtyard through full-height glass, a large Krishna pichwai hung above the sofa",
  backdropHibiscus:
    "Red hibiscus blooms against a soft cream ground",
  backdropInterior:
    "A living and dining room at dusk, lit warmly, looking out over the city",
  bankReception: "Banking hall interior with a curved reception counter",
  blueprintCraft: "Hands marking up a construction drawing at a desk",
  cityNight: "Long-exposure traffic trails running through a city at night",
  commercialStreetBlock:
    "A completed four-storey commercial building in brick, stone and glass on a Bengaluru street, lit offices behind its ground-floor glazing and traffic passing in front",
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
  handoverFamilyEngineer:
    "A couple and a site engineer at a table on site, reading the drawings together with a model of the house in front of them and the building going up behind",
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
  industrialShedFloor:
    "The inside of a completed pre-engineered industrial shed, its steel frame and roof lights overhead and a finished, sealed floor running the length of it",
  institutionHospital: "Hospital building entrance and approach road",
  interiorFamily: "Family living room with a dog resting by the sofa",
  interiorLiving: "Open-plan living and dining space in a completed apartment",
  landscapeGardenPath:
    "A paved garden path between flowering beds and clipped hedges, frangipani in bloom overhead, with lawn, a lily pond and terraced fields beyond",
  legacyPoster: "A building frame and tower crane silhouetted against the sunset",
  legalVerificationDesk:
    "Property papers being read across a desk: a folder and pen, a model house, a gavel and a set of scales",
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
    "Vijaya Enterprises' fifty-year mark: a gold '50 Years' set on cream, the digits cut out over rooms and a valley view, the company logo and 'Since 1973' beneath and 'Where living becomes legacy' alongside",
  masonBrickwork:
    "A mason's hands bedding a brick down onto fresh mortar against the line, trowel still in the other hand",
  residentialTowers:
    "Residential towers in Bengaluru seen from the foot of the block, their balconies stepping away up the elevation",
  bengaluruMarket:
    "A Bengaluru street market in full swing, a fruit seller at her cart and shoppers passing under the trees",
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
  villaStreetDusk:
    "A completed private residence at dusk seen from the street: three storeys in stone, timber and glass, the rooms and the planting lit, and a car standing in the porch",
  towersGlass: "Glass office towers seen from street level",
  villaPool: "Completed villa with a swimming pool and terrace",
  warehouseAisle: "Aisle inside a completed warehouse facility",
  towersLawn:
    "Completed white apartment towers stepping along a tree-lined road, an open lawn in the foreground",
  vijayAquaGreen:
    "Vijay Aqua Green at sunset, its low blocks running back along the road behind a planted verge",
  courtyardHouse:
    "A narrow four-storey house with timber screens and trailing greenery over each balcony, birds crossing the sky above",
  vijayaSurya:
    "Vijaya Surya, a glass-fronted commercial building with a yellow entrance portal, the name above the top floor",
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
