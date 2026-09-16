# Home hero source clips

The originals behind the home hero's frames (`public/frames/`) and the
videos it played before them (`public/video/home-scroll*.mp4`), kept out of `public/`
so a quarter of a gigabyte of source never ships in the deployment — and out
of git (see `.gitignore`) so it never lands in the history either. They live
on whoever holds the renders; ask before assuming a clone has them.

| File                                 | Source                | Shot                         |
| ------------------------------------ | --------------------- | ---------------------------- |
| `walkthrough-exterior-to-living.mp4` | 3524×2352, 7.02s, 60p | towers from the air → living |
| `walkthrough-living-to-foyer.mp4`    | 3988×2162, 4.00s, 60p | living → entrance foyer      |
| `walkthrough-towers.mp4`             | 3840×2160, 7.04s, 24p | towers → balcony → living    |

The first two are the long cut, and are Topaz upscales of the original 24p
renders, which are kept alongside them as `*-24p.mp4`. The upscales are what
that build uses: they arrive at 60fps with the intermediate frames already
synthesised, which is both better and cheaper than the `minterpolate` pass the
24p files used to need. `walkthrough-living-to-foyer.mp4` opens on the same
living room `walkthrough-exterior-to-living.mp4` ends in, and the two run in
that order with the join hidden across half a second.

`walkthrough-towers.mp4` is the one the hero plays now, on its own and with no
join. It is 24p with no upscale, so it takes the `minterpolate` pass — the
section below is the whole of its build.

## The frame sequence — what the hero draws now, since 2026-09-16

The hero no longer plays a `<video>`. Seeking one on every animation frame is
only fast where H.264 is decoded in hardware; on the many Windows laptops that
decode it in software, and in any browser denied the GPU, a seek takes two to
five frames and the walkthrough trails the wheel (the software columns in the
table below). So `ScrollHero` draws the towers walkthrough onto a `<canvas>`
from still frames, decoded ahead of time in workers (`lib/frame-sequence.ts`),
and the four-file ladder further down is history — its files are still in
`public/video/`, referenced by nothing, and can be deleted.

The film pins below the header, which is frosted white over a white strip at
the top of the page, and plays over 1.6 screens of scroll (2.35 until the
client asked for it faster).

`build-hero-frames.mjs` cuts everything, from `walkthrough-towers.mp4`:

```sh
node assets/video-source/build-hero-frames.mjs          # ~1½ minutes
```

It reads every frame of the render straight out of ffmpeg — **169 frames at
24 a second, no interpolation** — converts to RGB as BT.709 limited range
(what the ladder was tagged as, and what browsers assume for the untagged
render), and writes four sets of lossy WebP (`quality 80`, `effort 6`,
`smartSubsample`) plus the three stills. The poster, the soft end plate and
the soft start plate (the loader's ground) come off the same conversion, so
the poster the page paints first and frame 0 the canvas then draws are the
same picture in the same colours.

The first cut (`home-towers-v1`, the same day) was `minterpolate`d to 30 a
second at 2560 and q72. Four frames in five were synthesised, and a page at
rest on one showed doubled window outlines and smeared planting. The canvas
cross-fades between neighbouring frames while the page moves, which covers
what the interpolation was for, and at rest every frame is one the render
drew.

| set | frames | quality | total | a frame | who gets it |
| --- | --- | --- | --- | --- | --- |
| `1280/` | 169 | 80 | 15.2 MB | 88 KB | everyone first — the loader waits for all of it |
| `1920/` | 169 | 80 | 25.2 MB | 145 KB | a panel 1400–2100 device pixels across, e.g. 1536×864 at 125% |
| `2560/` | 169 | 80 | 35.4 MB | 205 KB | anything wider or denser, to scrub on |
| `3840/` | 169 | 80 | 59.6 MB | 344 KB | the picture at rest on Retina and 4K screens |

**4K at rest, 2560 in motion.** A 4K frame takes about 40ms to decode in
Chrome on the M5, and at 1.6 screens a steady scroll asks for ninety-odd
frames a second: scrubbed on the 4K set, the canvas showed a new picture on
only half the display frames (trail p95 3.5 frames). So the 2560 set carries
the scrub, and when the glide settles on a frame, that frame is decoded in
4K and faded in over 180ms — the same picture, sharper. Moving again hands
the picture back to 2560 at once. The 4K set needs no complete download to
be useful (a frame not yet in leaves the 2560 one standing), costs three
decoded frames of memory rather than a scrub's worth, and is only switched
on for a machine that decodes it at 20 frames a second or better and has
the memory (Chrome's `deviceMemory` of 8, or a browser that does not say).
The canvas's backing store is sized for the 4K set when it is on — at
1600×812 @2, 3200×1430.

**Directory versioning.** `/frames/` is served `immutable` for a year
(`next.config.ts`), so new bytes need a new path: bump `VERSION` in the
script and `homeScrollBase` in `lib/images.ts` together.

### How the page uses them

- **Loader.** `HeroLoader` stands over the page from the first paint
  (`data-hero-loading`, written by the inline script in `app/layout.tsx`)
  until every frame of the 1280 set is downloaded and the frame for the
  current scroll position is on the canvas. Scrolling, touch and keyboard
  are held while it is up. Failsafes: no frame for 20s lifts it anyway and
  the rest are counted in at the foot of the screen; more than 5% of frames
  failing falls back to the poster; each request times out after 20s and is
  retried twice. Frames already downloaded in the tab are kept, so a return
  to the home page by a link opens at once with no loader.
- **Climb.** The screen decides the ceiling (the smallest set with nine
  tenths of the panel's device pixels, cover-cropped); a 4K ceiling means
  2560 to scrub on and 4K at rest. The scrub set's first 14 frames are
  downloaded alongside the 1280 set and timed while the loader is still up:
  every decoder at once, and the machine must decode at least 75 frames a
  second of that set. One that passes has the rest downloaded the moment
  the page opens, and swapped in on the first display frame it has the
  picture decoded — mid-scrub if need be. The smaller set stays 1.5s as a
  stand-in, then goes.
- **Scheduling.** The drawn position eases towards the scroll (rate 6),
  aimed at whole frames so it always comes to rest on one. The decoders are
  told, every time the picture moves, what to work on: the glide's path from
  as far ahead as a decode takes to land (measured), against a target
  carried on at the scroll's own speed; then the frames around where it will
  settle, and that frame in 4K. Where the decoders cannot keep up, the path
  is sampled every second or third frame, so the picture keeps up with the
  wheel at a lower frame rate rather than trailing it. Decoded frames live
  in a cache of 160–384 MB (by `navigator.deviceMemory`; 320 MB where it is
  not offered), plus three 4K frames when those are on. Between two frames
  at a slow scroll, the next is cross-faded over the last; if display frames
  start arriving late the cross-fade switches itself off.
- **Canvas size.** The backing store is the panel's device pixels
  (`devicePixelContentBoxSize` where it agrees with CSS size × ratio —
  Chrome's device emulation reports CSS pixels there), capped at the
  sharpest set's own pixels, so a frame smaller than the screen is drawn
  exactly 1:1.

### Measured, 2026-09-16

Headless Chrome 152 on the M5, dev server, the in-page harness in the
session scratchpad (`run.mjs`): a steady scrub at 12px a display frame
through the film and back, and an erratic notched wheel (bursts of
100–240px, pauses of 1–10 frames, reversals, five-notch spins). "Trail" is
how far the drawn frame is behind where the glide says it should be, in
frames of film. All at the 1.6-screen pace.

| machine | scrub set | scrub | display frame p95 / max | trail p50 / p95 / max |
| --- | --- | --- | --- | --- |
| 1600×812 @2, GPU | 2560 (+4K at rest) | steady | 16.7 / 16.8ms | 0.12 / 1.39 / 1.98 |
| same | 2560 (+4K at rest) | wheel | 16.8 / 16.8ms | 0.30 / 2.33 / 4.33 |
| same, 4K as the scrub set (not shipped) | 4K | wheel | 16.8 / 33.4ms | 0.41 / 3.46 / 18.4 |
| 1536×864 @1.25 | 1920 | wheel | 16.8 / 16.8ms | 0.18 / 1.69 / 6.27 |
| same, decodes +60ms, 4 cores, CPU ×4 | 1280 (1920 failed its probe) | wheel | 16.8 / 16.8ms | 0.34 / 3.26 / 28.5 |
| 1366×768 @1 | 1280 (ceiling) | steady | 16.7 / 16.8ms | 0.09 / 0.48 / 1.39 |

No long animation frames in these runs. Traced (on the earlier 30p cut),
the page's main thread spent about 1.3ms a display frame during a scrub,
with the GPU on or off; the decodes run on the renderer's thread pool. The
slow-decoder row is simulated: a busy-wait added to each decode inside the
worker, since DevTools CPU throttling does not reach the browser's
image-decode threads. The large maximums are the first display frames of a
hard spin, before any frame near the new position exists. On a local
server the 1600×812 page opened at 0.4s, took over the 2560 set at 0.8s and
had 4K at rest by 2.6s.

Headless frame timing does not show raster cost (see the note in the
project memory), so the display-frame columns say the main thread never
missed; they do not by themselves prove a weak GPU would not.

## The towers cut — the render the frames are cut from

Since 2026-09-15 the hero plays the towers walkthrough: one render,
`walkthrough-towers.mp4`, which opens on a landscaped block of white apartment
towers from the air, pushes down the facade past a planted balcony and ends
inside a lamplit living room. Same arc as the short cut it replaces —
exterior, through the glass, interior — so the two stills either end of the
scrub still describe it and `alt` did not change.

It arrives already 16:9 (3840×2160) and carries no render mark, so unlike
both earlier cuts there is **no crop window**: the whole frame is used, and
the poster and the clip cannot drift out of framing with each other because
neither is cropped. `cropdetect` over the first 48 frames returns
`3840:2160:0:0`, and the bottom corners are clean at native resolution.

The render is 24p and there is no 60p upscale of it, so `minterpolate`
synthesises the frames in between, into a near-lossless 60p master every
file below is encoded from. That pass is the slow one: about four minutes.
The master was checked for what interpolation can do wrong — a duplicated
frame where scene-change detection gives up, a spike where a motion vector
goes astray — and has neither: 418 frames, no frame under 12% of the median
frame-to-frame difference, no spike over 2.2× it. The 24→60 cadence leaves a
mild 3-2-3-2 alternation in the size of each step (consecutive-step ratio
p50 0.99, p95 1.35), which at five or six pixels of scroll a frame is below
anything a scrub can show.

### The ladder — four encodes, since 2026-09-16

The hero used to play one 3200×1800 file, for everyone, from the start —
which meant a visitor on an ordinary connection watched a still poster and a
percentage for ten to forty seconds before the film would move, and a
machine decoding H.264 in software got a seek that took two to five frames
and a scrub that lagged the wheel. Both read as "it freezes". So there are
four files now — three cut from one master on the morning of 2026-09-16,
and the 4K top added that afternoon from a second master that differs only
in leaving the render at its own size — and `ScrollHero` climbs them:

| | file | size | GOP | crf | level | for |
| --- | --- | --- | --- | --- | --- | --- |
| bridge | `home-scroll-towers-720.mp4`, 1280×720 | 8.3 MB | 2 | 28 | 4.2 | on screen first, in seconds |
| mid | `home-scroll-towers-1080.mp4`, 1920×1080 | 21.9 MB | 1 | 24 | 4.2 | the ceiling for a software decoder |
| hq | `home-scroll-towers-3200.mp4`, 3200×1800 | 34.0 MB | 2 | 26 | 5.2 | hardware decoders that cannot seek 4K in time; the ceiling for a 1× screen up to ~2250 wide |
| uhd | `home-scroll-towers-2160.mp4`, 3840×2160 | 42.5 MB | 2 | 26 | 5.2 | hardware decoders on a wide or dense screen — the render at its own size |

The bridge is read in and counted ("Loading 42%"); the moment it is in, the
cue says "Scroll to Discover" and the scrub works. The larger files are then
fetched behind it, attached in a second `<video>` out of sight, and **timed
on sixteen seeks** that follow the same route a scrub does (after two
unscored warm-up seeks), at a moment when nothing has scrolled for a third
of a second — probed *under* a scrub, a file reads slow for the wrong
reason. It is promoted only if the median lands inside 24ms on the probe —
a frame and a half there, which is a frame as shown; see *The bar* below —
and the 95th percentile inside two frames (33ms); a file that misses is
asked twice more, a couple of seconds apart, and only then dropped, the
reader trying the next file down. The promotion itself is a same-frame opacity swap
taken the frame both elements come to rest on the same picture — judged
before that frame's seeks go out, so it lands within a few frames even
mid-scrub — and nothing blinks; it never cross-fades, because a cross-fade
between two copies of one frame at different sharpness is half a second of
the picture going soft.

Which of the larger files are tried, and in what order, is the browser's
call (`MediaCapabilities.decodingInfo`, asked about each hardware tier the
screen can use — `powerEfficient` is its word for a hardware decoder), and
a screen that already has a third more source pixels than it can show
stops the climb — a 1× laptop up to about 1280 wide gets the 1080p file
and no more, and a 1× screen up to about 2250 wide stops at the 3200 file.
After a failure the climb steps down from the file that *failed*: until the
afternoon of 2026-09-16 it stepped down from the file *shown*, which after
any failure was still the bridge, so the first file to miss its probe ended
the climb and a machine that could not seek the 3200 file was left on 720p
rather than handed the 1080p one. The component's comments are the long
version.

There is no phone file. The phone unmounts the hero altogether
(`HomeHeroPhone`, since 401e977), so the `-mobile` encodes the earlier cuts
carry were never played by anything; the towers cut's has been removed and
the older ones are dead weight in `public/video/`.

#### Why these four, measured

Seek cost per file, off-keyframe, on a fully buffered blob, 80 seeks × 3
rounds, median round. "scrub" follows a scrub's route (steps of 3–5 frames
either way with two flick-sized jumps); "random" jumps across the clip.
Hardware is Chrome 152 on an Apple M5 with the Metal backend; software is the
same Chrome with `--disable-gpu`, which also rasterises in software and so
is *pessimistic* — a real machine with a GPU but no H.264 decoder sits
somewhere between the two columns.

| file | hardware, scrub p50 / p95 | software, scrub p50 / p95 | software, random p50 |
| --- | --- | --- | --- |
| **3840×2160 GOP 2 crf 26 → uhd** | **19.7 / 22.5** | 46.4 / 55.7 † | — |
| 3840×2160 GOP 2 crf 28 | 19.9 / 22.6 | — | — |
| 3840×2160 GOP 2 crf 30 | 19.9 / 22.0 | — | — |
| 3840×2160 GOP 1 crf 26 | 22.2 / 23.0 | — | — |
| 3200×1800 GOP 2 crf 28 (was shipped) | 13.6 / 15.4 | 60.8 / 74.4 | 55.4 |
| 3200×1800 GOP 1 crf 28 | 15.4 / 16.3 | 50.0 / 56.6 | 47.6 |
| 3200×1800 GOP 2 crf 24 | 14.8 / 17.6 | 88.9 / 362 | 68.3 |
| **3200×1800 GOP 2 crf 26 → hq** | **13.7 / 15.0** | 72.5 / 92.4 | 59.9 |
| 2560×1440 GOP 2 crf 26 | 8.6 / 9.6 | 41.9 / 55.5 | 38.2 |
| **1920×1080 GOP 1 crf 24 → mid** | **5.6 / 5.8** | **24.4 / 28.7** | 21.0 |
| 1920×1080 GOP 2 crf 24 | 5.4 / 6.6 | 29.0 / 35.4 | 23.4 |
| 1280×720 GOP 2 crf 27 | 2.6 / 3.2 | 17.3 / 21.9 | 14.1 |
| 1280×720 GOP 2 crf 30 | 2.3 / 2.5 | 16.2 / 27.4 | 11.6 |

† The software columns for the 4K file were taken in the afternoon
session, where the 3200 file measured 31.7 / 38.6 against the 72.5 / 92.4
in the row above — the software path moves with whatever else the machine
is doing, so read the two against each other: 4K costs half again what
3200 does there, and both are far outside the bar.

What the table decided:

- **crf 26 for the top file, not 24.** On hardware 26 seeks as fast as 28
  and lands its p95 inside a frame; 24 pushes p95 past one and costs 40 MB.
  SSIM against the master: 0.9738 at 28, 0.9768 at 26.
- **All-intra only where it pays.** A keyframe every frame is *slower* on a
  hardware decoder (15.4 vs 13.6 at 3200) and faster on a software one
  (24.4 vs 29.0 at 1080p). So the 1080p file — the one software decoders
  end up on — is all-intra and the others keep the two-frame GOP.
- **3200 and 4K are for hardware only.** No 3200 encode gets under three
  frames a seek in software, whatever the crf, and the 4K file is further
  off again. 1080p is the ceiling there.
- **The 4K file costs pixels, not bits.** Its four candidates were cut on
  the afternoon of 2026-09-16 and timed against the shipped 3200 file in
  the same session (13.8 / 15.4 that day, in line with the table). crf 26,
  28 and 30 seek within 0.2ms of each other at 3840×2160 — 19.7 to 19.9
  median — at 42.5, 34.7 and 28.6 MB, so the crf is chosen on quality
  alone: SSIM against the 4K master 0.978 at 26, 0.974 at 28, 0.970 at 30.
  All-intra is slower again (22.2), as it was at 3200. Across the ladder
  the cost runs at about 2.4ms a megapixel on this decoder — 720p 2.6,
  1080p 5.6, 3200 13.8, 4K 19.7 — which is why no 4K encode could get
  inside the 16ms bar the probe used to hold, and why the bar moved.
- **The bridge at crf 28** splits the two measured: 8.3 MB, three and a half
  seconds at 20 Mbps.

In the page itself, with the file in memory and the hero scrubbed through
and back at three speeds, through the close and back, and after leaving the
page for a screen and a half and returning (instant scrolling — see the
note below), the hardware path shows **no stalls** at any speed: seeks p50
8.4ms, p95 10.3, zero long animation frames, zero dropped frames, no
degradation across cycles, no `load()` ever called. The 933ms "hold" a
naive count reports on the way back up is the close, where the film is
parked on its last frame by design.

The 4K file, measured the same way on the afternoon of 2026-09-16 (the
harness's continuous scrub at 24px a frame, three passes, a 900ms pause at
each turn, at 1512×982 and 2×): the bridge is live at 387ms, the ladder
climbs straight to the 4K file — the swap lands at 2.75s, at the end of the
first pass, and no frame is ever without a picture — and the file then
scrubs at seeks p50 14.3ms, p95 20.3, max 22.4, with **no stalls** of three
frames or more. But it does not present a new picture on every tick: over
184 scrubbing ticks the frame changed on 137, three in four, where the 3200
file in the same harness (held to it by the ceiling, at 1.4× density)
changed on every one of its 184, at p50 8.7 and p95 10.9. That is the
price of 4K on this decoder, and it is what to look for on the page: the
scrub stays attached to the wheel, and is a shade less liquid than at
3200. The one-line way back, if it reads as lag, is `PROBE_P50_MS = 16`
in `ScrollHero` — the 4K file is then never shown and the ladder stops at
3200 as before. The way to have both is the design not yet built: the 4K
file on top only while the reader is still, the 3200 one under the scrub,
swapped on the same frame the way a promotion already is.

#### The bar, and why it moved from 16ms to 24

The probe times seeks one at a time — set `currentTime`, wait for
`seeked`, set the next — and the scrub does not: it sets the next target
every animation frame whether or not the last has landed, and the decoder
pipelines them. So the same file on the same machine costs less under the
scrub than on the probe, by a steady amount: the 3200 file measures 13.5ms
a seek on the probe and 8.7 under the scrub, the 4K file 19.3 and 14.3 —
six to seven tenths. A bar of a frame *on the probe* was therefore a bar
of ten or eleven milliseconds as shown, and at 3200 that pessimism was
free: the file passed with room. At 4K it is not: no hardware decoder
measured here lands a 4K seek under 16 on the probe, and the one measured
lands its median inside a frame under the scrub. The bar is now 24ms on
the probe's own figure — a frame and a half there, a frame as shown at the
median — and the odd slow seek still has to land inside two frames. What
the bar now admits, knowingly, is a file whose slower seeks miss the odd
tick — three pictures in four ticks at 4K on this machine, as measured
above — where the old bar admitted only files that hit every one.

#### Colour

Every file in the chain — render, master, both earlier cuts — was untagged:
`color_range`, `color_space`, `color_transfer` and `color_primaries` all
unknown. Chrome assumes BT.709 limited for an untagged HD stream, and a
canvas test confirmed it draws the untagged file and a BT.709-tagged one
pixel for pixel the same; Safari and Firefox do not promise the same
assumption. So every file now says so explicitly, twice — in the SPS VUI
that x264 writes and in the container's `colr` atom that AVFoundation reads
first — and the pixels are untouched (decoded frame 100 of the tagged 3200
file is byte-identical to the untagged encode).

The ffmpeg CLI in this build takes `-colorspace` and `-color_range` into the
stream parameters but *not* `-color_primaries` or `-color_trc`, so with
`+write_colr` the muxer writes a `colr` atom that says primaries and
transfer are unspecified while x264's VUI says BT.709 — and ffprobe reports
the atom. The seven payload bytes are patched in place after encoding; the
atom's size does not change, so no offset in the file moves.

The render itself is not flat, crushed or clipped: across the clip the
darkest 10% of pixels sit at Y 19–44 and the brightest 10% at 141–198, with
true black and white both present. No grade is applied — a grade on a
client-supplied render is the client's decision.

```sh
SRC=assets/video-source/walkthrough-towers.mp4
MI="minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"

# ~4 minutes. No crop: the render is already 16:9 edge to edge. The three
# lower files are cut from this master, which resamples to 3200 before it
# interpolates.
ffmpeg -y -i $SRC -vf "scale=3200:1800:flags=lanczos,$MI" \
  -an -c:v libx264 -preset fast -crf 8 -pix_fmt yuv420p /tmp/towers-60p-master.mp4
# ~6 minutes. The 4K file is cut from this one, which leaves the render at
# its own 3840×2160 — the two masters differ in nothing else, and the lower
# three were not re-cut from it, since new bytes would need new names
# (see the cache note in `lib/images.ts`) for no visible gain.
ffmpeg -y -i $SRC -vf "$MI" \
  -an -c:v libx264 -preset fast -crf 8 -pix_fmt yuv420p /tmp/towers-60p-master-2160.mp4

# In zsh, write the option lists out rather than expanding a variable: an
# unquoted $COL is one word there, and ffmpeg rejects it.
ffmpeg -y -i /tmp/towers-60p-master.mp4 -vf "scale=1280:720:flags=lanczos,format=yuv420p" \
  -an -c:v libx264 -preset slow -crf 28 -g 2 -keyint_min 2 -sc_threshold 0 -bf 0 \
  -profile:v high -level 4.2 -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -x264-params colorprim=bt709:transfer=bt709:colormatrix=bt709 \
  -movflags +faststart+write_colr public/video/home-scroll-towers-720.mp4
ffmpeg -y -i /tmp/towers-60p-master.mp4 -vf "scale=1920:1080:flags=lanczos,format=yuv420p" \
  -an -c:v libx264 -preset slow -crf 24 -g 1 -keyint_min 1 -sc_threshold 0 -bf 0 \
  -profile:v high -level 4.2 -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -x264-params colorprim=bt709:transfer=bt709:colormatrix=bt709 \
  -movflags +faststart+write_colr public/video/home-scroll-towers-1080.mp4
ffmpeg -y -i /tmp/towers-60p-master.mp4 -vf format=yuv420p \
  -an -c:v libx264 -preset slow -crf 26 -g 2 -keyint_min 2 -sc_threshold 0 -bf 0 \
  -profile:v high -level 5.2 -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -x264-params colorprim=bt709:transfer=bt709:colormatrix=bt709 \
  -movflags +faststart+write_colr public/video/home-scroll-towers-3200.mp4
ffmpeg -y -i /tmp/towers-60p-master-2160.mp4 -vf format=yuv420p \
  -an -c:v libx264 -preset slow -crf 26 -g 2 -keyint_min 2 -sc_threshold 0 -bf 0 \
  -profile:v high -level 5.2 -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -x264-params colorprim=bt709:transfer=bt709:colormatrix=bt709 \
  -movflags +faststart+write_colr public/video/home-scroll-towers-2160.mp4

# The colr atom: primaries, transfer, matrix as u16 each, then a flags byte.
python3 - <<'EOF'
import pathlib
for f in ("720", "1080", "3200", "2160"):
    p = pathlib.Path(f"public/video/home-scroll-towers-{f}.mp4"); d = bytearray(p.read_bytes())
    i = d.find(b"colrnclx"); assert i > 0 and d[i+8:i+15] == bytes.fromhex("00020002000100")
    d[i+8:i+15] = bytes.fromhex("00010001000100"); p.write_bytes(d)
EOF
# Check both agree: the container, and the SPS on its own.
ffprobe -v error -select_streams v:0 -show_entries stream=color_range,color_space,color_transfer,color_primaries -of csv=p=0 public/video/home-scroll-towers-3200.mp4
ffmpeg -v error -i public/video/home-scroll-towers-3200.mp4 -c copy -bsf:v h264_mp4toannexb -f h264 - | \
  ffprobe -v error -f h264 -show_entries stream=color_range,color_space,color_transfer,color_primaries -of csv=p=0 -i pipe:0

# The poster is the render's own first frame, full size and uncompressed:
# it is the home page's largest-contentful paint.
ffmpeg -y -i $SRC -frames:v 1 -q:v 3 assets/images/home-scroll-towers-poster.jpg
# The end still is the frame the scrub stops on — `duration - 0.05` in `ScrollHero`.
ffmpeg -y -ss 6.9167 -i /tmp/towers-60p-master.mp4 -frames:v 1 \
  -vf "scale=1280:720:flags=lanczos,gblur=sigma=6" -q:v 4 assets/images/home-scroll-towers-end.jpg
```

The poster registers against the clip's first frame at SSIM 0.893, where the
same comparison with one 10px horizontal offset gives 0.508. The gap is the
check; the absolute figure is low only because the poster comes off the
uncompressed render and the clip is crf 26.

#### Measuring it, and two ways the harness lies

Time seeks on `seeked`, on a blob, after one `play()`/`pause()`, with the
machine otherwise idle — a parallel encode inflates software-decode seeks
several-fold. Scroll with `scrollTo({top, behavior: "instant"})`: the site
sets `scroll-behavior: smooth`, so a plain `scrollTo(0, y)` is animated, and
a "leave the hero and come back" step written that way never actually
arrives — the hero then looks hidden and frozen for the whole return pass,
which is an artefact. And close a headless Chrome's old page targets between
runs: each keeps its blob and its animation loop, and after a few the next
run hangs on `canplay`.

### The first encode of this cut, 2026-09-15 to 2026-09-16

One file, `home-scroll-towers-hq.mp4` (3200×1800, GOP 2, crf 28, 27.8 MB,
untagged), played for everyone from the start, with a `-mobile` sibling
nothing used. Removed with the ladder; its master is the same one the ladder
is cut from.

## The short cut — what the hero played from 2026-09-12 to 2026-09-15

Its files are all still in `public/video/` and `assets/images/`, as the long
cut's are. Going back to either is the two imports and the two paths in
`lib/images.ts`, and nothing else.

Between those dates the hero played `public/video/home-scroll-short-hq.mp4` rather
than the two-clip build below: one render, `walkthrough-short.mp4`
(3524×2352, 7.04s, 24p, a Kling 3.0 render), which runs from the towers in
through a window to the living room and stops there — no foyer, and so no
join. The long cut's files are all still in place (`home-scroll.mp4`,
`home-scroll-mobile.mp4`, `home-scroll-poster.jpg`, `home-scroll-end.jpg`),
and going back to it is a matter of pointing `lib/images.ts` at them again.

It is built to the long cut's settings — the same centred 3504×1971 window,
3200×1800 and 1920×1080, a keyframe every second frame, no B-frames, 60fps —
except the CRF, which is 28 rather than 34. At 34 this clip visibly lost the
balcony railings and window frames against its own master; at 1:1, 28 cannot
be told from the master, and 26 bought nothing more for another 7 MB:

| crf | size | SSIM vs master | median seek | p95 |
| --- | ------- | ----- | ---- | ---- |
| 34 | 16.7 MB | 0.948 | 14.0 | 14.9 |
| 30 | 24.6 MB | 0.964 | 14.2 | 15.1 |
| **28** | **30.1 MB** | **0.970** | **14.2** | **15.3** |
| 26 | 37.1 MB | 0.975 | 14.3 | 15.2 |

The seek table further down argues for a high CRF, but it was taken on the
software decoder. On Chrome's hardware decoder (Apple M5, headless, 80
off-keyframe seeks on a buffered file, median of three rounds) the CRF moves
nothing: every candidate lands inside a 60fps frame. What 28 costs is the
download the cue counts in — 30 MB, against 23.5 MB for the long cut.

The files carry `-hq` rather than overwriting the crf 34 pair they replaced,
because `/video/` is served with a 30-day `max-age` (`next.config.ts`) and a
browser that had the old file would have kept showing it. The render is 24p and there is no 60p upscale of it, so
`minterpolate` synthesises the frames in between, as it did for the 24p
renders before the Topaz files arrived. It is done once, into a near-lossless
60p master, and both files are encoded from that.

The render carries a "KlingAI 3.0 4K" mark in its bottom-right corner. Its top
edge is at row 2207 and the window ends at 2161, so the crop takes it off the
clip and both stills. Any window reaching lower than that brings it back.

```sh
SRC=assets/video-source/walkthrough-short.mp4
WIN="crop=3504:1971:10:190"
MI="minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"
X264="-an -c:v libx264 -preset slow -crf 28 -g 2 -keyint_min 2 -sc_threshold 0 -bf 0 -profile:v high -movflags +faststart"

ffmpeg -y -i $SRC -vf "$WIN,scale=3200:1800:flags=lanczos,$MI" \
  -an -c:v libx264 -preset fast -crf 8 -pix_fmt yuv420p /tmp/short-60p-master.mp4
ffmpeg -y -i /tmp/short-60p-master.mp4 -vf format=yuv420p \
  $X264 -level 5.2 public/video/home-scroll-short-hq.mp4
ffmpeg -y -i /tmp/short-60p-master.mp4 -vf "scale=1920:1080:flags=lanczos,format=yuv420p" \
  $X264 -level 4.2 public/video/home-scroll-short-hq-mobile.mp4

ffmpeg -y -i $SRC -frames:v 1 -vf "$WIN" -q:v 3 assets/images/home-scroll-short-poster.jpg
# The end still is the frame the scrub stops on — `duration - 0.05` in
# `ScrollHero` — taken off the master, which interpolation leaves 0.07s
# shorter than the render.
ffmpeg -y -ss 6.9167 -i /tmp/short-60p-master.mp4 -frames:v 1 \
  -vf "scale=1280:720:flags=lanczos,gblur=sigma=6" -q:v 4 assets/images/home-scroll-short-end.jpg
```

## Rebuilding the hero video

```sh
python3 assets/video-source/build-hero-video.py          # both files
python3 assets/video-source/build-hero-video.py --only mobile
```

Needs `numpy`, `pillow` and `opencv-python`. About 45 seconds per file. It
writes `public/video/home-scroll.mp4` (3200×1800, crf 34, ~24 MB) and
`home-scroll-mobile.mp4` (1920×1080, crf 34, ~12 MB), both 60fps, both with a
keyframe every second frame — and both stills, which are cut from the same
windows so their framing cannot drift from the clip's.

`--gop`, `--crf`, `--height` and `--out` override the defaults without editing
them, which is how the table below was produced.

## Why 16:9, and the crop that was hiding in the build

The panel is the whole screen below the header — `h-hero-panel` fixes no shape
of its own — so it is whatever the window is: about 1.95:1 on a 1920×1080
desktop, 1.79:1 on a 1440×900 laptop, 1.71:1 on a 1512×982 MacBook. The clip
has to fill that with no letterbox and no visible crop, and 16:9 sits inside
that range, so `object-cover` trims a few percent off one pair of edges.

16:9 is also the ceiling, not a preference. `WINDOW_B` is 3840 columns wide to
match clip A's framing and clip B's render is 3988×2162, so 3840/2162 = 1.776
— 16:9 uses 2160 of those 2162 rows and there is no taller cut to be had.

This was 2.4:1 for a while, and that was a real mistake rather than a stylistic
one. The argument for it went: the hero is full-bleed, `object-cover` scales
the clip to the box's *width*, so the box height changes nothing about the
sampling and a shorter band is free height to spend on width. That is sound
only while the panel is a band *shorter than the screen*, which is what it was
then. On a full-height panel the height binds instead — and a 2.4:1 window
takes 1460 of clip A's 2352 rows, so two fifths of every frame was being thrown
away in the build. The hero looked pushed in because it was.

The rows are back, and the width pays for them. Clip A's window is 3524px
across, so 3504 is native; 3504 at 16:9 is 6.9 megapixels a frame and a ~30MB
file, and every seek has to decode it. 3200×1800 is 5.8 — a tenth more than the
2.4:1 file the scrub was tuned against — and 3200 is 0.91× of native, which on
a 1676 CSS-pixel column at Retina density is a 1.05× upscale nobody can see.

## Why 3200 across, and the decode cliff that nearly hid it

1440p was chosen back when 2560 was reckoned the ceiling worth paying for, and
the ceiling is the render, not a guess: `WINDOW_A` is 3504 source columns, so
the desktop file is the render resampled by 0.91 in the same filtered step that
crops it — one Lanczos pass, not two.

Timing it is where this gets interesting, because the first measurement said
not to do it. Timed the usual way — 80 seeks landing off-keyframe on a fully
buffered file — the numbers came back:

| file | software decode | with hardware decode |
| ------------ | ------- | ------ |
| 2880×1200 | 28.0 median, 39.3 p95 | 7.7 median, 8.9 p95 |
| 3504×1460 | 39.5 median, 55.4 p95 | 11.6 median, 13.8 p95 |

The left column is Chrome run with `--disable-gpu`, and it is not a slower
version of the right one — it is a different shape of answer. 2880×1200 has
*fewer* pixels than the 2560×1440 file it replaced and still measured 2.5×
slower there, which is the tell: past about 2560 across, the software path
falls off a cliff that has nothing to do with pixel count.

With the hardware decoder, which is what any browser actually uses for H.264,
both are inside a single 60fps frame. So measure this with the GPU on. Timing
a hero encode under `--disable-gpu` will tell you to ship a smaller file than
you need to.

## Why a keyframe every second frame

`ScrollHero` seeks to an arbitrary time on every animation frame, so the
keyframe interval is what decides whether the scrub feels attached to the
wheel. This ran at 6 for a while on an *estimate* that a seek cost about
3.6ms. Timed in a browser instead — 80 seeks landing off-keyframe across the
clip — it was a median of 19.6ms and a p95 of 37.2ms, two and a half animation
frames, and the hero visibly lagged the wheel.

Seek cost tracks two things: how many frames must be decoded to reach the
target, and how many bits must be read to do it. A shorter GOP and a higher
CRF therefore pull the same way, and together they beat either alone. Measured
at 2560×1440 back when that was the shipped size, SSIM against a crf-12
reference — and, like everything in this section, on the software decoder, so
read the columns against each other rather than against the table above:

| gop | crf | size | SSIM | median | p95 | max |
| --- | --- | ------- | ----- | ------ | ---- | ---- |
| 6 | 28 | 18.6 MB | 0.952 | 19.6 | 37.2 | 49.2 |
| 3 | 30 | 20.3 MB | 0.920 | 16.7 | 26.9 | 29.2 |
| 2 | 30 | 25.9 MB | 0.934 | 15.8 | 25.8 | 27.1 |
| 2 | 28 | 31.8 MB | 0.947 | 16.3 | 29.4 | 31.2 |
| **2** | **32** | 21.1 MB | 0.918 | **12.6** | **22.0** | **22.9** |

The shipped CRF is 34 rather than the 32 in that table. It was raised while the
clip was briefly cut to 40:21, where the frame carried proportionally more
building and less sky and so cost more per bit; measured at 2560×1344 against a
40:21 reference:

| crf | size | SSIM | median | p95 |
| --- | ------- | ----- | ------ | ---- |
| 32 | 20.1 MB | 0.917 | 19.3 | 29.7 |
| **34** | **16.4 MB** | 0.898 | **16.8** | **24.6** |
| 36 | 13.4 MB | 0.880 | 16.7 | 24.7 |

34 is where the curve flattens: 36 buys no more speed and only loses detail, and
it has been kept through every reshaping since. At the shipped 3200×1800 it is a
23.5 MB file — the 16:9 re-cut costs about a tenth more pixels a frame than the
2.4:1 one the seek table above was measured on.

Absolute figures move with whatever else the machine is doing — the same
reference file measured anywhere from 12.5ms to 19.5ms median across runs — so
read the columns against each other, not on their own.

The SSIM given up along the way does not show. At 1:1 on the densest part of
the frame, balcony railings and foliage, crf 34 cannot be told from crf 32, and
neither can be told from the `6/28` encode that lagged.

The phone file stays 1920 across and gains the height: 1920×1080. In portrait
the panel is far narrower than the clip, so `cover` binds on the height and
what survives is a slice of the middle, magnified — and a taller file makes
that slice *wider* in source pixels, because a taller frame meets the panel's
height at a smaller scale. On a 390×763 panel the visible slice goes from 460
source columns at 1920×800 to 552 at 1920×1080. It is the one place where the
extra rows buy sharpness rather than cost it.

The denoise pass is gone. It existed to hold the bitrate down when every third
frame was a keyframe; it saves under a percent, and it was taking fine texture
off a render with none to spare. CRF holds the bitrate instead, and CRF does
not blur.

The script's docstring covers the join in detail. In short: one clip is pushed
in 8.5% and nudged 22px so the two framings land on each other, the pair are
warped into correspondence with optical flow so the furniture — which the two
renders place differently — moves rather than doubles, they are dissolved in
linear light, and the push is released back to nothing over the two seconds
either side of the dissolve. Cross-correlated over the overlap, the frames sit
at 0.96 against the 0.53 a plain dissolve managed.

Clip B carries the push, which at 16:9 it has the room for: its window is 3840
of 3988 columns and 2160 of 2162 rows, and pushed in by 1.085 it sits at
3539×1991, well inside the render.

Everything is composited in Python rather than ffmpeg because the release has
to be sub-pixel smooth: `zoompan` rounds its crop origin to a whole source
pixel, which on a zoom this slow is a visible half-pixel stutter every few
frames.

## The two stills

Both are written by the same script, from the same windows the clip is cut
with. They used to be two ffmpeg commands kept here by hand, and the framing in
them drifted every time the shape of the hero changed — which shows, because
both are cross-faded against the clip on the page.

`home-scroll-poster.jpg` is the first frame, at the window's own resolution
(3504×1971). It comes from the render rather than the encode so it carries none
of the clip's compression, and it is not resized down: it is the home page's
largest-contentful paint, `next/image` serves a variant sized to whatever is
asking, and a master that stops short caps how sharp the largest of those can
be.

`home-scroll-end.jpg` is the last frame at 1280×720, blurred once at build time
so the close never asks a GPU to run a full-screen blur over live video. Its
crop is the build's final framing — the same window, offset by the 44 source
pixels the pan works out to once the push has been released — so the cross-fade
lands exactly on top of the frame the clip ends on.

To check that they still register, seek the encode to either end and difference
it against the still: in register the error is codec noise, and one pixel of
offset roughly doubles it. This is worth actually running rather than reading —
the poster crop was centred vertically and not horizontally for a long time,
which put it 10 source columns off the clip, and phase-correlating the two is
what found it.
