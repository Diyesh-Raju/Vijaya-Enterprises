"use client";

import Image from "next/image";
import { useState } from "react";
import { PanelHeading } from "@/components/ui/panel-heading";
import { ImagePreview } from "@/components/ui/image-preview";
import { ExpandIcon } from "@/components/ui/line-icons";
import type { FloorPlanGroup as Group } from "@/lib/floor-plans";
import { cn } from "@/lib/cn";

/**
 * One layout family: its types listed down the left, the selected plan on the
 * right.
 *
 * Each group keeps its own selection, so choosing a 3 BHK type does not
 * disturb the 2 BHK block further up the page. The plans are drawings rather
 * than photographs, so they sit on white with room to breathe rather than
 * being cropped to fill a frame.
 */
export function FloorPlanGroup({ group }: { group: Group }) {
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState(false);
  const plan = group.types[active];

  const caption = [
    `${group.title} · ${plan.label}`,
    plan.facing,
    plan.area,
    plan.terrace,
  ]
    .filter(Boolean)
    .join(" — ");

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(15rem,19rem)_1fr] lg:gap-14">
      <div>
        <PanelHeading subtitle={group.subtitle}>{group.title}</PanelHeading>

        <ul className="mt-8 space-y-3">
          {group.types.map((type, index) => {
            const selected = index === active;

            return (
              <li key={type.label}>
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-pressed={selected}
                  className={cn(
                    "w-full rounded-2xl border px-6 py-4 text-left transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    selected
                      ? "border-navy-900 bg-navy-900 text-white"
                      : "border-line-strong bg-white text-navy-900 hover:-translate-y-0.5 hover:border-rosegold-400 hover:shadow-soft",
                  )}
                >
                  <span className="font-display text-[1.125rem] leading-none">
                    {type.label}
                  </span>
                  <span
                    className={cn(
                      "mt-2 block text-[0.75rem] leading-snug",
                      selected ? "text-navy-100/75" : "text-slate-muted",
                    )}
                  >
                    {type.facing}
                    {type.area && ` · ${type.area}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setPreview(true)}
          aria-label={`View the ${group.title} ${plan.label} plan full screen`}
          className="border-rosegold group/plan relative block w-full cursor-zoom-in overflow-hidden rounded-[1.75rem] bg-white p-4 sm:rounded-[2rem] sm:p-6"
        >
          <Image
            key={plan.image.src}
            src={plan.image}
            alt={plan.alt}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="h-auto w-full"
          />
          <span
            aria-hidden="true"
            className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-navy-950/70 px-3 py-1.5 text-[0.6875rem] font-medium text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover/plan:opacity-100 sm:right-7 sm:top-7"
          >
            <ExpandIcon className="h-3.5 w-3.5" />
            Enlarge
          </span>
        </button>

        <p className="mt-4 px-1 text-[0.8125rem] text-slate-muted">{caption}</p>
      </div>

      <ImagePreview
        image={plan.image}
        alt={plan.alt}
        caption={caption}
        open={preview}
        onClose={() => setPreview(false)}
      />
    </div>
  );
}
