import { getDuel } from "@/lib/duels";
import { submitAnswer, toView } from "@/lib/game";
import { body, handle, playerIdFrom } from "@/lib/http";
import { update } from "@/lib/store";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await ctx.params;
    const b = await body(req);
    const playerId = playerIdFrom(b.playerId);
    const index = Number(b.index);
    const choice = b.choice === null || b.choice === undefined ? null : Number(b.choice);
    return update((db) => {
      const { duel, quiz } = getDuel(db, id);
      const answer = submitAnswer(duel, quiz, playerId, index, choice);
      const q = quiz.questions[index];
      return {
        answer,
        correctIndex: q.answerIndex,
        explanation: q.explanation ?? null,
        view: toView(duel, quiz, playerId),
      };
    });
  });
}
