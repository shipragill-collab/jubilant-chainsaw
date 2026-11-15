import { GameError } from "@/lib/game";
import { body, handle, playerIdFrom } from "@/lib/http";
import { packFor, quizFromPack } from "@/lib/library";
import { generateOfflineQuestions } from "@/lib/offline-generator";
import { peekProfile } from "@/lib/profile";
import { read } from "@/lib/store";
import type { Flashcard, Question } from "@/lib/types";

export const dynamic = "force-dynamic";

const EXAM_LENGTH = 10;

/** Multiple-choice questions straight from flashcards, to top up a short exam. */
function fromFlashcards(cards: Flashcard[], need: number, skip: Set<string>): Question[] {
  const backs = [...new Set(cards.map((c) => c.back))];
  const out: Question[] = [];
  for (const c of [...cards].sort(() => Math.random() - 0.5)) {
    if (out.length >= need || skip.has(c.front)) continue;
    const wrong = backs.filter((b) => b !== c.back).sort(() => Math.random() - 0.5).slice(0, 3);
    if (wrong.length < 3) continue;
    const options = [c.back, ...wrong].sort(() => Math.random() - 0.5);
    out.push({ prompt: c.front, options, answerIndex: options.indexOf(c.back), explanation: `${c.front} ${c.back}.` });
  }
  return out;
}

/** Pro: a 10-question mock exam on a study set (no API key needed). */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await ctx.params;
    const playerId = playerIdFrom((await body(req)).playerId);
    const db = await read();
    const set = db.studySets[id];
    if (!set) throw new GameError("Study set not found.", 404);
    if (!peekProfile(db, playerId).pro) {
      throw new GameError("Mock exams are part of Pro. Upgrade to Pro to unlock them.", 402);
    }
    const pack = packFor(set.material);
    let questions = pack ? quizFromPack(pack, EXAM_LENGTH) : generateOfflineQuestions(set.material, EXAM_LENGTH);
    if (questions.length < EXAM_LENGTH) {
      questions = [...questions, ...fromFlashcards(set.flashcards, EXAM_LENGTH - questions.length, new Set(questions.map((q) => q.prompt)))];
    }
    return { title: set.title, minutes: 10, questions };
  });
}
