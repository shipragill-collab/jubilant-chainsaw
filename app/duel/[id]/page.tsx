import { DuelClient } from "./duel-client";

export default async function DuelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DuelClient id={id} />;
}
