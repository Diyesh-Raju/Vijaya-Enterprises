import Image, { type StaticImageData } from "next/image";

export type ContractStage = {
  /** `01` … `05`. Written out rather than derived so it can be read here. */
  step: string;
  title: string;
  body: string;
  image: StaticImageData;
  imageAlt: string;
};

/**
 * The stages of a contract, one photograph each, on screens that hand over
 * to one another as the page is scrolled.
 *
 * The arrangement is the reference's (`brixsa.webflow.io`, its featured
 * properties): every stage is a whole screen of photograph with a badge in
 * the top corner and the copy laid along the bottom edge — the title and
 * description at the left, the count at the right, where that page puts a
 * price.
 *
 * The changeover is the part worth writing down, because it is not a
 * slide. Each photograph is held to the *window* rather than to the panel
 * it belongs to, and the panel only decides how much of it may be seen. So
 * as a panel rides up the screen its picture does not move with it: it is
 * cut off from the bottom, while the picture underneath is uncovered from
 * the bottom edge in the place it will finally sit. Two stills, one wiping
 * over the other, at exactly the rate the page is scrolled.
 *
 * Nothing here runs on a clock, and there is no scroll listener, no
 * observer and no animation. `position: fixed` does the holding and
 * `clip-path` on the panel does the cutting — a fixed descendant is not
 * clipped by an ancestor's `overflow`, but it *is* clipped by its
 * `clip-path`, and neither one moves it. It is the same effect the
 * reference gets from `background-attachment: fixed`, kept in the DOM so
 * the photographs can still go through `next/image` and be served as AVIF
 * at the size the screen actually asks for.
 *
 * Below `lg`, and for anyone who has asked for less motion, each picture
 * goes back to sitting in its own panel and scrolling with it. Mobile
 * Safari treats a fixed element as a special case during momentum scroll
 * and the hand-over judders; the reference drops the effect at those
 * widths too, and reshapes the screens into squares. Same five stages,
 * same order, no travel.
 */
export function ContractStages({
  items,
  badge,
}: {
  items: readonly ContractStage[];
  badge: string;
}) {
  const total = String(items.length).padStart(2, "0");

  return (
    <div className="stages">
      {items.map((item) => (
        <article key={item.step} className="stages__panel">
          {/* The photograph. `stages__media` is the panel's own box and
              carries the clip; `stages__hold` is what is held to the
              window inside it. Two elements because one cannot both be
              the shape of the cut and be positioned against the window. */}
          <div className="stages__media">
            <div className="stages__hold">
              <Image
                src={item.image}
                alt={item.imageAlt}
                fill
                quality={85}
                sizes="100vw"
                placeholder="blur"
                className="object-cover"
              />
            </div>
          </div>

          {/* Shade for the copy. Inside the panel rather than inside the
              clip, so it travels with the words it is there for instead
              of staying behind with the picture. */}
          <div aria-hidden="true" className="stages__scrim" />

          <div className="stages__copy container-page">
            <p className="stages__badge">{badge}</p>

            <div className="stages__foot">
              <div className="stages__text">
                <h3 className="text-balance-head font-display text-[clamp(1.875rem,4vw,3.25rem)] leading-[1.08] text-white">
                  {item.title}
                </h3>
                <p className="mt-5 max-w-[42rem] text-[1.0625rem] leading-[1.8] text-navy-100/85">
                  {item.body}
                </p>
              </div>

              {/* Where the reference sets a price. It is the one thing on
                  the screen that says how far through the five you are —
                  a scrollbar cannot, because it is measuring the page. */}
              <p className="stages__count">
                <span className="font-display text-[2.25rem] leading-none tabular-nums text-white sm:text-[2.75rem]">
                  {item.step}
                </span>
                <span className="text-[0.9375rem] text-navy-100/70">
                  / {total}
                </span>
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
