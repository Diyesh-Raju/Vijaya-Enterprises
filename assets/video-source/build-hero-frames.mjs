#!/usr/bin/env node
/**
 * Build the home hero's frame sequences — `public/frames/home-towers-v2/` —
 * and the three stills that sit either side of them, from the towers render.
 *
 * The hero draws the walkthrough onto a `<canvas>` from pre-decoded WebP
 * frames instead of seeking a `<video>` (see `ScrollHero`, and the README's
 * "Frame sequence" section for why). This script cuts those frames:
 *
 *   1. Every frame of the render, as it was rendered: 169 frames at 24 a
 *      second, 3840×2160, read straight out of ffmpeg one at a time. No
 *      interpolation. The first cut of these frames (`-v1`) was
 *      `minterpolate`d to 30 a second, and four frames in five were
 *      synthesised — with doubled window outlines and smeared planting that
 *      showed whenever the page came to rest on one. The canvas cross-fades
 *      between neighbouring frames while the page moves, which is what the
 *      interpolation was standing in for, and at rest every frame is one the
 *      render actually drew. The conversion to RGB names BT.709 limited
 *      range, which is what browsers assume for the untagged render, so the
 *      frames draw in the colours the video played in; swscale's default
 *      would read the render as BT.601 and shift every hue a little.
 *   2. Four sets from each frame, one per width in `SETS`, as lossy WebP.
 *   3. The poster, the soft end plate and the soft start plate, from the same
 *      conversion, so the poster the page paints first and the frame the
 *      canvas then draws over it are the same picture in the same colours.
 *
 * Usage, from the repository root (needs ffmpeg on the PATH; `sharp` comes
 * with Next):
 *
 *     node assets/video-source/build-hero-frames.mjs
 *
 * About a minute and a half on an M5. Nothing is written outside the repo but
 * one PNG in the system temp directory.
 *
 * Bump `VERSION` whenever the bytes of any frame change, and `homeScrollBase`
 * in `lib/images.ts` with it. The frames are served as immutable
 * (`next.config.ts`), so a browser holding the old ones will never ask for
 * them again under the same path.
 */

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = path.join(ROOT, "assets/video-source/walkthrough-towers.mp4");

const VERSION = "v2";
const OUT = path.join(ROOT, "public/frames", `home-towers-${VERSION}`);
const IMAGES = path.join(ROOT, "assets/images");

/** The render's own size. The top set is this, untouched. */
const WIDTH = 3840;
const HEIGHT = 2160;

/**
 * The sets, smallest first, and the WebP quality each is written at. The
 * smallest is the one the loader waits for, so it is held to about 15 MB.
 * Sizes and the reasoning are in the README.
 */
const SETS = [
  { width: 1280, height: 720, quality: 80 },
  { width: 1920, height: 1080, quality: 80 },
  { width: 2560, height: 1440, quality: 80 },
  { width: 3840, height: 2160, quality: 80 },
];

const TO_RGB =
  "scale=in_color_matrix=bt709:in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int,format=rgb24";

/** Frames encoded at once. Each holds a 24 MB buffer while it is worked on. */
const CONCURRENCY = Math.max(2, Math.min(6, Math.floor(os.availableParallelism() / 2)));

const pad = (i) => String(i).padStart(3, "0");
const raw = { raw: { width: WIDTH, height: HEIGHT, channels: 3 } };

function ffmpeg(args) {
  const run = spawnSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
  if (run.status !== 0) throw new Error(`ffmpeg failed: ${args.join(" ")}`);
}

/** The render's frames, in order, as raw RGB buffers. */
async function* framesOf(file) {
  const child = spawn(
    "ffmpeg",
    ["-v", "error", "-i", file, "-vf", TO_RGB, "-an", "-fps_mode", "passthrough", "-f", "rawvideo", "-"],
    { stdio: ["ignore", "pipe", "inherit"] },
  );
  // Listened for from the start: ffmpeg can be gone before the last chunk
  // has been read, and a listener added after that would wait for ever.
  const closed = new Promise((resolve) => child.on("close", resolve));
  const size = WIDTH * HEIGHT * 3;
  let pending = [];
  let held = 0;
  for await (const chunk of child.stdout) {
    pending.push(chunk);
    held += chunk.length;
    while (held >= size) {
      const all = Buffer.concat(pending, held);
      yield all.subarray(0, size);
      const rest = all.subarray(size);
      pending = rest.length ? [rest] : [];
      held = rest.length;
    }
  }
  const code = await closed;
  if (code !== 0) throw new Error(`ffmpeg exited ${code}`);
  if (held) throw new Error(`${held} stray bytes at the end of the stream`);
}

if (!fs.existsSync(SRC)) {
  console.error(`No render at ${path.relative(ROOT, SRC)} — see the README's table.`);
  process.exit(1);
}

fs.rmSync(OUT, { recursive: true, force: true });
for (const set of SETS) fs.mkdirSync(path.join(OUT, String(set.width)), { recursive: true });

const bytes = SETS.map(() => 0);
const running = new Set();
let count = 0;
let first = null;
let last = null;

const encode = async (index, frame) => {
  for (const [i, set] of SETS.entries()) {
    let image = sharp(frame, raw);
    if (set.width !== WIDTH) image = image.resize(set.width, set.height, { kernel: "lanczos3" });
    const info = await image
      .webp({ quality: set.quality, effort: 6, smartSubsample: true })
      .toFile(path.join(OUT, String(set.width), `${pad(index)}.webp`));
    bytes[i] += info.size;
  }
};

for await (const frame of framesOf(SRC)) {
  const index = count++;
  // Copied: what the generator yields is a view into its stream buffer.
  const own = Buffer.from(frame);
  if (index === 0) first = own;
  last = own;
  const job = encode(index, own).finally(() => running.delete(job));
  running.add(job);
  if (running.size >= CONCURRENCY) await Promise.race(running);
}
await Promise.all(running);

console.log(`${count} frames at ${WIDTH}×${HEIGHT}`);
for (const [i, set] of SETS.entries()) {
  console.log(
    `${set.width}×${set.height} q${set.quality}: ${(bytes[i] / 1e6).toFixed(1)} MB, ` +
      `${(bytes[i] / count / 1024).toFixed(0)} KB a frame`,
  );
}

// The stills ------------------------------------------------------------------

// The poster is the render's own first frame at its own 3840×2160 — it is the
// page's largest contentful paint, and `next/image` resamples it per screen.
const posterPng = path.join(os.tmpdir(), "vj-hero-poster.png");
ffmpeg(["-i", SRC, "-frames:v", "1", "-vf", TO_RGB, posterPng]);
await sharp(posterPng)
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(path.join(IMAGES, "home-scroll-towers-poster.jpg"));
fs.rmSync(posterPng, { force: true });

// The close cross-fades to this: the last frame, softened once here rather
// than blurred live over the canvas. Sigma 6 at 1280 is what it always was.
await sharp(last, raw)
  .resize(1280, 720, { kernel: "lanczos3" })
  .blur(6)
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile(path.join(IMAGES, "home-scroll-towers-end.jpg"));

// The loader stands on this: the first frame, blurred far enough that it
// reads as frosted glass over the poster. Pre-blurred for the same reason as
// the end plate — a full-screen `backdrop-filter` redrawn under a spinning
// ring is the kind of cost this whole pipeline exists to take away.
await sharp(first, raw)
  .resize(960, 540, { kernel: "lanczos3" })
  .blur(18)
  .jpeg({ quality: 78, mozjpeg: true })
  .toFile(path.join(IMAGES, "home-scroll-towers-start-soft.jpg"));

console.log(`\nframes.homeScroll in lib/images.ts should read:
  base: "/frames/home-towers-${VERSION}", count: ${count},
  sets: ${SETS.map((s) => `${s.width}×${s.height}`).join(", ")}`);
