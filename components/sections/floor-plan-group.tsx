"use client";

import Image from "next/image";
import type { ReactElement } from "react";
import { useState } from "react";
import { PanelHeading } from "@/components/ui/panel-heading";
import { ImagePreview } from "@/components/ui/image-preview";
import {
  ArrowRightIcon,
  BalconyIcon,
  BathIcon,
  BedIcon,
  ExpandIcon,
  KitchenIcon,
  LevelsIcon,
  SofaIcon,
  TerraceIcon,
} from "@/components/ui/line-icons";
import type {
  FloorPlanFeatureIcon,
  FloorPlanGroup as Group,
} from "@/lib/floor-plans";
import { cn } from "@/lib/cn";

/** Spec-row glyphs, keyed the way `lib/floor-plans.ts` names them. */
const featureIcons: Record<
  FloorPlanFeatureIcon,
  (props: { className?: string }) => ReactElement
> = {
  bed: BedIcon,
  bath: BathIcon,
  living: SofaIcon,
  kitchen: KitchenIcon,
  balcony: BalconyIcon,
  levels: LevelsIcon,
  terrace: TerraceIcon,
};

/**
 * One layout family: its types listed down the left, the selected plan on the
 * right — and, beside that plan, a panel spelling out what the drawing holds.
 *
 * The types read as a list of rows rather than as a stack of cards: label and
 * facing on the left, area on the right, a hairline between each. Only the
 * selected row is filled in, which is what makes the selection legible without
 * a second visual system on top.
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
    <div className="grid gap-10 lg:grid-cols-[minmax(17rem,22rem)_1fr] lg:gap-14">
      <div>
        <PanelHeading subtitle={group.subtitle}>{group.title}</PanelHeading>

        <ul className="mt-8">
          {group.types.map((type, index) => {
            const selected = index === active;

            return (
              <li
                key={type.label}
                className={cn(
                  // The rule belongs between rows, and it has to disappear
                  // under a filled row — a hairline running into the top of a
                  // navy pill reads as a mistake.
                  index > 0 && !selected && !(index - 1 === active)
                    ? "border-t border-line"
                    : "",
                )}
              >
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-pressed={selected}
                  className={cn(
                    "group/type w-full rounded-2xl px-5 py-4 text-left transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    selected
                      ? "bg-navy-900 text-white"
                      : "text-navy-900 hover:bg-mist",
                  )}
                >
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="font-display text-[1.125rem] leading-none">
                      {type.label}
                    </span>
                    <span
                      className={cn(
                        "flex shrink-0 items-center gap-2 text-[0.8125rem] font-medium",
                        selected ? "text-white" : "text-slate-body",
                      )}
                    >
                      {type.area ?? "Plan"}
                      <ArrowRightIcon
                        className={cn(
                          "h-3.5 w-3.5 transition-transform duration-300",
                          selected
                            ? "translate-x-0"
                            : "group-hover/type:translate-x-0.5",
                        )}
                      />
                    </span>
                  </span>
                  <span
                    className={cn(
                      "mt-2 block text-[0.75rem] leading-snug",
                      selected ? "text-navy-100/75" : "text-slate-muted",
                    )}
                  >
                    {type.facing}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* The plan, and what it contains, in one frame. */}
      <div className="border-rosegold overflow-hidden rounded-[1.75rem] bg-white p-6 sm:rounded-[2rem] sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,15rem)_1fr] lg:gap-10">
          {/* Specification, down the left. */}
          <div className="flex flex-col">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-slate-muted">
              {plan.label}
            </p>
            <h3 className="mt-3 font-display text-[1.375rem] leading-tight text-navy-900 sm:text-[1.5rem]">
              {group.residence}
            </h3>

            <div className="mt-5 h-px w-full bg-line" />

            <ul className="mt-5 space-y-3.5">
              {plan.features.map((feature, index) => {
                const Icon = featureIcons[feature.icon];

                return (
                  <li
                    key={`${feature.label}-${index}`}
                    className="flex items-center gap-3 text-[0.875rem] leading-snug text-slate-body"
                  >
                    <Icon className="h-[1.125rem] w-[1.125rem] shrink-0 text-rosegold-600" />
                    {feature.label}
                  </li>
                );
              })}
            </ul>

            {plan.area && (
              <>
                <div className="mt-6 h-px w-full bg-line" />
                <p className="mt-6 text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-slate-muted">
                  Total Area
                </p>
                <p className="mt-2 font-display text-[1.75rem] leading-none text-navy-900 sm:text-[2rem]">
                  {plan.area}
                </p>
              </>
            )}
          </div>

          {/* The drawing itself. */}
          <div>
            <button
              type="button"
              onClick={() => setPreview(true)}
              aria-label={`View the ${group.title} ${plan.label} plan full screen`}
              className="group/plan relative block w-full cursor-zoom-in overflow-hidden rounded-[1.25rem] bg-white ring-1 ring-line sm:rounded-[1.5rem]"
            >
              <Image
                key={plan.image.src}
                src={plan.image}
                alt={plan.alt}
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="h-auto w-full"
              />
              <span
                aria-hidden="true"
                className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-navy-950/70 px-3 py-1.5 text-[0.6875rem] font-medium text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover/plan:opacity-100"
              >
                <ExpandIcon className="h-3.5 w-3.5" />
                Enlarge
              </span>
            </button>

            <p className="mt-3 px-1 text-center text-[0.75rem] uppercase tracking-[0.16em] text-slate-muted">
              {plan.facing}
            </p>
          </div>
        </div>
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
