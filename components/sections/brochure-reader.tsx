"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/line-icons";
import { cn } from "@/lib/cn";
import { READER_WIDE_QUERY, type Brochure } from "@/lib/brochures";
import { readAhead, readingOrder, type Reader } from "@/lib/read-ahead";

/**
 * How long a leaf takes to come over, and the one place that number lives.
 * The stylesheet reads it off the element as `--turn`, so the class that
 * animates and the timer that cleans up after it cannot drift apart.
 */
const TURN_MS = 820;

function subscribeToWidth(onChange: () => void) {
  const query = window.matchMedia(READER_WIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getWidth = () =>
  window.matchMedia(READER_WIDE_QUERY).matches
    ? ("wide" as const)
    : ("phone" as const);

/**
 * The brochure, opened.
 *
 * Two readings of the same book, and a window only ever builds one of them.
 * A laptop gets the book itself: leaves hinged at the spine, turning in 3D,
 * two pages open at a time the way the thing was printed. A phone gets one
 * page at a time in a snapping strip, because a printed spread on a 390px
 * screen is two pages 170px wide and neither of them can be read.
 *
 * Both branches are held back until `useSyncExternalStore` has answered,
 * rather than rendered under `desk:hidden` and left to CSS. A `loading="lazy"`
 * image inside a `display: none` subtree is fetched immediately by Chrome, so
 * the branch a window is not using would ask for the whole book at once, in
 * its own order, over the top of the one the reader is actually looking at.
 * Nothing is asked for until it is known which book is being built.
 *
 * Until then — which on a hard load is the whole time the script takes to
 * arrive — the page shows the cover, in the place and at the size the book
 * will put it, with the controls under it. See `Waiting`.
 */
export function BrochureReader({ brochure }: { brochure: Brochure }) {
  const width = useSyncExternalStore(
    subscribeToWidth,
    getWidth,
    () => "ssr" as const,
  );

  // The book is two leaves wide. Its shape is handed to the stylesheet
  // rather than assumed there, so a brochure printed portrait would come
  // through as portrait; the bare number is given as well, because the
  // width is also capped against the height of the window and `calc` cannot
  // do that with a ratio. One page's shape goes along for the phone.
  const cover = brochure.pages[0];
  const shape = {
    "--turn": `${TURN_MS}ms`,
    "--book-ratio": `${cover.width * 2} / ${cover.height}`,
    "--book-ar": (cover.width * 2) / cover.height,
    "--page-ratio": `${cover.width} / ${cover.height}`,
  } as CSSProperties;

  if (width === "ssr") return <Waiting brochure={brochure} shape={shape} />;

  return width === "wide" ? (
    <Spread brochure={brochure} shape={shape} />
  ) : (
    <Strip brochure={brochure} />
  );
}

/**
 * The reader before it knows which of its two shapes it is.
 *
 * Not an empty box. It used to be one — and a box whose height was written
 * as a share of `100%` inside `height`, which against a parent of no fixed
 * height is nothing at all, so on every hard load the download link sat
 * where the book was about to be and dropped by the book's height when the
 * script landed. Now it is the cover, sized and placed as the book will
 * place it, with the same controls under it that the book has: nothing
 * moves when the book arrives, and until it does the reader has the cover
 * to look at rather than a blank.
 *
 * Which of the two shapes is decided by the stylesheet, on the same query
 * the component asks, and the `<picture>` chooses the file the same way —
 * the 1200px cover for the spread, the 840px one for the strip — so what
 * this fetches is what the book then finds already in.
 */
function Waiting({ brochure, shape }: { brochure: Brochure; shape: CSSProperties }) {
  const total = brochure.pages.length;
  const wide = brochure.pages[0];
  const small = brochure.small[0];

  return (
    <div className="fbk" style={shape} aria-busy="true">
      <div className="fbk__waiting">
        <div className="fbk__waiting-book">
          <picture className="fbk__waiting-cover">
            <source media={READER_WIDE_QUERY} srcSet={wide.src} />
            <img
              src={small.src}
              alt={pageAlt(brochure, 0)}
              width={small.width}
              height={small.height}
              fetchPriority="high"
              decoding="async"
              style={{
                backgroundImage: `url(${small.blurDataURL})`,
                backgroundSize: "cover",
              }}
            />
          </picture>
        </div>
      </div>

      <Controls
        onPrev={noop}
        onNext={noop}
        atStart
        atEnd
        label={
          <>
            <span className="desk:hidden">1 of {total}</span>
            <span className="hidden desk:inline">Cover</span>
          </>
        }
      />

      <p className="fbk__hint">
        <span className="desk:hidden">Swipe, or use the arrows</span>
        <span className="hidden desk:inline">Click the cover, or use the arrows</span>
      </p>
    </div>
  );
}

const noop = () => {};

/* ------------------------------------------------------------------ Laptop */

/**
 * The book.
 *
 * Every leaf is one element hinged on the spine, front page on its face and
 * the next page on its back, and turning it is a single `rotateY`. With N
 * pages that is `ceil(N / 2)` leaves, and spread `s` shows the back of leaf
 * `s - 1` on the left and the front of leaf `s` on the right — which is
 * exactly how the Hara Vijaya Heights file was imposed, so a printed spread
 * lands back on the screen as one picture across the gutter.
 *
 * The last spread is `floor(N / 2)`: on an even count that is the back cover
 * lying alone on the left, and on an odd one it is the last two pages open
 * together, with no empty spread past either.
 *
 * Stacking is the whole trick. Leaves that have not turned stack toward the
 * reader in reading order (`leaves - i`), turned ones stack away from it
 * (`i`), and anything in flight is lifted clear above both — later starters
 * highest, which is the right answer turning in either direction. `turning`
 * is emptied by a timer rather than by `transitionend`, because a reader who
 * has asked for less motion gets no transition and therefore no event.
 */
function Spread({ brochure, shape }: { brochure: Brochure; shape: CSSProperties }) {
  const pages = brochure.pages;
  const total = pages.length;
  const leaves = Math.ceil(total / 2);
  const lastSpread = Math.floor(total / 2);

  const [spread, setSpread] = useState(0);
  const [turning, setTurning] = useState<readonly number[]>([]);
  /** Which leaves have their pictures in the DOM. Every leaf within a turn
      of the open spread is there whatever the state of its pictures — the
      one the next click reveals cannot be missing, so it is present and
      shows its blur until the picture lands — and every other leaf joins as
      the read-ahead below finishes decoding it, so that by the time the
      reader gets there the picture is not only fetched but ready to paint. */
  const [ready, setReady] = useState<ReadonlySet<number>>(() =>
    near(new Set(), leaves, 0),
  );

  /* Read ahead. Every page of the book is fetched and decoded, a few at a
     time, starting from the spread that is open and running to the back
     cover, then back to the front — so the pages the reader is looking at
     come first, the ones they will turn to next come next, and the two
     halves of a spread, which live on different leaves, are asked for
     together. Re-aimed on every turn: whatever is in flight lands where it
     lands, and the walk carries on from the new spread. */
  const reader = useRef<Reader | null>(null);
  useEffect(() => {
    const ahead = readAhead(
      pages.map((page) => page.src),
      (page) => {
        const leaf = Math.floor(page / 2);
        setReady((current) => mount(current, leaves, leaf, leaf));
      },
    );
    reader.current = ahead;
    return () => {
      ahead.stop();
      reader.current = null;
    };
  }, [pages, leaves]);

  useEffect(() => {
    reader.current?.focus(readingOrder(Math.max(0, spread * 2 - 1), total));
  }, [spread, total]);

  /** Turn `delta` spreads, as far as the book goes. */
  const go = useCallback(
    (delta: number) => {
      const target = Math.min(lastSpread, Math.max(0, spread + delta));
      if (target === spread) return;

      // The leaves this move turns, in the order they leave: forward, the
      // one being lifted off the right-hand stack; back, the one lying on
      // top of the left-hand one.
      const moving =
        target > spread
          ? Array.from({ length: target - spread }, (_, i) => spread + i)
          : Array.from({ length: spread - target }, (_, i) => spread - 1 - i);

      setTurning((flying) => [...flying, ...moving]);

      /* The leaves a turn from where this lands, whether or not the
         read-ahead has got to them — someone holding an arrow key down can
         outrun it, and what they land on has to be there. */
      setReady((current) => near(current, leaves, target));
      setSpread(target);
    },
    [spread, lastSpread, leaves],
  );

  useEffect(() => {
    if (turning.length === 0) return;
    const done = window.setTimeout(() => setTurning([]), TURN_MS + 80);
    return () => window.clearTimeout(done);
  }, [turning]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "ArrowRight") go(1);
      else if (event.key === "ArrowLeft") go(-1);
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  /* Closed, open, or lying open on its last page — which is not the same
     as being on the last spread. A book with an odd number of pages ends
     with two of them showing; only an even one runs out on the right and
     leaves the back cover alone on the left. So the state is read off the
     page that would be on the right, not off the count. */
  const state =
    spread === 0 ? "closed" : pages[spread * 2] ? "open" : "ended";

  return (
    <div className="fbk">
      <div className="fbk__stage" data-state={state} style={shape}>
        <div className="fbk__book">
          {Array.from({ length: leaves }, (_, leaf) => {
            const flying = turning.indexOf(leaf);
            const turned = leaf < spread;

            return (
              <div
                key={leaf}
                className={cn("fbk__leaf", flying >= 0 && "is-turning")}
                style={{
                  zIndex:
                    flying >= 0 ? leaves + 2 + flying : turned ? leaf + 1 : leaves - leaf,
                  transform: turned ? "rotateY(-180deg)" : "rotateY(0deg)",
                }}
              >
                <Face
                  brochure={brochure}
                  index={leaf * 2}
                  side="front"
                  mounted={ready.has(leaf)}
                  hot={Math.abs(leaf - spread) <= 1}
                />
                <Face
                  brochure={brochure}
                  index={leaf * 2 + 1}
                  side="back"
                  mounted={ready.has(leaf)}
                  hot={Math.abs(leaf - spread) <= 1}
                />
              </div>
            );
          })}
        </div>

        {/* Turning by clicking the page you are looking at. It lies over the
            book rather than inside it: a click has to land on a flat target
            in front of the leaves, not on something hinged in the same 3D
            space they are turning through. The labelled controls below are
            the accessible path to the same two moves, so this layer is kept
            out of that tree rather than offering them twice. */}
        <div className="fbk__aim" aria-hidden="true">
          {state !== "closed" && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => go(-1)}
              className="fbk__half fbk__half--left"
            />
          )}
          {state !== "ended" && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => go(1)}
              className="fbk__half fbk__half--right"
            />
          )}
        </div>
      </div>

      <Controls
        onPrev={() => go(-1)}
        onNext={() => go(1)}
        atStart={spread === 0}
        atEnd={spread === lastSpread}
        label={spreadLabel(spread, total)}
      />

      <p className="fbk__hint">
        {state === "closed"
          ? "Click the cover, or use the arrows"
          : "Click either page, or use the arrow keys"}
      </p>
    </div>
  );
}

function Face({
  brochure,
  index,
  side,
  mounted,
  hot,
}: {
  brochure: Brochure;
  index: number;
  side: "front" | "back";
  mounted: boolean;
  /** Within a turn of the open spread: on screen, or one click from it. */
  hot: boolean;
}) {
  const page = brochure.pages[index];

  return (
    <div className={cn("fbk__face", `fbk__face--${side}`)}>
      {/* Served as the file is, and fetched the moment it is mounted.
          `unoptimized` because a page is already finished WebP (see
          `lib/brochures.ts`), and sending it through the optimiser would
          mean an encode on first request — which is how a spread's right-
          hand page used to arrive seconds after its left. `eager` because a
          mounted face is by definition one the reader is about to see, and
          a lazy image inside a leaf that is turned away, or under the stack,
          is left to the browser's guess about whether it is worth fetching
          yet. And decoded `sync`: in the ordinary case a face is mounted
          only once its picture is decoded, so there is nothing to wait for
          — and the moment a page is revealed is exactly the wrong moment
          for the browser to paint the leaf now and the picture a frame or
          two later, which is what `async` licenses it to do. WebKit also
          drops the decoded pixels of a picture it has not painted lately,
          so a page that has sat under the stack for a while comes back
          through a decode; synchronous, that is a blank page never shown.

          And the leaves around the open spread are fetched HIGH. Opening a
          book on a cold cache used to put its first spread on the wire
          alongside the read-ahead's next three pages, all at the same
          priority, so the two pages the reader was about to turn to shared
          the connection with pages they were not — and on a phone's
          connection arrived most of a second after the click. Marked high,
          they go first, and the read-ahead takes what is left. */}
      {page && mounted && (
        <Image
          src={page}
          alt={pageAlt(brochure, index)}
          fill
          unoptimized
          loading="eager"
          decoding="sync"
          fetchPriority={hot ? "high" : undefined}
          placeholder="blur"
          className="fbk__art"
        />
      )}
      {/* The gutter, and the shade that sweeps the page as it comes over. */}
      <span className="fbk__gutter" aria-hidden="true" />
      <span className="fbk__shade" aria-hidden="true" />
    </div>
  );
}

/* ------------------------------------------------------------------- Phone */

/**
 * One page at a time, in a strip that snaps.
 *
 * Native scrolling rather than a transform carousel: the gesture, the
 * momentum and the rubber band at either end are all the platform's, which
 * is what makes it feel like a phone rather than like a website. The buttons
 * scroll it; the counter is read back off wherever it came to rest.
 *
 * The pages are the 840px set — see `small` in `lib/brochures.ts`. A page
 * here is under 400 CSS pixels wide, and the 1200px leaves were three and a
 * half megabytes of book for the screen that could least afford them.
 */
function Strip({ brochure }: { brochure: Brochure }) {
  const pages = brochure.small;
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLUListElement>(null);
  const frame = useRef(0);

  /* Read ahead here too, from the page in view outward: a swipe is over in
     a moment, and a page fetched only as it comes near the screen lands
     after the finger has already brought it on. The pictures stay lazy in
     the strip itself — all of them are in the DOM — so the browser asks
     only for what is near, and finds the rest already in. */
  const reader = useRef<Reader | null>(null);
  useEffect(() => {
    const ahead = readAhead(pages.map((page) => page.src));
    reader.current = ahead;
    return () => {
      ahead.stop();
      reader.current = null;
    };
  }, [pages]);

  useEffect(() => {
    reader.current?.focus(readingOrder(index, pages.length));
  }, [index, pages.length]);

  const onScroll = useCallback(() => {
    if (frame.current) return;
    frame.current = window.requestAnimationFrame(() => {
      frame.current = 0;
      const el = track.current;
      if (!el) return;

      const middle = el.scrollLeft + el.clientWidth / 2;
      let closest = 0;
      let gap = Infinity;
      Array.from(el.children).forEach((child, i) => {
        const item = child as HTMLElement;
        const distance = Math.abs(item.offsetLeft + item.offsetWidth / 2 - middle);
        if (distance < gap) {
          gap = distance;
          closest = i;
        }
      });
      setIndex(closest);
    });
  }, []);

  useEffect(() => () => window.cancelAnimationFrame(frame.current), []);

  const go = (delta: number) => {
    const el = track.current;
    const item = el?.children[index + delta] as HTMLElement | undefined;
    if (!el || !item) return;
    el.scrollTo({
      left: item.offsetLeft - (el.clientWidth - item.offsetWidth) / 2,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return (
    <div className="fbk">
      <ul className="fbk-strip" ref={track} onScroll={onScroll}>
        {pages.map((page, i) => (
          <li key={page.src} className="fbk-strip__leaf">
            <Image
              src={page}
              alt={pageAlt(brochure, i)}
              unoptimized
              loading={i === 0 ? "eager" : "lazy"}
              placeholder="blur"
              className="fbk-strip__art"
            />
          </li>
        ))}
      </ul>

      <Controls
        onPrev={() => go(-1)}
        onNext={() => go(1)}
        atStart={index === 0}
        atEnd={index === pages.length - 1}
        label={`${index + 1} of ${pages.length}`}
      />

      <p className="fbk__hint">Swipe, or use the arrows</p>
    </div>
  );
}

/* ---------------------------------------------------------------- Shared */

function Controls({
  onPrev,
  onNext,
  atStart,
  atEnd,
  label,
}: {
  onPrev: () => void;
  onNext: () => void;
  atStart: boolean;
  atEnd: boolean;
  label: ReactNode;
}) {
  return (
    <div className="fbk__controls">
      <button
        type="button"
        className="fbk__arrow"
        onClick={onPrev}
        disabled={atStart}
        aria-label="Previous page"
      >
        <ArrowLeftIcon className="h-[1.15rem] w-[1.15rem]" />
      </button>

      {/* Announced on change, so a reader who cannot see the book still
          knows where in it they are. */}
      <p className="fbk__count" aria-live="polite">
        {label}
      </p>

      <button
        type="button"
        className="fbk__arrow"
        onClick={onNext}
        disabled={atEnd}
        aria-label="Next page"
      >
        <ArrowRightIcon className="h-[1.15rem] w-[1.15rem]" />
      </button>
    </div>
  );
}

/**
 * `ready` with every leaf within a turn of `spread` added. Spread `s` shows
 * the back of leaf `s - 1` and the front of leaf `s`; a turn forward reveals
 * the front of leaf `s + 1`, a turn back the back of leaf `s - 2`.
 */
function near(current: ReadonlySet<number>, leaves: number, spread: number) {
  return mount(current, leaves, spread - 2, spread + 1);
}

/** `ready` with every leaf from `from` to `to` added, or as it was. */
function mount(
  current: ReadonlySet<number>,
  leaves: number,
  from: number,
  to: number,
) {
  const next = new Set(current);
  for (let leaf = Math.max(0, from); leaf <= Math.min(leaves - 1, to); leaf += 1) {
    next.add(leaf);
  }
  return next.size === current.size ? current : next;
}

/** What the two open pages are called, counting the way the book does. */
function spreadLabel(spread: number, total: number) {
  if (spread === 0) return "Cover";
  const left = spread * 2;
  return left + 1 <= total ? `${left}–${left + 1} of ${total}` : `${left} of ${total}`;
}

/**
 * A page of a scanned brochure has no text a screen reader can reach — the
 * words are in the artwork. The alt text says which page it is and the page
 * offers the PDF, which is where the text actually is.
 */
function pageAlt(brochure: Brochure, index: number) {
  const total = brochure.pages.length;
  if (index === 0) return `The cover of the ${brochure.title} brochure`;
  if (index === total - 1) return `The back cover of the ${brochure.title} brochure`;
  return `Page ${index + 1} of ${total} of the ${brochure.title} brochure`;
}
