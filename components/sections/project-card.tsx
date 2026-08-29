import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  AreaIcon,
  BedIcon,
  BuildingIcon,
  MapPinIcon,
  UnitsIcon,
} from "@/components/ui/line-icons";
import type { Project } from "@/lib/projects";

/** One headline fact: a labelled figure, not a chip. */
function Stat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-slate-muted">
        {/* Navy rather than the rose-gold these carried: rose-gold is the
            card's accent and the status pill already spends it. Four pink
            marks in a row underneath were spending it a second time, on the
            one part of the card that is only labelling. */}
        <span className="text-navy-600">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1.5 text-[0.875rem] leading-snug text-navy-900">
        {value}
      </dd>
    </div>
  );
}

/**
 * A project in the listing.
 *
 * Two shapes, chosen by whether the project has its headline details filled
 * in. A project with them gets the featured card — photograph inset in the
 * frame, name and standing on one line underneath, and its four facts set out
 * below that as labelled figures. Everything else gets the plain card, which
 * is the same frame with a caption, so a grid of mostly-placeholder projects
 * still lines up evenly.
 *
 * The facts are figures rather than the chips they were briefly drawn as.
 * Chips over the photograph can only carry a value — "3.5 Acres" reads on its
 * own, but "2, 3 & 4 BHK" and "242 Units" have to spell out what they are, and
 * the project type could not be shown at all. A labelled figure says both
 * halves in less space and lets all four facts through.
 *
 * Today `detailed` is exactly Hara Vijaya Heights, because it is the only
 * project whose real details have come in. That is deliberate rather than a
 * hard-coded name: fill in the four fields for the next project and it gets
 * the same card, with nothing here to remember to change.
 *
 * Projects with a page of their own make the whole card a link. Which card
 * shape is drawn changes nothing about that — the featured card is still one
 * link to the same place.
 */
export function ProjectCard({ project }: { project: Project }) {
  const detailed = Boolean(project.projectType);

  const card = (
    <article
      className={[
        // A hairline of the navy the site is built on, tinted right back.
        // The rose-gold frame was doing the work of an accent on every card
        // at once, which left nothing for the one card that is actually
        // different to be accented *with*.
        "flex h-full flex-col rounded-[1.5rem] border border-navy-200 bg-white sm:rounded-[1.75rem]",
        // The picture sits inside the frame rather than filling it, so the
        // frame reads as a mount around the photograph.
        detailed ? "p-2.5 sm:p-3" : "overflow-hidden",
        "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1",
      ].join(" ")}
    >
      <div
        className={[
          "relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-mist",
          detailed ? "rounded-[1.05rem] sm:rounded-[1.3rem]" : "",
        ].join(" ")}
      >
        {project.image ? (
          <Image
            src={project.image}
            alt={project.imageAlt ?? ""}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center text-navy-200"
          >
            <BuildingIcon className="h-10 w-10" />
          </span>
        )}

        {/* Locality, read straight off the same field the filter uses. Both
            card shapes carry it, so the grid reads as one set of cards. */}
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-navy-950/75 py-1.5 pl-2.5 pr-3.5 text-[0.6875rem] font-medium text-white">
          <MapPinIcon className="h-3.5 w-3.5" />
          {project.locality}
        </span>
      </div>

      {detailed ? (
        <div className="flex flex-1 flex-col px-2 pb-2.5 pt-5 sm:px-2.5 sm:pb-3 sm:pt-6">
          <div className="flex items-center justify-between gap-3">
            {/* Set in the sans, following the reference this card is drawn
                from. It is the one card in the grid carrying this shape, and
                the type is part of what marks it out. */}
            <h3 className="min-w-0 font-sans text-[1.1875rem] font-medium leading-snug tracking-[-0.01em] text-navy-900 sm:text-[1.3125rem]">
              {project.name}
            </h3>

            {/* Where the reference puts a price. A project has no single
                number like that; what someone scanning the grid actually
                wants is whether they can still buy into it. */}
            <span className="shrink-0 rounded-full bg-rosegold-200 px-4 py-2 text-[0.8125rem] font-semibold leading-none text-navy-900 sm:text-[0.875rem]">
              {project.status}
            </span>
          </div>

          {/* Two up on a phone, four across once the card is wide enough to
              set them out in one line — which, in a two-column grid, is most
              of the time. */}
          <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-5 border-t border-line pt-5 lg:grid-cols-4">
            <Stat
              icon={<BuildingIcon className="h-3.5 w-3.5" />}
              label="Project Type"
              value={project.projectType ?? ""}
            />
            <Stat
              icon={<BedIcon className="h-3.5 w-3.5" />}
              label="Layout"
              value={project.layout ?? project.bhk.join(", ")}
            />
            <Stat
              icon={<AreaIcon className="h-3.5 w-3.5" />}
              label="Dev. Size"
              value={project.devSize ?? ""}
            />
            <Stat
              icon={<UnitsIcon className="h-3.5 w-3.5" />}
              label="Total Units"
              value={project.totalUnits ?? ""}
            />
          </dl>
        </div>
      ) : (
        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <h3 className="font-display text-[1.375rem] leading-snug text-navy-900 sm:text-[1.5rem]">
            {project.name}
          </h3>
          <p className="mt-3 text-[0.8125rem] uppercase tracking-[0.16em] text-slate-muted">
            {project.bhk.join(", ")} · {project.status}
          </p>
        </div>
      )}
    </article>
  );

  if (!project.slug) return card;

  return (
    <Link
      href={`/residential/${project.slug}`}
      aria-label={`${project.name} — project details`}
      className="block h-full rounded-[1.5rem] sm:rounded-[1.75rem]"
    >
      {card}
    </Link>
  );
}
