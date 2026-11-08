"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RajChat } from "@/components/raj-chat";
import { Badge, Button, Card, Section } from "@/components/ui";
import { api, getPlayerId } from "@/lib/player";
import { refreshProfiles } from "@/lib/use-profile";
import type { Flashcard, StudyNotes, StudySet } from "@/lib/types";

type PublicSet = Omit<StudySet, "ownerId" | "material">;
type Tab = "notes" | "flashcards" | "raj";
const TABS: { id: Tab; label: string }[] = [
  { id: "notes", label: "Notes" },
  { id: "flashcards", label: "Flashcards" },
  { id: "raj", label: "Ask Raj" },
];

export function notesToMarkdown(title: string, notes: StudyNotes): string {
  const out = [`# ${title}`, "", notes.summary, ""];
  for (const s of notes.sections) {
    out.push(`## ${s.heading}`, "", ...s.points.map((p) => `- ${p}`), "");
  }
  if (notes.keyTerms.length) {
    out.push("## Key terms", "", ...notes.keyTerms.map((k) => `- **${k.term}**: ${k.definition}`), "");
  }
  return out.join("\n");
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function StudySetView({ set, ownerHash }: { set: PublicSet; ownerHash: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("notes");
  const [isOwner, setIsOwner] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    void sha256Hex(getPlayerId()).then((h) => setIsOwner(h === ownerHash)).catch(() => undefined);
    const hash = window.location.hash.slice(1);
    if (hash === "flashcards" || hash === "raj") setTab(hash);
  }, [ownerHash]);

  function flash(msg: string) {
    setCopied(msg);
    setTimeout(() => setCopied(null), 2000);
  }

  async function copy(text: string, msg: string) {
    try {
      await navigator.clipboard.writeText(text);
      flash(msg);
    } catch {
      window.prompt("Copy:", text);
    }
  }

  function download() {
    const blob = new Blob([notesToMarkdown(set.title, set.notes)], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${set.title.replace(/[^\w\s-]/g, "").trim() || "notes"}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function remove() {
    if (!confirm("Delete this study set? This can't be undone.")) return;
    await api(`/api/study/${set.id}`, { method: "DELETE", body: { playerId: getPlayerId() } });
    router.push("/study");
  }

  return (
    <Section
      title={set.title}
      aside={
        <div className="space-y-5 pt-1">
          <div className="flex flex-wrap gap-2">
            <Badge>{set.source === "claude" ? "Written by Claude" : "Auto-generated"}</Badge>
            <Badge>{set.flashcards.length} flashcards</Badge>
            <Badge>{set.notes.keyTerms.length} key terms</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="brand" onClick={() => router.push(`/?study=${set.id}#start`)}>
              Quiz a friend on this
            </Button>
            <Button variant="secondary" onClick={() => copy(window.location.href.split("#")[0], "Link copied")}>
              {copied === "Link copied" ? "Link copied!" : "Share"}
            </Button>
            {isOwner && (
              <Button variant="ghost" onClick={remove}>
                Delete
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div role="tablist" className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => {
                setTab(t.id);
                history.replaceState(null, "", t.id === "notes" ? window.location.pathname : `#${t.id}`);
              }}
              className={`rounded-full px-4 py-2 text-body-lg transition ${
                tab === t.id ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "notes" ? (
          <NotesView
            set={set}
            onCopy={() => copy(notesToMarkdown(set.title, set.notes), "Notes copied")}
            copied={copied === "Notes copied"}
            onDownload={download}
          />
        ) : tab === "flashcards" ? (
          <FlashcardsView setId={set.id} cards={set.flashcards} />
        ) : (
          <RajChat setId={set.id} setTitle={set.title} />
        )}
      </div>
    </Section>
  );
}

function NotesView({
  set,
  onCopy,
  copied,
  onDownload,
}: {
  set: PublicSet;
  onCopy: () => void;
  copied: boolean;
  onDownload: () => void;
}) {
  const { notes } = set;
  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-title font-semibold">Summary</h2>
          <div className="flex gap-1">
            <Button variant="ghost" onClick={onCopy}>
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button variant="ghost" onClick={onDownload}>
              Download .md
            </Button>
          </div>
        </div>
        <p className="text-body-lg leading-relaxed">{notes.summary}</p>
      </Card>

      {notes.sections.map((s, i) => (
        <Card key={i} className="space-y-2">
          <h3 className="text-title font-semibold">{s.heading}</h3>
          <ul className="space-y-1.5">
            {s.points.map((p, j) => (
              <li key={j} className="flex gap-3 text-body-lg leading-relaxed">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      {notes.keyTerms.length > 0 && (
        <Card className="space-y-3">
          <h3 className="text-title font-semibold">Key terms</h3>
          <dl className="divide-y divide-surface-border">
            {notes.keyTerms.map((k, i) => (
              <div key={i} className="grid gap-1 py-2.5 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,12rem)_1fr] sm:gap-4">
                <dt className="text-body font-semibold">{k.term}</dt>
                <dd className="text-body text-muted-foreground">{k.definition}</dd>
              </div>
            ))}
          </dl>
        </Card>
      )}
    </div>
  );
}

type Progress = Record<number, "known" | "learning">;

function loadProgress(setId: string): Progress {
  try {
    return JSON.parse(localStorage.getItem(`quiz-duel:cards:${setId}`) ?? "{}") as Progress;
  } catch {
    return {};
  }
}
function saveProgress(setId: string, p: Progress) {
  try {
    localStorage.setItem(`quiz-duel:cards:${setId}`, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

function FlashcardsView({ setId, cards }: { setId: string; cards: Flashcard[] }) {
  const [progress, setProgress] = useState<Progress>({});
  const [order, setOrder] = useState<number[]>(() => cards.map((_, i) => i));
  const [onlyLearning, setOnlyLearning] = useState(false);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => setProgress(loadProgress(setId)), [setId]);

  const deck = useMemo(
    () => (onlyLearning ? order.filter((i) => progress[i] !== "known") : order),
    // Freeze the filtered deck while reviewing so marking a card doesn't reshuffle under you.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [order, onlyLearning],
  );
  const cardIndex = deck[Math.min(pos, deck.length - 1)];
  const card = cardIndex === undefined ? undefined : cards[cardIndex];
  const known = Object.values(progress).filter((v) => v === "known").length;
  const done = pos >= deck.length;

  const go = useCallback(
    (delta: number) => {
      setFlipped(false);
      setPos((p) => Math.max(0, Math.min(deck.length, p + delta)));
    },
    [deck.length],
  );

  const recorded = useRef(false);
  const mark = useCallback(
    (value: "known" | "learning") => {
      if (cardIndex === undefined) return;
      if (!recorded.current) {
        recorded.current = true;
        // Reviewing flashcards counts toward the study streak.
        void api("/api/activity", { body: { playerId: getPlayerId() } }).then(refreshProfiles).catch(() => undefined);
      }
      setProgress((prev) => {
        const next = { ...prev, [cardIndex]: value };
        saveProgress(setId, next);
        return next;
      });
      go(1);
    },
    [cardIndex, go, setId],
  );

  function restart(opts: { shuffle?: boolean; onlyLearning?: boolean }) {
    if (opts.shuffle) {
      const a = cards.map((_, i) => i);
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      setOrder(a);
    }
    if (opts.onlyLearning !== undefined) setOnlyLearning(opts.onlyLearning);
    setPos(0);
    setFlipped(false);
  }

  function reset() {
    setProgress({});
    saveProgress(setId, {});
    restart({ onlyLearning: false });
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (flipped && e.key === "1") mark("learning");
      else if (flipped && e.key === "2") mark("known");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, flipped, go, mark]);

  if (cards.length === 0) {
    return <Card className="text-body text-muted-foreground">No flashcards were made from this material.</Card>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-label text-muted-foreground">
        <span>
          {done ? deck.length : pos + 1} / {deck.length}
          {onlyLearning && " still learning"} · <span className="text-success">{known} known</span>
        </span>
        <span className="flex gap-1">
          <Button variant="ghost" onClick={() => restart({ shuffle: true })}>
            Shuffle
          </Button>
          <Button variant="ghost" onClick={reset}>
            Reset progress
          </Button>
        </span>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className="h-full rounded-full bg-success transition-[width]" style={{ width: `${(known / cards.length) * 100}%` }} />
      </div>

      {done ? (
        <Card className="animate-pop space-y-3 text-center">
          <h2 className="text-title-lg font-semibold">
            {known === cards.length ? "You know every card! 🎉" : "Round complete"}
          </h2>
          <p className="text-body text-muted-foreground">
            {known} of {cards.length} cards marked as known.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {known < cards.length && (
              <Button variant="brand" onClick={() => restart({ onlyLearning: true, shuffle: true })}>
                Review {cards.length - known} still learning
              </Button>
            )}
            <Button variant="secondary" onClick={() => restart({ onlyLearning: false })}>
              Go through all cards
            </Button>
          </div>
        </Card>
      ) : (
        card && (
          <>
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              aria-label={flipped ? "Show question" : "Show answer"}
              className="block w-full [perspective:1200px]"
            >
              <div
                className={`relative grid min-h-72 transition-transform duration-300 [transform-style:preserve-3d] ${
                  flipped ? "[transform:rotateY(180deg)]" : ""
                }`}
              >
                <div className="surface col-start-1 row-start-1 flex flex-col items-center justify-center gap-3 p-8 [backface-visibility:hidden]">
                  <span className="text-micro font-medium tracking-wide text-muted-foreground uppercase">Question</span>
                  <p className="text-[24px] leading-[32px] font-bold tracking-tight sm:text-[28px] sm:leading-[36px]">{card.front}</p>
                  <span className="text-caption text-faint-foreground">Click or press Space to flip</span>
                </div>
                <div className="surface col-start-1 row-start-1 flex flex-col items-center justify-center gap-3 p-8 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <span className="text-micro font-medium tracking-wide text-brand uppercase">Answer</span>
                  <p className="text-title-lg font-medium leading-snug">{card.back}</p>
                </div>
              </div>
            </button>

            <div className="flex items-center justify-between gap-2">
              <Button variant="ghost" onClick={() => go(-1)} disabled={pos === 0}>
                ← Prev
              </Button>
              {flipped ? (
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => mark("learning")}>
                    Still learning
                  </Button>
                  <Button variant="brand" onClick={() => mark("known")}>
                    Know it
                  </Button>
                </div>
              ) : (
                <Button variant="secondary" onClick={() => setFlipped(true)}>
                  Show answer
                </Button>
              )}
              <Button variant="ghost" onClick={() => go(1)}>
                Next →
              </Button>
            </div>
            <p className="text-center text-caption text-faint-foreground">
              Keys: Space flips · ← → move · after flipping, 1 = still learning, 2 = know it
            </p>
          </>
        )
      )}
    </div>
  );
}
