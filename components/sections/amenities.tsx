"use client";

import { useState } from "react";
import { amenityIcons } from "@/components/ui/amenity-icons";
import type { Amenity, AmenityGroup } from "@/lib/amenities";
import { cn } from "@/lib/cn";

/**
 * One amenity. The icon and name give way to the description on hover.
 *
 * Both are always in the DOM, so a screen reader reads the description
 * whether or not it is showing. The card is a button rather than a plain box
 * because hover alone strands touch and keyboard users: tapping or focusing
 * reveals the same line.
 */
function AmenityCard({ amenity }: { amenity: Amenity }) {
  const [held, setHeld] = useState(false);
  const Icon = amenityIcons[amenity.icon];

  return (
    <button
      type="button"
      onClick={() => setHeld((was) => !was)}
      onBlur={() => setHeld(false)}
      aria-expanded={held}
      className="group/card relative flex aspect-[5/4] w-full flex-col items-center justify-center rounded-[1.25rem] border border-line bg-white p-5 text-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-rosegold-400 hover:shadow-soft sm:rounded-[1.5rem] sm:p-6"
    >
      <span
        className={cn(
          "flex flex-col items-center transition-opacity duration-300",
          held ? "opacity-0" : "opacity-100 group-hover/card:opacity-0",
        )}
      >
        <Icon className="h-8 w-8 text-rosegold-600 sm:h-9 sm:w-9" />
        <span className="mt-4 font-display text-[1rem] leading-snug text-navy-900 sm:text-[1.125rem]">
          {amenity.name}
        </span>
      </span>

      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center px-5 text-[0.8125rem] leading-relaxed text-slate-body transition-opacity duration-300 sm:px-6 sm:text-[0.875rem]",
          held ? "opacity-100" : "opacity-0 group-hover/card:opacity-100",
        )}
      >
        {amenity.description}
      </span>
    </button>
  );
}

/**
 * Amenities, segmented into groups you tab between.
 *
 * The tab strip is a real tablist, so arrow keys move between segments the way
 * the platform's own tabs do.
 */
export function Amenities({ groups }: { groups: readonly AmenityGroup[] }) {
  const [active, setActive] = useState(0);

  const focusTab = (index: number) => {
    const next = (index + groups.length) % groups.length;
    setActive(next);
    document.getElementById(`amenity-tab-${next}`)?.focus();
  };

  return (
    <div>
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="Amenity groups"
          className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-mist p-1.5"
        >
          {groups.map((group, index) => (
            <button
              key={group.title}
              id={`amenity-tab-${index}`}
              role="tab"
              type="button"
              aria-selected={index === active}
              aria-controls={`amenity-panel-${index}`}
              tabIndex={index === active ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  focusTab(active + 1);
                }
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  focusTab(active - 1);
                }
              }}
              className={cn(
                "shrink-0 rounded-full px-6 py-2.5 text-[0.875rem] font-semibold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                index === active
                  ? "bg-white text-navy-900 shadow-soft"
                  : "text-slate-body hover:text-navy-900",
              )}
            >
              {group.title}
            </button>
          ))}
        </div>
      </div>

      {groups.map((group, index) => (
        <div
          key={group.title}
          id={`amenity-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`amenity-tab-${index}`}
          hidden={index !== active}
          // The display utility is applied conditionally rather than relying on
          // the `hidden` attribute alone: `grid` and the preflight `[hidden]`
          // rule carry the same specificity, and the utility wins on order.
          className={cn(
            "mt-12 grid-cols-2 gap-4 sm:gap-5 lg:mt-14 lg:grid-cols-4",
            index === active ? "grid" : "hidden",
          )}
        >
          {group.amenities.map((amenity) => (
            <AmenityCard key={amenity.name} amenity={amenity} />
          ))}
        </div>
      ))}
    </div>
  );
}
