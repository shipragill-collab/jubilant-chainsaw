import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SkinProvider } from "@/components/skin-provider";
import { themeBootScript } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quiz Duel",
  description: "Turn your notes into flashcards and quiz duels, with Raj, your AI tutor.",
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
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body className="min-h-dvh">
        <SkinProvider />
        <SiteHeader />
        <main className="mx-auto max-w-7xl px-4 sm:px-8">{children}</main>
        <footer className="mx-auto mt-10 flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-surface-border px-4 py-8 text-label text-muted-foreground sm:px-8">
          <span>
            <span className="font-display text-body font-bold text-foreground">Quiz Duel</span> · study together, compete for fun.
          </span>
          <span>Made for curious minds.</span>
        </footer>
      </body>
    </html>
  );
}
