import type { Flashcard, KeyTerm } from "./types";

/** Games made from a study set. Everything here is pure, so it's easy to test. */

export interface Pair {
  prompt: string; // a term or question
  answer: string; // its meaning or answer
}

export type GameId = "match" | "quickfire" | "memory" | "scramble";

export const GAMES: { id: GameId; name: string; blurb: string }[] = [
  { id: "match", name: "Match Up", blurb: "Pair each term with its meaning against the clock." },
  { id: "quickfire", name: "Quick Fire", blurb: "True or false? Get as many as you can in 60 seconds." },
  { id: "memory", name: "Memory Flip", blurb: "Turn over cards to find each question and its answer." },
  { id: "scramble", name: "Word Scramble", blurb: "Unscramble the key terms from your notes." },
];

const clip = (s: string) => s.replace(/[“”"]/g, "").replace(/\s+/g, " ").trim().replace(/[.;:]+$/, "");

/** Short, distinct pairs from key terms first, then flashcards. */
export function pairsFrom(cards: Flashcard[], keyTerms: KeyTerm[] = [], max = 12): Pair[] {
  const out: Pair[] = [];
  const seen = new Set<string>();
  const add = (prompt: string, answer: string) => {
    const p = clip(prompt), a = clip(answer);
    if (!p || !a || p.length > 90 || a.length > 70) return;
    const k = `${p.toLowerCase()}|${a.toLowerCase()}`;
    if (seen.has(p.toLowerCase()) || seen.has(a.toLowerCase()) || seen.has(k)) return;
    seen.add(p.toLowerCase());
    seen.add(a.toLowerCase());
    out.push({ prompt: p, answer: a });
  };
  for (const t of keyTerms) add(t.term, t.definition);
  for (const c of cards) add(c.front, c.back);
  return out.slice(0, max);
}

/** Seeded shuffle, so tests are repeatable; pass Math.random for real play. */
export function shuffle<T>(arr: T[], rand: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface Statement {
  prompt: string;
  shown: string;
  isTrue: boolean;
  answer: string;
}

/** True/false statements: about half pair a prompt with its own answer, the rest with another one. */
export function quickFireRound(pairs: Pair[], count = 30, rand: () => number = Math.random): Statement[] {
  if (pairs.length < 2) return [];
  const out: Statement[] = [];
  for (let i = 0; i < count; i++) {
    const p = pairs[Math.floor(rand() * pairs.length)];
    const truthy = rand() < 0.5;
    const others = pairs.filter((x) => x.answer !== p.answer);
    const shown = truthy || !others.length ? p.answer : others[Math.floor(rand() * others.length)].answer;
    out.push({ prompt: p.prompt, shown, isTrue: shown === p.answer, answer: p.answer });
  }
  return out;
}

export interface MemoryCard {
  id: number;
  pair: number;
  text: string;
  side: "prompt" | "answer";
}

/** A memory grid: each pair becomes two cards (question and answer), shuffled. */
export function memoryDeck(pairs: Pair[], n = 6, rand: () => number = Math.random): MemoryCard[] {
  const chosen = shuffle(pairs, rand).slice(0, n);
  const cards = chosen.flatMap((p, i) => [
    { pair: i, text: p.prompt, side: "prompt" as const },
    { pair: i, text: p.answer, side: "answer" as const },
  ]);
  return shuffle(cards, rand).map((c, id) => ({ ...c, id }));
}

/** Words worth unscrambling: single key terms of 4–12 letters. */
export function scrambleWords(pairs: Pair[], keyTerms: KeyTerm[] = []): { word: string; clue: string }[] {
  const out: { word: string; clue: string }[] = [];
  const add = (word: string, clue: string) => {
    const w = word.trim();
    if (/^[A-Za-zÀ-ÿ]{4,12}$/.test(w) && !out.some((x) => x.word.toLowerCase() === w.toLowerCase())) out.push({ word: w, clue: clip(clue) });
  };
  for (const t of keyTerms) add(t.term, t.definition);
  for (const p of pairs) {
    add(p.answer, p.prompt);
    add(p.prompt, p.answer);
  }
  return out;
}

/** Scramble a word so it never comes out unchanged. */
export function scramble(word: string, rand: () => number = Math.random): string {
  const letters = word.toUpperCase().split("");
  for (let tries = 0; tries < 10; tries++) {
    const s = shuffle(letters, rand).join("");
    if (s !== word.toUpperCase()) return s;
  }
  return letters.reverse().join("");
}

/** Forgiving check for typed answers: ignores case, accents and spaces. */
export function sameWord(a: string, b: string): boolean {
  const n = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/gi, "").toLowerCase();
  return n(a) === n(b);
}
