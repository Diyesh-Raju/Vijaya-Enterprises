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
writes `public/video/home-scroll.mp4` (2560×1440, crf 32, ~21 MB) and
`home-scroll-mobile.mp4` (1920×1080, crf 34, ~11.5 MB), both 60fps, both with a
keyframe every second frame.

`--gop`, `--crf`, `--height` and `--out` override the defaults without editing
them, which is how the table below was produced.

## Why 1440p

The hero fills a box as tall as the viewport less the header, carrying the
clip's own 16:9. On a Retina display that is two device pixels per CSS pixel,
which had 1080p landing on a 3024-pixel-wide laptop panel at a 1.6× upscale —
soft, and no amount of bitrate fixes it, because the pixels are not there.
1440p lands at about 1.2×.

It is also about the ceiling worth paying for. Clip A's 16:9 window is 3524px
wide, so past roughly 3.5K the encoder would be interpolating rather than
carrying detail, and a 4K file would cost around 30 MB for the privilege.

## Why a keyframe every second frame

`ScrollHero` seeks to an arbitrary time on every animation frame, so the
keyframe interval is what decides whether the scrub feels attached to the
wheel. This ran at 6 for a while on an *estimate* that a seek cost about
3.6ms. Timed in a browser instead — 80 seeks landing off-keyframe across the
clip — it was a median of 19.6ms and a p95 of 37.2ms, two and a half animation
frames, and the hero visibly lagged the wheel.

Seek cost tracks two things: how many frames must be decoded to reach the
target, and how many bits must be read to do it. A shorter GOP and a higher
CRF therefore pull the same way, and together they beat either alone. At
2560×1440, SSIM against a crf-12 reference:

| gop | crf | size | SSIM | median | p95 | max |
| --- | --- | ------ | ----- | ------ | ---- | ---- |
| 6 | 28 | 18.6 MB | 0.952 | 19.6 | 37.2 | 49.2 |
| 3 | 30 | 20.3 MB | 0.920 | 16.7 | 26.9 | 29.2 |
| 2 | 30 | 25.9 MB | 0.934 | 15.8 | 25.8 | 27.1 |
| 2 | 28 | 31.8 MB | 0.947 | 16.3 | 29.4 | 31.2 |
| **2** | **32** | **21.1 MB** | 0.918 | **12.6** | **22.0** | **22.9** |

`2/32` is the corner: every seek inside a frame and a half, for 2.5 MB more
than the encode that lagged and less than any of the alternatives. It is also
quicker than the 1080p/48fps file this replaced, which measured 13.3ms median
and 25.5ms p95 — so the hero is sharper *and* smoother than it has been. The
SSIM it gives up is real but does not show: side by side at 1:1 on the densest
part of the frame, balcony railings and foliage, it cannot be told from
`6/28`.

The phone file stays at 1080p rather than dropping to 720p. In portrait the
panel is far narrower than the clip, so the picture is cropped hard at the
sides and what survives is the middle third of the frame, magnified — it needs
the pixels more than the desktop file does, not less. crf 34 is what holds it
near 11 MB with a keyframe every second frame.

The denoise pass is gone. It existed to hold the bitrate down when every third
frame was a keyframe; it saves under a percent, and it was taking fine texture
off a render with none to spare. CRF holds the bitrate instead, and CRF does
not blur.

The script's docstring covers the join in detail. In short: the second clip is
pushed in 8.5% and nudged 22px so its opening framing lands on the first clip's
closing framing, the two are warped into correspondence with optical flow so
the furniture — which the two renders place differently — moves rather than
doubles, they are dissolved in linear light, and the push is then released back
to nothing over the two seconds that follow. Cross-correlated over the overlap,
the frames sit at 0.96 against the 0.53 a plain dissolve managed.

Everything is composited in Python rather than ffmpeg because the release has
to be sub-pixel smooth: `zoompan` rounds its crop origin to a whole source
pixel, which on a zoom this slow is a visible half-pixel stutter every few
frames.

## The two stills

The poster (`assets/images/home-scroll-poster.jpg`) is the first frame, taken
from the render rather than the encode so it stays sharp:

```sh
ffmpeg -y -i "assets/video-source/walkthrough-exterior-to-living.mp4" \
  -frames:v 1 -vf "crop=3524:1982:0:185,scale=3524:1982:flags=lanczos" -q:v 3 \
  assets/images/home-scroll-poster.jpg
```

It is kept at the render's own resolution rather than resized down: it is the
home page's largest-contentful paint, `next/image` serves a variant sized to
whatever is asking, and a master that stops at 2400px caps how sharp the
largest of those can be.

`home-scroll-end.jpg` is the last frame, blurred once here so the close never
asks a GPU to run a full-screen blur over live video. The crop is the build's
final framing — the same 16:9 window, offset by the 44 source pixels the pan
works out to once the push has been released — so the cross-fade to it lands
exactly on top of the frame the clip ends on.

```sh
ffmpeg -y -ss 3.983333 -i "assets/video-source/walkthrough-living-to-foyer.mp4" \
  -frames:v 1 \
  -vf "crop=3840:2160:30:1,scale=1280:720:flags=lanczos,gblur=sigma=6" -q:v 4 \
  assets/images/home-scroll-end.jpg
```
