import { describe, expect, it } from "vitest";
import { describeOrder, fulfil } from "@/lib/billing";
import { COIN_PACKS, GEM_PACKS, ITEMS, MIN_PRICE_PENCE, PLANS, formatPrice } from "@/lib/catalog";
import { BUNDLE, PASS } from "@/lib/pass";
import { hasPass, isPro, profileOf } from "@/lib/profile";
import type { Db } from "@/lib/types";

const emptyDb = (): Db => ({ quizzes: {}, duels: {}, studySets: {}, profiles: {}, orders: {} });

describe("prices", () => {
  it("never sells anything below the minimum", () => {
    const prices = [...COIN_PACKS, ...GEM_PACKS].map((p) => p.pricePence).concat(ITEMS.flatMap((i) => (i.pricePence ? [i.pricePence] : [])), PLANS.pro.pricePence, PASS.pricePence, BUNDLE.pricePence);
    expect(Math.min(...prices)).toBeGreaterThanOrEqual(MIN_PRICE_PENCE);
  });

  it("has the agreed prices", () => {
    expect([...COIN_PACKS.map((p) => p.pricePence)]).toEqual([30, 50, 100]);
    expect([...GEM_PACKS.map((p) => p.pricePence)]).toEqual([30, 50, 100]);
    expect(PASS.pricePence).toBe(100);
    expect(PLANS.pro.pricePence).toBe(199);
    expect(ITEMS.filter((i) => i.rarity === "mythic").every((i) => i.pricePence === 50)).toBe(true);
    expect(BUNDLE.pricePence).toBeLessThan(PLANS.pro.pricePence + PASS.pricePence);
  });

  it("formats pence and pounds", () => {
    expect(formatPrice(30)).toBe("30p");
    expect(formatPrice(100)).toBe("£1.00");
    expect(formatPrice(249)).toBe("£2.49");
  });
});

describe("the Ultimate bundle", () => {
  it("switches on Pro and the Duel Pass with one subscription", () => {
    const db = emptyDb();
    db.orders.o1 = { id: "o1", playerId: "p1", kind: "bundle", createdAt: 0, status: "pending" };
    fulfil(db, "o1", { subscription: "sub_1" });
    const p = profileOf(db, "p1");
    expect(isPro(p)).toBe(true);
    expect(hasPass(p)).toBe(true);
    expect(p.stripeSubscriptionId).toBe("sub_1");
    expect(p.stripePassSubscriptionId).toBe("sub_1");
    expect(describeOrder({ kind: "bundle" }).recurring).toBe(true);
  });
});
