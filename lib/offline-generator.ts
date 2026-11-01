import { QUESTION_COUNT, type Question } from "./types";

/**
 * Heuristic question builder used when no Claude API key is configured (or the
 * API call fails). It turns sentences from the notes into fill-in-the-blank
 * questions, using key terms from elsewhere in the notes as distractors.
 */

const STOPWORDS = new Set(
  (
    "a an the and or but if then else when while of to in on at by for with from into onto over under about " +
    "as is are was were be been being am do does did done has have had having it its this that these those " +
    "there here which who whom whose what where why how not no nor so than too very can could should would " +
    "will shall may might must also just only such each every all any both few more most other some own same " +
    "they them their theirs we us our ours you your yours he him his she her hers i me my mine one two three " +
    "use used using make made many much often usually because through during before after above below between " +
    "within without again further once like e.g i.e etc"
  ).split(/\s+/),
);

const FILLER_DISTRACTORS = ["None of the above", "Not mentioned in the notes", "All of the above"];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic PRNG so the same notes produce the same quiz. */
function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function splitSentences(notes: string): string[] {
  return notes
    .replace(/\r/g, "")
    .split(/\n+|(?<=[.!?])\s+/)
    .map((s) => s.replace(/^[\s\-*•\d.)]+/, "").trim())
    .filter((s) => s.split(/\s+/).length >= 4 && s.length <= 300);
}

/** Candidate answer terms: runs of capitalized words (names), single words, and numbers. */
export function words(sentence: string): string[] {
  const raw = sentence.match(/[A-Z][A-Za-z0-9'-]*(?:\s[A-Z][A-Za-z0-9'-]*)*|[a-z][A-Za-z0-9'-]*|\d[\d,.]*\d%?|\d%?/g) ?? [];
  return raw
    .map((t) => {
      // "The Calvin" -> "Calvin": drop a leading stopword picked up at the start of a sentence.
      const parts = t.split(" ");
      while (parts.length > 1 && STOPWORDS.has(parts[0].toLowerCase())) parts.shift();
      return parts.join(" ").replace(/[-']+$/, "");
    })
    .filter(Boolean);
}

function termScore(term: string, freq: Map<string, number>): number {
  const lower = term.toLowerCase();
  if (STOPWORDS.has(lower) || term.length < 3) return -1;
  let score = Math.min(term.length, 14);
  if (/^[A-Z]/.test(term)) score += 4; // proper nouns / named concepts
  if (/\d/.test(term)) score += 5; // dates, numbers
  if (term.includes(" ")) score += 3; // multi-word names
  score += Math.min(4, (freq.get(lower) ?? 1) - 1); // recurring concepts
  return score;
}

export function generateOfflineQuestions(notes: string, count = QUESTION_COUNT): Question[] {
  const sentences = splitSentences(notes);
  if (sentences.length === 0) return [];
  const rand = rng(hash(notes));

  const freq = new Map<string, number>();
  for (const s of sentences) for (const w of words(s)) freq.set(w.toLowerCase(), (freq.get(w.toLowerCase()) ?? 0) + 1);

  // Candidate key terms per sentence, best first.
  const candidates = sentences.map((s) =>
    [...new Set(words(s))]
      .map((t) => ({ t, score: termScore(t, freq) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.t),
  );
  const allTerms = [...new Set(candidates.flat())];

  const questions: Question[] = [];
  const used = new Set<string>();
  // Round-robin: best term from each sentence first, then second-best, etc.
  for (let round = 0; questions.length < count && round < 4; round++) {
    for (const i of shuffle([...sentences.keys()], rand)) {
      if (questions.length >= count) break;
      const term = candidates[i][round];
      if (!term || used.has(`${i}:${term}`)) continue;
      used.add(`${i}:${term}`);
      const sentence = sentences[i];
      const blanked = sentence.replace(term, "_____");
      if (blanked === sentence) continue;

      const isNum = /\d/.test(term);
      const pool = allTerms.filter(
        (t) => t.toLowerCase() !== term.toLowerCase() && !sentence.includes(t) && /\d/.test(t) === isNum,
      );
      // Prefer distractors that look like the answer (similar length / capitalization).
      const similar = pool
        .map((t) => ({ t, d: Math.abs(t.length - term.length) + (/^[A-Z]/.test(t) === /^[A-Z]/.test(term) ? 0 : 6) + rand() * 4 }))
        .sort((a, b) => a.d - b.d)
        .map((x) => x.t);
      const distractors = similar.slice(0, 3);
      for (const f of FILLER_DISTRACTORS) if (distractors.length < 3) distractors.push(f);

      const options = shuffle([term, ...distractors], rand);
      questions.push({
        prompt: `Fill in the blank: “${blanked}”`,
        options,
        answerIndex: options.indexOf(term),
        explanation: sentence,
      });
    }
  }
  return questions;
}

export function guessTitle(notes: string): string {
  const firstLine = notes.trim().split(/\n/)[0] ?? "";
  const heading = firstLine.replace(/^#+\s*/, "").replace(/:$/, "").trim();
  // Use the first line only when it looks like a heading, not a sentence.
  const looksLikeHeading = /^#/.test(firstLine) || !/[.!?]$/.test(firstLine.trim());
  if (heading && looksLikeHeading && heading.length <= 60 && heading.split(/\s+/).length <= 8) return heading;
  const freq = new Map<string, number>();
  for (const w of notes.match(/\b[A-Z][a-zA-Z]{3,}\b/g) ?? []) freq.set(w, (freq.get(w) ?? 0) + 1);
  const top = [...freq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  return top ? `${top} quiz` : "Notes quiz";
}
