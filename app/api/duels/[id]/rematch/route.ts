import { createRematch } from "@/lib/duels";
import { body, handle, playerIdFrom } from "@/lib/http";

export const maxDuration = 60;

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await ctx.params;
    const playerId = playerIdFrom((await body(req)).playerId);
    const duel = await createRematch(id, playerId);
    return { id: duel.id };
  });
}
