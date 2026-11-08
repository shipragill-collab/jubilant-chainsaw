import { getDuel } from "@/lib/duels";
import { addPlayer, cleanName, toView } from "@/lib/game";
import { body, handle, playerIdFrom } from "@/lib/http";
import { recordActivity } from "@/lib/profile";
import { update } from "@/lib/store";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await ctx.params;
    const b = await body(req);
    const playerId = playerIdFrom(b.playerId);
    const name = cleanName(b.name);
    return update((db) => {
      const { duel, quiz } = getDuel(db, id);
      addPlayer(duel, playerId, name);
      recordActivity(db, playerId);
      return toView(duel, quiz, playerId, Date.now(), db.profiles);
    });
  });
}
