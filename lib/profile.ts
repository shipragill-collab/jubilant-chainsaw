import { createHash } from "node:crypto";
import { DEFAULT_EQUIPPED, DUEL_REWARD, ITEMS, PLANS, STARTER_ITEMS, currentMonth, howToGet, itemById, proSkinFor, seasonStatus, SEASON_LABEL, type Slot } from "./catalog";
import { PASS, seasonOf, tierFor, tierRewards, type Track } from "./pass";
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
  p.gems ??= 0;
  const season = seasonOf(now).id;
  if (p.pass?.season !== season) p.pass = { season, xp: 0, claimed: [] };
  // Skins that were retired from the shop fall back to the classic look.
  if (p.equipped.skin && !itemById(p.equipped.skin)) p.equipped.skin = "skin-classic";
  if (p.plan === "pro" && p.proUntil !== null && p.proUntil < now) p.plan = "free";
  if (p.usage?.day !== today(now)) p.usage = { day: today(now), aiGenerations: 0, rajMessages: 0 };
  return p;
}

/** Read-only view for players who might not have a profile yet. */
export function peekProfile(db: Db, playerId: string, now = Date.now()) {
  const p = db.profiles[playerId];
  const pro = Boolean(p && p.plan === "pro" && (p.proUntil === null || p.proUntil > now));
  const equipped = { ...(p?.equipped ?? DEFAULT_EQUIPPED) };
  if (equipped.skin && !itemById(equipped.skin)) equipped.skin = "skin-classic";
  return { equipped, pro };
}

/** Note that the player studied just now (drives Raj's mood and streak). */
export function recordActivity(db: Db, playerId: string, now = Date.now()) {
  const p = profileOf(db, playerId, now);
  const list = (p.activity ??= []);
  // At most one entry a minute, so rapid clicks don't inflate the daily goal.
  if (!list.length || now - list[list.length - 1] > 60_000) {
    list.push(now);
    addXp(p, PASS.xp.activity);
  }
  if (list.length > 600) list.splice(0, list.length - 600);
}

export const addXp = (p: Profile, xp: number) => {
  if (p.pass) p.pass.xp += xp;
};

export const hasPass = (p: Profile, now = Date.now()) => Boolean(p.passUntil && p.passUntil > now);

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

export function buyItem(db: Db, playerId: string, itemId: string, now = Date.now()) {
  const p = profileOf(db, playerId, now);
  const item = itemById(itemId);
  if (!item) throw new GameError("That item doesn't exist.", 404);
  if (p.owned.includes(item.id)) throw new GameError("You already own this.", 409);
  const how = howToGet(item);
  if (how === "pass") throw new GameError(`This is a Duel Pass reward at tier ${item.passTier}.`, 403);
  if (how === "pro-monthly") throw new GameError("This is a monthly Pro skin. Pro members can claim it free.", 403);
  if (how === "money") throw new GameError("This item is bought with money at checkout.", 400);
  if (item.season) {
    const st = seasonStatus(item.season, now);
    if (!st.active) throw new GameError(`${SEASON_LABEL[item.season]} skins are only on sale during ${SEASON_LABEL[item.season]}.`, 403);
  }
  if (item.proOnly && !isPro(p, now)) throw new GameError("This item is for Pro members.", 402);
  if (how === "gems") {
    if ((p.gems ?? 0) < item.gems!) throw new GameError(`You need ${item.gems! - (p.gems ?? 0)} more gems.`, 402);
    p.gems = (p.gems ?? 0) - item.gems!;
  } else {
    if (p.coins < item.price) throw new GameError(`You need ${item.price - p.coins} more coins.`, 402);
    p.coins -= item.price;
  }
  giveItem(p, item.id);
  return p;
}

/** Add an item to the collection; wearables go straight on, app skins wait for the unboxing. */
export function giveItem(p: Profile, itemId: string) {
  const item = itemById(itemId);
  if (!item || p.owned.includes(item.id)) return;
  p.owned.push(item.id);
  if (item.slot !== "theme") p.equipped[item.slot] = item.id;
}

/** Pro members claim this month's exclusive skin for free. */
export function claimProSkin(db: Db, playerId: string, now = Date.now()) {
  const p = profileOf(db, playerId, now);
  if (!isPro(p, now)) throw new GameError("Monthly skins are included with Pro. Upgrade to Pro to claim it.", 402);
  const item = proSkinFor(currentMonth(now));
  if (!item) throw new GameError("There's no Pro skin this month.", 404);
  if (p.owned.includes(item.id)) throw new GameError("You've already claimed this month's skin.", 409);
  giveItem(p, item.id);
  return p;
}

/** Claim one Duel Pass tier reward. */
export function claimTier(db: Db, playerId: string, tier: number, track: Track, now = Date.now()) {
  const p = profileOf(db, playerId, now);
  if (!Number.isInteger(tier) || tier < 1 || tier > PASS.tiers) throw new GameError("No such tier.");
  if (track === "premium" && !hasPass(p, now)) throw new GameError("Get the Duel Pass to claim this reward.", 402);
  if (tierFor(p.pass!.xp) < tier) throw new GameError(`Reach tier ${tier} first.`, 403);
  const key = `${tier}:${track}`;
  if (p.pass!.claimed.includes(key)) throw new GameError("Already claimed.", 409);
  const reward = tierRewards(tier)[track];
  if (!reward) throw new GameError("Nothing to claim here.", 404);
  if (reward.kind === "coins") p.coins += reward.amount;
  else if (reward.kind === "gems") p.gems = (p.gems ?? 0) + reward.amount;
  else giveItem(p, reward.itemId);
  p.pass!.claimed.push(key);
  return p;
}

/** Grant the Duel Pass for a period (purchase or renewal). */
export function grantPass(p: Profile, days = 31, now = Date.now()) {
  const from = p.passUntil && p.passUntil > now ? p.passUntil : now;
  p.passUntil = from + days * 24 * 3600 * 1000;
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
    addXp(p, PASS.xp.duel + (winnerId === pl.id ? PASS.xp.win : 0));
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
    gems: p.gems ?? 0,
    passActive: hasPass(p, now),
    passUntil: hasPass(p, now) ? (p.passUntil ?? null) : null,
    pass: p.pass ?? { season: seasonOf(now).id, xp: 0, claimed: [] },
    hasPassSubscription: Boolean(p.stripePassSubscriptionId),
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
