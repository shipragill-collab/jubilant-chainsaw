"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { buttonClass } from "./ui";

const NAV = [
  { href: "/study", label: "Study" },
  { href: "/tutor", label: "Ask Raj" },
  { href: "/leaderboard", label: "Leaderboard" },
];

function SearchIcon({ className = "size-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

/** Quiet inline search, like a nav item: icon + placeholder, no box. */
function HeaderSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      }}
      className="flex items-center gap-2 text-muted-foreground focus-within:text-foreground"
    >
      <SearchIcon />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search"
        aria-label="Search subjects and study sets"
        className="w-28 bg-transparent text-body-lg text-foreground outline-none placeholder:text-muted-foreground focus:w-44 transition-[width]"
      />
    </form>
  );
}

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
          <HeaderSearch />
        </nav>
        <Link href="/search" aria-label="Search" className="grid size-10 place-items-center rounded-full text-muted-foreground hover:text-foreground md:hidden">
          <SearchIcon className="size-5" />
        </Link>
        <Link href="/#start" className={`${buttonClass({ variant: "primary" })} md:ml-6`}>
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
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
