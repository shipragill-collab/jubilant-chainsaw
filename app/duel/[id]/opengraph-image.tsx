import { cardData, renderCard } from "@/lib/result-card";

export const alt = "A Quiz Duel result";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The link preview for a duel: who's playing and the score so far. */
export default async function DuelImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return renderCard(await cardData(id), false);
}
