#!/usr/bin/env node
/**
 * Build the home hero's frame sequences — `public/frames/home-towers-v1/` —
 * and the three stills that sit either side of them, from the towers render.
 *
 * The hero draws the walkthrough onto a `<canvas>` from pre-decoded WebP
 * frames instead of seeking a `<video>` (see `ScrollHero`, and the README's
 * "Frame sequence" section for why). This script cuts those frames:
 *
 *   1. One interpolated master, as PNG. The render is 24p; `minterpolate`
 *      synthesises the frames between, straight to 30p. That is exactly every
 *      second frame of the 60p master the video ladder was cut from, with the
 *      same timestamps, so frame `i` here is `2i` there. The conversion to RGB
 *      names BT.709 limited range, which is what browsers assume for the
 *      untagged render and what the video ladder was tagged as, so the frames
 *      draw in the colours the video played in. swscale's default would read
 *      the render as BT.601 and shift every hue a little.
 *   2. Three sets from that master, one per width in `SETS`, as lossy WebP.
 *   3. The poster, the soft end plate and the soft start plate, from the same
 *      conversion, so the poster the page paints first and the frame the
 *      canvas then draws over it are the same picture in the same colours.
 *
 * Usage, from the repository root (needs ffmpeg on the PATH; `sharp` comes
 * with Next):
 *
 *     node assets/video-source/build-hero-frames.mjs
 *
 * The master is cached in the system temp directory, so a second run that only
 * changes a quality setting skips the four-minute interpolation. Pass `--fresh`
 * to rebuild it.
 *
 * Bump `VERSION` whenever the bytes of any frame change. The frames are served
 * as immutable (`next.config.ts`), so a browser holding the old ones will never
 * ask for them again under the same path.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = path.join(ROOT, "assets/video-source/walkthrough-towers.mp4");

const VERSION = "v1";
const OUT = path.join(ROOT, "public/frames", `home-towers-${VERSION}`);
const IMAGES = path.join(ROOT, "assets/images");

/** Largest set's size: the master is cut at this, and every set is resampled from it. */
const MASTER_WIDTH = 2560;
const MASTER_HEIGHT = 1440;

/**
 * The sets, smallest first, and the WebP quality each is written at. The
 * smallest is the one the loader waits for, so it is held to about 15 MB.
 * Sizes and the reasoning are in the README.
 */
const SETS = [
  { width: 1280, height: 720, quality: 72 },
  { width: 1920, height: 1080, quality: 72 },
  { width: 2560, height: 1440, quality: 72 },
];

const MI = "minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1";
const TO_RGB =
  "scale=in_color_matrix=bt709:in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int,format=rgb24";

const fresh = process.argv.includes("--fresh");
const cache = path.join(os.tmpdir(), "vj-hero-frames");
const master = path.join(cache, "master");

function ffmpeg(args) {
  const run = spawnSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
  if (run.status !== 0) throw new Error(`ffmpeg failed: ${args.join(" ")}`);
}

const pad = (i) => String(i).padStart(3, "0");

/** Run `task` over `items`, `limit` at a time. */
async function pool(items, limit, task) {
  let next = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < items.length) await task(items[next++]);
    }),
  );
}

// 1. The master ---------------------------------------------------------------

if (!fs.existsSync(SRC)) {
  console.error(`No render at ${path.relative(ROOT, SRC)} — see the README's table.`);
  process.exit(1);
}

if (fresh) fs.rmSync(master, { recursive: true, force: true });
if (!fs.existsSync(path.join(master, "000.png"))) {
  fs.mkdirSync(master, { recursive: true });
  console.log("Interpolating the master (about four minutes)…");
  ffmpeg([
    "-i", SRC,
    "-vf", `scale=${MASTER_WIDTH}:${MASTER_HEIGHT}:flags=lanczos,${MI},${TO_RGB}`,
    "-an", "-fps_mode", "passthrough",
    "-start_number", "0",
    path.join(master, "%03d.png"),
  ]);
}

const frames = fs.readdirSync(master).filter((f) => f.endsWith(".png")).sort();
const count = frames.length;
console.log(`Master: ${count} frames at ${MASTER_WIDTH}×${MASTER_HEIGHT}`);

// 2. The sets -----------------------------------------------------------------

fs.rmSync(OUT, { recursive: true, force: true });
for (const set of SETS) {
  const dir = path.join(OUT, String(set.width));
  fs.mkdirSync(dir, { recursive: true });
  let bytes = 0;
  await pool(frames, Math.max(2, Math.floor(os.availableParallelism() / 2)), async (file) => {
    const i = Number.parseInt(file, 10);
    let image = sharp(path.join(master, file));
    if (set.width !== MASTER_WIDTH) {
      image = image.resize(set.width, set.height, { kernel: "lanczos3" });
    }
    const info = await image
      .webp({ quality: set.quality, effort: 6, smartSubsample: true })
      .toFile(path.join(dir, `${pad(i)}.webp`));
    bytes += info.size;
  });
  console.log(
    `${set.width}×${set.height} q${set.quality}: ${(bytes / 1e6).toFixed(1)} MB, ` +
      `${(bytes / count / 1024).toFixed(0)} KB a frame`,
  );
}

// 3. The stills ---------------------------------------------------------------

// The poster is the render's own first frame at its own 3840×2160 — it is the
// page's largest contentful paint, and `next/image` resamples it per screen.
const posterPng = path.join(cache, "poster.png");
ffmpeg(["-i", SRC, "-frames:v", "1", "-vf", TO_RGB, posterPng]);
await sharp(posterPng)
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(path.join(IMAGES, "home-scroll-towers-poster.jpg"));

// The close cross-fades to this: the last frame, softened once here rather
// than blurred live over the canvas. Sigma 6 at 1280 is what it always was.
await sharp(path.join(master, frames[count - 1]))
  .resize(1280, 720, { kernel: "lanczos3" })
  .blur(6)
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile(path.join(IMAGES, "home-scroll-towers-end.jpg"));

// The loader stands on this: the first frame, blurred far enough that it
// reads as frosted glass over the poster. Pre-blurred for the same reason as
// the end plate — a full-screen `backdrop-filter` redrawn under a spinning
// ring is the kind of cost this whole rewrite exists to take away.
await sharp(path.join(master, frames[0]))
  .resize(960, 540, { kernel: "lanczos3" })
  .blur(18)
  .jpeg({ quality: 78, mozjpeg: true })
  .toFile(path.join(IMAGES, "home-scroll-towers-start-soft.jpg"));

console.log(`\nframes.homeScroll in lib/images.ts should read:
  base: "/frames/home-towers-${VERSION}", count: ${count},
  sets: ${SETS.map((s) => `${s.width}×${s.height}`).join(", ")}`);
