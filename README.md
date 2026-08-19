# Vijaya Enterprises — website

Marketing site for Vijaya Enterprises, a diversified construction and
development company working in Karnataka since 1973.

Built with Next.js 16 (App Router, Turbopack), React 19 and Tailwind CSS v4.
Every page is statically prerendered.

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm start       # serve the production build
npm run lint
```

---

## Before this goes live

Three things in this repository are stand-ins. Everything else is production
ready.

### 1. Contact details — `lib/site.ts`

Phone numbers, the email address and the office address are **placeholders**.
They are all defined in one file (`lib/site.ts`), and every page, the footer
and the structured data read from it. Replace the `contact` and `offices`
blocks and the whole site updates.

Also replace `offices[0].mapHref` with the real Google Maps link.

### 2. Where enquiries go — environment variables

The enquiry form validates and rate-limits on the server, then delivers
through whichever channel is configured. **Until one is set, submissions are
not delivered**: in development they are logged to the server console, and in
production the visitor is told plainly to call instead (the enquiry is also
written to the server log so nothing is lost silently).

Pick one:

```bash
# Option A — post the enquiry as JSON to any endpoint
# (CRM, Zapier/Make, Google Apps Script, Slack workflow…)
CONTACT_WEBHOOK_URL="https://…"

# Option B — email it via Resend (https://resend.com)
RESEND_API_KEY="re_…"
CONTACT_TO_EMAIL="enquiry@vijayaenterprises.in"
CONTACT_FROM_EMAIL="website@vijayaenterprises.in"   # must be a verified sender
```

Also set the canonical origin, which drives `sitemap.xml`, canonical URLs and
Open Graph tags:

```bash
NEXT_PUBLIC_SITE_URL="https://www.vijayaenterprises.in"
```

### 3. Photography — `assets/images/`

The photographs are licensed stock images standing in for the real thing. The
brand brief is explicit — *"use real project photography wherever possible"* —
so these should be replaced with Vijaya's own completed projects and site
photography. Same for the background videos in `public/video/`.

To swap one, drop the new file in `assets/images/` under the same name. If you
add or rename files, update `lib/images.ts` — it is the single place every
photograph and its alt text is declared.

The real logo is in place (`components/layout/logo.tsx`), drawn from
`assets/brand/`. It ships as two lockups — full-colour for light surfaces, and
a reversed one whose wordmark is white for the navy header and footer. To
update the artwork, replace `assets/brand/vijaya-logo-master.png` and re-run
`python3 assets/brand/make-variants.py`; see `assets/brand/README.md`.

---

## How it is put together

```
app/
  layout.tsx              root layout, fonts, metadata, JSON-LD
  page.tsx                home
  residential/            Residential Development
  commercial-contracts/   Private contract construction (all four sectors)
  joint-ventures/         Joint development
  our-legacy/             The company story since 1973
  contact/                Enquiry form + server action
  sitemap.ts robots.ts    generated at build time
  opengraph-image.jpg     social share card
components/
  layout/                 header, footer, logo
  sections/               page-level compositions (heroes, CTA bands, lists)
  ui/                     primitives (Button, Frame, Reveal, Counter, …)
lib/
  site.ts                 brand, navigation, contact details
  images.ts               every photograph + alt text, imported statically
assets/images/            source photography (optimised at build time)
assets/brand/             logo master + the lockups derived from it
public/video/             background video (served directly)
```

### Notes on the decisions that are easy to undo by accident

**Photographs live outside `public/`.** They are imported statically in
`lib/images.ts`, which gives Next the intrinsic dimensions (so no layout
shift), a generated blur placeholder, and AVIF/WebP output at the exact size
each breakpoint asks for. Moving them into `public/` would ship the full-size
originals to visitors as well.

**Background video is poster-first.** The poster is a real `next/image` with
`priority`, so the hero paints immediately and the Largest Contentful Paint
never waits on video. The video file is attached only after mount, and only
when it is a good idea: never under `prefers-reduced-motion`, never on Data
Saver or a 2g-class connection, the 1280px file on phones and the 1920px file
on larger screens, and paused whenever it scrolls out of view or the tab is
hidden. If autoplay is refused, the poster simply stays.

**Animation is CSS plus one IntersectionObserver**, not a motion library.
`Reveal` and `Counter` write to the DOM directly rather than through React
state — revealing is a one-way switch and a count-up changes every frame, so
neither needs a re-render. Only `opacity`, `transform` and `filter` are
animated, so nothing triggers layout. Everything is disabled under
`prefers-reduced-motion`, and a `<noscript>` rule makes all content visible
if scripting is off.

**`scroll-behavior: smooth` needs `data-scroll-behavior="smooth"`** on the
`<html>` element. Next 16 stopped neutralising smooth scrolling during route
changes unless that attribute is present; without it every navigation animates
a long scroll to the top.

### Security

Headers are set in `next.config.ts` and apply to every route: a Content
Security Policy, `X-Frame-Options: DENY`, `nosniff`, a strict
`Referrer-Policy`, a locked-down `Permissions-Policy`, HSTS, and
`Cross-Origin-Opener-Policy`. `X-Powered-By` is disabled.

The CSP keeps `'unsafe-inline'` for scripts because Next inlines its bootstrap
and RSC payload; tightening that to a nonce requires generating one per
request in `proxy.ts`, which opts every page out of static rendering. That is
a poor trade here — there is no user-generated content and no third-party
script on the site. If that changes, switch to the nonce approach then.

The enquiry form has server-side validation, a honeypot field, a
submitted-too-fast check, and a per-IP rate limit (5 per 10 minutes). That
limiter is an in-process `Map`: it stops casual flooding of a single instance,
which is what it is for. Behind several instances or on serverless, add your
CDN or WAF's rate limiting in front of it as well.
