"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";

const I = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" className="size-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {d}
  </svg>
);

const ICONS = {
  study: I(<><rect x="4" y="6" width="13" height="14" rx="2" /><path d="M8 3h11a1 1 0 0 1 1 1v13" /></>),
  raj: I(<><rect x="5" y="6" width="14" height="13" rx="3" /><path d="M12 6V3M9.5 12h.01M14.5 12h.01M9.5 15.5c1.4 1 3.6 1 5 0" /></>),
  shop: I(<><path d="M5 8h14l-1.2 11a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></>),
  more: I(<><circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /></>),
};

const MORE = [
  { href: "/", label: "Home", note: "Start here" },
  { href: "/streak", label: "Streak", note: "Your daily habit" },
  { href: "/leaderboard", label: "Leaderboard", note: "Who's winning" },
  { href: "/pass", label: "Duel Pass", note: "Season rewards" },
  { href: "/pricing", label: "Plans", note: "Pro and Ultimate" },
  { href: "/search", label: "Search", note: "Find a set" },
];

/**
 * Phones get an app-style bar at the bottom, in thumb reach: Study, Raj, a
 * big New duel button in the middle, Shop, and More (Home and everything
 * else; the logo also goes home).
 */
export function TabBar() {
  const path = usePathname();
  const sheet = useRef<HTMLDialogElement>(null);
  const active = (href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`));
  const inMore = MORE.some((m) => active(m.href));

  useEffect(() => {
    sheet.current?.close();
  }, [path]);

  const tab = (href: string, label: string, icon: ReactNode) => (
    <Link href={href} className="tab" aria-current={active(href) ? "page" : undefined}>
      {icon}
      <span>{label}</span>
    </Link>
  );

  return (
    <>
      <nav className="tab-bar" aria-label="Main">
        {tab("/study", "Study", ICONS.study)}
        {tab("/tutor", "Raj", ICONS.raj)}
        <Link href="/#start" className="tab-duel" aria-label="New duel">
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Link>
        {tab("/shop", "Shop", ICONS.shop)}
        <button type="button" className="tab" aria-current={inMore ? "page" : undefined} aria-haspopup="dialog" onClick={() => sheet.current?.showModal()}>
          {ICONS.more}
          <span>More</span>
        </button>
      </nav>

      <dialog ref={sheet} className="more-sheet" aria-label="More pages" onClick={(e) => e.target === sheet.current && sheet.current?.close()}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--input)]" aria-hidden />
        <ul className="grid grid-cols-2 gap-2">
          {MORE.map((m) => (
            <li key={m.href}>
              <Link href={m.href} className="more-link" aria-current={active(m.href) ? "page" : undefined}>
                <span className="font-semibold">{m.label}</span>
                <span className="text-label text-muted-foreground">{m.note}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-surface-border pt-3">
          <span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">Theme</span>
          <ThemeToggle />
        </div>
      </dialog>
    </>
  );
}
