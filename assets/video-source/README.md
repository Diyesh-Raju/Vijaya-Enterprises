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
writes `public/video/home-scroll.mp4` (2560×1440, crf 28, ~19 MB) and
`home-scroll-mobile.mp4` (1920×1080, crf 32, ~7.5 MB), both 60fps, both with a
keyframe every sixth frame.

## Why 1440p

The hero is `100svh` with `object-cover`, so the file is stretched across the
whole screen rather than sitting in a box. On a Retina display that is two
device pixels per CSS pixel, which had 1080p landing on a 3024-pixel-wide
laptop panel at a 1.6× upscale — soft, and no amount of bitrate fixes it,
because the pixels are not there. 1440p lands at 1.2×.

It is also about the ceiling worth paying for. Clip A's 16:9 window is 3524px
wide, so past roughly 3.5K the encoder would be interpolating rather than
carrying detail, and a 4K file would cost around 30 MB for the privilege.

The bits came from the keyframe interval. `ScrollHero` seeks to an arbitrary
time on every animation frame, so a normal two-second interval would make each
seek decode dozens of frames — but the 3 this used to run at costs 75% more
bitrate than 6 does, which is most of the way to 1440p on its own. Measured on
this footage, a seek at 1440p with a 6-frame interval lands in about 3.6ms of
*software* decode, a fifth of an animation frame, on hardware that will be
doing it in silicon. The denoise pass went with it: it existed to hold the
bitrate down when every third frame was a keyframe, and at 6 it saves under a
percent while taking fine texture off a render that has none to spare.

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
