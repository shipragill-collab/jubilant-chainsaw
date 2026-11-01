import { body, handle, playerIdFrom } from "@/lib/http";
import { buyItem, profileView } from "@/lib/profile";
import { update } from "@/lib/store";

export async function POST(req: Request) {
  return handle(async () => {
    const b = await body(req);
    const playerId = playerIdFrom(b.playerId);
    return update((db) => profileView(buyItem(db, playerId, String(b.itemId))));
  });
}
