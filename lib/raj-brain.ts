/**
 * Raj's offline brain. Pure TypeScript with no network and no server-only
 * imports, so it runs on the server (when there's no Claude key) and in the
 * browser (when the server or the internet is unavailable).
 *
 * It works from the student's own study set: it ranks their sentences with
 * BM25, recognises what kind of question was asked, and runs adaptive
 * practice in three formats with forgiving, partial-credit marking.
 */
import { splitSentences, STOPWORDS } from "./offline-generator";
import type { Flashcard, KeyTerm, StudyNotes } from "./types";

export interface BrainMessage {
  role: "user" | "assistant";
  content: string;
}

/** What Raj knows about the set being studied (material is optional). */
export interface Knowledge {
  title: string;
  material?: string;
  notes?: StudyNotes;
  flashcards: Flashcard[];
}

// ---------------------------------------------------------------------------
// Text tools
// ---------------------------------------------------------------------------

export const choicesTag = (opts: string[]) => `<choices>${opts.map((o) => o.replace(/[|<>]/g, " ").trim()).filter(Boolean).join(" | ")}</choices>`;
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const clean = (s: string) => s.replace(/\s+/g, " ").trim().replace(/[.;:,]+$/, "");

/** A light stemmer: enough to match "photosynthesis/photosynthetic", "cells/cell", "splitting/split". */
export function stem(w: string): string {
  let s = w.toLowerCase();
  for (const suf of ["ational", "ations", "ation", "ingly", "ically", "ments", "ment", "ness", "ities", "ity", "ies", "ing", "edly", "ed", "es", "ly", "s"]) {
    if (s.length > suf.length + 3 && s.endsWith(suf)) {
      s = s.slice(0, -suf.length);
      break;
    }
  }
  return s.replace(/(.)\1$/, "$1");
}

export const tokens = (s: string) =>
  (s.toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) ?? [])
    .filter((w) => w.length > 1 && !STOPWORDS.has(w) && !QUESTION_WORDS.has(w))
    .map(stem);

const QUESTION_WORDS = new Set([
  "what", "why", "how", "when", "where", "which", "who", "explain", "tell", "describe", "define", "meaning", "mean", "means",
  "does", "do", "is", "are", "can", "could", "please", "me", "give", "example", "examples", "simply", "simple", "difference",
  "between", "compare", "versus", "vs", "about", "happen", "happens", "work", "works", "role", "purpose",
]);

/** Edit distance, for forgiving typos. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m || !n) return m || n;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
const similar = (a: string, b: string) => {
  const x = norm(a), y = norm(b);
  if (!x || !y) return 0;
  return 1 - levenshtein(x, y) / Math.max(x.length, y.length);
};

// ---------------------------------------------------------------------------
// The knowledge index (BM25 over the student's sentences)
// ---------------------------------------------------------------------------

interface Doc { text: string; toks: string[] }
interface Index { docs: Doc[]; df: Map<string, number>; avg: number; terms: KeyTerm[] }

const cache = new WeakMap<Knowledge, Index>();

function index(k: Knowledge): Index {
  const hit = cache.get(k);
  if (hit) return hit;
  const texts = new Set<string>();
  if (k.material) for (const s of splitSentences(k.material)) texts.add(clean(s));
  for (const sec of k.notes?.sections ?? []) for (const p of sec.points) texts.add(clean(p));
  for (const t of k.notes?.keyTerms ?? []) texts.add(`${t.term} is ${t.definition.replace(/^[A-Z]/, (c) => c.toLowerCase())}`);
  if (!k.material) for (const c of k.flashcards) texts.add(clean(`${c.front.replace(/[“”"]/g, "")} ${c.back}`));
  const docs = [...texts].filter((t) => t.length > 8).map((text) => ({ text, toks: tokens(text) }));
  const df = new Map<string, number>();
  for (const d of docs) for (const t of new Set(d.toks)) df.set(t, (df.get(t) ?? 0) + 1);
  const avg = docs.reduce((s, d) => s + d.toks.length, 0) / Math.max(1, docs.length);
  const idx = { docs, df, avg, terms: k.notes?.keyTerms ?? [] };
  cache.set(k, idx);
  return idx;
}

/** Rank sentences for a query with BM25; optional boost for sentences matching a pattern. */
export function search(k: Knowledge, query: string, max = 3, boost?: RegExp): { text: string; score: number }[] {
  const idx = index(k);
  const q = [...new Set(tokens(query))];
  if (!q.length) return [];
  const N = idx.docs.length;
  const k1 = 1.4, b = 0.75;
  return idx.docs
    .map((d) => {
      let score = 0;
      for (const t of q) {
        const f = d.toks.filter((x) => x === t || (x.length > 4 && t.length > 4 && (x.startsWith(t) || t.startsWith(x)))).length;
        if (!f) continue;
        const n = idx.df.get(t) ?? 1;
        const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
        score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.toks.length) / idx.avg)));
      }
      if (score > 0 && boost?.test(d.text)) score *= 1.6;
      return { text: d.text, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .filter((r, i, all) => !all.slice(0, i).some((x) => overlapRatio(x.text, r.text) > 0.7))
    .slice(0, max);
}

/** Share of the shorter sentence's words found in the longer one (to drop near-duplicates). */
function overlapRatio(a: string, b: string) {
  const x = new Set(tokens(a)), y = new Set(tokens(b));
  const small = x.size < y.size ? x : y, big = small === x ? y : x;
  if (!small.size) return 0;
  let n = 0;
  for (const w of small) if (big.has(w)) n++;
  return n / small.size;
}

/** The key term the student is most likely asking about. */
function findTerm(k: Knowledge, text: string): KeyTerm | undefined {
  const idx = index(k);
  const t = norm(text);
  let best: { term: KeyTerm; s: number } | undefined;
  for (const term of idx.terms) {
    const name = norm(term.term);
    const s = t.includes(name) ? 1 + name.length / 100 : Math.max(...t.split(" ").map((w) => similar(w, name)), similar(t, name));
    if (s > 0.78 && (!best || s > best.s)) best = { term, s };
  }
  return best?.term;
}

// ---------------------------------------------------------------------------
// Practice: three formats, adaptive card choice, forgiving marking
// ---------------------------------------------------------------------------

type Format = "mc" | "tf" | "type";
const FORMAT_LABEL: Record<Format, string> = { mc: "", tf: " · true or false", type: " · type it" };

function seeded<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let x = seed + 7;
  for (let i = a.length - 1; i > 0; i--) {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    const j = x % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Multiple-choice options for a card: its answer plus up to 3 other answers. */
export function cardOptions(k: Knowledge, i: number): string[] {
  const answer = k.flashcards[i].back;
  const others = seeded(k.flashcards.map((c) => c.back).filter((b, j) => j !== i && norm(b) !== norm(answer) && b.length <= 120), i).slice(0, 3);
  return seeded([answer, ...others], i * 31 + 3);
}

/** True/false statement for a card: deterministic, so the answer can be re-derived later. */
function tfStatement(k: Knowledge, i: number): { shown: string; isTrue: boolean } {
  const opts = cardOptions(k, i).filter((o) => o !== k.flashcards[i].back);
  const isTrue = opts.length === 0 || (i * 7 + 3) % 2 === 0;
  return { shown: isTrue ? k.flashcards[i].back : opts[0], isTrue };
}

/** "Chlorophyll" -> "C _ _ _ _ _ _ _ _": first letters only. */
export function maskedHint(answer: string): string {
  return answer
    .split(/\s+/)
    .slice(0, 6)
    .map((w) => (w.length <= 2 ? w : `${w[0]}${" _".repeat(Math.min(w.length - 1, 8))}`))
    .join("   ");
}

interface Asked { index: number; format: Format; attempt: number; hints: number }

const ASK_RE = /Flashcard (\d+) of \d+(?: · (true or false|type it))?(?: \(try (\d)\))?/;

/** The practice question Raj most recently asked, if the conversation is still on it. */
function pending(history: BrainMessage[]): Asked | null {
  for (let i = history.length - 2; i >= 0; i--) {
    const m = history[i];
    if (m.role !== "assistant") continue;
    const q = m.content.match(ASK_RE);
    if (!q) return null; // Raj said something else since
    if (/^\s*\*\*(Correct|Not quite\.\*\* The answer)/.test(m.content) || /The answer is \*\*/.test(m.content)) return null;
    const hints = (m.content.match(/Hint (\d)/) ?? [])[1];
    return { index: Number(q[1]) - 1, format: q[2] === "true or false" ? "tf" : q[2] === "type it" ? "type" : "mc", attempt: Number(q[3] ?? 1), hints: Number(hints ?? 0) };
  }
  return null;
}

interface Marked { index: number; correct: boolean }

/** Every marked answer in the conversation, oldest first. */
function results(history: BrainMessage[]): Marked[] {
  const out: Marked[] = [];
  let last: number | null = null;
  for (const m of history) {
    if (m.role !== "assistant") continue;
    const q = m.content.match(ASK_RE);
    if (/^\s*\*\*Correct/.test(m.content) && last !== null) out.push({ index: last, correct: true });
    else if (/The answer is \*\*/.test(m.content) && last !== null) out.push({ index: last, correct: false });
    if (q) last = Number(q[1]) - 1;
  }
  return out;
}

const weakCards = (history: BrainMessage[]) => {
  const latest = new Map<number, boolean>();
  for (const r of results(history)) latest.set(r.index, r.correct);
  return [...latest].filter(([, ok]) => !ok).map(([i]) => i);
};

function pickCard(k: Knowledge, history: BrainMessage[]): number {
  const n = k.flashcards.length;
  const asked = history.flatMap((m) => (m.role === "assistant" ? [...m.content.matchAll(/Flashcard (\d+) of/g)].map((x) => Number(x[1]) - 1) : []));
  const recent = new Set(asked.slice(-3));
  const weak = weakCards(history).filter((i) => !recent.has(i));
  if (weak.length) return weak[0]; // revisit mistakes first
  const unseen = Array.from({ length: n }, (_, i) => i).filter((i) => !asked.includes(i));
  const pool = unseen.length ? unseen : Array.from({ length: n }, (_, i) => i).filter((i) => !recent.has(i));
  const list = pool.length ? pool : [0];
  return list[(asked.length * 5 + 3) % list.length];
}

function ask(k: Knowledge, i: number, format: Format, intro = "", attempt = 1, hint = ""): string {
  const card = k.flashcards[i];
  const head = `${intro}Flashcard ${i + 1} of ${k.flashcards.length}${FORMAT_LABEL[format]}${attempt > 1 ? ` (try ${attempt})` : ""}\n\n${hint}`;
  if (format === "tf") {
    const st = tfStatement(k, i);
    return `${head}**True or false?** ${card.front.replace(/\?$/, "")} → _${st.shown}_\n\n${choicesTag(["True", "False", "Give me a hint"])}`;
  }
  if (format === "type") return `${head}**${card.front}**\n\nType your answer in your own words.\n\n${choicesTag(["Give me a hint", "Show me the answer"])}`;
  const opts = attempt > 1 ? cardOptions(k, i).filter((o) => !hint.includes(`not “${o}”`)) : cardOptions(k, i);
  return `${head}**${card.front}**\n\n${choicesTag(opts)}`;
}

/** Mark a typed or tapped answer: 1 = right, 0.5 = partly right, 0 = wrong. */
export function mark(answer: string, reply: string): { score: number; missing: string[] } {
  const want = [...new Set(tokens(answer))];
  const got = new Set(tokens(reply));
  if (similar(answer, reply) >= 0.82) return { score: 1, missing: [] };
  if (!want.length) return { score: norm(reply) === norm(answer) ? 1 : 0, missing: [] };
  const hit = want.filter((w) => got.has(w) || [...got].some((g) => similar(g, w) >= 0.8));
  const ratio = hit.length / want.length;
  const missing = want.filter((w) => !hit.includes(w));
  const words = (answer.match(/[A-Za-z][A-Za-z'-]+/g) ?? []).filter((w) => missing.includes(stem(w))).slice(0, 3);
  return { score: ratio >= 0.6 ? 1 : ratio >= 0.25 ? 0.5 : 0, missing: words };
}

const NEXT = choicesTag(["Next question", "Explain it more", "I'm done for now"]);
const PRAISE = ["**Correct!**", "**Correct!** Nicely done.", "**Correct!** You've got this.", "**Correct!** Spot on."];

function why(k: Knowledge, i: number): string {
  const c = k.flashcards[i];
  const s = search(k, `${c.front} ${c.back}`, 1)[0];
  return s ? `Your notes say: “${s.text}.”` : "";
}

function practice(k: Knowledge, history: BrainMessage[], last: string, p: Asked): string | null {
  const card = k.flashcards[p.index];
  if (!card) return null;

  // Hints get stronger each time: first letters, then the context sentence, then fewer options.
  if (/\bhint\b|\bclue\b|\bhelp\b/i.test(last)) {
    const level = p.hints + 1;
    const hint =
      level === 1
        ? `Hint 1: the answer looks like **${maskedHint(card.back)}**.`
        : level === 2
          ? `Hint 2: ${(why(k, p.index) || `it's connected to “${card.front.replace(/[“”]/g, "")}”.`).replace(new RegExp(card.back.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "_____")}`
          : `Hint 3: it's not “${cardOptions(k, p.index).filter((o) => o !== card.back).slice(0, 2).join("” and not “")}”.`;
    return ask(k, p.index, level >= 3 && p.format !== "tf" ? "mc" : p.format, "", p.attempt, `Here's a nudge. ${hint}\n\n`);
  }

  if (/^\s*(show me the answer|i don'?t know|no idea|reveal|give up|pass)\b/i.test(last)) {
    return `No problem, that's how learning works. The answer is **${card.back}**.\n\n${why(k, p.index)}\n\nI'll bring this one back later so it sticks.\n\n${NEXT}`;
  }

  let score: number;
  let missing: string[] = [];
  if (p.format === "tf") {
    const said = /^\s*(true|yes|right|correct)\b/i.test(last) ? true : /^\s*(false|no|wrong|incorrect)\b/i.test(last) ? false : null;
    if (said === null) return null;
    const st = tfStatement(k, p.index);
    score = said === st.isTrue ? 1 : 0;
  } else {
    ({ score, missing } = mark(card.back, last));
  }

  const streak = (() => {
    let n = score === 1 ? 1 : 0;
    if (!n) return 0;
    for (const r of [...results(history)].reverse()) {
      if (!r.correct) break;
      n++;
    }
    return n;
  })();

  if (score === 1) {
    const praise = PRAISE[(p.index + history.length) % PRAISE.length];
    const tf = p.format === "tf" && !tfStatement(k, p.index).isTrue ? ` The right answer is **${card.back}**.` : "";
    const fire = streak >= 3 ? `\n\nThat's ${streak} in a row!` : "";
    return `${praise}${tf} ${why(k, p.index)}${fire}\n\n${NEXT}`;
  }
  if (score === 0.5 && p.format === "type") {
    return `**Not quite.** You're partly there${missing.length ? `, but you're missing **${missing.join("**, **")}**` : ""}. Have another go.\n\n${ask(k, p.index, "type", "", 2)}`;
  }
  if (p.attempt < 2) {
    const nudge = `Hint 1: it looks like **${maskedHint(card.back)}**${p.format === "mc" ? `, and it's not “${last.trim()}”` : ""}.`;
    return `**Not quite.** Good try, though.\n\n${ask(k, p.index, p.format === "tf" ? "mc" : p.format, "", 2, `${nudge}\n\n`)}`;
  }
  return `**Not quite.** The answer is **${card.back}**. ${why(k, p.index)}\n\nRead it once more; I'll ask you again later.\n\n${NEXT}`;
}

// ---------------------------------------------------------------------------
// Explanations
// ---------------------------------------------------------------------------

function simplify(sentence: string, terms: KeyTerm[]): string {
  let s = sentence;
  for (const t of terms) {
    const re = new RegExp(`\\b${t.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(s) && t.definition.length < 70 && overlapRatio(t.definition, s.replace(re, "")) < 0.6) {
      s = s.replace(re, (m) => `${m} (${t.definition.replace(/[.]$/, "").replace(/^[A-Z]/, (c) => c.toLowerCase())})`);
      break;
    }
  }
  return s.split(/,\s+(?:which|and|but|so)\s+/i).map((p) => cap(clean(p))).join(". ");
}

/** Per letter: [adjective, noun, verb], so the phrase reads like a (silly) sentence. */
const WORD_BANK: Record<string, [string, string, string]> = {
  A: ["Angry", "Ants", "Admire"], B: ["Brave", "Bears", "Bake"], C: ["Crunchy", "Cats", "Chase"], D: ["Dizzy", "Dogs", "Dance"],
  E: ["Eager", "Elephants", "Eat"], F: ["Fluffy", "Frogs", "Find"], G: ["Giant", "Goats", "Grab"], H: ["Happy", "Hippos", "Hug"],
  I: ["Icy", "Iguanas", "Invent"], J: ["Jolly", "Jellyfish", "Juggle"], K: ["Kind", "Kangaroos", "Kick"], L: ["Lazy", "Lions", "Lick"],
  M: ["Merry", "Monkeys", "Munch"], N: ["Noisy", "Newts", "Nibble"], O: ["Odd", "Oranges", "Open"], P: ["Purple", "Penguins", "Paint"],
  Q: ["Quiet", "Queens", "Quack"], R: ["Rowdy", "Rabbits", "Race"], S: ["Silly", "Snakes", "Sing"], T: ["Tiny", "Tigers", "Tickle"],
  U: ["Ugly", "Unicorns", "Unpack"], V: ["Violet", "Vultures", "Visit"], W: ["Wild", "Whales", "Wave"], X: ["Xtra", "X-rays", "Xerox"],
  Y: ["Yellow", "Yaks", "Yell"], Z: ["Zany", "Zebras", "Zoom"],
};
const ROLES = [0, 1, 2, 0, 1, 2]; // adjective, noun, verb, adjective, noun…

function mnemonic(k: Knowledge, topic: string): string {
  const terms = (topic ? search(k, topic, 6).flatMap((r) => index(k).terms.filter((t) => r.text.toLowerCase().includes(t.term.toLowerCase()))) : [])
    .concat(index(k).terms)
    .filter((t, i, a) => a.findIndex((x) => x.term === t.term) === i)
    .slice(0, 5);
  if (terms.length < 2) {
    const card = k.flashcards[0];
    return card ? `Try linking it to a picture: imagine **${card.back}** whenever you see “${card.front.replace(/[“”]/g, "")}”. Silly images stick best.` : "";
  }
  const letters = terms.map((t) => t.term[0].toUpperCase()).join("");
  const phrase = terms
    .map((t, i) => {
      const L = t.term[0].toUpperCase();
      const w = WORD_BANK[L]?.[ROLES[i % ROLES.length]] ?? t.term;
      return `**${L}**${w.slice(1)}`;
    })
    .join(" ");
  return `Here's a memory trick for **${letters}**: ${phrase}.\n\n${terms.map((t) => `- **${t.term[0].toUpperCase()}** is for **${t.term}**: ${t.definition}`).join("\n")}\n\nSay it out loud twice, then I'll quiz you on it.`;
}

function studyPlan(k: Knowledge, last: string): string {
  const days = Number((last.match(/(\d+)\s*(day|days)/i) ?? [])[1] ?? 7);
  const n = k.flashcards.length;
  const steps = [1, 2, 4, 7, 14].filter((d) => d <= Math.max(days, 2));
  return `Here's a ${days}-day plan for **${k.title}**, using spaced repetition (each review is spaced further apart, which makes memories last):\n\n${steps
    .map((d, i) => `- **Day ${d}:** ${i === 0 ? `learn all ${n} flashcards, then practise with me for 10 minutes` : i === steps.length - 1 ? "duel a friend on it as a final check" : `review the cards you missed (about ${Math.max(3, Math.round(n / (i + 2)))}), then one practice round`}`)
    .join("\n")}\n\nShort and often beats one long cram. Want to start today's session now?\n\n${choicesTag(["Start practice", "Summarize my notes"])}`;
}

// ---------------------------------------------------------------------------
// When there's no study set: Raj's own study-skills coaching
// ---------------------------------------------------------------------------

const SKILLS: { keys: RegExp; text: string }[] = [
  { keys: /active recall|retriev|test yourself|self.?test/i, text: "**Active recall** means pulling an answer out of your memory instead of re-reading it. Close the notes and try to say the key points from memory, then check. It feels harder than re-reading, and that effort is exactly what makes it stick." },
  { keys: /spaced|repetition|forget|remember long|retain/i, text: "**Spaced repetition** means reviewing just as you're about to forget: after 1 day, then 3, then a week, then two. Each review takes less time and the memory lasts longer. Flashcards and short daily practice with me do this for you." },
  { keys: /pomodoro|focus|concentrat|distract|phone/i, text: "Try the **Pomodoro method**: 25 minutes of focused study, then a 5-minute break; after four rounds, take a longer break. Put your phone in another room. It's easier to focus when you know a break is coming." },
  { keys: /feynman|understand|explain it|teach/i, text: "The **Feynman technique**: explain the topic in plain words as if teaching a 12-year-old. Wherever you get stuck or reach for jargon, that's the gap to go back and learn." },
  { keys: /stress|anxious|nervous|panic|worried|overwhelm|scared/i, text: "Exam nerves are normal, and a bit of adrenaline actually helps. Try this: breathe in for 4, hold for 4, out for 6. Then pick one small topic and do just 5 minutes on it. Starting is usually the hardest part." },
  { keys: /procrastinat|motivat|can'?t start|lazy|bored/i, text: "When you can't get started, make the first step tiny: \"I'll do 2 flashcards.\" Once you've begun, carrying on is easy. Reward yourself after a session, and keep a streak going here so each day builds on the last." },
  { keys: /notes|note.?taking|cornell|summar/i, text: "**Cornell notes**: split the page into notes on the right, questions on the left and a short summary at the bottom. Turning notes into questions makes revision much faster. Paste your notes into Study and I'll turn them into flashcards for you." },
  { keys: /exam|revision|revise|test tomorrow|plan|timetable|schedule/i, text: "A good revision plan: list your topics, rate each red, amber or green, and spend most time on the reds. Mix topics within a session (that's called interleaving) and finish each day with a 10-minute self-test." },
  { keys: /sleep|tired|night|all.?nighter/i, text: "Sleep is when your brain files away what you learned. An all-nighter usually costs more than it gains. Aim for 8 hours, especially before an exam, and review your flashcards in the evening." },
];

function coach(last: string): string {
  const hit = SKILLS.find((s) => s.keys.test(last));
  const tail = `\n\nFor practice on your own material, pick a study set above, or open **Study** to add one.\n\n${choicesTag(["Teach me active recall", "How should I revise for an exam?", "I can't focus"])}`;
  if (hit) return hit.text + tail;
  return `I can coach you on how to study: active recall, spaced repetition, focus, exam nerves and revision plans. Pick a study set and I'll teach and quiz you on your own notes.${tail}`;
}

// ---------------------------------------------------------------------------
// The conversation
// ---------------------------------------------------------------------------

/** Messages that are requests to Raj, never answers to the open flashcard. */
const COMMAND = /^\s*(next|another|skip|quiz me|start practice|practi[cs]e|explain|summar|mnemonic|plan|make|give me an example|what did i|review|i'?m done|done for now|stop)\b/i;

export function brainReply(history: BrainMessage[], k: Knowledge | null): string {
  const last = history[history.length - 1]?.content.trim() ?? "";
  const low = last.toLowerCase();

  if (/^\s*(hi|hey|hello|yo|hiya|good (morning|afternoon|evening))\b/.test(low) && last.length < 40) {
    return k
      ? `Hi! Ready to work on **${k.title}**? We can practise, or I can explain anything that's confusing.\n\n${choicesTag(["Start practice", "Summarize my notes", "Make a study plan"])}`
      : `Hi, I'm **Raj**! Pick a study set above, or open **Study** to add your notes, and I'll teach and quiz you on them. I can also coach you on how to study.\n\n${choicesTag(["How should I revise for an exam?", "Teach me active recall", "I can't focus"])}`;
  }
  if (/\b(thank|thanks|cheers|ta)\b/.test(low) && last.length < 60) {
    return `Any time! Want to keep going?\n\n${choicesTag(k ? ["Next question", "I'm done for now"] : ["Teach me active recall"])}`;
  }
  if (/who are you|what can you do|how do you work|^help$|what do you do/.test(low)) {
    return `I'm **Raj**, your study tutor. I can:\n\n- quiz you with multiple choice, true or false, and type-your-answer questions\n- give hints that get stronger each time\n- explain things simply, give examples, and compare ideas\n- make memory tricks and study plans\n- bring back the questions you got wrong\n\n${choicesTag(k ? ["Start practice", "Explain the key ideas simply"] : ["How should I revise for an exam?"])}`;
  }

  if (!k || !k.flashcards.length) return coach(last);

  if (/^\s*(i'?m done|done|stop|finish|end|that'?s enough)/.test(low)) {
    const rs = results(history);
    const right = rs.filter((r) => r.correct).length;
    const weak = weakCards(history);
    if (!rs.length) return `No problem. Come back any time; even 5 minutes a day adds up.\n\n${choicesTag(["Start practice"])}`;
    return `Great session! You got **${right} of ${rs.length}** right (${Math.round((right / rs.length) * 100)}%).${
      weak.length ? `\n\nCards to review next time:\n${weak.slice(0, 5).map((i) => `- ${k.flashcards[i].front.replace(/[“”]/g, "")} → **${k.flashcards[i].back}**`).join("\n")}` : "\n\nYou didn't miss a single one in the end."
    }\n\nShort, regular practice beats one long cram. See you tomorrow!\n\n${choicesTag(["Start practice again"])}`;
  }

  const p = pending(history);
  // A real question mid-practice ("why does…?") gets answered, not marked wrong.
  const asksQuestion = /\?\s*$/.test(last) || /^\s*(what|what's|why|how|when|where|who|which|explain|define|compare|tell me|can you|could you|is there)\b/i.test(last);
  const looksLikeAnswer = (i: number) => mark(k.flashcards[i]?.back ?? "", last).score === 1 || cardOptions(k, i).some((o) => norm(o) === norm(last));
  if (p && asksQuestion && !/\b(hint|clue)\b/i.test(last) && !looksLikeAnswer(p.index)) {
    /* fall through to answer it */
  } else if (p && (/\b(hint|clue)\b/i.test(last) || !COMMAND.test(last))) {
    const r = practice(k, history, last, p);
    if (r) return r;
  }

  if (/\b(quiz|test) me\b|\bpracti[cs]e\b|^\s*(next|another|skip|go|again|ready)\b/.test(low)) {
    const i = pickCard(k, history);
    const asked = history.filter((m) => m.role === "assistant" && ASK_RE.test(m.content)).length;
    const format: Format = (["mc", "tf", "type"] as Format[])[asked % 3];
    const weak = weakCards(history).includes(i);
    const intro = asked === 0 ? "Let's practise! Tap an answer, or type your own.\n\n" : weak ? "Let's try this one again.\n\n" : "";
    return ask(k, i, format, intro);
  }

  if (/\b(weak|mistakes?|wrong|missed|review)\b/.test(low)) {
    const weak = weakCards(history);
    if (!weak.length) return `You haven't missed any yet. Let's find out what you know!\n\n${choicesTag(["Start practice"])}`;
    return `Here's what to review:\n\n${weak.map((i) => `- ${k.flashcards[i].front.replace(/[“”]/g, "")} → **${k.flashcards[i].back}**`).join("\n")}\n\n${choicesTag(["Quiz me on these", "Make a memory trick"])}`;
  }

  if (/\b(mnemonic|memory trick|remember|memori[sz]e)\b/.test(low)) return `${mnemonic(k, last)}\n\n${choicesTag(["Quiz me", "Explain it more"])}`;
  if (/\b(plan|schedule|timetable|revis(e|ion)|exam)\b/.test(low)) return studyPlan(k, last);

  if (/\b(summar|overview|key (ideas|points)|main (ideas|points)|tl;?dr|recap|what should i focus)/.test(low)) {
    const terms = index(k).terms.slice(0, 5);
    const summary = k.notes?.summary || search(k, k.title, 2).map((r) => r.text).join(". ");
    return `${summary}${terms.length ? `\n\nThe key terms to know:\n${terms.map((t) => `- **${t.term}**: ${t.definition}`).join("\n")}` : ""}\n\nReady to test yourself?\n\n${choicesTag(["Start practice", "Make a memory trick"])}`;
  }

  // "explain it more" / "simpler" about the last flashcard, or a topic
  const lastCard = (() => {
    const m = [...history].reverse().find((h) => h.role === "assistant" && ASK_RE.test(h.content));
    return m ? Number(m.content.match(ASK_RE)![1]) - 1 : null;
  })();
  if (/\b(explain|simpl|eli5|more detail|tell me more|in plain|don'?t understand|confus)/.test(low)) {
    const topic = /\b(it|that|this|more)\b/.test(low) && lastCard !== null ? `${k.flashcards[lastCard].front} ${k.flashcards[lastCard].back}` : last;
    const hits = search(k, topic, 3);
    if (hits.length) {
      const simple = /simpl|eli5|plain|confus|don'?t understand/.test(low);
      const body = hits.map((h) => `- ${simple ? simplify(h.text, index(k).terms) : h.text}`).join("\n");
      return `${simple ? "Here it is in plain words:" : "Here's the bigger picture:"}\n\n${body}\n\nCan you say it back in your own words? Type it and I'll check.\n\n${choicesTag(["Give me an example", "Quiz me", "Make a memory trick"])}`;
    }
  }

  if (/\b(differen|compar|vs\b|versus)/.test(low)) {
    const parts = last.split(/\b(?:and|vs\.?|versus|or|between|compare|difference)\b/i).map((s) => s.trim()).filter((s) => tokens(s).length);
    const [a, b] = parts.slice(-2);
    if (a && b) {
      const sa = search(k, a, 2), sb = search(k, b, 2);
      if (sa.length && sb.length) {
        return `Let's compare them:\n\n**${cap(clean(a).replace(/[?!]+$/, ""))}**\n${sa.map((s) => `- ${s.text}`).join("\n")}\n\n**${cap(clean(b).replace(/[?!]+$/, ""))}**\n${sb.map((s) => `- ${s.text}`).join("\n")}\n\nWhich difference do you think matters most for the exam?\n\n${choicesTag(["Quiz me", "Explain it more simply"])}`;
      }
    }
  }

  if (/\bexamples?\b|\bsuch as\b|\bfor instance\b/.test(low)) {
    const topic = lastCard !== null && /\b(it|that|this|an example)\b/.test(low) ? k.flashcards[lastCard].front : last;
    const ex = search(k, `${topic} such as example`, 2, /such as|for example|e\.g\.|for instance|like /i);
    if (ex.length) return `Here's an example from your notes:\n\n${ex.map((s) => `- ${s.text}`).join("\n")}\n\n${choicesTag(["Quiz me", "Explain it more"])}`;
  }

  const term = /\b(what (is|are)|define|meaning|mean)\b/.test(low) ? findTerm(k, last) : undefined;
  if (term) {
    const extra = search(k, term.term, 2).map((r) => r.text).filter((t) => !t.toLowerCase().startsWith(term.term.toLowerCase() + " is"))[0];
    return `**${term.term}**: ${term.definition}.${extra ? `\n\nIn your notes: “${extra}.”` : ""}\n\nQuick check: can you think of where ${term.term.toLowerCase()} shows up in this topic?\n\n${choicesTag(["Quiz me", "Explain it more simply", "Make a memory trick"])}`;
  }

  const boost = /^\s*why\b/i.test(last) ? /because|so that|therefore|leads to|causes|in order to|due to|which means/i : /^\s*how\b/i.test(last) ? /by |through|using|when |then|process/i : undefined;
  const hits = search(k, last, 3, boost);
  if (hits.length) {
    return `Here's what your notes say:\n\n${hits.map((h) => `- ${h.text}`).join("\n")}\n\nDoes that answer it? I can quiz you on it too.\n\n${choicesTag(["Quiz me", "Explain it more simply", "Give me an example"])}`;
  }

  const close = index(k).terms.map((t) => ({ t, s: Math.max(...tokens(last).map((w) => similar(w, t.term))) })).sort((a, b) => b.s - a.s)[0];
  return `I couldn't find that in your notes on **${k.title}**.${close && close.s > 0.5 ? ` Did you mean **${close.t.term}**?` : ""} Try asking with words from your notes, or let's practise.\n\n${choicesTag([close && close.s > 0.5 ? `What is ${close.t.term}?` : "Summarize my notes", "Start practice"])}`;
}
