import { schoolById, type School } from "./schools";

/** What the student is studying for. */
export type Level = "11plus" | "ks3" | "gcse";

export const LEVELS: { id: Level; name: string; years: string; blurb: string }[] = [
  { id: "11plus", name: "11+", years: "Years 4–6", blurb: "Getting ready for grammar or independent school tests." },
  { id: "ks3", name: "KS3", years: "Years 7–9", blurb: "Building strong habits before GCSEs." },
  { id: "gcse", name: "GCSE", years: "Years 10–11", blurb: "Revising for exams with past papers and mocks." },
];

export interface Step {
  id: string;
  when: string;
  title: string;
  tasks: string[];
  actions?: { label: string; href: string }[];
}

export interface Track {
  id: string;
  name: string;
  intro: string;
  steps: Step[];
}

const PRACTICE = { label: "11+ practice papers", href: "/11-plus" };
const GAMES = { label: "Games", href: "/games" };
const STUDY = { label: "Make flashcards", href: "/study" };
const RAJ = { label: "Ask Raj", href: "/tutor" };
const PAPERS = { label: "Past papers", href: "/past-papers" };

export const TRACKS: Record<string, Track> = {
  grammar11: {
    id: "grammar11",
    name: "Grammar school at 11+",
    intro: "A steady plan from Year 4 to offer day. Little and often beats cramming.",
    steps: [
      { id: "g1", when: "Year 4", title: "Strong foundations", tasks: ["Know your times tables up to 12 × 12 by heart", "Read every day, including harder books", "Start a word book for new vocabulary"], actions: [GAMES, STUDY] },
      { id: "g2", when: "Year 5, autumn", title: "Learn the question types", tasks: ["Find out which test your area uses and what it covers", "Try one practice paper in each subject, untimed", "Note which question types feel hardest"], actions: [PRACTICE] },
      { id: "g3", when: "Year 5, spring", title: "Build speed", tasks: ["One timed paper a week", "Fix your two weakest topics", "Visit open days at your target schools"], actions: [PRACTICE, RAJ] },
      { id: "g4", when: "Year 5, summer", title: "Register for the test", tasks: ["Register before the deadline (check each school or council)", "Full timed papers under exam conditions", "Keep reading and learning new words"], actions: [PRACTICE] },
      { id: "g5", when: "Year 6, September", title: "Test time", tasks: ["Light practice only in the last week", "Sleep well and eat breakfast on the day", "Remember: one test doesn't define you"] },
      { id: "g6", when: "Year 6, October", title: "Apply", tasks: ["Get results (usually October)", "List schools on the council application by 31 October"] },
      { id: "g7", when: "1 March", title: "Offer day", tasks: ["Celebrate your hard work, whatever happens"] },
    ],
  },
  independent11: {
    id: "independent11",
    name: "Independent school at 11+",
    intro: "Most independent schools set their own exams and interview you too.",
    steps: [
      { id: "i1", when: "Year 4", title: "Strong foundations", tasks: ["Times tables up to 12 × 12", "Read widely: stories, news, non-fiction", "Practise writing short stories"], actions: [GAMES, STUDY] },
      { id: "i2", when: "Year 5", title: "Visit and register", tasks: ["Go to open days and pick up to 3 targets", "Check registration deadlines (often autumn of Year 6)", "Ask about bursaries if fees are a worry"], actions: [{ label: "Find schools", href: "/goals#schools" }] },
      { id: "i3", when: "Year 5, summer", title: "Practise the style", tasks: ["Do the sample papers on each school's website", "Practise maths problem-solving and creative writing", "Practise reasoning if your schools test it"], actions: [PRACTICE, PAPERS] },
      { id: "i4", when: "Year 6, autumn", title: "Exam and interview practice", tasks: ["Timed papers every week", "Practise talking about a book you love and your hobbies", "Ask Raj to quiz you on tricky topics"], actions: [PRACTICE, RAJ] },
      { id: "i5", when: "Year 6, Nov–Jan", title: "Exams and interviews", tasks: ["Sleep well, stay calm", "In interviews, think out loud: they want to see how you think"] },
      { id: "i6", when: "Year 6, spring", title: "Offers", tasks: ["Compare offers and any scholarship or bursary awards"] },
    ],
  },
  independent13: {
    id: "independent13",
    name: "Independent school at 13+",
    intro: "Top 13+ schools often decide years ahead, so start early.",
    steps: [
      { id: "t1", when: "Year 5", title: "Register early", tasks: ["Visit target schools", "Register: some top schools close registration in Year 5 or 6"], actions: [{ label: "Find schools", href: "/goals#schools" }] },
      { id: "t2", when: "Year 6", title: "The pre-test", tasks: ["Many schools use an online pre-test: maths, English, verbal and non-verbal reasoning", "Practise reasoning questions until they feel easy"], actions: [PRACTICE] },
      { id: "t3", when: "Year 6–7", title: "Interviews", tasks: ["Read beyond school: news, science, history", "Practise explaining your thinking out loud"], actions: [RAJ] },
      { id: "t4", when: "Year 8", title: "Final exams", tasks: ["Common Entrance or the school's own exams", "Academic scholarship candidates sit extra, harder papers"], actions: [STUDY, PAPERS] },
    ],
  },
  ks3: {
    id: "ks3",
    name: "KS3: get GCSE-ready",
    intro: "Years 7–9 are the best time to build habits that make GCSEs easy.",
    steps: [
      { id: "k1", when: "Year 7", title: "Good habits", tasks: ["Turn each week's notes into flashcards", "Review flashcards for 10 minutes a day", "Keep your streak going"], actions: [STUDY, { label: "Streak", href: "/streak" }] },
      { id: "k2", when: "Year 8", title: "Go deeper", tasks: ["Ask Raj 'why' questions, not just 'what'", "Play games with your notes before tests", "Try a scholarship or competition if your school offers one"], actions: [RAJ, GAMES] },
      { id: "k3", when: "Year 9", title: "Choose your GCSEs", tasks: ["Pick options you enjoy and that keep doors open", "Try a few GCSE-style questions to see the step up"], actions: [PAPERS] },
    ],
  },
  gcse: {
    id: "gcse",
    name: "GCSE",
    intro: "Learn it, then practise it in exam conditions.",
    steps: [
      { id: "c1", when: "Year 10", title: "Learn the content", tasks: ["Flashcards for every topic as you go", "End-of-topic quizzes and duels with friends"], actions: [STUDY, GAMES] },
      { id: "c2", when: "Year 10, summer", title: "First mocks", tasks: ["Do past papers for each subject", "List your weakest topics"], actions: [PAPERS] },
      { id: "c3", when: "Year 11, autumn", title: "Mocks", tasks: ["Timed past papers, then mark them with the mark scheme", "Fix mistakes with Raj"], actions: [PAPERS, RAJ] },
      { id: "c4", when: "Year 11, spring", title: "Exam practice", tasks: ["Two past papers a week", "Review flashcards daily"], actions: [PAPERS, STUDY] },
      { id: "c5", when: "May–June", title: "Exams", tasks: ["Sleep, eat, stay calm", "Short reviews only the night before"] },
      { id: "c6", when: "August", title: "Results day", tasks: ["Be proud of what you did"] },
    ],
  },
};

/** Which tracks fit a student's level and target schools. */
export function tracksFor(level: Level | null, targetIds: string[]): Track[] {
  const targets = targetIds.map(schoolById).filter((s): s is School => Boolean(s));
  const ids = new Set<string>();
  for (const s of targets) {
    if (s.type === "grammar") ids.add("grammar11");
    else if (s.entry.includes("11+") && (level === "11plus" || level === null)) ids.add("independent11");
    else if (s.entry.includes("13+")) ids.add("independent13");
  }
  if (level === "ks3") ids.add("ks3");
  if (level === "gcse") ids.add("gcse");
  if (level === "11plus" && !ids.size) ids.add("grammar11");
  return [...ids].map((id) => TRACKS[id]);
}

// ---------------------------------------------------------------------------
// Saved in the browser: no names, no dates of birth, nothing that identifies a child.
// ---------------------------------------------------------------------------

const LEVEL_KEY = "quiz-duel:level";
const TARGETS_KEY = "quiz-duel:targets";
const DONE_KEY = "quiz-duel:track-done";
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function get<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : (JSON.parse(v) as T);
  } catch {
    return fallback;
  }
}
function set(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage blocked */
  }
  notify();
}

export const loadLevel = (): Level | null => {
  const v = get<string | null>(LEVEL_KEY, null);
  return v === "11plus" || v === "ks3" || v === "gcse" ? v : null;
};
export const saveLevel = (level: Level) => set(LEVEL_KEY, level);

export const loadTargets = (): string[] => {
  const v = get<unknown>(TARGETS_KEY, []);
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && Boolean(schoolById(x))).slice(0, 3) : [];
};
export function toggleTarget(id: string): { ok: boolean; targets: string[] } {
  const now = loadTargets();
  if (now.includes(id)) {
    const next = now.filter((x) => x !== id);
    set(TARGETS_KEY, next);
    return { ok: true, targets: next };
  }
  if (now.length >= 3) return { ok: false, targets: now };
  const next = [...now, id];
  set(TARGETS_KEY, next);
  return { ok: true, targets: next };
}

export const loadDone = (): string[] => {
  const v = get<unknown>(DONE_KEY, []);
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
};
export function toggleDone(stepId: string) {
  const d = loadDone();
  set(DONE_KEY, d.includes(stepId) ? d.filter((x) => x !== stepId) : [...d, stepId]);
}

export function onGoalsChange(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
