"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { LEVEL_HOME, LEVELS, isYoung, saveLevel, useLevel } from "@/lib/tracks";

/** Pages anyone can read before choosing (and links friends share). */
const OPEN = [/^\/privacy/, /^\/terms/, /^\/offline/, /^\/checkout/];

/**
 * The very first screen: "Which stage are you at?" Everything else (prices,
 * pop-ups, what Raj says) follows from the answer. It's a page, not a pop-up,
 * and it only asks once.
 */
export function AgeGate() {
  const level = useLevel();
  const path = usePathname();
  const router = useRouter();
  const first = useRef<HTMLButtonElement>(null);
  const show = level === null && !OPEN.some((r) => r.test(path));

  useEffect(() => {
    if (!show) return;
    first.current?.focus({ preventScroll: true });
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="age-gate" role="region" aria-labelledby="age-gate-title">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="relative size-8 rounded-full bg-brand">
            <span className="absolute inset-[7px] rounded-full border-2 border-[var(--brand-foreground)] opacity-80" />
          </span>
          <span className="font-display text-[19px] font-bold tracking-[-0.04em]">PrepPass</span>
        </div>
        <div className="space-y-2">
          <h1 id="age-gate-title" className="display text-[38px] leading-[1.05] sm:text-[52px]">
            Welcome! Which stage are you at?
          </h1>
          <p className="text-body-lg text-muted-foreground">We&apos;ll set up PrepPass for your age: the right practice, the right prices, and a calmer app for younger children.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {LEVELS.map((l, i) => (
            <button
              key={l.id}
              ref={i === 0 ? first : undefined}
              type="button"
              onClick={() => {
                if (isYoung(l.id)) {
                  try {
                    // Younger children never see the welcome pop-up.
                    localStorage.setItem("quiz-duel:welcomed", String(Date.now()));
                  } catch {
                    /* storage blocked */
                  }
                }
                saveLevel(l.id);
                if (path === "/") router.push(LEVEL_HOME[l.id].href);
              }}
              className="level-card"
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-display text-[30px] leading-none font-bold tracking-[-0.03em]">{l.name}</span>
                <span className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">{l.ages}</span>
              </span>
              <span className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">{l.years}</span>
              <span className="text-body text-muted-foreground">{l.blurb}</span>
            </button>
          ))}
        </div>
        <p className="text-label text-muted-foreground">
          Grown-ups: PrepPass has no ads. For KS2 and 11+ there are no pop-ups, no sales prompts, and players only ever see friends they&apos;ve duelled. We ask children to get a parent before buying anything. You can change the stage any time on the Goals page.
        </p>
      </div>
    </div>
  );
}
