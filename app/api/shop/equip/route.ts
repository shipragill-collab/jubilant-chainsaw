import type { Slot } from "@/lib/catalog";
import { GameError } from "@/lib/game";
import { body, handle, playerIdFrom } from "@/lib/http";
import { equipItem, profileView } from "@/lib/profile";
import { update } from "@/lib/store";

const SLOT_IDS: Slot[] = ["skin", "hat", "eyes", "neck"];

export async function POST(req: Request) {
  return handle(async () => {
    const b = await body(req);
    const playerId = playerIdFrom(b.playerId);
    const slot = b.slot as Slot;
    if (!SLOT_IDS.includes(slot)) throw new GameError("Unknown slot.");
    return update((db) => profileView(equipItem(db, playerId, slot, b.itemId == null ? null : String(b.itemId))));
  });
}
