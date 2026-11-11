import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ServiceWorker } from "@/components/service-worker";
import { SITE, siteUrl } from "@/lib/site";
import { SiteHeader } from "@/components/site-header";
import { MotionRoot } from "@/components/reveal";
import { SkinProvider } from "@/components/skin-provider";
import { themeBootScript } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${SITE.name}: ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  appleWebApp: { capable: true, title: SITE.name, statusBarStyle: "default" },
  openGraph: { type: "website", siteName: SITE.name, title: `${SITE.name}: ${SITE.tagline}`, description: SITE.description, locale: "en_GB" },
  twitter: { card: "summary_large_image", title: `${SITE.name}: ${SITE.tagline}`, description: SITE.description },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#14111b" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=TASA+Orbiter:wght@400..800&family=Geist+Mono:wght@400..600&family=Space+Grotesk:wght@500;700&display=swap"
        />
      </head>
      <body className="min-h-dvh">
        <MotionRoot>
        <SkinProvider />
        <SiteHeader />
        <main className="mx-auto max-w-7xl px-4 sm:px-8">{children}</main>
        <footer className="mx-auto mt-10 flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-surface-border px-4 py-8 text-label text-muted-foreground sm:px-8">
          <span>
            <span className="font-display text-body font-bold text-foreground">Quiz Duel</span> · study together, compete for fun.
          </span>
          <nav aria-label="Legal" className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <span>Made for curious minds.</span>
          </nav>
        </footer>
        </MotionRoot>
        <ServiceWorker />
      </body>
    </html>
  );
}
