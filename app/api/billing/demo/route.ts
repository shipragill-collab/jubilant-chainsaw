import { confirmDemo, describeOrder, paymentsLive } from "@/lib/billing";
import { GameError } from "@/lib/game";
import { body, handle, playerIdFrom } from "@/lib/http";
import { read } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Order summary for the demo checkout page. */
export async function GET(req: Request) {
  return handle(async () => {
    const url = new URL(req.url);
    const playerId = playerIdFrom(url.searchParams.get("playerId"));
    const order = (await read()).orders[url.searchParams.get("order") ?? ""];
    if (!order || order.playerId !== playerId) throw new GameError("Order not found.", 404);
    return { order: { id: order.id, kind: order.kind, status: order.status, ...describeOrder(order) }, live: paymentsLive() };
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    const b = await body(req);
    const order = await confirmDemo(String(b.order), playerIdFrom(b.playerId));
    return { ok: true, kind: order.kind, itemId: order.itemId ?? null };
  });
}
