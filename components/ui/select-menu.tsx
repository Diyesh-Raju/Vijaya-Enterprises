"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/ui/line-icons";
import { cn } from "@/lib/cn";

/**
 * A filter control that looks like the rest of the site.
 *
 * A native `<select>` hands its list to the operating system, which paints it
 * in system chrome no CSS can reach. This renders the list itself so the
 * options carry the site's type and the chosen one reads in rose gold.
 *
 * Built as a menu of real buttons rather than an ARIA listbox with
 * `aria-activedescendant`: focus lands on actual elements, so arrow keys,
 * Escape and focus return behave the way the browser already implements them.
 *
 * Two layouts, one behaviour. `inline` is the compact pill the project filters
 * use, with the label sitting inside the control. `stacked` puts the label
 * above a full-width field, for forms where the controls line up in a grid and
 * a ragged row of pills would read as a mistake.
 */
export function SelectMenu({
  label,
  value,
  options,
  anyLabel = "Any",
  layout = "inline",
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  anyLabel?: string;
  layout?: "inline" | "stacked";
  onChange: (value: string) => void;
}) {
  const stacked = layout === "stacked";
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const choices = [{ value: "", text: anyLabel }].concat(
    options.map((option) => ({ value: option, text: option })),
  );
  const current = choices.find((choice) => choice.value === value) ?? choices[0];

  // Close when the pointer goes elsewhere, or when focus leaves entirely.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Opening moves focus onto the current choice, so arrow keys start there.
  useEffect(() => {
    if (!open) return;
    const checked = panel.current?.querySelector<HTMLButtonElement>(
      '[aria-checked="true"]',
    );
    (checked ?? panel.current?.querySelector("button"))?.focus();
  }, [open]);

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  };

  const moveFocus = (from: HTMLElement, step: 1 | -1) => {
    const items = [
      ...(panel.current?.querySelectorAll<HTMLButtonElement>("button") ?? []),
    ];
    const next = items[items.indexOf(from as HTMLButtonElement) + step];
    (next ?? items[step === 1 ? 0 : items.length - 1]).focus();
  };

  return (
    <div ref={wrapper} className="relative">
      {stacked && (
        <span className="mb-2 block text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-rosegold-600">
          {label}
        </span>
      )}
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Filter by ${label}`}
        onClick={() => setOpen((was) => !was)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "rounded-full border transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          stacked
            ? "flex w-full items-center justify-between gap-2 bg-white/60 px-5 py-3 shadow-sm backdrop-blur-md hover:shadow-md"
            : "inline-flex items-center gap-2.5 bg-white py-2.5 pl-5 pr-4 hover:-translate-y-0.5 hover:shadow-soft",
          // The rose border is a "you narrowed this" cue, which only reads on
          // the inline pills — a stacked field always carries a value.
          stacked
            ? "border-line"
            : value === ""
              ? "border-line-strong"
              : "border-rosegold-400",
        )}
      >
        {!stacked && (
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-slate-muted">
            {label}
          </span>
        )}
        <span
          className={cn(
            "text-[0.875rem] text-navy-900",
            stacked ? "truncate" : "font-semibold",
          )}
        >
          {current.text}
        </span>
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 shrink-0 text-navy-900 transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          ref={panel}
          role="menu"
          aria-label={label}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              close();
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              moveFocus(event.target as HTMLElement, 1);
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              moveFocus(event.target as HTMLElement, -1);
            }
            if (event.key === "Tab") close(false);
          }}
          className={cn(
            "absolute left-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden rounded-[1.25rem] border border-line bg-white py-2 shadow-lift",
            stacked ? "w-full" : "min-w-[12rem]",
          )}
        >
          {choices.map((choice) => {
            const checked = choice.value === value;

            return (
              <button
                key={choice.value || "any"}
                type="button"
                role="menuitemradio"
                aria-checked={checked}
                onClick={() => {
                  onChange(choice.value);
                  close();
                }}
                className={cn(
                  "block w-full px-5 py-3 text-left text-[0.9375rem] transition-colors duration-200",
                  checked
                    ? "font-semibold text-rosegold-600"
                    : "text-navy-900 hover:bg-navy-50",
                )}
              >
                {choice.text}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
