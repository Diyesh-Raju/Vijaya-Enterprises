import { CoverflowCarousel } from "@/components/ui/coverflow-carousel";

/**
 * The coverflow deck under the residential block on the home page. Images
 * only — no captions under the cards.
 *
 * ⚠️ These are the stock images the 21st.dev template ships with, standing in
 * until Vijaya's own project photography arrives. They are loaded from two
 * third-party hosts, which is why `next.config.ts` names those hosts in the
 * CSP `img-src` list. When the real photographs land: add them to
 * `assets/images`, register them in `lib/images.ts`, point the slides below at
 * them, and take both hosts back out of the CSP.
 *
 * It runs full-bleed rather than inside a `Container` — the deck fans out past
 * the page gutters, and clipping it at the container edge boxes it in.
 */
const R2 = "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/stock-images";
const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=640&h=640&fit=crop&q=70&auto=format`;

const slides = [
  {
    src: `${R2}/767d99bb371a54d0d36751e8cecae43c.jpg`,
    alt: "Diver silhouetted inside a sunset seascape shaped like a profile",
  },
  {
    src: `${R2}/821d815affa6496c39cbdeeec7a84603.jpg`,
    alt: "Double-exposure portrait blended with a city skyline at dusk",
  },
  {
    src: `${R2}/937438c560ada1c83317f2c11b3454b0.jpg`,
    alt: "Motion-blurred side-profile portrait against a deep orange backdrop",
  },
  {
    src: `${R2}/98f89cb9994f5c382ab964062c4039db.jpg`,
    alt: "Figure holding a racket that dissolves into a swirling cloud at dusk",
  },
  {
    src: `${R2}/ddcbee38be8b7274e19e132d7ab35b53.jpg`,
    alt: "Hand gesture with a cutout of a bird flying through the fingers",
  },
  {
    src: unsplash("1470071459604-3b5ec3a7fe05"),
    alt: "Fog rolling through a forested valley at first light",
  },
  {
    src: unsplash("1500534314209-a25ddb2bd429"),
    alt: "Sunlit dune ridge under a hard blue sky",
  },
  {
    src: unsplash("1441974231531-c6227db76b6e"),
    alt: "Sunlight breaking through a dense stand of trees",
  },
  {
    src: unsplash("1493246507139-91e8fad9978e"),
    alt: "Pastel abstract of coloured smoke against a pale ground",
  },
  {
    src: unsplash("1501785888041-af3ef285b470"),
    alt: "Mountain lake mirroring a ridgeline at dusk",
  },
  {
    src: unsplash("1465101162946-4377e57745c3"),
    alt: "Long exposure of light trails over a dark landscape",
  },
  {
    src: unsplash("1519681393784-d120267933ba"),
    alt: "Snow-covered peak lit by a cold morning sun",
  },
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
