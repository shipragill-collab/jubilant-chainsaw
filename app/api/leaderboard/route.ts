import { leaderboard } from "@/lib/game";
import { handle, playerIdFrom } from "@/lib/http";
import { read } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Your friends board: only people you've duelled. */
export async function GET(req: Request) {
  return handle(async () => ({ rows: leaderboard(await read(), playerIdFrom(new URL(req.url).searchParams.get("playerId"))) }));
}
