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
  /** Coins have been paid out for this finished duel. */
  rewarded?: boolean;
}

export interface NoteSection {
  heading: string;
  points: string[];
}

export interface KeyTerm {
  term: string;
  definition: string;
}

export interface StudyNotes {
  summary: string;
  sections: NoteSection[];
  keyTerms: KeyTerm[];
}

export interface Flashcard {
  front: string;
  back: string;
}

/** Study material a user posted, plus the AI-made notes and flashcards. */
export interface StudySet {
  id: string;
  ownerId: string;
  title: string;
  material: string;
  notes: StudyNotes;
  flashcards: Flashcard[];
  source: QuestionSource;
  createdAt: number;
}

/** Study set as listed in "your sets" (no heavy content). */
export interface StudySetSummary {
  id: string;
  title: string;
  cardCount: number;
  termCount: number;
  source: QuestionSource;
  createdAt: number;
  /** A few cards to preview in galleries. */
  preview: Flashcard[];
}

export interface Profile {
  plan: "free" | "pro";
  /** Pro access lasts until this time (ms). */
  proUntil: number | null;
  coins: number;
  owned: string[];
  equipped: Partial<Record<"skin" | "hat" | "eyes" | "neck", string>>;
  usage: { day: string; aiGenerations: number; rajMessages: number };
  /** When the player studied (ms timestamps, at most one per 20 minutes, last ~120). */
  activity?: number[];
  /** Stripe ids, when real payments are connected. */
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  /** Checkout sessions already credited (idempotency). */
  credited: string[];
}

export interface Order {
  id: string;
  playerId: string;
  kind: "pro" | "coins";
  packId?: string;
  createdAt: number;
  status: "pending" | "paid";
}

export interface Db {
  orders: Record<string, Order>;
  quizzes: Record<string, Quiz>;
  duels: Record<string, Duel>;
  studySets: Record<string, StudySet>;
  profiles: Record<string, Profile>;
}

/** Question as sent to a player who hasn't answered it yet: no answer key. */
export interface PublicQuestion {
  prompt: string;
  options: string[];
}

export interface PublicPlayer {
  /** A hash of the player's id: the real id is a secret that unlocks their coins. */
  id: string;
  avatar: Partial<Record<"skin" | "hat" | "eyes" | "neck", string>>;
  pro: boolean;
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
    publicId: string;
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
  avatar: Partial<Record<"skin" | "hat" | "eyes" | "neck", string>>;
  pro: boolean;
  played: number;
  wins: number;
  losses: number;
  ties: number;
  points: number;
  accuracy: number; // 0..1
}
