#!/usr/bin/env python3
"""Build `public/video/home-scroll*.mp4` from the two walkthrough clips.

The home hero is one continuous move — towers from the air, the living room,
the foyer — scrubbed by the scroll wheel in `components/sections/scroll-hero.tsx`.
It is cut from two renders, and the whole point of this script is that nobody
can tell: the second clip opens on the same living room the first one ends in,
but framed about 8% wider, and a plain dissolve across that mismatch reads as
a cut between two videos. So the join is matched rather than merely faded:

  * Clip B is pushed in by `Z_FADE` and nudged by `PAN` so its opening framing
    sits on top of clip A's closing framing. Both numbers are measured rather
    than guessed: a normalised cross-correlation over the overlap, weighted by
    how visible a mismatch is at each point in the blend, puts the pair at
    0.96 with a 1.085 zoom and a 22px nudge. Uncorrected — which is what the
    join used to be — the same measurement reads 0.53.
  * The two cameras dolly forward at nearly the same rate through the overlap,
    which is why one zoom holds for all of it. They do drift apart sideways,
    by about 60px across the dissolve; `PAN` splits that difference so the
    frames land dead on each other at the halfway point, where both are at
    full strength and a mismatch would show most.
  * After the dissolve the push is released back to the clip's own framing,
    leaving and arriving at zero velocity so there is no kink at either end.
    It is a pull-back of 8.5% spread over `RELEASE_S`, peaking at about 7% a
    second against the 17% a second clip B is pushing in at — so the move
    slows for a moment but never reverses.
  * What the match cannot fix, a morph does. The two renders are of the same
    room but not the same room: the armchairs and the coffee table sit in
    slightly different places, and near the camera that is tens of pixels no
    global transform will ever reconcile. So each blended pair is warped into
    correspondence first — dense optical flow between the two frames, each
    side pushed toward the other in proportion to how far the dissolve has
    got. The furniture moves into place instead of appearing twice.
  * The dissolve itself is a smoothstep in *linear light*. A cross-fade in
    code values dips in luminance across the middle; in linear light the join
    holds its exposure, which is most of what gives a dissolve away.

Everything is composited in Python because the zoom has to be sub-pixel
smooth. ffmpeg's `zoompan` quantises its crop origin to whole source pixels,
which on a slow zoom shows up as a half-pixel stutter every few frames.
Pillow's `resize(box=...)` takes a float box and filters the crop and the
scale in one step, so the release is perfectly smooth.

Usage (from the repository root, needs `pillow`, `numpy` and `opencv-python`):

    python3 assets/video-source/build-hero-video.py            # both files
    python3 assets/video-source/build-hero-video.py --only mobile
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets" / "video-source"

CLIP_A = SOURCE / "walkthrough-exterior-to-living.mp4"
CLIP_B = SOURCE / "walkthrough-living-to-foyer.mp4"

# What ffmpeg hands over, as x, y, w, h in source pixels: the whole of each
# render. These used to be hand-cut windows, 3524×1982 and 3988×2160, chosen
# to be exactly what `WINDOW_A` and `WINDOW_B` would then take out of them —
# which left no slack at all, and `3524 / (16/9)` is 1982.25, a quarter of a
# pixel more than that. Both windows are centred on the source either way, so
# handing over the whole frame changes no framing and leaves the rounding
# somewhere to go.
CROP_A = (0, 0, 3524, 2352)
CROP_B = (0, 0, 3988, 2162)

# The hero's shape: 16:9, and it is the *tallest* shape this footage has.
#
# The panel on the page is the whole screen below the header — see
# `h-hero-panel` in `app/globals.css` — which is somewhere between 1.7:1 and
# 1.95:1 on the machines this is read on. The clip has to fill that with no
# letterbox and no visible crop, and 16:9 sits in the middle of that range, so
# `object-cover` trims a few percent off one pair of edges and nothing more.
#
# It is also the ceiling, not a preference. Clip B's render is 3988×2162, and
# `WINDOW_B` is 3840 across to match clip A's framing; 3840/2162 is 1.776, so
# 16:9 uses 2160 of those 2162 rows. There is no taller cut available.
#
# This was 2.4:1 for a while, which was a real mistake and not a stylistic
# one: a 2.4:1 window takes 1460 of clip A's 2352 rows, so nearly two fifths
# of every frame was being thrown away here and the hero looked pushed in.
# The old note argued the height was free because `cover` scales to the box's
# *width* — true only while the panel was a band shorter than the screen. On a
# full-height panel the height binds instead, and the rows matter.
#
# Width still decides sharpness, and 3200 is 0.91× of clip A's native 3524 —
# on a 1676 CSS-pixel column at Retina density that is a 1.05× upscale, which
# is invisible. Going native instead would put the frame at 6.9 megapixels and
# the file near 30MB, and every seek has to decode it; 3200×1800 is 5.8, a
# tenth more than the 2.4:1 file the scrub was tuned against.
ASPECT = 16 / 9

WINDOW_A = (3504, 3504 / ASPECT)
WINDOW_B = (3840, 3840 / ASPECT)

FPS = 60

# Frames of overlap. 33 at 60fps is 0.55s: long enough to be a dissolve rather
# than a cut, short enough that both clips are still the same living room for
# all of it — clip A is only done resolving into the room at about 6.5s.
FADE = 33

# The push and the nudge that put clip B's opening framing on clip A's closing
# one. The pan is a fraction of the frame width, so it holds at either output
# size, and unlike the push it is never released: it is one percent of
# re-centring that nobody can see, and leaving it there is better than panning
# back out of it afterwards.
Z_FADE = 1.085
PAN = 22 / 1920

# When the push is fully released, in seconds from clip B's first frame.
RELEASE_S = 2.4

# `WINDOW_A` is 3504 source pixels across and the desktop file is 3200, so the
# frames come down by 0.91 in the same filtered step that crops them — one
# Lanczos pass, not two. See the note on `ASPECT` for why not native.
#
# Level 5.2 rather than 5.1: 3200×1800 is 18000 macroblocks, and 60 of those a
# second is 1.08M MB/s against 5.1's ceiling of 983K.
OUTPUTS = {
    "desktop": {
        "size": (3200, 1800), "crf": 34, "level": "5.2",
        "name": "home-scroll.mp4",
    },
    # The phone file keeps its width and gains the height. In portrait the
    # panel is far narrower than the clip, so `cover` binds on the height and
    # what survives is a slice of the middle, magnified — and a taller file is
    # what makes that slice wider in source pixels, so it is the one place
    # where the extra rows buy sharpness rather than cost it.
    "mobile": {
        "size": (1920, 1080), "crf": 34, "level": "4.2",
        "name": "home-scroll-mobile.mp4",
    },
}

# Frames between keyframes. `ScrollHero` seeks to an arbitrary time on every
# animation frame, so this is the number that decides whether the scrub feels
# attached to the wheel — and it is worth measuring rather than reasoning
# about, because the arithmetic here is misleading. This was 6 for a while, on
# an estimate that a seek cost about 3.6ms. Timed properly in a browser, over
# 80 seeks landing off-keyframe across the clip, 1440p/6 was a median of 19.6ms
# and a p95 of 37.2 — two and a half animation frames, which is exactly the lag
# the hero had.
#
# Seek cost turns out to track two things: how many frames must be decoded to
# reach the target, and how many bits must be read to do it. So a shorter GOP
# and a higher CRF pull in the same direction, and together they beat either
# alone. Measured at 2560×1440, all against the same crf-12 reference:
#
#     gop  crf   size    SSIM    median   p95    max
#       6   28   18.6M   0.952    19.6    37.2   49.2   ← was
#       3   30   20.3M   0.920    16.7    26.9   29.2
#       2   30   25.9M   0.934    15.8    25.8   27.1
#       2   28   31.8M   0.947    16.3    29.4   31.2
#       2   32   21.1M   0.918    12.6    22.0   22.9   ← is
#
# `2/32` is the corner: every seek inside a frame and a half, for 2.5MB more
# than the laggy encode and less than the alternatives. The SSIM it gives up is
# real but not visible — side by side at 1:1 on the densest part of the frame,
# balcony railings and foliage, it cannot be told from `6/28`, and the hero is
# a moving picture the reader is dragging past.
GOP = 2

# Optical flow is estimated at this fraction of full resolution and then
# smoothed, in pixels of the full frame. Both are deliberately coarse: what
# has to be reconciled is where a whole armchair sits, and a flow field that
# chases individual cushion folds tears more than it fixes.
FLOW_SCALE = 0.75
FLOW_SMOOTH = 3.0



def srgb_to_linear() -> np.ndarray:
    """256-entry decode table — the frames arrive as 8-bit, so this is exact."""
    x = np.arange(256, dtype=np.float32) / 255.0
    return np.where(x <= 0.04045, x / 12.92, ((x + 0.055) / 1.055) ** 2.4).astype(
        np.float32
    )


TO_LINEAR = srgb_to_linear()


def linear_to_srgb(x: np.ndarray) -> np.ndarray:
    x = np.clip(x, 0.0, 1.0)
    out = np.where(x <= 0.0031308, x * 12.92, 1.055 * np.power(x, 1 / 2.4) - 0.055)
    return np.clip(out * 255.0 + 0.5, 0, 255).astype(np.uint8)


def smoothstep(u: float) -> float:
    u = min(max(u, 0.0), 1.0)
    return u * u * (3.0 - 2.0 * u)


def zoom_at(frame: int) -> float:
    """Clip B's push-in, as a factor on its own framing, at frame `frame`.

    Held while the two clips are on screen together, then let go on a curve
    that starts and finishes at a standstill, so the release neither begins
    with a jolt nor stops with one.
    """
    t = frame / FPS
    fade_s = FADE / FPS
    if t <= fade_s:
        return Z_FADE
    if t >= RELEASE_S:
        return 1.0
    u = (t - fade_s) / (RELEASE_S - fade_s)
    return 1.0 + (Z_FADE - 1.0) * (1.0 - smoothstep(u))


def flow_between(src: np.ndarray, dst: np.ndarray) -> np.ndarray:
    """Where each pixel of `src` has to move to land on `dst`."""
    h, w = src.shape[:2]
    small = (int(w * FLOW_SCALE), int(h * FLOW_SCALE))
    grey = [
        cv2.resize(
            cv2.cvtColor(f, cv2.COLOR_RGB2GRAY), small, interpolation=cv2.INTER_AREA
        )
        for f in (src, dst)
    ]
    dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    dis.setUseSpatialPropagation(True)
    field = cv2.resize(dis.calc(*grey, None), (w, h), interpolation=cv2.INTER_LINEAR)
    return cv2.GaussianBlur(field / FLOW_SCALE, (0, 0), FLOW_SMOOTH)


def along(frame: np.ndarray, field: np.ndarray, amount: float) -> np.ndarray:
    """`frame`, carried `amount` of the way along `field`."""
    h, w = frame.shape[:2]
    gx, gy = np.meshgrid(
        np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32)
    )
    return cv2.remap(
        frame,
        gx + field[..., 0] * amount,
        gy + field[..., 1] * amount,
        cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_REPLICATE,
    )


def read_frames(path: Path, crop: tuple[int, int, int, int]):
    """Yield every frame of `path`, cropped, as an (h, w, 3) uint8 array."""
    x, y, w, h = crop
    proc = subprocess.Popen(
        [
            "ffmpeg", "-v", "error", "-i", str(path),
            "-vf", f"crop={w}:{h}:{x}:{y},"
                   "scale=in_color_matrix=bt709:in_range=tv:out_range=full",
            "-f", "rawvideo", "-pix_fmt", "rgb24", "-",
        ],
        stdout=subprocess.PIPE,
        bufsize=w * h * 3,
    )
    assert proc.stdout is not None
    size = w * h * 3
    try:
        while True:
            buf = proc.stdout.read(size)
            if len(buf) < size:
                break
            yield np.frombuffer(buf, np.uint8).reshape(h, w, 3)
    finally:
        proc.stdout.close()
        proc.wait()


def scaled(
    frame: np.ndarray,
    window: tuple[int, int],
    size: tuple[int, int],
    zoom: float = 1.0,
    pan: float = 0.0,
) -> np.ndarray:
    """The centred `window` of `frame`, pushed in by `zoom` and moved right by
    `pan`, delivered at `size`.

    One filtered step: Pillow takes a float box, so the zoom and the pan are
    both continuous rather than landing on whole source pixels. ffmpeg's
    `zoompan` rounds its crop origin to a whole pixel, which on a release this
    slow shows up as a half-pixel stutter every few frames.
    """
    h, w = frame.shape[:2]
    bw, bh = window[0] / zoom, window[1] / zoom
    # Content moves right when the window moves left.
    cx, cy = w / 2 - pan * bw, h / 2
    box = (cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2)
    return np.asarray(
        Image.fromarray(frame).resize(size, Image.LANCZOS, box=box), dtype=np.uint8
    )


def encoder(path: Path, spec: dict) -> subprocess.Popen:
    """x264 tuned for scrubbing: short keyframe interval, no B-frames.

    A normal two-second keyframe interval would make every seek decode dozens
    of frames; `GOP` keeps that down to a handful. `-bf 0` keeps each frame
    decodable without reordering, which is the other half of a cheap seek.

    Nothing is denoised on the way in any more. It was there to hold the
    bitrate down when every third frame was a keyframe; it saves under a
    percent, and it was taking fine texture off a render that has none to
    spare. The bitrate is held by CRF instead, which does not blur.
    """
    w, h = spec["size"]
    return subprocess.Popen(
        [
            "ffmpeg", "-v", "error", "-y",
            "-f", "rawvideo", "-pix_fmt", "rgb24",
            "-video_size", f"{w}x{h}", "-framerate", str(FPS), "-i", "-",
            "-vf", "scale=in_range=full:out_color_matrix=bt709:out_range=tv,"
                   "format=yuv420p",
            "-an",
            "-c:v", "libx264", "-preset", "slow", "-crf", str(spec["crf"]),
            "-g", str(GOP), "-keyint_min", str(GOP), "-sc_threshold", "0",
            "-bf", "0",
            "-profile:v", "high", "-level", spec["level"],
            "-movflags", "+faststart",
            str(path),
        ],
        stdin=subprocess.PIPE,
    )


def build(kind: str) -> None:
    spec = OUTPUTS[kind]
    size = spec["size"]
    out = Path(spec["name"])
    if not out.is_absolute():
        out = ROOT / "public" / "video" / out
    label = out.relative_to(ROOT) if out.is_relative_to(ROOT) else out
    print(f"→ {label}  {size[0]}×{size[1]}  crf {spec['crf']}  gop {GOP}")

    proc = encoder(out, spec)
    assert proc.stdin is not None
    written = 0

    # Clip A streams straight out, except for the last `FADE` frames, which are
    # held back to blend against clip B's first `FADE`.
    tail: list[np.ndarray] = []
    for frame in read_frames(CLIP_A, CROP_A):
        tail.append(scaled(frame, WINDOW_A, size))
        if len(tail) > FADE:
            proc.stdin.write(tail.pop(0).tobytes())
            written += 1
    if len(tail) < FADE:
        sys.exit(f"clip A is shorter than the {FADE}-frame dissolve")

    for n, frame in enumerate(read_frames(CLIP_B, CROP_B)):
        pushed = scaled(frame, WINDOW_B, size, zoom_at(n), PAN)
        if n < FADE:
            # Smoothstep rather than a straight ramp: the second clip arrives
            # and departs without a corner, which is what stops the eye
            # catching the start of the blend.
            weight = smoothstep((n + 1) / (FADE + 1))
            held = tail[n]
            # Each side travels toward the other by exactly as much as it is
            # giving way, so whichever frame is the fainter is the one being
            # bent the further — the picture in front is always the honest one.
            forward = along(held, flow_between(held, pushed), weight)
            back = along(pushed, flow_between(pushed, held), 1.0 - weight)
            mixed = TO_LINEAR[forward] * (1.0 - weight) + TO_LINEAR[back] * weight
            pushed = linear_to_srgb(mixed)
        proc.stdin.write(pushed.tobytes())
        written += 1

    proc.stdin.close()
    if proc.wait() != 0:
        sys.exit("ffmpeg failed")
    print(f"   {written} frames · {written / FPS:.2f}s · "
          f"{out.stat().st_size / 1_000_000:.1f} MB")


def stills() -> None:
    """Write the poster and the blurred end frame.

    Both are cross-faded against the clip on the page — the poster is what the
    hero shows until the first frame decodes, the end frame is what the close
    dissolves to instead of running a full-screen blur over live video — so
    both have to be framed exactly as the clip is or the swap shows. They are
    derived from the same windows the clip is cut with rather than written out
    by hand, because the hand-written version drifted every time the shape of
    the hero changed.

    They come from the renders rather than from the encode, so neither carries
    the clip's compression.
    """
    ax, ay, aw_full, ah = CROP_A
    aw, awh = WINDOW_A
    # The centred window, in the *source's* own coordinates — centred on both
    # axes, which `scaled()` does and this used to do only vertically. Ten
    # source pixels of horizontal drift is small, but it is a sideways jolt
    # exactly as the clip takes over from the poster, which is the one moment
    # the two are on screen together.
    poster_crop = (
        int(aw), round(awh),
        round(ax + (aw_full - aw) / 2), round(ay + (ah - awh) / 2),
    )

    bx, by, bw_full, bh = CROP_B
    bw, bwh = WINDOW_B
    # Clip B ends with the push fully released, so only the pan is left.
    end_crop = (
        int(bw), round(bwh),
        round(bx + (bw_full - bw) / 2 - PAN * bw),
        round(by + (bh - bwh) / 2),
    )

    images = ROOT / "assets" / "images"
    jobs = [
        # Kept at the window's own resolution: this is the home page's largest
        # contentful paint, and `next/image` cannot serve a variant sharper
        # than its master.
        (CLIP_A, None, poster_crop, f"scale={int(aw)}:{round(awh)}:flags=lanczos",
         3, images / "home-scroll-poster.jpg"),
        # Blurred once here so the close never asks a GPU for a full-screen
        # blur over live video.
        (CLIP_B, "3.983333", end_crop,
         f"scale=1280:{round(1280 / ASPECT)}:flags=lanczos,gblur=sigma=6",
         4, images / "home-scroll-end.jpg"),
    ]

    for src, seek, (cw, ch, cx, cy), tail, q, out in jobs:
        cmd = ["ffmpeg", "-v", "error", "-y"]
        if seek:
            cmd += ["-ss", seek]
        cmd += [
            "-i", str(src), "-frames:v", "1",
            "-vf", f"crop={cw}:{ch}:{cx}:{cy},{tail}",
            "-q:v", str(q), str(out),
        ]
        subprocess.run(cmd, check=True)
        print(f"   {out.relative_to(ROOT)}  {out.stat().st_size / 1000:.0f} KB")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--only", choices=sorted(OUTPUTS), help="build one file")
    # Overrides, for measuring a candidate encode without editing the defaults
    # above. `GOP` and resolution are the two numbers the scrub actually feels,
    # and neither can be reasoned about from first principles — the only honest
    # way to pick them is to build a few and time the seeks.
    parser.add_argument("--gop", type=int, help="frames between keyframes")
    parser.add_argument("--crf", type=int, help="x264 quality, lower is bigger")
    parser.add_argument("--height", type=int, help="output height, 16:9 assumed")
    parser.add_argument("--out", help="write here instead of public/video/")
    args = parser.parse_args()

    if args.gop:
        globals()["GOP"] = args.gop

    if not args.out and not args.height:
        stills()

    for kind in [args.only] if args.only else sorted(OUTPUTS):
        spec = OUTPUTS[kind]
        if args.crf:
            spec["crf"] = args.crf
        if args.height:
            spec["size"] = (round(args.height * ASPECT / 2) * 2, args.height)
        if args.out:
            spec["name"] = args.out
        build(kind)


if __name__ == "__main__":
    main()
