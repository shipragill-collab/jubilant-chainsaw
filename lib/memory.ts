/**
 * Raj's memory of what you know: a Leitner-style spaced-repetition record per
 * flashcard, kept in the browser. Right answers move a card up a box and push
 * its next review further away; a wrong answer sends it back to box 1.
 *
 * Everyone's answers are recorded; Pro unlocks using them (due reviews,
 * progress, Raj picking the cards you're about to forget).
 */

export interface CardMemory {
  box: number; // 1 (new or shaky) … 5 (mastered)
  due: number; // ms timestamp of the next review
  seen: number;
  right: number;
}
export type SetMemory = Record<number, CardMemory>;

const DAY = 24 * 3600 * 1000;
/** Days until the next review for each box. */
export const INTERVAL_DAYS = [0, 0, 1, 3, 7, 14];

export function nextMemory(prev: CardMemory | undefined, correct: boolean, now = Date.now()): CardMemory {
  const box = correct ? Math.min(5, (prev?.box ?? 1) + 1) : 1;
  return { box, due: now + INTERVAL_DAYS[box] * DAY, seen: (prev?.seen ?? 0) + 1, right: (prev?.right ?? 0) + (correct ? 1 : 0) };
}

/** Cards that are due now (reviewed before and their time has come), weakest first. */
export function dueCards(mem: SetMemory, cardCount: number, now = Date.now()): number[] {
  return Object.entries(mem)
    .map(([i, m]) => ({ i: Number(i), m }))
    .filter(({ i, m }) => i < cardCount && m.due <= now)
    .sort((a, b) => a.m.box - b.m.box || a.m.due - b.m.due)
    .map(({ i }) => i);
}

export interface MemorySummary {
  mastered: number; // box 4–5
  learning: number; // box 2–3
  shaky: number; // box 1, seen
  fresh: number; // never answered
  due: number;
  total: number;
}

export function summarize(mem: SetMemory, cardCount: number, now = Date.now()): MemorySummary {
  let mastered = 0, learning = 0, shaky = 0;
  for (let i = 0; i < cardCount; i++) {
    const m = mem[i];
    if (!m) continue;
    if (m.box >= 4) mastered++;
    else if (m.box >= 2) learning++;
    else shaky++;
  }
  return { mastered, learning, shaky, fresh: cardCount - mastered - learning - shaky, due: dueCards(mem, cardCount, now).length, total: cardCount };
}

/** Whole days from today until the exam date (YYYY-MM-DD), or null. */
export function daysUntil(dateISO: string | null, now = Date.now()): number | null {
  if (!dateISO || !/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) return null;
  const exam = new Date(`${dateISO}T00:00:00`).getTime();
  const today = new Date(new Date(now).toDateString()).getTime();
  return Math.round((exam - today) / DAY);
}

/** How many cards to study today so everything is covered before the exam. */
export function cardsForToday(s: MemorySummary, daysLeft: number | null): number {
  const toLearn = s.fresh + s.shaky + s.learning;
  if (daysLeft === null || daysLeft <= 0) return Math.max(s.due, Math.min(10, toLearn));
  return Math.max(s.due, Math.ceil(toLearn / Math.max(1, daysLeft)));
}

// ---------------------------------------------------------------------------
// Browser storage (all wrapped: private windows and blocked storage just mean no memory)
// ---------------------------------------------------------------------------

const memKey = (setId: string) => `quiz-duel:mem:${setId}`;
const examKey = (setId: string) => `quiz-duel:exam:${setId}`;
const listeners = new Set<() => void>();

export function loadMemory(setId: string): SetMemory {
  try {
    return JSON.parse(localStorage.getItem(memKey(setId)) ?? "{}") as SetMemory;
  } catch {
    return {};
  }
}

export function recordAnswer(setId: string, cardIndex: number, correct: boolean, now = Date.now()) {
  const mem = loadMemory(setId);
  mem[cardIndex] = nextMemory(mem[cardIndex], correct, now);
  try {
    localStorage.setItem(memKey(setId), JSON.stringify(mem));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function loadExamDate(setId: string): string | null {
  try {
    return localStorage.getItem(examKey(setId));
  } catch {
    return null;
  }
}

export function saveExamDate(setId: string, date: string | null) {
  try {
    if (date) localStorage.setItem(examKey(setId), date);
    else localStorage.removeItem(examKey(setId));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

/** Subscribe to memory/exam changes (returns an unsubscribe). */
export function onMemoryChange(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
