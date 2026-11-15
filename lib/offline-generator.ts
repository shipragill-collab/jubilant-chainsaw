import { QUESTION_COUNT, type KeyTerm, type Question } from "./types";

/**
 * Heuristic question builder used when no Claude API key is configured (or the
 * API call fails). It turns sentences from the notes into fill-in-the-blank
 * questions, using key terms from elsewhere in the notes as distractors.
 */

export const STOPWORDS = new Set(
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

/** Key terms per sentence, best first, plus every term in the notes. */
function termsOf(sentences: string[]) {
  const freq = new Map<string, number>();
  for (const s of sentences) for (const w of words(s)) freq.set(w.toLowerCase(), (freq.get(w.toLowerCase()) ?? 0) + 1);
  const candidates = sentences.map((s) =>
    [...new Set(words(s))]
      .map((t) => ({ t, score: termScore(t, freq) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.t),
  );
  return { candidates, allTerms: [...new Set(candidates.flat())] };
}

/** Distractors that look like the answer: same kind (number/name/word), similar length. */
function lookalikes(answer: string, pool: string[], avoidIn: string, rand: () => number, n = 3): string[] {
  const isNum = /\d/.test(answer);
  const isName = /^[A-Z]/.test(answer);
  return pool
    .filter((t) => t.toLowerCase() !== answer.toLowerCase() && !avoidIn.toLowerCase().includes(t.toLowerCase()) && /\d/.test(t) === isNum)
    .map((t) => ({ t, d: Math.abs(t.length - answer.length) + (/^[A-Z]/.test(t) === isName ? 0 : 6) + rand() * 4 }))
    .sort((x, y) => x.d - y.d)
    .map((x) => x.t)
    .slice(0, n);
}

/** Believable wrong numbers: nearby years, sensible percentages, or close quantities, in the answer's own style. */
function nearbyNumbers(n: string, rand: () => number): string[] {
  const v = Number(n.replace(/,/g, "").replace(/%$/, ""));
  if (!Number.isFinite(v)) return [];
  const pct = n.endsWith("%");
  const commas = n.includes(",");
  const isYear = /^1[0-9]{3}$|^20[0-9]{2}$/.test(n);
  const steps = isYear ? [-23, -10, 10, 13, 4, -4, 25]
    : pct ? [-30, -20, -10, 10, -40, 15].map((d) => d * (v > 50 ? 1 : -1))
    : v < 20 ? [-2, -1, 1, 2, 3, v]
    : [-0.5 * v, 0.5 * v, v, -0.25 * v, 0.25 * v];
  const out = new Set<string>();
  for (const st of shuffle(steps, rand)) {
    const x = Math.round(v + st);
    if (x <= 0 || x === v || (pct && x >= 100)) continue;
    out.add((commas || (x >= 10000 && !isYear) ? x.toLocaleString("en-GB") : String(x)) + (pct ? "%" : ""));
    if (out.size === 3) break;
  }
  return [...out];
}

const MAX_OPTION = 110;
const tidy = (s: string) => s.replace(/\s+/g, " ").trim().replace(/[.;:]+$/, "");

/** Fill-in-the-blank questions (also used for flashcards). */
export function clozeQuestions(notes: string, count = QUESTION_COUNT): Question[] {
  const sentences = splitSentences(notes.replace(/^\s*#{1,6}\s+.*$/gm, ""));
  if (sentences.length === 0) return [];
  const rand = rng(hash(notes));
  const { candidates, allTerms } = termsOf(sentences);
  const questions: Question[] = [];
  const used = new Set<string>();
  for (let round = 0; questions.length < count && round < 4; round++) {
    for (const i of shuffle([...sentences.keys()], rand)) {
      if (questions.length >= count) break;
      const term = candidates[i][round];
      if (!term || used.has(`${i}:${term}`)) continue;
      used.add(`${i}:${term}`);
      // Blank out something worth remembering: a name, number, or a longer key word.
      if (!/^[A-Z]|\d/.test(term) && term.length < 7 && round > 0) continue;
      const sentence = sentences[i];
      const blanked = sentence.replace(term, "_____");
      if (blanked === sentence) continue;
      const wrong = /\d/.test(term) ? nearbyNumbers(term, rand) : lookalikes(term, allTerms, sentence, rand);
      if (wrong.length < 3) continue;
      const options = shuffle([term, ...wrong.slice(0, 3)], rand);
      questions.push({ prompt: `Fill in the blank: “${blanked}”`, options, answerIndex: options.indexOf(term), explanation: tidy(sentence) + "." });
    }
  }
  return questions;
}

/**
 * Free quiz builder for any notes (no API key). It mixes five kinds of
 * question so a duel doesn't feel like one long fill-in-the-blank:
 * meaning ("What does X mean?"), term ("Which term matches…?"), true
 * statement, number/date, and fill-in-the-blank. Every question explains
 * its answer with the line from the notes it came from.
 */
export function generateOfflineQuestions(notes: string, count = QUESTION_COUNT): Question[] {
  const body = notes.replace(/^\s*#{1,6}\s+.*$/gm, "");
  const sentences = splitSentences(body);
  if (sentences.length === 0) return [];
  const rand = rng(hash(notes));
  const { candidates, allTerms } = termsOf(sentences);
  const defs = extractDefinitions(notes).filter((d) => d.definition.length <= MAX_OPTION);
  const make = (prompt: string, answer: string, wrong: string[], explanation: string): Question | null => {
    const opts = [...new Set([answer, ...wrong.map((w) => tidy(w))])].slice(0, 4);
    if (opts.length < 4) return null;
    const options = shuffle(opts, rand);
    return { prompt, options, answerIndex: options.indexOf(answer), explanation };
  };

  // Meaning: "What does X mean?" → its definition among other definitions.
  const meaning = defs.map((d) => make(d.question, d.definition, lookalikes(d.definition, defs.map((x) => x.definition), "", rand), `${d.term}: ${d.definition}.`));

  // Term: definition → which term?
  const termPool = [...new Set([...defs.map((d) => d.term), ...allTerms.filter((t) => /^[A-Z]/.test(t) && !/\d/.test(t))])];
  const term = defs.map((d) => make(`Which term matches this: “${d.definition}”?`, d.term, lookalikes(d.term, termPool, d.definition, rand), `${d.term}: ${d.definition}.`));

  // True statement: one real line, three with a key term swapped for another.
  const shortIdx = [...sentences.keys()].filter((i) => sentences[i].length <= MAX_OPTION && candidates[i].length);
  const truth = shuffle(shortIdx, rand).slice(0, 4).map((i) => {
    const real = tidy(sentences[i]);
    const fakes: string[] = [];
    for (const j of shuffle(shortIdx.filter((k) => k !== i), rand)) {
      const t = candidates[j][0];
      const swap = lookalikes(t, allTerms, sentences[j], rand, 1)[0];
      if (!swap) continue;
      const fake = tidy(sentences[j].replace(t, swap));
      if (fake !== tidy(sentences[j]) && !sentences.some((x) => tidy(x) === fake)) fakes.push(fake);
      if (fakes.length === 3) break;
    }
    return make("Which of these statements is true?", real, fakes, `True: ${real}.`);
  });

  // Numbers and dates, with believable nearby numbers.
  const numbers = sentences.flatMap((s) => {
    const n = words(s).find((w) => /\d/.test(w) && w.replace(/\D/g, "").length >= 1);
    if (!n) return [];
    const blanked = s.replace(n, "_____");
    return blanked === s ? [] : [make(`Which number completes this: “${blanked}”`, n, nearbyNumbers(n, rand), tidy(s) + ".")];
  });

  const cloze = clozeQuestions(notes, count * 2);
  const pools = { term, meaning, numbers, truth, cloze } as Record<string, (Question | null)[]>;
  for (const k of Object.keys(pools)) pools[k] = shuffle(pools[k].filter(Boolean), rand);
  const pattern = ["term", "cloze", "meaning", "numbers", "truth", "cloze", "term", "meaning", "cloze", "truth", "numbers", "cloze"];

  const out: Question[] = [];
  const seen = new Set<string>();
  const sourceUse = new Map<string, number>();
  for (let pass = 0; out.length < count && pass < 6; pass++) {
    for (const kind of pattern) {
      if (out.length >= count) break;
      const q = pools[kind].shift();
      // The same blanked sentence asked two ways counts as one question.
      const key = q?.prompt.replace(/^(Fill in the blank|Which number completes this):\s*/, "");
      if (!q || !key || seen.has(key)) continue;
      const src = q.explanation ?? q.prompt;
      if ((sourceUse.get(src) ?? 0) >= 2) continue; // don't hammer one fact
      sourceUse.set(src, (sourceUse.get(src) ?? 0) + 1);
      seen.add(key);
      out.push(q);
    }
  }
  return out;
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

// ---------------------------------------------------------------------------
// Definitions: "X is/means/refers to Y" sentences become terms, flashcards and
// definition questions.
// ---------------------------------------------------------------------------

const DEFINITION = /^(an?\s+|the\s+)?([A-Za-z\u00C0-\u017F¿¡][\w\u00C0-\u017F\s'()/¿?¡!-]{1,50}?)\s+(is|are|was|were|refers to|means|describes|consists of|measures)\s+(.{3,})$/i;
const QUANTIFIERS = /^(every|each|all|most|some|many|any|no|another|other|answer|question|example)$/i;

/** Lower-case a sentence-initial common noun ("Atom" → "atom"), but keep names and acronyms. */
function asPhrase(article: string, term: string, plural: boolean): string {
  const proper = /[A-Z]/.test(term.slice(1)) || term.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).length > 1;
  const t = !proper && (article || plural) ? term[0].toLowerCase() + term.slice(1) : term;
  return article ? `${article.toLowerCase()} ${t}` : t;
}

const trim = (s: string) => s.replace(/\s+/g, " ").trim().replace(/[.;:]+$/, "");
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** Keep a definition to its main clause: "thank you, and the reply…" → "thank you". */
function mainClause(def: string): string {
  const cut = def.search(/,\s+(and|but|while|whereas|so)\s+|;\s/);
  return cut > 2 ? def.slice(0, cut) : def;
}

export function extractDefinitions(material: string): (KeyTerm & { question: string })[] {
  const seen = new Set<string>();
  const out: (KeyTerm & { question: string })[] = [];
  for (const sentence of splitSentences(material.replace(/^\s*#{1,6}\s+.*$/gm, ""))) {
    // "In Spanish, hola means hello" → "hola means hello"
    const m = trim(sentence).replace(/^(in|on|at|for|during)\s+[^,]{2,30},\s+/i, "").match(DEFINITION);
    if (!m) continue;
    const article = (m[1] ?? "").trim();
    const term = m[2].trim();
    const parts = term.split(/\s+/);
    if (parts.length > 5 || QUANTIFIERS.test(parts[0]) || (STOPWORDS.has(parts[0].toLowerCase()) && parts.length === 1)) continue;
    if (/^(it|this|that|these|those|they|there|he|she|which|we|you|i)$/i.test(term)) continue;
    const key = term.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const verb = m[3].toLowerCase();
    const plural = verb === "are" || verb === "were";
    const phrase = asPhrase(article, term, plural);
    const rest = mainClause(m[4].trim());
    const question =
      verb === "means" ? `What does ${phrase} mean?`
      : verb === "refers to" ? `What does ${phrase} refer to?`
      : verb === "describes" ? `What does ${phrase} describe?`
      : verb === "measures" ? `What does ${phrase} measure?`
      : verb === "consists of" ? `What does ${phrase} consist of?`
      : `What ${plural ? "are" : "is"} ${phrase}?`;
    out.push({ term: cap(term), definition: cap(rest), question });
  }
  return out;
}
