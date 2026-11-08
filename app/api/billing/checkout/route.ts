import { startCheckout } from "@/lib/billing";
import { body, handle, playerIdFrom } from "@/lib/http";

export async function POST(req: Request) {
  return handle(async () => {
    const b = await body(req);
    return { url: await startCheckout(req, playerIdFrom(b.playerId), b.kind, b.packId, b.itemId) };
  });
}
