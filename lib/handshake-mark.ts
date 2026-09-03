/**
 * The joint-venture mark — two hands clasped — as bare path data.
 *
 * Traced from the reference artwork supplied for the icon rather than drawn
 * from primitives: five attempts at building a handshake out of bands and
 * bars read as a chevron, a zipper, or one hand gripping a stick, because the
 * shape depends on overlapping fingers that simple geometry cannot carry at
 * icon size.
 *
 * The outline is a vectorised silhouette on the same 64-unit grid as the rest
 * of `build-icons.tsx`: the white separations in the source are gaps in the
 * path, so they take whatever the section behind is, and the whole thing
 * scales without the source bitmap. The two sleeves are their own contours,
 * so they can carry the rose gold the set uses as its accent.
 *
 * Both paths need `evenodd` — the enclosed white shapes are holes, not
 * separate marks.
 *
 * They live here rather than in `build-icons.tsx` because `HandshakeReveal`
 * is a client component and needs them: this way it pulls in two strings
 * instead of the whole icon set.
 *
 * The mark's bounding box is x 1 → 63, y 15.16 → 48.84 — so its centre is
 * (32, 32), which is also the deepest point of solid mark near the middle
 * (3.38 units of clearance to the nearest edge). `HandshakeReveal` opens the
 * silhouette out from exactly there, and that clearance is what tells it how
 * far it has to open before the last of the ground has left the screen.
 */

export const HANDSHAKE_HANDS =
  "M39.27 45.92L37.54 45.88L34.84 44.31L34.17 44.12L33.51 43.5L32.91 43.21L31.66 43.17L30.99 43.44L30.7 43.41L30.64 42.35L30.38 41.48L29.54 40.44L28.87 40.12L28.29 39.99L27.14 40.1L25.79 40.8L25.5 40.81L25.37 40.62L25.32 39.65L24.84 38.69L24.26 38.02L23.29 37.53L22.42 37.39L21.36 37.54L20.2 38.17L19.53 38.71L18.28 40.13L17.89 40.2L10.19 34.13L8.71 33.1L8.43 32.62L8.42 31.76L9.23 28.46L10.32 25.79L11.76 23.19L13.61 20.97L14.04 20.59L14.81 20.19L17.32 19.73L24.06 17.4L26.37 16.82L27.23 16.7L29.64 17.34L30.45 17.79L30.6 18.01L30.59 18.28L26.42 21.36L25.49 22.42L24.47 24.25L22.31 28.87L22.31 30.41L22.86 31.28L23.5 31.76L24.63 32.0L26.08 31.79L27.14 31.37L29.35 29.88L30.93 28.19L31.63 27.04L32.34 26.42L34.46 25.2L35.61 25.01L36.57 25.49L40.91 28.73L46.68 33.4L50.48 36.67L51.16 38.11L51.05 38.98L50.77 39.56L50.05 40.13L49.38 40.26L47.94 39.99L46.97 39.5L44.37 37.21L38.31 32.61L37.54 32.13L36.89 32.24L36.74 32.72L37.15 33.23L43.89 38.27L45.38 39.56L45.66 40.13L45.75 40.9L45.64 41.39L45.35 41.96L44.95 42.39L44.28 42.74L43.7 42.86L42.35 42.84L41.1 42.29L33.78 37.14L33.4 37.03L33.01 37.22L32.88 37.63L33.2 38.15L40.23 43.1L40.65 43.89L40.63 44.76L39.98 45.53ZM51.5 35.9L51.02 35.65L41.58 27.77L37.06 24.43L35.71 23.73L33.4 24.43L31.57 25.56L30.89 26.13L30.26 27.13L29.11 28.48L27.91 29.58L26.75 30.32L25.5 30.73L24.35 30.81L23.85 30.6L23.53 30.22L23.35 29.83L23.37 29.35L25.88 24.05L26.88 22.51L27.33 22.09L32.24 18.55L34.74 17.1L35.61 16.71L36.67 16.51L38.5 16.72L40.71 17.4L44.08 18.74L46.11 19.34L47.17 19.47L48.42 19.2L49.28 19.52L50.83 20.59L52.57 22.71L54.12 25.4L55.07 27.71L55.48 29.06L55.68 31.66L55.55 32.91L55.25 33.44L53.81 34.56ZM25.69 47.37L24.54 47.37L23.48 46.73L23.06 45.91L23.17 44.95L25.02 42.78L26.66 41.47L27.52 41.15L28.58 41.27L29.09 41.58L29.55 42.44L29.58 42.93L29.32 43.6L27.91 45.53L26.75 46.69ZM20.49 44.58L19.15 44.5L18.39 44.08L17.96 43.22L18.08 42.16L20.17 39.65L20.69 39.25L21.84 38.68L23.09 38.72L23.62 39.07L24.0 39.56L24.1 40.62L23.96 41.19L23.29 42.37L22.13 43.65L21.55 44.14ZM30.8 48.81L29.74 48.84L29.34 48.7L28.81 48.13L28.86 47.45L30.02 45.72L31.09 44.72L31.95 44.27L32.53 44.27L32.91 44.52L33.21 44.95L33.34 45.72L33.15 46.39L32.76 47.16L31.95 48.17L31.18 48.7ZM14.62 41.3L13.92 41.19L13.46 40.85L13.11 40.33L12.75 38.98L12.98 38.23L13.56 38.3L15.93 40.23L15.99 40.52L15.87 40.72L15.49 41.0ZM34.26 47.94L33.92 47.84L33.87 47.55L34.65 45.78L34.94 45.72L35.9 46.3L36.02 46.87L35.71 47.31L35.23 47.66Z";

export const HANDSHAKE_SLEEVES =
  "M8.55 34.96L7.59 34.93L4.41 33.11L2.01 31.31L1.39 30.7L1.13 30.22L1.0 28.48L1.49 25.59L2.19 23.28L3.92 19.91L5.09 18.27L6.24 17.08L7.59 16.0L9.52 15.16L11.63 16.0L14.43 17.49L15.96 18.57L15.68 18.83L14.04 19.24L12.79 20.19L11.41 21.74L10.66 22.8L9.26 25.4L7.87 28.96L7.46 30.51L7.18 32.62L7.36 33.1L8.74 34.45L8.77 34.74ZM56.02 35.04L55.64 34.98L55.56 34.74L56.22 34.17L56.52 33.68L56.83 32.62L56.94 31.28L56.52 28.48L55.83 26.34L54.77 24.05L53.05 21.36L50.92 19.2L49.96 18.55L49.19 18.24L48.98 17.99L49.07 17.79L49.67 17.42L54.29 15.16L54.87 15.26L55.83 15.7L57.76 17.08L58.56 17.89L59.89 19.62L61.1 21.65L61.81 23.28L62.51 25.69L63.0 28.68L62.87 30.22L62.23 31.08L59.49 33.12L56.99 34.61Z";

/** The mark's own centre on that grid — and the point it opens out from. */
export const HANDSHAKE_ANCHOR_X = 32;
export const HANDSHAKE_ANCHOR_Y = 32;

/**
 * The radius of the largest circle that fits inside the silhouette at that
 * anchor, in grid units. Measured off the path itself, and the reason the
 * reveal knows when it can stop opening.
 */
export const HANDSHAKE_ANCHOR_CLEARANCE = 3.38;

/** How wide the mark is across its bounding box, in grid units. */
export const HANDSHAKE_WIDTH = 62;
