import { getDuel } from "@/lib/duels";
import { toView } from "@/lib/game";
import { handle } from "@/lib/http";
import { read } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await ctx.params;
    const playerId = new URL(req.url).searchParams.get("playerId");
    const db = await read();
    const { duel, quiz } = getDuel(db, id);
    return toView(duel, quiz, playerId, Date.now(), db.profiles);
  });
}
