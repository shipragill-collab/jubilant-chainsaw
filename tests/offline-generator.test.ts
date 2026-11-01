import { describe, expect, it } from "vitest";
import { generateOfflineQuestions, guessTitle, words } from "@/lib/offline-generator";
import { validateQuestions } from "@/lib/generate";

const NOTES = `The French Revolution began in 1789 with the storming of the Bastille.
Louis XVI was the king of France when the revolution started.
The Estates-General was summoned to address the financial crisis.
The Declaration of the Rights of Man was adopted in August 1789.
Maximilien Robespierre led the Committee of Public Safety during the Reign of Terror.
The Reign of Terror saw thousands executed by guillotine.
Napoleon Bonaparte seized power in the coup of 18 Brumaire in 1799.
The Jacobins were the most radical political club of the revolution.`;

describe("offline generator", () => {
  it("builds 10 valid, deterministic questions", () => {
    const qs = generateOfflineQuestions(NOTES, 10);
    expect(qs).toHaveLength(10);
    expect(validateQuestions(qs)).toHaveLength(10);
    for (const q of qs) {
      expect(q.prompt).toContain("_____");
      expect(q.options[q.answerIndex]).toBeTruthy();
    }
    expect(generateOfflineQuestions(NOTES, 10)).toEqual(qs);
  });

  it("returns nothing for empty notes", () => {
    expect(generateOfflineQuestions("   ")).toEqual([]);
  });

  it("guesses a title", () => {
    expect(guessTitle("# Cell Biology\nCells are...")).toBe("Cell Biology");
    expect(guessTitle("Photosynthesis happens in the chloroplasts.\nPhotosynthesis needs light.")).toBe("Photosynthesis quiz");
  });

  it("extracts clean key terms", () => {
    expect(words("The Calvin cycle runs in the stroma")).toContain("Calvin");
    expect(words("The enzyme RuBisCO catalyses the first step")).toContain("RuBisCO");
    expect(words("The enzyme RuBisCO catalyses the first step")).not.toContain("enzyme RuBisCO");
    expect(words("It began in 1789, then ended.")).toContain("1789");
  });
});

describe("validateQuestions", () => {
  it("drops malformed questions", () => {
    const out = validateQuestions([
      { prompt: "ok", options: ["a", "b", "c", "d"], answerIndex: 2 },
      { prompt: "dupe", options: ["a", "a", "c", "d"], answerIndex: 0 },
      { prompt: "three", options: ["a", "b", "c"], answerIndex: 0 },
      { prompt: "bad idx", options: ["a", "b", "c", "d"], answerIndex: 4 },
    ]);
    expect(out.map((q) => q.prompt)).toEqual(["ok"]);
  });
});
