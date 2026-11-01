"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClass } from "./ui";

const NAV = [
  { href: "/study", label: "Study" },
  { href: "/tutor", label: "Ask Raj" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function SiteHeader() {
  const path = usePathname();
  return (
    <header className="border-b border-surface-border">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:h-24 sm:px-8">
        <Link href="/" className="mr-auto flex items-center gap-3" aria-label="Quiz Duel home">
          <span aria-hidden className="size-9 rounded-full bg-brand sm:size-11" />
          <span className="text-[22px] tracking-tight sm:text-[26px]">Quiz Duel</span>
        </Link>
        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((n) => {
            const active = path === n.href || path.startsWith(`${n.href}/`);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`text-body-lg transition hover:text-foreground ${active ? "text-foreground" : "text-muted-foreground"}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/#start" className={`${buttonClass({ variant: "primary" })} md:ml-6`}>
          New duel
        </Link>
      </div>
      <nav className="flex gap-6 overflow-x-auto px-4 pb-3 md:hidden">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`shrink-0 text-body ${path.startsWith(n.href) ? "text-foreground" : "text-muted-foreground"}`}
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
