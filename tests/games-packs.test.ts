import { describe, expect, it } from "vitest";
import { describeOrder, fulfil } from "@/lib/billing";
import { ITEM_PACKS, howToGet, itemById, packWorth } from "@/lib/catalog";
import { memoryDeck, pairsFrom, quickFireRound, sameWord, scramble, scrambleWords } from "@/lib/games";
import { LIBRARY } from "@/lib/library";
import { profileOf } from "@/lib/profile";
import type { Db } from "@/lib/types";

const seeded = (seed = 7) => {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
};
const bio = LIBRARY.find((p) => p.slug === "biology")!;
const pairs = pairsFrom(bio.flashcards, bio.notes.keyTerms);

describe("note games", () => {
  it("makes short, distinct pairs from key terms and flashcards", () => {
    expect(pairs.length).toBeGreaterThanOrEqual(8);
    expect(pairs[0]).toEqual({ prompt: "Chloroplast", answer: "The organelle where photosynthesis happens" });
    expect(new Set(pairs.map((p) => p.answer)).size).toBe(pairs.length);
  });

  it("Quick Fire statements are honest about true and false", () => {
    const round = quickFireRound(pairs, 40, seeded());
    expect(round).toHaveLength(40);
    for (const s of round) expect(s.isTrue).toBe(s.shown === s.answer);
    expect(round.some((s) => s.isTrue) && round.some((s) => !s.isTrue)).toBe(true);
  });

  it("Memory Flip deals each pair as a question card and an answer card", () => {
    const deck = memoryDeck(pairs, 6, seeded());
    expect(deck).toHaveLength(12);
    for (let i = 0; i < 6; i++) expect(deck.filter((c) => c.pair === i).map((c) => c.side).sort()).toEqual(["answer", "prompt"]);
  });

  it("Word Scramble uses single key terms and never shows the word unscrambled", () => {
    const words = scrambleWords(pairs, bio.notes.keyTerms);
    expect(words.map((w) => w.word)).toContain("Chlorophyll");
    for (const w of words) expect(scramble(w.word, seeded())).not.toBe(w.word.toUpperCase());
    expect(sameWord("chlorophyll ", "Chlorophyll")).toBe(true);
    expect(sameWord("adios", "Adiós")).toBe(true);
  });
});

describe("50p item packs", () => {
  it("only bundle coin-shop items and are worth far more than they cost", () => {
    for (const pack of ITEM_PACKS) {
      for (const id of pack.items) expect(howToGet(itemById(id)!)).toBe("coins");
      expect(new Set(pack.items.map((id) => itemById(id)!.slot)).size).toBe(pack.items.length);
      expect(packWorth(pack)).toBeGreaterThan(1000);
    }
  });

  it("gives every item and the bonus coins when bought", () => {
    const db: Db = { quizzes: {}, duels: {}, studySets: {}, profiles: {}, orders: {} };
    db.orders.o = { id: "o", playerId: "p1", kind: "pack", packId: "pack-wizard", createdAt: 0, status: "pending" };
    expect(describeOrder({ kind: "pack", packId: "pack-wizard" }).pricePence).toBe(50);
    fulfil(db, "o");
    const p = profileOf(db, "p1");
    for (const id of ITEM_PACKS.find((x) => x.id === "pack-wizard")!.items) expect(p.owned).toContain(id);
    expect(p.coins).toBe(500);
    expect(p.equipped.hat).toBe("hat-wizard");
  });
});
