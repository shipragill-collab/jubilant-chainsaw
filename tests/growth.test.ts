import { describe, expect, it } from "vitest";
import { describeOrder, fulfil } from "@/lib/billing";
import { DUEL_REWARD, INVITE_REWARD, PRO_YEARLY, TRIAL_DAYS } from "@/lib/catalog";
import { isPro, profileOf, profileView, rewardDuel, startTrial } from "@/lib/profile";
import type { Db, Duel, Player } from "@/lib/types";

const emptyDb = (): Db => ({ quizzes: {}, duels: {}, studySets: {}, profiles: {}, orders: {} });
const player = (id: string, score: number): Player => ({ id, name: id, joinedAt: 0, answers: [], score, finishedAt: 1, questionShownAt: null });
const duel = (id: string, host: string, guest: string): Duel => ({
  id, quizId: "q", createdAt: 0, players: [player(host, 900), player(guest, 700)], rematchOf: null, rematchId: null,
});
const NOW = Date.parse("2026-11-15T12:00:00Z");

describe("free Pro trial", () => {
  it("gives Pro for a week, once, with no bonus coins", () => {
    const db = emptyDb();
    expect(profileView(profileOf(db, "p1")).trialAvailable).toBe(true);
    const p = startTrial(db, "p1", NOW);
    expect(isPro(p, NOW)).toBe(true);
    expect(isPro(p, NOW + (TRIAL_DAYS + 1) * 864e5)).toBe(false);
    expect(p.coins).toBe(0);
    expect(profileView(p, NOW).onTrial).toBe(true);
    expect(() => startTrial(db, "p1", NOW + 30 * 864e5)).toThrow(/already used/);
  });
});

describe("Pro yearly", () => {
  it("is a yearly subscription that grants a year and a year of coins", () => {
    expect(describeOrder({ kind: "pro_year" })).toMatchObject({ pricePence: PRO_YEARLY.pricePence, recurring: true, interval: "year" });
    const db = emptyDb();
    db.orders.o = { id: "o", playerId: "p1", kind: "pro_year", createdAt: 0, status: "pending" };
    fulfil(db, "o");
    const p = profileOf(db, "p1");
    expect(p.proInterval).toBe("year");
    expect(p.coins).toBe(PRO_YEARLY.coins);
    expect(isPro(p, Date.now() + 360 * 864e5)).toBe(true);
  });
});

describe("invite rewards", () => {
  const base = DUEL_REWARD.played;

  it("pays both players when a friend finishes their first duel", () => {
    const db = emptyDb();
    const d = duel("d1", "host", "friend");
    rewardDuel(db, d, "host", NOW);
    expect(profileOf(db, "friend").coins).toBe(base + INVITE_REWARD.coins);
    expect(profileOf(db, "host").coins).toBe(base + DUEL_REWARD.win + INVITE_REWARD.coins);
    expect(d.inviteBonus).toEqual(["host", "friend"]);
  });

  it("only counts a friend's first duel", () => {
    const db = emptyDb();
    rewardDuel(db, duel("d1", "host", "friend"), null, NOW);
    const before = profileOf(db, "host").coins;
    const d2 = duel("d2", "host", "friend");
    rewardDuel(db, d2, null, NOW);
    expect(profileOf(db, "host").coins - before).toBe(base + DUEL_REWARD.tie);
    expect(d2.inviteBonus).toBeUndefined();
  });

  it("caps invite bonuses each month", () => {
    const db = emptyDb();
    for (let i = 0; i < INVITE_REWARD.monthlyCap + 3; i++) rewardDuel(db, duel(`d${i}`, "host", `f${i}`), null, NOW);
    expect(profileOf(db, "host").inviteBonuses?.count).toBe(INVITE_REWARD.monthlyCap);
  });
});
