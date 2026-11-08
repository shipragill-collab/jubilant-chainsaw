import { describe, expect, it } from "vitest";
import { ITEMS, currentMonth, howToGet, proSkinFor, seasonStatus, STARTER_ITEMS } from "@/lib/catalog";
import { fulfil } from "@/lib/billing";
import { PASS, tierFor, tierRewards } from "@/lib/pass";
import { buyItem, claimProSkin, claimTier, grantPass, grantPro, profileOf, recordActivity, rewardDuel } from "@/lib/profile";
import type { Db, Duel } from "@/lib/types";

const emptyDb = (): Db => ({ quizzes: {}, duels: {}, studySets: {}, profiles: {}, orders: {} });
const NOV_8_2026 = Date.UTC(2026, 10, 8, 12);

describe("catalogue", () => {
  const skins = ITEMS.filter((i) => i.slot === "skin" || i.slot === "theme");

  it("has exactly 50 skins, with 2 Mythic app skins", () => {
    expect(skins).toHaveLength(50);
    expect(skins.filter((i) => i.rarity === "mythic").map((i) => i.id)).toEqual(["theme-midnight-folio", "theme-moonlit-porcelain"]);
  });

  it("has removed the zesty and striped skins", () => {
    expect(ITEMS.find((i) => i.id === "skin-lime" || i.id === "skin-candy")).toBeUndefined();
    expect(ITEMS.some((i) => /stripe|zest/i.test(`${i.name} ${i.description}`))).toBe(false);
  });

  it("covers every rarity, two skins per festival, Pro monthly skins and money skins", () => {
    for (const r of ["common", "rare", "epic", "legendary", "mythic"]) expect(skins.some((i) => i.rarity === r)).toBe(true);
    for (const s of ["christmas", "halloween", "diwali", "easter"]) expect(skins.filter((i) => i.season === s)).toHaveLength(2);
    expect(skins.filter((i) => i.proMonth).length).toBeGreaterThanOrEqual(3);
    expect(skins.filter((i) => howToGet(i) === "money").length).toBeGreaterThanOrEqual(3);
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
  });

  it("only gives away the two starter skins", () => {
    expect(STARTER_ITEMS.sort()).toEqual(["skin-classic", "skin-ocean"]);
  });
});

describe("festive seasons", () => {
  it("knows Diwali 2026 is on now and Christmas is next", () => {
    expect(seasonStatus("diwali", NOV_8_2026).active).toBe(true);
    expect(seasonStatus("christmas", NOV_8_2026)).toEqual({ active: false, startsAt: Date.UTC(2026, 11, 1) });
    expect(seasonStatus("halloween", Date.UTC(2026, 9, 31)).active).toBe(true);
    expect(seasonStatus("easter", Date.UTC(2027, 2, 20)).active).toBe(true);
  });

  it("sells festive skins only in season", () => {
    const db = emptyDb();
    profileOf(db, "p").coins = 5000;
    expect(() => buyItem(db, "p", "skin-xmas-snow", NOV_8_2026)).toThrow(/only on sale during Christmas/);
    buyItem(db, "p", "skin-diwali-diya", NOV_8_2026);
    expect(profileOf(db, "p").owned).toContain("skin-diwali-diya");
  });
});

describe("currencies", () => {
  it("buys gem items with gems and refuses money items in the coin shop", () => {
    const db = emptyDb();
    const p = profileOf(db, "p");
    expect(() => buyItem(db, "p", "neck-gold-chain")).toThrow(/more gems/);
    p.gems = 100;
    buyItem(db, "p", "neck-gold-chain");
    expect(p.gems).toBe(40);
    expect(() => buyItem(db, "p", "skin-royal-velvet")).toThrow(/money at checkout/);
    expect(() => buyItem(db, "p", "skin-pass-champion")).toThrow(/Duel Pass reward/);
  });

  it("credits gem packs, money skins and the pass at checkout", () => {
    const db = emptyDb();
    db.orders.a = { id: "a", playerId: "p", kind: "gems", packId: "gems-200", createdAt: 0, status: "pending" };
    db.orders.b = { id: "b", playerId: "p", kind: "item", itemId: "theme-moonlit-porcelain", createdAt: 0, status: "pending" };
    db.orders.c = { id: "c", playerId: "p", kind: "pass", createdAt: 0, status: "pending" };
    for (const id of ["a", "b", "c"]) fulfil(db, id);
    const p = profileOf(db, "p");
    expect(p.gems).toBe(200);
    expect(p.owned).toContain("theme-moonlit-porcelain");
    expect(p.equipped.theme).toBeUndefined(); // app skins wait for the unboxing
    expect(p.passUntil).toBeGreaterThan(Date.now());
  });
});

describe("Pro monthly skins", () => {
  it("lets Pro members claim this month's skin once", () => {
    const db = emptyDb();
    expect(() => claimProSkin(db, "p")).toThrow(/Upgrade to Pro/);
    grantPro(profileOf(db, "p"));
    const skin = proSkinFor(currentMonth());
    if (!skin) return; // months beyond the listed skins have none
    claimProSkin(db, "p");
    expect(profileOf(db, "p").owned).toContain(skin.id);
    expect(() => claimProSkin(db, "p")).toThrow(/already claimed/);
  });
});

describe("Duel Pass", () => {
  it("earns XP from study and duels", () => {
    const db = emptyDb();
    const now = Date.now();
    recordActivity(db, "a", now - 120_000);
    recordActivity(db, "a", now);
    rewardDuel(db, { id: "d", players: [{ id: "a" }, { id: "b" }] } as unknown as Duel, "a");
    expect(profileOf(db, "a").pass!.xp).toBe(2 * PASS.xp.activity + PASS.xp.duel + PASS.xp.win);
    expect(profileOf(db, "b").pass!.xp).toBe(PASS.xp.duel);
  });

  it("has rewards on every pass tier and every third free tier, with the champion skin at 30", () => {
    for (let t = 1; t <= 30; t++) {
      expect(tierRewards(t).premium).not.toBeNull();
      expect(Boolean(tierRewards(t).free)).toBe(t % 3 === 0);
    }
    expect(tierRewards(30).premium).toEqual({ kind: "item", itemId: "skin-pass-champion" });
    expect(tierFor(250)).toBe(2);
  });

  it("claims free rewards for everyone and pass rewards for holders", () => {
    const db = emptyDb();
    const p = profileOf(db, "p");
    p.pass!.xp = 600; // tier 6
    claimTier(db, "p", 3, "free");
    expect(p.coins).toBe(75);
    expect(() => claimTier(db, "p", 3, "free")).toThrow(/Already claimed/);
    expect(() => claimTier(db, "p", 5, "premium")).toThrow(/Get the Duel Pass/);
    grantPass(p);
    claimTier(db, "p", 5, "premium");
    expect(p.owned).toContain("skin-pass-steel");
    expect(() => claimTier(db, "p", 9, "premium")).toThrow(/Reach tier 9/);
  });
});
