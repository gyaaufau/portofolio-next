import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "@fontsource/press-start-2p/latin.css";
import "./globals.css";
import { PublicChrome } from "@/components/public-chrome";
import { Footer } from "@/components/footer";
import { siteConfig, websiteSchema, personSchema } from "@/data/seo";
import { storageUrl } from "@/lib/storage";

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
    images: [{ url: storageUrl("/data/brand/og-image.webp"), width: 1731, height: 909, alt: "Gialoop portfolio preview image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [storageUrl("/data/brand/og-image.webp")],
  },
  icons: { icon: storageUrl("/data/brand/logo-loop.svg") },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.variable} data-scroll-behavior="smooth">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      </head>
      <body>
        <PublicChrome footer={<Footer />}>{children}</PublicChrome>
      </body>
    </html>
  );
}
