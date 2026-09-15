"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { HouseIcon } from "@/components/ui/line-icons";
import { onScroll, prefersReducedMotion } from "@/lib/scroll";
import { projectBySlug } from "@/lib/projects";
import { cn } from "@/lib/cn";

/**
 * The site-visit prompt: a speech bubble that pops up part-way down a page.
 *
 * Drawn as a comic speech balloon — an ink outline, a tail pointing down to
 * the small navy badge that is "speaking", a hard offset shadow, and three
 * short emphasis strokes off its top corner, the way a balloon in a strip is
 * marked when someone speaks up — but with the site's own palette and
 * radii, so it reads as the same hand that drew the rest of the page rather
 * than as a sticker on it. The pop-in overshoots and settles, and the badge
 * gives one nod once it has landed. All of that is in `globals.css` under
 * `.speech-bubble`.
 *
 * When it appears is decided by scroll, not by a timer, and it appears the
 * same frame the line is crossed: once the reader is either two fifths of
 * the way down the page or a screen and a half in, whichever comes first.
 * The first rule is "the middle" of an ordinary page; the second is for the
 * long ones — the home page's scrubbed walkthrough, the legacy story — where
 * two fifths would be a long way to wait. On a page too short to scroll it
 * shows on arrival. It fires once per page view.
 *
 * It appears on every page. A project's pages get the project's own
 * version: its name in the words, and its own booking page behind the
 * button, so the pass arrives already filled in. On the booking pages
 * themselves the button scrolls to the pass rather than leaving the page.
 *
 * Dismissing it lasts for the page it was dismissed on. Nothing is stored,
 * nothing is sent anywhere, and no cookie is set; the next page asks again,
 * which is the brief: the bubble is on every page.
 */

/** How far down the page, as a share of what can be scrolled… */
const SHOW_AT = 0.4;
/** …or this many screens in, whichever the reader reaches first. */
const SHOW_AFTER_SCREENS = 1.5;

/** Matches the leave transition in `globals.css`. */
const LEAVE_MS = 360;

const PROJECT_PATH = /^\/residential\/([^/]+)(?:\/|$)/;
const BOOKING_PATH = /^\/site-booking(?:\/|$)/;

type Phase = "armed" | "entering" | "shown" | "leaving" | "done";

export function SiteBookingPrompt() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("armed");

  // A new page re-arms the prompt. Adjusting state during render is React's
  // pattern for resetting on a changed value: it happens before paint, so
  // the old page's bubble is never seen on the new one.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setPhase("armed");
  }

  // Which version of the bubble this page gets.
  const projectSlug = pathname.match(PROJECT_PATH)?.[1];
  const project = projectSlug ? projectBySlug(projectSlug) : undefined;
  const onBookingPage = BOOKING_PATH.test(pathname);
  const href = onBookingPage
    ? `${pathname}#book`
    : project
      ? `/site-booking/${project.slug}`
      : "/site-booking";

  useEffect(() => {
    if (phase !== "armed") return;

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
      // Mount hidden, then show on the next frame so the transition has a
      // starting state to leave from — the reduced-motion case skips the
      // overshoot in CSS and simply fades.
      setPhase("entering");
      requestAnimationFrame(() => setPhase("shown"));
    });

    return stop;
  }, [phase, pathname]);

  const dismiss = useCallback(() => {
    setPhase("leaving");
    window.setTimeout(
      () => setPhase("done"),
      prefersReducedMotion() ? 0 : LEAVE_MS,
    );
  }, []);

  // Escape closes it, as it closes everything else on the site.
  useEffect(() => {
    if (phase !== "shown") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [phase, dismiss]);

  if (phase === "armed" || phase === "done") return null;

  const visible = phase === "shown";

  return (
    <div
      role="complementary"
      aria-label="Book a site visit"
      // Under the menu sheet (z-60) and the header (z-50); above the page.
      // The wrapper spans the bottom edge but only the bubble is real.
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40"
    >
      {/* Clear of the phone's action bar rather than behind it: the bar
          owns the bottom edge, and `--action-bar-h` is 0 wherever it is not
          shown, so this is the same 1.25rem it always was on a laptop. */}
      <div className="container-page flex justify-end pb-[calc(1.25rem+var(--action-bar-h))] sm:pb-[calc(2rem+var(--action-bar-h))]">
        <div
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
              onClick={dismiss}
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
                onClick={onBookingPage ? dismiss : undefined}
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
                onClick={dismiss}
                className="link-underline text-[0.8125rem] font-semibold text-navy-900"
              >
                Not now
              </button>
            </div>
          </div>

          {/* The tail, and the badge it points at. */}
          <span aria-hidden="true" className="speech-bubble__tail" />
          <span aria-hidden="true" className="speech-bubble__badge">
            <HouseIcon className="h-5 w-5" />
          </span>
        </div>
      </div>
    </div>
  );
}
