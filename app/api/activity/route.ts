import { body, handle, playerIdFrom } from "@/lib/http";
import { profileView, recordActivity, profileOf } from "@/lib/profile";
import { update } from "@/lib/store";

/** Record study that happens in the browser (e.g. reviewing flashcards). */
export async function POST(req: Request) {
  return handle(async () => {
    const playerId = playerIdFrom((await body(req)).playerId);
    return update((db) => {
      recordActivity(db, playerId);
      return profileView(profileOf(db, playerId));
    });
  });
}
