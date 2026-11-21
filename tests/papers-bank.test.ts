import { describe, expect, it } from "vitest";
import { buildGcsePaper, GCSE_PAPERS, GCSE_SUBJECTS } from "@/lib/gcse";
import { buildScholarPaper, SCHOLAR_PAPERS, SCHOLARSHIP_SCHOOLS, SUBJECT_INFO } from "@/lib/scholarship";
import { COMPREHENSIONS } from "@/lib/content/comprehensions";
import { taskById } from "@/lib/writing";

const valid = (q: { options: string[]; answer: number }) => q.answer >= 0 && q.answer < q.options.length && new Set(q.options).size === q.options.length && q.options.length >= 3;

describe("GCSE papers", () => {
  it("50 full, valid papers in every subject", () => {
    for (const s of GCSE_SUBJECTS) for (let n = 1; n <= GCSE_PAPERS; n++) {
      const p = buildGcsePaper(s.id, n)!;
      expect(p.questions.length, `${s.id} ${n}`).toBe(s.count);
      for (const q of p.questions) expect(valid(q), `${s.id} ${n}: ${q.prompt}`).toBe(true);
    }
  });
});

describe("Scholarship papers", () => {
  it("Hampton and St Paul's are included", () => {
    expect(SCHOLARSHIP_SCHOOLS.map((s) => s.id)).toEqual(expect.arrayContaining(["hampton", "st-pauls"]));
  });
  it("50 valid papers per subject for every school, different per school", () => {
    for (const s of SCHOLARSHIP_SCHOOLS) for (const sub of s.subjects) for (let n = 1; n <= SCHOLAR_PAPERS; n++) {
      const p = buildScholarPaper(s.id, sub, n)!;
      expect(p.questions.length, `${s.id} ${sub} ${n}`).toBe(SUBJECT_INFO[sub].count);
      for (const q of p.questions) expect(valid(q), `${s.id} ${sub} ${n}: ${q.prompt}`).toBe(true);
      if (sub === "english") expect(p.comprehension).toBeTruthy();
    }
    expect(buildScholarPaper("hampton", "maths", 1)!.questions[0].prompt).not.toBe(buildScholarPaper("st-pauls", "maths", 1)!.questions[0].prompt);
    expect(buildScholarPaper("dulwich", "latin", 1)).toBeNull();
  });
  it("has 50+ comprehensions, each with writing tasks", () => {
    expect(COMPREHENSIONS.length).toBeGreaterThanOrEqual(50);
    for (const c of COMPREHENSIONS) {
      expect(c.questions.length).toBe(3);
      expect(taskById(`comp-${c.id}-creative`)?.prompt).toBe(c.creative);
      expect(taskById(`comp-${c.id}-essay`)?.prompt).toBe(c.essay);
    }
  });
});
