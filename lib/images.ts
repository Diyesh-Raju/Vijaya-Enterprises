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
/* The enquiry form on /contact is set on this: a stone-walled entry court at
   dusk, lit from the wall. It is chosen for what it does behind glass rather
   than for what it shows — the frosted panel over it needs something with
   large, slow areas of tone and one warm light source, because a busy
   photograph blurred is grey mush and a flat one gives the frost nothing to
   catch. */
import backdropCourtyard from "@/assets/images/backdrop-courtyard.jpg";
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
/* The four phone photographs for the `Undertakings` panels on
   /civil-contracts, supplied by the client on 2026-09-14. They are upright
   where the panel photographs they stand in for are landscape, which is the
   whole reason they exist: a phone panel is a tall frame, and a 16:9 picture
   in it keeps a band across the middle and loses the building's feet and its
   sky. They are never served to a laptop — `Undertakings` picks between the
   two in a `<picture>` — so they are sized for a phone and no larger. */
import commercialCornerDuskPhone from "@/assets/images/commercial-corner-dusk-phone.jpg";
import commercialStreetBlock from "@/assets/images/commercial-street-block.jpg";
/* The same block again, upright, for the portrait card standing in front of
   that panel — the one place on the section where the card is not a crop of
   its own backdrop. Supplied by the client at 1024 × 1536; the card is 4:5,
   so it keeps the photograph's whole width. Nothing is written over it, so
   it is not graded. */
import commercialStreetBlockPortrait from "@/assets/images/commercial-street-block-portrait.jpg";
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
/* Vijaya Luxo, Rajarajeshwari Nagar. The dusk render was supplied by the
   client on its own, at 1600px, for the Residential page's hero — it is the
   opening frame there and the project's card and page hero besides. The
   night view is cut from the brochure's closing page (see `lib/brochures.ts`
   for how the leaves were rendered), with the approval seals that sit in
   the sky on that page cropped away. */
import vijayaLuxoDusk from "@/assets/images/vijaya-luxo-dusk.jpg";
import vijayaLuxoNight from "@/assets/images/vijaya-luxo-night.jpg";
/* Vijaya Aquagreen, Somshettyhalli. The architect's render off the
   brochure's "perfect balance" spread; the finished building itself is
   `vijayAquaGreen`, further down. */
import vijayaAquagreenRender from "@/assets/images/vijaya-aquagreen-render.jpg";
/* The two management portraits on /our-legacy — the founder and the
   managing director. Vijaya's own, like `tudorApartments`; see
   `Management`. */
import hbShivakumar from "@/assets/images/hb-shivakumar.jpg";
import mahanteshNelavagi from "@/assets/images/mahantesh-nelavagi.jpg";
/* The last stage of a contract on /civil-contracts — the handover.
   Supplied by the client: the couple whose house it is, reading the
   drawings with the engineer at the site table. */
import handoverFamilyEngineer from "@/assets/images/handover-family-engineer.jpg";
import homeDusk from "@/assets/images/home-dusk.jpg";
/* The home hero's two stills, cut from the towers walkthrough by the commands
   in `assets/video-source/README.md`, and always from the same render as the
   clip beside them — they are cross-faded against it on the page, so a still
   cut from a different take would show as a jump.

   The two earlier cuts' stills are all still here: `home-scroll-short-*.jpg`
   for the short cut this replaced, `home-scroll-*.jpg` for the long one
   before it. Going back to either is this pair of imports and the two paths
   in `video` below. */
import homeScrollEnd from "@/assets/images/home-scroll-towers-end.jpg";
import homeScrollPoster from "@/assets/images/home-scroll-towers-poster.jpg";
import homeLawn from "@/assets/images/home-lawn.jpg";
import industrialEngineer from "@/assets/images/industrial-engineer.jpg";
import institutionCampus from "@/assets/images/institution-campus.jpg";
import institutionHospital from "@/assets/images/institution-hospital.jpg";
import institutionHospitalDrivePhone from "@/assets/images/institution-hospital-drive-phone.jpg";
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
import landscapeWallPlantingPhone from "@/assets/images/landscape-wall-planting-phone.jpg";
/* The Our Legacy hero until 2026-09-11: a model of a building being set
   down on its site plan with a city behind it. No longer imported by
   anything — kept so the hero can go back to it by changing one line in
   `LegacyHero`. */
import legacyModelCity from "@/assets/images/legacy-model-city.jpg";
/* The Our Legacy hero, behind the opening aperture. Supplied by the
   client: two men in an office, standing in front of the model of a tower,
   with its drawings on the desk beside them and the city through the glass.
   1600 × 900, where a full-screen photograph here is wanted at 3840 — the
   softest hero on the site on a wide or dense screen. See `LegacyHero`. */
import legacyHeroOffice from "@/assets/images/legacy-hero-office.jpg";
/* The same two men, same room, shot upright — for the phone, where the
   landscape frame above keeps about a quarter of its width and cuts both of
   them off at the shin. 900 × 1600, so a tall phone frame takes it whole.
   `LegacyHero` picks between the two in a `<picture>`. */
import legacyHeroOfficePhone from "@/assets/images/legacy-hero-office-phone.jpg";
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
/* The four chapters of the Vijaya story, in the order they are told: a crane
   against a burning sky, a welder on the steel at dusk, the city lit from
   above, and a finished room someone lives in. All four are new to the site
   and used nowhere else — see `LegacyChapters` for the note on choosing
   them. */
import storyCraneDawn from "@/assets/images/story-crane-dawn.jpg";
import storySteelWelder from "@/assets/images/story-steel-welder.jpg";
import storyCityNight from "@/assets/images/story-city-night.jpg";
import storyLivingRoom from "@/assets/images/story-living-room.jpg";
/* The ground the whole story band is told against — a house at dusk over
   still water, held behind the four chapters while they stack up over it.
   Supplied by the client at 1072px on the long edge, where a backdrop this
   size normally wants 4K; it survives because it is a soft render with no
   fine detail in it and it never shows unscrimmed. See `LegacyChapters`.

   Graded down off `story-ground-dusk-ungraded.jpg`, which is kept beside it
   and is not imported:

     ffmpeg -i story-ground-dusk-ungraded.jpg \
       -vf "curves=all='0/0 0.25/0.235 0.5/0.44 0.75/0.615 1/0.79'" \
       -q:v 2 story-ground-dusk.jpg

   A rolloff on the TOP end, which is the opposite of the usual one here:
   the ink on this band is light, so it is the photograph's highlights that
   decide it, not its shadows, and the highlight is the sun still in the
   cloud over the water. Ungraded, the year markers measured 2.5:1 against
   the 3:1 a display face needs — but only past about 1600px, where the
   shell stops growing, centres, and walks the marker column inward off the
   scrim's edge weight and onto the brightest quarter of the frame, so a
   laptop never showed it. Graded, the worst display type at any width from
   1024 to 2560 is 4.0:1 and the worst small type is 5.3:1. Re-measure
   before touching the grade or the scrim — see `.legacy-ground__fade` in
   `app/globals.css`. */
import storyGroundDusk from "@/assets/images/story-ground-dusk.jpg";
import siteTeam from "@/assets/images/site-team.jpg";
/* The "Trust You Can Check" panel on /joint-ventures, in place of
   `familyLivingRoom`: an agreement shaken on at a site, the frame going up
   behind it. Supplied by the client at 1066 × 1600 — portrait, where the
   open panel is nearer square, so the crop is the photograph's full width
   and the `focus` on that page chooses which two-thirds of its height. */
import siteHandshakePlans from "@/assets/images/site-handshake-plans.jpg";
import slabDusk from "@/assets/images/slab-dusk.jpg";
import steelRebar from "@/assets/images/steel-rebar.jpg";
import towerOccupied from "@/assets/images/tower-occupied.jpg";
/* The residential panel on /civil-contracts. Supplied by the client: a
   finished private residence at dusk, lit, from the street. It replaces
   `homeDusk` there, which the closing call to action on /residential also
   uses — so the section no longer shares a photograph with another page.
   1376px on the long edge, where the stock panels are 2400. */
import villaLitDrivePhone from "@/assets/images/villa-lit-drive-phone.jpg";
import villaStreetDusk from "@/assets/images/villa-street-dusk.jpg";
/* The same house again, upright, for the portrait card in front of that
   panel. Supplied by the client at 896 × 1200; the card is 4:5, so it keeps
   the photograph's whole width. Nothing is written over it, so it is not
   graded. */
import villaStreetDuskPortrait from "@/assets/images/villa-street-dusk-portrait.jpg";
import towersGlass from "@/assets/images/towers-glass.jpg";
/* Vijaya's own — a completed Tudor-framed apartment block, and the one
   picture on the site that is not stock. It carried the arch on /our-legacy
   until the garden below took it (2026-09-12), and is kept for going back to. */
import tudorApartments from "@/assets/images/tudor-apartments.jpg";
/* The five projects in the carousel on /joint-ventures. Landscape, and each
   card is cut to its own file's shape rather than to a shared one, so every
   picture shows whole — see `ProjectCarousel`. They are renders and
   photographs of Vijaya's own buildings, supplied by the client on
   2026-09-12; only the second names itself, on the building. */
import projectTudorCourt from "@/assets/images/project-tudor-court.jpg";
import projectVijayaLuxo from "@/assets/images/project-vijaya-luxo.jpg";
import projectStonePlinth from "@/assets/images/project-stone-plinth.jpg";
import projectTimberCorner from "@/assets/images/project-timber-corner.jpg";
import projectLawnTowers from "@/assets/images/project-lawn-towers.jpg";
/* The ground under the brochures on /our-legacy. It is the section's whole
   background and is never cropped — see the note in `app/our-legacy/page.tsx`
   — so what the band can be is set by the file's own 16:9. */
import airportDusk from "@/assets/images/airport-dusk.jpg";
/* The arch on /our-legacy — a lit approach at sunset, the shrine on one side
   and the house on the other. Upright to begin with, which the 4:5 arch wants:
   it keeps the photograph's whole width and trims only the sky and the near
   foreground. See `WhoWeBuildFor`. */
import gardenShrineDusk from "@/assets/images/garden-shrine-dusk.jpg";
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
  backdropCourtyard,
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
  commercialCornerDuskPhone,
  commercialStreetBlock,
  commercialStreetBlockPortrait,
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
  vijayaLuxoDusk,
  vijayaLuxoNight,
  vijayaAquagreenRender,
  hbShivakumar,
  handoverFamilyEngineer,
  mahanteshNelavagi,
  homeDusk,
  homeLawn,
  homeScrollEnd,
  homeScrollPoster,
  industrialEngineer,
  industrialShedFloor,
  institutionCampus,
  institutionHospital,
  institutionHospitalDrivePhone,
  interiorFamily,
  interiorLiving,
  landscapeGardenPath,
  landscapeWallPlantingPhone,
  legacyModelCity,
  legacyHeroOffice,
  legacyHeroOfficePhone,
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
  storyCraneDawn,
  storySteelWelder,
  storyCityNight,
  storyLivingRoom,
  storyGroundDusk,
  siteHandshakePlans,
  siteTeam,
  slabDusk,
  steelRebar,
  towerOccupied,
  towersGlass,
  villaLitDrivePhone,
  villaStreetDusk,
  villaStreetDuskPortrait,
  tudorApartments,
  gardenShrineDusk,
  airportDusk,
  projectTudorCourt,
  projectVijayaLuxo,
  projectStonePlinth,
  projectTimberCorner,
  projectLawnTowers,
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
  backdropCourtyard:
    "A stone-walled entry courtyard at dusk, a tree and planting to one side and a lit passage through to a garden beyond",
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
  commercialCornerDuskPhone:
    "A completed commercial building on a street corner at dusk, timber-slatted and glazed with planting up its flank, the offices lit and traffic passing in front",
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
    "The lamplit living room of a completed home, softly out of focus",
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
  vijayaLuxoDusk:
    "Vijaya Luxo at dusk: a four-storey white block with timber-clad and black stone panels, glass-railed balconies lit from within, the name on a timber fin at the corner and cars on the wet road in front",
  vijayaLuxoNight:
    "Vijaya Luxo at night, every window lit, the timber fin carrying the name and the planted compound wall below",
  vijayaAquagreenRender:
    "Architectural view of Vijaya Aquagreen: three low blocks in white and timber stepping back along the road behind a planted verge, the entrance gate in the foreground",
  hbShivakumar:
    "Sri H. B. Shivakumar, founder of Vijaya Enterprises, in a dark suit and striped tie",
  mahanteshNelavagi:
    "Mahantesh B. Nelavagi, Managing Director of Vijaya Enterprises, seated in his office",
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
  institutionHospitalDrivePhone:
    "A hospital seen from the head of its approach road, the entrance canopy ahead, an ambulance at the kerb and flower beds either side of the drive",
  interiorFamily: "Family living room with a dog resting by the sofa",
  interiorLiving: "Open-plan living and dining space in a completed apartment",
  landscapeGardenPath:
    "A paved garden path between flowering beds and clipped hedges, frangipani in bloom overhead, with lawn, a lily pond and terraced fields beyond",
  landscapeWallPlantingPhone:
    "A finished garden bed of broad-leaved planting along a dressed stone wall, lit from the wall, frangipani in bloom above it and mown lawn and paving in front",
  legacyHeroOffice:
    "Two men in dark suits standing in an office in front of a scale model of a residential tower, rolled drawings on the desk beside them and the city through the windows behind",
  legacyHeroOfficePhone:
    "Two men in dark suits standing full length in an office, a scale model of a residential tower on the desk behind them, rolled drawings beside it and the city through the windows",
  legacyModelCity:
    "Two hands setting a model of a low glass-fronted building down on its site plan, the model lit from within, a city skyline at sunset behind it",
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
    "Living room of a completed Vijaya home in the evening, a fire in the hearth, lit shelves behind the sofa and the dining room through the doorway",
  residentialLivingDusk:
    "A warmly lit living room at dusk, floor-to-ceiling glass open to the city lights, with a Ganesha idol, marigolds and embroidered cushions",
  storyCraneDawn:
    "A tower crane and two workers in silhouette against a burning orange sky, reinforcement bars rising around them",
  storySteelWelder:
    "A welder at work on a steel frame at dusk, sparks falling from the torch, a second worker on the beam above",
  storyCityNight:
    "An Indian city from the air at night, apartment towers and a lit arterial road running away into the haze",
  storyLivingRoom:
    "A finished contemporary living room, panelled navy feature wall, filament pendants and daylight through sheer curtains",
  storyGroundDusk:
    "A low modern house of glass and stone at dusk, its roof reaching out over a still infinity pool that runs to a lake and distant hills",
  siteHandshakePlans:
    "Two colleagues greeting a client with a handshake on a construction site, a concrete frame and tower cranes behind them and drawings, a hard hat and a calculator on the table in front",
  siteTeam: "Site engineers and workers walking a large concrete deck",
  slabDusk:
    "Workers silhouetted at dusk against a pink sky, on the reinforcement cage of a floor going up",
  steelRebar: "Reinforcement steel being placed on an active construction site",
  towerOccupied:
    "A completed apartment block at night with its windows lit, the building in use",
  villaLitDrivePhone:
    "A completed private residence at dusk seen from the street, stone and timber with the rooms and the planting lit, and a car standing on the drive",
  villaStreetDusk:
    "A completed private residence at dusk seen from the street: three storeys in stone, timber and glass, the rooms and the planting lit, and a car standing in the porch",
  towersGlass: "Glass office towers seen from street level",
  tudorApartments:
    "A completed four-storey apartment block with a tiled gabled roof and black timber framing over white render, seen from the road",
  gardenShrineDusk:
    "A lit stone path curving through a landscaped garden at sunset, a Ganesha shrine on a fountain plinth under the trees and a lamp-lit residence beyond",
  airportDusk:
    "An airport at dusk from above: aircraft standing at the gates along a lit terminal, one on approach over the runways, and a city skyline on the horizon",
  projectTudorCourt:
    "A four-storey apartment block at dusk, its gabled roofs tiled and its façade framed in dark timber over cream render, palms around a paved forecourt",
  projectVijayaLuxo:
    "Vijaya Luxo at dusk from the street, a white and dark-stone façade with timber panelling, balconies lit and the name on the boundary wall",
  projectStonePlinth:
    "A white apartment block in daylight, its balconies banded in grey and terracotta above a rough stone plinth, lawns and palms around it",
  projectTimberCorner:
    "A timber-clad residential block on a street corner at dusk, its balconies and planting lit, traffic passing on the road in front",
  projectLawnTowers:
    "Four white residential towers under a clear sky, circular canopies at their tops, seen across an open lawn",
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
  /* The towers walkthrough, since 2026-09-15, as the ladder `ScrollHero`
     climbs: the bridge is on screen first, in seconds; the others are
     brought up behind it and shown only once this machine has proved it can
     seek them inside a frame. All four are cut from the same 60fps master
     with a keyframe every second frame and no B-frames, because the hero
     seeks to an arbitrary time on every animation frame and the keyframe
     interval is what decides whether the scrub feels attached to the wheel.
     The top one is the render at its own 3840×2160 (since 2026-09-16); the
     3200 file below it was the top until then and stays as the step a
     hardware decoder that cannot seek 4K in time is given instead.
     `assets/video-source/README.md` has the settings and the measurements.

     There is no phone file. The phone unmounts the hero altogether
     (`HomeHeroPhone`), so the `-mobile` encodes the earlier cuts carry were
     never played by anything.

     New names rather than overwriting: `/video/` is served with a 30-day
     `max-age` (`next.config.ts`), so a browser holding an old file would
     go on showing it. */
  homeScrollTiers: {
    bridge: "/video/home-scroll-towers-720.mp4",
    mid: "/video/home-scroll-towers-1080.mp4",
    hq: "/video/home-scroll-towers-3200.mp4",
    uhd: "/video/home-scroll-towers-2160.mp4",
  },
  heroDesktop: "/video/hero.mp4",
  heroMobile: "/video/hero-mobile.mp4",
  legacyDesktop: "/video/legacy.mp4",
  legacyMobile: "/video/legacy-mobile.mp4",
  craft: "/video/craft.mp4",
} as const;
