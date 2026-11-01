import { describe, expect, it } from "vitest";

/** Runs against a real Postgres when TEST_DATABASE_URL is set (skipped otherwise). */
const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("Postgres store", () => {
  it("applies concurrent updates without losing any", async () => {
    process.env.DATABASE_URL = url;
    const { read, update } = await import("@/lib/store");
    const { profileOf } = await import("@/lib/profile");
    const id = `pg-test-${Date.now()}`;
    await Promise.all(Array.from({ length: 40 }, () => update((db) => void (profileOf(db, id).coins += 1))));
    expect((await read()).profiles[id].coins).toBe(40);
  });

  it("rolls back a failed update", async () => {
    const { read, update } = await import("@/lib/store");
    const id = `pg-rollback-${Date.now()}`;
    await expect(
      update((db) => {
        db.orders[id] = { id, playerId: "x", kind: "coins", createdAt: 0, status: "pending" };
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    expect((await read()).orders[id]).toBeUndefined();
  });
});
