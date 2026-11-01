import { describe, expect, it } from "vitest";
import { extractDefinitions, offlineFlashcards, offlineNotes } from "@/lib/offline-study";
import { sanitizeStudySet } from "@/lib/study";

const STRUCTURED = `# Cell Biology

## Organelles
The mitochondria is the powerhouse of the cell. It produces ATP through cellular respiration.
Ribosomes are the sites of protein synthesis. They can be free or bound to the endoplasmic reticulum.

## Membranes
The cell membrane is a phospholipid bilayer that controls what enters the cell.
Osmosis is the diffusion of water across a semi-permeable membrane.
Active transport uses ATP to move molecules against their concentration gradient.`;

const PLAIN = `Photosynthesis happens in the chloroplasts of plant cells.
Chlorophyll is the green pigment that absorbs mostly red and blue light.
The Calvin cycle runs in the stroma and fixes carbon dioxide into sugar.
The enzyme RuBisCO catalyses the first step of carbon fixation in the Calvin cycle.
CAM plants such as cacti open their stomata at night to reduce water loss.
Glucose made by photosynthesis can be stored as starch.
Water is split during the light-dependent reactions, releasing oxygen as a by-product.`;

describe("offline notes", () => {
  it("follows markdown headings when present", () => {
    const notes = offlineNotes(STRUCTURED);
    expect(notes.sections.map((s) => s.heading)).toEqual(["Organelles", "Membranes"]);
    expect(notes.sections[0].points[0]).toBe("The mitochondria is the powerhouse of the cell");
    expect(notes.summary.length).toBeGreaterThan(20);
  });

  it("groups plain sentences into sections", () => {
    const notes = offlineNotes(PLAIN);
    expect(notes.sections.length).toBeGreaterThan(0);
    expect(notes.sections.flatMap((s) => s.points)).toHaveLength(7);
  });

  it("extracts definitions as key terms", () => {
    const terms = extractDefinitions(STRUCTURED).map((t) => t.term);
    expect(terms).toContain("Mitochondria");
    expect(terms).toContain("Osmosis");
    expect(terms).not.toContain("It");
  });
});

describe("offline flashcards", () => {
  it("makes unique definition and recall cards", () => {
    const cards = offlineFlashcards(STRUCTURED);
    expect(cards.length).toBeGreaterThanOrEqual(5);
    expect(cards.find((c) => c.front === "What is Osmosis?")?.back).toMatch(/^The diffusion of water/);
    expect(new Set(cards.map((c) => c.front)).size).toBe(cards.length);
    for (const c of cards) expect(c.back.trim()).not.toBe("");
  });
});

describe("sanitizeStudySet", () => {
  it("drops empty and duplicate entries", () => {
    const out = sanitizeStudySet({
      title: "  T  ",
      notes: {
        summary: "s",
        sections: [{ heading: "", points: ["a", " "] }, { heading: "Empty", points: [] }],
        keyTerms: [{ term: "x", definition: "" }, { term: "y", definition: "why" }],
      },
      flashcards: [
        { front: "Q1", back: "A1" },
        { front: "q1", back: "dupe" },
        { front: "Q2", back: "" },
      ],
    });
    expect(out.title).toBe("T");
    expect(out.notes.sections).toEqual([{ heading: "Notes", points: ["a"] }]);
    expect(out.notes.keyTerms).toEqual([{ term: "y", definition: "why" }]);
    expect(out.flashcards).toEqual([{ front: "Q1", back: "A1" }]);
  });
});
