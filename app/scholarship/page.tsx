"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadResults, type PaperResult } from "@/lib/eleven-plus";
import { loadScholarSchools, MAX_SCHOLAR_SCHOOLS, saveScholarSchools, SCHOLAR_FREE, SCHOLAR_PAPERS, SCHOLARSHIP_SCHOOLS, scholarSchool, scholarshipLink, SUBJECT_INFO } from "@/lib/scholarship";
import { useProfile } from "@/lib/use-profile";

/** KS3: 13+ academic scholarship practice for the schools you choose. */
export default function ScholarshipPage() {
  const { profile } = useProfile();
  const pro = profile?.plan === "pro";
  const [chosen, setChosen] = useState<string[]>([]);
  const [results, setResults] = useState<PaperResult[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    setChosen(loadScholarSchools());
    setResults(loadResults());
  }, []);

  const toggle = (id: string) => {
    const next = chosen.includes(id) ? chosen.filter((x) => x !== id) : chosen.length < MAX_SCHOLAR_SCHOOLS ? [...chosen, id] : chosen;
    setChosen(next);
    saveScholarSchools(next);
  };
  const best = (key: string) => {
    const r = results.filter((x) => x.key === key);
    return r.length ? Math.max(...r.map((x) => Math.round((x.score / x.total) * 100))) : null;
  };

  return (
    <div className="space-y-10 py-10 sm:py-14">
      <header className="max-w-3xl space-y-3">
        <p className="font-mono text-[12px] tracking-[0.14em] text-muted-foreground uppercase">KS3 · 13+ entry</p>
        <h1 className="display text-[42px] leading-[1.02] sm:text-[58px]">Scholarship</h1>
        <p className="text-body-lg text-muted-foreground">
          Pick up to {MAX_SCHOLAR_SCHOOLS} schools. You&apos;ll see the subjects each one examines, with {SCHOLAR_PAPERS} practice papers per subject written in the scholarship style. English papers are built around a comprehension passage, with creative and essay tasks based on it.
        </p>
      </header>

      <section aria-labelledby="pick" className="space-y-3">
        <h2 id="pick" className="font-mono text-[12px] font-medium tracking-[0.12em] text-muted-foreground uppercase">1 · Choose schools ({chosen.length}/{MAX_SCHOLAR_SCHOOLS})</h2>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SCHOLARSHIP_SCHOOLS.map((s) => {
            const on = chosen.includes(s.id);
            return (
              <li key={s.id}>
                <button type="button" onClick={() => toggle(s.id)} aria-pressed={on} disabled={!on && chosen.length >= MAX_SCHOLAR_SCHOOLS} className={`level-card h-full w-full disabled:opacity-45 ${on ? "is-picked" : ""}`}>
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-semibold">{s.name}</span>
                    <span className="font-mono text-[11px] tracking-[0.08em] uppercase">{on ? "✓" : "+"}</span>
                  </span>
                  <span className="text-label text-muted-foreground">{s.award}</span>
                  <span className="text-label text-muted-foreground">{s.subjects.map((x) => SUBJECT_INFO[x].name).join(" · ")}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="papers" className="space-y-4">
        <h2 id="papers" className="font-mono text-[12px] font-medium tracking-[0.12em] text-muted-foreground uppercase">2 · Practise</h2>
        {!chosen.length && <p className="surface p-5 text-body-lg text-muted-foreground">Choose a school above to see its subjects and papers.</p>}
        {chosen.map((id) => {
          const s = scholarSchool(id)!;
          return (
            <article key={id} className="surface space-y-4 p-5 sm:p-6">
              <div className="space-y-1">
                <h3 className="font-display text-[26px] font-bold tracking-[-0.02em]">{s.name}</h3>
                <p className="text-body text-muted-foreground">
                  {s.award}. {s.note}
                </p>
                <p className="text-label text-muted-foreground">
                  Subject list: {s.basis.toLowerCase()}.{" "}
                  <a href={scholarshipLink(s)} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Check the school&apos;s page ↗</a>
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {s.subjects.map((sub) => {
                  const key = `${id}:${sub}`;
                  const shown = open === key ? SCHOLAR_PAPERS : 10;
                  return (
                    <div key={sub} className="rounded-[10px] p-4 shadow-[inset_0_0_0_1px_var(--surface-border)]">
                      <p className="font-semibold">{SUBJECT_INFO[sub].name}</p>
                      <p className="mb-3 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
                        {SUBJECT_INFO[sub].count} questions · {SUBJECT_INFO[sub].minutes} min
                      </p>
                      <ol className="paper-grid">
                        {Array.from({ length: shown }, (_, i) => i + 1).map((n) => {
                          const locked = n > SCHOLAR_FREE && !pro;
                          const b = best(`sch:${id}:${sub}:${n}`);
                          return (
                            <li key={n}>
                              <Link href={locked ? "/pricing" : `/scholarship/paper?school=${id}&subject=${sub}&n=${n}`} className={`paper-chip ${locked ? "is-locked" : ""} ${b !== null ? "is-done" : ""}`} aria-label={`Paper ${n}${locked ? ", Pro" : ""}`}>
                                <span>{n}</span>
                                {b !== null ? <small>{b}%</small> : locked ? <small>Pro</small> : n <= SCHOLAR_FREE ? <small>Free</small> : null}
                              </Link>
                            </li>
                          );
                        })}
                      </ol>
                      {open !== key && (
                        <button type="button" onClick={() => setOpen(key)} className="mt-2 font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase hover:text-foreground">
                          Show all {SCHOLAR_PAPERS}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
        <p className="text-label text-muted-foreground">
          These are PrepPass practice papers in the scholarship style, not the schools&apos; own papers. Many schools publish their real past papers on their websites. Papers 1–{SCHOLAR_FREE} in every subject are free; Pro unlocks the rest.
        </p>
      </section>
    </div>
  );
}
