import type { ReactNode } from "react";

/**
 * One icon per thing Vijaya builds, for the grid on the home page.
 *
 * Flat two-tone rather than the hairline glyphs the rest of the site uses:
 * these run at about 90px in a row of five, where a 1.5px outline reads as
 * texture and a warehouse becomes indistinguishable from an office. Solid
 * navy massing with rose-gold accents carries the shape at that size, and
 * keeps the set in the site's palette rather than importing an icon pack's.
 *
 * All five are drawn on a 64-unit grid sitting on the same ground line (y=56)
 * with the same margins, so the row reads as one set rather than five
 * unrelated drawings.
 */

const GROUND = 56;

function BuildIcon({
  children,
  className = "h-24 w-24",
  title,
}: {
  children: ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={className}
    >
      {children}
    </svg>
  );
}

/** A window, a glass panel, a shutter slat — the repeated bits. */
function Panels({
  columns,
  rows,
  width,
  height,
  className,
  rx = 0.8,
}: {
  columns: readonly number[];
  rows: readonly number[];
  width: number;
  height: number;
  className: string;
  rx?: number;
}) {
  return (
    <>
      {rows.map((y) =>
        columns.map((x) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={width}
            height={height}
            rx={rx}
            className={className}
          />
        )),
      )}
    </>
  );
}

/** A tower: slim, many floors, with a lower wing beside it for scale. */
export function ApartmentBuildingIcon({ className }: { className?: string }) {
  return (
    <BuildIcon className={className} title="Apartment buildings">
      {/* Lower wing, set behind */}
      <rect x="8" y="26" width="16" height={GROUND - 26} className="fill-navy-700" />
      <Panels
        columns={[11.5, 18]}
        rows={[31, 38, 45]}
        width={4.5}
        height={4.5}
        className="fill-navy-100"
      />

      {/* The tower */}
      <rect x="24" y="6" width="24" height={GROUND - 6} className="fill-navy-900" />
      <rect x="21.5" y="2.5" width="29" height="4" rx="1.5" className="fill-rosegold-500" />
      <Panels
        columns={[27.5, 34, 40.5]}
        rows={[12, 19, 26, 33, 40]}
        width={4.5}
        height={4.5}
        className="fill-navy-100"
      />
      <rect x="32" y="48" width="8" height="8" rx="1" className="fill-rosegold-400" />
    </BuildIcon>
  );
}

/** A villa: overhanging tiled roof, an arched loggia, a cypress beside it. */
export function VillaIcon({ className }: { className?: string }) {
  return (
    <BuildIcon className={className} title="Villas">
      {/* Cypress, set behind the roof line */}
      <path d="M7 53C2 44 2 27 7 18c5 9 5 26 0 35Z" className="fill-navy-700" />
      <rect x="6" y="51" width="2" height="5" className="fill-navy-800" />

      <rect x="16" y="28" width="42" height={GROUND - 28} className="fill-navy-900" />

      {/* Hipped roof over a deep eave, the way a villa carries its tiles */}
      <path d="M12 29 23 17h28l11 12Z" className="fill-rosegold-500" />
      <rect x="11" y="27.5" width="52" height="3.5" rx="1.75" className="fill-rosegold-400" />

      {/* Upper floor, one window over each arch */}
      <Panels
        columns={[23, 34, 45]}
        rows={[34]}
        width={6}
        height={6.5}
        className="fill-navy-100"
      />

      {/* The loggia — arches wide apart, so the piers between them read */}
      {[26, 37, 48].map((centre) => (
        <path
          key={centre}
          d={`M${centre - 3.5} ${GROUND}V46a3.5 3.5 0 0 1 7 0v${GROUND - 46}Z`}
          className="fill-rosegold-200"
        />
      ))}
    </BuildIcon>
  );
}

/** An office block: wide, low, and mostly glass. */
export function CommercialBuildingIcon({ className }: { className?: string }) {
  return (
    <BuildIcon className={className} title="Commercial buildings">
      <rect x="2" y="15.5" width="60" height="4.5" rx="1.5" className="fill-navy-700" />
      <rect x="4" y="20" width="56" height={GROUND - 20} className="fill-navy-900" />

      {/* Ribbon glazing rather than punched windows — this one is a curtain
          wall, which is what separates an office block from a hotel. */}
      <Panels
        columns={[8]}
        rows={[25, 33, 41]}
        width={48}
        height={5}
        className="fill-rosegold-300"
        rx={1.5}
      />
      {/* Mullions, laid back over the glass */}
      <Panels
        columns={[20, 31.25, 42.5]}
        rows={[25, 33, 41]}
        width={1.5}
        height={5}
        className="fill-navy-900"
        rx={0}
      />

      {/* Entrance under its canopy */}
      <rect x="22" y="48" width="20" height="2" rx="1" className="fill-navy-700" />
      <rect x="26" y="50" width="12" height={GROUND - 50} rx="1" className="fill-rosegold-500" />
    </BuildIcon>
  );
}

/** A shed: a shallow gable over a roller shutter. */
export function WarehouseIcon({ className }: { className?: string }) {
  return (
    <BuildIcon className={className} title="Warehouses">
      <rect x="8" y="32" width="48" height={GROUND - 32} className="fill-navy-900" />
      <path d="M3 33 32 19l29 14Z" className="fill-rosegold-500" />

      {/* Roller shutter, slats and all */}
      <rect x="20" y="37" width="24" height={GROUND - 37} className="fill-navy-100" />
      <Panels
        columns={[20]}
        rows={[41, 45, 49, 53]}
        width={24}
        height={1.5}
        className="fill-navy-300"
        rx={0.4}
      />

      <rect x="11" y="44" width="6" height={GROUND - 44} rx="0.8" className="fill-rosegold-400" />
      <rect x="47" y="38" width="6" height="6" rx="0.8" className="fill-navy-100" />
    </BuildIcon>
  );
}

/**
 * Two hands clasped.
 *
 * Traced from the reference artwork supplied for this icon rather than drawn
 * from primitives — five attempts at building a handshake out of bands and
 * bars read as a chevron, a zipper, or one hand gripping a stick, because the
 * shape depends on overlapping fingers that simple geometry cannot carry at
 * this size.
 *
 * The outline is a vectorised silhouette: the white separations in the source
 * are gaps in the path, so they take whatever the section behind is, and the
 * whole thing scales without the source bitmap. The two sleeves are their own
 * contours, so they carry the rose gold the rest of the set uses as its
 * accent; drop `sleeves` into the first path to make it one flat navy mark.
 *
 * Both paths need `evenodd` — the enclosed white shapes are holes, not
 * separate marks.
 */
const HANDS =
  "M39.27 45.92L37.54 45.88L34.84 44.31L34.17 44.12L33.51 43.5L32.91 43.21L31.66 43.17L30.99 43.44L30.7 43.41L30.64 42.35L30.38 41.48L29.54 40.44L28.87 40.12L28.29 39.99L27.14 40.1L25.79 40.8L25.5 40.81L25.37 40.62L25.32 39.65L24.84 38.69L24.26 38.02L23.29 37.53L22.42 37.39L21.36 37.54L20.2 38.17L19.53 38.71L18.28 40.13L17.89 40.2L10.19 34.13L8.71 33.1L8.43 32.62L8.42 31.76L9.23 28.46L10.32 25.79L11.76 23.19L13.61 20.97L14.04 20.59L14.81 20.19L17.32 19.73L24.06 17.4L26.37 16.82L27.23 16.7L29.64 17.34L30.45 17.79L30.6 18.01L30.59 18.28L26.42 21.36L25.49 22.42L24.47 24.25L22.31 28.87L22.31 30.41L22.86 31.28L23.5 31.76L24.63 32.0L26.08 31.79L27.14 31.37L29.35 29.88L30.93 28.19L31.63 27.04L32.34 26.42L34.46 25.2L35.61 25.01L36.57 25.49L40.91 28.73L46.68 33.4L50.48 36.67L51.16 38.11L51.05 38.98L50.77 39.56L50.05 40.13L49.38 40.26L47.94 39.99L46.97 39.5L44.37 37.21L38.31 32.61L37.54 32.13L36.89 32.24L36.74 32.72L37.15 33.23L43.89 38.27L45.38 39.56L45.66 40.13L45.75 40.9L45.64 41.39L45.35 41.96L44.95 42.39L44.28 42.74L43.7 42.86L42.35 42.84L41.1 42.29L33.78 37.14L33.4 37.03L33.01 37.22L32.88 37.63L33.2 38.15L40.23 43.1L40.65 43.89L40.63 44.76L39.98 45.53ZM51.5 35.9L51.02 35.65L41.58 27.77L37.06 24.43L35.71 23.73L33.4 24.43L31.57 25.56L30.89 26.13L30.26 27.13L29.11 28.48L27.91 29.58L26.75 30.32L25.5 30.73L24.35 30.81L23.85 30.6L23.53 30.22L23.35 29.83L23.37 29.35L25.88 24.05L26.88 22.51L27.33 22.09L32.24 18.55L34.74 17.1L35.61 16.71L36.67 16.51L38.5 16.72L40.71 17.4L44.08 18.74L46.11 19.34L47.17 19.47L48.42 19.2L49.28 19.52L50.83 20.59L52.57 22.71L54.12 25.4L55.07 27.71L55.48 29.06L55.68 31.66L55.55 32.91L55.25 33.44L53.81 34.56ZM25.69 47.37L24.54 47.37L23.48 46.73L23.06 45.91L23.17 44.95L25.02 42.78L26.66 41.47L27.52 41.15L28.58 41.27L29.09 41.58L29.55 42.44L29.58 42.93L29.32 43.6L27.91 45.53L26.75 46.69ZM20.49 44.58L19.15 44.5L18.39 44.08L17.96 43.22L18.08 42.16L20.17 39.65L20.69 39.25L21.84 38.68L23.09 38.72L23.62 39.07L24.0 39.56L24.1 40.62L23.96 41.19L23.29 42.37L22.13 43.65L21.55 44.14ZM30.8 48.81L29.74 48.84L29.34 48.7L28.81 48.13L28.86 47.45L30.02 45.72L31.09 44.72L31.95 44.27L32.53 44.27L32.91 44.52L33.21 44.95L33.34 45.72L33.15 46.39L32.76 47.16L31.95 48.17L31.18 48.7ZM14.62 41.3L13.92 41.19L13.46 40.85L13.11 40.33L12.75 38.98L12.98 38.23L13.56 38.3L15.93 40.23L15.99 40.52L15.87 40.72L15.49 41.0ZM34.26 47.94L33.92 47.84L33.87 47.55L34.65 45.78L34.94 45.72L35.9 46.3L36.02 46.87L35.71 47.31L35.23 47.66Z";

const SLEEVES =
  "M8.55 34.96L7.59 34.93L4.41 33.11L2.01 31.31L1.39 30.7L1.13 30.22L1.0 28.48L1.49 25.59L2.19 23.28L3.92 19.91L5.09 18.27L6.24 17.08L7.59 16.0L9.52 15.16L11.63 16.0L14.43 17.49L15.96 18.57L15.68 18.83L14.04 19.24L12.79 20.19L11.41 21.74L10.66 22.8L9.26 25.4L7.87 28.96L7.46 30.51L7.18 32.62L7.36 33.1L8.74 34.45L8.77 34.74ZM56.02 35.04L55.64 34.98L55.56 34.74L56.22 34.17L56.52 33.68L56.83 32.62L56.94 31.28L56.52 28.48L55.83 26.34L54.77 24.05L53.05 21.36L50.92 19.2L49.96 18.55L49.19 18.24L48.98 17.99L49.07 17.79L49.67 17.42L54.29 15.16L54.87 15.26L55.83 15.7L57.76 17.08L58.56 17.89L59.89 19.62L61.1 21.65L61.81 23.28L62.51 25.69L63.0 28.68L62.87 30.22L62.23 31.08L59.49 33.12L56.99 34.61Z";

export function JointVentureIcon({ className }: { className?: string }) {
  return (
    <BuildIcon className={className} title="Joint ventures">
      <path d={HANDS} fillRule="evenodd" className="fill-navy-900" />
      <path d={SLEEVES} fillRule="evenodd" className="fill-rosegold-500" />
    </BuildIcon>
  );
}
