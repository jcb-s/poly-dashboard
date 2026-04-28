import { query } from "@/lib/db";
import { formatPct, formatPnl, signalTypeColor, signalTypeLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PerfRow = {
  signal_type: string;
  total: number;
  resolved: number;
  wins: number;
  losses: number;
  avg_edge: string | null;
  avg_pnl: string | null;
  total_pnl: string | null;
  best_pnl: string | null;
  worst_pnl: string | null;
};

export default async function PerformancePage({
  searchParams,
}: {
  searchParams: Promise<{ version?: string }>;
}) {
  const params = await searchParams;
  const v = params.version ?? "2.0.0";
  const byVer = v !== "lifetime";
  const vf = byVer ? `WHERE COALESCE(bot_version, '1.0.0') = $1` : "";
  const vp: string[] = byVer ? [v] : [];

  const rows = await query<PerfRow>(`
    SELECT
      signal_type,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE resolved)::int AS resolved,
      COUNT(*) FILTER (WHERE outcome_won = true)::int AS wins,
      COUNT(*) FILTER (WHERE outcome_won = false)::int AS losses,
      AVG(edge)::text AS avg_edge,
      AVG(pnl_pct)::text AS avg_pnl,
      SUM(pnl_pct)::text AS total_pnl,
      MAX(pnl_pct)::text AS best_pnl,
      MIN(pnl_pct)::text AS worst_pnl
    FROM signals
    ${vf}
    GROUP BY signal_type
    ORDER BY signal_type
  `, vp);

  const overall = rows.reduce(
    (acc, r) => {
      acc.total += r.total;
      acc.resolved += r.resolved;
      acc.wins += r.wins;
      acc.losses += r.losses;
      acc.totalPnl += r.total_pnl ? parseFloat(r.total_pnl) : 0;
      return acc;
    },
    { total: 0, resolved: 0, wins: 0, losses: 0, totalPnl: 0 }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Performance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {byVer ? `v${v}` : "All time"} · how well each signal category is performing
        </p>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Category</th>
              <th className="text-right p-3 font-medium">Total</th>
              <th className="text-right p-3 font-medium">Resolved</th>
              <th className="text-right p-3 font-medium">Win rate</th>
              <th className="text-right p-3 font-medium">Avg edge</th>
              <th className="text-right p-3 font-medium">Avg P&L</th>
              <th className="text-right p-3 font-medium">Total P&L</th>
              <th className="text-right p-3 font-medium">Best</th>
              <th className="text-right p-3 font-medium">Worst</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const winRate =
                r.resolved > 0 ? r.wins / r.resolved : null;
              return (
                <tr key={r.signal_type} className="border-t hover:bg-muted/30">
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${signalTypeColor(
                        r.signal_type
                      )}`}
                    >
                      {signalTypeLabel(r.signal_type)}
                    </span>
                  </td>
                  <td className="p-3 text-right tabular-nums">{r.total}</td>
                  <td className="p-3 text-right tabular-nums text-muted-foreground">
                    {r.resolved}
                  </td>
                  <td
                    className={`p-3 text-right tabular-nums font-medium ${
                      winRate === null
                        ? "text-muted-foreground"
                        : winRate >= 0.5
                        ? "text-success"
                        : "text-danger"
                    }`}
                  >
                    {winRate !== null ? formatPct(winRate, 1) : "—"}
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {r.avg_edge ? formatPct(r.avg_edge) : "—"}
                  </td>
                  <td
                    className={`p-3 text-right tabular-nums ${
                      !r.avg_pnl
                        ? "text-muted-foreground"
                        : parseFloat(r.avg_pnl) >= 0
                        ? "text-success"
                        : "text-danger"
                    }`}
                  >
                    {r.avg_pnl ? formatPnl(r.avg_pnl) : "—"}
                  </td>
                  <td
                    className={`p-3 text-right tabular-nums font-medium ${
                      !r.total_pnl
                        ? "text-muted-foreground"
                        : parseFloat(r.total_pnl) >= 0
                        ? "text-success"
                        : "text-danger"
                    }`}
                  >
                    {r.total_pnl ? formatPnl(r.total_pnl) : "—"}
                  </td>
                  <td className="p-3 text-right tabular-nums text-success">
                    {r.best_pnl ? formatPnl(r.best_pnl) : "—"}
                  </td>
                  <td className="p-3 text-right tabular-nums text-danger">
                    {r.worst_pnl ? formatPnl(r.worst_pnl) : "—"}
                  </td>
                </tr>
              );
            })}
            {rows.length > 0 && (
              <tr className="border-t bg-muted/30 font-medium">
                <td className="p-3">Overall</td>
                <td className="p-3 text-right tabular-nums">{overall.total}</td>
                <td className="p-3 text-right tabular-nums">
                  {overall.resolved}
                </td>
                <td
                  className={`p-3 text-right tabular-nums ${
                    overall.resolved === 0
                      ? "text-muted-foreground"
                      : overall.wins / overall.resolved >= 0.5
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {overall.resolved > 0
                    ? formatPct(overall.wins / overall.resolved, 1)
                    : "—"}
                </td>
                <td className="p-3" colSpan={2}></td>
                <td
                  className={`p-3 text-right tabular-nums ${
                    overall.totalPnl >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {formatPnl(overall.totalPnl)}
                </td>
                <td className="p-3" colSpan={2}></td>
              </tr>
            )}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="p-12 text-center text-muted-foreground"
                >
                  No data yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted-foreground">
        Win rate and P&L numbers only include signals where{" "}
        <code className="bg-muted px-1 py-0.5 rounded">resolved = true</code>.
        Make sure your bot is updating those fields once markets settle.
      </div>
    </div>
  );
}
