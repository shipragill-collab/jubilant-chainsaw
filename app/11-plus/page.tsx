"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ElevenPackCard } from "@/components/eleven-pack";
import { FREE_PAPERS, loadResults, PAPERS_PER_SUBJECT, SUBJECTS_11, weakSpots, type PaperResult } from "@/lib/eleven-plus";
import { useProfile } from "@/lib/use-profile";

function Lock() {
  return (
    <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/** The 11+ hub: practice papers in four subjects, weak spots, and the pack. */
export default function ElevenPlusPage() {
  const { profile } = useProfile();
  const active = Boolean(profile?.elevenActive);
  const [results, setResults] = useState<PaperResult[]>([]);
  const [showAll, setShowAll] = useState<Record<string, boolean>>({});
  const [welcome, setWelcome] = useState(false);

  useEffect(() => {
    setResults(loadResults());
    setWelcome(new URLSearchParams(window.location.search).get("purchased") === "eleven");
  }, []);

  const best = (key: string) => {
    const r = results.filter((x) => x.key === key);
    return r.length ? Math.max(...r.map((x) => Math.round((x.score / x.total) * 100))) : null;
  };
  const weak = weakSpots(results).slice(0, 5);

  return (
    <div className="space-y-10 py-10 sm:py-14">
      <header className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
        <div className="space-y-4">
          <p className="font-mono text-[12px] tracking-[0.14em] text-muted-foreground uppercase">For Years 4–6</p>
          <h1 className="display text-[44px] leading-[1.02] sm:text-[60px]">11+ practice</h1>
          <p className="max-w-[52ch] text-body-lg text-muted-foreground">
            Timed practice papers in maths, English, verbal and non-verbal reasoning, written in the 11+ style. Every answer is explained, and Raj shows you which question types to work on.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/goals" className="chip">Pick target schools</Link>
            <Link href="/past-papers" className="chip">Past papers</Link>
            <Link href="/tutor?ask=How%20does%20the%2011%2B%20work%3F" className="chip">Ask Raj about the 11+</Link>
          </div>
          {welcome && <p role="status" className="rounded-2xl bg-success-soft px-4 py-3 text-body text-success">Welcome to the 11+ Pack! Every paper is now unlocked.</p>}
        </div>
        <ElevenPackCard />
      </header>

      <section aria-labelledby="papers" className="space-y-4">
        <h2 id="papers" className="font-mono text-[12px] font-medium tracking-[0.12em] text-muted-foreground uppercase">Practice papers</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {SUBJECTS_11.map((s) => {
            const shown = showAll[s.id] ? PAPERS_PER_SUBJECT : 10;
            return (
              <article key={s.id} className={`surface subject-card subject-${s.id} space-y-4 p-5`}>
                <div>
                  <h3 className="font-display text-[24px] font-bold tracking-[-0.02em]">{s.name}</h3>
                  <p className="text-body text-muted-foreground">{s.blurb}</p>
                  <p className="mt-1 font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
                    {s.count} questions · {s.minutes} min
                  </p>
                </div>
                <ol className="paper-grid">
                  {Array.from({ length: shown }, (_, i) => i + 1).map((n) => {
                    const locked = n > FREE_PAPERS && !active;
                    const b = best(`11:${s.id}:${n}`);
                    return (
                      <li key={n}>
                        <Link href={locked ? "#pack" : `/11-plus/paper?subject=${s.id}&n=${n}`} className={`paper-chip ${locked ? "is-locked" : ""} ${b !== null ? "is-done" : ""}`} aria-label={`Paper ${n}${locked ? ", needs the 11+ Pack" : ""}${b !== null ? `, best ${b}%` : ""}`}>
                          <span>{n}</span>
                          {locked ? <Lock /> : b !== null ? <small>{b}%</small> : n <= FREE_PAPERS ? <small>Free</small> : null}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
                {!showAll[s.id] && (
                  <button type="button" onClick={() => setShowAll((x) => ({ ...x, [s.id]: true }))} className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase hover:text-foreground">
                    Show all {PAPERS_PER_SUBJECT} papers
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="weak" className="space-y-4">
        <h2 id="weak" className="font-mono text-[12px] font-medium tracking-[0.12em] text-muted-foreground uppercase">Your weak spots</h2>
        <div className={`surface relative overflow-hidden p-5 ${active ? "" : "is-preview"}`}>
          {active ? (
            weak.length ? (
              <ul className="grid gap-3">
                {weak.map((w) => (
                  <li key={w.topic} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1">
                    <span className="font-semibold">{w.topic}</span>
                    <Link href={`/tutor?ask=${encodeURIComponent(`Help me get better at 11+ ${w.topic.toLowerCase()} questions`)}`} className="font-mono text-[11px] tracking-[0.1em] uppercase underline underline-offset-4">
                      Practise
                    </Link>
                    <span className="col-span-2 flex items-center gap-3">
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <span className={`block h-full rounded-full ${w.pct >= 75 ? "bg-success" : w.pct >= 50 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${Math.max(4, w.pct)}%` }} />
                      </span>
                      <span className="w-24 text-right font-mono text-[12px] text-muted-foreground tabular-nums">
                        {w.right}/{w.asked} · {w.pct}%
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-lg text-muted-foreground">Do a paper or two and your weakest question types show up here, so you know exactly what to practise.</p>
            )
          ) : (
            <>
              <ul className="grid gap-3 blur-[3px] select-none" aria-hidden>
                {[["Letter codes", 38], ["Ratio", 52], ["Hidden words", 61], ["Rotation", 70]].map(([t, p]) => (
                  <li key={t} className="grid gap-1">
                    <span className="font-semibold">{t}</span>
                    <span className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <span className="block h-full rounded-full bg-warning" style={{ width: `${p}%` }} />
                    </span>
                  </li>
                ))}
              </ul>
              <div className="absolute inset-0 grid place-items-center bg-[color-mix(in_oklab,var(--surface)_55%,transparent)] p-4 text-center">
                <p className="max-w-[34ch] text-body-lg font-semibold">
                  See exactly which question types to practise.{" "}
                  <a href="#pack" className="underline underline-offset-4">Part of the 11+ Pack</a>
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      <section id="pack" className="grid gap-6 border-t border-surface-border pt-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-3">
          <h2 className="text-[30px] leading-tight">Why the 11+ Pack?</h2>
          <p className="text-body-lg text-muted-foreground">
            Paper 1 in every subject is free, so you can try it first. The pack unlocks {PAPERS_PER_SUBJECT} papers per subject, and the weak-spot report. The track to your target schools is free for everyone. A whole year costs less than two hours with a tutor.
          </p>
          <p className="text-body text-muted-foreground">
            Our papers are written in the style of the 11+. They aren&apos;t real exam papers: the tests differ by area and school, so check what your target schools use on the <Link href="/goals" className="underline underline-offset-4">goals page</Link>.
          </p>
        </div>
        <ElevenPackCard compact />
      </section>
    </div>
  );
}
