/**
 * 13+ academic scholarship practice for KS3 students. Each school lists the
 * subjects its scholarship exam covers (researched from school and guide
 * pages, November 2026; schools change their papers, so always check).
 * Papers are written by PrepPass in the scholarship style: 50 per subject per
 * school, and each school gets its own set.
 */
import { COMPREHENSIONS, type Comprehension } from "./content/comprehensions";
import { ENGLISH, MATHS, NONVERBAL, VERBAL, type PaperQuestion } from "./eleven-plus";
import {
  BIO_CALC, BIO_FACTS, buildFrom, CHEM_CALC, CHEM_FACTS, FRENCH_GEN, GEOG_FACTS, HIST_FACTS, KS3_VOCAB_GEN, LATIN_GEN, MATHS_ADV, PHYS_FACTS, PHYSICS_CALC, RS_FACTS, type Gen,
} from "./generators";
import { seedOf } from "./eleven-plus";

export type ScholarSubject = "english" | "maths" | "science" | "french" | "latin" | "history" | "geography" | "rs" | "general";

export const SUBJECT_INFO: Record<ScholarSubject, { name: string; minutes: number; count: number }> = {
  english: { name: "English", minutes: 60, count: 12 },
  maths: { name: "Maths", minutes: 60, count: 25 },
  science: { name: "Science", minutes: 45, count: 25 },
  french: { name: "French", minutes: 40, count: 25 },
  latin: { name: "Latin", minutes: 40, count: 25 },
  history: { name: "History", minutes: 30, count: 20 },
  geography: { name: "Geography", minutes: 30, count: 20 },
  rs: { name: "Religious studies", minutes: 30, count: 20 },
  general: { name: "General paper", minutes: 45, count: 24 },
};

export interface ScholarSchool {
  id: string;
  name: string;
  award: string;
  subjects: ScholarSubject[];
  /** How sure we are of the subject list. */
  basis: "Published by the school" | "Partly confirmed" | "Typical for this exam";
  note: string;
}

export const SCHOLARSHIP_SCHOOLS: ScholarSchool[] = [
  { id: "eton", name: "Eton College", award: "King's Scholarship", subjects: ["english", "maths", "general", "science", "latin", "french", "history"], basis: "Partly confirmed", note: "English, Maths A and a General paper are compulsory; extra subject papers may follow. Held in late April of Year 8." },
  { id: "winchester", name: "Winchester College", award: "Election", subjects: ["english", "maths", "science", "general", "latin", "french", "history", "geography"], basis: "Published by the school", note: "Compulsory: English, Maths 1, Science and General Paper 1. Plus at least three from Latin, French, Greek, History, Geography, Maths 2 and General Paper 2." },
  { id: "westminster", name: "Westminster School", award: "The Challenge (King's Scholarships)", subjects: ["maths", "english", "french", "science", "latin", "history", "geography"], basis: "Published by the school", note: "The Challenge covers Maths, English, French, Science, Latin, History and Geography. Held in early May of Year 8." },
  { id: "st-pauls", name: "St Paul's School", award: "13+ Academic Scholarship", subjects: ["english", "maths", "science", "general"], basis: "Partly confirmed", note: "Main List candidates can sit scholarship assessments, usually in May, instead of Common Entrance. Check the school's current subject list." },
  { id: "hampton", name: "Hampton School", award: "13+ Academic Scholarship", subjects: ["english", "maths", "science", "french", "latin", "history", "geography", "rs"], basis: "Partly confirmed", note: "Awarded through the Common Academic Scholarship Examination, based on the Common Entrance syllabus. Applications close 1 February." },
  { id: "harrow", name: "Harrow School", award: "Academic Scholarship", subjects: ["english", "maths", "science", "history", "geography", "french", "latin"], basis: "Partly confirmed", note: "Stage one is English and Maths at your own school in January of Year 8; a second round follows at Harrow." },
  { id: "radley", name: "Radley College", award: "Academic Scholarship", subjects: ["english", "maths", "science", "latin", "french", "history", "geography", "rs", "general"], basis: "Partly confirmed", note: "English and Maths for all; Radley's archive also has science, language, humanities and common papers." },
  { id: "tonbridge", name: "Tonbridge School", award: "Academic Scholarship", subjects: ["english", "maths", "science", "rs", "french", "latin", "history", "geography"], basis: "Partly confirmed", note: "Nine compulsory papers plus at least two optional ones, over three days around late April." },
  { id: "marlborough", name: "Marlborough College", award: "13+ Academic Scholarship", subjects: ["english", "maths", "science", "general", "french", "latin"], basis: "Published by the school", note: "Compulsory: English, Maths, Science and a Common Paper. Optional: French, Greek, Latin, Spanish." },
  { id: "rugby", name: "Rugby School", award: "13+ Academic Scholarship", subjects: ["english", "maths", "science"], basis: "Partly confirmed", note: "English and Maths papers plus an interview for all; optional papers are offered." },
  { id: "kings-canterbury", name: "The King's School, Canterbury", award: "13+ Academic Scholarship", subjects: ["english", "maths", "science"], basis: "Partly confirmed", note: "Papers in English, Mathematics and Science." },
  { id: "wellington", name: "Wellington College", award: "13+ Academic Scholarship", subjects: ["english", "maths", "science"], basis: "Partly confirmed", note: "Exam and interview in Year 8; papers test applying knowledge to unfamiliar problems." },
  { id: "dulwich", name: "Dulwich College", award: "Academic Scholarship", subjects: ["english", "maths"], basis: "Partly confirmed", note: "Top performers in the English and Maths entrance papers are considered for awards." },
  { id: "charterhouse", name: "Charterhouse", award: "Foundation Scholarship", subjects: ["english", "maths", "science", "french", "latin", "history"], basis: "Typical for this exam", note: "Academic assessments in April of Year 8. Subject list not confirmed: check with the school." },
  { id: "shrewsbury", name: "Shrewsbury School", award: "Academic Scholarship", subjects: ["english", "maths", "science", "french"], basis: "Typical for this exam", note: "Scholarship exams at the school in May. Subject list not confirmed: check with the school." },
];

export const scholarSchool = (id: string | null | undefined) => SCHOLARSHIP_SCHOOLS.find((s) => s.id === id);
export const SCHOLAR_PAPERS = 50;
export const SCHOLAR_FREE = 3;
export const MAX_SCHOLAR_SCHOOLS = 3;

export const scholarshipLink = (s: ScholarSchool) => `https://www.google.com/search?q=${encodeURIComponent(`${s.name} 13+ academic scholarship ${s.award}`)}`;

const GENS: Record<Exclude<ScholarSubject, "english">, Gen[]> = {
  maths: [...MATHS_ADV, ...MATHS.slice(-20)],
  science: [BIO_FACTS, CHEM_FACTS, PHYS_FACTS, BIO_FACTS, CHEM_FACTS, PHYS_FACTS, ...PHYSICS_CALC, ...CHEM_CALC, ...BIO_CALC],
  french: FRENCH_GEN,
  latin: LATIN_GEN,
  history: [HIST_FACTS],
  geography: [GEOG_FACTS],
  rs: [RS_FACTS],
  general: [...VERBAL, ...NONVERBAL.slice(0, 3), KS3_VOCAB_GEN, HIST_FACTS, GEOG_FACTS],
};

const TECHNIQUE_GENS = ENGLISH.slice(0, 7); // vocabulary, context, affixes, homophones, techniques, linking, formal

export interface ScholarPaper {
  title: string;
  minutes: number;
  questions: PaperQuestion[];
  comprehension?: Comprehension;
}

/** Each school's papers are its own: the seed (and the passage order) depend on the school. */
export function buildScholarPaper(schoolId: string, subject: ScholarSubject, n: number): ScholarPaper | null {
  const school = scholarSchool(schoolId);
  if (!school || !school.subjects.includes(subject) || n < 1 || n > SCHOLAR_PAPERS) return null;
  const info = SUBJECT_INFO[subject];
  const title = `${school.name} · ${info.name} · Paper ${n}`;
  if (subject === "english") {
    const offset = Math.abs(seedOf(schoolId)) % COMPREHENSIONS.length;
    const c = COMPREHENSIONS[(n - 1 + offset) % COMPREHENSIONS.length];
    const reading: PaperQuestion[] = c.questions.map(([q, right, wrong, why]) => {
      const options = [right, ...wrong];
      // Rotate so the right answer isn't always first, deterministically.
      const k = (n + q.length) % options.length;
      const rotated = [...options.slice(k), ...options.slice(0, k)];
      return { topic: "Comprehension", prompt: q, options: rotated, answer: rotated.indexOf(right), explain: why };
    });
    const rest = buildFrom([KS3_VOCAB_GEN, KS3_VOCAB_GEN, KS3_VOCAB_GEN, ...TECHNIQUE_GENS], info.count - reading.length, `sch:${schoolId}:english:${n}`);
    return { title, minutes: info.minutes, questions: [...reading, ...rest], comprehension: c };
  }
  return { title, minutes: info.minutes, questions: buildFrom(GENS[subject], info.count, `sch:${schoolId}:${subject}:${n}`) };
}

// Chosen scholarship schools, kept in the browser.
const KEY = "quiz-duel:scholarship-schools";
export function loadScholarSchools(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && Boolean(scholarSchool(x))).slice(0, MAX_SCHOLAR_SCHOOLS) : [];
  } catch {
    return [];
  }
}
export function saveScholarSchools(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX_SCHOLAR_SCHOOLS)));
  } catch {
    /* storage blocked */
  }
}

/** Tips for scholarship creative and essay writing, built on the comprehension. */
export const SCHOLAR_WRITING_TIPS = {
  creative: [
    "Borrow the passage's setting or mood, but change the point of view: tell it as a different character.",
    "Steal one technique you spotted in the passage (a simile, a short sentence for tension) and use it on purpose.",
    "Start in the middle of the action, then reveal the background.",
    "Use one strong image per paragraph rather than piling up adjectives.",
    "End with an echo of your opening, or a single surprising line.",
  ],
  essay: [
    "Answer the question in your first sentence, then explain how you'll argue it.",
    "Use an example from the passage as evidence in at least one paragraph.",
    "Give the other side fairly, then explain why your view is stronger.",
    "Vary your linking words: furthermore, however, consequently, nevertheless.",
    "Finish by widening out: why does this question matter beyond the passage?",
  ],
};
