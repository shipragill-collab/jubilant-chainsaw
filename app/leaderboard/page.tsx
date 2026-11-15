"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/avatar";
import { RankBadge } from "@/components/rank-badge";
import { PreviewEmpty } from "@/components/preview-empty";
import { Badge, Section } from "@/components/ui";
import { api, getPlayerId } from "@/lib/player";
import type { LeaderboardRow } from "@/lib/types";

/** What a busy board looks like, shown blurred behind the empty state. */
const sample = (name: string, skin: string, wins: number, losses: number, ties: number, accuracy: number, points: number, pro = false): LeaderboardRow => ({
  name, avatar: { skin }, pro, played: wins + losses + ties, wins, losses, ties, accuracy, points,
});
const SAMPLE_ROWS: LeaderboardRow[] = [
  sample("Maya", "skin-mint", 14, 3, 1, 0.91, 12840, true),
  sample("Theo", "skin-ocean", 11, 5, 0, 0.84, 10210),
  sample("Aisha", "skin-plum", 9, 4, 2, 0.88, 9475, true),
  sample("Leo", "skin-peach", 7, 6, 1, 0.76, 7330),
  sample("Sofia", "skin-sky", 6, 7, 0, 0.72, 6120),
];

function LeaderTable({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-body-lg">
        <thead>
          <tr className="border-b border-surface-border text-left text-label text-muted-foreground">
            <th className="w-14 px-4 py-2 font-medium">Rank</th>
            <th className="px-2 py-2 font-medium">Player</th>
            <th className="px-2 py-2 text-right font-medium">W</th>
            <th className="px-2 py-2 text-right font-medium">L</th>
            <th className="px-2 py-2 text-right font-medium">T</th>
            <th className="hidden px-2 py-2 text-right font-medium sm:table-cell">Accuracy</th>
            <th className="px-4 py-2 text-right font-medium">Points</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.name} className="border-b border-surface-border last:border-0 hover:bg-surface-hover">
              <td className="px-4 py-3">
                <RankBadge rank={i + 1} />
              </td>
              <td className="px-2 py-3">
                <span className="flex items-center gap-3 font-medium">
                  <Avatar equipped={r.avatar} size={40} />
                  <span className="truncate">{r.name}</span>
                  {r.pro && <Badge tone="brand">Pro</Badge>}
                </span>
              </td>
              <td className="px-2 py-4 text-right tabular-nums">{r.wins}</td>
              <td className="px-2 py-4 text-right tabular-nums text-muted-foreground">{r.losses}</td>
              <td className="px-2 py-4 text-right tabular-nums text-muted-foreground">{r.ties}</td>
              <td className="hidden px-2 py-4 text-right tabular-nums text-muted-foreground sm:table-cell">
                {Math.round(r.accuracy * 100)}%
              </td>
              <td className="px-4 py-4 text-right font-semibold tabular-nums">{r.points.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api<{ rows: LeaderboardRow[] }>(`/api/leaderboard?playerId=${encodeURIComponent(getPlayerId())}`)
      .then((r) => setRows(r.rows))
      .catch((err: Error) => setError(err.message));
  }, []);
  const onlyMe = rows !== null && rows.length <= 1;
  return (
    <Section
      title="Leaderboard"
      intro="Your friends board: you and everyone you've duelled. Ranked by wins, then total points. Players you don't know never appear here."
    >
      {error ? (
        <p className="surface p-5 text-body-lg text-muted-foreground">{error}</p>
      ) : rows === null ? (
        <p className="text-body text-muted-foreground">Loading…</p>
      ) : onlyMe ? (
        <div className="space-y-6">
          {rows.length === 1 && <LeaderTable rows={rows} />}
          <PreviewEmpty
            preview={<LeaderTable rows={SAMPLE_ROWS} />}
            eyebrow="Friends only"
            title="Duel a friend to fill your board."
            body="Send a friend your duel link. Everyone you finish a duel with shows up here, so you can see who's ahead."
            href="/#start"
            cta="Start a duel"
          />
        </div>
      ) : (
        <LeaderTable rows={rows} />
      )}
    </Section>
  );
}
