import type { ReactNode } from "react";
import { HANDSHAKE_HANDS, HANDSHAKE_SLEEVES } from "@/lib/handshake-mark";

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
 * The two paths are in `lib/handshake-mark.ts`, where the note on how they
 * were traced lives — `HandshakeReveal` opens the same silhouette out to fill
 * the screen on /joint-ventures, and both read it from there. Drop the
 * sleeves into the first path to make it one flat navy mark.
 */
export function JointVentureIcon({ className }: { className?: string }) {
  return (
    <BuildIcon className={className} title="Joint ventures">
      <path d={HANDSHAKE_HANDS} fillRule="evenodd" className="fill-navy-900" />
      <path
        d={HANDSHAKE_SLEEVES}
        fillRule="evenodd"
        className="fill-rosegold-500"
      />
    </BuildIcon>
  );
}
