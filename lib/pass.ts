import { itemById } from "./catalog";

/**
 * The Duel Pass: a monthly season of 30 tiers. Studying and duels earn XP.
 * Everyone can claim the free track (every third tier); Duel Pass holders
 * (£1/month) claim every tier: coins, gems, pass-only skins and bling.
 */
export const PASS = {
  name: "Duel Pass",
  pricePence: 100,
  tiers: 30,
  xpPerTier: 100,
  xp: { activity: 10, duel: 25, win: 25 },
  features: [
    "30 reward tiers every month",
    "Coins and gems at every tier",
    "4 pass-only skins, including Season Champion",
    "Exclusive bling: Prism Shades and the Champion Chain",
    "Earn XP from studying, duels and wins",
  ],
};

/** Pro and the Duel Pass together, for less than both separately. */
export const BUNDLE = {
  name: "Ultimate",
  pricePence: 249,
  features: ["Everything in Pro", "Everything in the Duel Pass", "One subscription, one renewal date"],
};

export type Reward = { kind: "coins"; amount: number } | { kind: "gems"; amount: number } | { kind: "item"; itemId: string };
export type Track = "free" | "premium";

/** Rewards for a tier on each track (null when the track has nothing there). */
export function tierRewards(tier: number): Record<Track, Reward | null> {
  const premiumItems: Record<number, string> = { 5: "skin-pass-steel", 15: "skin-pass-prism", 18: "eyes-prism-shades", 22: "skin-pass-ember", 25: "neck-champion-chain", 30: "skin-pass-champion" };
  const premium: Reward = premiumItems[tier]
    ? { kind: "item", itemId: premiumItems[tier] }
    : tier % 2 === 0
      ? { kind: "gems", amount: 10 + Math.floor(tier / 10) * 5 }
      : { kind: "coins", amount: 100 + Math.floor(tier / 10) * 50 };
  const free: Reward | null = tier % 3 === 0 ? (tier === 30 ? { kind: "gems", amount: 15 } : tier % 6 === 0 ? { kind: "gems", amount: 5 } : { kind: "coins", amount: 75 }) : null;
  return { free, premium };
}

export function rewardLabel(r: Reward): string {
  if (r.kind === "coins") return `${r.amount} coins`;
  if (r.kind === "gems") return `${r.amount} gems`;
  return itemById(r.itemId)?.name ?? "Mystery item";
}

/** Season id and name for a time (one season per calendar month, UTC). */
export function seasonOf(now = Date.now()) {
  const d = new Date(now);
  const id = d.toISOString().slice(0, 7);
  const name = d.toLocaleString("en-GB", { month: "long", timeZone: "UTC" });
  const end = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
  return { id, name, endsAt: end };
}

export const tierFor = (xp: number) => Math.min(PASS.tiers, Math.floor(xp / PASS.xpPerTier));
