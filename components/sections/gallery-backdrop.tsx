/**
 * The gallery's backdrop: geometric rosettes drifting behind the page.
 *
 * The shape is a mandala of leaf petals in two rings — eight long ones from
 * the centre, sixteen shorter ones between their tips. It echoes the lotus
 * geometry in the company's own mark rather than being decoration for its own
 * sake, and it is drawn rather than photographed so it stays crisp at any size
 * and costs one inline path set instead of an image request.
 *
 * Everything here is decorative: the layer is inert to the pointer and hidden
 * from assistive tech, and it sits behind the content it sits under.
 */

/** A leaf: two quadratic arcs meeting at a point, aimed along `angle`. */
function petal(cx: number, cy: number, angle: number, length: number, width: number) {
  const a = (angle * Math.PI) / 180;
  const tip = [cx + length * Math.cos(a), cy + length * Math.sin(a)];
  const mid = [cx + length * 0.5 * Math.cos(a), cy + length * 0.5 * Math.sin(a)];
  const off = [-Math.sin(a) * width, Math.cos(a) * width];

  return (
    `M ${cx.toFixed(1)} ${cy.toFixed(1)} ` +
    `Q ${(mid[0] + off[0]).toFixed(1)} ${(mid[1] + off[1]).toFixed(1)} ${tip[0].toFixed(1)} ${tip[1].toFixed(1)} ` +
    `Q ${(mid[0] - off[0]).toFixed(1)} ${(mid[1] - off[1]).toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)} Z`
  );
}

/** `rings` are [petal count, distance from centre, petal length, half-width]. */
function mandala(rings: readonly (readonly [number, number, number, number])[]) {
  return rings.flatMap(([count, inner, length, width]) =>
    Array.from({ length: count }, (_, index) => {
      const angle = (360 * index) / count;
      const a = (angle * Math.PI) / 180;
      return petal(inner * Math.cos(a), inner * Math.sin(a), angle, length, width);
    }),
  );
}

const PETALS = mandala([
  [8, 0, 140, 36],
  [16, 140, 100, 20],
]);

function Rosette({ className }: { className?: string }) {
  return (
    <svg viewBox="-260 -260 520 520" aria-hidden="true" className={className}>
      <g fill="currentColor">
        {PETALS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}

export function GalleryBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* A wash that keeps the page from reading as flat white. */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-mist to-white" />

      {/* Placed off the edges so each reads as a fragment of something larger,
          the way the reference crops them. */}
      <Rosette className="absolute -right-40 -top-32 h-[34rem] w-[34rem] text-navy-900/[0.05] sm:h-[44rem] sm:w-[44rem]" />
      <Rosette className="absolute -left-52 top-[38%] h-[38rem] w-[38rem] rotate-[15deg] text-rosegold-600/[0.06]" />
      <Rosette className="absolute -bottom-40 -left-32 h-[32rem] w-[32rem] text-navy-900/[0.05] sm:h-[40rem] sm:w-[40rem]" />
      <Rosette className="absolute -right-48 bottom-[22%] hidden h-[36rem] w-[36rem] rotate-[22deg] text-navy-900/[0.04] lg:block" />
    </div>
  );
}
