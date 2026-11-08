import { GameError } from "@/lib/game";
import { body, handle, playerIdFrom } from "@/lib/http";
import { claimTier, profileView } from "@/lib/profile";
import { update } from "@/lib/store";

export async function POST(req: Request) {
  return handle(async () => {
    const b = await body(req);
    const playerId = playerIdFrom(b.playerId);
    const track = b.track === "premium" ? "premium" : b.track === "free" ? "free" : null;
    if (!track) throw new GameError("Unknown track.");
    return update((db) => profileView(claimTier(db, playerId, Number(b.tier), track)));
  });
}
