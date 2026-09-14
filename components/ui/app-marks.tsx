/**
 * The three app marks used on the contact cards.
 *
 * They are drawn here rather than fetched, for two reasons. Brand marks are
 * the one kind of artwork that must not be redrawn loosely — a WhatsApp glyph
 * that is nearly right reads as a counterfeit — so the paths are the published
 * ones and the colours are the published hex values, kept together in one file
 * where they can be checked against the brand pages rather than scattered
 * through a page component. And at this size a request each would cost three
 * round trips to draw 44px of artwork.
 *
 * Each is a whole app icon, tile included, not a glyph on a tile the caller
 * supplies: the point of putting them on the cards is that they are recognised
 * at a glance, and half of what is recognised about the Gmail and WhatsApp
 * icons is the shape and colour of the tile under the glyph.
 *
 * `title` is what a screen reader gets. They are decorative beside a label
 * that already says "WhatsApp" in words, so every caller passes `aria-hidden`
 * — but the prop is there rather than assumed, because the day one of these
 * stands alone it will need it.
 */

const TILE_RADIUS = 11;

/**
 * The dialer. Unlike the two below it this is not one company's mark — every
 * platform draws its own — so it is the shape the platforms agree on: a green
 * tile and a white handset. Green, and beside WhatsApp's green, because that
 * is what both apps actually are; the handset tells them apart, which is the
 * same thing that tells them apart on a phone's home screen.
 */
export function PhoneAppMark({
  className,
  title,
  ...rest
}: { className?: string; title?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" {...rest}>
      {title ? <title>{title}</title> : null}
      <rect width="48" height="48" rx={TILE_RADIUS} fill="#1FA855" />
      <path
        d="M32.9 28.2c-1-.5-2.3-1.1-3.2-1.5-.7-.3-1.3-.2-1.8.4l-1.2 1.5c-.3.4-.8.5-1.2.3a17.6 17.6 0 0 1-7.4-7.4c-.2-.4-.1-.9.3-1.2l1.5-1.2c.6-.5.7-1.1.4-1.8-.4-.9-1-2.2-1.5-3.2-.4-.9-1.2-1.3-2.1-1.1-1.3.3-2.7 1-3.4 2.1-.8 1.3-.8 3 0 5.3 1 2.8 3 6 5.8 8.8s6 4.8 8.8 5.8c2.3.8 4 .8 5.3 0 1.1-.7 1.8-2.1 2.1-3.4.2-.9-.2-1.7-1.1-2.1z"
        fill="#ffffff"
      />
    </svg>
  );
}

/** WhatsApp: the published glyph on the published green (#25D366). */
export function WhatsAppMark({
  className,
  title,
  ...rest
}: { className?: string; title?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" {...rest}>
      {title ? <title>{title}</title> : null}
      <rect width="48" height="48" rx={TILE_RADIUS} fill="#25D366" />
      <path
        d="M24.1 9.6c-7.9 0-14.3 6.4-14.3 14.3 0 2.5.7 5 1.9 7.1L9.5 38.4l7.6-2c2.1 1.1 4.5 1.7 6.9 1.7h.1c7.9 0 14.3-6.4 14.3-14.3 0-3.8-1.5-7.4-4.2-10.1a14.2 14.2 0 0 0-10.1-4.1zm0 26.1c-2.2 0-4.3-.6-6.2-1.7l-.4-.3-4.5 1.2 1.2-4.4-.3-.5a11.9 11.9 0 0 1-1.8-6.3c0-6.6 5.4-11.9 11.9-11.9 3.2 0 6.2 1.2 8.4 3.5a11.8 11.8 0 0 1 3.5 8.4c0 6.6-5.3 11.9-11.8 11.9z"
        fill="#ffffff"
      />
      <path
        d="M30.6 26.8c-.4-.2-2.1-1-2.4-1.2-.3-.1-.6-.2-.8.2-.2.4-.9 1.2-1.1 1.4-.2.2-.4.3-.8.1-.4-.2-1.5-.6-2.9-1.8-1.1-1-1.8-2.1-2-2.5-.2-.4 0-.6.2-.8l.6-.7c.2-.2.2-.4.4-.6.1-.2 0-.5 0-.7-.1-.2-.8-1.9-1.1-2.6-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-1 .5-.3.4-1.2 1.2-1.2 3s1.3 3.4 1.4 3.7c.2.2 2.5 3.8 6.1 5.4.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 2.1-.9 2.4-1.7.3-.8.3-1.5.2-1.7-.1-.1-.3-.2-.7-.4z"
        fill="#ffffff"
      />
    </svg>
  );
}

/**
 * Gmail: the envelope on a white tile, which is how the app icon is drawn.
 *
 * Five pieces, and the order matters — the two flaps are painted before the M
 * so the M sits on top of them, which is what gives the fold its edge. The
 * hex values are Google's: #4285F4, #34A853, #FBBC04, #EA4335 and #C5221F.
 */
export function GmailMark({
  className,
  title,
  ...rest
}: { className?: string; title?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" {...rest}>
      {title ? <title>{title}</title> : null}
      <rect width="48" height="48" rx={TILE_RADIUS} fill="#ffffff" />
      <g transform="translate(6 12)">
        <path d="M2.5 24h5.6V10.4L0 4.2v17.3C0 22.9 1.1 24 2.5 24z" fill="#4285F4" />
        <path
          d="M27.9 24h5.6c1.4 0 2.5-1.1 2.5-2.5V4.2l-8.1 6.2V24z"
          fill="#34A853"
        />
        <path
          d="M27.9 2.5v7.9L36 4.2V3.7c0-3.1-3.5-4.9-6-3.4l-2.1 2.2z"
          fill="#FBBC04"
        />
        <path d="M8.1 10.4V2.5L18 9.9l9.9-7.4v7.9L18 17.8z" fill="#EA4335" />
        <path d="M0 3.7v.5l8.1 6.2V2.5L6 .3C3.5-1.2 0 .6 0 3.7z" fill="#C5221F" />
      </g>
      {/* The tile is white on a near-white ground, so it needs its own edge
          or it dissolves into the card. Inside the shape rather than around
          it: a stroke on the rect straddles the edge and reads as a half-pixel
          halo at this size. */}
      <rect
        x="0.5"
        y="0.5"
        width="47"
        height="47"
        rx={TILE_RADIUS - 0.5}
        fill="none"
        stroke="rgb(0 0 0 / 0.10)"
      />
    </svg>
  );
}
