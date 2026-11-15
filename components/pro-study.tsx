"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TRIAL_DAYS } from "@/lib/catalog";
import { cardsForToday, daysUntil, loadExamDate, loadMemory, onMemoryChange, saveExamDate, summarize, type MemorySummary } from "@/lib/memory";
import { api, getPlayerId } from "@/lib/player";
import { refreshProfiles, useProfile } from "@/lib/use-profile";
import type { Question } from "@/lib/types";
import { ErrorNotice, Spinner } from "./ui";

/** Live memory summary and exam date for a set. */
export function useSetMemory(setId: string, cardCount: number) {
  const [summary, setSummary] = useState<MemorySummary | null>(null);
  const [exam, setExam] = useState<string | null>(null);
  useEffect(() => {
    const load = () => {
      setSummary(summarize(loadMemory(setId), cardCount));
      setExam(loadExamDate(setId));
    };
    load();
    return onMemoryChange(load);
  }, [setId, cardCount]);
  return { summary, exam };
}

export function ProBadge() {
  return <span className="pro-badge">Pro</span>;
}

/** Start the free trial, or go to Plans when it's been used. */
function TryPro({ label = `Try Pro free for ${TRIAL_DAYS} days` }: { label?: string }) {
  const { profile } = useProfile();
  const [busy, setBusy] = useState(false);
  if (profile && !profile.trialAvailable) {
    return (
      <Link href="/pricing" className="btn btn-brand inline-flex h-10 items-center rounded-[6px] px-4 text-[12px]">
        Go Pro
      </Link>
    );
  }
  return (
    <button
      type="button"
      className="btn btn-brand inline-flex h-10 items-center gap-2 rounded-[6px] px-4 text-[12px]"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await api("/api/pro/trial", { body: { playerId: getPlayerId() } });
          refreshProfiles();
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? <Spinner /> : null} {label}
    </button>
  );
}

/** The Pro study panel on a set: memory, due reviews, exam countdown and mock exams. */
export function ProStudyPanel({ setId, cardCount, onReview, onExam }: { setId: string; cardCount: number; onReview: () => void; onExam: () => void }) {
  const { profile } = useProfile();
  const pro = profile?.plan === "pro";
  const { summary, exam } = useSetMemory(setId, cardCount);
  const days = daysUntil(exam);
  if (!summary) return null;
  const answered = summary.total - summary.fresh;

  if (!pro) {
    return (
      <section className="pro-panel" aria-label="Raj Pro">
        <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
          <ProBadge /> Study smarter with Raj
        </p>
        <ul className="mt-3 space-y-1.5 text-body">
          <li>Raj remembers every card and brings it back before you forget</li>
          <li>Timed mock exams with a score and what to revise</li>
          <li>An exam countdown that plans each day for you</li>
          <li>Raj reads his answers aloud</li>
        </ul>
        {answered > 0 && (
          <p className="mt-3 text-label text-muted-foreground">
            Raj has already remembered your answers on {answered} card{answered === 1 ? "" : "s"}. Go Pro to use them.
          </p>
        )}
        <div className="mt-4">
          <TryPro />
        </div>
      </section>
    );
  }

  const seg = (n: number) => `${(n / Math.max(1, summary.total)) * 100}%`;
  return (
    <section className="pro-panel" aria-label="Your progress with Raj">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
          <ProBadge /> Raj&apos;s memory
        </p>
        <span className="font-mono text-[11px] text-muted-foreground uppercase">{summary.mastered}/{summary.total} mastered</span>
      </div>
      <div className="mem-bar mt-3" role="img" aria-label={`${summary.mastered} mastered, ${summary.learning} learning, ${summary.shaky} shaky, ${summary.fresh} not tried`}>
        <span className="mem-mastered" style={{ width: seg(summary.mastered) }} />
        <span className="mem-learning" style={{ width: seg(summary.learning) }} />
        <span className="mem-shaky" style={{ width: seg(summary.shaky) }} />
      </div>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-label text-muted-foreground">
        <span><i className="mem-dot mem-mastered" /> Mastered {summary.mastered}</span>
        <span><i className="mem-dot mem-learning" /> Learning {summary.learning}</span>
        <span><i className="mem-dot mem-shaky" /> Shaky {summary.shaky}</span>
        <span>New {summary.fresh}</span>
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onReview} className="btn btn-brand inline-flex h-10 items-center rounded-[6px] px-4 text-[12px]">
          {summary.due ? `Review ${summary.due} due` : "Practise with Raj"}
        </button>
        <button type="button" onClick={onExam} className="btn btn-secondary inline-flex h-10 items-center rounded-[6px] px-4 text-[12px]">
          Mock exam
        </button>
      </div>

      <div className="mt-4 border-t border-surface-border pt-4">
        <label htmlFor={`exam-${setId}`} className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
          Exam date
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <input
            id={`exam-${setId}`}
            type="date"
            value={exam ?? ""}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => saveExamDate(setId, e.target.value || null)}
            className="h-10 rounded-[6px] border border-input bg-surface px-3 text-body"
          />
          {days !== null && (
            <span className="text-body">
              {days > 0 ? (
                <>
                  <strong>{days} day{days === 1 ? "" : "s"}</strong> to go · today: <strong>{cardsForToday(summary, days)} cards</strong>
                </>
              ) : days === 0 ? (
                <strong>Exam day. You&apos;ve got this!</strong>
              ) : (
                "That exam has passed."
              )}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

function grade(pct: number) {
  if (pct >= 90) return "Outstanding";
  if (pct >= 70) return "Strong";
  if (pct >= 50) return "Getting there";
  return "Keep practising";
}

/** A timed 10-question mock exam: no hints, a score, and what to revise. */
export function MockExam({ setId, onAskRaj }: { setId: string; onAskRaj: (missed: string[]) => void }) {
  const [state, setState] = useState<"intro" | "loading" | "running" | "done">("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [pos, setPos] = useState(0);
  const [endsAt, setEndsAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setState("loading");
    setError(null);
    try {
      const r = await api<{ minutes: number; questions: Question[] }>(`/api/study/${setId}/exam`, { body: { playerId: getPlayerId() } });
      setQuestions(r.questions);
      setAnswers(r.questions.map(() => null));
      setPos(0);
      setEndsAt(Date.now() + r.minutes * 60_000);
      setState("running");
    } catch (err) {
      setError((err as Error).message);
      setState("intro");
    }
  }

  useEffect(() => {
    if (state !== "running") return;
    const t = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= endsAt) setState("done");
    }, 500);
    return () => clearInterval(t);
  }, [state, endsAt]);

  if (state === "intro" || state === "loading") {
    return (
      <div className="surface space-y-4 p-6">
        <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
          <ProBadge /> Mock exam
        </p>
        <h2 className="text-[26px] leading-tight">10 questions · 10 minutes · no hints</h2>
        <p className="text-body-lg text-muted-foreground">Answer like it&apos;s the real thing. At the end you&apos;ll get your score, every answer explained, and what to revise.</p>
        {error && <ErrorNotice message={error} className="text-body text-destructive" />}
        <button type="button" onClick={start} disabled={state === "loading"} className="btn btn-brand inline-flex h-12 items-center gap-2 rounded-[6px] px-6 text-[13px]">
          {state === "loading" ? <Spinner /> : null} Start the exam
        </button>
      </div>
    );
  }

  if (state === "running") {
    const q = questions[pos];
    const left = Math.max(0, endsAt - now);
    const mm = Math.floor(left / 60000);
    const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");
    const last = pos === questions.length - 1;
    return (
      <div className="surface space-y-5 p-6">
        <div className="flex items-center justify-between font-mono text-[12px] tracking-[0.08em] text-muted-foreground uppercase">
          <span>Question {pos + 1} of {questions.length}</span>
          <span className={left < 60_000 ? "text-destructive" : ""} aria-live="off">{mm}:{ss}</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
          <div className="h-full bg-brand transition-[width]" style={{ width: `${((pos + 1) / questions.length) * 100}%` }} />
        </div>
        <h2 className="text-[22px] leading-snug">{q.prompt}</h2>
        <div className="grid gap-2" role="radiogroup" aria-label="Answers">
          {q.options.map((o, i) => (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={answers[pos] === i}
              onClick={() => setAnswers((a) => a.map((x, j) => (j === pos ? i : x)))}
              className={`exam-option ${answers[pos] === i ? "is-picked" : ""}`}
            >
              <span className="font-mono text-[12px] text-muted-foreground">{String.fromCharCode(65 + i)}</span>
              {o}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <button type="button" disabled={pos === 0} onClick={() => setPos((p) => p - 1)} className="btn btn-secondary inline-flex h-10 items-center rounded-[6px] px-4 text-[12px] disabled:opacity-40">
            Back
          </button>
          <button
            type="button"
            onClick={() => (last ? setState("done") : setPos((p) => p + 1))}
            className="btn btn-brand inline-flex h-10 items-center rounded-[6px] px-4 text-[12px]"
          >
            {last ? "Finish exam" : "Next"}
          </button>
        </div>
      </div>
    );
  }

  const score = questions.filter((q, i) => answers[i] === q.answerIndex).length;
  const pct = Math.round((score / Math.max(1, questions.length)) * 100);
  const missed = questions.filter((q, i) => answers[i] !== q.answerIndex);
  return (
    <div className="space-y-5">
      <div className="surface space-y-2 p-6 text-center">
        <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">Your result</p>
        <p className="display text-[64px] leading-none tabular-nums">{pct}%</p>
        <p className="text-title-lg font-semibold">{grade(pct)}</p>
        <p className="text-body text-muted-foreground">{score} of {questions.length} correct{missed.length ? `. Raj suggests revising the ${missed.length} you missed.` : ". Perfect score!"}</p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {missed.length > 0 && (
            <button type="button" onClick={() => onAskRaj(missed.map((q) => q.prompt))} className="btn btn-brand inline-flex h-10 items-center rounded-[6px] px-4 text-[12px]">
              Go over them with Raj
            </button>
          )}
          <button type="button" onClick={start} className="btn btn-secondary inline-flex h-10 items-center rounded-[6px] px-4 text-[12px]">
            Try another mock
          </button>
        </div>
      </div>
      <ol className="space-y-3">
        {questions.map((q, i) => {
          const right = answers[i] === q.answerIndex;
          return (
            <li key={q.prompt} className="surface p-4">
              <p className="flex gap-2 font-medium">
                <span className={right ? "text-success" : "text-destructive"} aria-label={right ? "Correct" : "Wrong"}>{right ? "✓" : "✗"}</span>
                {q.prompt}
              </p>
              <p className="mt-1 text-body text-muted-foreground">
                Answer: <strong className="text-foreground">{q.options[q.answerIndex]}</strong>
                {!right && <> · You said: {answers[i] === null ? "nothing" : q.options[answers[i]!]}</>}
              </p>
              {q.explanation && <p className="mt-1 text-body text-muted-foreground">{q.explanation}</p>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
