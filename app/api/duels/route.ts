import { createDuel } from "@/lib/duels";
import { body, handle, playerIdFrom } from "@/lib/http";

export const maxDuration = 60;

export async function POST(req: Request) {
  return handle(async () => {
    const b = await body(req);
    const duel = await createDuel({ notes: b.notes, name: b.name, playerId: playerIdFrom(b.playerId) });
    return { id: duel.id };
  });
}
