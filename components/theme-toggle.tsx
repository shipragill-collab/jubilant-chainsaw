"use client";

import { useEffect, useState } from "react";
import { THEME_KEY as KEY } from "@/lib/theme";

type Theme = "system" | "light" | "dark";
const ORDER: Theme[] = ["dark", "light", "system"];
const LABEL: Record<Theme, string> = { system: "Theme: match device", light: "Theme: light", dark: "Theme: dark" };

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* private mode */
  }
}

/** Cycles Dark → Light → Match device. Dark is the default. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    try {
      const t = localStorage.getItem(KEY);
      if (t === "light" || t === "system") setTheme(t);
    } catch {
      /* ignore */
    }
  }, []);
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
  return (
    <button
      type="button"
      onClick={() => {
        apply(next);
        setTheme(next);
      }}
      aria-label={`${LABEL[theme]}. Switch to ${next === "system" ? "match device" : next}`}
      title={LABEL[theme]}
      className={`grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:-translate-y-px hover:bg-surface-hover hover:text-foreground ${className}`}
    >
      <svg viewBox="0 0 24 24" className="size-[19px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {theme === "light" ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : theme === "dark" ? (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        ) : (
          <>
            <rect x="3" y="4" width="18" height="12" rx="2" />
            <path d="M8 20h8M12 16v4" />
          </>
        )}
      </svg>
    </button>
  );
}
