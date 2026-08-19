import { ArrowUpRightIcon, MapPinIcon } from "@/components/ui/line-icons";
import { embedUrl, searchUrl, type MapLocation } from "@/lib/locations";

/**
 * A place: the live map, then what is around it, then a way out to Google
 * Maps proper.
 *
 * The frame is lazy — a map is heavy and neither of these is the first thing
 * on the page — and titled, because an unlabelled frame is announced only as
 * "frame" by a screen reader.
 */
export function LocationMap({ location }: { location: MapLocation }) {
  const href = location.link ?? searchUrl(location.query);

  return (
    <div>
      <div className="border-rosegold relative overflow-hidden rounded-[1.75rem] bg-white p-2 sm:rounded-[2rem] sm:p-2.5">
        <iframe
          src={embedUrl(location)}
          title={`Map showing ${location.address}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-[20rem] w-full rounded-[1.25rem] border-0 sm:h-[26rem] sm:rounded-[1.5rem]"
        />
      </div>

      <h3 className="mt-8 font-display text-[1.5rem] leading-snug text-navy-900 sm:text-[1.75rem]">
        {location.title}
      </h3>

      <p className="mt-3 flex items-start gap-2 text-[0.875rem] font-semibold text-slate-muted">
        <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-rosegold-600" />
        {location.address}
      </p>

      <p className="mt-5 text-[1.0625rem] leading-relaxed text-slate-body">
        {location.body}
      </p>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-7 inline-flex items-center gap-2.5 rounded-full border border-line-strong bg-white px-6 py-3 text-[0.875rem] font-semibold text-navy-900 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-rosegold-400 hover:shadow-soft"
      >
        Open in Google Maps
        <ArrowUpRightIcon className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </div>
  );
}
