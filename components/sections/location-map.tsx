import { GoogleMapsLogo } from "@/components/ui/google-maps-logo";
import { MapPinIcon } from "@/components/ui/line-icons";
import { embedUrl, searchUrl, type MapLocation } from "@/lib/locations";

/**
 * A place, given the full width: the live map across the top, then what is
 * around it on the left and the way out to Google Maps on the right.
 *
 * The frame is lazy — a map is heavy and neither of these is the first thing
 * on the page — and titled, because an unlabelled frame is announced only as
 * "frame" by a screen reader.
 *
 * The handoff is the Google Maps mark itself rather than a worded pill. On a
 * phone the link opens the app; on a desktop it opens Maps in a tab. Either
 * way the logo says where you are going before the label does, so the label
 * sits under it as confirmation.
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
          className="block h-[20rem] w-full rounded-[1.25rem] border-0 sm:h-[28rem] sm:rounded-[1.5rem] lg:h-[34rem]"
        />
      </div>

      <div className="mt-10 grid gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16">
        <div>
          <h3 className="font-display text-[1.75rem] leading-snug text-navy-900 sm:text-[2.125rem]">
            {location.title}
          </h3>

          <p className="mt-3 flex items-start gap-2 text-[0.875rem] font-semibold text-slate-muted">
            <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-rosegold-600" />
            {location.address}
          </p>

          <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-slate-body">
            {location.body}
          </p>
        </div>

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex w-full max-w-[15rem] flex-col items-center justify-center gap-5 rounded-[1.75rem] border border-line-strong bg-white px-8 py-10 text-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-rosegold-400 hover:shadow-soft lg:w-[15rem]"
        >
          <GoogleMapsLogo className="h-24 w-auto transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 sm:h-28" />
          <span className="text-[0.875rem] font-semibold text-navy-900">
            Open in Google Maps
          </span>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </div>
  );
}
