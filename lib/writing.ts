/**
 * 11+ creative and essay writing: original tasks, planning help, and an
 * offline checker that gives "two stars and a wish" style feedback. It can't
 * judge ideas like a teacher, but it spots the things markers look for.
 */

export type WritingKind = "creative" | "essay";

export interface WritingTask {
  id: string;
  kind: WritingKind;
  form: "story" | "description" | "discursive" | "persuasive" | "letter" | "speech" | "personal";
  title: string;
  prompt: string;
  minutes: number;
  plan: string[];
}

const STORY_PLAN = [
  "Opening: drop the reader straight into the action or the setting (2–3 sentences).",
  "Build-up: introduce your character and what they want.",
  "Problem: something goes wrong or changes.",
  "Resolution: how is it solved, or not?",
  "Ending: link back to the opening or end with a twist.",
];
const DESCRIPTION_PLAN = [
  "Zoom in: start with one small, sharp detail.",
  "Use all five senses: sight, sound, smell, touch, taste.",
  "Move through the scene: near to far, or before to after.",
  "Include one simile, one metaphor and one bit of personification.",
  "End with a mood: how does the place make you feel?",
];
const DISCURSIVE_PLAN = [
  "Introduction: say what the question is and why it matters.",
  "Paragraph 1: arguments for, with an example.",
  "Paragraph 2: arguments against, with an example.",
  "Conclusion: your own view, and why.",
];
const PERSUASIVE_PLAN = [
  "Open with a hook: a question, a fact or a short story.",
  "Three strong reasons, one per paragraph, each with evidence.",
  "Answer the other side: \"Some people say… however…\"",
  "Finish with a call to action: what should the reader do?",
];

export const WRITING_TASKS: WritingTask[] = [
  { id: "c-green-door", kind: "creative", form: "story", title: "The green door", prompt: "Write a story that begins: \"Nobody had ever noticed the little green door before…\"", minutes: 30, plan: STORY_PLAN },
  { id: "c-storm", kind: "creative", form: "description", title: "The storm", prompt: "Describe a storm arriving at the seaside. Use all five senses.", minutes: 25, plan: DESCRIPTION_PLAN },
  { id: "c-lost", kind: "creative", form: "story", title: "Lost", prompt: "Write a story about a character who gets lost somewhere unfamiliar.", minutes: 30, plan: STORY_PLAN },
  { id: "c-box", kind: "creative", form: "story", title: "The box in the attic", prompt: "Write a story about finding a mysterious box in the attic. What is inside, and what happens next?", minutes: 30, plan: STORY_PLAN },
  { id: "c-planet", kind: "creative", form: "description", title: "A new planet", prompt: "You are the first person to step onto a new planet. Describe what you see, hear and feel.", minutes: 25, plan: DESCRIPTION_PLAN },
  { id: "c-market", kind: "creative", form: "description", title: "The market", prompt: "Describe a busy market, from early morning until it closes.", minutes: 25, plan: DESCRIPTION_PLAN },
  { id: "c-last-time", kind: "creative", form: "story", title: "The last time", prompt: "Write a story that ends: \"…and that was the last time I ever saw it.\"", minutes: 30, plan: STORY_PLAN },
  { id: "c-race", kind: "creative", form: "story", title: "The race", prompt: "Write a story about a race where something unexpected happens.", minutes: 30, plan: STORY_PLAN },
  { id: "c-museum", kind: "creative", form: "story", title: "Night at the museum", prompt: "You get locked in a museum overnight. Tell the story.", minutes: 30, plan: STORY_PLAN },
  { id: "c-winter", kind: "creative", form: "description", title: "The first snow", prompt: "Describe waking up to the first snow of winter.", minutes: 25, plan: DESCRIPTION_PLAN },
  { id: "e-homework", kind: "essay", form: "discursive", title: "Homework", prompt: "Should homework be banned? Write a balanced essay giving both sides, then your view.", minutes: 30, plan: DISCURSIVE_PLAN },
  { id: "e-greener", kind: "essay", form: "letter", title: "A greener school", prompt: "Write a letter to your head teacher persuading them to make your school greener.", minutes: 30, plan: ["Start: \"Dear …,\" and say why you're writing.", ...PERSUASIVE_PLAN.slice(1), "End: \"Yours sincerely\" (if you used their name) and your name."] },
  { id: "e-phones", kind: "essay", form: "discursive", title: "Phones at school", prompt: "Should children be allowed mobile phones at primary school? Discuss both sides.", minutes: 30, plan: DISCURSIVE_PLAN },
  { id: "e-city", kind: "essay", form: "discursive", title: "City or countryside?", prompt: "Is it better to grow up in a city or in the countryside?", minutes: 30, plan: DISCURSIVE_PLAN },
  { id: "e-reading", kind: "essay", form: "speech", title: "Read more!", prompt: "Write a speech persuading your class to read more books.", minutes: 25, plan: PERSUASIVE_PLAN },
  { id: "e-zoos", kind: "essay", form: "discursive", title: "Zoos", prompt: "Should zoos exist? Give arguments for and against.", minutes: 30, plan: DISCURSIVE_PLAN },
  { id: "e-uniform", kind: "essay", form: "persuasive", title: "School uniform", prompt: "Should school uniform be compulsory? Persuade the reader of your view.", minutes: 30, plan: PERSUASIVE_PLAN },
  { id: "e-influence", kind: "essay", form: "personal", title: "Someone who inspires me", prompt: "Describe a person who has influenced you, and explain why they matter to you.", minutes: 30, plan: ["Introduce the person with a vivid detail or moment.", "Paragraph 1: what they are like, with examples.", "Paragraph 2: a time they made a difference to you.", "Conclusion: what you've learned, and how it shapes you."] },
];

export const FREE_WRITING_PER_KIND = 3;

export const taskById = (id: string) => WRITING_TASKS.find((t) => t.id === id);

// ---------------------------------------------------------------------------
// Offline checker
// ---------------------------------------------------------------------------

export interface Criterion {
  name: string;
  score: number; // 0–3
  note: string;
}

export interface WritingReport {
  words: number;
  paragraphs: number;
  criteria: Criterion[];
  stars: string[]; // what went well
  wish: string; // next step
  total: number; // out of criteria.length * 3
}

const WEAK = ["nice", "good", "bad", "said", "got", "went", "big", "small", "very", "really", "lots", "thing", "stuff", "okay", "ok"];
const CONNECTIVES = ["however", "furthermore", "moreover", "therefore", "consequently", "nevertheless", "although", "whereas", "on the other hand", "in addition", "as a result", "for example", "for instance", "firstly", "secondly", "finally", "in conclusion", "to conclude", "overall", "meanwhile", "despite"];
const SENSES = /\b(heard|hear|listen|whisper|roar|crash|smell|smelt|scent|stench|taste|tasted|bitter|sweet|salty|touch|felt|rough|smooth|icy|warm|cold|glimmer|glint|shimmer|gleam|saw|sparkl)\w*/gi;

const sentencesOf = (t: string) => t.replace(/\s+/g, " ").split(/(?<=[.!?])\s+(?=["'“‘]?[A-Z])/).map((s) => s.trim()).filter((s) => s.split(" ").length >= 2);

export function analyseWriting(text: string, kind: WritingKind, target = 250): WritingReport {
  const clean = text.trim();
  const words = clean ? clean.split(/\s+/).length : 0;
  const paragraphs = clean ? clean.split(/\n\s*\n|\n(?=\s{2,}|\t)/).filter((p) => p.trim().split(/\s+/).length >= 8).length || (words ? 1 : 0) : 0;
  const sentences = sentencesOf(clean);
  const lens = sentences.map((s) => s.split(" ").length);
  const mean = lens.reduce((a, b) => a + b, 0) / Math.max(1, lens.length);
  const spread = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, lens.length));
  const lower = clean.toLowerCase();
  const tokens = lower.match(/[a-z']+/g) ?? [];
  const unique = new Set(tokens).size / Math.max(1, tokens.length);
  const long = new Set(tokens.filter((w) => w.length >= 8)).size;
  const weak = tokens.filter((w) => WEAK.includes(w)).length;
  const punct = [/[?]/, /!/, /,/, /;/, /:/, /[—–-]\s/, /\(/, /["“”]/, /'[a-z]/i].filter((r) => r.test(clean)).length;
  const openers = sentences.map((s) => (s.replace(/^["'“‘]/, "").split(/[\s,]/)[0] ?? "").toLowerCase());
  const openerVariety = new Set(openers).size / Math.max(1, openers.length);
  const commonOpener = Object.entries(openers.reduce<Record<string, number>>((m, o) => ((m[o] = (m[o] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1])[0];

  const c: Criterion[] = [];
  const lengthScore = words >= target ? 3 : words >= target * 0.7 ? 2 : words >= target * 0.4 ? 1 : 0;
  c.push({ name: "Length", score: lengthScore, note: words >= target ? `${words} words: a good length for the time.` : `${words} words. Aim for about ${target} in the time.` });
  const paraScore = paragraphs >= 4 ? 3 : paragraphs === 3 ? 2 : paragraphs === 2 ? 1 : 0;
  c.push({ name: "Paragraphs", score: paraScore, note: paragraphs >= 4 ? `${paragraphs} paragraphs. Clear structure.` : `${paragraphs} paragraph${paragraphs === 1 ? "" : "s"}. Start a new one for each new time, place, speaker or idea (leave a blank line).` });
  const varietyScore = sentences.length < 3 ? 0 : (spread >= 6 ? 2 : spread >= 3.5 ? 1 : 0) + (lens.some((l) => l <= 5) ? 1 : 0);
  c.push({ name: "Sentence variety", score: Math.min(3, varietyScore), note: varietyScore >= 3 ? "A great mix of long and short sentences." : lens.some((l) => l <= 5) ? "Mix in some longer sentences with commas and linking words." : "Try a short, punchy sentence for effect. Like this." });
  const vocabScore = Math.min(3, (long >= 8 ? 2 : long >= 4 ? 1 : 0) + (unique > 0.55 ? 1 : 0)) - (weak > Math.max(3, words / 60) ? 1 : 0);
  c.push({ name: "Vocabulary", score: Math.max(0, vocabScore), note: weak > Math.max(3, words / 60) ? `Swap plain words (like ${[...new Set(tokens.filter((w) => WEAK.includes(w)))].slice(0, 3).join(", ")}) for more precise ones.` : long >= 8 ? "Ambitious, precise word choices." : "Add a few more ambitious words to show off your vocabulary." });
  c.push({ name: "Punctuation range", score: punct >= 6 ? 3 : punct >= 4 ? 2 : punct >= 2 ? 1 : 0, note: punct >= 6 ? "A wide range of punctuation used." : "Try using a question mark, exclamation mark, semicolon, dash or brackets where they fit." });
  c.push({ name: "Sentence openers", score: openerVariety > 0.75 ? 3 : openerVariety > 0.55 ? 2 : openerVariety > 0.4 ? 1 : 0, note: openerVariety > 0.75 ? "Varied sentence starts keep the reader interested." : `Lots of sentences start with "${commonOpener?.[0] ?? "the same word"}". Try starting with an -ly word, a place ("Beneath the bridge,") or a feeling ("Nervously,").` });

  if (kind === "creative") {
    const similes = (lower.match(/\b(like a|like an|as [a-z]+ as)\b/g) ?? []).length;
    const senses = new Set((clean.match(SENSES) ?? []).map((w) => w.toLowerCase().slice(0, 4))).size;
    const speech = /["“][^"”]{3,}["”]/.test(clean);
    c.push({ name: "Imagery", score: Math.min(3, (similes >= 2 ? 2 : similes) + (senses >= 4 ? 1 : 0)), note: similes >= 2 ? "Vivid images help the reader picture it." : "Add a simile or two (\"as silent as a held breath\") and details for more than one sense." });
    c.push({ name: "Story craft", score: Math.min(3, (speech ? 1 : 0) + (paragraphs >= 3 ? 1 : 0) + (/\?|!/.test(clean) ? 1 : 0)), note: speech ? "Dialogue brings your characters to life." : "A line or two of dialogue can show character and move the story on." });
  } else {
    const links = CONNECTIVES.filter((w) => lower.includes(w));
    const counter = /\b(some people|others (?:argue|say|think|believe)|on the other hand|however|critics)\b/.test(lower);
    const conclusion = /\b(in conclusion|to conclude|overall|to sum up|in summary)\b/.test(lower);
    const rhetorical = /\?/.test(clean);
    c.push({ name: "Linking ideas", score: links.length >= 5 ? 3 : links.length >= 3 ? 2 : links.length >= 1 ? 1 : 0, note: links.length >= 3 ? `Good linking words: ${links.slice(0, 4).join(", ")}.` : "Use linking words like firstly, furthermore, however and therefore to guide the reader." });
    c.push({ name: "Argument", score: (counter ? 1 : 0) + (conclusion ? 1 : 0) + (rhetorical ? 1 : 0), note: !counter ? "Show the other side (\"Some people argue… however…\"), then knock it down." : !conclusion ? "Finish with a clear conclusion that answers the question." : "Clear argument with both sides and a conclusion." });
  }

  const sorted = [...c].sort((a, b) => b.score - a.score);
  const total = c.reduce((a, x) => a + x.score, 0);
  return {
    words,
    paragraphs,
    criteria: c,
    stars: sorted.filter((x) => x.score >= 2).slice(0, 2).map((x) => x.note),
    wish: [...c].sort((a, b) => a.score - b.score)[0].note,
    total,
  };
}

// ---------------------------------------------------------------------------
// Drafts, kept in the browser
// ---------------------------------------------------------------------------

const draftKey = (id: string) => `quiz-duel:writing:${id}`;
export function loadDraft(id: string): string {
  try {
    return localStorage.getItem(draftKey(id)) ?? "";
  } catch {
    return "";
  }
}
export function saveDraft(id: string, text: string) {
  try {
    localStorage.setItem(draftKey(id), text);
  } catch {
    /* storage blocked */
  }
}
