import Image, { type StaticImageData } from "next/image";
import type { CSSProperties } from "react";
import { ScrollScrub } from "@/components/ui/scroll-scrub";

export type Undertaking = {
  /** Anchor for the deep links into this section (`#industrial`, …). */
  id?: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  image: StaticImageData;
  imageAlt: string;
};

/**
 * The five kinds of work we take on, one at a time, on a screen that holds
 * still while the page is scrolled through it.
 *
 * The arrangement is the template's (`files3.1`, `script.js`): the
 * photograph is the whole screen, and the same photograph again in a
 * portrait card standing in front of it, on a layer of its own above
 * every panel. The description is the addition
 * — it sits over the right of the screen, opposite the card, and comes
 * and goes on the scroll with the picture it belongs to.
 *
 * One changeover, and unlike the aperture that closes /residential it is
 * a single move rather than a sequence — everything below happens at
 * once, over a whole screen of scrolling:
 *
 *   · the next photograph wipes up from the bottom edge, coming off a
 *     1.35 zoom as it arrives, while the one it replaces pushes on to
 *     1.15 behind it;
 *   · the card wipes down from the top edge, against it;
 *   · both pictures pan downwards a little as they change over;
 *   · the rule under the description hands over to the next of the five;
 *   · the description leaves to the right as the move opens, and comes
 *     back a part at a time over the second half of it.
 *
 * Nothing here runs on its own clock, and no animation library is on the
 * page. Every animation is declared in `globals.css` under `.undertake`
 * and left `paused`; `ScrollScrub` writes progress through the track into
 * `--undertake` as a time, and each animation's delay is its own start
 * minus that. One number scrubs all five panels at once, forwards and
 * backwards, at exactly the rate the page is scrolled. The template runs
 * the same move from a GSAP timeline on the wheel, which is both a
 * dependency and a hijacked scroll; this keeps neither.
 *
 * Below the enhancement — anyone who has asked for less motion — the
 * track collapses and the five panels become five ordinary screens, each
 * its own photograph with its own card and description, in reading order.
 * Same content, no travel.
 */

/**
 * The clock, in scrub units. A panel HOLDs still, then MOVEs over to the
 * next one; five panels are five holds with four moves between them.
 *
 * `PER_SCREEN` is the only one of the three that is about scrolling
 * rather than about the sequence: it is how much of the clock one screen
 * of travel spends, and so it sets the pace of the whole thing. At 200 a
 * changeover takes a whole screen of scrolling — the template's 1.25
 * seconds, spent at the rate the page is read rather than at its own —
 * and a hold a little over half of one, which is long enough to read four
 * bullet points.
 *
 * MOVE cannot be changed here alone. The offsets *inside* a move are
 * written as literal milliseconds in `globals.css`, and both places say
 * 200 for the length of one. To make a changeover longer, lower
 * `PER_SCREEN` — that spends more scrolling on the same 200 units, and
 * the hold moves with it.
 */
const HOLD = 120;
const MOVE = 200;
const PER_SCREEN = 200;

/**
 * How long the scrub takes to catch up with the page, in seconds. Without
 * it the move stops dead on the frame the scrolling does, and a picture
 * caught half wiped in simply freezes. See `ease` in
 * `components/ui/scroll-scrub.tsx`.
 */
const EASE = 0.32;

export function Undertakings({ items }: { items: readonly Undertaking[] }) {
  const slot = HOLD + MOVE;
  // Five holds and four moves. The last panel's `--exit` lands on exactly
  // this, so the scrub runs out on the frame before it would start to
  // leave and the fifth picture is never taken off.
  const span = items.length * HOLD + (items.length - 1) * MOVE;
  // One screen of stage, and the rest of the track is travel to scrub that
  // screen through.
  const screens = 1 + span / PER_SCREEN;

  /* Both instants a panel is timed off are the start of a *move*: the one
     it leaves on, and the one it arrived on. Writing them as the same kind
     of instant is what lets every phase in the stylesheet be one literal
     offset, whether it belongs to the panel going or to the panel coming.

     Neither end needs a special case. The last panel's `--exit` is the end
     of the span, which the scrub reaches but never passes, so its picture
     is never taken off; the first panel's `--enter` is negative by a whole
     slot, which puts every part of its arrival behind the scrub before the
     scrub starts, and it is simply the picture the section opens on. */
  const clock = (index: number) => {
    const exit = index * slot + HOLD;
    return {
      "--exit": `${exit}ms`,
      "--enter": `${exit - slot}ms`,
    } as CSSProperties;
  };

  return (
    <ScrollScrub
      as="div"
      spanMs={span}
      variable="--undertake"
      ease={EASE}
      className="undertake"
      style={{ "--undertake-screens": String(screens) } as CSSProperties}
    >
      {/* The anchors for `#industrial` and its neighbours, which the home
          page links straight into. They are dropped down the track at the
          scroll positions where each panel has settled, and they cannot
          live inside a panel: pinned, all five panels are stacked on the
          same screen, so an anchor in one of them would scroll to the top
          of the track and show the first. */}
      {items.map((item, index) =>
        item.id ? (
          <span
            key={item.id}
            id={item.id}
            aria-hidden="true"
            className="undertake__anchor"
            style={
              {
                "--at": String((index * slot) / span),
                "--at-flow": String(index / items.length),
              } as CSSProperties
            }
          />
        ) : null,
      )}

      <div className="undertake__stage">
        {items.map((item, index) => (
          <div
            key={item.title}
            className="undertake__panel"
            style={
              {
                // Each panel paints over the one before it, which is what
                // lets a picture wipe in on top of the one it replaces.
                "--i": String(index),
                ...clock(index),
              } as CSSProperties
            }
          >
            {/* The photograph, the whole screen. Two nested boxes inside
                the clip because the zoom it arrives on and the push it
                leaves on are both transforms on the same picture, at
                different moments: one each, composed by nesting. */}
            <div className="undertake__bg">
              <div className="undertake__zoom">
                <div className="undertake__drift">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    quality={85}
                    sizes="100vw"
                    placeholder="blur"
                    priority={index === 0}
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Shade under the description. Inside the clip, so it
                  arrives with the photograph it belongs to rather than
                  hanging over the one still leaving. */}
              <div aria-hidden="true" className="undertake__scrim" />
            </div>

            {/* The description, over the right of the screen. Four parts,
                lifted in one after another as the picture lands; on the
                way out the block leaves as one, ahead of the picture it
                belongs to. */}
            <div className="undertake__copy-layer">
              <div className="container-page undertake__grid">
                <div className="undertake__copy">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-brass-400">
                    {item.eyebrow}
                  </p>
                  <h2 className="text-balance-head font-display text-[clamp(1.75rem,3.4vw,3rem)] leading-[1.1] text-white">
                    {item.title}
                  </h2>
                  <p className="text-[1.0625rem] leading-[1.8] text-navy-100/85">
                    {item.body}
                  </p>
                  <ul className="grid gap-2.5">
                    {item.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-3 text-[0.9375rem] text-navy-100/90"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass-400"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* The cards: each photograph again, standing in front of itself.
            Same `src` as its panel, and asked for at the same width and
            the same quality, so both come off one entry of the srcset —
            the browser fetches and decodes one image and paints it twice.
            A card asked for at its own size would be the smaller fetch and
            the softer picture: a wide photograph cropped to four-by-five
            keeps less than half its width, so the source has to be more
            than twice the box to land sharp. `next dev` warns about the
            `100vw` on something rendered narrower than the window, and the
            warning is the point rather than a mistake — declaring the card's
            own width instead would take the section from five downloads to
            ten to save nothing.

            They are here at stage level rather than one inside each panel,
            and that is the template's own arrangement rather than a
            convenience. A panel paints over the panel before it — that is
            what lets a photograph wipe in over the one it replaces — and a
            card inside a panel would be painted over with it, so the half
            of the outgoing card that the incoming one has not covered yet
            would show the arriving photograph through it rather than the
            picture it belongs to. Above every panel, the two cards change
            over against each other the way the template's do. */}
        <div className="undertake__cards" aria-hidden="true">
          {items.map((item, index) => (
            <div
              key={item.title}
              className="undertake__card"
              style={{ "--i": String(index), ...clock(index) } as CSSProperties}
            >
              <div className="undertake__card-clip">
                <div className="undertake__pan">
                  <div className="undertake__pan-out">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      quality={85}
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Five rules across the foot of the screen, one per picture, in
            place of the template's `01 / 06`. They are here at stage level
            rather than inside a panel because they are the one thing that
            has to outlast a changeover — a panel is replaced, and the
            count of what is left to see is not.

            Filled, part-filled and empty together they say both how far
            through the five you are and that there are five, which is the
            thing a pinned section otherwise cannot tell you: the scrollbar
            is measuring a track, not a sequence.

            A rule fills over its own picture's stretch of the clock: from
            the moment that picture starts arriving to the moment the next
            one does. The five stretches meet exactly, so the row reads as
            one bar of the whole section that happens to be cut into five.

            Both ends are clamped, and that is the whole reason the
            arithmetic is here rather than as literal offsets in the
            stylesheet. The first picture arrives a whole move before the
            scrub starts and the last one is never taken off, so left alone
            the row would open a fifth full and end a fifth short — the two
            things a count of five must not do.

            Hidden unpinned: five screens laid out one after another need
            no count of how many are left, and a row of rules at the bottom
            of the last of them would be four fifths of a lie. */}
        <div className="undertake__ticks" aria-hidden="true">
          <div className="container-page undertake__grid">
            <div className="undertake__tick-row">
              {items.map((item, index) => {
                const from = Math.max(index * slot - MOVE, 0);
                const to = Math.min(index * slot + HOLD, span);

                return (
                  <span
                    key={item.title}
                    className="undertake__tick"
                    style={
                      {
                        "--fill-at": `${from}ms`,
                        "--fill-for": `${to - from}ms`,
                      } as CSSProperties
                    }
                  >
                    <span className="undertake__tick-fill" />
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </ScrollScrub>
  );
}
