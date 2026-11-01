import { describe, expect, it } from "vitest";
import { addPlayer, duelOutcome, leaderboard, markShown, scoreAnswer, submitAnswer, toView } from "@/lib/game";
import type { Db, Duel, Quiz } from "@/lib/types";

const quiz: Quiz = {
  id: "q1",
  title: "T",
  notes: "n",
  source: "offline",
  createdAt: 0,
  questions: [
    { prompt: "1?", options: ["a", "b", "c", "d"], answerIndex: 0 },
    { prompt: "2?", options: ["a", "b", "c", "d"], answerIndex: 1 },
  ],
};
const newDuel = (): Duel => ({ id: "d1", quizId: "q1", createdAt: 0, players: [], rematchOf: null, rematchId: null });

function play(duel: Duel, pid: string, choices: number[], ms: number, t0 = 1000) {
  let t = t0;
  choices.forEach((c, i) => {
    markShown(duel, pid, t);
    t += ms;
    submitAnswer(duel, quiz, pid, i, c, t);
  });
}

describe("scoring", () => {
  it("rewards correctness and speed", () => {
    expect(scoreAnswer(false, 100)).toBe(0);
    expect(scoreAnswer(true, 0)).toBe(150);
    expect(scoreAnswer(true, 20_000)).toBe(100);
    expect(scoreAnswer(true, 10_000)).toBe(125);
  });
});

describe("duel flow", () => {
  it("caps at two players and is idempotent for the same player", () => {
    const d = newDuel();
    addPlayer(d, "p1", "Sam");
    addPlayer(d, "p1", "Sam");
    addPlayer(d, "p2", "Alex");
    expect(d.players).toHaveLength(2);
    expect(() => addPlayer(d, "p3", "Kim")).toThrow(/two players/);
  });

  it("hides questions until started and the answer key until finished", () => {
    const d = newDuel();
    addPlayer(d, "p1", "Sam");
    expect(toView(d, quiz, "p1").me?.question).toBeNull();
    markShown(d, "p1", 0);
    const v = toView(d, quiz, "p1", 5000);
    expect(v.me?.question).toEqual({ prompt: "1?", options: ["a", "b", "c", "d"] });
    expect(v.me?.timeLeftMs).toBe(15_000);
    expect(JSON.stringify(v)).not.toContain("answerIndex");
  });

  it("rejects out-of-order and duplicate answers", () => {
    const d = newDuel();
    addPlayer(d, "p1", "Sam");
    expect(() => submitAnswer(d, quiz, "p1", 0, 0, 10)).toThrow(/Start the question/);
    markShown(d, "p1", 0);
    expect(() => submitAnswer(d, quiz, "p1", 1, 0, 10)).toThrow();
    submitAnswer(d, quiz, "p1", 0, 0, 10);
    expect(() => submitAnswer(d, quiz, "p1", 0, 0, 20)).toThrow();
  });

  it("treats answers well past the time limit as timeouts", () => {
    const d = newDuel();
    addPlayer(d, "p1", "Sam");
    markShown(d, "p1", 0);
    const a = submitAnswer(d, quiz, "p1", 0, 0, 30_000);
    expect(a).toMatchObject({ correct: false, choice: null, points: 0 });
  });

  it("picks a winner once both finish, and feeds the leaderboard", () => {
    const d = newDuel();
    addPlayer(d, "p1", "Sam");
    addPlayer(d, "p2", "Alex");
    play(d, "p1", [0, 1], 2000);
    expect(duelOutcome(d).status).toBe("playing");
    play(d, "p2", [0, 0], 1000);
    const out = duelOutcome(d);
    expect(out).toEqual({ status: "finished", winnerId: "p1" });
    expect(toView(d, quiz, "p2").review).toHaveLength(2);

    const db: Db = { quizzes: { q1: quiz }, duels: { d1: d }, studySets: {} };
    const rows = leaderboard(db);
    expect(rows.map((r) => [r.name, r.wins, r.losses])).toEqual([
      ["Sam", 1, 0],
      ["Alex", 0, 1],
    ]);
    expect(rows[0].accuracy).toBe(1);
  });

  it("reports ties", () => {
    const d = newDuel();
    addPlayer(d, "p1", "Sam");
    addPlayer(d, "p2", "Alex");
    play(d, "p1", [0, 1], 1000);
    play(d, "p2", [0, 1], 1000);
    expect(duelOutcome(d).winnerId).toBeNull();
    expect(leaderboard({ quizzes: { q1: quiz }, duels: { d1: d }, studySets: {} })[0].ties).toBe(1);
  });
});
