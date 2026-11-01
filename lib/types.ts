export const QUESTION_COUNT = 10;
export const MAX_PLAYERS = 2;
/** Seconds per question; answering faster earns a speed bonus. */
export const QUESTION_TIME_LIMIT_S = 20;

export interface Question {
  prompt: string;
  options: string[]; // always 4
  answerIndex: number;
  explanation?: string;
}

export type QuestionSource = "claude" | "offline";

export interface Quiz {
  id: string;
  title: string;
  notes: string;
  questions: Question[];
  source: QuestionSource;
  createdAt: number;
}

export interface PlayerAnswer {
  choice: number | null; // null = ran out of time
  correct: boolean;
  timeMs: number;
  points: number;
}

export interface Player {
  id: string;
  name: string;
  joinedAt: number;
  answers: PlayerAnswer[];
  score: number;
  finishedAt: number | null;
  /** When the player was shown the current (unanswered) question. */
  questionShownAt: number | null;
}

export interface Duel {
  id: string;
  quizId: string;
  createdAt: number;
  players: Player[];
  rematchOf: string | null;
  rematchId: string | null;
}

export interface Db {
  quizzes: Record<string, Quiz>;
  duels: Record<string, Duel>;
}

/** Question as sent to a player who hasn't answered it yet: no answer key. */
export interface PublicQuestion {
  prompt: string;
  options: string[];
}

export interface PublicPlayer {
  id: string;
  name: string;
  score: number;
  answered: number;
  correct: number;
  finished: boolean;
  totalTimeMs: number;
}

export type DuelStatus = "waiting" | "playing" | "finished";

export interface DuelView {
  id: string;
  title: string;
  source: QuestionSource;
  questionCount: number;
  status: DuelStatus;
  players: PublicPlayer[];
  winnerId: string | null; // null with status=finished means a tie
  rematchId: string | null;
  rematchOf: string | null;
  /** Only present for the requesting player. */
  me: {
    playerId: string;
    nextIndex: number;
    question: PublicQuestion | null;
    timeLeftMs: number | null;
    answers: PlayerAnswer[];
  } | null;
  /** Full answer key, only once the requesting player has finished. */
  review: Question[] | null;
}

export interface LeaderboardRow {
  name: string;
  played: number;
  wins: number;
  losses: number;
  ties: number;
  points: number;
  accuracy: number; // 0..1
}
