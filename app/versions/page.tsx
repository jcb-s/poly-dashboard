import { query } from "@/lib/db";
import { formatDate, formatPct, formatPnl } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

type VersionRow = {
  bot_version: string | null;
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
      bot_version,
      COUNT(*)::int                              AS signal_count,
      COUNT(*) FILTER (WHERE resolved)::int      AS resolved_count,
      COUNT(*) FILTER (WHERE outcome_won = true)::int AS win_count,
      SUM(pnl_pct)::text                         AS net_pnl,
      MIN(created_at)::text                      AS first_signal,
      MAX(created_at)::text                      AS last_signal
    FROM signals
    GROUP BY bot_version
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

      {rows.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
          No signals recorded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rows.map((r) => {
            const versionLabel = r.bot_version ?? "unset";
            const winRate =
              r.resolved_count > 0 ? r.win_count / r.resolved_count : null;
            const pnl = r.net_pnl !== null ? parseFloat(r.net_pnl) : null;

            return (
              <div
                key={versionLabel}
                className="rounded-lg border bg-card p-5 space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <Link
                    href={`/signals?version=${versionLabel}`}
                    className="font-mono text-xl font-bold hover:underline"
                  >
                    v{versionLabel}
                  </Link>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {r.signal_count.toLocaleString()} signals
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Resolved</div>
                    <div className="text-lg font-semibold tabular-nums">
                      {r.resolved_count.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Win Rate</div>
                    <div
                      className={`text-lg font-semibold tabular-nums ${
                        winRate === null
                          ? "text-muted-foreground"
                          : winRate >= 0.5
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {winRate !== null ? formatPct(winRate, 1) : "—"}
                    </div>
                    {winRate !== null && (
                      <div className="text-xs text-muted-foreground">
                        {r.win_count}/{r.resolved_count}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Net P&L</div>
                    <div
                      className={`text-lg font-semibold tabular-nums ${
                        pnl === null
                          ? "text-muted-foreground"
                          : pnl >= 0
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {pnl !== null ? formatPnl(pnl / 100) : "—"}
                    </div>
                  </div>
                </div>

                {/* Date range */}
                <div className="text-xs text-muted-foreground border-t pt-3">
                  {formatDate(r.first_signal)} → {formatDate(r.last_signal)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
