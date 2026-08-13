import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content Security Policy.
 *
 * The directives that actually protect a brochure site with no user-generated
 * content are here and are strict: nothing may frame the site, no plugins, no
 * injected <base>, and the enquiry form can only post back to this origin.
 *
 * `script-src` keeps 'unsafe-inline' because Next inlines its bootstrap and
 * RSC payload. Tightening that to a nonce means generating one per request in
 * `proxy.ts`, which opts every page out of static rendering — a real cost for
 * no real gain here, since there is no path by which third-party content
 * reaches the page. If user-generated content is ever added, switch to the
 * nonce approach at that point.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss: http://localhost:* http://127.0.0.1:*" : ""}`,
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "frame-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Belt-and-braces alongside frame-ancestors, for older browsers.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Only takes effect over HTTPS; ignored on localhost.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework.
  poweredByHeader: false,

  images: {
    // Every photograph is a local static import, so no remote patterns are
    // needed — which also means no remote host can be proxied through the
    // optimiser.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Note: /_next/static is deliberately left alone — Next already
        // serves hashed build assets as immutable, and overriding it breaks
        // dev behaviour.
        //
        // Background video files change name when re-encoded, so they can
        // be cached hard and revalidated on rename.
        source: "/video/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
