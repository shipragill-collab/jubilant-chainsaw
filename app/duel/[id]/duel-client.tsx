"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Button, Card, Spinner, inputClass } from "@/components/ui";
import { api, getPlayerId, getSavedName, saveName } from "@/lib/player";
import type { DuelView, PlayerAnswer, PublicPlayer } from "@/lib/types";

const TIME_LIMIT_MS = 20_000;
const LETTERS = ["A", "B", "C", "D"];

interface AnswerResult {
  answer: PlayerAnswer;
  correctIndex: number;
  explanation: string | null;
  view: DuelView;
}

export function DuelClient({ id }: { id: string }) {
  const [view, setView] = useState<DuelView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!playerId) return;
    try {
      setView(await api<DuelView>(`/api/duels/${id}?playerId=${encodeURIComponent(playerId)}`));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [id, playerId]);

  useEffect(() => setPlayerId(getPlayerId()), []);
  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Poll while waiting on the opponent (or for a rematch they started).
  const shouldPoll =
    view && (!view.me || view.me.question === null) && (view.status !== "finished" || !view.rematchId);
  useEffect(() => {
    if (!shouldPoll) return;
    const t = setInterval(refresh, 2500);
    return () => clearInterval(t);
  }, [shouldPoll, refresh]);

  if (error && !view) {
    return (
      <Card className="mx-auto my-14 max-w-3xl text-center">
        <p className="text-body text-muted-foreground">{error}</p>
        <Link href="/" className="mt-3 inline-block text-label text-brand hover:underline">
          Create a new duel
        </Link>
      </Card>
    );
  }
  if (!view || !playerId) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
        <Spinner /> Loading duel…
      </div>
    );
  }

  const me = view.me;
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-10 sm:py-14">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {view.rematchOf && <Badge tone="brand">Rematch</Badge>}
          <Badge>{view.source === "claude" ? "Written by Claude" : "Auto-generated"}</Badge>
          <Badge>{view.questionCount} questions</Badge>
        </div>
        <h1 className="display text-[36px] sm:text-[48px]">{view.title}</h1>
      </header>

      {!me ? (
        <JoinCard view={view} playerId={playerId} onJoined={setView} />
      ) : me.question || (me.nextIndex < view.questionCount && !isFinished(view, me.playerId)) ? (
        <Play view={view} playerId={playerId} onView={setView} />
      ) : (
        <Results view={view} playerId={playerId} />
      )}
    </div>
  );
}

const isFinished = (view: DuelView, pid: string) => view.players.find((p) => p.id === pid)?.finished ?? false;

function ShareLink({ compact = false }: { compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.href.split("?")[0]), []);

  async function share() {
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share({ title: "Quiz duel", text: "I challenge you to a quiz duel!", url });
        return;
      } catch {
        /* cancelled: fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <div className={`flex gap-2 ${compact ? "" : "flex-col sm:flex-row"}`}>
      <input readOnly value={url} onFocus={(e) => e.target.select()} className={`${inputClass} h-10 font-mono text-label`} />
      <Button variant="primary" onClick={share} className="shrink-0">
        {copied ? "Copied!" : "Copy link"}
      </Button>
    </div>
  );
}

function JoinCard({ view, playerId, onJoined }: { view: DuelView; playerId: string; onJoined: (v: DuelView) => void }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setName(getSavedName()), []);

  const host = view.players[0];
  const full = view.players.length >= 2;

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    saveName(name);
    try {
      onJoined(await api<DuelView>(`/api/duels/${view.id}/join`, { body: { name, playerId } }));
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  if (full) {
    return (
      <>
        <Card>
          <p className="text-body text-muted-foreground">
            This duel already has two players. You can watch the scoreboard, or start your own duel.
          </p>
        </Card>
        <Scoreboard view={view} playerId={playerId} />
      </>
    );
  }

  return (
    <Card className="animate-pop">
      <form onSubmit={join} className="space-y-4">
        <div>
          <h2 className="text-title font-semibold">
            {host ? `${host.name} challenged you` : "You've been challenged"}
          </h2>
          <p className="text-body text-muted-foreground">
            {view.questionCount} questions, {TIME_LIMIT_MS / 1000} seconds each. Faster correct answers score more.
          </p>
        </div>
        <label className="block space-y-1.5">
          <span className="text-label font-medium">Your name</span>
          <input
            className={`${inputClass} h-12`}
            value={name}
            maxLength={24}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex"
            autoFocus
          />
        </label>
        {error && <p className="text-label text-destructive">{error}</p>}
        <Button type="submit" variant="brand" size="lg" disabled={busy || !name.trim()}>
          {busy ? <Spinner /> : null} Accept challenge
        </Button>
      </form>
    </Card>
  );
}

function Play({ view, playerId, onView }: { view: DuelView; playerId: string; onView: (v: DuelView) => void }) {
  const me = view.me!;
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(me.timeLeftMs ?? TIME_LIMIT_MS);
  const deadline = useRef<number | null>(null);
  const submitting = useRef(false);

  const question = me.question;
  const index = me.nextIndex;
  const opponent = view.players.find((p) => p.id !== playerId);

  const start = useCallback(async () => {
    setBusy(true);
    try {
      onView(await api<DuelView>(`/api/duels/${view.id}/start`, { body: { playerId } }));
    } finally {
      setBusy(false);
    }
  }, [onView, playerId, view.id]);

  const answer = useCallback(
    async (choice: number | null) => {
      if (submitting.current || !question) return;
      submitting.current = true;
      setPicked(choice);
      try {
        const r = await api<AnswerResult>(`/api/duels/${view.id}/answer`, {
          body: { playerId, index, choice },
        });
        setResult(r);
      } catch {
        // Most likely answered in another tab; resync.
        onView(await api<DuelView>(`/api/duels/${view.id}?playerId=${playerId}`));
        submitting.current = false;
      }
    },
    [index, onView, playerId, question, view.id],
  );

  // Countdown, anchored to the server's remaining time for this question.
  useEffect(() => {
    if (!question || result) return;
    deadline.current = Date.now() + (me.timeLeftMs ?? TIME_LIMIT_MS);
    const tick = () => {
      const left = Math.max(0, (deadline.current ?? 0) - Date.now());
      setTimeLeft(left);
      if (left <= 0) void answer(null);
    };
    tick();
    const t = setInterval(tick, 100);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.prompt, index, result]);

  // Keyboard: 1-4 / A-D to answer, Enter to continue.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (result && e.key === "Enter") return next();
      if (!question || result) return;
      const k = e.key.toLowerCase();
      const i = "1234".indexOf(k) >= 0 ? "1234".indexOf(k) : "abcd".indexOf(k);
      if (i >= 0 && i < question.options.length) void answer(i);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function next() {
    if (!result) return;
    const v = result.view;
    setResult(null);
    setPicked(null);
    submitting.current = false;
    onView(v);
    if (v.me && v.me.nextIndex < v.questionCount) void start();
  }

  const score = result ? result.view.me!.answers.reduce((s, a) => s + a.points, 0) : me.answers.reduce((s, a) => s + a.points, 0);

  if (!question) {
    // Joined but this question's clock hasn't started yet.
    return (
      <>
        <Card className="animate-pop space-y-4 text-center">
          <h2 className="text-title-lg font-semibold">{index === 0 ? "Ready?" : "Welcome back"}</h2>
          <p className="text-body text-muted-foreground">
            {index === 0
              ? `${view.questionCount} questions · ${TIME_LIMIT_MS / 1000}s each · up to 150 points per question`
              : `You're on question ${index + 1} of ${view.questionCount}.`}
          </p>
          <Button variant="brand" size="lg" onClick={start} disabled={busy}>
            {busy ? <Spinner /> : null} {index === 0 ? "Start quiz" : "Continue"}
          </Button>
        </Card>
        {view.players.length < 2 && index === 0 && (
          <Card className="space-y-3">
            <div>
              <h3 className="text-title-sm font-semibold">Challenge a friend</h3>
              <p className="text-label text-muted-foreground">
                Send them this link. You can play now — they can play whenever.
              </p>
            </div>
            <ShareLink />
          </Card>
        )}
      </>
    );
  }

  const pct = Math.max(0, Math.min(100, (timeLeft / TIME_LIMIT_MS) * 100));
  const correctIndex = result?.correctIndex;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-label text-muted-foreground">
        <span>
          Question <span className="font-semibold text-foreground">{index + 1}</span> / {view.questionCount}
        </span>
        <span className="flex items-center gap-3">
          {opponent && (
            <span className="hidden sm:inline">
              {opponent.name}: {opponent.finished ? `${opponent.score} pts (done)` : `${opponent.answered}/${view.questionCount}`}
            </span>
          )}
          <span className="font-semibold text-foreground tabular-nums">{score} pts</span>
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div
          className={`h-full rounded-full transition-[width] duration-100 ease-linear ${pct < 25 ? "bg-destructive" : "bg-brand"}`}
          style={{ width: `${result ? 0 : pct}%` }}
        />
      </div>

      <Card key={index} className="animate-pop space-y-5">
        <h2 className="text-title-lg font-semibold leading-snug sm:text-[24px] sm:leading-[32px]">{question.prompt}</h2>
        <div className="grid gap-2">
          {question.options.map((opt, i) => {
            let state = "border-surface-border hover:bg-surface-hover";
            if (result) {
              if (i === correctIndex) state = "border-success bg-success-soft";
              else if (i === picked) state = "border-destructive bg-destructive-soft";
              else state = "border-surface-border opacity-60";
            } else if (i === picked) state = "border-brand bg-brand-soft";
            return (
              <button
                key={i}
                disabled={!!result || picked !== null}
                onClick={() => answer(i)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-body-lg transition ${state}`}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-label font-semibold text-muted-foreground">
                  {LETTERS[i]}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {result && (
          <div className="animate-pop space-y-3 border-t border-surface-border pt-4">
            <p className={`text-body font-semibold ${result.answer.correct ? "text-success" : "text-destructive"}`}>
              {result.answer.correct
                ? `Correct! +${result.answer.points} points`
                : result.answer.choice === null
                  ? "Out of time"
                  : "Not quite"}
            </p>
            {result.explanation && <p className="text-label text-muted-foreground">{result.explanation}</p>}
            <Button variant="primary" onClick={next} autoFocus>
              {index + 1 >= view.questionCount ? "See results" : "Next question"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function Scoreboard({ view, playerId }: { view: DuelView; playerId: string }) {
  const slots: (PublicPlayer | null)[] = [view.players[0] ?? null, view.players[1] ?? null];
  return (
    <div className="grid grid-cols-2 gap-3">
      {slots.map((p, i) => {
        const winner = view.status === "finished" && p && view.winnerId === p.id;
        return (
          <div
            key={p?.id ?? i}
            className={`surface p-4 ${winner ? "ring-2 ring-brand" : ""}`}
          >
            {p ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-label font-medium">
                    {p.name}
                    {p.id === playerId && <span className="text-muted-foreground"> (you)</span>}
                  </span>
                  {winner && <Badge tone="brand">Winner</Badge>}
                </div>
                <div className="mt-1 text-display font-semibold tabular-nums">{p.score}</div>
                <div className="text-caption text-muted-foreground">
                  {p.finished
                    ? `${p.correct}/${view.questionCount} correct · ${(p.totalTimeMs / 1000).toFixed(1)}s`
                    : p.answered > 0
                      ? `Playing… ${p.answered}/${view.questionCount}`
                      : "Hasn't started"}
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-20 flex-col justify-center text-label text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Spinner /> Waiting for opponent
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Results({ view, playerId }: { view: DuelView; playerId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const me = view.players.find((p) => p.id === playerId);
  const opponent = view.players.find((p) => p.id !== playerId);
  const done = view.status === "finished";

  let headline = "Nice work!";
  let sub = opponent ? `Waiting for ${opponent.name} to finish…` : "Waiting for your friend to play.";
  if (done) {
    if (view.winnerId === null) {
      headline = "It's a tie!";
      sub = "Same score. Rematch to settle it.";
    } else if (view.winnerId === playerId) {
      headline = "You win! 🏆";
      sub = `You beat ${opponent?.name} by ${(me?.score ?? 0) - (opponent?.score ?? 0)} points.`;
    } else {
      headline = `${opponent?.name} wins`;
      sub = `They won by ${(opponent?.score ?? 0) - (me?.score ?? 0)} points. Want a rematch?`;
    }
  }

  async function rematch() {
    if (view.rematchId) return router.push(`/duel/${view.rematchId}`);
    setBusy(true);
    setError(null);
    try {
      const { id } = await api<{ id: string }>(`/api/duels/${view.id}/rematch`, { body: { playerId } });
      router.push(`/duel/${id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="animate-pop space-y-1 text-center">
        <h2 className="text-display-sm font-semibold">{headline}</h2>
        <p className="text-body text-muted-foreground">{sub}</p>
      </Card>

      <Scoreboard view={view} playerId={playerId} />

      {!opponent && (
        <Card className="space-y-3">
          <p className="text-label text-muted-foreground">Send this link to your friend so they can play the same quiz:</p>
          <ShareLink />
        </Card>
      )}

      {done && (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="brand" size="lg" onClick={rematch} disabled={busy}>
            {busy ? (
              <>
                <Spinner /> Writing new questions…
              </>
            ) : view.rematchId ? (
              "Join rematch"
            ) : (
              "Rematch"
            )}
          </Button>
          <Button variant="secondary" size="lg" onClick={() => router.push("/leaderboard")}>
            Leaderboard
          </Button>
          <Button variant="ghost" size="lg" onClick={() => router.push("/")}>
            New notes
          </Button>
          {view.rematchId && !busy && (
            <span className="text-label text-brand">{opponent?.name ?? "Your opponent"} started a rematch.</span>
          )}
          {error && <p className="w-full text-label text-destructive">{error}</p>}
        </div>
      )}

      {view.review && <Review view={view} />}
    </div>
  );
}

function Review({ view }: { view: DuelView }) {
  const answers = view.me?.answers ?? [];
  return (
    <section className="space-y-3">
      <h3 className="text-title-sm font-semibold">Your answers</h3>
      <ol className="space-y-2">
        {view.review!.map((q, i) => {
          const a = answers[i];
          return (
            <li key={i} className="surface space-y-1 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-body font-medium">
                  {i + 1}. {q.prompt}
                </p>
                <span className={`shrink-0 text-label font-semibold ${a?.correct ? "text-success" : "text-destructive"}`}>
                  {a?.correct ? `+${a.points}` : a?.choice === null ? "Timed out" : "✗"}
                </span>
              </div>
              <p className="text-label text-muted-foreground">
                Answer: <span className="text-foreground">{q.options[q.answerIndex]}</span>
                {a && !a.correct && a.choice !== null && <> · You said: {q.options[a.choice]}</>}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
