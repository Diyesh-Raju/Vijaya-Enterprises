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
writes `public/video/home-scroll.mp4` (3504×1460, crf 34, ~21 MB) and
`home-scroll-mobile.mp4` (1920×800, crf 34, ~9 MB), both 60fps, both with a
keyframe every second frame — and both stills, which are cut from the same
windows so their framing cannot drift from the clip's.

`--gop`, `--crf`, `--height` and `--out` override the defaults without editing
them, which is how the table below was produced.

## Why 2.4:1, and why the height is the thing that pays

The hero is full-bleed, so `object-cover` scales the clip to the box's *width*
and crops the height. Two things follow, and the second is the one that took a
while to see:

1. The encode width is the only thing that decides whether the hero is sharp.
   On a Retina laptop 1676 CSS pixels across is 3352 device pixels, and a
   2560-wide file is a 1.31× upscale onto that.
2. The box height is therefore free. Nothing about it changes the sampling —
   a shorter band crops more of the frame and samples it identically.

So height is currency. Clip A's window is 3524px across, which makes 3504 the
native width — 1.05× oversampled on that screen, and past 3524 the encoder is
inventing detail rather than carrying it. That width at 16:9 is 6.9 megapixels
a frame, a ~27MB file. Cut to 2.4:1 it is 5.1 and lands at 21MB, which is where
the previous 2560-wide file already was. The hero gave up height it had been
cropping away to buy the width it was actually short of.

The band is `aspect-ratio: 12 / 5` on the panel, sized off its own width, and
capped at the screen less the header for a short landscape window — an
ultrawide at 2560×1080 wants 1067px of band and has 983, so there the height
binds and `cover` trims the sides instead, which is the right way round to
fail. Below 48rem the panel keeps the whole screen: 2.4:1 of a phone's width is
a 163px ribbon with two thirds of the viewport blank under it, and a portrait
panel crops this clip to the middle fifth of the frame whatever its height, so
the height may as well go to the picture.

What this leaves, on a laptop, is a strip of page under the band while the hero
is pinned — 166px at 1676×961. That is the page's own white and the section
below it (`FiftyYears`) is white too, so it reads as the space above a section
rather than a hole.

## Why 3504 across, and the decode cliff that nearly hid it

1440p was chosen back when the clip was stretched over the full screen and
2560 was reckoned the ceiling worth paying for. Both halves of that changed:
the band is shorter, and the ceiling is the render, not a guess. 3504 is clip
A's own window, so its frames are resampled by nothing at all on the way out —
the desktop file is the render at 1:1.

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
it has been kept through every reshaping since. At the shipped 3504×1460 it is a
21.2 MB file that seeks in 11.6ms median and 13.8 p95 with the hardware decoder.

Absolute figures move with whatever else the machine is doing — the same
reference file measured anywhere from 12.5ms to 19.5ms median across runs — so
read the columns against each other, not on their own.

The SSIM given up along the way does not show. At 1:1 on the densest part of
the frame, balcony railings and foliage, crf 34 cannot be told from crf 32, and
neither can be told from the `6/28` encode that lagged.

The phone file stays 1920 across and is only re-cut in height. In portrait the
panel is far narrower than the clip, so the picture is cropped hard at the sides
and what survives is the middle fifth of the frame, magnified — it needs the
width more than the desktop file does, not less.

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
(3504×1460). It comes from the render rather than the encode so it carries none
of the clip's compression, and it is not resized down: it is the home page's
largest-contentful paint, `next/image` serves a variant sized to whatever is
asking, and a master that stops short caps how sharp the largest of those can
be.

`home-scroll-end.jpg` is the last frame at 1280×533, blurred once at build time
so the close never asks a GPU to run a full-screen blur over live video. Its
crop is the build's final framing — the same window, offset by the 44 source
pixels the pan works out to once the push has been released — so the cross-fade
lands exactly on top of the frame the clip ends on.

To check that they still register, seek the encode to either end and difference
it against the still: in register the error is codec noise, and one pixel of
offset roughly doubles it.
