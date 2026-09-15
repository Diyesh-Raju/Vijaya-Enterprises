# Home hero source clips

The originals behind `public/video/home-scroll*.mp4`, kept out of `public/`
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

## The towers cut — what the hero plays now

Since 2026-09-15 the hero plays `public/video/home-scroll-towers-hq.mp4`:
one render, `walkthrough-towers.mp4`, which opens on a landscaped block of
white apartment towers from the air, pushes down the facade past a planted
balcony and ends inside a lamplit living room. Same arc as the short cut it
replaces — exterior, through the glass, interior — so the two stills either
end of the scrub still describe it and `alt` did not change.

It arrives already 16:9 (3840×2160) and carries no render mark, so unlike
both earlier cuts there is **no crop window**: the whole frame is used, and
the poster and the clip cannot drift out of framing with each other because
neither is cropped. `cropdetect` over the first 48 frames returns
`3840:2160:0:0`, and the bottom corners are clean at native resolution.

Everything else is the settings the two cuts before it were built to — 60fps,
a keyframe every second frame, no B-frames, crf 28, 3200×1800 and 1920×1080.
The render is 24p and there is no 60p upscale of it, so `minterpolate`
synthesises the frames in between, into a near-lossless 60p master both files
are encoded from. That pass is the slow one: about four minutes.

Measured on the shipped encode (Apple M5, Chrome headless with the Metal
backend, 80 off-keyframe seeks on a fully buffered file):

| | size | keyframes | SSIM vs master | median seek | p95 | max |
| --- | ------- | ------- | ----- | ---- | ---- | ---- |
| desktop 3200×1800 | 27.8 MB | 209 / 418 | 0.970 | 13.4 | 15.7 | 16.7 |
| mobile 1920×1080 | 14.3 MB | 209 / 418 | — | — | — | — |

Every seek lands inside a single 60fps frame (16.7ms), which is the bar the
section below sets, and the file is 2.3 MB smaller than the cut it replaces.
Read those against the short cut's own row — 14.2 median, 15.3 p95 — rather
than against the software-decoder tables further down.

The poster registers against the clip's first frame at SSIM 0.893, where the
same comparison with one 10px horizontal offset gives 0.508. The gap is the
check; the absolute figure is low only because the poster comes off the
uncompressed render and the clip is crf 28.

```sh
SRC=assets/video-source/walkthrough-towers.mp4
MI="minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"

# ~4 minutes. No crop: the render is already 16:9 edge to edge.
ffmpeg -y -i $SRC -vf "scale=3200:1800:flags=lanczos,$MI" \
  -an -c:v libx264 -preset fast -crf 8 -pix_fmt yuv420p /tmp/towers-60p-master.mp4

ffmpeg -y -i /tmp/towers-60p-master.mp4 -vf format=yuv420p \
  -an -c:v libx264 -preset slow -crf 28 -g 2 -keyint_min 2 -sc_threshold 0 -bf 0 \
  -profile:v high -level 5.2 -movflags +faststart public/video/home-scroll-towers-hq.mp4

ffmpeg -y -i /tmp/towers-60p-master.mp4 -vf "scale=1920:1080:flags=lanczos,format=yuv420p" \
  -an -c:v libx264 -preset slow -crf 28 -g 2 -keyint_min 2 -sc_threshold 0 -bf 0 \
  -profile:v high -level 4.2 -movflags +faststart public/video/home-scroll-towers-hq-mobile.mp4

# The poster is the render's own first frame, full size and uncompressed:
# it is the home page's largest-contentful paint.
ffmpeg -y -i $SRC -frames:v 1 -q:v 3 assets/images/home-scroll-towers-poster.jpg
# The end still is the frame the scrub stops on — `duration - 0.05` in `ScrollHero`.
ffmpeg -y -ss 6.9167 -i /tmp/towers-60p-master.mp4 -frames:v 1 \
  -vf "scale=1280:720:flags=lanczos,gblur=sigma=6" -q:v 4 assets/images/home-scroll-towers-end.jpg
```

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
