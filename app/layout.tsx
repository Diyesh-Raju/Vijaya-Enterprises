import type { Metadata, Viewport } from "next";
import {
  Manrope,
  Cinzel,
  Playfair_Display,
  Noto_Sans_Kannada,
} from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SamePageLinks } from "@/components/layout/same-page-links";
import { SiteBookingPrompt } from "@/components/ui/site-booking-prompt";
import { MobileActionBar } from "@/components/ui/mobile-action-bar";
import { LanguageGate } from "@/components/layout/language-gate";
import { site, contact } from "@/lib/site";
import "./globals.css";

// The face the site is set in. Headings and body are both set in it; the
// variable weight range is what separates them.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  // Keep the fallback metrics close so the swap does not shift layout.
  adjustFontFallback: true,
});

// The one exception, and it is deliberately a narrow one: the heading over
// "Who we build for" on /our-legacy, which the client asked to be set the way
// a reference page sets its own (2026-09-12). Cinzel is an inscriptional
// Roman face — it has no true lowercase, so its minuscules are drawn as small
// capitals, which is where that heading's cut-in-stone look comes from.
//
// It is loaded for a handful of headings, so keep it to a handful: it is
// another font file on every page that uses it, and a second voice in a site
// that otherwise has exactly one. Reach for `font-display` — Manrope —
// everywhere else.
//
// One weight. It was two from 2026-09-14, when the roles under the
// management portraits were set in this face at 700, until 2026-09-16, when
// they moved to Manrope; nothing sets Cinzel bold now, so the second file
// went with them. If something asks for it again, load it here rather than
// writing `font-bold`: Cinzel is a static face, so asking for 700 with only
// 500 loaded does not select a heavier cut — it has the browser smear the
// one it has, thickening the strokes and closing the counters at exactly the
// sizes this face is used at.
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
  weight: ["500"],
});

// The third face, and like Cinzel a narrow exception made for a reference
// page the client brought (2026-09-16): the closing of /joint-ventures sets
// the second half of its heading in an italic Didone, the way that page sets
// its own. Neither face already here can do it — Manrope is a grotesk, and
// Cinzel is an inscriptional Roman with no italic cut, so asking it to slant
// would have the browser shear the upright, which is the same smear the note
// above is about. One weight, one style, one file, reached through
// `font-serif-italic` and set nowhere else.
//
// `preload: false`, like Kannada below: nothing links a preload, so the file
// is fetched only by a page that actually sets a glyph in it, and every other
// page pays nothing for it. On the one page that does, the heading is the
// last thing on it, and the fetch is long finished by the time it is read.
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
  style: ["italic"],
  preload: false,
});

// The fourth face, and the only one an English reader never loads: Kannada,
// for the translation (see `lib/language.ts`). Manrope has no Kannada glyphs
// at all, so without this the translated site falls back to whatever the
// device happens to ship — which on Android is Noto, on iOS a face drawn for
// a different weight of page, and on a Windows desktop often nothing at all.
//
// `preload: false` is the point of it. The @font-face still ships in the
// stylesheet on every page, but nothing links a preload and no browser
// fetches the file until a Kannada glyph is actually on screen — so a reader
// who stays in English pays nothing for it. Only the `kannada` subset is
// asked for: the Latin in a translated page is still set in Manrope.
const notoKannada = Noto_Sans_Kannada({
  variable: "--font-kannada",
  subsets: ["kannada"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "construction company Bengaluru",
    "builders Karnataka",
    "residential developers Bengaluru",
    "commercial construction",
    "industrial construction",
    "institutional construction",
    "joint venture developers",
    "Vijaya Enterprises",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: true, address: true, email: true },
};

export const viewport: Viewport = {
  themeColor: "#0a1f44",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Organization schema — helps search engines read the 50-year proof. */
function OrganizationJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    name: site.name,
    description: site.description,
    url: site.url,
    // The mark on its own, which is what a knowledge panel shows.
    logo: new URL("/icon.png", site.url).toString(),
    foundingDate: String(site.founded),
    slogan: site.tagline,
    telephone: contact.phoneDisplay,
    email: contact.emailDisplay,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
    areaServed: { "@type": "State", name: "Karnataka" },
    knowsAbout: [
      "Residential development",
      "Commercial construction",
      "Industrial construction",
      "Institutional construction",
      "Private contract construction",
      "Joint development",
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Values are our own constants, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      // Next 16 no longer neutralises `scroll-behavior: smooth` during route
      // changes unless this attribute is present — without it every navigation
      // would animate a long scroll to the top.
      data-scroll-behavior="smooth"
      // The inline script below writes `data-lang-state` — and, for a
      // Kannada reader, `data-lang` and `lang` — onto this element while the
      // document is still parsing, which is a page's worth of attributes
      // React did not render and would otherwise report as a hydration
      // mismatch on every phone load. Suppression reaches this element's own
      // attributes and no further, which is exactly the span in question.
      suppressHydrationWarning
      className={`${manrope.variable} ${cinzel.variable} ${playfair.variable} ${notoKannada.variable}`}
    >
      <head>
        {/* Which language this visitor reads the site in, settled before
            the first pixel.

            It has to run here, blocking, rather than in a component: the
            stored choice lives in `sessionStorage`, the server cannot see
            it, and anything that waited for React would paint the English
            page to a reader who asked for Kannada and then swap it under
            them.

            `sessionStorage`, so the chooser comes back with every new tab —
            the long version is on `STORAGE_KEY` in `lib/language.ts`, and
            the key and the storage are spelled out by hand here because
            this runs before any import does. Change one, change both.
            What this writes is one attribute; `globals.css` does the rest,
            and `LanguageGate` picks the state up when it mounts.

            Every branch ends in an attribute, including the failure ones —
            with no attribute at all (scripting off, storage throwing) the
            site simply renders in English, which is what it is written in.
            See `lib/language.ts` for what the three states mean. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){var r=document.documentElement;try{' +
              'var v=sessionStorage.getItem("ve-language");' +
              'if(v==="kn"){r.setAttribute("data-lang","kn");' +
              'r.setAttribute("data-lang-state","veil");' +
              // The dead man's handle. A dictionary that never arrives must
              // cost a pause and not the page.
              'setTimeout(function(){if(r.getAttribute("data-lang-state")==="veil")' +
              'r.setAttribute("data-lang-state","ready")},2500)}' +
              'else{r.setAttribute("data-lang-state",v==="en"?"ready":"gate")}' +
              '}catch(e){r.setAttribute("data-lang-state","ready")}})()',
          }}
        />

        {/* Scroll reveals start hidden and are switched on by an observer.
            With scripting off that would hide real content, so neutralise
            the animation entirely in that case. */}
        {/* Written as raw HTML so React treats it as opaque: React 19 hoists
            and dedupes real <style> elements, which would lift this rule out
            of the <noscript> and apply it always. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              "<style>.reveal{opacity:1!important;transform:none!important;filter:none!important}" +
              ".img-reveal>img{transform:none!important}.img-reveal::after{display:none!important}</style>",
          }}
        />
      </head>
      <body className="min-h-dvh bg-white">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-navy-900 focus:px-6 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        {/* Before the site: which language? Renders nothing at all once
            that is answered. */}
        <LanguageGate />
        <SiteHeader />
        {/* The logo, Home, and any other link to the page you are on: back
            to the top of it rather than nothing at all. */}
        <SamePageLinks />
        <main id="main" className="min-h-dvh">
          {children}
        </main>
        <SiteFooter />
        {/* The site-visit speech bubble. Mounted once, here; it decides for
            itself which pages it speaks on — see the component. */}
        <SiteBookingPrompt />
        {/* The phone's call/WhatsApp bar, on every page. It owns the bottom
            edge and the bubble above clears it — see `--action-bar-h`. */}
        <MobileActionBar />
        <OrganizationJsonLd />
      </body>
    </html>
  );
}
