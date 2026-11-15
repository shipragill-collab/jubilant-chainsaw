"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { paletteFor } from "@/components/gallery";
import { MatchGame, MemoryGame, QuickFireGame, ScrambleGame, loadBest } from "@/components/note-games";
import { Section } from "@/components/ui";
import { GAMES, pairsFrom, type GameId, type Pair } from "@/lib/games";
import { LIBRARY, packBySlug } from "@/lib/library";
import { api, getPlayerId } from "@/lib/player";
import type { Flashcard, KeyTerm, StudyNotes, StudySetSummary } from "@/lib/types";

interface Source {
  key: string; // "set:<id>" or "sample:<slug>"
  title: string;
  pairs: Pair[];
  keyTerms: KeyTerm[];
}

const params = () => new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);

function setUrl(q: Record<string, string | null>) {
  const p = params();
  for (const [k, v] of Object.entries(q)) (v ? p.set(k, v) : p.delete(k));
  history.replaceState(null, "", `/games${p.toString() ? `?${p}` : ""}`);
}

const BEST_LABEL: Record<GameId, (n: number) => string> = {
  match: (n) => `Best ${(n / 10).toFixed(1)}s`,
  quickfire: (n) => `Best ${n} right`,
  memory: (n) => `Best ${n} moves`,
  scramble: (n) => `Best ${n}/8`,
};

/** Games made from your notes: pick a set, pick a game. */
export default function GamesPage() {
  const [sets, setSets] = useState<StudySetSummary[]>([]);
  const [source, setSource] = useState<Source | null>(null);
  const [game, setGame] = useState<GameId | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open(key: string) {
    setError(null);
    if (key.startsWith("sample:")) {
      const pack = packBySlug(key.slice(7));
      if (!pack) return;
      setSource({ key, title: pack.title, pairs: pairsFrom(pack.flashcards, pack.notes.keyTerms), keyTerms: pack.notes.keyTerms });
    } else {
      setLoading(true);
      try {
        const set = await api<{ title: string; flashcards: Flashcard[]; notes: StudyNotes }>(`/api/study/${key.slice(4)}`);
        setSource({ key, title: set.title, pairs: pairsFrom(set.flashcards, set.notes.keyTerms), keyTerms: set.notes.keyTerms });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    setUrl({ src: key });
  }

  useEffect(() => {
    api<{ sets: StudySetSummary[] }>(`/api/study?playerId=${getPlayerId()}`).then((r) => setSets(r.sets)).catch(() => undefined);
    const p = params();
    const src = p.get("src");
    if (src) void open(src);
    const g = p.get("game") as GameId | null;
    if (g && GAMES.some((x) => x.id === g)) setGame(g);
  }, []);

  const exit = () => {
    setGame(null);
    setUrl({ game: null });
  };

  if (source && game) {
    const props = { pairs: source.pairs, source: source.key, onExit: exit };
    return (
      <div className="mx-auto max-w-2xl space-y-5 py-8 sm:py-12">
        <button type="button" onClick={exit} className="font-mono text-[12px] tracking-[0.1em] text-muted-foreground uppercase hover:text-foreground">← {source.title}</button>
        <h1 className="text-[32px] leading-tight">{GAMES.find((g) => g.id === game)!.name}</h1>
        {game === "match" ? <MatchGame {...props} /> : game === "quickfire" ? <QuickFireGame {...props} /> : game === "memory" ? <MemoryGame {...props} /> : <ScrambleGame {...props} keyTerms={source.keyTerms} />}
      </div>
    );
  }

  if (source) {
    const tooFew = source.pairs.length < 4;
    return (
      <Section title={source.title} intro="Pick a game. Every game counts towards your streak.">
        <div className="space-y-4">
          <button type="button" onClick={() => { setSource(null); setUrl({ src: null }); }} className="font-mono text-[12px] tracking-[0.1em] text-muted-foreground uppercase hover:text-foreground">← Choose different notes</button>
          {tooFew ? (
            <p className="surface p-5 text-body-lg">These notes are a bit short for games. Add a few more facts or key terms to the set and try again.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {GAMES.map((g) => {
                const best = loadBest(g.id, source.key);
                return (
                  <button key={g.id} type="button" onClick={() => { setGame(g.id); setUrl({ game: g.id }); }} className={`game-card game-${g.id}`}>
                    <span className="font-display text-[22px] font-bold tracking-[-0.02em]">{g.name}</span>
                    <span className="text-body text-muted-foreground">{g.blurb}</span>
                    <span className="mt-auto font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">{best === null ? "Not played yet" : BEST_LABEL[g.id](best)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Section>
    );
  }

  const row = (key: string, title: string, meta: string) => (
    <li key={key}>
      <button type="button" onClick={() => open(key)} className="result-row group w-full text-left" style={{ ["--accent" as string]: paletteFor(key.split(":")[1]).accent }}>
        <span className="result-row-mark" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[17px] font-semibold">{title}</span>
          <span className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">{meta}</span>
        </span>
        <span aria-hidden className="text-muted-foreground">›</span>
      </button>
    </li>
  );

  return (
    <Section title="Games" intro="Turn any notes into quick games: Match Up, Quick Fire, Memory Flip and Word Scramble.">
      <div className="grid gap-8">
        {loading && <p className="text-body text-muted-foreground">Loading your notes…</p>}
        {error && <p className="text-body text-destructive">{error}</p>}
        <section aria-label="Your study sets">
          <h2 className="mb-2 font-mono text-[12px] font-medium tracking-[0.12em] text-muted-foreground uppercase">Your study sets</h2>
          {sets.length ? (
            <ul className="divide-y divide-[var(--surface-border)] border-y border-surface-border">{sets.map((s) => row(`set:${s.id}`, s.title, `${s.cardCount} flashcards`))}</ul>
          ) : (
            <p className="text-body text-muted-foreground">
              No sets yet. <Link href="/study" className="text-foreground underline underline-offset-4">Make one from your notes</Link>, or play a ready-made subject below.
            </p>
          )}
        </section>
        <section aria-label="Ready-made subjects">
          <h2 className="mb-2 font-mono text-[12px] font-medium tracking-[0.12em] text-muted-foreground uppercase">Ready-made subjects</h2>
          <ul className="divide-y divide-[var(--surface-border)] border-y border-surface-border">{LIBRARY.map((p) => row(`sample:${p.slug}`, p.title, `${p.flashcards.length} flashcards`))}</ul>
        </section>
      </div>
    </Section>
  );
}
