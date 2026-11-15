"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { memoryDeck, quickFireRound, sameWord, scramble, scrambleWords, shuffle, type GameId, type Pair } from "@/lib/games";
import { api, getPlayerId } from "@/lib/player";
import { refreshProfiles } from "@/lib/use-profile";
import type { KeyTerm } from "@/lib/types";

const bestKey = (game: GameId, source: string) => `quiz-duel:best:${game}:${source}`;
export function loadBest(game: GameId, source: string): number | null {
  try {
    const v = localStorage.getItem(bestKey(game, source));
    return v === null ? null : Number(v);
  } catch {
    return null;
  }
}

/** Save a score if it beats the best (lower is better for timed/move games). Returns true for a new best. */
function saveBest(game: GameId, source: string, score: number, lowerIsBetter: boolean): boolean {
  const prev = loadBest(game, source);
  const better = prev === null || (lowerIsBetter ? score < prev : score > prev);
  if (better) {
    try {
      localStorage.setItem(bestKey(game, source), String(score));
    } catch {
      /* ignore */
    }
  }
  return better;
}

/** Playing a game counts as studying (streak, Raj's mood, Duel Pass XP). */
function countActivity() {
  void api("/api/activity", { body: { playerId: getPlayerId() } }).then(refreshProfiles).catch(() => undefined);
}

function GameOver({ title, line, isBest, onAgain, onExit }: { title: string; line: string; isBest: boolean; onAgain: () => void; onExit: () => void }) {
  return (
    <div className="surface animate-pop grid justify-items-center gap-3 p-8 text-center">
      <p className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">{isBest ? "New best!" : "Game over"}</p>
      <p className="display text-[44px] leading-none">{title}</p>
      <p className="text-body-lg text-muted-foreground">{line}</p>
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        <button type="button" onClick={onAgain} className="btn btn-brand inline-flex h-11 items-center rounded-[6px] px-5 text-[12px]">Play again</button>
        <button type="button" onClick={onExit} className="btn btn-secondary inline-flex h-11 items-center rounded-[6px] px-5 text-[12px]">Pick another game</button>
      </div>
    </div>
  );
}

function useTicker(running: boolean) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, [running]);
  return now;
}

const fmt = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;

// ---------------------------------------------------------------------------
// Match Up: tap a term, then its meaning. Wrong matches add 3 seconds.
// ---------------------------------------------------------------------------
export function MatchGame({ pairs, source, onExit }: { pairs: Pair[]; source: string; onExit: () => void }) {
  const [round, setRound] = useState(0);
  const set = useMemo(() => shuffle(pairs).slice(0, 6), [pairs, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const answers = useMemo(() => shuffle(set.map((p, i) => ({ i, text: p.answer }))), [set]);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [penalty, setPenalty] = useState(0);
  const [start, setStart] = useState(Date.now());
  const [result, setResult] = useState<{ ms: number; best: boolean } | null>(null);
  const now = useTicker(!result);

  function choose(i: number) {
    if (picked === null || done.includes(i)) return;
    if (i === picked) {
      const next = [...done, i];
      setDone(next);
      setPicked(null);
      if (next.length === set.length) {
        const ms = Date.now() - start + penalty;
        countActivity();
        setResult({ ms, best: saveBest("match", source, Math.round(ms / 100), true) });
      }
    } else {
      setWrong(i);
      setPenalty((p) => p + 3000);
      setTimeout(() => setWrong(null), 450);
    }
  }

  if (result) {
    return (
      <GameOver
        title={fmt(result.ms)}
        line={`You matched all ${set.length} pairs${penalty ? `, with ${penalty / 1000}s of penalties` : ""}.`}
        isBest={result.best}
        onAgain={() => {
          setRound((r) => r + 1);
          setDone([]);
          setPicked(null);
          setPenalty(0);
          setStart(Date.now());
          setResult(null);
        }}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between font-mono text-[12px] tracking-[0.08em] text-muted-foreground uppercase">
        <span>{done.length}/{set.length} matched</span>
        <span>{fmt(now - start + penalty)}</span>
      </div>
      <p className="text-body text-muted-foreground">Tap a term on the left, then its meaning on the right.</p>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="grid content-start gap-2">
          {set.map((p, i) => (
            <button key={p.prompt} type="button" disabled={done.includes(i)} onClick={() => setPicked(i)} className={`game-tile ${picked === i ? "is-picked" : ""} ${done.includes(i) ? "is-done" : ""}`}>
              {p.prompt}
            </button>
          ))}
        </div>
        <div className="grid content-start gap-2">
          {answers.map((a) => (
            <button key={a.text} type="button" disabled={done.includes(a.i)} onClick={() => choose(a.i)} className={`game-tile is-answer ${done.includes(a.i) ? "is-done" : ""} ${wrong === a.i ? "is-wrong" : ""}`}>
              {a.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick Fire: true or false, 60 seconds.
// ---------------------------------------------------------------------------
export function QuickFireGame({ pairs, source, onExit }: { pairs: Pair[]; source: string; onExit: () => void }) {
  const [round, setRound] = useState(0);
  const items = useMemo(() => quickFireRound(pairs, 80), [pairs, round]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [flash, setFlash] = useState<{ ok: boolean; answer: string } | null>(null);
  const [endsAt, setEndsAt] = useState(Date.now() + 60_000);
  const [result, setResult] = useState<{ best: boolean } | null>(null);
  const now = useTicker(!result);
  const left = Math.max(0, endsAt - now);

  useEffect(() => {
    if (!result && left === 0) {
      countActivity();
      setResult({ best: saveBest("quickfire", source, score, false) });
    }
  }, [left, result, score, source]);

  function answer(saidTrue: boolean) {
    const it = items[i % items.length];
    const ok = saidTrue === it.isTrue;
    setScore((s) => s + (ok ? 1 : 0));
    setStreak((s) => {
      const n = ok ? s + 1 : 0;
      setBest((b) => Math.max(b, n));
      return n;
    });
    setFlash({ ok, answer: it.answer });
    setTimeout(() => setFlash(null), ok ? 250 : 900);
    setI((n) => n + 1);
  }

  if (result) {
    return (
      <GameOver
        title={`${score} right`}
        line={`Best streak: ${best} in a row.`}
        isBest={result.best}
        onAgain={() => {
          setRound((r) => r + 1);
          setI(0);
          setScore(0);
          setStreak(0);
          setBest(0);
          setEndsAt(Date.now() + 60_000);
          setResult(null);
        }}
        onExit={onExit}
      />
    );
  }

  const it = items[i % items.length];
  return (
    <div className="space-y-4">
      <div className="flex justify-between font-mono text-[12px] tracking-[0.08em] text-muted-foreground uppercase">
        <span>Score {score} · streak {streak}</span>
        <span className={left < 10_000 ? "text-destructive" : ""}>{fmt(left)}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className="h-full bg-brand" style={{ width: `${(left / 60_000) * 100}%` }} />
      </div>
      <div className={`surface grid min-h-[200px] content-center gap-3 p-6 text-center ${flash ? (flash.ok ? "flash-ok" : "flash-bad") : ""}`}>
        <p className="text-[20px] font-semibold leading-snug">{it.prompt}</p>
        <p className="text-body-lg text-muted-foreground">→ {it.shown}</p>
        {flash && !flash.ok && <p role="status" className="text-label text-destructive">Not quite: {flash.answer}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => answer(true)} className="btn game-big is-true">True</button>
        <button type="button" onClick={() => answer(false)} className="btn game-big is-false">False</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Memory Flip: find the question-answer pairs.
// ---------------------------------------------------------------------------
export function MemoryGame({ pairs, source, onExit }: { pairs: Pair[]; source: string; onExit: () => void }) {
  const [round, setRound] = useState(0);
  const deck = useMemo(() => memoryDeck(pairs, Math.min(6, pairs.length)), [pairs, round]);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [result, setResult] = useState<{ best: boolean } | null>(null);
  const lock = useRef(false);

  function flip(id: number) {
    if (lock.current || open.includes(id) || found.includes(deck[id].pair)) return;
    const next = [...open, id];
    setOpen(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = next.map((x) => deck[x]);
    if (a.pair === b.pair) {
      const f = [...found, a.pair];
      setFound(f);
      setOpen([]);
      if (f.length * 2 === deck.length) {
        countActivity();
        setResult({ best: saveBest("memory", source, moves + 1, true) });
      }
    } else {
      lock.current = true;
      setTimeout(() => {
        setOpen([]);
        lock.current = false;
      }, 1000);
    }
  }

  if (result) {
    return (
      <GameOver
        title={`${moves} moves`}
        line={`You found all ${deck.length / 2} pairs.`}
        isBest={result.best}
        onAgain={() => {
          setRound((r) => r + 1);
          setOpen([]);
          setFound([]);
          setMoves(0);
          setResult(null);
        }}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between font-mono text-[12px] tracking-[0.08em] text-muted-foreground uppercase">
        <span>{found.length}/{deck.length / 2} pairs</span>
        <span>{moves} moves</span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
        {deck.map((c) => {
          const shown = open.includes(c.id) || found.includes(c.pair);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => flip(c.id)}
              aria-label={shown ? c.text : "Hidden card"}
              className={`memory-card ${shown ? "is-shown" : ""} ${found.includes(c.pair) ? "is-found" : ""} ${c.side === "answer" ? "is-answer" : ""}`}
            >
              <span className="memory-face">{shown ? c.text : "?"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Word Scramble: unscramble key terms from the clue.
// ---------------------------------------------------------------------------
export function ScrambleGame({ pairs, keyTerms, source, onExit }: { pairs: Pair[]; keyTerms: KeyTerm[]; source: string; onExit: () => void }) {
  const [round, setRound] = useState(0);
  const words = useMemo(() => shuffle(scrambleWords(pairs, keyTerms)).slice(0, 8).map((w) => ({ ...w, mixed: scramble(w.word) })), [pairs, keyTerms, round]);
  const [i, setI] = useState(0);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [reveal, setReveal] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const [miss, setMiss] = useState(false);
  const [result, setResult] = useState<{ best: boolean } | null>(null);

  if (words.length < 3) {
    return (
      <div className="surface space-y-3 p-6">
        <p className="text-body-lg">These notes don&apos;t have enough single-word key terms for Word Scramble.</p>
        <button type="button" onClick={onExit} className="btn btn-secondary inline-flex h-11 items-center rounded-[6px] px-5 text-[12px]">Pick another game</button>
      </div>
    );
  }

  function next(gotIt: boolean) {
    const s = score + (gotIt ? 1 : 0);
    setScore(s);
    setGuess("");
    setHint(false);
    setMiss(false);
    setReveal(null);
    if (i + 1 >= words.length) {
      countActivity();
      setResult({ best: saveBest("scramble", source, s, false) });
    } else setI(i + 1);
  }

  if (result) {
    return (
      <GameOver
        title={`${score}/${words.length}`}
        line="words unscrambled"
        isBest={result.best}
        onAgain={() => {
          setRound((r) => r + 1);
          setI(0);
          setScore(0);
          setResult(null);
        }}
        onExit={onExit}
      />
    );
  }

  const w = words[i];
  return (
    <div className="space-y-4">
      <div className="flex justify-between font-mono text-[12px] tracking-[0.08em] text-muted-foreground uppercase">
        <span>Word {i + 1} of {words.length}</span>
        <span>Score {score}</span>
      </div>
      <div className="surface grid gap-4 p-6 text-center">
        <div className="flex flex-wrap justify-center gap-1.5" aria-label={`Scrambled letters: ${w.mixed.split("").join(" ")}`}>
          {w.mixed.split("").map((ch, k) => (
            <span key={k} className="scramble-tile" aria-hidden>{ch}</span>
          ))}
        </div>
        <p className="text-body-lg text-muted-foreground">Clue: {w.clue}</p>
        {hint && <p className="text-label">Starts with <strong>{w.word[0].toUpperCase()}</strong></p>}
        {reveal && <p role="status" className="text-body">It was <strong>{reveal}</strong>.</p>}
        {miss && !reveal && <p role="status" className="text-label text-destructive">Not quite. Try again, or take a hint.</p>}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (reveal) return next(false);
          if (sameWord(guess, w.word)) next(true);
          else setMiss(true);
        }}
        className="flex gap-2"
      >
        <label htmlFor="scramble-guess" className="sr-only">Your answer</label>
        <input id="scramble-guess" value={guess} onChange={(e) => setGuess(e.target.value)} autoComplete="off" autoCapitalize="none" placeholder="Type the word" className="h-12 min-w-0 flex-1 rounded-[8px] border border-input bg-surface px-4 text-body-lg" />
        <button type="submit" className="btn btn-brand inline-flex h-12 items-center rounded-[6px] px-5 text-[12px]">{reveal ? "Next" : "Check"}</button>
      </form>
      <div className="flex gap-3">
        <button type="button" disabled={hint || Boolean(reveal)} onClick={() => setHint(true)} className="text-label text-muted-foreground underline underline-offset-4 disabled:opacity-40">Hint</button>
        <button type="button" disabled={Boolean(reveal)} onClick={() => setReveal(w.word)} className="text-label text-muted-foreground underline underline-offset-4 disabled:opacity-40">Show answer</button>
      </div>
    </div>
  );
}
