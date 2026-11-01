import { paymentsLive } from "@/lib/billing";
import { handle, playerIdFrom } from "@/lib/http";
import { profileOf, profileView } from "@/lib/profile";
import { read } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handle(async () => {
    const playerId = playerIdFrom(new URL(req.url).searchParams.get("playerId"));
    // Reading doesn't persist a new profile; it's created on first purchase/reward.
    const db = await read();
    return { ...profileView(profileOf(db, playerId)), paymentsLive: paymentsLive() };
  });
}
