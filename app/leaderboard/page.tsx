import Link from "next/link";
import { Card } from "@/components/ui";
import { leaderboard } from "@/lib/game";
import { read } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const rows = leaderboard(await read());
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-display-sm font-semibold tracking-tight">Leaderboard</h1>
        <p className="text-body text-muted-foreground">Every finished duel counts. Ranked by wins, then total points.</p>
      </div>

      {rows.length === 0 ? (
        <Card className="text-center">
          <p className="text-body text-muted-foreground">No finished duels yet.</p>
          <Link href="/" className="mt-2 inline-block text-label text-brand hover:underline">
            Start one
          </Link>
        </Card>
      ) : (
        <div className="surface overflow-x-auto">
          <table className="w-full text-body">
            <thead>
              <tr className="border-b border-surface-border text-left text-label text-muted-foreground">
                <th className="w-10 px-4 py-2 font-medium">#</th>
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
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</td>
                  <td className="px-2 py-2.5 font-medium">{r.name}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{r.wins}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-muted-foreground">{r.losses}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-muted-foreground">{r.ties}</td>
                  <td className="hidden px-2 py-2.5 text-right tabular-nums text-muted-foreground sm:table-cell">
                    {Math.round(r.accuracy * 100)}%
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{r.points.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
