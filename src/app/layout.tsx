import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "@fontsource/press-start-2p/latin.css";
import "./globals.css";
import { PublicChrome } from "@/components/public-chrome";
import { siteConfig, websiteSchema, personSchema } from "@/data/seo";
import { getSiteSettings } from "@/data/db";
import { readableForeground } from "@/lib/theme";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: siteConfig.title,
  description: siteConfig.description,
  authors: [{ name: siteConfig.personName }],
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  openGraph: {
    type: "website",
    url: siteConfig.siteUrl,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.siteName,
    images: [{ url: "/data/brand/og-image.png", width: 1731, height: 909, alt: "Gialoop portfolio preview image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/data/brand/og-image.png"],
  },
  icons: { icon: "/data/brand/logo-loop.svg" },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();
  const themeStyle = {
    "--site-accent": settings.accentColor,
    "--site-accent-foreground": readableForeground(settings.accentColor),
  } as CSSProperties;

  return (
    <html lang="en" className={GeistSans.variable} style={themeStyle} data-scroll-behavior="smooth">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      </head>
      <body>
        <PublicChrome>{children}</PublicChrome>
      </body>
    </html>
  );
}
