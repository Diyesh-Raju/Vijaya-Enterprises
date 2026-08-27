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
writes `public/video/home-scroll.mp4` (2560×1136, crf 34, ~14 MB) and
`home-scroll-mobile.mp4` (1920×852, crf 34, ~10 MB), both 60fps, both with a
keyframe every second frame — and both stills, which are cut from the same
windows so their framing cannot drift from the clip's.

`--gop`, `--crf`, `--height` and `--out` override the defaults without editing
them, which is how the table below was produced.

## Why 160:71 rather than 16:9

The clip does not fill the viewport. It fills what is left of it between the
header and the figures on the block at the foot of the hero, which is a much
wider box. Measured in a browser across the sizes this is actually read at:

| viewport | film box | ratio | | viewport | film box | ratio |
| --------- | -------- | ----- | - | --------- | --------- | ----- |
| 1366×768 | 1366×538 | 2.541 | | 1663×971 | 1663×741 | 2.246 |
| 1440×900 | 1440×670 | 2.151 | | 1920×1080 | 1920×850 | 2.260 |
| 1512×982 | 1512×752 | 2.012 | | 2560×1440 | 2560×1210 | 2.117 |

A 16:9 clip in a box that shape has to either give up part of the frame or sit
in it with a margin either side. Both were tried and both were wrong: covering
took ~48px off the top, which is the part that meets the bar, and fitting put
black bars down both edges.

So the clip is cut to the shape of the box. 160:71 looks arbitrary and is not —
it is the ratio that lands every size here on a whole pixel. 2560 and 1920 both
divide by 160, so the outputs come out at exactly 1136 and 852 and clip B's
window at exactly 1704. It also sits between the two sizes that matter most, so
the crop on a 1663-wide screen is 2.9px at the sides and on 1920×1080 is 2.5px
at the foot.

The height comes out of the renders' own spare, which the 16:9 window was
throwing away. Both windows keep their centre, so the join is untouched.

## Why 1440-ish

On a Retina display the panel is two device pixels per CSS pixel, which had
1080p landing on a 3024-pixel-wide laptop panel at a 1.6× upscale — soft, and
no amount of bitrate fixes it, because the pixels are not there. 2560 across
lands at about 1.2×. It is also the ceiling worth paying for: clip A's window
is 3524px wide, so past roughly 3.5K the encoder would be interpolating rather
than carrying detail.

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
Measured at 2560×1440 while the clip was still 16:9, SSIM against a crf-12
reference of the same shape:

| gop | crf | size | SSIM | median | p95 | max |
| --- | --- | ------- | ----- | ------ | ---- | ---- |
| 6 | 28 | 18.6 MB | 0.952 | 19.6 | 37.2 | 49.2 |
| 3 | 30 | 20.3 MB | 0.920 | 16.7 | 26.9 | 29.2 |
| 2 | 30 | 25.9 MB | 0.934 | 15.8 | 25.8 | 27.1 |
| 2 | 28 | 31.8 MB | 0.947 | 16.3 | 29.4 | 31.2 |
| **2** | **32** | 21.1 MB | 0.918 | **12.6** | **22.0** | **22.9** |

Widening to 40:21 cost a little of that back — the frame carries proportionally
more building and less sky, which is more expensive per bit — so the shipped
CRF is 34 rather than 32. At 2560×1344, against a 40:21 reference:

| crf | size | SSIM | median | p95 |
| --- | ------- | ----- | ------ | ---- |
| 32 | 20.1 MB | 0.917 | 19.3 | 29.7 |
| **34** | **16.4 MB** | 0.898 | **16.8** | **24.6** |
| 36 | 13.4 MB | 0.880 | 16.7 | 24.7 |

34 is where the curve flattens: 36 buys no more speed and only loses detail.
Absolute figures move with whatever else the machine is doing — the same
reference file measured anywhere from 12.5ms to 19.5ms median across runs — so
read the columns against each other, not on their own.

The SSIM given up along the way does not show. At 1:1 on the densest part of
the frame, balcony railings and foliage, crf 34 cannot be told from crf 32, and
neither can be told from the `6/28` encode that lagged.

The phone file stays at 1080-ish rather than dropping to 720p. In portrait the
panel is far narrower than the clip, so the picture is cropped hard at the
sides and what survives is the middle third of the frame, magnified — it needs
the pixels more than the desktop file does, not less.

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

Both are written by the same script, from the same windows the clip is cut
with. They used to be two ffmpeg commands kept here by hand, and the framing in
them drifted every time the shape of the hero changed — which shows, because
both are cross-faded against the clip on the page.

`home-scroll-poster.jpg` is the first frame, at the window's own resolution
(3524×1850). It comes from the render rather than the encode so it carries none
of the clip's compression, and it is not resized down: it is the home page's
largest-contentful paint, `next/image` serves a variant sized to whatever is
asking, and a master that stops short caps how sharp the largest of those can
be.

`home-scroll-end.jpg` is the last frame at 1280×672, blurred once at build time
so the close never asks a GPU to run a full-screen blur over live video. Its
crop is the build's final framing — the same window, offset by the 44 source
pixels the pan works out to once the push has been released — so the cross-fade
lands exactly on top of the frame the clip ends on.

To check that they still register, seek the encode to either end and difference
it against the still: in register the error is codec noise, and one pixel of
offset roughly doubles it.
