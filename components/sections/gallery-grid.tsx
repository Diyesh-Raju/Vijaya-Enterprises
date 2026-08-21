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
  // Three across, then two centred beneath — every frame the same size, so the
  // row reads as a set rather than as a collage.
  exterior: [
    "lg:col-span-4",
    "lg:col-span-4",
    "lg:col-span-4",
    "lg:col-span-4 lg:col-start-3",
    "lg:col-span-4 lg:col-start-7",
  ],
  // Same equal frames, but the second row is stepped in rather than centred,
  // which is the arrangement the section was drawn with.
  amenities: [
    "lg:col-span-4",
    "lg:col-span-4",
    "lg:col-span-4",
    "lg:col-span-4 lg:col-start-3",
    "lg:col-span-4 lg:col-start-7",
  ],
  // Two across, sharing the row. These collages are 1,536px wide, so half a
  // container still resolves sharply on a high-density screen.
  renders: ["lg:col-span-6", "lg:col-span-6"],
  // One under the other, but held in from the edges — a drawing has to stay
  // big enough to read, and at full width these were dominating the page.
  plans: [
    "lg:col-span-10 lg:col-start-2",
    "lg:col-span-10 lg:col-start-2",
    "lg:col-span-10 lg:col-start-2",
  ],
};

/**
 * The frame's proportions.
 *
 * Set per section rather than per picture, so every frame in a section is
 * identical however its source is shaped; `object-cover` takes up the slack.
 */
const RATIOS: Record<GallerySection["layout"], string> = {
  exterior: "aspect-[16/9]",
  amenities: "aspect-[16/9]",
  renders: "aspect-[16/10]",
  plans: "aspect-[4/3] sm:aspect-[16/9]",
};

function Tile({
  item,
  className,
  ratio,
  contain,
  onOpen,
}: {
  item: GalleryImage;
  className?: string;
  ratio: string;
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
        ratio,
        "ring-1 ring-line transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-1 hover:shadow-lift hover:ring-rosegold-400 sm:rounded-[1.5rem]",
        className,
      )}
    >
      <Image
        src={item.image}
        alt={item.alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 45vw"
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
            ratio={RATIOS[section.layout]}
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
