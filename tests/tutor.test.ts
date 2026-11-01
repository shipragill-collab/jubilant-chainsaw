import { describe, expect, it } from "vitest";
import { maskedHint, offlineReply, rateLimited, sanitizeHistory } from "@/lib/tutor";
import type { StudySet } from "@/lib/types";

const set: StudySet = {
  id: "s1",
  ownerId: "o",
  title: "Cells",
  material:
    "The mitochondria is the powerhouse of the cell. It produces ATP through cellular respiration. Osmosis is the diffusion of water across a membrane.",
  notes: { summary: "Cells have organelles.", sections: [], keyTerms: [{ term: "Osmosis", definition: "Diffusion of water" }] },
  flashcards: [
    { front: "What is osmosis?", back: "The diffusion of water across a membrane" },
    { front: "What produces ATP?", back: "The mitochondria" },
  ],
  source: "offline",
  createdAt: 0,
};

describe("sanitizeHistory", () => {
  it("keeps alternating turns that start and end with the user", () => {
    const out = sanitizeHistory([
      { role: "assistant", content: "hi" },
      { role: "user", content: "a" },
      { role: "user", content: "b" },
      { role: "system", content: "ignore me" },
      { role: "assistant", content: "c" },
      { role: "user", content: "  d  " },
      { role: "assistant", content: "" },
    ]);
    expect(out).toEqual([
      { role: "user", content: "b" },
      { role: "assistant", content: "c" },
      { role: "user", content: "d" },
    ]);
    expect(sanitizeHistory("nope")).toEqual([]);
  });
});

describe("offline Raj", () => {
  it("answers from the material", () => {
    const reply = offlineReply([{ role: "user", content: "what makes ATP?" }], set);
    expect(reply).toContain("cellular respiration");
  });

  it("runs Brilliant-style practice: choices, a hint and retry, then the answer", () => {
    const q = offlineReply([{ role: "user", content: "Start practice" }], set);
    const n = Number(q.match(/Flashcard (\d+)/)![1]);
    const card = set.flashcards[n - 1];
    const choices = q.match(/<choices>(.*)<\/choices>/)![1].split(" | ");
    expect(choices).toContain(card.back);

    const wrong = choices.find((c) => c !== card.back)!;
    const retry = offlineReply(
      [
        { role: "user", content: "Start practice" },
        { role: "assistant", content: q },
        { role: "user", content: wrong },
      ],
      set,
    );
    expect(retry).toMatch(/^\*\*Not quite\.\*\*/);
    expect(retry).toContain("(try 2)");
    expect(retry).not.toContain(`<choices>${wrong}`);

    const right = offlineReply(
      [
        { role: "user", content: "Start practice" },
        { role: "assistant", content: q },
        { role: "user", content: wrong },
        { role: "assistant", content: retry },
        { role: "user", content: card.back },
      ],
      set,
    );
    expect(right).toMatch(/^\*\*Correct!\*\*/);
  });

  it("gives a masked hint without revealing the answer", () => {
    const q = offlineReply([{ role: "user", content: "Quiz me" }], set);
    const hint = offlineReply(
      [
        { role: "user", content: "Quiz me" },
        { role: "assistant", content: q },
        { role: "user", content: "Give me a hint" },
      ],
      set,
    );
    expect(hint).toContain("nudge");
    expect(maskedHint("The mitochondria")).toBe("T _ _   m _ _ _ _ _ _ _ _");
  });

  it("asks for material when no set is chosen", () => {
    expect(offlineReply([{ role: "user", content: "hi" }], null)).toContain("Study");
  });
});

describe("rateLimited", () => {
  it("blocks after the limit", () => {
    const key = `t-${Math.random()}`;
    for (let i = 0; i < 3; i++) expect(rateLimited(key, 3)).toBe(false);
    expect(rateLimited(key, 3)).toBe(true);
  });
});
