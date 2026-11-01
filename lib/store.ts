import { promises as fs } from "node:fs";
import path from "node:path";
import type { Db } from "./types";

/**
 * Tiny JSON-file store. Every mutation goes through `update`, which is
 * serialized in-process so concurrent requests can't clobber each other.
 * Good for a single Node server; swap for a real database to scale out.
 */
const dataDir = () => process.env.DATA_DIR || path.join(process.cwd(), "data");
const dbFile = () => path.join(dataDir(), "db.json");

let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<Db> {
  try {
    const raw = await fs.readFile(dbFile(), "utf8");
    const db = JSON.parse(raw) as Partial<Db>;
    return { quizzes: db.quizzes ?? {}, duels: db.duels ?? {}, studySets: db.studySets ?? {}, profiles: db.profiles ?? {}, orders: db.orders ?? {} };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { quizzes: {}, duels: {}, studySets: {}, profiles: {}, orders: {} };
    throw err;
  }
}

async function save(db: Db): Promise<void> {
  await fs.mkdir(dataDir(), { recursive: true });
  const tmp = `${dbFile()}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db));
  await fs.rename(tmp, dbFile());
}

export function read(): Promise<Db> {
  // Wait for pending writes so reads never see a half-applied update.
  return (queue = queue.then(load, load)) as Promise<Db>;
}

export function update<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  const run = async () => {
    const db = await load();
    const result = await fn(db);
    await save(db);
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
