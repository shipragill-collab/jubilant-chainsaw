import { body, handle, playerIdFrom } from "@/lib/http";
import { claimProSkin, profileView } from "@/lib/profile";
import { update } from "@/lib/store";

export async function POST(req: Request) {
  return handle(async () => {
    const playerId = playerIdFrom((await body(req)).playerId);
    return update((db) => profileView(claimProSkin(db, playerId)));
  });
}
