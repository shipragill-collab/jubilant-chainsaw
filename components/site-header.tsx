"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { refreshProfiles, useProfile } from "@/lib/use-profile";
import { RajHeaderBuddy } from "./raj-mood-card";
import { SkinSoundToggle } from "./skin-provider";
import { ThemeToggle } from "./theme-toggle";
import { Avatar } from "./avatar";
import { Coins } from "./coin";
import { Gems } from "./gem";
import { buttonClass } from "./ui";

const NAV = [
  { href: "/study", label: "Study" },
  { href: "/11-plus", label: "11+" },
  { href: "/past-papers", label: "Papers" },
  { href: "/goals", label: "Goals" },
  { href: "/tutor", label: "Ask Raj" },
  { href: "/games", label: "Games" },
  { href: "/shop", label: "Shop" },
  { href: "/pricing", label: "Plans" },
];
/** Desktop only: tucked into a "More" menu so the bar fits. */
const NAV_MORE = [
  { href: "/streak", label: "Streak" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/pass", label: "Duel Pass" },
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
        className="w-20 bg-transparent text-body text-foreground outline-none placeholder:text-muted-foreground focus:w-36 transition-[width]"
      />
    </form>
  );
}

function WalletChip() {
  const { profile } = useProfile();
  return (
    <Link
      href="/shop"
      aria-label="Your avatar and coins"
      className="flex items-center gap-2 whitespace-nowrap rounded-full bg-surface py-1 pr-3.5 pl-1 text-body font-semibold shadow-[inset_0_0_0_1px_var(--surface-border)] transition hover:-translate-y-px hover:shadow-[inset_0_0_0_1px_var(--input),var(--shadow-md)]"
    >
      <Avatar equipped={profile?.equipped} size={32} />
      <Coins amount={profile?.coins ?? 0} className="font-medium" />
      <span className="hidden sm:inline">
        <Gems amount={profile?.gems ?? 0} className="font-medium" />
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const path = usePathname();
  // Refresh coins and Raj's mood after moving between pages (a duel, a new set…).
  useEffect(() => {
    refreshProfiles();
  }, [path]);
  const isActive = (href: string) => path === href || path.startsWith(`${href}/`);
  return (
    <header className="site-head sticky top-0 z-40">
      <div className="site-bar mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:h-16 sm:gap-3 sm:px-8">
        <Link href="/" className="mr-auto flex shrink-0 items-center gap-2.5 rounded-md pr-2" aria-label="Quiz Duel home">
          <span aria-hidden className="relative size-8 rounded-full bg-brand">
            <span className="absolute inset-[7px] rounded-full border-2 border-[var(--brand-foreground)] opacity-80" />
          </span>
          <span className="font-display text-[19px] font-bold tracking-[-0.04em] whitespace-nowrap">Quiz Duel</span>
        </Link>
        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="nav-link" aria-current={isActive(n.href) ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
          <details className="nav-more" key={path}>
            <summary className={`nav-link ${NAV_MORE.some((n) => isActive(n.href)) ? "is-active" : ""}`}>More</summary>
            <div className="nav-more-menu">
              {NAV_MORE.map((n) => (
                <Link key={n.href} href={n.href} className="nav-more-link" aria-current={isActive(n.href) ? "page" : undefined}>
                  {n.label}
                </Link>
              ))}
            </div>
          </details>
          <span className="ml-2">
            <HeaderSearch />
          </span>
        </nav>
        <span className="flex shrink-0 items-center gap-1.5 xl:ml-3">
          <span className="hidden sm:contents">
            <ThemeToggle />
            <SkinSoundToggle />
          </span>
          <RajHeaderBuddy />
          <WalletChip />
        </span>
        <span className="hidden shrink-0 whitespace-nowrap xl:block">
          <Link href="/#start" className={buttonClass({ variant: "brand" })}>
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            New duel
          </Link>
        </span>
      </div>
    </header>
  );
}
