import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource/anton/latin-400.css";
import "@fontsource/caveat/latin-500.css";
import { MotionSettings } from "@/components/layout/motion-settings";
import { SITE, SOCIALS } from "@/constants/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  keywords: [
    "Divyesh Kolli",
    "Full Stack Developer",
    "Site reliability engineering",
    "Platform engineering",
    "Cloud Computing",
    "SRM Institute of Science and Technology",
    "Next.js",
    "React",
    "TypeScript",
    "Portfolio",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    creator: "@_divyesh8",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#090909" },
    { media: "(prefers-color-scheme: light)", color: "#F5F3EF" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

/** Person + WebSite structured data, so search engines read the page as a
 *  profile rather than a generic document. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.name,
  url: SITE.url,
  email: `mailto:${SITE.email}`,
  jobTitle: SITE.role,
  description: SITE.description,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Chennai",
    addressRegion: "Tamil Nadu",
    addressCountry: "IN",
  },
  affiliation: {
    "@type": "CollegeOrUniversity",
    name: SITE.university,
  },
  knowsAbout: [
    "Cloud Computing",
    "Backend engineering",
    "Full Stack Development",
    "Next.js",
    "React",
    "Node.js",
  ],
  sameAs: [SOCIALS.github, SOCIALS.linkedin, SOCIALS.x].filter(Boolean),
};

/** Set the theme before first paint so there is never a flash. */
const themeScript = `
(function(){
  document.documentElement.dataset.theme = 'dark';
  document.documentElement.dataset.motion = 'on';
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <noscript>
          <style>{`.folio-hero [style]{opacity:1!important;clip-path:none!important;transform:none!important}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-[var(--button)] focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-[var(--button-fg)]"
        >
          Skip to content
        </a>
        <MotionSettings>{children}</MotionSettings>
      </body>
    </html>
  );
}
