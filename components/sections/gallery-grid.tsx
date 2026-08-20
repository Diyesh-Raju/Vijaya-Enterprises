"use client";

import Image from "next/image";
import { useState } from "react";
import { ImagePreview } from "@/components/ui/image-preview";
import { ExpandIcon } from "@/components/ui/line-icons";
import type { GalleryImage, GallerySection } from "@/lib/gallery";
import { cn } from "@/lib/cn";

/**
 * Where each picture sits, per section, on a twelve-column grid.
 *
 * Below `lg` every layout collapses to one or two columns — the shapes here
 * only mean anything once there is room for them.
 */
const LAYOUTS: Record<GallerySection["layout"], readonly string[]> = {
  // Two wide frames stacked on the left, a portrait running the full height
  // beside them.
  exterior: [
    "lg:col-span-5 lg:row-start-1",
    "lg:col-span-4 lg:col-start-6 lg:row-start-1",
    "lg:col-span-3 lg:col-start-10 lg:row-span-2 lg:row-start-1",
    "lg:col-span-5 lg:row-start-2",
    "lg:col-span-4 lg:col-start-6 lg:row-start-2",
  ],
  // A broad frame and two squarer ones, then two more stepped in beneath, so
  // the block reads as staggered rather than as a plain grid.
  amenities: [
    "lg:col-span-5 lg:row-start-1",
    "lg:col-span-4 lg:col-start-6 lg:row-start-1",
    "lg:col-span-3 lg:col-start-10 lg:row-start-1",
    "lg:col-span-5 lg:col-start-3 lg:row-start-2",
    "lg:col-span-4 lg:col-start-8 lg:row-start-2",
  ],
  // Full width, one under the other: these are wide collages and shrinking
  // them would lose the rooms inside.
  renders: ["lg:col-span-12", "lg:col-span-12"],
  plans: ["lg:col-span-4", "lg:col-span-4", "lg:col-span-4"],
};

/** The frame's proportions, so a row lines up even with mixed source ratios. */
const RATIOS: Record<GalleryImage["span"], string> = {
  wide: "aspect-[16/9]",
  medium: "aspect-[4/3]",
  tall: "aspect-[3/4] lg:aspect-auto lg:h-full",
  square: "aspect-square",
  full: "aspect-[16/10] sm:aspect-[16/9]",
};

function Tile({
  item,
  className,
  contain,
  onOpen,
}: {
  item: GalleryImage;
  className?: string;
  /** Drawings are fitted whole; a photographic crop would cut them. */
  contain?: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View larger: ${item.alt}`}
      className={cn(
        "group/tile relative block w-full cursor-zoom-in overflow-hidden rounded-[1.25rem] bg-white shadow-soft",
        contain && "p-3 sm:p-4",
        "ring-1 ring-line transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-1 hover:shadow-lift hover:ring-rosegold-400 sm:rounded-[1.5rem]",
        RATIOS[item.span],
        className,
      )}
    >
      <Image
        src={item.image}
        alt={item.alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
        className={cn(
          "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          contain
            ? "object-contain p-1 group-hover/tile:scale-[1.02]"
            : "object-cover group-hover/tile:scale-[1.04]",
        )}
      />
      <span
        aria-hidden="true"
        className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-navy-950/70 px-3 py-1.5 text-[0.6875rem] font-medium text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover/tile:opacity-100"
      >
        <ExpandIcon className="h-3.5 w-3.5" />
        Enlarge
      </span>
    </button>
  );
}

export function GalleryGrid({ section }: { section: GallerySection }) {
  const [open, setOpen] = useState<number | null>(null);
  const spans = LAYOUTS[section.layout];
  const contain = section.layout === "plans";

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-12 lg:gap-6">
        {section.images.map((item, index) => (
          <Tile
            key={item.alt}
            item={item}
            className={spans[index]}
            contain={contain}
            onOpen={() => setOpen(index)}
          />
        ))}
      </div>

      {section.images.map((item, index) => (
        <ImagePreview
          key={item.alt}
          image={item.image}
          alt={item.alt}
          caption={`${section.title} — ${item.alt}`}
          open={open === index}
          onClose={() => setOpen(null)}
        />
      ))}
    </>
  );
}
