/** Plans, coin packs and the shop catalogue. Prices are in pence (GBP). */

export type PlanId = "free" | "pro";
export const GEM_PACKS = [
  { id: "gems-60", gems: 60, pricePence: 20, label: "Handful" },
  { id: "gems-200", gems: 200, pricePence: 50, label: "Pouch" },
  { id: "gems-500", gems: 500, pricePence: 100, label: "Vault" },
];

export interface Plan {
  id: PlanId;
  name: string;
  pricePence: number; // per month
  tagline: string;
  features: string[];
  /** Daily allowances; null = unlimited. */
  limits: { aiGenerations: number | null; rajMessages: number | null };
  monthlyCoins: number;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    pricePence: 0,
    tagline: "Everything you need to start studying with friends.",
    features: [
      "5 AI quizzes or study sets a day",
      "25 messages with Raj a day",
      "Join unlimited duels from friends",
      "Unlimited flashcard reviews",
      "Earn coins by playing duels",
      "Starter avatar skins",
    ],
    limits: { aiGenerations: 5, rajMessages: 25 },
    monthlyCoins: 0,
  },
  pro: {
    id: "pro",
    name: "Pro",
    pricePence: 199,
    tagline: "Unlimited AI, a bigger allowance of coins, and exclusive gear.",
    features: [
      "Unlimited AI quizzes and study sets",
      "Unlimited guided practice with Raj",
      "1,000 bonus coins every month",
      "A free exclusive skin every month",
      "Pro-only skins and accessories",
      "Pro badge on the leaderboard",
    ],
    limits: { aiGenerations: null, rajMessages: null },
    monthlyCoins: 1000,
  },
};

export interface CoinPack {
  id: string;
  coins: number;
  pricePence: number;
  label: string;
}

export const COIN_PACKS: CoinPack[] = [
  { id: "coins-500", coins: 500, pricePence: 20, label: "Pocket" },
  { id: "coins-1500", coins: 1500, pricePence: 50, label: "Satchel" },
  { id: "coins-4000", coins: 4000, pricePence: 100, label: "Treasure chest" },
];

export type Slot = "skin" | "hat" | "eyes" | "neck" | "theme";

export const SLOTS: { id: Slot; label: string }[] = [
  { id: "skin", label: "Skins" },
  { id: "hat", label: "Hats" },
  { id: "eyes", label: "Eyewear" },
  { id: "neck", label: "Neckwear" },
  { id: "theme", label: "App skins" },
];

export type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";
export const RARITIES: Rarity[] = ["common", "rare", "epic", "legendary", "mythic"];
export const RARITY_LABEL: Record<Rarity, string> = { common: "Common", rare: "Rare", epic: "Epic", legendary: "Legendary", mythic: "Mythic" };

export type Season = "christmas" | "halloween" | "diwali" | "easter";
export const SEASON_LABEL: Record<Season, string> = { christmas: "Christmas", halloween: "Halloween", diwali: "Diwali", easter: "Easter" };

/** How an avatar skin is painted (see components/avatar.tsx). No stripes. */
export interface SkinLook {
  kind:
    | "solid" | "gradient" | "radial" | "dots" | "speckle" | "split" | "facet" | "stars" | "glow"
    | "xmas-snow" | "xmas-ginger" | "halloween-pumpkin" | "halloween-ghost" | "diwali-diya" | "diwali-rangoli" | "easter-egg" | "easter-bunny";
  colors: string[];
  face?: string;
}

export interface ShopItem {
  id: string;
  slot: Slot;
  name: string;
  rarity: Rarity;
  description: string;
  /** Price in coins (0 = free starter item). Ignored when gems or pricePence is set. */
  price: number;
  /** Price in gems instead of coins. */
  gems?: number;
  /** Bought with real money (pence), through checkout. */
  pricePence?: number;
  /** Only on sale during this festival; owners keep it all year. */
  season?: Season;
  /** Earned on the Duel Pass at this tier; not sold. */
  passTier?: number;
  /** Free for Pro members during this month (YYYY-MM); not sold. */
  proMonth?: string;
  proOnly?: boolean;
  look?: SkinLook;
  lore?: string;
}

const skin = (id: string, name: string, rarity: Rarity, look: SkinLook, description: string, extra: Partial<ShopItem> = {}): ShopItem => ({
  id, slot: "skin", name, rarity, look, description, price: 0, ...extra,
});

/** 48 avatar skins + 2 Mythic app skins = 50 skins. */
const SKINS: ShopItem[] = [
  // Common
  skin("skin-classic", "Classic Red", "common", { kind: "solid", colors: ["#e1342f"] }, "The original duellist."),
  skin("skin-ocean", "Ocean", "common", { kind: "solid", colors: ["#2f7de1"] }, "Calm, cool and collected."),
  skin("skin-peach", "Peach", "common", { kind: "solid", colors: ["#f4a988"], face: "#3b1d0e" }, "Soft and sunny.", { price: 100 }),
  skin("skin-midnight", "Midnight", "common", { kind: "solid", colors: ["#1f2937"] }, "For late-night revision.", { price: 120 }),
  skin("skin-sky", "Sky", "common", { kind: "solid", colors: ["#7cc4f0"], face: "#0b2a44" }, "Clear-headed.", { price: 80 }),
  skin("skin-mint", "Mint", "common", { kind: "solid", colors: ["#8fdcb5"], face: "#0b3a26" }, "Fresh start.", { price: 80 }),
  skin("skin-plum", "Plum", "common", { kind: "solid", colors: ["#7a3e7a"] }, "Rich and thoughtful.", { price: 100 }),
  skin("skin-slate", "Slate", "common", { kind: "solid", colors: ["#5b6b7f"] }, "Clean slate, every day.", { price: 80 }),
  skin("skin-coral", "Coral", "common", { kind: "solid", colors: ["#ff7a6b"] }, "Warm and bright.", { price: 100 }),
  skin("skin-sage", "Sage", "common", { kind: "solid", colors: ["#8aa68a"], face: "#1d2a1d" }, "Wise beyond its years.", { price: 100 }),
  // Rare
  skin("skin-dots", "Polka", "rare", { kind: "dots", colors: ["#13a89e", "#c9f5ef"] }, "Dotty about learning.", { price: 300 }),
  skin("skin-sunset", "Sunset", "rare", { kind: "gradient", colors: ["#ffb347", "#ff5f6d", "#8e44ad"] }, "A warm gradient glow.", { price: 400 }),
  skin("skin-lagoon", "Lagoon", "rare", { kind: "gradient", colors: ["#43cea2", "#185a9d"] }, "Deep water, clear thinking.", { price: 350 }),
  skin("skin-berry", "Berry Speckle", "rare", { kind: "speckle", colors: ["#b0306a", "#ffd1e3"] }, "Freckled with good ideas.", { price: 300 }),
  skin("skin-seafoam", "Seafoam", "rare", { kind: "dots", colors: ["#2a9d8f", "#e9f5db"] }, "Bubbly.", { price: 300 }),
  skin("skin-dusk", "Dusk", "rare", { kind: "gradient", colors: ["#ff9a8b", "#6a4c93"] }, "The golden hour before an exam.", { price: 350 }),
  skin("skin-glacier", "Glacier", "rare", { kind: "radial", colors: ["#e0f7ff", "#5aa9e6"], face: "#0b2a44" }, "Cool under pressure.", { price: 400 }),
  skin("skin-meadow", "Meadow", "rare", { kind: "gradient", colors: ["#c6ea8d", "#2f9e44"], face: "#10300f" }, "Growing every day.", { price: 350 }),
  skin("skin-honey", "Honey", "rare", { kind: "dots", colors: ["#f2a900", "#fff1c1"], face: "#3d2a00" }, "Busy as a bee.", { price: 300 }),
  // Epic
  skin("skin-galaxy", "Galaxy", "epic", { kind: "stars", colors: ["#8a5cff", "#3b1f8f", "#0b0b2a"] }, "Stars included.", { price: 900 }),
  skin("skin-opal", "Opal", "epic", { kind: "radial", colors: ["#fdfcfb", "#c3e8f7", "#f6c1d9"], face: "#3b2a4a" }, "Shifts with the light.", { price: 850 }),
  skin("skin-lava", "Lava", "epic", { kind: "radial", colors: ["#ffd166", "#ef476f", "#3d0c11"] }, "Hot streak energy.", { price: 900 }),
  skin("skin-jade", "Jade", "epic", { kind: "facet", colors: ["#7dd3a8", "#2e8b57", "#14532d"] }, "Cut like a gemstone.", { price: 950 }),
  skin("skin-amethyst", "Amethyst", "epic", { kind: "facet", colors: ["#d8b4fe", "#9333ea", "#4c1d95"] }, "A crystal-clear mind.", { price: 950 }),
  skin("skin-storm", "Storm", "epic", { kind: "split", colors: ["#334155", "#94a3b8"] }, "Brainstorm mode.", { price: 700 }),
  skin("skin-tide", "Tide", "epic", { kind: "split", colors: ["#0ea5e9", "#0f766e"] }, "Turning the tide on revision.", { price: 700 }),
  // Legendary
  skin("skin-gold", "Solid Gold", "legendary", { kind: "facet", colors: ["#fff1a8", "#f2c230", "#b8860b"], face: "#4a3200" }, "Top of the class.", { price: 2000 }),
  skin("skin-diamond", "Diamond", "legendary", { kind: "facet", colors: ["#ffffff", "#cfe8ff", "#8ab4d9"], face: "#1e3a5f" }, "Unbreakable focus.", { gems: 120 }),
  skin("skin-phoenix", "Phoenix", "legendary", { kind: "glow", colors: ["#ffe259", "#ff7a1a", "#b3122e"] }, "Rises after every wrong answer.", { price: 2200 }),
  skin("skin-celestial", "Celestial", "legendary", { kind: "stars", colors: ["#ffd89b", "#19547b", "#0b1d3a"] }, "Written in the stars.", { price: 2400 }),
  skin("skin-ruby", "Ruby", "legendary", { kind: "facet", colors: ["#ffb3c1", "#e11d48", "#7f1d1d"], face: "#fff1f2" }, "Precious and rare.", { gems: 100 }),
  // Festive (on sale during their festival)
  skin("skin-xmas-snow", "Snowfall", "epic", { kind: "xmas-snow", colors: ["#1f6f4a", "#ffffff", "#e1342f"] }, "A quiet, snowy study night.", { price: 500, season: "christmas" }),
  skin("skin-xmas-ginger", "Gingerbread", "legendary", { kind: "xmas-ginger", colors: ["#b5651d", "#fff4e0", "#e1342f"], face: "#3b1d0e" }, "Iced to perfection.", { price: 700, season: "christmas" }),
  skin("skin-halloween-pumpkin", "Jack-o'-Lantern", "epic", { kind: "halloween-pumpkin", colors: ["#ff7518", "#2b1400", "#ffd166"], face: "#2b1400" }, "Carved for spooky season.", { price: 500, season: "halloween" }),
  skin("skin-halloween-ghost", "Ghostly", "legendary", { kind: "halloween-ghost", colors: ["#f4f4fb", "#2b2b3a"], face: "#2b2b3a" }, "Haunts the leaderboard.", { price: 700, season: "halloween" }),
  skin("skin-diwali-diya", "Diya Glow", "epic", { kind: "diwali-diya", colors: ["#ff9933", "#ffd700", "#7b1e1e"] }, "A little lamp for a bright mind.", { price: 600, season: "diwali" }),
  skin("skin-diwali-rangoli", "Rangoli", "legendary", { kind: "diwali-rangoli", colors: ["#e91e63", "#ffc107", "#00bcd4", "#7c3aed"] }, "Colour at every corner.", { price: 800, season: "diwali" }),
  skin("skin-easter-egg", "Painted Egg", "epic", { kind: "easter-egg", colors: ["#fde68a", "#a7f3d0", "#f9a8d4", "#93c5fd"], face: "#5b3a00" }, "Hand-painted spots.", { price: 500, season: "easter" }),
  skin("skin-easter-bunny", "Spring Bunny", "legendary", { kind: "easter-bunny", colors: ["#fbcfe8", "#ffffff"], face: "#6b2148" }, "Hops straight to the answer.", { price: 700, season: "easter" }),
  // Duel Pass exclusives
  skin("skin-pass-steel", "Duelist Steel", "rare", { kind: "facet", colors: ["#e5e7eb", "#9ca3af", "#374151"] }, "Forged in your first duels.", { passTier: 5 }),
  skin("skin-pass-prism", "Prism Glass", "epic", { kind: "radial", colors: ["#a5f3fc", "#f0abfc", "#fde68a"], face: "#3b2a4a" }, "Splits light into colour.", { passTier: 15 }),
  skin("skin-pass-ember", "Ember Crest", "epic", { kind: "glow", colors: ["#fde68a", "#f97316", "#7c2d12"] }, "Burns brighter each tier.", { passTier: 22 }),
  skin("skin-pass-champion", "Season Champion", "legendary", { kind: "facet", colors: ["#fef3c7", "#f59e0b", "#78350f"], face: "#451a03" }, "Only for those who reach tier 30.", { passTier: 30 }),
  // Pro monthly skins
  skin("skin-pro-2026-11", "Autumn Ember", "epic", { kind: "gradient", colors: ["#f6c177", "#c2410c", "#5b2109"] }, "November's Pro skin.", { proMonth: "2026-11" }),
  skin("skin-pro-2026-12", "Frost Crown", "epic", { kind: "radial", colors: ["#ffffff", "#bae6fd", "#3b82f6"], face: "#0b2a44" }, "December's Pro skin.", { proMonth: "2026-12" }),
  skin("skin-pro-2027-01", "New Moon", "epic", { kind: "stars", colors: ["#c7d2fe", "#312e81", "#0b0b2a"] }, "January's Pro skin.", { proMonth: "2027-01" }),
  // Bought with real money
  skin("skin-royal-velvet", "Royal Velvet", "legendary", { kind: "radial", colors: ["#c084fc", "#6d28d9", "#2e1065"] }, "Soft as a library armchair.", { pricePence: 99 }),
  skin("skin-golden-hour", "Golden Hour", "legendary", { kind: "glow", colors: ["#fff7ae", "#fbbf24", "#ea580c"] }, "Glows like late sunlight.", { pricePence: 149 }),
];

const ACCESSORIES: ShopItem[] = [
  { id: "hat-beanie", slot: "hat", name: "Beanie", rarity: "common", price: 120, description: "Cosy study vibes." },
  { id: "hat-cap", slot: "hat", name: "Grad Cap", rarity: "rare", price: 300, description: "Dress for the degree you want." },
  { id: "hat-party", slot: "hat", name: "Party Hat", rarity: "common", price: 200, description: "Every win is a party." },
  { id: "hat-wizard", slot: "hat", name: "Wizard Hat", rarity: "epic", price: 650, description: "Answers appear like magic." },
  { id: "hat-headphones", slot: "hat", name: "Headphones", rarity: "rare", price: 450, description: "Focus mode: on." },
  { id: "hat-crown", slot: "hat", name: "Crown", rarity: "legendary", price: 1200, proOnly: true, description: "Rule the leaderboard." },
  { id: "hat-jewel-crown", slot: "hat", name: "Jewelled Crown", rarity: "legendary", price: 0, gems: 150, description: "Bling for royalty." },
  { id: "eyes-round", slot: "eyes", name: "Round Specs", rarity: "common", price: 150, description: "Bookish and proud." },
  { id: "eyes-shades", slot: "eyes", name: "Shades", rarity: "rare", price: 350, description: "Too cool for school." },
  { id: "eyes-monocle", slot: "eyes", name: "Monocle", rarity: "epic", price: 500, description: "Indubitably correct." },
  { id: "eyes-star", slot: "eyes", name: "Star Glasses", rarity: "epic", price: 800, proOnly: true, description: "Star student energy." },
  { id: "eyes-diamond-shades", slot: "eyes", name: "Diamond Shades", rarity: "legendary", price: 0, gems: 90, description: "Bling you can see through." },
  { id: "eyes-prism-shades", slot: "eyes", name: "Prism Shades", rarity: "epic", price: 0, passTier: 18, description: "Duel Pass bling." },
  { id: "neck-bowtie", slot: "neck", name: "Bow Tie", rarity: "common", price: 180, description: "Smart, obviously." },
  { id: "neck-scarf", slot: "neck", name: "Scarf", rarity: "common", price: 220, description: "Exam season is chilly." },
  { id: "neck-medal", slot: "neck", name: "Medal", rarity: "rare", price: 700, description: "Wear your wins." },
  { id: "neck-cape", slot: "neck", name: "Hero Cape", rarity: "epic", price: 1000, proOnly: true, description: "Saving grades since today." },
  { id: "neck-gold-chain", slot: "neck", name: "Gold Chain", rarity: "epic", price: 0, gems: 60, description: "Heavy on the bling." },
  { id: "neck-diamond-pendant", slot: "neck", name: "Diamond Pendant", rarity: "legendary", price: 0, gems: 110, description: "One flawless stone." },
  { id: "neck-champion-chain", slot: "neck", name: "Champion Chain", rarity: "legendary", price: 0, passTier: 25, description: "Duel Pass bling for the dedicated." },
];

const APP_SKINS: ShopItem[] = [
  {
    id: "theme-midnight-folio",
    slot: "theme",
    name: "Midnight Folio",
    rarity: "mythic",
    price: 0,
    pricePence: 50,
    description: "Obsidian and gold leaf for the whole app, a gilded Raj, drifting gold dust, sounds and haptics.",
    lore:
      "Bound in obsidian and edged in gold leaf, this is the last page of the Library of Night, the card scholars studied by candlelight after every other lamp went out. Raj found it under a stack of unfinished revision and refused to give it back. Wear it, and every answer you earn is written in gold.",
  },
  {
    id: "theme-moonlit-porcelain",
    slot: "theme",
    name: "Moonlit Porcelain",
    rarity: "mythic",
    price: 0,
    pricePence: 50,
    description: "Glazed porcelain, cobalt ink and silver leaf for the whole app, with a porcelain Raj and soft chime sounds.",
    lore:
      "Fired once a century in a kiln lit only by moonlight, Moonlit Porcelain is the teacup the old masters drank from while they marked their students' work. Every crack was mended with silver. Raj polished it until the cobalt shone, and now your answers ring like fine china.",
  },
];

export const ITEMS: ShopItem[] = [...SKINS, ...ACCESSORIES, ...APP_SKINS];

export const THEME_SKINS: Record<string, string> = {
  "theme-midnight-folio": "midnight-folio",
  "theme-moonlit-porcelain": "moonlit-porcelain",
};

export const STARTER_ITEMS = ITEMS.filter((i) => i.price === 0 && !i.gems && !i.pricePence && !i.season && !i.passTier && !i.proMonth && i.slot === "skin").map((i) => i.id);

export const itemById = (id: string | null | undefined) => (id ? ITEMS.find((i) => i.id === id) : undefined);

export type Equipped = Partial<Record<Slot, string>>;

export const DEFAULT_EQUIPPED: Equipped = { skin: "skin-classic" };

/** How an item is obtained: its currency, or where it comes from. */
export function howToGet(item: ShopItem): "coins" | "gems" | "money" | "pass" | "pro-monthly" {
  if (item.passTier) return "pass";
  if (item.proMonth) return "pro-monthly";
  if (item.pricePence) return "money";
  if (item.gems) return "gems";
  return "coins";
}

// ---------------------------------------------------------------------------
// Festive seasons. Diwali and Easter move each year, so their dates are listed.
// ---------------------------------------------------------------------------

const DIWALI: Record<number, [number, number]> = { 2026: [10, 8], 2027: [9, 29], 2028: [9, 17], 2029: [10, 5], 2030: [9, 26] };
const EASTER: Record<number, [number, number]> = { 2026: [3, 5], 2027: [2, 28], 2028: [3, 16], 2029: [3, 1], 2030: [3, 21] };
const DAY_MS = 864e5;

/** [start, end) of a festival's shop window in a given year (UTC). */
export function seasonWindow(season: Season, year: number): [number, number] | null {
  const d = (m: number, day: number) => Date.UTC(year, m, day);
  switch (season) {
    case "halloween":
      return [d(9, 15), d(10, 3)]; // 15 Oct – 2 Nov
    case "christmas":
      return [d(11, 1), d(11, 31) + 2 * DAY_MS]; // 1 Dec – 1 Jan
    case "diwali": {
      const x = DIWALI[year];
      return x ? [d(x[0], x[1]) - 10 * DAY_MS, d(x[0], x[1]) + 8 * DAY_MS] : null;
    }
    case "easter": {
      const x = EASTER[year];
      return x ? [d(x[0], x[1]) - 14 * DAY_MS, d(x[0], x[1]) + 8 * DAY_MS] : null;
    }
  }
}

export function seasonStatus(season: Season, now = Date.now()): { active: boolean; endsAt?: number; startsAt?: number } {
  const year = new Date(now).getUTCFullYear();
  for (const y of [year - 1, year, year + 1, year + 2]) {
    const w = seasonWindow(season, y);
    if (!w) continue;
    if (now >= w[0] && now < w[1]) return { active: true, endsAt: w[1] };
  }
  for (const y of [year, year + 1, year + 2]) {
    const w = seasonWindow(season, y);
    if (w && w[0] > now) return { active: false, startsAt: w[0] };
  }
  return { active: false };
}

export const currentMonth = (now = Date.now()) => new Date(now).toISOString().slice(0, 7);
export const proSkinFor = (month = currentMonth()) => ITEMS.find((i) => i.proMonth === month);

export const formatPrice = (pence: number) => (pence === 0 ? "Free" : pence < 100 ? `${pence}p` : `£${(pence / 100).toFixed(2)}`);

/** Coins earned for finishing a duel. */
export const DUEL_REWARD = { played: 20, win: 30, tie: 15 };
