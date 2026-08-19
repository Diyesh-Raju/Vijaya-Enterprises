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
        <span className="text-rosegold-600">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1.5 text-[0.875rem] leading-snug text-navy-900">
        {value}
      </dd>
    </div>
  );
}

/**
 * A project in the listing: photograph on top, details underneath.
 *
 * Projects that have a page of their own make the whole card a link; the rest
 * render the same shape so the grid stays even, with the picture half standing
 * in until real photography arrives.
 */
export function ProjectCard({ project }: { project: Project }) {
  const detailed = Boolean(project.projectType);

  const card = (
    <article className="border-rosegold flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 sm:rounded-[1.75rem]">
      <div className="relative aspect-[16/11] w-full shrink-0 overflow-hidden bg-mist">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.imageAlt ?? ""}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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

        {/* Locality, read straight off the same field the filter uses. */}
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-navy-950/70 py-1.5 pl-2.5 pr-3.5 text-[0.6875rem] font-medium text-white backdrop-blur-sm">
          <MapPinIcon className="h-3.5 w-3.5" />
          {project.locality}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="font-display text-[1.375rem] leading-snug text-navy-900 sm:text-[1.5rem]">
          {project.name}
        </h3>

        {detailed ? (
          <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-5">
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
        ) : (
          <p className="mt-3 text-[0.8125rem] uppercase tracking-[0.16em] text-slate-muted">
            {project.bhk.join(", ")} · {project.status}
          </p>
        )}
      </div>
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
