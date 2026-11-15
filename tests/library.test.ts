import { describe, expect, it } from "vitest";
import { generateQuiz, validateQuestions } from "@/lib/generate";
import { LIBRARY, packFor, quizFromPack } from "@/lib/library";
import { brainReply, type BrainMessage, type Knowledge } from "@/lib/raj-brain";
import { generateStudySet } from "@/lib/study";
import { SAMPLES } from "@/lib/samples";

describe("built-in study library", () => {
  it("covers every sample subject with notes, flashcards and a question bank", () => {
    expect(LIBRARY.map((p) => p.slug).sort()).toEqual(SAMPLES.map((s) => s.slug).sort());
    for (const p of LIBRARY) {
      expect(p.questions.length).toBeGreaterThanOrEqual(15);
      expect(p.flashcards.length).toBeGreaterThanOrEqual(12);
      expect(p.notes.sections.length).toBeGreaterThanOrEqual(2);
      expect(p.notes.keyTerms.length).toBeGreaterThanOrEqual(5);
      for (const q of p.questions) {
        expect(new Set([q.answer, ...q.wrong]).size, `${p.slug}: ${q.prompt}`).toBe(4);
        expect(q.explanation.length).toBeGreaterThan(10);
      }
      expect(new Set(p.questions.map((q) => q.prompt)).size).toBe(p.questions.length);
    }
  });

  it("recognises sample material, even with different spacing", () => {
    const bio = SAMPLES.find((s) => s.slug === "biology")!;
    expect(packFor(bio.material)?.slug).toBe("biology");
    expect(packFor(`  ${bio.material.replace(/\n/g, "\n\n")}  `)?.slug).toBe("biology");
    expect(packFor(bio.material + "\nMy own extra line.")).toBeUndefined();
  });

  it("builds valid quizzes and gives rematches new questions", () => {
    const pack = LIBRARY[0];
    const first = quizFromPack(pack, 10);
    expect(validateQuestions(first)).toHaveLength(10);
    const second = quizFromPack(pack, 10, first.map((q) => q.prompt));
    const repeats = second.filter((q) => first.some((f) => f.prompt === q.prompt)).length;
    expect(repeats).toBe(pack.questions.length >= 20 ? 0 : 10 - (pack.questions.length - 10));
  });

  it("is used for sample duels and study sets with no API key", async () => {
    const hist = SAMPLES.find((s) => s.slug === "history")!;
    const quiz = await generateQuiz(hist.material);
    expect(quiz.source).toBe("library");
    expect(quiz.questions.every((q) => q.explanation)).toBe(true);
    const set = await generateStudySet(hist.material);
    expect(set.source).toBe("library");
    expect(set.title).toBe("The French Revolution");
  });
});

describe("Raj with the library", () => {
  const sample = SAMPLES.find((s) => s.slug === "biology")!;
  const pack = packFor(sample.material)!;
  const k: Knowledge = { title: pack.title, material: sample.material, notes: pack.notes, flashcards: pack.flashcards };
  const say = (h: BrainMessage[], text: string) => {
    h.push({ role: "user", content: text });
    h.push({ role: "assistant", content: brainReply(h, k) });
    return h[h.length - 1].content;
  };

  it("lists the topics in a set", () => {
    expect(say([], "What topics are in this set?")).toMatch(/Light-dependent reactions[\s\S]*Calvin cycle/);
  });

  it("quizzes on just one topic", () => {
    const reply = say([], "Quiz me on the Calvin cycle");
    const n = Number(reply.match(/Flashcard (\d+)/)![1]) - 1;
    expect(`${pack.flashcards[n].front} ${pack.flashcards[n].back}`).toMatch(/Calvin|stroma|RuBisCO|carbon/i);
  });

  it("explains why after a question", () => {
    const h: BrainMessage[] = [];
    say(h, "Start practice");
    say(h, "no idea");
    expect(say(h, "why is that the answer?")).toMatch(/The answer is \*\*/);
  });

  it("knows the library's extra facts", () => {
    expect(say([], "Why do leaves look green?")).toMatch(/reflect/i);
  });
});
