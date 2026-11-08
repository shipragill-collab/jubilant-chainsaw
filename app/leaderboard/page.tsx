import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { RankBadge } from "@/components/rank-badge";
import { Badge, Panel, Section } from "@/components/ui";
import { leaderboard } from "@/lib/game";
import { SetupNotice } from "@/components/setup-notice";
import { isStoreUnavailable, read } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  let rows;
  try {
    rows = leaderboard(await read());
  } catch (err) {
    if (isStoreUnavailable(err)) return <SetupNotice what="leaderboard" />;
    throw err;
  }
  return (
    <Section title="Leaderboard" intro="Every finished duel counts. Ranked by wins, then total points.">

      {rows.length === 0 ? (
        <Panel className="text-center">
          <p className="text-body-lg text-muted-foreground">No finished duels yet.</p>
          <Link href="/#start" className="mt-2 inline-block text-body underline underline-offset-4">
            Start one
          </Link>
        </Panel>
      ) : (
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
      )}
    </Section>
  );
}
