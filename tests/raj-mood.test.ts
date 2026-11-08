import { describe, expect, it } from "vitest";
import { rajLine, summarizeActivity } from "@/lib/raj-mood";

const DAY = 24 * 3600 * 1000;
const NOW = Date.UTC(2026, 10, 8, 15, 0); // a Sunday afternoon, UTC
const daysAgo = (n: number, hour = 12) => Date.UTC(2026, 10, 8 - n, hour, 0);
const at = (ts: number[]) => summarizeActivity(ts, NOW, 0);

describe("Raj's feelings", () => {
  it("is new with no activity", () => {
    expect(at([]).feeling).toBe("new");
  });

  it("is happy after studying today, and proud on a 7-day streak", () => {
    expect(at([daysAgo(0)])).toMatchObject({ feeling: "happy", streak: 1, studiedToday: true });
    const week = Array.from({ length: 7 }, (_, i) => daysAgo(i));
    expect(at(week)).toMatchObject({ feeling: "proud", streak: 7 });
  });

  it("is eager when the streak is at risk", () => {
    expect(at([daysAgo(1), daysAgo(2), daysAgo(3)])).toMatchObject({ feeling: "eager", streak: 3, studiedToday: false });
  });

  it("gets worried, then sad, then sleepy the longer you're away", () => {
    expect(at([daysAgo(2)])).toMatchObject({ feeling: "worried", streak: 0, daysAway: 2 });
    expect(at([daysAgo(5)]).feeling).toBe("sad");
    expect(at([daysAgo(20)]).feeling).toBe("sleepy");
  });

  it("counts calendar days, not 24-hour windows", () => {
    // 23:30 yesterday and 00:30 today are different days an hour apart.
    const late = Date.UTC(2026, 10, 7, 23, 30);
    const early = Date.UTC(2026, 10, 8, 0, 30);
    expect(summarizeActivity([late, early], early + 60_000, 0).streak).toBe(2);
  });

  it("uses the viewer's time zone", () => {
    // 01:00 UTC on the 8th is still the 7th in New York (UTC-5).
    const ts = Date.UTC(2026, 10, 8, 1, 0);
    expect(summarizeActivity([ts], Date.UTC(2026, 10, 8, 3, 0), 300).studiedToday).toBe(true);
    expect(summarizeActivity([ts], Date.UTC(2026, 10, 8, 12, 0), 300).feeling).toBe("eager");
  });

  it("builds a 7-day strip ending today", () => {
    const week = at([daysAgo(0), daysAgo(2)]).week;
    expect(week).toHaveLength(7);
    expect(week[6]).toMatchObject({ active: true, isToday: true });
    expect(week[4].active).toBe(true);
    expect(week[5].active).toBe(false);
    void DAY;
  });

  it("has a line for every feeling", () => {
    for (const ts of [[], [daysAgo(0)], [daysAgo(1)], [daysAgo(2)], [daysAgo(6)], [daysAgo(30)]]) {
      expect(rajLine(at(ts)).title.length).toBeGreaterThan(0);
    }
  });
});

describe("streak widgets data", () => {
  it("tracks best streak, totals, today's count and the next milestone", () => {
    const ts = [
      ...[10, 11, 12, 13].map((n) => daysAgo(n)), // an old 4-day run
      daysAgo(1), daysAgo(0), daysAgo(0, 13), daysAgo(0, 14),
    ];
    const a = at(ts);
    expect(a.bestStreak).toBe(4);
    expect(a.streak).toBe(2);
    expect(a.totalDays).toBe(6);
    expect(a.todayCount).toBe(3);
    expect(a.milestone).toEqual({ target: 3, previous: 0 });
    expect(a.month).toHaveLength(35);
    expect(a.month[34]).toMatchObject({ isToday: true, count: 3 });
  });

  it("moves to the next milestone once one is reached", () => {
    const a = at(Array.from({ length: 7 }, (_, i) => daysAgo(i)));
    expect(a.milestone).toEqual({ target: 14, previous: 7 });
  });
});
