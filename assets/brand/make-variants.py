"""Regenerate the derived brand assets from vijaya-logo-master.png.

Run from anywhere: `python3 assets/brand/make-variants.py`
(needs `pillow` and `numpy`; nothing in the site build depends on this script —
it only has to be re-run when the master artwork changes).

Two lockup variants are produced because the site puts the logo on both white
and navy: the original full-colour lockup for light surfaces, and a reversed
lockup (white wordmark, untouched Ganesha mark) for navy surfaces, where the
brand's dark-purple wordmark would otherwise be unreadable.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
BRAND = ROOT / "assets" / "brand"
SRC = BRAND / "vijaya-logo-master.png"

# Geometry measured off the master: the mark ends at x=1460, the wordmark
# starts at x=1548, and the three text rows sit at y 628-1187 (VIJAYA),
# 1302-1510 (ENTERPRISES) and 1662-1833 (Since 1973).
TEXT_X = 1500
SECONDARY_Y = 1250

WHITE = (255, 255, 255)
NAVY_200 = (198, 215, 241)  # --color-navy-200, the site's muted-on-navy tone
NAVY_900 = (10, 31, 68)     # --color-navy-900, the brand ground

# 1000px wide covers the largest placement (an 80px-tall footer lockup is
# 176px wide, so ~530px at 3x) with headroom, without carrying a print-sized
# file in the bundle.
LOCKUP_WIDTH = 1000


def load(path):
    return np.asarray(Image.open(path).convert("RGBA")).astype(np.float32) / 255.0


def resize(arr, width):
    """Premultiply → resize → unpremultiply, so edges don't pick up a halo.

    The master stores its anti-aliasing in the alpha channel over white RGB,
    so resizing the channels independently would bleed white into every edge.
    """
    h, w = arr.shape[:2]
    height = round(h * width / w)
    pm = arr.copy()
    pm[..., :3] *= pm[..., 3:4]
    small = np.asarray(
        Image.fromarray((pm * 255 + 0.5).astype("uint8")).resize(
            (width, height), Image.LANCZOS
        )
    ).astype(np.float32) / 255.0
    a = small[..., 3:4]
    rgb = np.divide(small[..., :3], np.maximum(a, 1e-6), where=a > 0)
    return np.concatenate([np.clip(np.where(a > 0, rgb, 0.0), 0, 1), a], axis=-1)


def to_image(arr):
    return Image.fromarray((np.clip(arr, 0, 1) * 255 + 0.5).astype("uint8")).convert(
        "RGBA"
    )


def save(arr, path):
    img = to_image(arr)
    img.save(path, optimize=True)
    print(f"  {Path(path).name}: {img.width}x{img.height}")
    return img


def reverse(arr):
    """Recolour the wordmark for navy backgrounds, leaving the mark alone.

    Recolouring is done by row band rather than by sampling colour: the bands
    are separated by fully transparent gutters, so it stays exact on
    anti-aliased edges, where the RGB has already blended toward white.
    """
    out = arr.copy()
    text = np.zeros(arr.shape[:2], bool)
    text[:, TEXT_X:] = True
    primary = text.copy()
    primary[SECONDARY_Y:, :] = False
    out[primary, :3] = np.array(WHITE) / 255.0
    out[text & ~primary, :3] = np.array(NAVY_200) / 255.0
    return out


def trim(arr):
    rows = np.where(arr[..., 3].max(axis=1) > 0.06)[0]
    cols = np.where(arr[..., 3].max(axis=0) > 0.06)[0]
    return arr[rows[0] : rows[-1] + 1, cols[0] : cols[-1] + 1]


def plate(mark, size, radius, ink_ratio):
    """The mark centred on a navy plate — used for the favicon and app icon.

    Favicons render on light and dark browser chrome alike, so the mark sits on
    the brand navy rather than on transparency, where its darkest blues would
    disappear.
    """
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    if radius:
        ImageDraw.Draw(out).rounded_rectangle(
            (0, 0, size - 1, size - 1), radius=radius, fill=NAVY_900 + (255,)
        )
    else:
        out.paste(NAVY_900 + (255,), (0, 0, size, size))
    ink = round(size * ink_ratio)
    scaled = to_image(resize(mark, round(mark.shape[1] * ink / mark.shape[0])))
    out.alpha_composite(scaled, ((size - scaled.width) // 2, (size - scaled.height) // 2))
    return out


master = load(SRC)
print(f"master: {master.shape[1]}x{master.shape[0]}")

print("lockups:")
save(resize(master, LOCKUP_WIDTH), BRAND / "vijaya-logo.png")
save(resize(reverse(master), LOCKUP_WIDTH), BRAND / "vijaya-logo-reversed.png")

mark = trim(master[:, :TEXT_X])
print(f"mark ink box: {mark.shape[1]}x{mark.shape[0]}")
save(
    resize(mark, round(mark.shape[1] * 448 / mark.shape[0])), BRAND / "vijaya-mark.png"
)

print("icons:")
# Radius matches the 25% corner the previous placeholder icon used.
icon = plate(mark, 512, 128, 0.62)
icon.save(ROOT / "app" / "icon.png", optimize=True)
print(f"  app/icon.png: {icon.width}x{icon.height}")
# iOS applies its own mask and dislikes transparency, so this one is full-bleed.
apple = plate(mark, 180, 0, 0.6)
apple.convert("RGB").save(ROOT / "app" / "apple-icon.png", optimize=True)
print(f"  app/apple-icon.png: {apple.width}x{apple.height}")
