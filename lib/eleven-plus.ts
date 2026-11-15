/**
 * 11+ practice papers, written for Quiz Duel. Every question is original and
 * made here, offline, from a seed, so "Paper 7" is the same paper every time
 * but there are as many papers as anyone needs. Nothing is copied from real
 * exam papers.
 */

export type Subject11 = "maths" | "verbal" | "english" | "nonverbal";

/** A shape for non-verbal reasoning, drawn as SVG by the paper screen. */
export interface Shape {
  sides: number; // 0 = circle, 1 = arrow, 3+ = polygon
  rotation: number; // degrees
  fill: "none" | "solid" | "half";
  dots: number; // small dots inside
  size?: number; // 0.5–1
}

export interface PaperQuestion {
  topic: string; // for the weak-spot report, e.g. "Letter codes"
  prompt: string;
  options: string[];
  answer: number; // index into options
  explain: string;
  /** Non-verbal: a sequence of shapes to show, then shapes for each option. */
  shapes?: Shape[];
  optionShapes?: Shape[];
}

export interface Paper {
  subject: Subject11;
  number: number;
  title: string;
  minutes: number;
  questions: PaperQuestion[];
}

export const SUBJECTS_11: { id: Subject11; name: string; blurb: string; count: number; minutes: number }[] = [
  { id: "maths", name: "Maths", blurb: "Arithmetic, fractions, percentages, ratio, shapes and word problems.", count: 20, minutes: 25 },
  { id: "verbal", name: "Verbal reasoning", blurb: "Letter codes, analogies, odd one out, hidden words and sequences.", count: 24, minutes: 20 },
  { id: "english", name: "English", blurb: "Spelling, vocabulary, grammar and punctuation.", count: 20, minutes: 20 },
  { id: "nonverbal", name: "Non-verbal reasoning", blurb: "Shape patterns: what comes next and the odd one out.", count: 12, minutes: 12 },
];

/** How many papers the 11+ Pack offers per subject (free: paper 1). */
export const PAPERS_PER_SUBJECT = 40;
export const FREE_PAPERS = 1;

// ---------------------------------------------------------------------------
// Seeded randomness
// ---------------------------------------------------------------------------

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type R = () => number;
const int = (r: R, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
const pick = <T,>(r: R, xs: readonly T[]) => xs[Math.floor(r() * xs.length)];
function shuffle<T>(r: R, xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const seedOf = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

/** Put the right answer among the distractors, shuffled, with no duplicates. */
function mc(r: R, topic: string, prompt: string, right: string, wrong: string[], explain: string): PaperQuestion {
  const opts = [right];
  for (const w of wrong) if (w !== right && !opts.includes(w) && opts.length < 5) opts.push(w);
  const options = shuffle(r, opts);
  return { topic, prompt, options, answer: options.indexOf(right), explain };
}

/** Plausible wrong numbers near the right one. */
function nearNums(r: R, n: number, fmt: (x: number) => string = String, step = 0): string[] {
  const d = step || Math.max(1, Math.round(Math.abs(n) * 0.1));
  const cands = [n + d, n - d, n + 2 * d, n - 2 * d, n + 10, n - 1, n + 1, Math.round(n * 1.5), Math.round(n / 2)].filter((x) => x !== n && x >= 0);
  return shuffle(r, [...new Set(cands)]).slice(0, 4).map(fmt);
}
const money = (p: number) => (p < 100 ? `${p}p` : `£${(p / 100).toFixed(2)}`);

// ---------------------------------------------------------------------------
// Maths
// ---------------------------------------------------------------------------

const MATHS: ((r: R) => PaperQuestion)[] = [
  (r) => {
    const a = int(r, 23, 98), b = int(r, 12, 49);
    return mc(r, "Multiplication", `What is ${a} × ${b}?`, String(a * b), nearNums(r, a * b, String, 10), `${a} × ${b} = ${a * b}. Split it: ${a} × ${Math.floor(b / 10) * 10} = ${a * Math.floor(b / 10) * 10}, plus ${a} × ${b % 10} = ${a * (b % 10)}.`);
  },
  (r) => {
    const d = int(r, 6, 19), q = int(r, 12, 64);
    return mc(r, "Division", `What is ${d * q} ÷ ${d}?`, String(q), nearNums(r, q, String, 2), `${d} × ${q} = ${d * q}, so ${d * q} ÷ ${d} = ${q}.`);
  },
  (r) => {
    const den = pick(r, [3, 4, 5, 6, 8, 10]), num = int(r, 1, den - 1), whole = den * int(r, 3, 15);
    const ans = (whole / den) * num;
    return mc(r, "Fractions", `What is ${num}/${den} of ${whole}?`, String(ans), nearNums(r, ans, String, whole / den), `${whole} ÷ ${den} = ${whole / den}, then × ${num} = ${ans}.`);
  },
  (r) => {
    const pc = pick(r, [5, 10, 15, 20, 25, 30, 40, 60, 75]), base = pick(r, [40, 60, 80, 120, 160, 200, 240, 360, 480]);
    const ans = (base * pc) / 100;
    return mc(r, "Percentages", `What is ${pc}% of ${base}?`, String(ans), nearNums(r, ans, String, base / 20), `10% of ${base} is ${base / 10}. ${pc}% is ${pc / 10} × ${base / 10} = ${ans}.`);
  },
  (r) => {
    const price = int(r, 3, 19) * 5 + 40, n = int(r, 3, 7), paid = (Math.floor((price * n) / 500) + 1) * 500;
    const change = paid - price * n;
    return mc(r, "Money", `Pencils cost ${money(price)} each. Sam buys ${n} and pays with ${money(paid)}. How much change does Sam get?`, money(change), nearNums(r, change, money, 5), `${n} × ${money(price)} = ${money(price * n)}. ${money(paid)} − ${money(price * n)} = ${money(change)}.`);
  },
  (r) => {
    const gcd = (x: number, y: number): number => (y ? gcd(y, x % y) : x);
    const a = int(r, 2, 5);
    let b = int(r, a + 1, 9);
    while (gcd(a, b) !== 1) b++;
    const k = int(r, 3, 12), total = (a + b) * k;
    return mc(r, "Ratio", `${total} sweets are shared in the ratio ${a} : ${b}. How many are in the larger share?`, String(b * k), [String(a * k), String(total / 2), String(b * k + k), String(b * k - k)], `${a} + ${b} = ${a + b} parts. ${total} ÷ ${a + b} = ${k} per part. Larger share: ${b} × ${k} = ${b * k}.`);
  },
  (r) => {
    const w = int(r, 3, 14), h = int(r, 3, 14), area = r() < 0.5;
    const ans = area ? w * h : 2 * (w + h);
    return mc(r, area ? "Area" : "Perimeter", `A rectangle is ${w} cm long and ${h} cm wide. What is its ${area ? "area" : "perimeter"}?`, `${ans} ${area ? "cm²" : "cm"}`, (area ? [2 * (w + h), w + h, w * h + w, w * h - h] : [w * h, w + h, 2 * w + h, 4 * w]).map((x) => `${x} ${area ? "cm²" : "cm"}`), area ? `Area = length × width = ${w} × ${h} = ${ans} cm².` : `Perimeter = 2 × (${w} + ${h}) = ${ans} cm.`);
  },
  (r) => {
    const start = int(r, 7, 15) * 60 + pick(r, [0, 15, 20, 35, 45, 50]), dur = int(r, 1, 3) * 60 + pick(r, [10, 25, 40, 55]);
    const t = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    const end = start + dur;
    return mc(r, "Time", `A train leaves at ${t(start)} and the journey takes ${Math.floor(dur / 60)} h ${dur % 60} min. When does it arrive?`, t(end), [t(end + 60), t(end - 10), t(end + 40), t(start + Math.floor(dur / 60) * 100 + (dur % 60))].filter((x) => x !== t(end)), `${t(start)} + ${Math.floor(dur / 60)} h = ${t(start + Math.floor(dur / 60) * 60)}, then + ${dur % 60} min = ${t(end)}.`);
  },
  (r) => {
    const n = int(r, 2, 12), a = int(r, 2, 9), b = int(r, 1, 20), c = a * n + b;
    return mc(r, "Algebra", `If ${a}n + ${b} = ${c}, what is n?`, String(n), nearNums(r, n, String, 1), `Take ${b} from both sides: ${a}n = ${c - b}. Divide by ${a}: n = ${n}.`);
  },
  (r) => {
    const start = int(r, 2, 30), step = int(r, 3, 12), seq = Array.from({ length: 5 }, (_, i) => start + i * step);
    return mc(r, "Number sequences", `What is the next number? ${seq.slice(0, 4).join(", ")}, …`, String(seq[4]), nearNums(r, seq[4], String, 2), `The numbers go up by ${step} each time: ${seq[3]} + ${step} = ${seq[4]}.`);
  },
  (r) => {
    const nums = Array.from({ length: 5 }, () => int(r, 2, 20));
    const sum = nums.reduce((a, b) => a + b, 0), extra = (5 - (sum % 5)) % 5;
    nums[4] += extra;
    const mean = (sum + extra) / 5;
    return mc(r, "Averages", `What is the mean of ${nums.join(", ")}?`, String(mean), nearNums(r, mean, String, 1), `Add them: ${sum + extra}. Divide by 5: ${mean}.`);
  },
  (r) => {
    const a = int(r, 25, 140), b = int(r, 25, 175 - a);
    return mc(r, "Angles", `Two angles in a triangle are ${a}° and ${b}°. What is the third angle?`, `${180 - a - b}°`, nearNums(r, 180 - a - b, (x) => `${x}°`, 10).filter((x) => x !== "0°").concat(`${360 - a - b}°`), `Angles in a triangle add up to 180°. 180 − ${a} − ${b} = ${180 - a - b}°.`);
  },
  (r) => {
    const n = pick(r, [24, 36, 48, 60, 72, 84, 90, 96]);
    const f = Array.from({ length: n }, (_, i) => i + 1).filter((x) => n % x === 0).length;
    return mc(r, "Factors", `How many factors does ${n} have?`, String(f), nearNums(r, f, String, 1), `List them in pairs: ${Array.from({ length: n }, (_, i) => i + 1).filter((x) => n % x === 0).join(", ")}. That's ${f}.`);
  },
  (r) => {
    const a = (int(r, 11, 99) / 10), b = (int(r, 11, 99) / 10);
    const ans = Math.round((a + b) * 10) / 10;
    return mc(r, "Decimals", `What is ${a} + ${b}?`, String(ans), nearNums(r, Math.round(ans * 10), (x) => String(x / 10), 10), `Line up the decimal points: ${a} + ${b} = ${ans}.`);
  },
];

// ---------------------------------------------------------------------------
// Verbal reasoning
// ---------------------------------------------------------------------------

const WORDS4 = ["COLD", "LAMP", "FISH", "BIRD", "TREE", "SHIP", "MILK", "DESK", "GOLD", "RAIN", "STAR", "WOLF", "CAKE", "DRUM", "KITE", "ROAD", "SAND", "BELL", "COIN", "LEAF"];
const shiftWord = (w: string, k: number) => [...w].map((c) => String.fromCharCode(((c.charCodeAt(0) - 65 + k + 26) % 26) + 65)).join("");
const L = (i: number) => String.fromCharCode(65 + (((i % 26) + 26) % 26));

const ANALOGIES: [string, string, string, string, string[]][] = [
  ["hot", "cold", "tall", "short", ["high", "big", "wide", "thin"]],
  ["bird", "nest", "bee", "hive", ["honey", "flower", "sting", "wing"]],
  ["puppy", "dog", "kitten", "cat", ["mouse", "pet", "lion", "cub"]],
  ["finger", "hand", "toe", "foot", ["leg", "nail", "shoe", "knee"]],
  ["author", "book", "composer", "symphony", ["piano", "orchestra", "note", "concert"]],
  ["fish", "water", "bird", "air", ["tree", "feather", "nest", "sky"]],
  ["page", "book", "brick", "wall", ["house", "clay", "cement", "builder"]],
  ["glove", "hand", "sock", "foot", ["shoe", "toe", "wool", "leg"]],
  ["day", "night", "summer", "winter", ["spring", "sun", "autumn", "holiday"]],
  ["pen", "write", "knife", "cut", ["fork", "sharp", "blade", "cook"]],
  ["sheep", "flock", "wolf", "pack", ["herd", "den", "howl", "cub"]],
  ["doctor", "hospital", "teacher", "school", ["lesson", "pupil", "book", "class"]],
  ["seed", "plant", "egg", "chicken", ["nest", "shell", "farm", "yolk"]],
  ["eye", "see", "ear", "hear", ["sound", "noise", "listen", "head"]],
  ["ice", "melt", "water", "boil", ["freeze", "drink", "steam", "wet"]],
  ["Paris", "France", "Rome", "Italy", ["Spain", "Europe", "pasta", "city"]],
];

const ODD_ONE_OUT: [string[], string, string][] = [
  [["apple", "banana", "cherry", "grape"], "carrot", "The others are fruits; a carrot is a vegetable."],
  [["sparrow", "robin", "eagle", "owl"], "bat", "The others are birds; a bat is a mammal."],
  [["violin", "cello", "harp", "guitar"], "trumpet", "The others have strings; a trumpet is brass."],
  [["Mercury", "Venus", "Mars", "Jupiter"], "Moon", "The others are planets; the Moon is a moon."],
  [["oak", "ash", "beech", "willow"], "rose", "The others are trees."],
  [["happy", "cheerful", "glad", "joyful"], "angry", "The others mean pleased."],
  [["square", "triangle", "pentagon", "hexagon"], "cube", "The others are flat shapes; a cube is 3D."],
  [["copper", "iron", "silver", "gold"], "wood", "The others are metals."],
  [["whisper", "murmur", "mutter", "mumble"], "shout", "The others are quiet ways of speaking."],
  [["salmon", "trout", "cod", "haddock"], "whale", "The others are fish; a whale is a mammal."],
  [["Monday", "Friday", "Sunday", "Tuesday"], "April", "The others are days of the week."],
  [["run", "sprint", "dash", "race"], "stroll", "The others mean move fast."],
];

const SYNONYMS: [string, string, string[]][] = [
  ["begin", "start", ["finish", "begun", "try", "late"]],
  ["huge", "enormous", ["tiny", "heavy", "tall", "wide"]],
  ["brave", "courageous", ["scared", "strong", "kind", "tired"]],
  ["rapid", "quick", ["slow", "steady", "rough", "easy"]],
  ["ancient", "old", ["new", "past", "history", "young"]],
  ["silent", "quiet", ["loud", "dark", "busy", "tidy"]],
  ["gather", "collect", ["scatter", "carry", "throw", "count"]],
  ["glad", "pleased", ["sad", "proud", "cross", "tired"]],
  ["weary", "tired", ["awake", "worried", "wary", "wet"]],
  ["vacant", "empty", ["full", "busy", "vast", "open"]],
  ["fragile", "delicate", ["strong", "fresh", "fast", "heavy"]],
  ["conceal", "hide", ["show", "seek", "seal", "find"]],
];

const ANTONYMS: [string, string, string[]][] = [
  ["generous", "mean", ["kind", "giving", "rich", "nice"]],
  ["ancient", "modern", ["old", "historic", "early", "past"]],
  ["accept", "refuse", ["agree", "take", "except", "allow"]],
  ["shallow", "deep", ["low", "wide", "narrow", "thin"]],
  ["expand", "shrink", ["grow", "stretch", "spread", "widen"]],
  ["victory", "defeat", ["win", "triumph", "battle", "prize"]],
  ["permanent", "temporary", ["lasting", "fixed", "always", "solid"]],
  ["timid", "bold", ["shy", "quiet", "nervous", "small"]],
  ["scarce", "plentiful", ["rare", "scared", "few", "short"]],
  ["visible", "hidden", ["seen", "clear", "obvious", "bright"]],
];

/** Sentences with a four-letter word hidden across two words next to each other. */
const HIDDEN: [string, string][] = [
  ["The cat ate all the fish.", "TEAL"],
  ["The film ended late.", "MEND"],
  ["She wore a cape as it was cold.", "PEAS"],
  ["My aunt rode a horse.", "TROD"],
  ["The robot hopped away.", "BOTH"],
  ["The king rows the boat.", "GROW"],
  ["His tea stayed hot.", "EAST"],
];

const COMPOUND: [string, string[], string[]][] = [
  ["foot", ["ball", "print", "step"], ["hand", "toe", "boot", "shoe"]],
  ["sun", ["flower", "shine", "light"], ["moon", "day", "star", "rain"]],
  ["rain", ["bow", "coat", "drop"], ["snow", "cloud", "wet", "wind"]],
  ["book", ["case", "mark", "shop"], ["page", "note", "read", "pen"]],
  ["sea", ["shell", "side", "weed"], ["ocean", "sand", "beach", "wave"]],
  ["fire", ["work", "place", "man"], ["camp", "hot", "smoke", "ash"]],
  ["snow", ["ball", "man", "flake"], ["ice", "cold", "rain", "frost"]],
  ["butter", ["fly", "cup", "milk"], ["bread", "cream", "jam", "honey"]],
];

const VERBAL: ((r: R) => PaperQuestion)[] = [
  (r) => {
    const [a, b] = shuffle(r, WORDS4).slice(0, 2), k = pick(r, [1, 2, 3, -1, -2]);
    const right = shiftWord(b, k);
    return mc(r, "Letter codes", `If ${a} is written as ${shiftWord(a, k)}, how is ${b} written?`, right, [shiftWord(b, k + 1), shiftWord(b, -k), shiftWord(b, k - 1), shiftWord(b, k).split("").reverse().join("")], `Each letter moves ${Math.abs(k)} place${Math.abs(k) > 1 ? "s" : ""} ${k > 0 ? "forward" : "back"} in the alphabet: ${b} → ${right}.`);
  },
  (r) => {
    const [a, b] = shuffle(r, WORDS4).slice(0, 2), k = pick(r, [1, 2, 3]);
    return mc(r, "Letter codes", `If the code for ${a} is ${shiftWord(a, k)}, what word has the code ${shiftWord(b, k)}?`, b, [shiftWord(b, 1), shiftWord(b, -1), shiftWord(b, 2 * k), b.split("").reverse().join("")], `Move each letter ${k} back: ${shiftWord(b, k)} → ${b}.`);
  },
  (r) => {
    const s = int(r, 0, 12), gap = int(r, 2, 4), seq = Array.from({ length: 5 }, (_, i) => `${L(s + i * gap)}${L(s + i * gap + 1)}`);
    return mc(r, "Letter sequences", `What comes next? ${seq.slice(0, 4).join(", ")}, ?`, seq[4], [`${L(s + 4 * gap + 1)}${L(s + 4 * gap + 2)}`, `${L(s + 4 * gap - 1)}${L(s + 4 * gap)}`, `${L(s + 4 * gap)}${L(s + 4 * gap + 2)}`, `${L(s + 5 * gap)}${L(s + 5 * gap + 1)}`], `The first letter moves on ${gap} each time, and the second letter follows it: ${seq[4]}.`);
  },
  (r) => {
    const a = int(r, 1, 6), seq = [a];
    const mul = r() < 0.5;
    for (let i = 1; i < 5; i++) seq.push(mul ? seq[i - 1] * 2 : seq[i - 1] + i * 2);
    return mc(r, "Number sequences", `What comes next? ${seq.slice(0, 4).join(", ")}, ?`, String(seq[4]), nearNums(r, seq[4], String, 2), mul ? `Each number doubles: ${seq[3]} × 2 = ${seq[4]}.` : `The gap grows by 2 each time (+2, +4, +6, +8): ${seq[3]} + 8 = ${seq[4]}.`);
  },
  (r) => {
    const [a, b, c, d, wrong] = pick(r, ANALOGIES);
    return mc(r, "Analogies", `${a} is to ${b} as ${c} is to …`, d, wrong, `${a[0].toUpperCase() + a.slice(1)} and ${b} go together the same way as ${c} and ${d}.`);
  },
  (r) => {
    const [group, odd, why] = pick(r, ODD_ONE_OUT);
    const four = shuffle(r, group).slice(0, 4);
    const options = shuffle(r, [...four, odd]);
    return { topic: "Odd one out", prompt: "Which word is the odd one out?", options, answer: options.indexOf(odd), explain: why };
  },
  (r) => {
    const [w, right, wrong] = pick(r, SYNONYMS);
    return mc(r, "Synonyms", `Which word means the same, or nearly the same, as ${w.toUpperCase()}?`, right, wrong, `${w[0].toUpperCase() + w.slice(1)} means ${right}.`);
  },
  (r) => {
    const [w, right, wrong] = pick(r, ANTONYMS);
    return mc(r, "Antonyms", `Which word means the opposite of ${w.toUpperCase()}?`, right, wrong, `The opposite of ${w} is ${right}.`);
  },
  (r) => {
    const [sentence, word] = pick(r, HIDDEN);
    const words = sentence.replace(/[.]/g, "").split(" ");
    let pair = "";
    for (let i = 0; i < words.length - 1 && !pair; i++) if ((words[i] + words[i + 1]).toUpperCase().includes(word)) pair = `${words[i]} ${words[i + 1]}`;
    return mc(r, "Hidden words", `A four-letter word is hidden across two words next to each other: "${sentence}" Which word is it?`, word, shuffle(r, ["LATE", "SEAT", "HEAT", "NOTE", "ROAD", "MEAT", "GLOW", "BEST"].filter((x) => x !== word)).slice(0, 4), `Look at "${pair}": the word ${word} runs across the gap.`);
  },
  (r) => {
    const [root, endings, wrong] = pick(r, COMPOUND);
    return mc(r, "Compound words", `Which word goes in front of all of these to make new words? ${endings.join(", ")}`, root, wrong, `${endings.map((e) => root + e).join(", ")}.`);
  },
  (r) => {
    const w = pick(r, WORDS4);
    const order = [...w].sort().join("");
    return mc(r, "Alphabetical order", `If the letters of ${w} are put in alphabetical order, which letter comes first?`, order[0], [...new Set(w.split(""))].filter((c) => c !== order[0]), `In alphabetical order the letters are ${order.split("").join(", ")}.`);
  },
];

// ---------------------------------------------------------------------------
// English
// ---------------------------------------------------------------------------

const SPELLING: [string, string[]][] = [
  ["necessary", ["neccessary", "necesary", "neccesary"]],
  ["separate", ["seperate", "separete", "seperete"]],
  ["definitely", ["definately", "definitly", "defanitely"]],
  ["accommodate", ["accomodate", "acommodate", "accommadate"]],
  ["rhythm", ["rythm", "rhythym", "rhytm"]],
  ["believe", ["beleive", "belive", "beleave"]],
  ["environment", ["enviroment", "envirnment", "enviornment"]],
  ["embarrass", ["embarass", "embarras", "embaress"]],
  ["government", ["goverment", "govenment", "guvernment"]],
  ["immediately", ["immediatly", "imediately", "immedietly"]],
  ["occasion", ["ocassion", "occassion", "ocasion"]],
  ["queue", ["que", "queu", "qeue"]],
  ["restaurant", ["restaraunt", "resturant", "restuarant"]],
  ["conscience", ["concience", "conscence", "consience"]],
  ["disappear", ["dissappear", "disapear", "dissapear"]],
  ["February", ["Febuary", "Feburary", "Febrary"]],
  ["vehicle", ["vehical", "veicle", "vehicel"]],
  ["sincerely", ["sincerly", "sinceerly", "sincerelly"]],
];

const VOCAB: [string, string, string[]][] = [
  ["reluctant", "unwilling", ["eager", "angry", "late"]],
  ["abundant", "plentiful", ["missing", "noisy", "tiny"]],
  ["meticulous", "very careful", ["very quick", "very messy", "very loud"]],
  ["benevolent", "kind and generous", ["cruel", "clever", "shy"]],
  ["ominous", "threatening", ["cheerful", "huge", "hidden"]],
  ["frugal", "careful with money", ["wasteful", "fruity", "fragile"]],
  ["candid", "honest and direct", ["sweet", "secretive", "bright"]],
  ["diligent", "hard-working", ["lazy", "delightful", "sleepy"]],
  ["elated", "very happy", ["very late", "very tall", "very sad"]],
  ["obscure", "not well known", ["famous", "obvious", "clean"]],
  ["tranquil", "calm and peaceful", ["busy", "frightening", "cold"]],
  ["vivid", "bright and clear", ["dull", "alive", "faint"]],
];

const GRAMMAR: [string, string, string[], string][] = [
  ["___ going to the park after school.", "They're", ["Their", "There", "Theyre"], "\"They're\" is short for \"they are\"."],
  ["There are ___ biscuits left than yesterday.", "fewer", ["less", "lesser", "few"], "Use \"fewer\" for things you can count."],
  ["Mia and ___ went to the shops.", "I", ["me", "myself", "mine"], "Take away \"Mia and\": \"I went\", not \"me went\"."],
  ["The dog wagged ___ tail.", "its", ["it's", "its'", "it is"], "\"Its\" shows belonging; \"it's\" means \"it is\"."],
  ["She ran ___ than her brother.", "faster", ["more fast", "fastest", "more faster"], "Comparing two people: \"faster\"."],
  ["If I ___ you, I would apologise.", "were", ["was", "am", "be"], "In \"if\" wishes, we say \"if I were\"."],
  ["Neither of the boys ___ ready.", "was", ["were", "are", "be"], "\"Neither\" is singular, so \"was\"."],
  ["We should ___ left earlier.", "have", ["of", "off", "has"], "\"Should have\", never \"should of\"."],
  ["The team ___ won every match this year.", "has", ["have", "is", "were"], "\"The team\" is one group, so \"has\"."],
  ["You're ___ tall to fit through there!", "too", ["to", "two", "tow"], "\"Too\" means \"more than enough\"."],
];

const PUNCT: [string, string[], string][] = [
  ["\"Where are you going?\" asked Tom.", ["\"Where are you going\" asked Tom?", "\"Where are you going?\", asked Tom.", "Where are you going? asked Tom."], "The question mark goes inside the speech marks, and no comma after it."],
  ["The children's coats were wet.", ["The childrens' coats were wet.", "The childrens coats were wet.", "The children's coat's were wet."], "\"Children\" is already plural, so the apostrophe goes before the s."],
  ["I bought apples, pears and plums.", ["I bought apples pears, and plums.", "I bought, apples, pears and plums.", "I bought apples, pears, and, plums."], "Commas separate items in a list."],
  ["After lunch, we played football.", ["After, lunch we played football.", "After lunch we, played football.", "After lunch we played, football."], "A comma follows the opening phrase."],
  ["It's going to rain, so take a coat.", ["Its going to rain, so take a coat.", "It's going to rain so, take a coat.", "Its' going to rain, so take a coat."], "\"It's\" = \"it is\", and the comma goes before \"so\"."],
];

const WORD_CLASS: [string, string, string, string[]][] = [
  ["The fox ran quickly.", "quickly", "adverb", ["adjective", "verb", "noun"]],
  ["The enormous whale swam past.", "enormous", "adjective", ["adverb", "noun", "verb"]],
  ["Happiness is important.", "Happiness", "noun", ["adjective", "verb", "adverb"]],
  ["She whispered the answer.", "whispered", "verb", ["noun", "adverb", "adjective"]],
  ["The cat hid under the bed.", "under", "preposition", ["conjunction", "adverb", "verb"]],
  ["I was tired but I kept going.", "but", "conjunction", ["preposition", "noun", "adverb"]],
];

const ENGLISH: ((r: R) => PaperQuestion)[] = [
  (r) => {
    const [right, wrong] = pick(r, SPELLING);
    return mc(r, "Spelling", "Which word is spelt correctly?", right, wrong, `The correct spelling is "${right}".`);
  },
  (r) => {
    const [w, right, wrong] = pick(r, VOCAB);
    return mc(r, "Vocabulary", `What does "${w}" mean?`, right, wrong, `"${w[0].toUpperCase() + w.slice(1)}" means ${right}.`);
  },
  (r) => {
    const [s, right, wrong, why] = pick(r, GRAMMAR);
    return mc(r, "Grammar", `Which word fills the gap? "${s}"`, right, wrong, why);
  },
  (r) => {
    const [right, wrong, why] = pick(r, PUNCT);
    return mc(r, "Punctuation", "Which sentence is punctuated correctly?", right, wrong, why);
  },
  (r) => {
    const [s, w, right, wrong] = pick(r, WORD_CLASS);
    return mc(r, "Word classes", `In "${s}", what word class is "${w}"?`, right, wrong, `"${w}" is ${/^[aeiou]/.test(right) ? "an" : "a"} ${right} here.`);
  },
];

// ---------------------------------------------------------------------------
// Non-verbal reasoning (shapes)
// ---------------------------------------------------------------------------

const sameShape = (a: Shape, b: Shape) => a.sides === b.sides && ((a.rotation - b.rotation) % 360 + 360) % 360 === 0 && a.fill === b.fill && a.dots === b.dots;

function nvq(r: R, topic: string, prompt: string, shapes: Shape[], right: Shape, wrong: Shape[], explain: string): PaperQuestion {
  const opts = [right];
  for (const w of wrong) if (!opts.some((o) => sameShape(o, w)) && opts.length < 5) opts.push(w);
  const optionShapes = shuffle(r, opts);
  return { topic, prompt, options: optionShapes.map((_, i) => String.fromCharCode(65 + i)), answer: optionShapes.indexOf(right), explain, shapes, optionShapes };
}

const NONVERBAL: ((r: R) => PaperQuestion)[] = [
  (r) => {
    const step = pick(r, [45, 90]), start = pick(r, [0, 45, 90]), dir = r() < 0.5 ? 1 : -1;
    const seq = Array.from({ length: 5 }, (_, i): Shape => ({ sides: 1, rotation: start + dir * i * step, fill: "solid", dots: 0 }));
    return nvq(r, "Rotation", "Which shape comes next in the sequence?", seq.slice(0, 4), seq[4], [
      { ...seq[4], rotation: seq[4].rotation + 90 },
      { ...seq[4], rotation: seq[4].rotation + 180 },
      { ...seq[3] },
      { ...seq[4], rotation: seq[4].rotation - step * dir * 2 },
    ], `The arrow turns ${step}° ${dir > 0 ? "clockwise" : "anticlockwise"} each time.`);
  },
  (r) => {
    const start = int(r, 3, 4);
    const seq = Array.from({ length: 5 }, (_, i): Shape => ({ sides: start + i, rotation: 0, fill: "none", dots: 0 }));
    return nvq(r, "Sides", "Which shape comes next?", seq.slice(0, 4), seq[4], [
      { ...seq[4], sides: seq[4].sides + 1 },
      { ...seq[3] },
      { ...seq[4], fill: "solid" },
      { ...seq[4], sides: seq[4].sides - 2 },
    ], `Each shape has one more side than the one before: ${seq[4].sides} sides next.`);
  },
  (r) => {
    const sides = pick(r, [0, 3, 4, 5, 6]), fills: Shape["fill"][] = ["none", "solid", "half"];
    const seq = Array.from({ length: 5 }, (_, i): Shape => ({ sides, rotation: 0, fill: fills[i % 3], dots: i + 1 }));
    return nvq(r, "Shading and counting", "Which shape comes next?", seq.slice(0, 4), seq[4], [
      { ...seq[4], dots: seq[4].dots + 1 },
      { ...seq[4], fill: "none" },
      { ...seq[4], fill: "solid", dots: 4 },
      { ...seq[4], dots: 3 },
    ], "The shading cycles (empty, solid, half) and one dot is added each time.");
  },
  (r) => {
    const sides = pick(r, [3, 4, 5, 6]), fill = pick(r, ["none", "solid"] as const), dots = int(r, 1, 3);
    const same: Shape[] = Array.from({ length: 4 }, (_, i) => ({ sides, rotation: i * 30, fill, dots }));
    const odd: Shape = r() < 0.5 ? { sides: sides + 1, rotation: 0, fill, dots } : { sides, rotation: 15, fill, dots: dots + 1 };
    const all = shuffle(r, [...same, odd]);
    return { topic: "Odd one out", prompt: "Which shape is the odd one out?", options: all.map((_, i) => String.fromCharCode(65 + i)), answer: all.indexOf(odd), optionShapes: all, explain: odd.sides !== sides ? `It has ${odd.sides} sides; the others have ${sides}. Turning a shape doesn't change it.` : `It has ${odd.dots} dots; the others have ${dots}. Turning a shape doesn't change it.` };
  },
];

// ---------------------------------------------------------------------------
// Papers
// ---------------------------------------------------------------------------

const BANK: Record<Subject11, ((r: R) => PaperQuestion)[]> = { maths: MATHS, verbal: VERBAL, english: ENGLISH, nonverbal: NONVERBAL };

/** Build paper n for a subject. The same inputs always give the same paper. */
export function buildPaper(subject: Subject11, n: number): Paper {
  const meta = SUBJECTS_11.find((s) => s.id === subject)!;
  const r = rng(seedOf(`${subject}:${n}`));
  const gens = BANK[subject];
  const out: PaperQuestion[] = [];
  const seen = new Set<string>();
  // Cycle through every question type so each paper covers the whole subject.
  let order = shuffle(r, gens.map((_, i) => i));
  for (let tries = 0; out.length < meta.count && tries < meta.count * 20; tries++) {
    if (!order.length) order = shuffle(r, gens.map((_, i) => i));
    const q = gens[order.pop()!](r);
    const key = q.prompt + (q.shapes ? JSON.stringify(q.shapes) : "") + q.options.join("|");
    if (seen.has(key) || q.answer < 0 || q.options.length < 3) continue;
    seen.add(key);
    out.push(q);
  }
  return { subject, number: n, title: `${meta.name} · Paper ${n}`, minutes: meta.minutes, questions: out };
}

// ---------------------------------------------------------------------------
// Results and weak spots (kept in the browser)
// ---------------------------------------------------------------------------

export interface PaperResult {
  key: string; // e.g. "11:maths:3" or "gcse:biology"
  title: string;
  score: number;
  total: number;
  at: number;
  topics: Record<string, [number, number]>; // topic → [right, asked]
}

const RESULTS_KEY = "quiz-duel:paper-results";

export function loadResults(): PaperResult[] {
  try {
    const v = JSON.parse(localStorage.getItem(RESULTS_KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function saveResult(res: PaperResult) {
  const all = [res, ...loadResults()].slice(0, 200);
  try {
    localStorage.setItem(RESULTS_KEY, JSON.stringify(all));
  } catch {
    /* storage blocked */
  }
}

export function topicStats(questions: { topic: string }[], correct: boolean[]): Record<string, [number, number]> {
  const out: Record<string, [number, number]> = {};
  questions.forEach((q, i) => {
    const t = (out[q.topic] ??= [0, 0]);
    t[1]++;
    if (correct[i]) t[0]++;
  });
  return out;
}

/** Topics across all results, weakest first (at least 3 questions asked). */
export function weakSpots(results: PaperResult[], prefix = "11:"): { topic: string; right: number; asked: number; pct: number }[] {
  const sum: Record<string, [number, number]> = {};
  for (const r of results) {
    if (!r.key.startsWith(prefix)) continue;
    for (const [t, [a, b]] of Object.entries(r.topics)) {
      const s = (sum[t] ??= [0, 0]);
      s[0] += a;
      s[1] += b;
    }
  }
  return Object.entries(sum)
    .filter(([, [, b]]) => b >= 3)
    .map(([topic, [right, asked]]) => ({ topic, right, asked, pct: Math.round((right / asked) * 100) }))
    .sort((a, b) => a.pct - b.pct || b.asked - a.asked);
}

// ---------------------------------------------------------------------------
// Tips Raj gives for each question type (works offline)
// ---------------------------------------------------------------------------

export const TIPS: Record<string, string> = {
  Multiplication: "Split the second number into tens and ones, multiply each, then add. Estimate first so you can spot a silly answer.",
  Division: "Ask \"what times the divisor makes this?\" Use your times tables and check by multiplying back.",
  Fractions: "To find a fraction of an amount: divide by the bottom number, then multiply by the top.",
  Percentages: "Find 10% (divide by 10) and 5% (half of that), then build the percentage you need.",
  Money: "Work in pence to avoid decimal slips, then convert back to pounds at the end.",
  Ratio: "Add the parts, divide the total by that to get one part, then multiply.",
  Area: "Area of a rectangle = length × width. The units are squared (cm²).",
  Perimeter: "Perimeter is the distance all the way round: add every side.",
  Time: "Add the hours first, then the minutes. If the minutes pass 60, carry an hour.",
  Algebra: "Undo the operations in reverse: take away first, then divide.",
  "Number sequences": "Write the gap between each pair of numbers. Look for a pattern in the gaps too.",
  Averages: "Mean = add them all up, then divide by how many there are.",
  Angles: "Angles in a triangle add up to 180°, on a straight line 180°, around a point 360°.",
  Factors: "Find factors in pairs: 1 × n, 2 × something… Stop when the pairs meet.",
  Decimals: "Line up the decimal points before adding or subtracting.",
  "Letter codes": "Write the alphabet across the top of your page. Count how far each letter moves, and check the move is the same for every letter.",
  "Letter sequences": "Number the letters (A = 1, B = 2…) and look for the pattern in the numbers.",
  Analogies: "Make a sentence linking the first pair, like \"a bird lives in a nest\", then use the same sentence for the second.",
  "Odd one out": "Find what most of them have in common. The odd one is the one that doesn't fit, not the one that looks unusual.",
  Synonyms: "Put each option into a sentence with the word. The one that keeps the same meaning wins.",
  Antonyms: "Think of the word's opposite first, then look for it, or the closest match, in the options.",
  "Hidden words": "Run your finger along the end of one word and the start of the next. Say the letters out loud.",
  "Compound words": "Try each option in front of every word. It must make a real word every time.",
  "Alphabetical order": "Write the letters down and cross them off as you place them.",
  Spelling: "Break the word into syllables and look for tricky double letters.",
  Vocabulary: "Read widely and keep a word book. Look for word parts you know, like \"bene-\" meaning good.",
  Grammar: "Read the sentence aloud with each option. Take away extra people (\"Mia and\") to test pronouns.",
  Punctuation: "Check speech marks, apostrophes and commas one at a time.",
  "Word classes": "Nouns name things, verbs are actions, adjectives describe nouns, adverbs describe verbs.",
  Rotation: "Pick one corner or point and follow it round. Count the quarter turns.",
  Sides: "Count the sides of each shape and write the numbers down. Then it's a number sequence.",
  "Shading and counting": "Track one thing at a time: first the shading, then the number of dots.",
};

/** A worked example of an 11+ question type, for Raj. */
export function exampleFor(topic: string, seed = Date.now()): PaperQuestion | null {
  const r = rng(seed);
  for (const s of ["maths", "verbal", "english"] as Subject11[]) {
    for (let tries = 0; tries < 30; tries++) {
      const q = BANK[s][Math.floor(r() * BANK[s].length)](r);
      if (q.topic === topic) return q;
    }
  }
  return null;
}
