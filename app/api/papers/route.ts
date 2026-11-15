import { buildPaper, FREE_PAPERS, PAPERS_PER_SUBJECT, SUBJECTS_11, type Subject11 } from "@/lib/eleven-plus";
import { GameError } from "@/lib/game";
import { body, handle, playerIdFrom } from "@/lib/http";
import { hasEleven } from "@/lib/profile";
import { read } from "@/lib/store";

export const dynamic = "force-dynamic";

/** An 11+ practice paper. Paper 1 of each subject is free; the rest come with the 11+ Pack. */
export async function POST(req: Request) {
  return handle(async () => {
    const b = await body(req);
    const subject = String(b.subject) as Subject11;
    const n = Number(b.paper);
    if (!SUBJECTS_11.some((s) => s.id === subject)) throw new GameError("Unknown subject.", 404);
    if (!Number.isInteger(n) || n < 1 || n > PAPERS_PER_SUBJECT) throw new GameError("Unknown paper.", 404);
    if (n > FREE_PAPERS) {
      const playerId = playerIdFrom(b.playerId);
      const p = (await read()).profiles[playerId];
      if (!p || !hasEleven(p)) throw new GameError("This paper is part of the 11+ Pack. Get the pack to unlock every paper.", 402);
    }
    return { paper: buildPaper(subject, n) };
  });
}
