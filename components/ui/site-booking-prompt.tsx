"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import mark from "@/assets/brand/vijaya-mark.png";
import { onScroll, prefersReducedMotion } from "@/lib/scroll";
import { projectBySlug } from "@/lib/projects";
import { cn } from "@/lib/cn";

/**
 * The site-visit prompt: a speech bubble that pops up once, then folds into
 * a small badge in the corner that stays for the rest of the visit.
 *
 * Drawn as a comic speech balloon — an ink outline, a tail pointing down to
 * the badge that is "speaking", a hard offset shadow, and three short
 * emphasis strokes off its top corner, the way a balloon in a strip is
 * marked when someone speaks up — but with the site's own palette and
 * radii, so it reads as the same hand that drew the rest of the page rather
 * than as a sticker on it. The pop-in overshoots and settles, and the badge
 * gives one nod once it has landed. All of that is in `globals.css` under
 * `.speech-bubble`.
 *
 * The badge is the Ganesha mark from the company's own lockup, on a white
 * disc: it is Vijaya speaking, and once the balloon has folded away the mark
 * is what stays in the corner. The mark is the artwork drawn for white paper
 * (`assets/brand/vijaya-mark.png`), which is why the disc is white rather
 * than navy — see `assets/brand/README.md` on why the navy-ground version
 * is a different picture.
 *
 * It speaks up once per visit. The first page that is scrolled far enough —
 * two fifths of the way down, or a screen and a half in, whichever comes
 * first, on the very frame that line is crossed — gets the balloon. It stays
 * for a while and then folds away, or folds when it is dismissed, and what
 * is left is the badge: a small round button in the corner that is on every
 * page from then on and opens the balloon again when pressed. That "once"
 * is remembered in `sessionStorage`, so it lasts the tab and no longer; a
 * fresh visit is asked afresh. Nothing is sent anywhere and no cookie is
 * set.
 *
 * A project's pages get the project's own version: its name in the words,
 * and its own booking page behind the button, so the pass arrives already
 * filled in. On the booking pages themselves the button scrolls to the pass
 * rather than leaving the page.
 */

/** How far down the page, as a share of what can be scrolled… */
const SHOW_AT = 0.4;
/** …or this many screens in, whichever the reader reaches first. */
const SHOW_AFTER_SCREENS = 1.5;

/** How long the balloon stays up on its own before folding into the badge. */
const AUTO_FOLD_MS = 12_000;

/** Matches the leave transition in `globals.css`. */
const LEAVE_MS = 360;

const SEEN_KEY = "vijaya-site-booking-prompt";

const PROJECT_PATH = /^\/residential\/([^/]+)(?:\/|$)/;
const BOOKING_PATH = /^\/site-booking(?:\/|$)/;

const readSeen = () => {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === "seen";
  } catch {
    return false;
  }
};

const writeSeen = () => {
  try {
    window.sessionStorage.setItem(SEEN_KEY, "seen");
  } catch {
    // Nowhere to remember it — it will speak up again on the next page,
    // which errs towards asking rather than towards silence.
  }
};

/**
 * Whether this visit has already been asked, read the hydration-safe way:
 * the server (and the first client paint) say no, and the real answer lands
 * with the first render after hydration. Nothing external ever changes it
 * mid-page — the component itself is the only writer, and it moves its own
 * phase at the same moment — so the subscription has nothing to listen for.
 */
const subscribeToNothing = () => () => {};
const useSeen = () => useSyncExternalStore(subscribeToNothing, readSeen, () => false);

/**
 * `armed` is waiting for the scroll line; `folded` is the badge alone. The
 * three in between are the balloon arriving, up, and leaving.
 */
type Phase = "armed" | "entering" | "shown" | "leaving" | "folded";

/** The Ganesha mark on its white disc: the badge, and the balloon's own. */
function Mark({ className }: { className?: string }) {
  return (
    <Image
      src={mark}
      alt=""
      width={28}
      height={40}
      sizes="28px"
      className={cn("h-7 w-auto", className)}
    />
  );
}

export function SiteBookingPrompt() {
  const pathname = usePathname();
  const seen = useSeen();
  const [phase, setPhase] = useState<Phase>("armed");
  const [hovering, setHovering] = useState(false);

  // A new page starts over. Adjusting state during render is React's
  // pattern for resetting on a changed value: it happens before paint, so
  // the old page's balloon is never seen on the new one.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setPhase("armed");
  }

  // "Armed" only means waiting for the scroll line on a visit that has not
  // been asked yet. Once it has, armed *is* folded: straight to the badge.
  const effective: Phase = phase === "armed" && seen ? "folded" : phase;

  // Which version of the balloon this page gets.
  const projectSlug = pathname.match(PROJECT_PATH)?.[1];
  const project = projectSlug ? projectBySlug(projectSlug) : undefined;
  const onBookingPage = BOOKING_PATH.test(pathname);
  const href = onBookingPage
    ? `${pathname}#book`
    : project
      ? `/site-booking/${project.slug}`
      : "/site-booking";

  const open = useCallback(() => {
    // Mount hidden, then show on the next frame so the transition has a
    // starting state to leave from — the reduced-motion case skips the
    // overshoot in CSS and simply fades.
    setPhase("entering");
    requestAnimationFrame(() => setPhase("shown"));
  }, []);

  const fold = useCallback(() => {
    setPhase("leaving");
    window.setTimeout(
      () => setPhase("folded"),
      prefersReducedMotion() ? 0 : LEAVE_MS,
    );
  }, []);

  // Waiting for the scroll line, on the one page per visit that gets there
  // first.
  useEffect(() => {
    if (effective !== "armed") return;

    let fired = false;
    const stop = onScroll(({ y, height }) => {
      if (fired) return;
      const range = document.documentElement.scrollHeight - height;
      // A page that cannot scroll, or has scrolled far enough by either rule.
      const due =
        range <= 0 ||
        y >= range * SHOW_AT ||
        y >= height * SHOW_AFTER_SCREENS;
      if (!due) return;

      fired = true;
      writeSeen();
      open();
    });

    return stop;
  }, [effective, pathname, open]);

  // Up on its own, it folds after a while — unless the pointer is on it,
  // which is someone reading it.
  useEffect(() => {
    if (effective !== "shown" || hovering) return;
    const id = window.setTimeout(fold, AUTO_FOLD_MS);
    return () => window.clearTimeout(id);
  }, [effective, hovering, fold]);

  // Escape folds it, as it closes everything else on the site.
  useEffect(() => {
    if (effective !== "shown") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") fold();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [effective, fold]);

  if (effective === "armed") return null;

  const visible = effective === "shown";

  return (
    <div
      role="complementary"
      aria-label="Book a site visit"
      // Under the menu sheet (z-60) and the header (z-50); above the page.
      // The wrapper spans the bottom edge but only the balloon or the badge
      // is real.
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40"
    >
      {/* Clear of the phone's action bar rather than behind it: the bar
          owns the bottom edge, and `--action-bar-h` is 0 wherever it is not
          shown, so this is the same 1.25rem it always was on a laptop. */}
      <div
        className={cn(
          "flex justify-end",
          // Folded, the badge sits in the viewport's own corner rather than
          // at the edge of the content column.
          effective === "folded"
            ? ""
            : "container-page pb-[calc(1.25rem+var(--action-bar-h))] sm:pb-[calc(2rem+var(--action-bar-h))]",
        )}
      >
        {effective === "folded" ? (
          /* The badge on its own: the same disc the balloon speaks from, in
             the same corner, with a label that slides out beside it under
             the pointer. Pressing it brings the balloon back. */
          <button
            type="button"
            onClick={open}
            aria-label={
              onBookingPage
                ? "Open the site visit note"
                : project
                  ? `Book a site visit to ${project.name}`
                  : "Book a site visit"
            }
            className={cn(
              // Pinned to the viewport corner on its own, not through the wrapper.
              "group pointer-events-auto fixed bottom-[calc(1rem+var(--action-bar-h,0px))] right-4 inline-flex sm:bottom-[calc(1.25rem+var(--action-bar-h,0px))] sm:right-5",
              " h-13 w-13 items-center justify-center rounded-full",
              "border-2 border-navy-900 bg-white shadow-[0.25rem_0.25rem_0_0_var(--color-brass-500)]",
              "transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[0.375rem_0.375rem_0_0_var(--color-brass-500)] active:scale-95",
              "motion-safe:animate-[bubble-burst_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]",
            )}
          >
            <Mark className="h-8" />
            {/* A brass dot, the way an unread mark sits on an icon: there
                is something here to open. */}
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-brass-500"
            />
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute right-full top-1/2 mr-4 -translate-y-1/2 whitespace-nowrap",
                "rounded-full border-2 border-navy-900 bg-white px-4 py-2 text-[0.75rem] font-semibold text-navy-900",
                "shadow-[0.25rem_0.25rem_0_0_var(--color-brass-500)]",
                "opacity-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                "translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
              )}
            >
              {onBookingPage ? "The pass is below" : "Book a site visit"}
            </span>
          </button>
        ) : (
          <div
            onPointerEnter={() => setHovering(true)}
            onPointerLeave={() => setHovering(false)}
            className={cn(
              "speech-bubble pointer-events-auto relative w-full max-w-[22rem] sm:max-w-[23.5rem]",
              visible ? "speech-bubble--in" : "speech-bubble--out",
            )}
          >
            {/* The three emphasis strokes off the top-left corner. */}
            <svg
              viewBox="0 0 32 32"
              aria-hidden="true"
              className="speech-bubble__burst absolute -left-5 -top-5 h-8 w-8 text-brass-500"
            >
              <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M6 26 12 20" />
                <path d="M4 14h8" />
                <path d="M14 4v8" />
              </g>
            </svg>

            <div className="speech-bubble__body rounded-[1.75rem] bg-white p-6 sm:p-7">
              <button
                type="button"
                onClick={fold}
                aria-label="Dismiss"
                className="absolute right-3.5 top-3.5 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-muted transition-colors duration-300 hover:bg-navy-50 hover:text-navy-900"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <p className="eyebrow-rule pr-10 text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-brass-600">
                Site visits
              </p>
              <h2 className="text-balance-head mt-4 pr-6 font-display text-[1.3125rem] leading-[1.2] text-navy-900 sm:text-[1.4375rem]">
                {onBookingPage
                  ? "Ready to pick a day?"
                  : project
                    ? `Want to walk through ${project.name}?`
                    : "Want to see it for yourself?"}
              </h2>
              <p className="mt-3 text-[0.9375rem] leading-[1.65] text-slate-body">
                {onBookingPage
                  ? "The pass is just below. Three short steps, and we will call you to confirm."
                  : project
                    ? "Pick a day and a time of day, and someone who built it will meet you at the site."
                    : "Pick a project, a day and a time of day, and we will meet you at the site."}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link
                  href={href}
                  onClick={fold}
                  className="group inline-flex items-center gap-2.5 rounded-full bg-navy-900 px-6 py-3 text-[0.8125rem] font-semibold tracking-wide text-white shadow-soft transition-[background-color,transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-navy-800 hover:shadow-lift active:scale-[0.98]"
                >
                  {onBookingPage ? "Fill In The Pass" : "Book a Site Visit"}
                  <svg
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <path
                      d="M3 8h9.5M9 4.5 12.5 8 9 11.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                <button
                  type="button"
                  onClick={fold}
                  className="link-underline text-[0.8125rem] font-semibold text-navy-900"
                >
                  Not now
                </button>
              </div>
            </div>

            {/* The tail, and the badge it points at — the same mark that is
                left behind when the balloon folds. The stylesheet paints the
                badge navy for a white glyph; this one carries the mark drawn
                for white paper, so the disc is white here. */}
            <span aria-hidden="true" className="speech-bubble__tail" />
            <span
              aria-hidden="true"
              className="speech-bubble__badge"
              style={{ backgroundColor: "#fff", borderColor: "var(--color-navy-900)" }}
            >
              <Mark className="h-6" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
