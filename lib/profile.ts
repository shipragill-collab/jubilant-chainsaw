import { createHash } from "node:crypto";
import { DEFAULT_EQUIPPED, DUEL_REWARD, ITEMS, PLANS, STARTER_ITEMS, itemById, type Slot } from "./catalog";
import { GameError } from "./game";
import { update } from "./store";
import type { Db, Duel, Profile } from "./types";

const today = (now = Date.now()) => new Date(now).toISOString().slice(0, 10);

/** Public, non-secret id for a player (the real id works like a password). */
export const publicId = (playerId: string) => createHash("sha256").update(`quiz-duel:${playerId}`).digest("hex").slice(0, 16);

export function newProfile(): Profile {
  return {
    plan: "free",
    proUntil: null,
    coins: 0,
    owned: [...STARTER_ITEMS],
    equipped: { ...DEFAULT_EQUIPPED },
    usage: { day: today(), aiGenerations: 0, rajMessages: 0 },
    credited: [],
  };
}

/** Get (creating if needed) a player's profile, with expired Pro and stale usage rolled over. */
export function profileOf(db: Db, playerId: string, now = Date.now()): Profile {
  const p = (db.profiles[playerId] ??= newProfile());
  p.owned ??= [...STARTER_ITEMS];
  p.credited ??= [];
  if (p.plan === "pro" && p.proUntil !== null && p.proUntil < now) p.plan = "free";
  if (p.usage?.day !== today(now)) p.usage = { day: today(now), aiGenerations: 0, rajMessages: 0 };
  return p;
}

/** Read-only view for players who might not have a profile yet. */
export function peekProfile(db: Db, playerId: string, now = Date.now()) {
  const p = db.profiles[playerId];
  const pro = Boolean(p && p.plan === "pro" && (p.proUntil === null || p.proUntil > now));
  return { equipped: p?.equipped ?? DEFAULT_EQUIPPED, pro };
}

/** Note that the player studied just now (drives Raj's mood and streak). */
export function recordActivity(db: Db, playerId: string, now = Date.now()) {
  const p = profileOf(db, playerId, now);
  const list = (p.activity ??= []);
  // At most one entry a minute, so rapid clicks don't inflate the daily goal.
  if (!list.length || now - list[list.length - 1] > 60_000) list.push(now);
  if (list.length > 600) list.splice(0, list.length - 600);
}

export const isPro = (p: Profile, now = Date.now()) => p.plan === "pro" && (p.proUntil === null || p.proUntil > now);

/** Count one use of a metered feature, or refuse if today's free allowance is used up. */
export function consume(db: Db, playerId: string, kind: "aiGenerations" | "rajMessages", now = Date.now()) {
  const p = profileOf(db, playerId, now);
  const limit = PLANS[isPro(p, now) ? "pro" : "free"].limits[kind];
  if (limit !== null && p.usage[kind] >= limit) {
    const what = kind === "aiGenerations" ? `${limit} AI quizzes and study sets` : `${limit} messages with Raj`;
    throw new GameError(`You've used today's ${what} on the Free plan. Upgrade to Pro for unlimited, or come back tomorrow.`, 402);
  }
  p.usage[kind] += 1;
  recordActivity(db, playerId, now);
}

export function buyItem(db: Db, playerId: string, itemId: string) {
  const p = profileOf(db, playerId);
  const item = itemById(itemId);
  if (!item) throw new GameError("That item doesn't exist.", 404);
  if (p.owned.includes(item.id)) throw new GameError("You already own this.", 409);
  if (item.proOnly && !isPro(p)) throw new GameError("This item is for Pro members.", 402);
  if (p.coins < item.price) throw new GameError(`You need ${item.price - p.coins} more coins.`, 402);
  p.coins -= item.price;
  p.owned.push(item.id);
  // App skins are equipped from the unboxing screen; wearables go straight on.
  if (item.slot !== "theme") p.equipped[item.slot] = item.id;
  return p;
}

export function equipItem(db: Db, playerId: string, slot: Slot, itemId: string | null) {
  const p = profileOf(db, playerId);
  if (itemId === null) {
    if (slot === "skin") throw new GameError("You always need a skin.");
    delete p.equipped[slot];
    return p;
  }
  const item = itemById(itemId);
  if (!item || item.slot !== slot) throw new GameError("That item doesn't go there.");
  if (!p.owned.includes(item.id)) throw new GameError("Buy this item first.", 402);
  if (item.proOnly && !isPro(p)) throw new GameError("Renew Pro to wear this item again.", 402);
  p.equipped[slot] = item.id;
  return p;
}

/** Grant Pro for a period (from a purchase or renewal), adding the monthly coin bonus. */
export function grantPro(p: Profile, days = 31, now = Date.now()) {
  const from = p.proUntil && p.proUntil > now ? p.proUntil : now;
  p.plan = "pro";
  p.proUntil = from + days * 24 * 3600 * 1000;
  p.coins += PLANS.pro.monthlyCoins;
}

/** Pay out coins once a duel has finished. */
export function rewardDuel(db: Db, duel: Duel, winnerId: string | null) {
  if (duel.rewarded || duel.players.length < 2) return;
  for (const pl of duel.players) {
    const p = profileOf(db, pl.id);
    p.coins += DUEL_REWARD.played + (winnerId === null ? DUEL_REWARD.tie : winnerId === pl.id ? DUEL_REWARD.win : 0);
  }
  duel.rewarded = true;
}

export function profileView(p: Profile, now = Date.now()) {
  const pro = isPro(p, now);
  const plan = PLANS[pro ? "pro" : "free"];
  return {
    plan: plan.id,
    proUntil: pro ? p.proUntil : null,
    coins: p.coins,
    owned: p.owned,
    equipped: p.equipped,
    usage: p.usage,
    activity: p.activity ?? [],
    limits: plan.limits,
    hasSubscription: Boolean(p.stripeSubscriptionId),
  };
}

export type ProfileView = ReturnType<typeof profileView>;

export const ALL_ITEM_IDS = ITEMS.map((i) => i.id);

/**
 * Reserve one use of a metered feature before doing the (slow) work. Call the
 * returned refund() if the work fails, so a failed attempt doesn't count.
 */
export async function meter(playerId: string, kind: "aiGenerations" | "rajMessages") {
  await update((db) => consume(db, playerId, kind));
  return () =>
    update((db) => {
      const p = profileOf(db, playerId);
      p.usage[kind] = Math.max(0, p.usage[kind] - 1);
    });
}
