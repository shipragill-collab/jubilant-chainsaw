/** Plans, coin packs and the shop catalogue. Prices are in pence (GBP). */

export type PlanId = "free" | "pro";

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
    pricePence: 499,
    tagline: "Unlimited AI, a bigger allowance of coins, and exclusive gear.",
    features: [
      "Unlimited AI quizzes and study sets",
      "Unlimited guided practice with Raj",
      "1,000 bonus coins every month",
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
  { id: "coins-500", coins: 500, pricePence: 99, label: "Pocket" },
  { id: "coins-1500", coins: 1500, pricePence: 249, label: "Satchel" },
  { id: "coins-4000", coins: 4000, pricePence: 499, label: "Treasure chest" },
];

export type Slot = "skin" | "hat" | "eyes" | "neck";

export const SLOTS: { id: Slot; label: string }[] = [
  { id: "skin", label: "Skins" },
  { id: "hat", label: "Hats" },
  { id: "eyes", label: "Eyewear" },
  { id: "neck", label: "Neckwear" },
];

export interface ShopItem {
  id: string;
  slot: Slot;
  name: string;
  price: number; // coins; 0 = free starter item
  proOnly?: boolean;
  description: string;
}

export const ITEMS: ShopItem[] = [
  // Skins
  { id: "skin-classic", slot: "skin", name: "Classic Red", price: 0, description: "The original duellist." },
  { id: "skin-ocean", slot: "skin", name: "Ocean", price: 0, description: "Calm, cool and collected." },
  { id: "skin-lime", slot: "skin", name: "Lime", price: 150, description: "Zesty and bright." },
  { id: "skin-midnight", slot: "skin", name: "Midnight", price: 250, description: "For late-night revision." },
  { id: "skin-peach", slot: "skin", name: "Peach", price: 250, description: "Soft and sunny." },
  { id: "skin-candy", slot: "skin", name: "Candy Stripe", price: 400, description: "Sweet stripes, sharp mind." },
  { id: "skin-sunset", slot: "skin", name: "Sunset", price: 600, description: "A warm gradient glow." },
  { id: "skin-dots", slot: "skin", name: "Polka", price: 500, description: "Dotty about learning." },
  { id: "skin-galaxy", slot: "skin", name: "Galaxy", price: 900, proOnly: true, description: "Stars included." },
  { id: "skin-gold", slot: "skin", name: "Solid Gold", price: 1500, proOnly: true, description: "Top of the class." },
  // Hats
  { id: "hat-beanie", slot: "hat", name: "Beanie", price: 120, description: "Cosy study vibes." },
  { id: "hat-cap", slot: "hat", name: "Grad Cap", price: 300, description: "Dress for the degree you want." },
  { id: "hat-party", slot: "hat", name: "Party Hat", price: 200, description: "Every win is a party." },
  { id: "hat-wizard", slot: "hat", name: "Wizard Hat", price: 650, description: "Answers appear like magic." },
  { id: "hat-headphones", slot: "hat", name: "Headphones", price: 450, description: "Focus mode: on." },
  { id: "hat-crown", slot: "hat", name: "Crown", price: 1200, proOnly: true, description: "Rule the leaderboard." },
  // Eyewear
  { id: "eyes-round", slot: "eyes", name: "Round Specs", price: 150, description: "Bookish and proud." },
  { id: "eyes-shades", slot: "eyes", name: "Shades", price: 350, description: "Too cool for school." },
  { id: "eyes-monocle", slot: "eyes", name: "Monocle", price: 500, description: "Indubitably correct." },
  { id: "eyes-star", slot: "eyes", name: "Star Glasses", price: 800, proOnly: true, description: "Star student energy." },
  // Neckwear
  { id: "neck-bowtie", slot: "neck", name: "Bow Tie", price: 180, description: "Smart, obviously." },
  { id: "neck-scarf", slot: "neck", name: "Scarf", price: 220, description: "Exam season is chilly." },
  { id: "neck-medal", slot: "neck", name: "Medal", price: 700, description: "Wear your wins." },
  { id: "neck-cape", slot: "neck", name: "Hero Cape", price: 1000, proOnly: true, description: "Saving grades since today." },
];

export const STARTER_ITEMS = ITEMS.filter((i) => i.price === 0).map((i) => i.id);

export const itemById = (id: string | null | undefined) => (id ? ITEMS.find((i) => i.id === id) : undefined);

export type Equipped = Partial<Record<Slot, string>>;

export const DEFAULT_EQUIPPED: Equipped = { skin: "skin-classic" };

export const formatPrice = (pence: number) => (pence === 0 ? "Free" : `£${(pence / 100).toFixed(2)}`);

/** Coins earned for finishing a duel. */
export const DUEL_REWARD = { played: 20, win: 30, tie: 15 };
