import {
  MAX_PLAYERS,
  QUESTION_TIME_LIMIT_S,
  type Db,
  type Duel,
  type DuelView,
  type LeaderboardRow,
  type Player,
  type PlayerAnswer,
  type Quiz,
} from "./types";

export class GameError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

/** 100 for a correct answer plus up to 50 for speed. Wrong or timed out = 0. */
export function scoreAnswer(correct: boolean, timeMs: number): number {
  if (!correct) return 0;
  const limitMs = QUESTION_TIME_LIMIT_S * 1000;
  const remaining = Math.max(0, limitMs - timeMs) / limitMs;
  return 100 + Math.round(50 * remaining);
}

export function cleanName(name: unknown): string {
  const n = typeof name === "string" ? name.replace(/\s+/g, " ").trim().slice(0, 24) : "";
  if (!n) throw new GameError("Please enter your name.");
  return n;
}

export function addPlayer(duel: Duel, playerId: string, name: string, now = Date.now()): Player {
  const existing = duel.players.find((p) => p.id === playerId);
  if (existing) return existing;
  if (duel.players.length >= MAX_PLAYERS) throw new GameError("This duel already has two players.", 409);
  if (duel.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
    name = `${name} (2)`;
  }
  const player: Player = {
    id: playerId,
    name,
    joinedAt: now,
    answers: [],
    score: 0,
    finishedAt: null,
    questionShownAt: null,
  };
  duel.players.push(player);
  return player;
}

/**
 * Record an answer. Timing is measured on the server from the moment the
 * question was first served to this player, so it can't be faked by the client.
 */
export function submitAnswer(
  duel: Duel,
  quiz: Quiz,
  playerId: string,
  index: number,
  choice: number | null,
  now = Date.now(),
): PlayerAnswer {
  const player = duel.players.find((p) => p.id === playerId);
  if (!player) throw new GameError("You haven't joined this duel.", 403);
  if (player.finishedAt) throw new GameError("You've already finished this quiz.", 409);
  if (index !== player.answers.length) throw new GameError("That question was already answered.", 409);
  const question = quiz.questions[index];
  if (!question) throw new GameError("No such question.", 404);
  if (choice !== null && (!Number.isInteger(choice) || choice < 0 || choice >= question.options.length)) {
    throw new GameError("Invalid choice.");
  }
  const limitMs = QUESTION_TIME_LIMIT_S * 1000;
  if (player.questionShownAt === null) throw new GameError("Start the question first.", 409);
  const shownAt = player.questionShownAt;
  // Small grace period for network latency; anything past it counts as a timeout.
  const timeMs = Math.min(limitMs, Math.max(0, now - shownAt));
  const late = now - shownAt > limitMs + 2000;
  const correct = !late && choice !== null && choice === question.answerIndex;
  const answer: PlayerAnswer = {
    choice: late ? null : choice,
    correct,
    timeMs,
    points: scoreAnswer(correct, timeMs),
  };
  player.answers.push(answer);
  player.score += answer.points;
  player.questionShownAt = null;
  if (player.answers.length >= quiz.questions.length) player.finishedAt = now;
  return answer;
}

/** Marks the player's current question as shown (starts its clock) if not already. */
export function markShown(duel: Duel, playerId: string, now = Date.now()): boolean {
  const player = duel.players.find((p) => p.id === playerId);
  if (!player || player.finishedAt !== null || player.questionShownAt !== null) return false;
  player.questionShownAt = now;
  return true;
}

const totalTime = (p: Player) => p.answers.reduce((s, a) => s + a.timeMs, 0);

export function duelOutcome(duel: Duel) {
  const done = duel.players.length === MAX_PLAYERS && duel.players.every((p) => p.finishedAt);
  if (!done) {
    return { status: duel.players.length < MAX_PLAYERS ? ("waiting" as const) : ("playing" as const), winnerId: null };
  }
  const [a, b] = duel.players;
  let winnerId: string | null = null;
  if (a.score !== b.score) winnerId = a.score > b.score ? a.id : b.id;
  return { status: "finished" as const, winnerId };
}

export function toView(duel: Duel, quiz: Quiz, playerId: string | null, now = Date.now()): DuelView {
  const { status, winnerId } = duelOutcome(duel);
  const me = playerId ? duel.players.find((p) => p.id === playerId) : undefined;
  const nextIndex = me ? me.answers.length : 0;
  // A question is only revealed once its clock has started (see markShown).
  const q = me && me.finishedAt === null && me.questionShownAt !== null ? quiz.questions[nextIndex] : undefined;
  const limitMs = QUESTION_TIME_LIMIT_S * 1000;
  return {
    id: duel.id,
    title: quiz.title,
    source: quiz.source,
    questionCount: quiz.questions.length,
    status,
    winnerId,
    rematchId: duel.rematchId,
    rematchOf: duel.rematchOf,
    players: duel.players.map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      answered: p.answers.length,
      correct: p.answers.filter((a) => a.correct).length,
      finished: Boolean(p.finishedAt),
      totalTimeMs: totalTime(p),
    })),
    me: me
      ? {
          playerId: me.id,
          nextIndex,
          question: q ? { prompt: q.prompt, options: q.options } : null,
          timeLeftMs: q && me.questionShownAt !== null ? Math.max(0, limitMs - (now - me.questionShownAt)) : null,
          answers: me.answers,
        }
      : null,
    review: me?.finishedAt ? quiz.questions : null,
  };
}

/** Aggregate every finished two-player duel by (case-insensitive) player name. */
export function leaderboard(db: Db): LeaderboardRow[] {
  const rows = new Map<string, LeaderboardRow & { answered: number; correct: number }>();
  for (const duel of Object.values(db.duels)) {
    const quiz = db.quizzes[duel.quizId];
    if (!quiz) continue;
    const { status, winnerId } = duelOutcome(duel);
    if (status !== "finished") continue;
    for (const p of duel.players) {
      const key = p.name.replace(/ \(2\)$/, "").toLowerCase();
      const row =
        rows.get(key) ??
        { name: p.name.replace(/ \(2\)$/, ""), played: 0, wins: 0, losses: 0, ties: 0, points: 0, accuracy: 0, answered: 0, correct: 0 };
      row.played += 1;
      if (winnerId === null) row.ties += 1;
      else if (winnerId === p.id) row.wins += 1;
      else row.losses += 1;
      row.points += p.score;
      row.answered += p.answers.length;
      row.correct += p.answers.filter((a) => a.correct).length;
      rows.set(key, row);
    }
  }
  return [...rows.values()]
    .map(({ answered, correct, ...r }) => ({ ...r, accuracy: answered ? correct / answered : 0 }))
    .sort((a, b) => b.wins - a.wins || b.points - a.points || a.name.localeCompare(b.name));
}
