# Home hero source clips

The two originals behind `public/video/home-scroll*.mp4`, kept out of
`public/` so 60 MB of source never ships in the deployment — and out of git
(see `.gitignore`) so it never lands in the history either. They live on
whoever holds the renders; ask before assuming a clone has them.

| File                                   | Source                | Shot                        |
| -------------------------------------- | --------------------- | --------------------------- |
| `walkthrough-exterior-to-living.mp4`   | 3524×2352, 7.04s, 24p | towers from the air → living |
| `walkthrough-living-to-foyer.mp4`      | 3912×2120, 4.04s, 24p | living → entrance foyer      |

The second clip opens on the same living room the first one ends in, so they
run in that order with a half-second dissolve across the join.

## Rebuilding the hero video

Both clips are centre-cropped to 16:9 (their native ratios differ), lightly
denoised — the render grain is expensive to encode and adds nothing — and then
given two things the scrub depends on:

**A keyframe every third frame.** `ScrollHero` seeks to an arbitrary time on
every animation frame, and a normal 2-second keyframe interval would make each
of those seeks decode dozens of frames. `-g 3` makes a seek nearly free, at
maybe 20% more bitrate.

**Twice the frames.** The sources are 24fps, which is fine for playback and
thin for scrubbing: at that density a slow scroll shows the same frame for a
long stretch of travel and the walkthrough steps rather than moves.
`minterpolate` synthesises the frames between, taking the clip to 48fps, and
these scenes — a drone orbit, a dolly through a foyer — are exactly the smooth
camera moves motion compensation handles cleanly.

Run from the repository root. `1920:1080` / crf 28 is the desktop file,
`1280:720` / crf 31 the phone one.

```sh
MI="minterpolate=fps=48:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"

ffmpeg -y \
  -i "assets/video-source/walkthrough-exterior-to-living.mp4" \
  -i "assets/video-source/walkthrough-living-to-foyer.mp4" \
  -filter_complex "\
[0:v]crop=3524:1982:0:185,scale=1920:1080:flags=lanczos,hqdn3d=2:1.5:4:4,setsar=1,fps=24,$MI[a];\
[1:v]crop=3768:2120:72:0,scale=1920:1080:flags=lanczos,hqdn3d=2:1.5:4:4,setsar=1,fps=24,$MI[b];\
[a][b]xfade=transition=fade:duration=0.5:offset=6.5417,format=yuv420p[v]" \
  -map "[v]" -an \
  -c:v libx264 -preset slow -crf 28 \
  -g 3 -keyint_min 3 -sc_threshold 0 -bf 0 \
  -profile:v high -level 4.2 -pix_fmt yuv420p -movflags +faststart \
  public/video/home-scroll.mp4
```

Interpolate *after* the scale, never before: motion estimation at 3524×2352
costs many times what it costs at 1920×1080 and buys nothing.

The poster (`assets/images/home-scroll-poster.jpg`) is the first frame, taken
from the original rather than the encode so it stays sharp:

```sh
ffmpeg -y -i "assets/video-source/walkthrough-exterior-to-living.mp4" \
  -frames:v 1 -vf "crop=3524:1982:0:185,scale=2400:1350:flags=lanczos" -q:v 4 \
  assets/images/home-scroll-poster.jpg
```
