import { promises as fs } from "node:fs";
import path from "node:path";
import type { Pool, PoolClient } from "pg";
import type { Db } from "./types";

/**
 * Persistence. The app works on one `Db` object (collections of records):
 * `read()` gets a snapshot, `update(fn)` applies a change atomically.
 *
 * - With DATABASE_URL (or POSTGRES_URL) set, data lives in Postgres: one row
 *   per collection, and each update runs in a transaction that locks the rows,
 *   so concurrent serverless instances can't clobber each other's writes.
 * - Otherwise it's a JSON file under DATA_DIR (default ./data), with writes
 *   serialized in-process. Good for local use and single-server hosting.
 */

const COLLECTIONS = ["quizzes", "duels", "studySets", "profiles", "orders", "meta"] as const;
type Collection = (typeof COLLECTIONS)[number];

const emptyDb = (): Db => ({ quizzes: {}, duels: {}, studySets: {}, profiles: {}, orders: {}, meta: {} });

function normalize(partial: Partial<Db>): Db {
  const db = emptyDb();
  for (const c of COLLECTIONS) if (partial[c]) (db[c] as unknown) = partial[c];
  return db;
}

const databaseUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

/** Thrown when there's nowhere to keep data (e.g. on Vercel with no database connected). */
export class StoreUnavailableError extends Error {
  constructor(message = "No database connected. In Vercel, open the project's Storage tab, connect a Neon Postgres database, then redeploy.") {
    super(message);
    this.name = "StoreUnavailableError";
  }
}
export const isStoreUnavailable = (err: unknown) => err instanceof Error && err.name === "StoreUnavailableError";

// ---------------------------------------------------------------------------
// Postgres
// ---------------------------------------------------------------------------

const TABLE = "quiz_duel_collections";
let pool: Pool | null = null;
let ready: Promise<void> | null = null;

async function getPool(): Promise<Pool> {
  if (!pool) {
    const { Pool } = await import("pg");
    pool = new Pool({ connectionString: databaseUrl(), max: 3, idleTimeoutMillis: 10_000 });
  }
  ready ??= (async () => {
    await pool!.query(`CREATE TABLE IF NOT EXISTS ${TABLE} (name text PRIMARY KEY, data jsonb NOT NULL DEFAULT '{}'::jsonb)`);
    await pool!.query(`INSERT INTO ${TABLE} (name) SELECT unnest($1::text[]) ON CONFLICT (name) DO NOTHING`, [
      COLLECTIONS as unknown as string[],
    ]);
  })().catch((err) => {
    ready = null; // retry setup on the next request
    throw err;
  });
  await ready;
  return pool;
}

async function loadRows(client: Pool | PoolClient, lock: boolean): Promise<Db> {
  const { rows } = await client.query<{ name: Collection; data: Record<string, unknown> }>(
    `SELECT name, data FROM ${TABLE} WHERE name = ANY($1::text[]) ORDER BY name${lock ? " FOR UPDATE" : ""}`,
    [COLLECTIONS as unknown as string[]],
  );
  return normalize(Object.fromEntries(rows.map((r) => [r.name, r.data])) as Partial<Db>);
}

async function pgRead(): Promise<Db> {
  return loadRows(await getPool(), false);
}

async function pgUpdate<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  const client = await (await getPool()).connect();
  try {
    await client.query("BEGIN");
    const db = await loadRows(client, true);
    const before = Object.fromEntries(COLLECTIONS.map((c) => [c, JSON.stringify(db[c])]));
    const result = await fn(db);
    for (const c of COLLECTIONS) {
      const after = JSON.stringify(db[c]);
      if (after !== before[c]) await client.query(`UPDATE ${TABLE} SET data = $2::jsonb WHERE name = $1`, [c, after]);
    }
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

// ---------------------------------------------------------------------------
// JSON file
// ---------------------------------------------------------------------------

const dataDir = () => process.env.DATA_DIR || path.join(process.cwd(), "data");
const dbFile = () => path.join(dataDir(), "db.json");
let queue: Promise<unknown> = Promise.resolve();

async function fileLoad(): Promise<Db> {
  if (process.env.VERCEL) throw new StoreUnavailableError();
  try {
    return normalize(JSON.parse(await fs.readFile(dbFile(), "utf8")) as Partial<Db>);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return emptyDb();
    throw err;
  }
}

async function fileSave(db: Db): Promise<void> {
  await fs.mkdir(dataDir(), { recursive: true });
  const tmp = `${dbFile()}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db));
  await fs.rename(tmp, dbFile());
}

// ---------------------------------------------------------------------------

export function read(): Promise<Db> {
  if (databaseUrl()) return pgRead();
  // Wait for pending writes so reads never see a half-applied update.
  return (queue = queue.then(fileLoad, fileLoad)) as Promise<Db>;
}

export function update<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  if (databaseUrl()) return pgUpdate(fn);
  const run = async () => {
    const db = await fileLoad();
    const result = await fn(db);
    await fileSave(db);
    return result;
  };
  const next = queue.then(run, run);
  queue = next.catch(() => undefined);
  return next;
}

export function newId(len = 10): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}
