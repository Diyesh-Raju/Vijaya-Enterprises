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

# What ffmpeg hands over, as x, y, w, h in source pixels. The two renders have
# different native ratios, so each needs its own 16:9 window; clip B keeps the
# full width of its render, because the pan below has to have somewhere to go.
CROP_A = (0, 185, 3524, 1982)
CROP_B = (0, 1, 3988, 2160)

# The 16:9 window inside each of those, centred. Clip A's is the whole thing.
WINDOW_A = (3524, 1982)
WINDOW_B = (3840, 2160)

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

# The hero is `100svh` with `object-cover`, so the file is stretched across the
# whole screen — and on any Retina display that is two device pixels per CSS
# pixel. 1080p was landing on a 3024-pixel-wide laptop panel at a 1.6× upscale,
# which is what soft hero video actually looks like; 1440p lands at 1.2×. It is
# also about the ceiling worth paying for: clip A's 16:9 window is 3524px wide,
# so anything past roughly 3.5K is interpolation rather than detail.
OUTPUTS = {
    "desktop": {
        "size": (2560, 1440), "crf": 28, "level": "5.1",
        "name": "home-scroll.mp4",
    },
    "mobile": {
        "size": (1920, 1080), "crf": 32, "level": "4.2",
        "name": "home-scroll-mobile.mp4",
    },
}

# Frames between keyframes. `ScrollHero` seeks to an arbitrary time on every
# animation frame, so this is the number that decides whether the scrub feels
# attached to the wheel. It used to be 3, on the theory that a seek should
# never decode more than a frame or two — but 3 costs 75% more bitrate than 6
# does, and measured here a seek at 1440p/6 lands in about 3.6ms of *software*
# decode, a fifth of an animation frame, on hardware that will be doing it in
# silicon. Spending that headroom on resolution is the better trade.
GOP = 6

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
    bitrate down when every third frame was a keyframe; at `GOP` 6 it saves
    under a percent, and it was taking fine texture off a render that has none
    to spare.
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
    out = ROOT / "public" / "video" / spec["name"]
    print(f"→ {out.relative_to(ROOT)}  {size[0]}×{size[1]}  crf {spec['crf']}")

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


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--only", choices=sorted(OUTPUTS), help="build one file")
    args = parser.parse_args()
    for kind in [args.only] if args.only else sorted(OUTPUTS):
        build(kind)


if __name__ == "__main__":
    main()
