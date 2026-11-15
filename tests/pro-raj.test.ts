import { beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { POST as examRoute } from "@/app/api/study/[id]/exam/route";
import { speakable } from "@/components/raj-chat";
import { packFor } from "@/lib/library";
import { cardsForToday, daysUntil, dueCards, nextMemory, summarize, type SetMemory } from "@/lib/memory";
import { grantPro, profileOf } from "@/lib/profile";
import { brainReply, type BrainMessage, type Knowledge } from "@/lib/raj-brain";
import { SAMPLES } from "@/lib/samples";
import { update } from "@/lib/store";
import { proContext } from "@/lib/tutor";

const DAY = 864e5;
const NOW = Date.parse("2026-11-15T12:00:00Z");

describe("Raj's memory (spaced repetition)", () => {
  it("moves cards up a box when right and back to 1 when wrong", () => {
    let m = nextMemory(undefined, true, NOW);
    expect(m).toMatchObject({ box: 2, seen: 1, right: 1 });
    expect(m.due).toBe(NOW + DAY);
    m = nextMemory(m, true, NOW);
    expect(m.box).toBe(3);
    expect(m.due).toBe(NOW + 3 * DAY);
    m = nextMemory(m, false, NOW);
    expect(m.box).toBe(1);
    expect(m.due).toBe(NOW);
  });

  it("lists due cards weakest first and summarises progress", () => {
    const mem: SetMemory = {
      0: { box: 5, due: NOW + 10 * DAY, seen: 6, right: 6 },
      1: { box: 1, due: NOW - 1, seen: 2, right: 0 },
      2: { box: 3, due: NOW - DAY, seen: 3, right: 2 },
    };
    expect(dueCards(mem, 5, NOW)).toEqual([1, 2]);
    expect(summarize(mem, 5, NOW)).toEqual({ mastered: 1, learning: 1, shaky: 1, fresh: 2, due: 2, total: 5 });
  });

  it("works out days to the exam and today's workload", () => {
    expect(daysUntil("2026-11-25", NOW)).toBe(10);
    expect(daysUntil(null, NOW)).toBeNull();
    const s = { mastered: 2, learning: 3, shaky: 1, fresh: 14, due: 1, total: 20 };
    expect(cardsForToday(s, 6)).toBe(3); // 18 to learn over 6 days
    expect(cardsForToday({ ...s, due: 7 }, 6)).toBe(7); // due reviews come first
  });
});

describe("Pro Raj", () => {
  const sample = SAMPLES.find((s) => s.slug === "chemistry")!;
  const pack = packFor(sample.material)!;
  const base: Knowledge = { title: pack.title, material: sample.material, notes: pack.notes, flashcards: pack.flashcards };
  const say = (k: Knowledge, text: string) => brainReply([{ role: "user", content: text }] as BrainMessage[], k);

  it("reviews due cards when asked", () => {
    const reply = say({ ...base, due: [7, 3] }, "Review my due cards");
    expect(reply).toMatch(/2 cards are due/);
    expect(reply).toMatch(/Flashcard 8 of/);
  });

  it("says when nothing is due, and explains it's Pro for free players", () => {
    expect(say({ ...base, due: [] }, "Review my due cards")).toMatch(/Nothing's due/);
    expect(say(base, "Review my due cards")).toMatch(/Pro/);
  });

  it("builds a study plan from the exam date", () => {
    expect(say({ ...base, examDays: 5 }, "Make me a study plan")).toMatch(/5-day plan/);
  });

  it("only accepts sensible Pro context from the browser", () => {
    expect(proContext({ due: [1, "x", -2, 3.5, 4], examDays: 12 })).toEqual({ due: [1, 4], examDays: 12 });
    expect(proContext({ examDays: -1 }).examDays).toBeNull();
  });

  it("reads answers without markdown or buttons", () => {
    expect(speakable("**Correct!** Your notes say: “x”.\n\n<choices>Next | Done</choices>")).toBe("Correct! Your notes say: “x”.");
  });
});

describe("mock exam endpoint", () => {
  beforeEach(() => {
    process.env.DATA_DIR = mkdtempSync(path.join(tmpdir(), "qd-exam-"));
    delete process.env.DATABASE_URL;
    delete process.env.POSTGRES_URL;
    delete process.env.VERCEL;
  });

  const call = (id: string, playerId: string) =>
    examRoute(new Request("http://x/api", { method: "POST", body: JSON.stringify({ playerId }), headers: { "content-type": "application/json" } }), { params: Promise.resolve({ id }) });

  it("is Pro only, then serves 10 explained questions", async () => {
    const sample = SAMPLES.find((s) => s.slug === "geography")!;
    await update((db) => {
      db.studySets.s1 = { id: "s1", ownerId: "owner-1234", title: "Plate tectonics", material: sample.material, notes: packFor(sample.material)!.notes, flashcards: packFor(sample.material)!.flashcards, source: "library", createdAt: 0 };
      profileOf(db, "free-player-1");
      grantPro(profileOf(db, "pro-player-1"));
    });
    const free = await call("s1", "free-player-1");
    expect(free.status).toBe(402);
    expect((await free.json()).error).toMatch(/Upgrade to Pro/);
    const pro = await call("s1", "pro-player-1");
    expect(pro.status).toBe(200);
    const data = await pro.json();
    expect(data.questions).toHaveLength(10);
    expect(data.questions.every((q: { explanation?: string }) => q.explanation)).toBe(true);
  });
});
