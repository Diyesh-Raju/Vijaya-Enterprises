/**
 * Reading pictures into the browser before they are shown.
 *
 * Shared by the brochure reader, which reads a book ahead of the reader
 * from whichever spread is open, and by the shelf on the legacy page, which
 * reads both books in while the reader is still looking at their covers —
 * so that a book opened from the shelf has every page in the browser
 * already, and turning it never waits on the network.
 */

/**
 * How many pictures are fetched at once.
 *
 * A few rather than all of them. A browser handed a whole book at once
 * shares the connection between every page, so on a slow link the next
 * spread lands at the same moment as the back cover — which is to say
 * last. Three at a time, in reading order from wherever the reader is,
 * keeps the next spread the next thing to arrive, and still has the whole
 * book in within a few seconds on an ordinary connection.
 */
export const AHEAD = 3;

export type Reader = {
  /** Fetch in this order from now on; whatever is in flight finishes. */
  focus: (order: readonly number[]) => void;
  stop: () => void;
};

/**
 * Fetches and decodes the pictures at `urls`, `AHEAD` at a time, in
 * whatever order `focus` last asked for, telling `onPage` as each lands.
 *
 * Through an `<img>` rather than `fetch`, because what has to be warm is
 * the browser's picture cache and not only its HTTP cache: an `<img>`
 * mounted later with the same `src` finds the file already fetched and,
 * after `decode()`, already decoded, and paints on its first frame instead
 * of some frames later. A picture that fails to load is counted as done,
 * so one bad file cannot wedge the queue behind it.
 *
 * `priority` is the browser's own fetch-priority hint. The reader leaves it
 * alone — its pages are what is on screen — and the shelf asks for `low`,
 * so that reading two books in behind a playing video never takes the
 * connection off the video.
 */
export function readAhead(
  urls: readonly string[],
  onPage?: (page: number) => void,
  priority: "high" | "low" | "auto" = "auto",
): Reader {
  const done = new Set<number>();
  const inFlight = new Set<number>();
  let order: readonly number[] = [];
  let live = true;

  const pump = () => {
    while (live && inFlight.size < AHEAD) {
      const page = order.find((p) => !done.has(p) && !inFlight.has(p));
      if (page === undefined) return;
      inFlight.add(page);

      const img = document.createElement("img");
      img.decoding = "async";
      img.fetchPriority = priority;
      img.src = urls[page];
      const settle = () => {
        inFlight.delete(page);
        done.add(page);
        if (!live) return;
        onPage?.(page);
        pump();
      };
      img.decode().then(settle, settle);
    }
  };

  return {
    focus(next) {
      order = next;
      pump();
    },
    stop() {
      live = false;
    },
  };
}

/** Every page from `from` to the end, then the ones before it, nearest first. */
export function readingOrder(from: number, total: number) {
  const ahead = Array.from({ length: total - from }, (_, i) => from + i);
  const behind = Array.from({ length: from }, (_, i) => from - 1 - i);
  return [...ahead, ...behind];
}

/**
 * Whether this browser has asked to be sent less — the data-saver switch,
 * or a connection it reports as 2G. Two books are a few megabytes, and
 * nobody on a metered line asked for them read in behind a page they are
 * still on; the reader itself works the same either way, page by page.
 */
export function sparing() {
  if (typeof navigator === "undefined") return false;
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  return connection?.saveData === true || /2g/.test(connection?.effectiveType ?? "");
}
