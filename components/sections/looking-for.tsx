"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * "What are you looking for?" — a small panel that comes in at the right
 * while the fifty-years band is on the screen, and goes again when it is not.
 *
 * Asked for by name (2026-09-16), and on the home page alone. It is the one
 * page that does not say what the company does in its first screen: the
 * walkthrough is a film, and the band under it is five figures. Three ways
 * in, at the moment a reader has just been told how long Vijaya has been
 * doing this, is the shortest route to the page they actually came for.
 *
 * The three are the three halves of the business, in the order the menu
 * gives them, and they are the same routes: nothing here invents a
 * destination.
 *
 * ── Where it sits ────────────────────────────────────────────────────────
 *
 * Fixed to the right edge on a laptop, and vertically centred rather than
 * low, because the site-visit balloon owns the bottom-right corner and two
 * cards stacked in one corner is a pile, not a prompt. It is under both the
 * header and that balloon in the stack.
 *
 * On a phone there is no room to float anything over the page without
 * covering the thing it is floating over, so there it is simply the last
 * card in the band, in the flow, and arrives with the rest of the section.
 *
 * ── When it comes ────────────────────────────────────────────────────────
 *
 * An `IntersectionObserver` on the band itself, so the panel is tied to what
 * it belongs to rather than to a scroll figure that would have to be kept in
 * step with the section above it. It is rendered at all times and only its
 * opacity and offset change, so nothing reflows when it arrives, and it is
 * `aria-hidden` and untabbable while it is away.
 */

const OPTIONS = [
  {
    href: "/residential",
    label: "Residential",
    note: "Homes to buy",
  },
  {
    href: "/civil-contracts",
    label: "Commercial Contracts",
    note: "Build on your site",
  },
  {
    href: "/joint-ventures",
    label: "Joint Ventures",
    note: "Develop your land",
  },
] as const;

/** How much of the band has to be on the screen before it speaks up. */
const SHOW_AT = 0.35;

function Panel({ floating }: { floating?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-navy-900/10 bg-white/95 p-6 shadow-[0_24px_60px_-24px_rgba(10,31,68,0.45)] backdrop-blur-xl",
        floating ? "w-[18rem]" : "w-full",
      )}
    >
      <p className="text-[0.625rem] font-semibold uppercase tracking-[0.3em] text-brass-600">
        Start here
      </p>
      <h2 className="mt-3 font-display text-[1.375rem] leading-[1.15] text-navy-900">
        What are you looking for?
      </h2>

      <ul className="mt-5 space-y-2.5">
        {OPTIONS.map((option) => (
          <li key={option.href}>
            <Link
              href={option.href}
              className={cn(
                "group flex items-center justify-between gap-4 rounded-2xl border border-navy-900/10 bg-mist/60 px-4 py-3",
                "transition-[background-color,border-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                "hover:-translate-y-0.5 hover:border-navy-900/25 hover:bg-white active:scale-[0.99]",
              )}
            >
              <span className="min-w-0">
                <span className="block font-sans text-[0.9375rem] font-semibold leading-tight text-navy-900">
                  {option.label}
                </span>
                <span className="mt-1 block text-[0.8125rem] leading-tight text-slate-muted">
                  {option.note}
                </span>
              </span>
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0 text-navy-900 transition-transform duration-300 group-hover:translate-x-1"
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
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LookingFor() {
  const anchor = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const band = anchor.current?.closest("section");
    if (!band) return;

    const watch = new IntersectionObserver(
      ([entry]) => setNear(entry.intersectionRatio >= SHOW_AT),
      { threshold: [0, SHOW_AT, 1] },
    );
    watch.observe(band);
    return () => watch.disconnect();
  }, []);

  return (
    <div ref={anchor}>
      {/* In the flow on a phone, where nothing can float without covering
          the band it belongs to. */}
      <div className="mt-4 desk:hidden">
        <Panel />
      </div>

      {/* And floating at the right on a laptop. `inert` rather than only
          `aria-hidden`, so a tab press never lands in a panel that is not on
          the screen. */}
      <div
        aria-hidden={!near}
        inert={!near ? true : undefined}
        className={cn(
          "fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 desk:block",
          "transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          near
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-6 opacity-0",
        )}
      >
        <Panel floating />
      </div>
    </div>
  );
}
