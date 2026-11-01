"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { Button, Spinner } from "./ui";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS_WITH_SET = ["Explain the key ideas simply", "Quiz me", "What should I focus on?", "Give me an example"];
const SUGGESTIONS_NO_SET = ["How should I study for an exam?", "Explain spaced repetition", "Help me make a revision plan"];

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

export function RajAvatar({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full bg-brand font-extrabold text-brand-foreground ${
        size === "lg" ? "size-16 text-[28px]" : "size-9 text-body"
      }`}
    >
      R
    </span>
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
        body: JSON.stringify({ messages: history, setId }),
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

  return (
    <div className="surface flex h-[min(680px,75dvh)] flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-surface-border px-5 py-3">
        <RajAvatar />
        <div className="min-w-0 flex-1">
          <p className="text-body font-semibold">Raj</p>
          <p className="truncate text-caption text-muted-foreground">
            {setTitle ? `Tutoring you on “${setTitle}”` : "Your AI study tutor"}
            {mode === "offline" && " · offline mode"}
          </p>
        </div>
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
              <p className="text-title-lg font-semibold">Hi, I&apos;m Raj 👋</p>
              <p className="mx-auto max-w-sm text-body text-muted-foreground">
                {setId
                  ? "I've read your material. Ask me anything about it, or let me quiz you."
                  : "Ask me about anything you're studying. Pick a study set and I'll tutor you on your own material."}
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
                <RajAvatar />
                <div className="max-w-[85%] pt-1.5 text-body-lg leading-relaxed">
                  {m.content ? (
                    <RichText text={m.content} />
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

      {error && <p className="px-5 pb-2 text-label text-destructive">{error}</p>}
      {messages.length > 0 && !busy && setId && (
        <div className="flex gap-2 overflow-x-auto px-5 pb-2">
          {["Quiz me", "Explain that more simply", "Give me an example"].map((s) => (
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
