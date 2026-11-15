import { describe, expect, it } from "vitest";
import { describeOrder, fulfil } from "@/lib/billing";
import { COIN_PACKS, GEM_PACKS, ITEMS, ITEM_PACKS, MAX_SHOP_PRICE_PENCE, MIN_PRICE_PENCE, PLANS, formatPrice, shopGroups } from "@/lib/catalog";
import { generateOfflineQuestions } from "@/lib/offline-generator";
import { sampleBySlug } from "@/lib/samples";
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
    expect([...COIN_PACKS.map((p) => p.pricePence)]).toEqual([30, 35, 40]);
    expect([...GEM_PACKS.map((p) => p.pricePence)]).toEqual([30, 35, 40]);
    expect(PASS.pricePence).toBe(100);
    expect(PLANS.pro.pricePence).toBe(199);
    expect(ITEMS.filter((i) => i.rarity === "mythic").every((i) => i.pricePence === 40)).toBe(true);
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

describe("shop limits and order", () => {
  it("caps the shop at 50p: item packs 50p, single items 40p or less", () => {
    const singles = [...COIN_PACKS, ...GEM_PACKS].map((p) => p.pricePence).concat(ITEMS.flatMap((i) => (i.pricePence ? [i.pricePence] : [])));
    expect(Math.max(...singles)).toBeLessThanOrEqual(40);
    expect(ITEM_PACKS.every((p) => p.pricePence === 50)).toBe(true);
    expect(MAX_SHOP_PRICE_PENCE).toBe(50);
  });

  it("puts Mythic then Legendary first, and Festive last, outside holidays", () => {
    const keys = shopGroups(ITEMS, Date.parse("2026-09-10T12:00:00Z")).map((g) => g.key);
    expect(keys.slice(0, 2)).toEqual(["mythic", "legendary"]);
    expect(keys.at(-1)).toBe("festive");
  });

  it("puts in-season festive skins at the very top during a holiday", () => {
    const groups = shopGroups(ITEMS, Date.parse("2026-12-20T12:00:00Z"));
    expect(groups[0].key).toBe("festive");
    expect(groups[0].items[0].season).toBe("christmas");
    expect(groups[1].key).toBe("mythic");
  });
});

describe("Languages subject", () => {
  it("has a sample that makes a full offline quiz", () => {
    const s = sampleBySlug("languages");
    expect(s?.subject).toBe("Languages");
    expect(generateOfflineQuestions(s!.material)).toHaveLength(10);
  });
});
