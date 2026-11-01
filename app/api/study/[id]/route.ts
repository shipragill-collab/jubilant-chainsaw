import { GameError } from "@/lib/game";
import { body, handle, playerIdFrom } from "@/lib/http";
import { read, update } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await ctx.params;
    const set = (await read()).studySets[id];
    if (!set) throw new GameError("Study set not found.", 404);
    const { ownerId: _owner, ...publicSet } = set;
    return publicSet;
  });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await ctx.params;
    const playerId = playerIdFrom((await body(req)).playerId);
    return update((db) => {
      const set = db.studySets[id];
      if (!set) throw new GameError("Study set not found.", 404);
      if (set.ownerId !== playerId) throw new GameError("Only the person who created this set can delete it.", 403);
      delete db.studySets[id];
      return { ok: true };
    });
  });
}
