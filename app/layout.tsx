import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quiz Duel",
  description: "Paste your notes, get 10 questions, and challenge a friend.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <header className="border-b border-surface-border">
          <nav className="mx-auto flex h-12 max-w-3xl items-center gap-1 px-4">
            <Link href="/" className="mr-auto flex items-center gap-2 text-body font-semibold">
              <span className="grid size-6 place-items-center rounded-md bg-brand text-micro font-bold text-brand-foreground">
                QD
              </span>
              Quiz Duel
            </Link>
            <Link href="/" className="rounded-md px-2.5 py-1 text-label text-muted-foreground hover:bg-surface-hover hover:text-foreground">
              New duel
            </Link>
            <Link
              href="/leaderboard"
              className="rounded-md px-2.5 py-1 text-label text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            >
              Leaderboard
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">{children}</main>
      </body>
    </html>
  );
}
