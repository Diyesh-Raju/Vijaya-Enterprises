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
| `vijaya-logo-reversed.png` | `components/layout/logo.tsx` | same lockup with a white wordmark — for navy surfaces |
| `vijaya-mark.png` | `make-variants.py` | the Ganesha mark on its own, trimmed |
| `app/icon.png`, `app/apple-icon.png` | Next.js metadata | the mark on a navy plate |

## Why there are two lockups

The wordmark is dark purple (`#2f2483`) with grey supporting type
(`#575756`). That reads well on white, and disappears on the navy the header
and footer use. The reversed variant recolours the wordmark to white with
`--color-navy-200` supporting type, and leaves the mark untouched — its light
blues and white line-work hold up on navy on their own.

The script recolours by row band (the wordmark's three lines sit in bands the
master separates with fully transparent gutters) rather than by matching
colour, because anti-aliased edges have already blended toward white and would
be misclassified.

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
