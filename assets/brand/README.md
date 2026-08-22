# Brand assets

`vijaya-logo-master.png` is the artwork as supplied (4622 × 2096, transparent
background). Everything else here is derived from it by
`make-variants.py` — edit the master, re-run the script, commit the result:

```bash
python3 assets/brand/make-variants.py   # needs pillow + numpy
```

| File | Used by | What it is |
|------|---------|------------|
| `vijaya-logo-master.png` | nothing (source of truth) | the supplied artwork, full resolution |
| `vijaya-logo.png` | `components/layout/logo.tsx` | full-colour lockup, 1000px wide — for white and frosted surfaces |
| `vijaya-logo-reversed.png` | `components/layout/logo.tsx` | same lockup with a white wordmark and a relit mark — for navy surfaces |
| `vijaya-mark.png` | `make-variants.py` | the Ganesha mark on its own, trimmed |
| `app/icon.png`, `app/apple-icon.png` | Next.js metadata | the mark on a navy plate |

## Why there are two lockups

The wordmark is dark purple (`#2f2483`) with grey supporting type
(`#575756`). That reads well on white, and disappears on the navy the header
and footer use. The reversed variant recolours the wordmark to white with
`--color-navy-200` supporting type.

The script recolours by row band (the wordmark's three lines sit in bands the
master separates with fully transparent gutters) rather than by matching
colour, because anti-aliased edges have already blended toward white and would
be misclassified.

## Why the reversed mark is relit

The Ganesha mark is a blue gradient drawn for white paper. About half of it
sits at HSL lightness 0.23–0.37 — near enough to `--color-navy-900` (0.15)
that on the site's navy the head, the ear insides and the shaded side of the
trunk all read as ground, and the mark comes out looking flat dark blue rather
than the light blue it is on the page. `for_dark` re-lights every blue pixel
into 0.46–0.84, keeping each one's place in the gradient so the artwork still
reads as one shaded form, and caps hue at 215° so the deepest indigos do not
turn periwinkle on the way up. The saffron and red flowers are left alone.

This is why `vijaya-mark.png` and the reversed lockup's mark are not the same
artwork: the standalone mark is the original, the reversed one is relit. The
icons use the relit mark too — their plate is navy.

## One thing to know if you re-export the master

The master keeps its anti-aliasing in the alpha channel over white RGB, so any
resize has to premultiply first or every edge picks up a white halo. The script
does this; a plain `Image.resize` does not.

## Where the logo appears

`components/layout/logo.tsx` is the only component that renders it, and the
header and footer are its only callers, so both lockups reach every page
through the root layout. The share card (`app/opengraph-image.jpg`) has the
lockup composited into it, and `app/icon.png` / `app/apple-icon.png` carry the
mark. Search engines get it through the `logo` field of the organisation
JSON-LD in `app/layout.tsx`.

The share card is a flat JPEG — `make-variants.py` cannot regenerate it, since
the artwork behind the lockup is gone. To re-composite it, paste
`vijaya-logo-reversed.png` resized to **150px wide at (84, 72)**. The alpha
channel is identical between lockup versions, so a paste at that placement
covers the previous one exactly, with no ghosting.
