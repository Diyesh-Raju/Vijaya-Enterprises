import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";

export type IconCardItem = {
  title: string;
  body?: string;
  icon: ReactNode;
};

/**
 * Centred cards in a rose-gold frame, each led by a line icon.
 *
 * The frame is the same `border-rosegold` metal gradient the apartment project
 * cards use, so the two card families on the Residential page read as one set.
 * Because the fill is white, these are meant for a white section — on mist the
 * ring would still show, but the card would lose its lift.
 *
 * Rendered as a definition list so each heading keeps its explanation for
 * screen readers. Icons are decorative; the heading carries the meaning.
 */
export function IconCards({
  items,
  columns = 3,
  className,
}: {
  items: readonly IconCardItem[];
  columns?: 2 | 3;
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid gap-5 sm:gap-6",
        columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2",
        className,
      )}
    >
      {items.map((item, index) => (
        <Reveal
          key={item.title}
          delay={(index % 3) * 70}
          className="border-rosegold flex flex-col items-center rounded-[1.5rem] bg-white p-8 text-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 sm:rounded-[1.75rem] sm:p-9"
        >
          <span className="text-rosegold-600">{item.icon}</span>
          <dt className="mt-5 font-display text-[1.25rem] leading-snug text-navy-900 sm:text-[1.375rem]">
            {item.title}
          </dt>
          {item.body && (
            <dd className="mt-3 text-[0.9375rem] leading-relaxed text-slate-body">
              {item.body}
            </dd>
          )}
        </Reveal>
      ))}
    </dl>
  );
}
