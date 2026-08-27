# Home hero source clips

The two originals behind `public/video/home-scroll*.mp4`, kept out of
`public/` so a quarter of a gigabyte of source never ships in the deployment —
and out of git (see `.gitignore`) so it never lands in the history either. They
live on whoever holds the renders; ask before assuming a clone has them.

| File                                 | Source                | Shot                         |
| ------------------------------------ | --------------------- | ---------------------------- |
| `walkthrough-exterior-to-living.mp4` | 3524×2352, 7.02s, 60p | towers from the air → living |
| `walkthrough-living-to-foyer.mp4`    | 3988×2162, 4.00s, 60p | living → entrance foyer      |

Both are Topaz upscales of the original 24p renders, which are kept alongside
them as `*-24p.mp4`. The upscales are what the build uses: they arrive at 60fps
with the intermediate frames already synthesised, which is both better and
cheaper than the `minterpolate` pass the 24p files used to need.

The second clip opens on the same living room the first one ends in, and the
two run in that order with the join hidden across half a second.

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
