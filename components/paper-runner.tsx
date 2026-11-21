"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { saveResult, topicStats, type PaperQuestion } from "@/lib/eleven-plus";
import { ShapeArt } from "./shape-art";

function grade(pct: number) {
  if (pct >= 90) return "Outstanding";
  if (pct >= 75) return "Great work";
  if (pct >= 60) return "Good, keep going";
  if (pct >= 40) return "Getting there";
  return "Keep practising";
}

/**
 * A timed practice paper: one question at a time, jump to any question,
 * then a score, a topic breakdown and every answer explained.
 */
export function PaperRunner({ resultKey, title, minutes, questions, onAgain, passage, extra }: { resultKey: string; title: string; minutes: number; questions: PaperQuestion[]; onAgain?: () => void; passage?: { title: string; text: string; kind?: string }; extra?: ReactNode }) {
  const passageBox = passage && (
    <details className="passage" open>
      <summary>
        <span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">{passage.kind ?? "Passage"}</span> <strong>{passage.title}</strong>
      </summary>
      <p className="mt-2 text-body-lg leading-relaxed">{passage.text}</p>
    </details>
  );
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [pos, setPos] = useState(0);
  const [endsAt, setEndsAt] = useState(0);
  const [now, setNow] = useState(0);
  const [timed, setTimed] = useState(true);
  const [sure, setSure] = useState(false);

  useEffect(() => {
    if (!started || done || !timed) return;
    const t = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= endsAt) setDone(true);
    }, 500);
    return () => clearInterval(t);
  }, [started, done, timed, endsAt]);

  const correct = useMemo(() => questions.map((q, i) => answers[i] === q.answer), [questions, answers]);
  const score = correct.filter(Boolean).length;

  useEffect(() => {
    if (!done) return;
    saveResult({ key: resultKey, title, score, total: questions.length, at: Date.now(), topics: topicStats(questions, correct) });
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Save once per finish.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  if (!started) {
    return (
      <div className="surface space-y-4 p-6">
        <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">Practice paper</p>
        <h2 className="text-[26px] leading-tight">{title}</h2>
        <p className="text-body-lg text-muted-foreground">
          {questions.length} questions · {minutes} minutes. Work like it&apos;s the real test: no notes, no calculator. You can skip and come back.
        </p>
        <label className="flex items-center gap-3 text-body">
          <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} className="size-4 accent-[var(--brand)]" />
          Time me ({minutes} minutes)
        </label>
        <button
          type="button"
          onClick={() => {
            setStarted(true);
            setEndsAt(Date.now() + minutes * 60_000);
            setNow(Date.now());
          }}
          className="btn btn-brand inline-flex h-12 items-center rounded-[6px] px-6 text-[13px]"
        >
          Start the paper
        </button>
      </div>
    );
  }

  if (!done) {
    const q = questions[pos];
    const left = Math.max(0, endsAt - now);
    const mm = Math.floor(left / 60000);
    const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");
    const last = pos === questions.length - 1;
    const answered = answers.filter((a) => a !== null).length;
    return (
      <div className="surface space-y-5 p-5 sm:p-6">
        <div className="flex items-center justify-between font-mono text-[12px] tracking-[0.08em] text-muted-foreground uppercase">
          <span>
            Question {pos + 1} of {questions.length}
          </span>
          {timed && (
            <span className={left < 60_000 ? "text-destructive" : ""} aria-live="off">
              {mm}:{ss}
            </span>
          )}
        </div>
        <ol className="paper-nav" aria-label="Jump to a question">
          {questions.map((_, i) => (
            <li key={i}>
              <button type="button" onClick={() => setPos(i)} aria-current={i === pos ? "step" : undefined} className={answers[i] !== null ? "is-answered" : ""} aria-label={`Question ${i + 1}${answers[i] !== null ? ", answered" : ""}`}>
                {i + 1}
              </button>
            </li>
          ))}
        </ol>
        <p className="text-[11px] font-medium tracking-[0.1em] text-muted-foreground uppercase">{q.topic}</p>
        {passageBox}
        <h2 className="text-[21px] leading-snug sm:text-[22px]">{q.prompt}</h2>
        {q.shapes && (
          <div className="nv-row" aria-label="The sequence">
            {q.shapes.map((s, i) => (
              <ShapeArt key={i} shape={s} size={58} />
            ))}
            <span className="nv-q" aria-hidden>?</span>
          </div>
        )}
        <div className={q.optionShapes ? "nv-options" : "grid gap-2"} role="radiogroup" aria-label="Answers">
          {q.options.map((o, i) => (
            <button
              key={`${pos}-${i}`}
              type="button"
              role="radio"
              aria-checked={answers[pos] === i}
              onClick={() => setAnswers((a) => a.map((x, j) => (j === pos ? i : x)))}
              className={`exam-option ${answers[pos] === i ? "is-picked" : ""} ${q.optionShapes ? "nv-option" : ""}`}
            >
              <span className="font-mono text-[12px] text-muted-foreground">{String.fromCharCode(65 + i)}</span>
              {q.optionShapes ? <ShapeArt shape={q.optionShapes[i]} size={56} /> : o}
            </button>
          ))}
        </div>
        {sure && answered < questions.length && (
          <p role="status" className="rounded-[8px] bg-muted px-3 py-2 text-body">
            You&apos;ve left {questions.length - answered} unanswered. Use the numbers above to go back, or tap Finish anyway.
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="button" disabled={pos === 0} onClick={() => setPos((p) => p - 1)} className="btn btn-secondary inline-flex h-10 items-center rounded-[6px] px-4 text-[12px] disabled:opacity-40">
            Back
          </button>
          <span className="text-label text-muted-foreground">
            {answered} of {questions.length} answered
          </span>
          {last ? (
            <button
              type="button"
              onClick={() => {
                // No pop-ups: the first tap explains, the second finishes.
                if (answered < questions.length && !sure) return setSure(true);
                setDone(true);
              }}
              className="btn btn-brand inline-flex h-10 items-center rounded-[6px] px-4 text-[12px]"
            >
              {sure && answered < questions.length ? "Finish anyway" : "Finish"}
            </button>
          ) : (
            <button type="button" onClick={() => setPos((p) => p + 1)} className="btn btn-brand inline-flex h-10 items-center rounded-[6px] px-4 text-[12px]">
              Next
            </button>
          )}
        </div>
      </div>
    );
  }

  const pct = Math.round((score / Math.max(1, questions.length)) * 100);
  const topics = Object.entries(topicStats(questions, correct)).sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1]);
  const weakest = topics.find(([, [r, n]]) => r < n);
  return (
    <div className="space-y-5">
      <div className="surface space-y-2 p-6 text-center">
        <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">{title}</p>
        <p className="display text-[64px] leading-none tabular-nums">{pct}%</p>
        <p className="text-title-lg font-semibold">{grade(pct)}</p>
        <p className="text-body text-muted-foreground">
          {score} of {questions.length} correct.{weakest ? ` Practise ${weakest[0].toLowerCase()} next.` : " Perfect score!"}
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {weakest && (
            <Link href={`/tutor?ask=${encodeURIComponent(resultKey.startsWith("11:") ? `Help me get better at 11+ ${weakest[0].toLowerCase()} questions. Explain the trick, then give me one to try.` : `Help me revise ${weakest[0]}. Quiz me on what I got wrong.`)}`} className="btn btn-brand inline-flex h-10 items-center rounded-[6px] px-4 text-[12px]">
              Practise with Raj
            </Link>
          )}
          {onAgain && (
            <button type="button" onClick={onAgain} className="btn btn-secondary inline-flex h-10 items-center rounded-[6px] px-4 text-[12px]">
              Choose another paper
            </button>
          )}
        </div>
      </div>
      <div className="surface p-5">
        <h3 className="mb-3 font-mono text-[12px] tracking-[0.12em] text-muted-foreground uppercase">By topic</h3>
        <ul className="grid gap-2">
          {topics.map(([t, [r, n]]) => (
            <li key={t} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
              <span className="truncate text-body font-medium">{t}</span>
              <span className="font-mono text-[12px] text-muted-foreground tabular-nums">
                {r}/{n}
              </span>
              <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <span className={`block h-full rounded-full ${r / n >= 0.75 ? "bg-success" : r / n >= 0.5 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${Math.max(4, (r / n) * 100)}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </div>
      {extra}
      <ol className="space-y-3">
        {questions.map((q, i) => (
          <li key={i} className={`surface p-5 ${correct[i] ? "" : "exam-missed"}`}>
            <p className="mb-1 font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
              {i + 1}. {q.topic} · {correct[i] ? "✓ Right" : answers[i] === null ? "Not answered" : "✗ Not quite"}
            </p>
            <p className="font-semibold">{q.prompt}</p>
            {q.shapes && (
              <div className="nv-row mt-2">
                {q.shapes.map((s, k) => (
                  <ShapeArt key={k} shape={s} size={40} />
                ))}
              </div>
            )}
            <p className="mt-2 text-body">
              Answer: <strong>{q.options[q.answer]}</strong>
              {q.optionShapes && <ShapeArt shape={q.optionShapes[q.answer]} size={32} />}
              {!correct[i] && answers[i] !== null && <span className="text-muted-foreground"> · you chose {q.options[answers[i]!]}</span>}
            </p>
            <p className="mt-1 text-body text-muted-foreground">{q.explain}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
