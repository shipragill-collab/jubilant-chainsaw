import { manageSubscription } from "@/lib/billing";
import { body, handle, playerIdFrom } from "@/lib/http";

export async function POST(req: Request) {
  return handle(async () => ({ url: await manageSubscription(req, playerIdFrom((await body(req)).playerId)) }));
}
