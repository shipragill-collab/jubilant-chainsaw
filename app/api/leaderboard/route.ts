import { leaderboard } from "@/lib/game";
import { handle } from "@/lib/http";
import { read } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => ({ rows: leaderboard(await read()) }));
}
