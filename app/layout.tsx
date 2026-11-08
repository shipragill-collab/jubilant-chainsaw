import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quiz Duel",
  description: "Turn your notes into flashcards and quiz duels, with Raj, your AI tutor.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body className="min-h-dvh">
        <SiteHeader />
        <main className="mx-auto max-w-7xl px-4 sm:px-8">{children}</main>
        <footer className="mx-auto max-w-7xl border-t border-surface-border px-4 py-8 text-label text-muted-foreground sm:px-8">
          Quiz Duel: study together, compete for fun.
        </footer>
      </body>
    </html>
  );
}
