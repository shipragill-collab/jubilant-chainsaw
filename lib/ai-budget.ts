import { isStoreUnavailable, read, update } from "./store";

/**
 * A daily spending cap for Claude, so the bill can never run away.
 *
 * Every Claude response reports the tokens it used; we turn that into pence
 * and add it to today's total. Once the total reaches AI_DAILY_BUDGET_PENCE
 * (default 200, i.e. £2 a day), the app switches to its offline brain until
 * midnight UTC. Set the env var to 0 to switch Claude off entirely.
 *
 * This is a guard rail, not the only one: also set a monthly spend limit in
 * the Anthropic Console, which the API itself enforces.
 */

// Claude Opus 5.5 list prices, USD per million tokens.
const USD_PER_M = { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 };

export interface TokenUsage {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
}

const today = (now = Date.now()) => new Date(now).toISOString().slice(0, 10);

export function dailyBudgetPence(): number {
  const raw = process.env.AI_DAILY_BUDGET_PENCE;
  const n = raw === undefined || raw === "" ? 200 : Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 200;
}

/** What a response cost, in pence (fractional). */
export function costPence(u: TokenUsage): number {
  const usd =
    ((u.input_tokens ?? 0) * USD_PER_M.input +
      (u.output_tokens ?? 0) * USD_PER_M.output +
      (u.cache_read_input_tokens ?? 0) * USD_PER_M.cacheRead +
      (u.cache_creation_input_tokens ?? 0) * USD_PER_M.cacheWrite) /
    1_000_000;
  const rate = Number(process.env.USD_TO_GBP ?? 0.8) || 0.8;
  return usd * rate * 100;
}

// Used when there's no database (and as a fast local cache).
let local = { day: today(), pence: 0 };

async function spentToday(now = Date.now()): Promise<number> {
  const day = today(now);
  try {
    const s = (await read()).meta?.aiSpend;
    return s?.day === day ? s.pence : 0;
  } catch (err) {
    if (!isStoreUnavailable(err)) throw err;
    return local.day === day ? local.pence : 0;
  }
}

/** True while today's Claude spend is under the cap. */
export async function aiAllowed(now = Date.now()): Promise<boolean> {
  const budget = dailyBudgetPence();
  if (budget === 0) return false;
  try {
    return (await spentToday(now)) < budget;
  } catch {
    return true; // never block learning because the counter couldn't be read
  }
}

/** Add a response's cost to today's total. Never throws. */
export async function recordAiUsage(u: TokenUsage | null | undefined, now = Date.now()): Promise<void> {
  if (!u) return;
  const pence = costPence(u);
  const day = today(now);
  local = local.day === day ? { day, pence: local.pence + pence } : { day, pence };
  try {
    await update((db) => {
      const meta = (db.meta ??= {});
      const s = meta.aiSpend?.day === day ? meta.aiSpend : { day, pence: 0 };
      meta.aiSpend = { day, pence: s.pence + pence };
    });
  } catch (err) {
    if (!isStoreUnavailable(err)) console.warn("[ai-budget] couldn't record spend", err);
  }
}
