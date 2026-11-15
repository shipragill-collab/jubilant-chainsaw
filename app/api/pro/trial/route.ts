import { body, handle, playerIdFrom } from "@/lib/http";
import { profileView, startTrial } from "@/lib/profile";
import { update } from "@/lib/store";

/** Start the free 7-day Pro trial (once per player, no card). */
export async function POST(req: Request) {
  return handle(async () => {
    const playerId = playerIdFrom((await body(req)).playerId);
    return update((db) => profileView(startTrial(db, playerId)));
  });
}
