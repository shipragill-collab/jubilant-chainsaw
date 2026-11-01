import { body, handle, playerIdFrom } from "@/lib/http";
import { read } from "@/lib/store";
import { createStudySet } from "@/lib/study";
import type { StudySetSummary } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 180;

/** Post study material; AI turns it into notes + flashcards. */
export async function POST(req: Request) {
  return handle(async () => {
    const b = await body(req);
    const set = await createStudySet({ material: b.material, title: b.title, ownerId: playerIdFrom(b.playerId) });
    return { id: set.id };
  });
}

/** The study sets this browser created, newest first. */
export async function GET(req: Request) {
  return handle(async () => {
    const ownerId = playerIdFrom(new URL(req.url).searchParams.get("playerId"));
    const sets: StudySetSummary[] = Object.values((await read()).studySets)
      .filter((s) => s.ownerId === ownerId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((s) => ({
        id: s.id,
        title: s.title,
        cardCount: s.flashcards.length,
        termCount: s.notes.keyTerms.length,
        source: s.source,
        createdAt: s.createdAt,
        preview: s.flashcards.slice(0, 3),
      }));
    return { sets };
  });
}
