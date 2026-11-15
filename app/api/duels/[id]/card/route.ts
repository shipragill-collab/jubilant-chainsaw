import { cardData, renderCard } from "@/lib/result-card";

export const dynamic = "force-dynamic";

/** A 4:5 result image for sharing to stories and group chats. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const res = renderCard(await cardData(id), true);
  res.headers.set("cache-control", "public, max-age=60");
  return res;
}
