"""Regenerate the derived brand assets from vijaya-logo-master.png.

Run from anywhere: `python3 assets/brand/make-variants.py`
(needs `pillow` and `numpy`; nothing in the site build depends on this script —
it only has to be re-run when the master artwork changes).

Two lockup variants are produced because the site puts the logo on both white
and navy: the original full-colour lockup for light surfaces, and a reversed
lockup for navy surfaces, where the brand's dark-purple wordmark would
otherwise be unreadable and the Ganesha mark's darker half would sink into the
ground. The reversed lockup fixes both — see `reverse` and `for_dark`.
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

# The mark for navy grounds: its blues are relit into this lightness band, and
# no blue is allowed past MARK_HUE_CAP. Measured off the master, roughly half
# the mark's blues sit at L 0.23-0.37 — darker than they look on white, and
# close enough to navy-900 (L 0.15) that on navy the head, the ear insides and
# the shaded side of the trunk all read as ground rather than as artwork. The
# cap keeps the deepest indigos from turning periwinkle once they are lifted.
MARK_DARK_L = (0.46, 0.84)
MARK_DARK_GAMMA = 0.9
MARK_HUE_CAP = 215

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


def to_hsl(rgb):
    high = rgb.max(-1)
    low = rgb.min(-1)
    span = high - low
    lightness = (high + low) / 2
    denom = np.where(lightness < 0.5, high + low, 2 - high - low)
    sat = np.where(span == 0, 0.0, span / np.maximum(denom, 1e-9))
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    safe = np.maximum(span, 1e-9)
    hue = np.where(
        high == low,
        0.0,
        np.where(
            high == r,
            (g - b) / safe % 6,
            np.where(high == g, (b - r) / safe + 2, (r - g) / safe + 4),
        )
        * 60,
    )
    return hue, sat, lightness


def to_rgb(hue, sat, lightness):
    chroma = (1 - np.abs(2 * lightness - 1)) * sat
    second = chroma * (1 - np.abs((hue / 60) % 2 - 1))
    base = lightness - chroma / 2
    zero = np.zeros_like(hue)
    sextant = (hue / 60).astype(int) % 6
    picks = [sextant == i for i in range(6)]
    r = np.select(picks, [chroma, second, zero, zero, second, chroma])
    g = np.select(picks, [second, chroma, chroma, second, zero, zero])
    b = np.select(picks, [zero, zero, second, chroma, chroma, second])
    return np.clip(np.stack([r + base, g + base, b + base], -1), 0, 1)


def for_dark(arr):
    """Relight the Ganesha mark's blues so it holds its colour on navy.

    The mark is a blue gradient drawn for white paper: its light-blue passages
    and its near-navy ones both read on white, but on the site's navy the dark
    half has nowhere to go and the silhouette collapses. Every blue pixel is
    re-lit into MARK_DARK_L, keeping its place in the gradient (so the artwork
    still reads as one shaded form rather than a flat fill) and keeping its
    hue below MARK_HUE_CAP.

    Only blues are touched: the saffron and red flowers, and the white
    line-work's anti-aliased edges, are left as drawn.
    """
    out = arr.copy()
    rgb = arr[..., :3]
    hue, sat, lightness = to_hsl(rgb)
    blue = (arr[..., 3] > 0.02) & (hue >= 180) & (hue <= 265) & (sat > 0.12)
    if not blue.any():
        return out

    # The band is measured over opaque blues only — anti-aliased edges carry
    # blended lightness that would stretch the range and flatten the lift.
    solid = blue & (arr[..., 3] > 0.9)
    low, high = lightness[solid].min(), lightness[solid].max()
    place = np.clip((lightness - low) / (high - low), 0, 1) ** MARK_DARK_GAMMA
    floor, ceiling = MARK_DARK_L
    relit = to_rgb(
        np.minimum(hue, MARK_HUE_CAP), sat, floor + (ceiling - floor) * place
    )
    out[..., :3] = np.where(blue[..., None], relit, rgb)
    return out


def reverse(arr):
    """Recolour the lockup for navy backgrounds: wordmark and mark alike.

    The wordmark is recoloured by row band rather than by sampling colour: the
    bands are separated by fully transparent gutters, so it stays exact on
    anti-aliased edges, where the RGB has already blended toward white. The
    mark keeps its artwork and is relit by `for_dark`.
    """
    out = arr.copy()
    out[:, :TEXT_X] = for_dark(arr[:, :TEXT_X])
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
    the brand navy rather than on transparency. It is the `for_dark` mark, for
    the same reason the reversed lockup uses one: the plate is navy, and the
    artwork as drawn would lose half of itself into it at 16px.
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
mark_on_dark = trim(for_dark(master[:, :TEXT_X]))
# Radius matches the 25% corner the previous placeholder icon used.
icon = plate(mark_on_dark, 512, 128, 0.62)
icon.save(ROOT / "app" / "icon.png", optimize=True)
print(f"  app/icon.png: {icon.width}x{icon.height}")
# iOS applies its own mask and dislikes transparency, so this one is full-bleed.
apple = plate(mark_on_dark, 180, 0, 0.6)
apple.convert("RGB").save(ROOT / "app" / "apple-icon.png", optimize=True)
print(f"  app/apple-icon.png: {apple.width}x{apple.height}")
