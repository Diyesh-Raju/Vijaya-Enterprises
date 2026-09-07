"use client";

import { useState, type ReactNode } from "react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";

export type IconCardItem = {
  title: string;
  body?: string;
  /**
   * The longer version, shown on the back of the card. Omit it and the card
   * simply does not flip — there is nothing behind it to turn to.
   */
  detail?: string;
  icon: ReactNode;
};

/**
 * Cards that turn over: an emblem, a title and a line on the front; the
 * fuller answer on the navy back.
 *
 * The flip mechanics live in `globals.css` under `.flip-card`, and the part
 * worth knowing before touching this file is that what *turns* a card is not
 * the same on every device. A mouse turns it by hovering and a keyboard by
 * focusing it, both of which the stylesheet handles on its own with no help
 * from here. A touch screen can do neither, so there a tap turns it — which
 * is the only reason this is a client component, and the only thing the
 * state below is for.
 *
 * The class it toggles is inert on a laptop: the stylesheet only honours
 * `is-flipped` where there is no hover to be had. So a mouse click still
 * does nothing but focus the card, exactly as it did before any of this.
 *
 * Written as a list rather than the definition list this used to be: a `dl`
 * may only nest one `div` between itself and its `dt`, and a flip needs two —
 * one for the perspective, one for the thing being rotated.
 */
export function IconCards({
  items,
  columns = 3,
  className,
}: {
  items: readonly IconCardItem[];
  columns?: 2 | 3;
  className?: string;
}) {
  return (
    <>
      {/* On a phone the set is medallions, not cards — see `IconOrbs`. */}
      <IconOrbs items={items} className={cn("desk:hidden", className)} />

      <ul
        className={cn(
          "hidden",
          // Two to a row at every width. It used to be one below `sm`, back
          // when a phone card carried both faces stacked and a pair of those
          // side by side would have been unreadable. The card turns now, so it
          // is only ever as wide as one face needs — and the six read as a set
          // rather than as six screens of scrolling. Everything below `sm` is
          // sized down to match; from `sm` up the card is what it always was.
          "grid-cols-2 gap-3 sm:gap-5 desk:grid",
          columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2",
          className,
        )}
      >
        {items.map((item, index) => (
          <IconCard key={item.title} item={item} index={index} />
        ))}
      </ul>
    </>
  );
}

/**
 * The same six things, on a phone: a medallion each rather than a card.
 *
 * The cards are right where there is a row to put three of them in and a
 * pointer to turn them with. Stacked two-up on a 390px screen they are six
 * tall boxes over two screens of scrolling, and the section reads as a wall
 * of paragraphs rather than as six reasons.
 *
 * So here each one is a small disc: the emblem and the heading inside it,
 * and the line that was under the heading moved to the back. That is the
 * trade, and it is deliberate — a disc small enough to read as one of a set
 * cannot hold a sentence as well as a heading, and six headings in a tidy
 * grid say what the section is for at a glance in a way six paragraphs do
 * not.
 *
 * `detail` — the longer answer the laptop card turns to — is not shown at
 * this width. The medallion has one back and `body` is the version that
 * fits in it.
 *
 * The turn itself is the cards' own: same `.flip-card` machinery, same
 * `is-flipped` toggle, same reasons. Only the shape and what is on each
 * face differ.
 */
function IconOrbs({
  items,
  className,
}: {
  items: readonly IconCardItem[];
  className?: string;
}) {
  return (
    <ul className={cn("grid grid-cols-2 gap-x-4 gap-y-7", className)}>
      {items.map((item, index) => (
        <IconOrb key={item.title} item={item} index={index} />
      ))}
    </ul>
  );
}

function IconOrb({ item, index }: { item: IconCardItem; index: number }) {
  /* The disc turns if there is a line to turn to. `body` rather than
     `detail`: see the note above. */
  const flips = Boolean(item.body);
  const [flipped, setFlipped] = useState(false);

  return (
    <Reveal as="li" delay={(index % 2) * 70} className="flex justify-center">
      <div
        className={cn(
          "why-orb-shell",
          flips && "flip-card",
          flipped && "is-flipped",
        )}
        tabIndex={flips ? 0 : undefined}
        // No `role` and no `aria-pressed`, for the same reason as the cards:
        // both faces are in the accessibility tree whichever way the disc is
        // facing, so there is nothing behind the turn for a reader to miss.
        onClick={flips ? () => setFlipped((turned) => !turned) : undefined}
      >
        <div className="flip-card-inner">
          <div className="why-orb why-orb--front">
            <span className="why-orb__icon">{item.icon}</span>
            <h3 className="why-orb__title">{item.title}</h3>
            {flips && (
              <span aria-hidden="true" className="why-orb__cue">
                +
              </span>
            )}
          </div>

          {item.body && (
            <div className="why-orb why-orb--back flip-card-back">
              <p className="why-orb__body">{item.body}</p>
              {/* The way back out. Without it the only exit from the line is
                  a guess that tapping again returns. */}
              <span aria-hidden="true" className="why-orb__cue">
                &times;
              </span>
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}

/**
 * One card. Its own component purely so each keeps its own turned/not-turned
 * state — held in the parent it would have to be a set of indices, which is
 * more bookkeeping than a boolean per card.
 */
function IconCard({ item, index }: { item: IconCardItem; index: number }) {
  const flips = Boolean(item.detail);
  const [flipped, setFlipped] = useState(false);

  return (
    <Reveal as="li" delay={(index % 3) * 70}>
      <div
        className={cn(
          "h-full rounded-[1.125rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass-500 sm:rounded-[1.625rem]",
          flips && "flip-card",
          flipped && "is-flipped",
        )}
        tabIndex={flips ? 0 : undefined}
        // No `role` and no `aria-pressed`, deliberately. Both faces are in
        // the accessibility tree whichever way the card is facing —
        // `backface-visibility` hides a face from the eye and not from a
        // screen reader — so there is nothing here for a reader to operate
        // and nothing behind the turn for them to miss. Announcing a button
        // that reveals text already being read would be the worse of the
        // two.
        onClick={flips ? () => setFlipped((turned) => !turned) : undefined}
      >
        <div className="flip-card-inner">
          {/* Front */}
          <div className="relative flex h-full flex-col items-center rounded-[1.125rem] border-2 border-navy-600 bg-white/90 p-4 text-center touch:pb-7 sm:rounded-[1.625rem] sm:p-7 sm:touch:pb-8">
            {/* The emblem stands on its own — no frame, no medallion.
                Drawn a little larger than it was inside one, so losing
                the ring does not cost it its presence on the card. */}
            <span className="shrink-0 text-navy-800 [&>svg]:h-10 [&>svg]:w-10 sm:[&>svg]:h-14 sm:[&>svg]:w-14">
              {item.icon}
            </span>

            <h3 className="mt-3 font-display text-[0.9375rem] leading-snug text-navy-900 sm:mt-5 sm:text-[1.1875rem]">
              {item.title}
            </h3>
            {item.body && (
              <p className="mt-2 text-[0.75rem] leading-relaxed text-slate-body sm:mt-2.5 sm:text-[0.875rem]">
                {item.body}
              </p>
            )}

            {flips && <FlipHint className="text-navy-600" />}
          </div>

          {/* Back */}
          {item.detail && (
            <div className="flip-card-back relative flex h-full flex-col items-center justify-center rounded-[1.125rem] border-2 border-navy-900 bg-navy-900 p-4 text-center touch:pb-7 sm:rounded-[1.625rem] sm:p-7 sm:touch:pb-8">
              <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-brass-400 sm:text-[0.6875rem] sm:tracking-[0.24em]">
                {item.title}
              </p>
              <span
                aria-hidden="true"
                className="mt-3 block h-px w-8 bg-brass-500/70 sm:mt-4 sm:w-10"
              />
              <p className="mt-3 text-[0.75rem] leading-relaxed text-navy-100/85 sm:mt-4 sm:text-[0.875rem]">
                {item.detail}
              </p>

              {/* On this face too: it is what says the card can be sent back,
                  and without it the way out of the detail is a guess. */}
              <FlipHint className="text-brass-400/80" />
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}

/**
 * The word in the corner that says the card can be tapped.
 *
 * `touch:` only — a laptop turns the card by being pointed at, so the
 * instruction there would be both wrong and an unasked-for change to a page
 * that is finished. It is `aria-hidden` because it describes a gesture, not
 * content, and because a screen reader is already being read both faces.
 */
function FlipHint({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute bottom-2 right-2.5 hidden text-[0.5625rem] font-semibold uppercase tracking-[0.12em] touch:block sm:bottom-2.5 sm:right-3.5 sm:text-[0.625rem] sm:tracking-[0.16em]",
        className,
      )}
    >
      Click
    </span>
  );
}
