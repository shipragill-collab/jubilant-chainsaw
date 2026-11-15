"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { admissionsLink, HOW_TO_GET_IN, MAX_TARGETS, schoolById, SCHOOLS, type Region, type School, type SchoolType } from "@/lib/schools";
import { LEVELS, loadDone, loadLevel, loadTargets, onGoalsChange, saveLevel, toggleDone, toggleTarget, tracksFor, type Level } from "@/lib/tracks";

const REGIONS: Region[] = ["London", "South East", "South West", "East", "Midlands", "North"];

function useGoals() {
  const [level, setLevel] = useState<Level | null>(null);
  const [targets, setTargets] = useState<string[]>([]);
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => {
      setLevel(loadLevel());
      setTargets(loadTargets());
      setDone(loadDone());
    };
    sync();
    return onGoalsChange(sync);
  }, []);
  return { level, targets, done };
}

function SchoolRow({ s, picked, full, onToggle }: { s: School; picked: boolean; full: boolean; onToggle: () => void }) {
  return (
    <li className="school-row">
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{s.name}</p>
        <p className="text-label text-muted-foreground">
          {s.area} · {s.type === "grammar" ? "Grammar (free)" : "Independent"} · {s.gender} · Joins at {s.entry.join(", ")}
        </p>
        {s.note && <p className="text-label text-muted-foreground">{s.note}</p>}
        <a href={admissionsLink(s)} target="_blank" rel="noopener noreferrer" className="text-label underline underline-offset-4">
          Admissions info ↗
        </a>
      </div>
      <button type="button" onClick={onToggle} disabled={!picked && full} aria-pressed={picked} className={`target-btn ${picked ? "is-picked" : ""}`}>
        {picked ? "✓ Target" : full ? "3 picked" : "+ Target"}
      </button>
    </li>
  );
}

/** Goals: what you're studying for, up to 3 target schools, and the track to get there. */
export default function GoalsPage() {
  const { level, targets, done } = useGoals();
  const [type, setType] = useState<SchoolType | "all">("all");
  const [region, setRegion] = useState<Region | "all">("all");
  const [q, setQ] = useState("");
  const [warn, setWarn] = useState(false);

  const list = useMemo(
    () =>
      SCHOOLS.filter((s) => (type === "all" || s.type === type) && (region === "all" || s.region === region) && (!q.trim() || `${s.name} ${s.area}`.toLowerCase().includes(q.trim().toLowerCase()))),
    [type, region, q],
  );
  const tracks = tracksFor(level, targets);
  const full = targets.length >= MAX_TARGETS;
  const types = new Set(targets.map((id) => schoolById(id)?.type).filter(Boolean) as SchoolType[]);

  const toggle = (id: string) => {
    const r = toggleTarget(id);
    setWarn(!r.ok);
  };

  return (
    <div className="space-y-12 py-10 sm:py-14">
      <header className="max-w-3xl space-y-3">
        <p className="font-mono text-[12px] tracking-[0.14em] text-muted-foreground uppercase">Your goals</p>
        <h1 className="display text-[42px] leading-[1.02] sm:text-[58px]">Where are you heading?</h1>
        <p className="text-body-lg text-muted-foreground">Tell us what you&apos;re studying for and pick up to {MAX_TARGETS} target schools. We&apos;ll build a step-by-step track to get you there. This stays on your device.</p>
      </header>

      <section aria-labelledby="level" className="space-y-3">
        <h2 id="level" className="font-mono text-[12px] font-medium tracking-[0.12em] text-muted-foreground uppercase">1 · I&apos;m studying for</h2>
        <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="What are you studying for?">
          {LEVELS.map((l) => (
            <button key={l.id} type="button" role="radio" aria-checked={level === l.id} onClick={() => saveLevel(l.id)} className={`level-card ${level === l.id ? "is-picked" : ""}`}>
              <span className="font-display text-[28px] leading-none font-bold tracking-[-0.03em]">{l.name}</span>
              <span className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">{l.years}</span>
              <span className="text-body text-muted-foreground">{l.blurb}</span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="targets" className="space-y-3" id="schools">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="targets" className="font-mono text-[12px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            2 · Target schools ({targets.length}/{MAX_TARGETS})
          </h2>
          {warn && <p role="status" className="text-body text-destructive">You can pick up to {MAX_TARGETS}. Remove one first.</p>}
        </div>
        {targets.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {targets.map((id) => (
              <li key={id}>
                <button type="button" onClick={() => toggle(id)} className="chip is-target" aria-label={`Remove ${schoolById(id)?.name}`}>
                  {schoolById(id)?.name} <span aria-hidden>×</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="surface space-y-3 p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search schools or towns" aria-label="Search schools" className="h-10 min-w-0 flex-1 basis-56 rounded-[8px] border border-input bg-surface px-3 text-body outline-none focus:border-foreground" />
            <select value={type} onChange={(e) => setType(e.target.value as SchoolType | "all")} aria-label="School type" className="h-10 rounded-[8px] border border-input bg-surface px-3 text-body">
              <option value="all">All types</option>
              <option value="grammar">Grammar (free)</option>
              <option value="independent">Independent</option>
            </select>
            <select value={region} onChange={(e) => setRegion(e.target.value as Region | "all")} aria-label="Region" className="h-10 rounded-[8px] border border-input bg-surface px-3 text-body">
              <option value="all">All of England</option>
              {REGIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <ul className="divide-y divide-[var(--surface-border)]">
            {list.map((s) => (
              <SchoolRow key={s.id} s={s} picked={targets.includes(s.id)} full={full} onToggle={() => toggle(s.id)} />
            ))}
            {!list.length && <li className="py-4 text-body text-muted-foreground">No schools match. Try a different search.</li>}
          </ul>
          <p className="text-label text-muted-foreground">
            A list of well-known, highly selective schools, not an official ranking. Entry details change every year, so always check the school&apos;s own admissions page. Your school isn&apos;t listed? Pick the closest type and the track still fits.
          </p>
        </div>
      </section>

      {types.size > 0 && (
        <section aria-label="How entry works" className="grid gap-4 md:grid-cols-2">
          {[...types].map((t) => (
            <div key={t} className="surface space-y-2 p-5">
              <h3 className="text-[20px] font-semibold">{HOW_TO_GET_IN[t].title}</h3>
              <ul className="grid gap-1.5 text-body text-muted-foreground">
                {HOW_TO_GET_IN[t].points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span aria-hidden>·</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      <section aria-labelledby="track" className="space-y-4">
        <h2 id="track" className="font-mono text-[12px] font-medium tracking-[0.12em] text-muted-foreground uppercase">3 · Your track</h2>
        {!tracks.length ? (
          <p className="surface p-5 text-body-lg text-muted-foreground">Pick what you&apos;re studying for, or a target school, and your track appears here.</p>
        ) : (
          tracks.map((t) => {
            const total = t.steps.length;
            const finished = t.steps.filter((s) => done.includes(s.id)).length;
            return (
              <article key={t.id} className="surface space-y-5 p-5 sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h3 className="font-display text-[26px] font-bold tracking-[-0.02em]">{t.name}</h3>
                    <p className="text-body text-muted-foreground">{t.intro}</p>
                  </div>
                  <p className="font-mono text-[12px] tracking-[0.08em] text-muted-foreground uppercase tabular-nums">
                    {finished}/{total} done
                  </p>
                </div>
                <ol className="track">
                  {t.steps.map((s) => {
                    const isDone = done.includes(s.id);
                    return (
                      <li key={s.id} className={`track-step ${isDone ? "is-done" : ""}`}>
                        <button type="button" onClick={() => toggleDone(s.id)} className="track-dot" aria-pressed={isDone} aria-label={`Mark "${s.title}" ${isDone ? "not done" : "done"}`}>
                          {isDone ? "✓" : ""}
                        </button>
                        <div className="min-w-0 space-y-1.5">
                          <p className="font-mono text-[11px] tracking-[0.12em] text-brand uppercase">{s.when}</p>
                          <p className="text-[19px] font-semibold">{s.title}</p>
                          <ul className="grid gap-1 text-body text-muted-foreground">
                            {s.tasks.map((task) => (
                              <li key={task}>· {task}</li>
                            ))}
                          </ul>
                          {s.actions && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {s.actions.map((a) => (
                                <Link key={a.href + a.label} href={a.href} className="chip">
                                  {a.label} →
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
