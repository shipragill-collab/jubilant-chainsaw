"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { getPlayerId } from "@/lib/player";
import { Button, ErrorText, Spinner } from "./ui";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS_WITH_SET = ["Start practice", "Explain the key ideas simply", "What should I focus on?"];
const SUGGESTIONS_NO_SET = ["How should I revise for an exam?", "Teach me active recall", "Help me make a revision plan"];

/** Tiny, safe markdown: **bold**, _italic_, "- " bullets and paragraphs. No raw HTML. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (/^_[^_]+_$/.test(part)) return <em key={i} className="text-muted-foreground">{part.slice(1, -1)}</em>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function RichText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((l) => /^\s*([-*•]|\d+\.)\s+/.test(l))) {
          return (
            <ul key={i} className="space-y-1.5">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-2.5">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand" />
                  <span>{inline(l.replace(/^\s*([-*•]|\d+\.)\s+/, ""))}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {inline(l)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export type RajMood = "happy" | "thinking" | "celebrate" | "encourage";

/**
 * Raj: a friendly rounded-square tutor with a little graduation tassel and
 * eyebrows/mouth that change with the conversation.
 */
export function RajAvatar({ size = "md", mood = "happy" }: { size?: "md" | "lg"; mood?: RajMood }) {
  const px = size === "lg" ? 72 : 36;
  const brows: Record<RajMood, string> = {
    happy: "M30 36 Q36 32 42 36 M58 36 Q64 32 70 36",
    thinking: "M30 34 L42 37 M58 33 Q64 29 70 33",
    celebrate: "M30 33 Q36 27 42 33 M58 33 Q64 27 70 33",
    encourage: "M30 37 Q36 34 42 35 M58 35 Q64 34 70 37",
  };
  const mouth: Record<RajMood, React.ReactNode> = {
    happy: <path d="M38 64 Q50 74 62 64" fill="none" stroke="#3a0d0b" strokeWidth="4" strokeLinecap="round" />,
    thinking: <path d="M42 67 Q50 64 58 67" fill="none" stroke="#3a0d0b" strokeWidth="4" strokeLinecap="round" />,
    celebrate: <path d="M36 61 Q50 80 64 61 Z" fill="#3a0d0b" />,
    encourage: <path d="M40 65 Q50 71 60 65" fill="none" stroke="#3a0d0b" strokeWidth="4" strokeLinecap="round" />,
  };
  return (
    <svg viewBox="0 0 100 100" width={px} height={px} aria-hidden className={`shrink-0 ${mood === "celebrate" ? "animate-pop" : ""}`}>
      <rect x="8" y="12" width="84" height="80" rx="28" fill="#e1342f" />
      <rect x="8" y="12" width="84" height="40" rx="28" fill="#fff" opacity="0.08" />
      {/* tassel */}
      <path d="M50 12 L50 4 L66 4" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" />
      <circle cx="68" cy="5" r="4" fill="#f2c230" />
      {/* eyes */}
      <circle cx="36" cy="48" r={mood === "celebrate" ? 6 : 8} fill="#fff" />
      <circle cx="64" cy="48" r={mood === "celebrate" ? 6 : 8} fill="#fff" />
      <circle cx={mood === "thinking" ? 39 : 37} cy={mood === "thinking" ? 45 : 49} r="4" fill="#111" />
      <circle cx={mood === "thinking" ? 67 : 65} cy={mood === "thinking" ? 45 : 49} r="4" fill="#111" />
      <path d={brows[mood]} fill="none" stroke="#3a0d0b" strokeWidth="3.5" strokeLinecap="round" />
      {mouth[mood]}
      <circle cx="24" cy="62" r="5" fill="#ff8a80" opacity="0.6" />
      <circle cx="76" cy="62" r="5" fill="#ff8a80" opacity="0.6" />
    </svg>
  );
}

/** Split an assistant message into its text and any trailing <choices>…</choices>. */
export function parseChoices(content: string): { text: string; choices: string[] } {
  const m = content.match(/<choices>([\s\S]*?)<\/choices>\s*$/);
  if (m) {
    return {
      text: content.slice(0, m.index).trim(),
      choices: m[1].split("|").map((c) => c.trim()).filter(Boolean).slice(0, 5),
    };
  }
  // While streaming, hide a half-written tag ("<cho…" or "<choices>A | B…").
  const lt = content.lastIndexOf("<");
  const tail = lt >= 0 ? content.slice(lt) : "";
  const partial = tail.startsWith("<choices") || "<choices>".startsWith(tail);
  return { text: (lt >= 0 && partial ? content.slice(0, lt) : content).trim(), choices: [] };
}

const isVerdict = (t: string, kind: "right" | "wrong") => (kind === "right" ? /^\s*\*\*Correct/ : /^\s*\*\*Not quite/).test(t);

/** Consecutive correct answers, counting back from the latest verdict. */
export function streakOf(messages: { role: string; content: string }[]): { streak: number; correct: number } {
  let streak = 0;
  let correct = 0;
  let broken = false;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "assistant") continue;
    if (isVerdict(m.content, "right")) {
      correct++;
      if (!broken) streak++;
    } else if (isVerdict(m.content, "wrong")) broken = true;
  }
  return { streak, correct };
}

function Flame() {
  return (
    <svg viewBox="0 0 20 24" width="14" height="17" aria-hidden>
      <path d="M10 1 C12 6 18 9 18 15 A8 8 0 0 1 2 15 C2 11 5 9 6 6 C7 9 9 10 9 10 C9 6 8 4 10 1 Z" fill="#ff7a1a" />
      <path d="M10 11 C11 13 14 14 14 17 A4 4 0 0 1 6 17 C6 15 8 14 10 11 Z" fill="#ffd54f" />
    </svg>
  );
}

export function RajChat({ setId, setTitle }: { setId: string | null; setTitle?: string }) {
  const storageKey = `quiz-duel:raj:${setId ?? "general"}`;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);

  // Restore this conversation (per study set) from the browser.
  useEffect(() => {
    abort.current?.abort();
    try {
      setMessages(JSON.parse(localStorage.getItem(storageKey) ?? "[]") as Msg[]);
    } catch {
      setMessages([]);
    }
    setError(null);
  }, [storageKey]);

  useEffect(() => {
    if (busy) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages.slice(-40)));
    } catch {
      /* ignore */
    }
  }, [messages, busy, storageKey]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const history: Msg[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    setError(null);
    const ctrl = new AbortController();
    abort.current = ctrl;
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history, setId, playerId: getPlayerId() }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Raj couldn't answer just now.");
      }
      setMode(res.headers.get("x-raj-mode"));
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: reply }]);
      }
      if (!reply.trim()) throw new Error("Raj didn't say anything. Try again?");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError((err as Error).message);
      setMessages(history.slice(0, -1));
      setInput(content);
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    abort.current?.abort();
    setMessages([]);
    setError(null);
  }

  const suggestions = setId ? SUGGESTIONS_WITH_SET : SUGGESTIONS_NO_SET;
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const { streak, correct } = streakOf(messages);
  const mood: RajMood = busy
    ? "thinking"
    : lastAssistant && isVerdict(lastAssistant.content, "right")
      ? "celebrate"
      : lastAssistant && isVerdict(lastAssistant.content, "wrong")
        ? "encourage"
        : "happy";
  const lastParsed = lastAssistant ? parseChoices(lastAssistant.content) : null;
  const awaitingAnswer = Boolean(lastParsed?.choices.length && /\?\**\s*$|Flashcard \d+/.test(lastParsed.text));

  return (
    <div className="surface flex h-[min(680px,75dvh)] flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-surface-border px-5 py-3">
        <RajAvatar mood={mood} />
        <div className="min-w-0 flex-1">
          <p className="text-body font-semibold">Raj</p>
          <p className="truncate text-caption text-muted-foreground">
            {setTitle ? `Tutoring you on “${setTitle}”` : "Your AI study tutor"}
            {mode === "offline" && " · offline mode"}
          </p>
        </div>
        {correct > 0 && (
          <span className="flex items-center gap-3 text-label text-muted-foreground" aria-label={`Streak ${streak}, ${correct} correct`}>
            <span className={`flex items-center gap-1 font-semibold ${streak > 0 ? "text-foreground" : ""}`}>
              <Flame /> {streak}
            </span>
            <span className="hidden sm:inline">{correct} correct</span>
          </span>
        )}
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clear}>
            New chat
          </Button>
        )}
      </div>

      <div ref={scroller} className="flex-1 space-y-5 overflow-y-auto px-5 py-6" aria-live="polite">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
            <RajAvatar size="lg" />
            <div className="space-y-1">
              <p className="text-title-lg font-semibold">Hi, I&apos;m Raj</p>
              <p className="mx-auto max-w-sm text-body text-muted-foreground">
                {setId
                  ? "I've read your material. Let's practise it together: one question at a time, with hints when you need them."
                  : "Ask me about anything you're studying. Pick a study set and we'll practise your own material together."}
              </p>
            </div>
            <div className="flex max-w-lg flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <Button key={s} variant="secondary" size="sm" onClick={() => send(s)}>
                  {s}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] rounded-3xl rounded-br-md bg-primary px-4 py-2.5 text-body-lg whitespace-pre-wrap text-primary-foreground">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={i} className="flex gap-3">
                <RajAvatar mood={i === messages.length - 1 ? mood : "happy"} />
                <div className="max-w-[85%] pt-1.5 text-body-lg leading-relaxed">
                  {m.content ? (
                    (() => {
                      const { text, choices } = parseChoices(m.content);
                      const live = i === messages.length - 1 && !busy;
                      return (
                        <>
                          <RichText text={text} />
                          {choices.length > 0 && (
                            <div className={`mt-4 grid gap-2 ${live ? "" : "opacity-50"}`}>
                              {choices.map((c) => (
                                <button
                                  key={c}
                                  disabled={!live}
                                  onClick={() => send(c)}
                                  className="rounded-2xl border border-input bg-surface px-4 py-2.5 text-left text-body-lg transition enabled:hover:border-foreground enabled:hover:bg-surface-hover"
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Spinner /> Raj is thinking…
                    </span>
                  )}
                </div>
              </div>
            ),
          )
        )}
      </div>

      {error && (
        <p className="px-5 pb-2 text-label text-destructive">
          <ErrorText message={error} />
        </p>
      )}
      {messages.length > 0 && !busy && (
        <div className="flex gap-2 overflow-x-auto px-5 pb-2">
          {(awaitingAnswer ? ["Give me a hint", "Skip"] : setId ? ["Start practice", "Explain that more simply"] : ["Explain that more simply", "Give me an example"]).map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="shrink-0 rounded-full border border-surface-border px-3 py-1 text-label text-muted-foreground hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="flex items-end gap-2 border-t border-surface-border p-3"
      >
        <textarea
          aria-label="Message Raj"
          value={input}
          rows={1}
          maxLength={4000}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          placeholder="Ask Raj anything…"
          className="max-h-40 min-h-11 flex-1 resize-none rounded-3xl bg-muted px-4 py-2.5 text-body-lg outline-none placeholder:text-faint-foreground focus:ring-2 focus:ring-ring/20"
        />
        <Button type="submit" variant="brand" disabled={busy || !input.trim()} className="h-11">
          {busy ? <Spinner /> : "Send"}
        </Button>
      </form>
    </div>
  );
}
