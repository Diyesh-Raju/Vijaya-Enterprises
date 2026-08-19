import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { site, contact } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  // Keep the fallback metrics close so the swap does not shift layout.
  adjustFontFallback: true,
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
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
      className={`${fraunces.variable} ${manrope.variable}`}
    >
      <head>
        {/* Scroll reveals start hidden and are switched on by an observer.
            With scripting off that would hide real content, so neutralise
            the animation entirely in that case. */}
        {/* Written as raw HTML so React treats it as opaque: React 19 hoists
            and dedupes real <style> elements, which would lift this rule out
            of the <noscript> and apply it always. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              "<style>.reveal{opacity:1!important;transform:none!important;filter:none!important}</style>",
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
        <SiteHeader />
        <main id="main" className="min-h-dvh">
          {children}
        </main>
        <SiteFooter />
        <OrganizationJsonLd />
      </body>
    </html>
  );
}
