"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { paletteFor } from "@/components/gallery";
import { Section, inputClass } from "@/components/ui";
import { api, getPlayerId } from "@/lib/player";
import { SAMPLES } from "@/lib/samples";
import { timeAgo } from "@/lib/time";
import type { StudySetSummary } from "@/lib/types";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [sets, setSets] = useState<StudySetSummary[]>([]);

  useEffect(() => {
    setQ(new URLSearchParams(window.location.search).get("q") ?? "");
    api<{ sets: StudySetSummary[] }>(`/api/study?playerId=${getPlayerId()}`)
      .then((r) => setSets(r.sets))
      .catch(() => undefined);
  }, []);

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const match = (text: string) => words.every((w) => text.toLowerCase().includes(w));
    const mine = sets
      .filter((s) => match(`${s.title} ${s.preview.map((c) => `${c.front} ${c.back}`).join(" ")}`))
      .map((s) => ({
        key: s.id,
        group: "Your sets" as const,
        href: `/study/${s.id}`,
        title: s.title,
        meta: timeAgo(s.createdAt),
        kicker: `${s.cardCount} flashcards`,
        lines: s.preview.map((c) => c.front),
      }));
    const samples = SAMPLES.filter((s) => match(`${s.subject} ${s.title} ${s.material}`)).map((s) => ({
      key: s.slug,
      group: "Sample subjects" as const,
      href: `/study?sample=${s.slug}`,
      title: s.title,
      meta: `${s.subject} sample`,
      kicker: s.subject,
      lines: s.material.split("\n").filter((l) => l.trim() && !l.startsWith("#")).slice(0, 2),
    }));
    return [...mine, ...samples];
  }, [q, sets]);

  return (
    <Section
      title="Search"
      intro="Find your study sets and sample subjects."
      aside={
        <input
          value={q}
          autoFocus
          onChange={(e) => {
            setQ(e.target.value);
            history.replaceState(null, "", `/search?q=${encodeURIComponent(e.target.value)}`);
          }}
          type="search"
          enterKeyHint="search"
          placeholder="Try “photosynthesis” or “History”"
          aria-label="Search"
          className={`${inputClass} mt-4 h-12`}
        />
      }
    >
      {results.length === 0 ? (
        <p className="text-title text-muted-foreground">Nothing matches “{q}”.</p>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10">
          {(["Your sets", "Sample subjects"] as const).map((g) => {
            const rows = results.filter((r) => r.group === g);
            if (!rows.length) return null;
            return (
              <section key={g} aria-label={g} className="min-w-0">
                <h2 className="mb-2 flex items-baseline gap-2 font-mono text-[12px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                  {g} <span className="text-faint-foreground">{rows.length}</span>
                </h2>
                <ul className="divide-y divide-[var(--surface-border)] border-y border-surface-border">
                  {rows.map((r) => (
                    <li key={r.key}>
                      <Link href={r.href} className="result-row group" style={{ ["--accent" as string]: paletteFor(r.key).accent }}>
                        <span className="result-row-mark" aria-hidden />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline gap-3">
                            <span className="truncate text-[17px] font-semibold tracking-[-0.01em]">{r.title}</span>
                            <span className="shrink-0 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">{r.kicker}</span>
                          </span>
                          <span className="mt-0.5 block truncate text-body text-muted-foreground">{r.lines[0]}</span>
                        </span>
                        <span className="hidden shrink-0 font-mono text-[11px] tracking-[0.08em] text-faint-foreground uppercase sm:inline">{r.meta}</span>
                        <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                          <path d="m9 6 6 6-6 6" />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </Section>
  );
}
