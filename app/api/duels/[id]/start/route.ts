import { getDuel } from "@/lib/duels";
import { GameError, markShown, toView } from "@/lib/game";
import { body, handle, playerIdFrom } from "@/lib/http";
import { update } from "@/lib/store";

/** Reveal the player's next question and start its clock. Idempotent. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await ctx.params;
    const playerId = playerIdFrom((await body(req)).playerId);
    return update((db) => {
      const { duel, quiz } = getDuel(db, id);
      if (!duel.players.some((p) => p.id === playerId)) throw new GameError("Join the duel first.", 403);
      markShown(duel, playerId);
      return toView(duel, quiz, playerId, Date.now(), db.profiles);
    });
  });
}
