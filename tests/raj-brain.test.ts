import { describe, expect, it } from "vitest";
import { brainReply, levenshtein, mark, search, stem, type BrainMessage, type Knowledge } from "@/lib/raj-brain";

const k: Knowledge = {
  title: "Biology",
  material:
    "Photosynthesis is the process plants use to turn light into chemical energy. It happens in the chloroplasts, which contain chlorophyll. " +
    "Plants need sunlight because chlorophyll absorbs light energy to split water. " +
    "Respiration releases energy from glucose, for example in muscle cells during exercise. " +
    "Mitosis produces two identical daughter cells. Meiosis produces four genetically different gametes.",
  notes: {
    summary: "Plants make food with light; cells release energy and divide.",
    sections: [],
    keyTerms: [
      { term: "Chlorophyll", definition: "The green pigment that absorbs light" },
      { term: "Mitosis", definition: "Cell division that makes two identical cells" },
      { term: "Meiosis", definition: "Cell division that makes four gametes" },
    ],
  },
  flashcards: [
    { front: "Where does photosynthesis happen?", back: "In the chloroplasts" },
    { front: "What does chlorophyll absorb?", back: "Light energy" },
    { front: "How many cells does mitosis make?", back: "Two identical daughter cells" },
    { front: "What does meiosis make?", back: "Four genetically different gametes" },
  ],
};

/** Plays a conversation, letting Raj reply after each user line. */
function chat(...lines: string[]): BrainMessage[] {
  const h: BrainMessage[] = [];
  for (const l of lines) {
    h.push({ role: "user", content: l });
    h.push({ role: "assistant", content: brainReply(h, k) });
  }
  return h;
}
const lastReply = (h: BrainMessage[]) => h[h.length - 1].content;
const cardOf = (reply: string) => k.flashcards[Number(reply.match(/Flashcard (\d+)/)![1]) - 1];

describe("text tools", () => {
  it("stems, measures edits and ranks with BM25", () => {
    expect(stem("cells")).toBe(stem("cell"));
    expect(levenshtein("kitten", "sitting")).toBe(3);
    expect(search(k, "why do plants need sunlight")[0].text).toMatch(/sunlight/);
  });

  it("marks typos and paraphrases fairly", () => {
    expect(mark("In the chloroplasts", "chloroplast").score).toBe(1);
    expect(mark("In the chloroplasts", "in the cloroplasts").score).toBe(1);
    expect(mark("Four genetically different gametes", "four gametes").score).toBe(0.5);
    expect(mark("Light energy", "water").score).toBe(0);
  });
});

describe("Raj's brain", () => {
  it("answers why-questions from the student's notes", () => {
    expect(brainReply([{ role: "user", content: "Why do plants need sunlight?" }], k)).toMatch(/absorbs light energy/);
  });

  it("defines key terms and compares ideas", () => {
    expect(brainReply([{ role: "user", content: "what is chlorophyl?" }], k)).toMatch(/\*\*Chlorophyll\*\*: The green pigment/);
    const cmp = brainReply([{ role: "user", content: "What's the difference between mitosis and meiosis?" }], k);
    expect(cmp).toMatch(/compare/i);
    expect(cmp).toMatch(/two identical/);
    expect(cmp).toMatch(/four genetically/);
  });

  it("finds examples, makes memory tricks and study plans", () => {
    expect(brainReply([{ role: "user", content: "give me an example of respiration" }], k)).toMatch(/muscle cells/);
    expect(brainReply([{ role: "user", content: "make a mnemonic" }], k)).toMatch(/memory trick/);
    expect(brainReply([{ role: "user", content: "make me a 5 day plan" }], k)).toMatch(/5-day plan[\s\S]*Day 1/);
  });

  it("rotates practice formats: multiple choice, true/false, then type-in", () => {
    const h = chat("Start practice");
    expect(lastReply(h)).toMatch(/<choices>/);
    h.push({ role: "user", content: cardOf(lastReply(h)).back });
    h.push({ role: "assistant", content: brainReply(h, k) });
    expect(lastReply(h)).toMatch(/\*\*Correct!\*\*/);

    h.push({ role: "user", content: "Next question" });
    h.push({ role: "assistant", content: brainReply(h, k) });
    expect(lastReply(h)).toMatch(/True or false\?/);

    h.push({ role: "user", content: "Next question" });
    h.push({ role: "assistant", content: brainReply(h, k) });
    expect(lastReply(h)).toMatch(/Type your answer/);
    h.push({ role: "user", content: cardOf(lastReply(h)).back.toLowerCase() });
    h.push({ role: "assistant", content: brainReply(h, k) });
    expect(lastReply(h)).toMatch(/\*\*Correct!\*\*/);
  });

  it("gives stronger hints each time", () => {
    const h = chat("Start practice", "Give me a hint");
    expect(lastReply(h)).toMatch(/nudge[\s\S]*Hint 1/);
    h.push({ role: "user", content: "another hint please" });
    h.push({ role: "assistant", content: brainReply(h, k) });
    expect(lastReply(h)).toMatch(/Hint 2/);
  });

  it("brings missed cards back and summarizes the session", () => {
    const h = chat("Start practice", "nonsense", "still wrong");
    expect(lastReply(h)).toMatch(/The answer is \*\*/);
    const missed = cardOf(h.find((m) => m.role === "assistant" && /Flashcard/.test(m.content))!.content);

    h.push({ role: "user", content: "what did I get wrong?" });
    h.push({ role: "assistant", content: brainReply(h, k) });
    expect(lastReply(h)).toContain(missed.back);

    h.push({ role: "user", content: "I'm done for now" });
    h.push({ role: "assistant", content: brainReply(h, k) });
    expect(lastReply(h)).toMatch(/0 of 1/);
    expect(lastReply(h)).toContain(missed.back);
  });

  it("coaches study skills when there's no set", () => {
    expect(brainReply([{ role: "user", content: "I'm so stressed about my exam" }], null)).toMatch(/breathe/);
    expect(brainReply([{ role: "user", content: "what is spaced repetition" }], null)).toMatch(/Spaced repetition/);
  });
});

describe("practice interruptions", () => {
  it("answers a question asked mid-practice instead of marking it", () => {
    const h = chat("Start practice", "Why do plants need sunlight?");
    expect(lastReply(h)).not.toMatch(/Not quite/);
    expect(lastReply(h)).toMatch(/absorbs light energy/);
  });
});

describe("commands mid-practice", () => {
  it("treats quick actions as requests, not answers", () => {
    const h = chat("Start practice", "Make a memory trick");
    expect(lastReply(h)).not.toMatch(/Not quite/);
    expect(lastReply(h)).toMatch(/memory trick|picture/);
  });
});
