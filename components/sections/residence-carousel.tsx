import { CoverflowCarousel } from "@/components/ui/coverflow-carousel";
import { img, alt } from "@/lib/images";

/**
 * The coverflow deck under the residential block on the home page. Images
 * only — no captions under the cards.
 *
 * The site's own residential photography, drawn from `lib/images` like every
 * other picture here. The deck used to run on the stock images its template
 * shipped with, fetched from two third-party hosts — which meant a host that
 * was slow, blocked or gone was twelve broken cards on the home page, and
 * two origins the CSP had to hold open. These are static imports, so they go
 * through the optimiser and arrive as AVIF at the card's own width.
 *
 * It runs full-bleed rather than inside a `Container` — the deck fans out past
 * the page gutters, and clipping it at the container edge boxes it in.
 */
const slides = [
  { src: img.haraVijayaHeights, alt: alt.haraVijayaHeights },
  { src: img.residentialInterior, alt: alt.residentialInterior },
  { src: img.villaPool, alt: alt.villaPool },
  { src: img.balconyFamily, alt: alt.balconyFamily },
  { src: img.haraVijayaConcept, alt: alt.haraVijayaConcept },
  { src: img.interiorLiving, alt: alt.interiorLiving },
  { src: img.homeLawn, alt: alt.homeLawn },
  { src: img.balconyFamilyTower, alt: alt.balconyFamilyTower },
  { src: img.haraVijayaHeightsHero, alt: alt.haraVijayaHeightsHero },
  { src: img.interiorFamily, alt: alt.interiorFamily },
  { src: img.homeDusk, alt: alt.homeDusk },
  { src: img.balconyFamilyEvening, alt: alt.balconyFamilyEvening },
];

export function ResidenceCarousel() {
  return (
    <section className="relative isolate overflow-hidden bg-white pb-20 sm:pb-24 lg:pb-28">
      <CoverflowCarousel
        slides={slides}
        label="Residences"
        // Card width sets everything else — pitch, depth and the lens
        // all derive from it. At roughly a fifth of the viewport the
        // deck shows seven cards, which is the fan the template has.
        // Holding it to `vw` keeps that seven across screen sizes; the
        // floor stops the cards shrinking to stamps on a phone.
        cardWidth="clamp(190px, 22vw, 420px)"
        showNavigation
      />
    </section>
  );
}
