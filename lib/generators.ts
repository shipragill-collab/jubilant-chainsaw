/**
 * Question generators for GCSE and scholarship papers. Each generator takes a
 * seeded random function and returns one multiple-choice question, so papers
 * are endless but repeatable.
 */
import { BIOLOGY, CHEMISTRY, GEOGRAPHY, HISTORY, PHYSICS, RS, type Fact } from "./content/facts";
import { FRENCH_PERFECT, FRENCH_PRONOUNS, FRENCH_VERBS, FRENCH_VOCAB, KS3_VOCAB, LATIN_PRESENT, LATIN_PUELLA, LATIN_SENTENCES, LATIN_VOCAB } from "./content/languages";
import { int, mc, nearNums, pick, rng, seedOf, shuffle, type PaperQuestion, type R } from "./eleven-plus";
import type { LibraryPack } from "./library";

export type Gen = (r: R) => PaperQuestion;

/** Questions from a fact bank. */
export const factGen = (bank: Fact[], topic: string): Gen => (r) => {
  const [q, right, wrong, why] = pick(r, bank);
  return mc(r, topic, q, right, wrong, why);
};

/** Questions from a library pack (the ready-made subjects). */
export const packGen = (pack: LibraryPack, topic = pack.title): Gen => (r) => {
  const q = pick(r, pack.questions);
  return mc(r, topic, q.prompt, q.answer, q.wrong, q.explanation);
};

const fmt = (n: number, dp = 2) => String(Math.round(n * 10 ** dp) / 10 ** dp);

// ---------------------------------------------------------------------------
// Maths (GCSE and 13+ scholarship)
// ---------------------------------------------------------------------------

export const MATHS_ADV: Gen[] = [
  (r) => {
    const a = int(r, 2, 7), b = int(r, 1, 9) * (r() < 0.5 ? -1 : 1), c = int(r, 2, 6), d = int(r, 1, 9) * (r() < 0.5 ? -1 : 1);
    const x2 = a * c, x1 = a * d + b * c, x0 = b * d;
    const t = (k: number, v: string) => (k === 0 ? "" : `${k < 0 ? " − " : " + "}${Math.abs(k) === 1 && v ? "" : Math.abs(k)}${v}`);
    const right = `${x2}x²${t(x1, "x")}${t(x0, "")}`;
    const s = (k: number) => (k < 0 ? `− ${-k}` : `+ ${k}`);
    return mc(r, "Algebra", `Expand (${a}x ${s(b)})(${c}x ${s(d)}).`, right, [`${x2}x²${t(x0, "")}`, `${x2}x²${t(x1 + 1, "x")}${t(x0, "")}`, `${a + c}x²${t(x1, "x")}${t(x0, "")}`, `${x2}x²${t(-x1, "x")}${t(x0, "")}`], `Multiply each term: ${a}x × ${c}x = ${x2}x², the outer and inner terms give ${x1}x, and ${b} × ${d} = ${x0}.`);
  },
  (r) => {
    const p = int(r, 1, 9), q = int(r, 1, 9) * (r() < 0.5 ? -1 : 1);
    const b = p + q, c = p * q;
    const sg = (k: number) => (k < 0 ? `− ${-k}` : `+ ${k}`);
    return mc(r, "Algebra", `Factorise x² ${sg(b)}x ${sg(c)}.`, `(x ${sg(p)})(x ${sg(q)})`, [`(x ${sg(-p)})(x ${sg(-q)})`, `(x ${sg(c)})(x ${sg(1)})`, `(x ${sg(b)})(x ${sg(c)})`, `(x ${sg(p + 1)})(x ${sg(q - 1)})`], `Find two numbers that multiply to ${c} and add to ${b}: ${p} and ${q}.`);
  },
  (r) => {
    const x = int(r, 1, 8), y = int(r, 1, 8), a = int(r, 1, 4), b = int(r, 1, 4), c = int(r, 1, 4), d = int(r, 1, 4);
    if (a * d === b * c) return MATHS_ADV[0](r);
    return mc(r, "Simultaneous equations", `Solve: ${a}x + ${b}y = ${a * x + b * y} and ${c}x + ${d}y = ${c * x + d * y}.`, `x = ${x}, y = ${y}`, [`x = ${y}, y = ${x}`, `x = ${x + 1}, y = ${y - 1}`, `x = ${x}, y = ${y + 2}`, `x = ${x - 1}, y = ${y}`], `Eliminate one variable, solve for the other, then substitute back. Check: ${a}(${x}) + ${b}(${y}) = ${a * x + b * y}.`);
  },
  (r) => {
    const base = pick(r, [2, 3, 5, 10]), m = int(r, 2, 7), n = int(r, 2, 6), op = pick(r, ["×", "÷", "power"] as const);
    const right = op === "×" ? m + n : op === "÷" ? m - n : m * n;
    const q = op === "power" ? `(${base}^${m})^${n}` : `${base}^${m} ${op} ${base}^${n}`;
    return mc(r, "Indices", `Simplify ${q}. Give the power of ${base}.`, `${base}^${right}`, [`${base}^${op === "×" ? m * n : m + n}`, `${base}^${Math.abs(m - n) + 1}`, `${base * base}^${right}`, `${base}^${right + 1}`], op === "×" ? "Multiplying: add the powers." : op === "÷" ? "Dividing: subtract the powers." : "Power of a power: multiply the powers.");
  },
  (r) => {
    const m = int(r, 11, 99) / 10, e = int(r, 3, 8), big = r() < 0.5;
    const num = big ? `${Math.round(m * 10 ** e)}` : `0.${"0".repeat(e - 1)}${String(m).replace(".", "")}`;
    const right = `${m} × 10^${big ? e : -e}`;
    return mc(r, "Standard form", `Write ${num} in standard form.`, right, [`${m} × 10^${big ? e + 1 : -(e - 1)}`, `${m * 10} × 10^${big ? e - 1 : -e}`, `${m} × 10^${big ? -e : e}`, `${m} × 10^${big ? e - 1 : -(e + 1)}`], "Move the decimal point until the number is between 1 and 10; count the places.");
  },
  (r) => {
    const orig = pick(r, [40, 60, 80, 120, 150, 200, 250, 400]), pc = pick(r, [10, 20, 25, 30, 40]);
    const now = orig * (1 + pc / 100);
    return mc(r, "Reverse percentages", `After a ${pc}% increase, a price is £${fmt(now)}. What was the original price?`, `£${orig}`, [`£${fmt(now * (1 - pc / 100))}`, `£${fmt(now - pc)}`, `£${fmt(now / (1 - pc / 100))}`, `£${orig + 10}`], `The new price is ${100 + pc}% of the original, so divide by ${1 + pc / 100}: £${orig}.`);
  },
  (r) => {
    const p = pick(r, [1000, 2000, 500, 1500]), rate = pick(r, [2, 3, 4, 5]), yrs = int(r, 2, 3);
    const v = p * (1 + rate / 100) ** yrs;
    return mc(r, "Compound interest", `£${p} is invested at ${rate}% compound interest per year. What is it worth after ${yrs} years (to the nearest penny)?`, `£${v.toFixed(2)}`, [`£${(p * (1 + (rate * yrs) / 100)).toFixed(2)}`, `£${(p * (1 + rate / 100) ** (yrs + 1)).toFixed(2)}`, `£${(p + rate * yrs).toFixed(2)}`, `£${(v - 10).toFixed(2)}`], `Multiply by ${1 + rate / 100} each year: ${p} × ${1 + rate / 100}^${yrs} = ${v.toFixed(2)}. (Simple interest would be less.)`);
  },
  (r) => {
    const red = int(r, 2, 7), blue = int(r, 2, 7), green = int(r, 1, 5), t = red + blue + green;
    const colour = pick(r, ["red", "blue", "green"] as const), n = { red, blue, green }[colour];
    return mc(r, "Probability", `A bag has ${red} red, ${blue} blue and ${green} green counters. One is picked at random. What is P(${colour})?`, `${n}/${t}`, [`${n}/${t - n}`, `${t - n}/${t}`, `1/${t}`, `${n}/${t + 1}`], `${n} ${colour} out of ${t} counters in total.`);
  },
  (r) => {
    const [a, b, c] = pick(r, [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25]] as const);
    const findHyp = r() < 0.6;
    return findHyp
      ? mc(r, "Pythagoras", `A right-angled triangle has shorter sides ${a} cm and ${b} cm. How long is the hypotenuse?`, `${c} cm`, [`${a + b} cm`, `${c + 1} cm`, `${Math.round(Math.sqrt(b * b - a * a))} cm`, `${(a * b) / 2} cm`], `c² = ${a}² + ${b}² = ${a * a + b * b}, so c = ${c}.`)
      : mc(r, "Pythagoras", `A right-angled triangle has hypotenuse ${c} cm and one side ${a} cm. How long is the other side?`, `${b} cm`, [`${c - a} cm`, `${c + a} cm`, `${b + 1} cm`, `${Math.round(Math.sqrt(c * c + a * a))} cm`], `b² = ${c}² − ${a}² = ${c * c - a * a}, so b = ${b}.`);
  },
  (r) => {
    const rad = int(r, 2, 12), area = r() < 0.5;
    const v = area ? Math.PI * rad * rad : 2 * Math.PI * rad;
    return mc(r, area ? "Circles: area" : "Circles: circumference", `Find the ${area ? "area" : "circumference"} of a circle with radius ${rad} cm, to 1 d.p.`, `${v.toFixed(1)} ${area ? "cm²" : "cm"}`, [`${(area ? 2 * Math.PI * rad : Math.PI * rad * rad).toFixed(1)} ${area ? "cm²" : "cm"}`, `${(area ? Math.PI * 2 * rad * 2 * rad : Math.PI * rad).toFixed(1)} ${area ? "cm²" : "cm"}`, `${(v + 1).toFixed(1)} ${area ? "cm²" : "cm"}`, `${(rad * rad).toFixed(1)} ${area ? "cm²" : "cm"}`], area ? `A = πr² = π × ${rad}² ≈ ${v.toFixed(1)}.` : `C = 2πr = 2 × π × ${rad} ≈ ${v.toFixed(1)}.`);
  },
  (r) => {
    const n = pick(r, [5, 6, 8, 9, 10, 12]), interior = r() < 0.5;
    const v = interior ? ((n - 2) * 180) / n : 360 / n;
    return mc(r, "Angles in polygons", `What is each ${interior ? "interior" : "exterior"} angle of a regular polygon with ${n} sides?`, `${v}°`, [`${interior ? 360 / n : ((n - 2) * 180) / n}°`, `${(n - 2) * 180}°`, `${v + 10}°`, `${180 / n}°`], interior ? `Interior angles add to (n − 2) × 180 = ${(n - 2) * 180}°; ÷ ${n} = ${v}°.` : `Exterior angles add to 360°; ÷ ${n} = ${v}°.`);
  },
  (r) => {
    const x1 = int(r, -3, 3), y1 = int(r, -3, 5), m = pick(r, [-3, -2, -1, 1, 2, 3, 4]), dx = int(r, 1, 4);
    const x2 = x1 + dx, y2 = y1 + m * dx;
    return mc(r, "Gradient", `What is the gradient of the line through (${x1}, ${y1}) and (${x2}, ${y2})?`, String(m), [String(-m), String(m * 2), String(dx), `1/${m}`], `Gradient = change in y ÷ change in x = ${y2 - y1} ÷ ${dx} = ${m}.`);
  },
  (r) => {
    const k = int(r, 2, 6), x = int(r, 2, 8), y = k * x, x2 = int(r, 2, 12);
    return mc(r, "Proportion", `y is directly proportional to x. When x = ${x}, y = ${y}. Find y when x = ${x2}.`, String(k * x2), nearNums(r, k * x2, String, k), `y = ${k}x (since ${y} ÷ ${x} = ${k}). So y = ${k} × ${x2} = ${k * x2}.`);
  },
  (r) => {
    const s = int(r, 2, 6);
    return mc(r, "Surface area and volume", `What is the volume of a cube with side ${s} cm?`, `${s ** 3} cm³`, [`${s * s} cm³`, `${6 * s * s} cm³`, `${3 * s} cm³`, `${s ** 3 + s} cm³`], `Volume = side³ = ${s}³ = ${s ** 3} cm³.`);
  },
];

// ---------------------------------------------------------------------------
// Science calculations
// ---------------------------------------------------------------------------

export const PHYSICS_CALC: Gen[] = [
  (r) => { const d = int(r, 2, 20) * 50, t = pick(r, [10, 20, 25, 40, 50]); return mc(r, "Speed", `A cyclist travels ${d} m in ${t} s. What is the average speed?`, `${fmt(d / t)} m/s`, [`${d * t} m/s`, `${fmt(t / d, 3)} m/s`, `${fmt(d / t + 2)} m/s`, `${d + t} m/s`], `speed = distance ÷ time = ${d} ÷ ${t}.`); },
  (r) => { const m = int(r, 2, 20), a = int(r, 2, 9); return mc(r, "Force", `What force is needed to accelerate a ${m} kg mass at ${a} m/s²?`, `${m * a} N`, [`${m + a} N`, `${fmt(m / a)} N`, `${m * a * 10} N`, `${m * a + a} N`], `F = m × a = ${m} × ${a}.`); },
  (r) => { const m = int(r, 2, 80); return mc(r, "Weight", `What is the weight of a ${m} kg object on Earth? (g = 10 N/kg)`, `${m * 10} N`, [`${m} N`, `${m / 10} N`, `${m * 100} N`, `${m + 10} N`], `W = m × g = ${m} × 10.`); },
  (r) => { const m = pick(r, [200, 400, 540, 900, 1200]), v = pick(r, [50, 100, 200, 400]); return mc(r, "Density", `A block has mass ${m} g and volume ${v} cm³. What is its density?`, `${fmt(m / v)} g/cm³`, [`${m * v} g/cm³`, `${fmt(v / m)} g/cm³`, `${m - v} g/cm³`, `${fmt(m / v + 1)} g/cm³`], `density = mass ÷ volume = ${m} ÷ ${v}.`); },
  (r) => { const m = int(r, 1, 10), v = int(r, 2, 10); return mc(r, "Kinetic energy", `What is the kinetic energy of a ${m} kg object moving at ${v} m/s?`, `${0.5 * m * v * v} J`, [`${m * v} J`, `${m * v * v} J`, `${0.5 * m * v} J`, `${0.5 * m * v * v + v} J`], `KE = ½mv² = 0.5 × ${m} × ${v}².`); },
  (r) => { const m = int(r, 1, 20), h = int(r, 2, 30); return mc(r, "Gravitational potential energy", `How much GPE does a ${m} kg mass gain when lifted ${h} m? (g = 10 N/kg)`, `${m * h * 10} J`, [`${m * h} J`, `${m + h + 10} J`, `${m * 10} J`, `${m * h * 100} J`], `GPE = m × g × h = ${m} × 10 × ${h}.`); },
  (r) => { const i = int(r, 1, 6), rr = int(r, 2, 20); return mc(r, "Electricity", `A current of ${i} A flows through a ${rr} Ω resistor. What is the potential difference?`, `${i * rr} V`, [`${fmt(rr / i)} V`, `${i + rr} V`, `${fmt(i / rr)} V`, `${i * rr * 2} V`], `V = I × R = ${i} × ${rr}.`); },
  (r) => { const v = pick(r, [6, 12, 230]), i = pick(r, [2, 3, 5]); return mc(r, "Electrical power", `A device runs at ${v} V with a current of ${i} A. What is its power?`, `${v * i} W`, [`${fmt(v / i)} W`, `${v + i} W`, `${v * i * i} W`, `${fmt(i / v, 3)} W`], `P = V × I = ${v} × ${i}.`); },
  (r) => { const f = pick(r, [50, 100, 200, 500, 1000]), l = pick(r, [0.5, 1.5, 2, 3.4, 0.34]); return mc(r, "Waves", `A wave has frequency ${f} Hz and wavelength ${l} m. What is its speed?`, `${fmt(f * l)} m/s`, [`${fmt(f / l)} m/s`, `${fmt(l / f, 4)} m/s`, `${f + l} m/s`, `${fmt(f * l * 2)} m/s`], `v = f × λ = ${f} × ${l}.`); },
  (r) => { const F = pick(r, [100, 200, 500, 600, 1000]), A = pick(r, [2, 4, 5, 10, 0.5]); return mc(r, "Pressure", `A force of ${F} N acts on an area of ${A} m². What is the pressure?`, `${fmt(F / A)} Pa`, [`${F * A} Pa`, `${fmt(A / F, 4)} Pa`, `${F + A} Pa`, `${fmt(F / A / 2)} Pa`], `p = F ÷ A = ${F} ÷ ${A}.`); },
  (r) => { const E = pick(r, [600, 1200, 3000, 4800, 9000]), t = pick(r, [10, 20, 30, 60]); return mc(r, "Power", `A motor transfers ${E} J in ${t} s. What is its power?`, `${fmt(E / t)} W`, [`${E * t} W`, `${fmt(t / E, 4)} W`, `${E - t} W`, `${fmt(E / t / 2)} W`], `P = E ÷ t = ${E} ÷ ${t}.`); },
];

const AR: Record<string, number> = { H: 1, C: 12, N: 14, O: 16, Na: 23, Mg: 24, Al: 27, S: 32, Cl: 35.5, K: 39, Ca: 40, Fe: 56, Cu: 63.5 };
const COMPOUNDS: [string, [string, number][]][] = [
  ["H₂O", [["H", 2], ["O", 1]]], ["CO₂", [["C", 1], ["O", 2]]], ["NaCl", [["Na", 1], ["Cl", 1]]], ["MgO", [["Mg", 1], ["O", 1]]],
  ["CaCO₃", [["Ca", 1], ["C", 1], ["O", 3]]], ["H₂SO₄", [["H", 2], ["S", 1], ["O", 4]]], ["NH₃", [["N", 1], ["H", 3]]], ["CH₄", [["C", 1], ["H", 4]]],
  ["Fe₂O₃", [["Fe", 2], ["O", 3]]], ["KCl", [["K", 1], ["Cl", 1]]], ["Al₂O₃", [["Al", 2], ["O", 3]]], ["CuO", [["Cu", 1], ["O", 1]]],
];
const mrOf = (parts: [string, number][]) => parts.reduce((s, [e, n]) => s + AR[e] * n, 0);
const arText = (parts: [string, number][]) => parts.map(([e]) => `${e} = ${AR[e]}`).join(", ");

export const CHEM_CALC: Gen[] = [
  (r) => { const [f, parts] = pick(r, COMPOUNDS); const mr = mrOf(parts); return mc(r, "Relative formula mass", `What is the Mr of ${f}? (${arText(parts)})`, String(mr), [String(mr + 16), String(parts.reduce((s, [e]) => s + AR[e], 0)), String(mr - 1), String(mr * 2)], `Add up the atoms: ${parts.map(([e, n]) => `${n} × ${AR[e]}`).join(" + ")} = ${mr}.`); },
  (r) => { const [f, parts] = pick(r, COMPOUNDS); const mr = mrOf(parts); const k = pick(r, [0.5, 1, 2, 3, 5]); const mass = mr * k; return mc(r, "Moles", `How many moles are in ${fmt(mass)} g of ${f}? (Mr = ${mr})`, `${k} mol`, [`${fmt(mass * mr)} mol`, `${k * 2} mol`, `${fmt(mr / mass)} mol`, `${k + 1} mol`], `moles = mass ÷ Mr = ${fmt(mass)} ÷ ${mr} = ${k}.`); },
  (r) => { const [f, parts] = pick(r, COMPOUNDS.filter(([, p]) => p.length === 2)); const mr = mrOf(parts); const [e, n] = parts[0]; const pc = (AR[e] * n * 100) / mr; return mc(r, "Percentage by mass", `What percentage of the mass of ${f} is ${e}? (Mr = ${mr}, ${e} = ${AR[e]})`, `${pc.toFixed(1)}%`, [`${(100 - pc).toFixed(1)}%`, `${(pc / 2).toFixed(1)}%`, `${Math.min(99, pc + 10).toFixed(1)}%`, `${((AR[e] * 100) / (mr * 2)).toFixed(1)}%`], `(${n} × ${AR[e]}) ÷ ${mr} × 100 = ${pc.toFixed(1)}%.`); },
  (r) => { const m = pick(r, [5, 10, 20, 25, 40]), v = pick(r, [0.25, 0.5, 1, 2]); return mc(r, "Concentration", `${m} g of salt is dissolved to make ${v} dm³ of solution. What is the concentration?`, `${fmt(m / v)} g/dm³`, [`${m * v} g/dm³`, `${fmt(v / m, 3)} g/dm³`, `${m + v} g/dm³`, `${fmt(m / v / 2)} g/dm³`], `concentration = mass ÷ volume = ${m} ÷ ${v}.`); },
];

export const BIO_CALC: Gen[] = [
  (r) => { const actual = pick(r, [0.01, 0.02, 0.05, 0.1]), mag = pick(r, [100, 200, 400, 1000]); const img = actual * mag; return mc(r, "Magnification", `A cell is ${actual} mm across. Under a microscope its image is ${fmt(img)} mm. What is the magnification?`, `×${mag}`, [`×${mag / 10}`, `×${mag * 10}`, `×${fmt(img + actual)}`, `×${mag + 100}`], `magnification = image size ÷ actual size = ${fmt(img)} ÷ ${actual}.`); },
  (r) => { const start = pick(r, [2.0, 2.5, 4.0, 5.0]), change = pick(r, [0.2, 0.5, -0.4, -0.5, 1.0]); const end = start + change; const pc = (change / start) * 100; return mc(r, "Percentage change", `A potato piece changed from ${start.toFixed(1)} g to ${end.toFixed(1)} g in a salt solution. What is the percentage change?`, `${pc > 0 ? "+" : ""}${pc.toFixed(1)}%`, [`${pc > 0 ? "−" : "+"}${Math.abs(pc).toFixed(1)}%`, `${change.toFixed(1)}%`, `${((change / end) * 100).toFixed(1)}%`, `${(pc * 2).toFixed(1)}%`], `(change ÷ start) × 100 = (${change.toFixed(1)} ÷ ${start.toFixed(1)}) × 100.`); },
];

// ---------------------------------------------------------------------------
// Computer science
// ---------------------------------------------------------------------------

export const CS_GEN: Gen[] = [
  (r) => { const n = int(r, 5, 255); return mc(r, "Binary", `What is the binary number ${n.toString(2).padStart(8, "0")} in denary?`, String(n), nearNums(r, n, String, 1).concat(String(n * 2)), `Add the place values (128, 64, 32, 16, 8, 4, 2, 1) where there is a 1.`); },
  (r) => { const n = int(r, 5, 255); const b = n.toString(2).padStart(8, "0"); return mc(r, "Binary", `What is ${n} in 8-bit binary?`, b, [(n + 1).toString(2).padStart(8, "0"), (n ^ 4).toString(2).padStart(8, "0"), b.split("").reverse().join(""), (n >> 1).toString(2).padStart(8, "0")].filter((x) => x !== b), "Work from 128 down, subtracting each place value that fits."); },
  (r) => { const n = int(r, 16, 255); const h = n.toString(16).toUpperCase(); return mc(r, "Hexadecimal", `What is the hexadecimal number ${h} in denary?`, String(n), nearNums(r, n, String, 16), `First digit × 16 + second digit. (A = 10 … F = 15.)`); },
  (r) => { const [q, right, wrong, why] = pick(r, [["How many bits are in a byte?", "8", ["4", "16", "1024"], "A byte is 8 bits."], ["How many bytes are in a kilobyte (as used in most GCSE specifications)?", "1000", ["8", "100", "1,000,000"], "1 KB = 1000 bytes (or 1024 in some contexts)."], ["What does a NOT gate do?", "Reverses its input", ["Outputs 1 if both inputs are 1", "Outputs 1 if either input is 1", "Always outputs 0"], "NOT turns 1 into 0 and 0 into 1."], ["When does an AND gate output 1?", "When both inputs are 1", ["When either input is 1", "When both inputs are 0", "Always"], "Both must be true."], ["When does an OR gate output 1?", "When at least one input is 1", ["Only when both are 1", "Only when both are 0", "Never"], "Either or both true."], ["What does CPU stand for?", "Central Processing Unit", ["Computer Personal Unit", "Central Program Utility", "Control Processing Unit"], "It fetches, decodes and executes instructions."], ["Which type of memory is volatile?", "RAM", ["ROM", "SSD", "Hard disk"], "RAM loses its contents when power is off."], ["What is an algorithm?", "A step-by-step set of instructions to solve a problem", ["A type of computer", "A programming language", "A virus"], "Algorithms can be written in pseudocode or flowcharts."]] as [string, string, string[], string][]); return mc(r, "Computer systems", q, right, wrong, why); },
];

// ---------------------------------------------------------------------------
// Languages
// ---------------------------------------------------------------------------

export const FRENCH_GEN: Gen[] = [
  (r) => { const [fr, en] = pick(r, FRENCH_VOCAB); return mc(r, "French vocabulary", `What does "${fr}" mean?`, en, shuffle(r, FRENCH_VOCAB.filter(([, e]) => e !== en)).slice(0, 3).map(([, e]) => e), `"${fr}" = ${en}.`); },
  (r) => { const [fr, en] = pick(r, FRENCH_VOCAB); return mc(r, "French vocabulary", `How do you say "${en}" in French?`, fr, shuffle(r, FRENCH_VOCAB.filter(([f]) => f !== fr)).slice(0, 3).map(([f]) => f), `"${en}" = ${fr}.`); },
  (r) => { const v = pick(r, FRENCH_VERBS); const i = int(r, 0, 5); const right = v[2 + i]; const others = [...new Set(v.slice(2).filter((x) => x !== right))].slice(0, 3); return mc(r, "French verbs", `Complete: ${FRENCH_PRONOUNS[i]} ___ (${v[0]}, present tense)`, right, others, `${v[0]} (${v[1]}): ${FRENCH_PRONOUNS[i]} ${right}.`); },
  (r) => { const [en, right, wrong] = pick(r, FRENCH_PERFECT); return mc(r, "French perfect tense", `How do you say "${en}"?`, right, wrong, "Most verbs use avoir; verbs of movement like aller, arriver and rester use être (and agree with the subject)."); },
];

export const LATIN_GEN: Gen[] = [
  (r) => { const [la, en] = pick(r, LATIN_VOCAB); return mc(r, "Latin vocabulary", `What does "${la}" mean?`, en, shuffle(r, LATIN_VOCAB.filter(([, e]) => e !== en)).slice(0, 3).map(([, e]) => e), `${la} = ${en}.`); },
  (r) => { const [en, right] = pick(r, LATIN_PRESENT); return mc(r, "Latin verbs", `Which Latin word means "${en}"?`, right, shuffle(r, LATIN_PRESENT.filter(([, f]) => f !== right)).slice(0, 3).map(([, f]) => f), `Present tense endings: -o, -s, -t, -mus, -tis, -nt.`); },
  (r) => { const forms = LATIN_PUELLA.filter(([, f], i, a) => a.findIndex(([, g]) => g === f) === i); const [cas, right] = pick(r, forms); return mc(r, "Latin nouns", `What is the ${cas} of puella (girl)?`, right, shuffle(r, forms.filter(([, f]) => f !== right)).slice(0, 3).map(([, f]) => f), `First declension: puella, puellam, puellae, puellae, puellā; puellae, puellas, puellarum, puellis, puellis.`); },
  (r) => { const [la, right, wrong] = pick(r, LATIN_SENTENCES); return mc(r, "Latin translation", `Translate: "${la}"`, right, wrong, "Check endings: -m is usually accusative (the object), and the verb ending tells you the subject."); },
];

// ---------------------------------------------------------------------------
// English
// ---------------------------------------------------------------------------

export const KS3_VOCAB_GEN: Gen = (r) => {
  const [w, right, wrong] = pick(r, KS3_VOCAB);
  return mc(r, "Vocabulary", `What does "${w}" mean?`, right, wrong, `"${w[0].toUpperCase() + w.slice(1)}" means ${right}.`);
};

// Fact-bank generators by subject.
export const BIO_FACTS = factGen(BIOLOGY, "Biology");
export const CHEM_FACTS = factGen(CHEMISTRY, "Chemistry");
export const PHYS_FACTS = factGen(PHYSICS, "Physics");
export const HIST_FACTS = factGen(HISTORY, "History");
export const GEOG_FACTS = factGen(GEOGRAPHY, "Geography");
export const RS_FACTS = factGen(RS, "Religious studies");

// ---------------------------------------------------------------------------
// Building papers
// ---------------------------------------------------------------------------

/** A repeatable paper from a weighted list of generators, with no repeated questions. */
export function buildFrom(gens: Gen[], count: number, seed: string): PaperQuestion[] {
  const r = rng(seedOf(seed));
  const out: PaperQuestion[] = [];
  const seen = new Set<string>();
  let order = shuffle(r, gens.map((_, i) => i));
  for (let tries = 0; out.length < count && tries < count * 30; tries++) {
    if (!order.length) order = shuffle(r, gens.map((_, i) => i));
    const q = gens[order.pop()!](r);
    const key = q.prompt + "|" + q.options.join("|");
    if (seen.has(q.prompt) || seen.has(key) || q.answer < 0 || q.options.length < 3 || new Set(q.options).size !== q.options.length) continue;
    seen.add(q.prompt);
    seen.add(key);
    out.push(q);
  }
  return out;
}
