import { describe, expect, it } from "vitest";
import { parseChoices, streakOf } from "@/components/raj-chat";
import { ITEMS, PLANS } from "@/lib/catalog";
import { buyItem, consume, equipItem, grantPro, profileOf, publicId, rewardDuel } from "@/lib/profile";
import { fulfil } from "@/lib/billing";
import type { Db, Duel } from "@/lib/types";

const emptyDb = (): Db => ({ quizzes: {}, duels: {}, studySets: {}, profiles: {}, orders: {} });

describe("plans", () => {
  it("meters the Free plan and lifts limits on Pro", () => {
    const db = emptyDb();
    for (let i = 0; i < PLANS.free.limits.aiGenerations!; i++) consume(db, "p1", "aiGenerations");
    expect(() => consume(db, "p1", "aiGenerations")).toThrow(/Upgrade to Pro/);
    grantPro(profileOf(db, "p1"));
    expect(() => consume(db, "p1", "aiGenerations")).not.toThrow();
    expect(profileOf(db, "p1").coins).toBe(PLANS.pro.monthlyCoins);
  });

  it("lets Pro lapse when it expires", () => {
    const db = emptyDb();
    const p = profileOf(db, "p1");
    grantPro(p, 1, 0);
    expect(profileOf(db, "p1", 2 * 24 * 3600 * 1000).plan).toBe("free");
  });
});

describe("shop", () => {
  it("buys with coins, equips, and guards Pro-only items", () => {
    const db = emptyDb();
    const p = profileOf(db, "p1");
    const hat = ITEMS.find((i) => i.id === "hat-beanie")!;
    expect(() => buyItem(db, "p1", hat.id)).toThrow(/more coins/);
    p.coins = 1000;
    buyItem(db, "p1", hat.id);
    expect(p.coins).toBe(1000 - hat.price);
    expect(p.equipped.hat).toBe(hat.id);
    expect(() => buyItem(db, "p1", hat.id)).toThrow(/already own/);
    equipItem(db, "p1", "hat", null);
    expect(p.equipped.hat).toBeUndefined();
    expect(() => buyItem(db, "p1", "hat-crown")).toThrow(/Pro members/);
    expect(() => equipItem(db, "p1", "skin", "skin-gold")).toThrow(/Buy this item first/);
  });

  it("pays coins once per finished duel", () => {
    const db = emptyDb();
    const duel = { id: "d", players: [{ id: "a" }, { id: "b" }] } as unknown as Duel;
    rewardDuel(db, duel, "a");
    rewardDuel(db, duel, "a");
    expect(profileOf(db, "a").coins).toBe(50);
    expect(profileOf(db, "b").coins).toBe(20);
  });
});

describe("billing", () => {
  it("credits an order exactly once", () => {
    const db = emptyDb();
    db.orders.o1 = { id: "o1", playerId: "p1", kind: "coins", packId: "coins-500", createdAt: 0, status: "pending" };
    fulfil(db, "o1");
    fulfil(db, "o1");
    expect(profileOf(db, "p1").coins).toBe(500);
  });
});

describe("privacy", () => {
  it("never exposes the secret player id", () => {
    expect(publicId("secret-id")).not.toContain("secret");
    expect(publicId("secret-id")).toHaveLength(16);
  });
});

describe("Raj chat helpers", () => {
  it("parses trailing choices and hides half-written ones", () => {
    expect(parseChoices("Pick one\n\n<choices>A | B | C</choices>")).toEqual({ text: "Pick one", choices: ["A", "B", "C"] });
    expect(parseChoices("Pick one\n\n<choi")).toEqual({ text: "Pick one", choices: [] });
  });

  it("counts the current streak", () => {
    const m = (content: string) => ({ role: "assistant", content });
    expect(streakOf([m("**Correct!**"), m("**Not quite.**"), m("**Correct!**"), m("**Correct!**")])).toEqual({ streak: 2, correct: 3 });
  });
});
