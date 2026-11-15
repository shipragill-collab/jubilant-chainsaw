import { describe, expect, it } from "vitest";
import { buildPaper, SUBJECTS_11, topicStats, weakSpots, PAPERS_PER_SUBJECT } from "@/lib/eleven-plus";
import { tracksFor } from "@/lib/tracks";
import { SCHOOLS } from "@/lib/schools";

describe("11+ papers", () => {
  it("builds full, valid papers for every subject", () => {
    for (const s of SUBJECTS_11) {
      for (let n = 1; n <= PAPERS_PER_SUBJECT; n++) {
        const p = buildPaper(s.id, n);
        expect(p.questions.length).toBe(s.count);
        for (const q of p.questions) {
          expect(q.answer).toBeGreaterThanOrEqual(0);
          expect(q.answer).toBeLessThan(q.options.length);
          expect(q.options.length).toBeGreaterThanOrEqual(3);
          expect(new Set(q.options).size).toBe(q.options.length);
          expect(q.explain.length).toBeGreaterThan(5);
          if (q.optionShapes) expect(q.optionShapes.length).toBe(q.options.length);
        }
      }
    }
  });
  it("is repeatable and papers differ", () => {
    expect(buildPaper("maths", 3)).toEqual(buildPaper("maths", 3));
    expect(buildPaper("maths", 3).questions[0].prompt).not.toEqual(buildPaper("maths", 4).questions[0].prompt);
  });
  it("hidden word answers really are hidden across two words", () => {
    for (let n = 1; n <= 40; n++) {
      for (const q of buildPaper("verbal", n).questions.filter((x) => x.topic === "Hidden words")) {
        const sentence = q.prompt.split('"')[1].replace(/[.]/g, "").split(" ");
        const word = q.options[q.answer];
        const pairs = sentence.slice(0, -1).map((w, i) => (w + sentence[i + 1]).toUpperCase());
        expect(pairs.some((p) => p.includes(word))).toBe(true);
      }
    }
  });
  it("finds weak spots", () => {
    const qs = [{ topic: "Ratio" }, { topic: "Ratio" }, { topic: "Ratio" }, { topic: "Time" }, { topic: "Time" }, { topic: "Time" }];
    const t = topicStats(qs, [false, false, true, true, true, true]);
    const w = weakSpots([{ key: "11:maths:1", title: "", score: 4, total: 6, at: 0, topics: t }]);
    expect(w[0].topic).toBe("Ratio");
  });
});

describe("school tracks", () => {
  it("picks tracks from targets", () => {
    expect(tracksFor("11plus", ["tiffin"]).map((t) => t.id)).toEqual(["grammar11"]);
    expect(tracksFor("11plus", ["spgs", "st-pauls"]).map((t) => t.id)).toEqual(["independent11", "independent13"]);
    expect(tracksFor("gcse", []).map((t) => t.id)).toEqual(["gcse"]);
    expect(new Set(SCHOOLS.map((s) => s.id)).size).toBe(SCHOOLS.length);
  });
});
