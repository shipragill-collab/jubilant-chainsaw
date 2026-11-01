import { addPlayer, cleanName, GameError } from "./game";
import { generateQuiz, MAX_NOTES_LENGTH, MIN_NOTES_LENGTH } from "./generate";
import { meter } from "./profile";
import { newId, read, update } from "./store";
import type { Db, Duel, Quiz } from "./types";

export const MIN_QUESTIONS = 3;

export function getDuel(db: Db, id: string): { duel: Duel; quiz: Quiz } {
  const duel = db.duels[id];
  const quiz = duel && db.quizzes[duel.quizId];
  if (!duel || !quiz) throw new GameError("Duel not found.", 404);
  return { duel, quiz };
}

async function buildQuiz(notes: string, avoid: string[] = []): Promise<Quiz> {
  const generated = await generateQuiz(notes, avoid);
  if (generated.questions.length < MIN_QUESTIONS) {
    throw new GameError("Couldn't build a quiz from these notes. Try pasting a few more full sentences.", 422);
  }
  return { id: newId(), notes, createdAt: Date.now(), ...generated };
}

export async function createDuel(input: { notes: unknown; name: unknown; playerId: string }): Promise<Duel> {
  const notes = typeof input.notes === "string" ? input.notes.trim() : "";
  if (notes.length < MIN_NOTES_LENGTH) {
    throw new GameError(`Paste at least ${MIN_NOTES_LENGTH} characters of notes.`);
  }
  if (notes.length > MAX_NOTES_LENGTH) {
    throw new GameError(`Notes are too long (max ${MAX_NOTES_LENGTH.toLocaleString()} characters).`);
  }
  const name = cleanName(input.name);
  const refund = await meter(input.playerId, "aiGenerations");
  const quiz = await buildQuiz(notes).catch(async (err) => {
    await refund();
    throw err;
  });
  return update((db) => {
    const duel: Duel = { id: newId(), quizId: quiz.id, createdAt: Date.now(), players: [], rematchOf: null, rematchId: null };
    addPlayer(duel, input.playerId, name);
    db.quizzes[quiz.id] = quiz;
    db.duels[duel.id] = duel;
    return duel;
  });
}

// Coalesce simultaneous rematch clicks from both players into one generation.
const pendingRematches = new Map<string, Promise<Duel>>();

export function createRematch(duelId: string, playerId: string): Promise<Duel> {
  const pending = pendingRematches.get(duelId);
  if (pending) return pending;
  const job = (async () => {
    const { duel, quiz } = getDuel(await read(), duelId);
    const me = duel.players.find((p) => p.id === playerId);
    if (!me) throw new GameError("Only players in this duel can start a rematch.", 403);
    if (duel.rematchId) return getDuel(await read(), duel.rematchId).duel;

    const refund = await meter(playerId, "aiGenerations");
    const next = await buildQuiz(quiz.notes, quiz.questions.map((q) => q.prompt)).catch(async (err) => {
      await refund();
      throw err;
    });
    return update((db) => {
      const original = db.duels[duelId];
      if (original.rematchId && db.duels[original.rematchId]) return db.duels[original.rematchId];
      const rematch: Duel = {
        id: newId(),
        quizId: next.id,
        createdAt: Date.now(),
        players: [],
        rematchOf: duelId,
        rematchId: null,
      };
      addPlayer(rematch, me.id, me.name);
      db.quizzes[next.id] = next;
      db.duels[rematch.id] = rematch;
      original.rematchId = rematch.id;
      return rematch;
    });
  })();
  pendingRematches.set(duelId, job);
  job.finally(() => pendingRematches.delete(duelId)).catch(() => undefined);
  return job;
}
