import { Marquee } from "@/components/ui/marquee";
import { Sparkles } from "@/components/ui/sparkles";
import { trustedBy, type TrustedOrg } from "@/lib/site";

/**
 * The client band that opens the Commercial Contracts page, under the hero.
 *
 * A replica of the "Trusted by experts / Used by the leaders" band on
 * obsidian-blade.vercel.app/commercial, asked for line by line: the two-tone
 * heading in Arial at 500, the indigo/violet ground, and the band beneath it
 * — a violet halo rising from the bottom, a white dome laid over it so only a
 * crescent shows, and a field of fine indigo dots over the whole thing.
 *
 * Deliberately off this site's palette and type. Every colour and length in
 * here is the reference's own, read off the live page rather than guessed;
 * `#a78bfa`, `#6366f1`, `indigo-900` and `zinc-900` are all theirs. If this
 * is ever brought back onto Vijaya's navy and brass, that is the list to
 * change, and `Sparkles` takes its colour as a prop for exactly that reason.
 *
 * The one departure the brief asked for: their five names sit bare in a
 * five-column grid, ours are ten logos in white cards on a carousel.
 */
function Tile({ org }: { org: TrustedOrg }) {
  return (
    <li className="flex shrink-0">
      <div className="flex w-[13.5rem] flex-col items-center rounded-2xl border border-indigo-900/10 bg-white px-6 py-7 shadow-[0_1px_2px_rgba(24,24,27,0.04),0_10px_28px_-14px_rgba(49,46,129,0.28)] sm:w-[15rem] sm:px-8">
        {/* A well of one fixed height, so ten marks that range from a 7:1
            lockup to a square seal share an optical baseline across the row. */}
        <span className="trusted-well flex items-center justify-center">
          {org.logo ? (
            /* A plain <img>, not next/image: the row holds two copies of
               every logo for the marquee, they are ~60px tall, and half of
               them are SVG — there is nothing for the optimiser to win here.
               `width`/`height` carry the intrinsic size so no card reflows
               as the files land. */
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={org.logo}
              alt={`${org.name} logo`}
              width={org.w}
              height={org.h}
              // Not lazy: the row is a CSS transform, not a scroll, so most
              // of the strip sits outside the viewport with no scroll event
              // to bring it in, and the cards would pop as the marks arrive.
              loading="eager"
              fetchPriority="low"
              decoding="async"
              // Drawn from the height, so a wide wordmark and a square crest
              // each keep their own proportions; `--logo-scale` pulls the
              // whole row down together on narrow screens.
              style={{ height: `calc(${org.height}px * var(--logo-scale, 1))` }}
              className="w-auto max-w-none object-contain"
            />
          ) : (
            /* No logo file yet: the short form, set in the same type as the
               captions, so the row keeps its rhythm rather than carrying an
               empty card. */
            <span className="text-xl font-semibold text-zinc-900">{org.mark}</span>
          )}
        </span>

        {/* The reference's own caption type — 14/600, sentence case, zinc.
            Two lines' worth of room reserved whether or not the name needs
            it, so every card in the row is the same height. */}
        <span className="mt-4 flex min-h-[2.6em] items-start text-center text-sm font-semibold leading-[1.3] text-zinc-900">
          {org.name}
        </span>
      </div>
    </li>
  );
}

export function TrustedExperts() {
  return (
    <section className="relative w-full overflow-hidden bg-white pb-4 font-[Arial,Helvetica,sans-serif] sm:pb-6">
      <div className="relative z-10 mx-auto mt-12 w-full max-w-3xl px-6 sm:mt-16">
        {/* The base rules put every heading in Fraunces, at 400, tracked in
            by -0.02em. This band is none of those, so the three are named
            back out here rather than the heading being demoted to a `div` —
            it is the page's second heading and belongs in the outline. */}
        <h2 className="text-center font-[Arial,Helvetica,sans-serif] text-3xl font-medium leading-tight tracking-normal md:text-5xl lg:text-6xl">
          <span className="text-indigo-900">Trusted by experts.</span>
          <br />
          <span className="text-zinc-900">Used by the leaders.</span>
        </h2>
      </div>

      {/* Full-bleed, unlike the reference's five-column grid — a carousel has
          to run edge to edge or the loop reads as a list that twitches. Above
          the band below, which is pulled up under it. */}
      <div className="relative z-10 mt-14">
        <Marquee speed={68} className="trusted-tile-row">
          <ul className="flex shrink-0 items-stretch gap-5 pr-5 sm:gap-6 sm:pr-6">
            {trustedBy.map((org) => (
              <Tile key={org.mark} org={org} />
            ))}
          </ul>
        </Marquee>
      </div>

      {/* The band: three layers, all the reference's. */}
      <div className="relative -mt-10 h-[13rem] w-full overflow-hidden [mask-image:radial-gradient(60%_60%,white,transparent)] sm:-mt-12 sm:h-[16rem]">
        {/* 1. A violet halo rising from the bottom edge. */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_center,#a78bfa,transparent_70%)] opacity-40" />
        {/* 2. A white ellipse twice the page wide, laid over the halo's lower
               half so only a crescent of it shows. Its top border is the
               hairline arc that reads as a horizon. */}
        <div className="absolute -left-1/2 top-1/2 aspect-[1/0.7] w-[200%] rounded-[100%] border-t border-indigo-900/10 bg-white" />
        {/* 3. The dots, over both, masked to fade out at the edges. */}
        <div className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(70%_70%,white,transparent_98%)]">
          <Sparkles className="h-full w-full" />
        </div>
      </div>
    </section>
  );
}
