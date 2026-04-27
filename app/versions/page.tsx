import { query } from "@/lib/db";
import { formatDate, formatPct, formatPnl } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

type VersionRow = {
  bot_version: string;
  signal_count: number;
  resolved_count: number;
  win_count: number;
  net_pnl: string | null;
  first_signal: string;
  last_signal: string;
};

export default async function VersionsPage() {
  const rows = await query<VersionRow>(`
    SELECT
      COALESCE(bot_version, '1.0.0')            AS bot_version,
      COUNT(*)::int                              AS signal_count,
      COUNT(*) FILTER (WHERE resolved)::int      AS resolved_count,
      COUNT(*) FILTER (WHERE outcome_won = true)::int AS win_count,
      SUM(pnl_pct)::text                         AS net_pnl,
      MIN(created_at)::text                      AS first_signal,
      MAX(created_at)::text                      AS last_signal
    FROM signals
    GROUP BY COALESCE(bot_version, '1.0.0')
    ORDER BY MAX(created_at) DESC
  `);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Version Comparison</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Performance breakdown by bot deployment version
        </p>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Version</th>
              <th className="text-right p-3 font-medium">Signals</th>
              <th className="text-right p-3 font-medium">Resolved</th>
              <th className="text-right p-3 font-medium">Win Rate</th>
              <th className="text-right p-3 font-medium">Net P&L</th>
              <th className="text-right p-3 font-medium">First Signal</th>
              <th className="text-right p-3 font-medium">Last Signal</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const winRate =
                r.resolved_count > 0 ? r.win_count / r.resolved_count : null;
              const pnl = r.net_pnl !== null ? parseFloat(r.net_pnl) : null;

              return (
                <tr key={r.bot_version} className="border-t hover:bg-muted/30">
                  <td className="p-3">
                    <Link
                      href={`/signals?version=${r.bot_version}`}
                      className="font-mono text-xs font-semibold hover:underline"
                    >
                      v{r.bot_version}
                    </Link>
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {r.signal_count.toLocaleString()}
                  </td>
                  <td className="p-3 text-right tabular-nums text-muted-foreground">
                    {r.resolved_count.toLocaleString()}
                  </td>
                  <td
                    className={`p-3 text-right tabular-nums font-medium ${
                      winRate === null
                        ? "text-muted-foreground"
                        : winRate >= 0.5
                        ? "text-green-700"
                        : "text-red-600"
                    }`}
                  >
                    {winRate !== null
                      ? `${formatPct(winRate, 1)} (${r.win_count}/${r.resolved_count})`
                      : "—"}
                  </td>
                  <td
                    className={`p-3 text-right tabular-nums font-medium ${
                      pnl === null
                        ? "text-muted-foreground"
                        : pnl >= 0
                        ? "text-green-700"
                        : "text-red-600"
                    }`}
                  >
                    {pnl !== null ? formatPnl(pnl / 100) : "—"}
                  </td>
                  <td className="p-3 text-right text-muted-foreground text-xs whitespace-nowrap">
                    {formatDate(r.first_signal)}
                  </td>
                  <td className="p-3 text-right text-muted-foreground text-xs whitespace-nowrap">
                    {formatDate(r.last_signal)}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-12 text-center text-muted-foreground">
                  No signals recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
