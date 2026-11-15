"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ElevenPackCard } from "@/components/eleven-pack";
import { Spinner } from "@/components/ui";
import { api, getPlayerId } from "@/lib/player";
import { loadLevel } from "@/lib/tracks";
import { useProfile } from "@/lib/use-profile";
import { analyseWriting, FREE_WRITING_PER_KIND, loadDraft, saveDraft, taskById, WRITING_TASKS, type WritingKind, type WritingReport, type WritingTask } from "@/lib/writing";

const KINDS: { id: WritingKind; name: string; blurb: string }[] = [
  { id: "creative", name: "Creative writing", blurb: "Stories and descriptions" },
  { id: "essay", name: "Essay writing", blurb: "Persuasive, discursive, letters and speeches" },
];

/** Turns Raj's **bold** headings and line breaks into simple HTML-free JSX. */
function Feedback({ text }: { text: string }) {
  return (
    <div className="space-y-2 text-body-lg">
      {text.split(/\n+/).map((line, i) => (
        <p key={i}>
          {line.split(/(\*\*[^*]+\*\*)/).map((part, j) => (part.startsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : <span key={j}>{part}</span>))}
        </p>
      ))}
    </div>
  );
}

function Report({ r }: { r: WritingReport }) {
  return (
    <div className="surface space-y-4 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[20px] font-semibold">Writing check</h3>
        <span className="font-mono text-[12px] tracking-[0.08em] text-muted-foreground uppercase tabular-nums">
          {r.total}/{r.criteria.length * 3} · {r.words} words · {r.paragraphs} paragraph{r.paragraphs === 1 ? "" : "s"}
        </span>
      </div>
      {r.stars.length > 0 && (
        <div>
          <p className="font-semibold">⭐ What went well</p>
          <ul className="grid gap-1 text-body text-muted-foreground">
            {r.stars.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <p className="font-semibold">🎯 Next step</p>
        <p className="text-body text-muted-foreground">{r.wish}</p>
      </div>
      <ul className="grid gap-2">
        {r.criteria.map((c) => (
          <li key={c.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
            <span className="text-body font-medium">{c.name}</span>
            <span className="font-mono text-[12px] text-muted-foreground">{c.score}/3</span>
            <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <span className={`block h-full rounded-full ${c.score >= 3 ? "bg-success" : c.score === 2 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${Math.max(6, (c.score / 3) * 100)}%` }} />
            </span>
          </li>
        ))}
      </ul>
      <p className="text-label text-muted-foreground">The checker looks at the things markers look for. It can&apos;t judge your ideas like a teacher, so ask Raj too.</p>
    </div>
  );
}

function Editor({ task }: { task: WritingTask }) {
  const [text, setText] = useState("");
  const [report, setReport] = useState<WritingReport | null>(null);
  const [raj, setRaj] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const saveT = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setText(loadDraft(task.id)), [task.id]);
  useEffect(() => {
    if (timer === null) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [timer]);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const left = timer === null ? null : Math.max(0, timer - now);

  async function askRaj() {
    setBusy(true);
    setError(null);
    setRaj(null);
    const r = analyseWriting(text, task.kind);
    setReport(r);
    try {
      const res = await api<{ feedback?: string; offline?: boolean }>("/api/writing", { body: { playerId: getPlayerId(), taskId: task.id, text, level: loadLevel() } });
      if (res.feedback) setRaj(res.feedback);
      else setRaj(`**What went well**\n${r.stars.length ? r.stars.join(" ") : "You've made a start, and that's the hardest part."}\n**Next step**\n${r.wish}\n(Raj is offline, so this comes from the writing checker.)`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="surface space-y-3 p-5">
        <p className="font-mono text-[11px] tracking-[0.12em] text-brand uppercase">
          {task.kind === "creative" ? "Creative writing" : "Essay writing"} · {task.form} · {task.minutes} min
        </p>
        <h2 className="text-[26px] leading-tight">{task.title}</h2>
        <p className="text-body-lg">{task.prompt}</p>
        <details className="rounded-[8px] bg-muted p-3">
          <summary className="cursor-pointer font-semibold">Plan it first (5 minutes)</summary>
          <ol className="mt-2 grid list-decimal gap-1 pl-5 text-body text-muted-foreground">
            {task.plan.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </details>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[12px] tracking-[0.08em] text-muted-foreground uppercase">
          <span className="tabular-nums">{words} words</span>
          {left === null ? (
            <button type="button" onClick={() => { setTimer(Date.now() + task.minutes * 60_000); setNow(Date.now()); }} className="chip">
              Start {task.minutes}-minute timer
            </button>
          ) : (
            <span className={left < 120_000 ? "text-destructive" : ""}>
              {left === 0 ? "Time's up! Finish your sentence." : `${Math.floor(left / 60000)}:${String(Math.floor((left % 60000) / 1000)).padStart(2, "0")} left`}
            </span>
          )}
        </div>
        <textarea
          value={text}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            if (saveT.current) clearTimeout(saveT.current);
            saveT.current = setTimeout(() => saveDraft(task.id, v), 400);
          }}
          rows={16}
          placeholder="Start writing here. Leave a blank line between paragraphs. Your work saves on this device as you type."
          className="writing-box"
          aria-label="Your writing"
          spellCheck
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setReport(analyseWriting(text, task.kind))} disabled={words < 20} className="btn btn-secondary inline-flex h-11 items-center rounded-[6px] px-4 text-[12px] disabled:opacity-40">
            Check my writing
          </button>
          <button type="button" onClick={askRaj} disabled={words < 40 || busy} className="btn btn-brand inline-flex h-11 items-center gap-2 rounded-[6px] px-4 text-[12px] disabled:opacity-40">
            {busy ? <Spinner /> : null} Get Raj&apos;s feedback
          </button>
        </div>
        {words < 40 && <p className="text-label text-muted-foreground">Write at least 40 words to get feedback.</p>}
        {error && <p className="text-body text-destructive">{error}</p>}
      </div>

      {raj && (
        <div className="surface space-y-2 p-5" style={{ boxShadow: "inset 0 0 0 1.5px var(--raj-forest, var(--brand))" }}>
          <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">Raj says</p>
          <Feedback text={raj} />
        </div>
      )}
      {report && <Report r={report} />}
    </div>
  );
}

/** 11+ creative and essay writing. */
export default function WritingPage() {
  const { profile } = useProfile();
  const active = Boolean(profile?.elevenActive);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [kind, setKind] = useState<WritingKind>("creative");

  useEffect(() => {
    const sync = () => {
      const p = new URLSearchParams(window.location.search);
      setTaskId(p.get("task"));
      if (p.get("kind") === "essay") setKind("essay");
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const open = (id: string | null) => {
    setTaskId(id);
    history.pushState(null, "", id ? `/11-plus/writing?task=${id}` : `/11-plus/writing?kind=${kind}`);
    window.scrollTo({ top: 0 });
  };

  const task = taskId ? taskById(taskId) : null;
  const list = useMemo(() => WRITING_TASKS.filter((t) => t.kind === kind), [kind]);
  const locked = (t: WritingTask) => !active && WRITING_TASKS.filter((x) => x.kind === t.kind).indexOf(t) >= FREE_WRITING_PER_KIND;

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8 sm:py-12">
      {task ? (
        <>
          <button type="button" onClick={() => open(null)} className="font-mono text-[12px] tracking-[0.1em] text-muted-foreground uppercase hover:text-foreground">
            ← All writing tasks
          </button>
          {locked(task) ? (
            <div className="space-y-4">
              <p className="surface p-5 text-body-lg">This task is part of the 11+ Pack.</p>
              <ElevenPackCard />
            </div>
          ) : (
            <Editor task={task} />
          )}
        </>
      ) : (
        <>
          <Link href="/11-plus" className="font-mono text-[12px] tracking-[0.1em] text-muted-foreground uppercase hover:text-foreground">
            ← 11+ practice
          </Link>
          <header className="space-y-2">
            <h1 className="display text-[40px] leading-[1.04] sm:text-[52px]">11+ writing</h1>
            <p className="text-body-lg text-muted-foreground">Plan, write against the clock, then get instant feedback from the writing checker and Raj. Many independent schools set a story or an essay in their 11+.</p>
          </header>
          <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Type of writing">
            {KINDS.map((k) => (
              <button key={k.id} type="button" role="tab" aria-selected={kind === k.id} onClick={() => setKind(k.id)} className={`level-card ${kind === k.id ? "is-picked" : ""}`}>
                <span className="font-display text-[20px] font-bold tracking-[-0.02em]">{k.name}</span>
                <span className="text-label text-muted-foreground">{k.blurb}</span>
              </button>
            ))}
          </div>
          <ul className="divide-y divide-[var(--surface-border)] border-y border-surface-border">
            {list.map((t) => {
              const draft = typeof window === "undefined" ? "" : loadDraft(t.id);
              return (
                <li key={t.id}>
                  <button type="button" onClick={() => open(t.id)} className="result-row w-full text-left">
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{t.title}</span>
                      <span className="block truncate text-body text-muted-foreground">{t.prompt}</span>
                      <span className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
                        {t.form} · {t.minutes} min{draft ? ` · draft saved (${draft.trim().split(/\s+/).length} words)` : ""}
                      </span>
                    </span>
                    <span aria-hidden className="text-muted-foreground">{locked(t) ? "🔒" : "›"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {!active && <p className="text-label text-muted-foreground">The first {FREE_WRITING_PER_KIND} tasks of each kind are free. The 11+ Pack unlocks them all.</p>}
        </>
      )}
    </div>
  );
}
