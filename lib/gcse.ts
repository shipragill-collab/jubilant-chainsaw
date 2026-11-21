/**
 * GCSE practice papers: 50 per subject, written in the GCSE style and made
 * offline from question generators and fact banks. They are not real past
 * papers (those belong to the exam boards; the Past papers page links to them).
 */
import { packBySlug } from "./library";
import {
  BIO_CALC, BIO_FACTS, buildFrom, CHEM_CALC, CHEM_FACTS, CS_GEN, FRENCH_GEN, GEOG_FACTS, HIST_FACTS, KS3_VOCAB_GEN, MATHS_ADV, packGen, PHYS_FACTS, PHYSICS_CALC, type Gen,
} from "./generators";
import { ENGLISH, type PaperQuestion } from "./eleven-plus";
import { COMPREHENSIONS } from "./content/comprehensions";
import { mc, pick } from "./eleven-plus";

export const GCSE_PAPERS = 50;
export const GCSE_FREE = 5;

const pack = (slug: string): Gen[] => {
  const p = packBySlug(slug);
  return p ? [packGen(p)] : [];
};

/** Reading questions from the comprehension bank. */
const READING: Gen = (r) => {
  const c = pick(r, COMPREHENSIONS);
  const [q, right, wrong, why] = pick(r, c.questions);
  return mc(r, "Reading", `"${c.title}": ${q}`, right, wrong, why);
};

export interface GcseSubject {
  id: string;
  name: string;
  blurb: string;
  count: number;
  minutes: number;
  gens: Gen[];
}

export const GCSE_SUBJECTS: GcseSubject[] = [
  { id: "maths", name: "Maths", blurb: "Algebra, number, geometry, probability and proportion.", count: 20, minutes: 30, gens: MATHS_ADV },
  { id: "biology", name: "Biology", blurb: "Cells, organisms, genetics, ecology and calculations.", count: 20, minutes: 25, gens: [BIO_FACTS, BIO_FACTS, BIO_FACTS, ...BIO_CALC, ...pack("biology")] },
  { id: "chemistry", name: "Chemistry", blurb: "Atoms, bonding, reactions and chemical calculations.", count: 20, minutes: 25, gens: [CHEM_FACTS, CHEM_FACTS, CHEM_FACTS, ...CHEM_CALC, ...pack("chemistry")] },
  { id: "physics", name: "Physics", blurb: "Forces, energy, electricity, waves and equations.", count: 20, minutes: 25, gens: [PHYS_FACTS, PHYS_FACTS, ...PHYSICS_CALC, ...pack("physics")] },
  { id: "english", name: "English Language", blurb: "Reading, writer's techniques, vocabulary and grammar.", count: 20, minutes: 25, gens: [READING, READING, READING, KS3_VOCAB_GEN, KS3_VOCAB_GEN, ...ENGLISH] },
  { id: "history", name: "History", blurb: "Key events, people and dates from 1066 to the modern world.", count: 20, minutes: 20, gens: [HIST_FACTS, HIST_FACTS, HIST_FACTS, ...pack("history")] },
  { id: "geography", name: "Geography", blurb: "Physical and human geography, maps and skills.", count: 20, minutes: 20, gens: [GEOG_FACTS, GEOG_FACTS, GEOG_FACTS, ...pack("geography")] },
  { id: "french", name: "French", blurb: "Vocabulary, present and perfect tenses.", count: 20, minutes: 20, gens: FRENCH_GEN },
  { id: "computer-science", name: "Computer Science", blurb: "Binary, hex, logic, systems and algorithms.", count: 20, minutes: 25, gens: [...CS_GEN, ...pack("computer-science")] },
];

export const gcseSubject = (id: string | null | undefined) => GCSE_SUBJECTS.find((s) => s.id === id);

export function buildGcsePaper(id: string, n: number): { title: string; minutes: number; questions: PaperQuestion[] } | null {
  const s = gcseSubject(id);
  if (!s || n < 1 || n > GCSE_PAPERS) return null;
  return { title: `GCSE ${s.name} · Paper ${n}`, minutes: s.minutes, questions: buildFrom(s.gens, s.count, `gcse:${id}:${n}`) };
}
