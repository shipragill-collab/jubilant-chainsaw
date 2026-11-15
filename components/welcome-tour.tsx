"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RajCompanion } from "./raj-companion";
import { isYoung, useLevel } from "@/lib/tracks";

const KEY = "quiz-duel:welcomed";

const STEPS = [
  {
    eyebrow: "Step 1",
    title: "Paste your notes",
    body: "Class notes, a textbook page, a revision guide. In seconds you get flashcards, tidy notes and a 10-question quiz.",
    art: "notes",
  },
  {
    eyebrow: "Step 2",
    title: "Duel a friend",
    body: "Send the link. You both answer the same questions against the clock, and the leaderboard remembers who won.",
    art: "duel",
  },
  {
    eyebrow: "Step 3",
    title: "Stuck? Ask Raj",
    body: "Raj is your tutor. He explains things simply, quizzes you on what you got wrong, and cheers on your streak.",
    art: "raj",
  },
] as const;

function Art({ kind }: { kind: (typeof STEPS)[number]["art"] }) {
  if (kind === "raj") return <RajCompanion state="happy" feeling="happy" size={110} />;
  if (kind === "duel") {
    return (
      <div className="flex items-end gap-4 font-mono" aria-hidden>
        {[
          ["You", 9, "var(--brand)"],
          ["Sam", 7, "#5b8cff"],
        ].map(([n, s, c]) => (
          <div key={n as string} className="grid justify-items-center gap-2">
            <div className="w-16 rounded-md" style={{ height: (s as number) * 11, background: c as string }} />
            <span className="text-[12px] tracking-[0.1em] uppercase">{n} · {s}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="relative h-[110px] w-[180px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute h-[86px] w-[140px] rounded-lg bg-surface p-3 shadow-[inset_0_0_0_1px_var(--surface-border)]"
          style={{ left: i * 18, top: 12 - i * 6, transform: `rotate(${(i - 1) * 5}deg)` }}
        >
          <div className="h-2 w-16 rounded bg-brand" />
          <div className="mt-3 h-1.5 w-24 rounded bg-muted" />
          <div className="mt-2 h-1.5 w-20 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

/** Three quick steps for a first visit. Skippable, shown once. */
export function WelcomeTour() {
  const ref = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  const level = useLevel();
  useEffect(() => {
    // Wait for the stage to be chosen; KS2 and 11+ never get pop-ups.
    if (!level || isYoung(level)) return;
    let seen = true;
    try {
      seen = Boolean(localStorage.getItem(KEY));
    } catch {
      /* private mode: don't nag */
    }
    if (!seen && !ref.current?.open) ref.current?.showModal();
  }, [level]);

  function close() {
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    ref.current?.close();
  }

  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
  };
  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <dialog ref={ref} className="welcome" aria-labelledby="welcome-title" onCancel={close}>
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">Welcome to PrepPass</span>
        <button type="button" onClick={close} className="btn rounded-[6px] px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground">
          Skip
        </button>
      </div>
      <div className="welcome-stage">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="grid justify-items-center gap-6 text-center"
          >
            <div className="grid h-[130px] place-items-center">
              <Art kind={s.art} />
            </div>
            <div className="grid gap-2">
              <span className="font-mono text-[11px] tracking-[0.14em] text-brand uppercase">{s.eyebrow}</span>
              <h2 id="welcome-title" className="text-[30px] leading-tight">{s.title}</h2>
              <p className="mx-auto max-w-[36ch] text-body-lg text-muted-foreground">{s.body}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1.5" role="tablist" aria-label="Tour steps">
          {STEPS.map((x, i) => (
            <button
              key={x.title}
              type="button"
              role="tab"
              aria-selected={i === step}
              aria-label={`Step ${i + 1}: ${x.title}`}
              onClick={() => go(i)}
              className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-brand" : "w-1.5 bg-[var(--input)]"}`}
            />
          ))}
        </div>
        {last ? (
          <Link href="/study" onClick={close} className="btn btn-brand inline-flex h-11 items-center rounded-[6px] px-5 text-[12px]" autoFocus>
            Add my notes
          </Link>
        ) : (
          <button type="button" onClick={() => go(step + 1)} className="btn btn-brand inline-flex h-11 items-center rounded-[6px] px-5 text-[12px]" autoFocus>
            Next
          </button>
        )}
      </div>
    </dialog>
  );
}
