import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { aiAllowed, costPence, dailyBudgetPence, recordAiUsage } from "@/lib/ai-budget";

describe("AI spending guard", () => {
  const env = { ...process.env };
  beforeEach(() => {
    process.env.DATA_DIR = mkdtempSync(path.join(tmpdir(), "qd-budget-"));
    delete process.env.DATABASE_URL;
    delete process.env.POSTGRES_URL;
    delete process.env.VERCEL;
  });
  afterEach(() => {
    process.env = { ...env };
  });

  it("prices tokens at Claude Opus 5.5 rates", () => {
    // 1M output tokens = $20 = 1600p at 0.8
    expect(costPence({ output_tokens: 1_000_000 })).toBeCloseTo(1600);
    expect(costPence({ input_tokens: 4000, output_tokens: 500 })).toBeCloseTo(2.08, 1);
  });

  it("defaults to £2 a day and treats 0 as off", async () => {
    delete process.env.AI_DAILY_BUDGET_PENCE;
    expect(dailyBudgetPence()).toBe(200);
    process.env.AI_DAILY_BUDGET_PENCE = "0";
    expect(await aiAllowed()).toBe(false);
  });

  it("switches Claude off once today's budget is spent, and back on tomorrow", async () => {
    process.env.AI_DAILY_BUDGET_PENCE = "10";
    const t = Date.parse("2026-11-11T12:00:00Z");
    expect(await aiAllowed(t)).toBe(true);
    await recordAiUsage({ output_tokens: 7000 }, t); // ~11p
    expect(await aiAllowed(t)).toBe(false);
    expect(await aiAllowed(t + 24 * 3600_000)).toBe(true);
  });
});
