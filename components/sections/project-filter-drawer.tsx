"use client";

import Image from "next/image";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { img } from "@/lib/images";
import { CloseIcon, SearchIcon } from "@/components/ui/line-icons";

/**
 * "Custom Search" — the residential filters, on a phone, as a screen of its
 * own.
 *
 * A laptop keeps the three dropdown pills sitting under the heading, which
 * is the right control when there is a row of space for them and a pointer
 * to open them with. On a phone the same three wrapped onto two lines,
 * pushed the first project card most of a screen further down, and each one
 * opened a menu that covered the cards it was meant to be narrowing. So
 * there they collapse to one button, and the button opens this.
 *
 * It is set the way the residence finder under the home page hero is set —
 * same cloth behind it, same cream wash over that, same small-caps labels and
 * the same weighted button at the foot (2026-09-14). The two are the only
 * places on the site where a visitor states what they are looking for, and
 * they were arriving in two different designs.
 *
 * What it does not take from the finder is the finder's heading: the search
 * field stands in that slot instead. On a panel that is already named by the
 * control that opened it, a second title is a line of type where the first
 * thing to do should be.
 *
 * The mechanics are the site menu's, and deliberately so — a second overlay on
 * the same site should not behave like a different piece of software. It
 * stays mounted and is driven by transitions off one boolean rather than
 * being mounted on open: keyframes only ever play forwards, so closing
 * would need a second "closing" state to sequence the unmount, where a
 * transition runs both ways for free. What that costs is a panel
 * permanently in the DOM, so it is held out of the document properly while
 * shut — `inert` takes it out of the tab order and off the accessibility
 * tree, and the delayed `visibility` flip stops it swallowing taps.
 *
 * The filters apply as they are tapped rather than on submit, which is what
 * the dropdowns behind it have always done. So the primary button is not an
 * "apply" — the list under the sheet has already changed — it is "I am done
 * looking at the controls", and it says how many projects it is about to
 * show so that pressing it is never a surprise.
 */

/** Long enough to read as a drawer being pulled, short enough to feel instant. */
const SHEET_MS = 420;

/** Nothing to subscribe to — see `mounted` below. Module scope so the
    reference is stable and the store is never re-subscribed. */
const subscribeNever = () => () => {};

export type FilterGroup = {
  key: string;
  /** The heading over the row of pills. */
  label: string;
  options: readonly string[];
  value: string;
};

export function ProjectFilterDrawer({
  open,
  onClose,
  groups,
  query,
  onQueryChange,
  onChoose,
  onReset,
  resultCount,
  isFiltered,
}: {
  open: boolean;
  onClose: () => void;
  groups: readonly FilterGroup[];
  query: string;
  onQueryChange: (value: string) => void;
  onChoose: (key: string, value: string) => void;
  onReset: () => void;
  resultCount: number;
  isFiltered: boolean;
}) {
  const sheet = useRef<HTMLDivElement | null>(null);

  /**
   * The sheet is put on `document.body` rather than left where it is
   * written, and it has to be.
   *
   * `ApartmentProjects` renders inside `<section className="relative
   * isolate">`, and `isolate` is a stacking context — so a `z-[70]` in
   * there is 70 *within that section*, not on the page. The section itself
   * has no z-index of its own, which puts the whole drawer under the
   * `z-50` fixed header: the first build of this had the sheet's own head,
   * its title and its close button all painting behind the header bar. Any
   * number would have lost. A portal takes the panel out of the section's
   * context entirely, which is also what `aria-modal` claims is true of it.
   *
   * `mounted` is the server-render guard — there is no `document` to portal
   * into until the client has one. Nothing is lost by skipping the server
   * here: it is a dialog, and it starts shut.
   *
   * Read through `useSyncExternalStore` rather than the usual
   * `useState(false)` plus an effect that sets it true. That pair is a
   * setState inside an effect body, which is a cascading render and which
   * this project's lint refuses; this asks the same question — "is there a
   * client yet" — as what it actually is, a value that differs between the
   * server snapshot and the live one, and answers it during the first
   * client render instead of one render later.
   */
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);

  // While the sheet is up: lock the page behind it and let Escape close it.
  // The same two things the site menu does, for the same reasons.
  useEffect(() => {
    if (!open) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  /**
   * Focus moves to the sheet itself once it has started arriving, not to the
   * close button and not to the search field.
   *
   * Not the close button, because a programmatic `focus()` on a real control
   * still satisfies `:focus-visible` when the browser thinks the last
   * interaction was keyboard-ish, and the site's focus ring is a 2px brass
   * outline — opening the sheet by tapping would paint a gold ring around
   * the X for no reason. A container with `tabindex="-1"` is never
   * `:focus-visible`.
   *
   * And not the search field, because focusing a text input on a phone
   * throws the keyboard up over the sheet before the reader has seen what
   * is in it.
   */
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => sheet.current?.focus(), SHEET_MS / 3);
    return () => window.clearTimeout(id);
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <div
      inert={!open}
      className={cn(
        "fixed inset-0 z-[70] transition-[visibility] duration-0 desk:hidden",
        open ? "visible" : "invisible",
      )}
      // Held visible on the way out for as long as the sheet takes to leave,
      // so it is still painted while it slides. `visibility` is not
      // interpolable but it is transitionable, which is exactly what is
      // wanted: it holds its old value for the delay, then switches in one
      // step.
      style={{ transitionDelay: open ? "0ms" : `${SHEET_MS}ms` }}
    >
      {/* The page behind, dimmed. Also the tap target for closing — a sheet
          that only closes by its X is a sheet people get stuck in. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "absolute inset-0 w-full cursor-default bg-navy-950/45 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        )}
        style={{
          transitionDuration: `${SHEET_MS}ms`,
          transitionTimingFunction: "var(--ease-out-soft)",
        }}
      />

      <div
        ref={sheet}
        role="dialog"
        aria-modal="true"
        aria-label="Custom search"
        tabIndex={-1}
        className={cn(
          // The whole screen, not a drawer down one side. It was a drawer,
          // on the reasoning that a strip of the list showing past its edge
          // says the list is still there — but a strip is also 12% of a
          // phone's width spent on saying so, and the controls are the
          // thing. Asked for full screen (2026-09-14).
          "absolute inset-0 flex flex-col overflow-hidden outline-none",
          "transition-transform",
          open ? "translate-x-0" : "translate-x-full",
        )}
        style={{
          transitionDuration: `${SHEET_MS}ms`,
          transitionTimingFunction: "var(--ease-out-soft)",
        }}
      >
        {/* The cloth, and the cream wash over it. Both are the finder's —
            the phone crop of the same photograph and the same three-stop
            gradient. `priority` is deliberately not set: the sheet is shut
            on arrival, so this is the one image on the page that should be
            fetched last. */}
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <Image
            src={img.backdropFabricPhone}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,252,248,0.72)_0%,rgba(255,252,248,0.6)_50%,rgba(255,252,248,0.76)_100%)]"
        />

        {/* ------------------------------------------------------ The head */}
        {/* No title. The search field is the first thing, standing where the
            finder puts its headline — and the close button sits above it
            rather than beside it, so the field gets the full width of the
            screen it is now on. */}
        <div className="px-5 pb-5 pt-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close custom search"
              className="-mr-1.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-navy-800 transition-colors duration-200 hover:bg-navy-900/10"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="relative mt-1">
            <SearchIcon className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-800/55" />
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search by project name"
              aria-label="Search by project name"
              className="w-full rounded-full border border-navy-900/25 bg-white/55 py-3.5 pl-12 pr-4 text-[0.9375rem] text-navy-950 placeholder:text-navy-900/45 focus:border-navy-900/50 focus:bg-white/75 focus:outline-none"
            />
          </div>
        </div>

        {/* --------------------------------------------- The controls, and
            the only part of the sheet that scrolls. The head names it and
            the foot acts on it; both stay put while the middle moves, so
            "Show 4 projects" is reachable from anywhere in the list however
            many filters end up in it. */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
          {groups.map((group) => (
            <Field key={group.key} label={group.label}>
              <div className="flex flex-wrap gap-2">
                {/* `Any` is a pill of its own rather than a "clear" affordance
                    beside them, so every group has a visible current answer.
                    Without it a group with nothing chosen reads as a group
                    the reader has not got to yet. */}
                <Pill
                  selected={group.value === ""}
                  onClick={() => onChoose(group.key, "")}
                >
                  Any
                </Pill>
                {group.options.map((option) => (
                  <Pill
                    key={option}
                    selected={group.value === option}
                    onClick={() =>
                      onChoose(group.key, group.value === option ? "" : option)
                    }
                  >
                    {option}
                  </Pill>
                ))}
              </div>
            </Field>
          ))}
        </div>

        {/* ------------------------------------------------------ The foot */}
        {/* The rule is a hairline of the cloth's own tone rather than the
            site's `border-line`, which is a blue-grey drawn for white and
            reads as a scratch on this ground. */}
        <div className="flex items-center gap-3 border-t border-navy-900/15 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "flex-1 rounded-full border border-white/25 px-6 py-3.5",
              "text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-white",
              "bg-[linear-gradient(135deg,rgba(22,48,95,0.94)_0%,#0a1f44_100%)]",
              "shadow-[0_8px_24px_0_rgba(10,31,68,0.24),inset_0_1px_0_0_rgba(255,255,255,0.28)]",
              "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.99]",
            )}
          >
            {resultCount === 0
              ? "No matches"
              : `Show ${resultCount} project${resultCount === 1 ? "" : "s"}`}
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={!isFiltered}
            className="rounded-full border border-navy-900/25 px-5 py-3.5 text-[0.8125rem] font-semibold text-navy-900 transition-colors duration-300 hover:bg-navy-900/10 disabled:opacity-40"
          >
            Reset
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** A labelled block of controls. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-7 first:mt-1 last:mb-0">
      <p className="mb-3 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-navy-800">
        {label}
      </p>
      {children}
    </div>
  );
}

/** One choice. Tapping the chosen one again puts the group back to `Any`. */
function Pill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-[0.8125rem] font-semibold transition-all duration-200 active:scale-[0.97]",
        selected
          ? "border-navy-950 bg-navy-950 text-white"
          : "border-navy-900/25 bg-white/45 text-navy-900",
      )}
    >
      {children}
    </button>
  );
}
