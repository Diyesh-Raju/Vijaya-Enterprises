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
        <Icon className="h-12 w-12 text-rosegold-600 sm:h-14 sm:w-14" />
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
 * Every amenity in the project, four to a row.
 *
 * There used to be a tab strip across the top and only one group on screen at
 * a time. It cost a click to find out what else was here, and it hid three
 * quarters of the list behind labels nobody was looking for — someone reading
 * an amenities page wants the whole list. `groups` still arrives grouped
 * because that is how the brochure sets it out, and the order the groups are
 * declared in is the order the tiles run.
 */
export function Amenities({ groups }: { groups: readonly AmenityGroup[] }) {
  const amenities = groups.flatMap((group) => group.amenities);

  return (
    <ul className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {amenities.map((amenity) => (
        <li key={amenity.name}>
          <AmenityCard amenity={amenity} />
        </li>
      ))}
    </ul>
  );
}
