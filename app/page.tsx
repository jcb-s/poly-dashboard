import { query, type Signal } from "@/lib/db";
import { StatCard } from "@/components/stat-card";
import { SignalsOverTimeChart } from "@/components/signals-over-time-chart";
import { WinRateChart, type WinRateData } from "@/components/win-rate-chart";
import { formatPct, formatPnl, signalTypeLabel, signalTypeColor, formatDate } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Summary = {
  total: number;
  resolved: number;
  open: number;
  wins: number;
  avg_edge: string | null;
  total_pnl: string | null;
};

type DailyCount = {
  day: string;
  count: number;
};

type WinRateByType = {
  signal_type: string;
  resolved_count: number;
  win_count: number;
};

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ version?: string }>;
}) {
  const params = await searchParams;
  const v = params.version ?? "2.0.0";
  const byVer = v !== "lifetime";
  const vf = byVer ? `AND COALESCE(bot_version, '1.0.0') = $1` : "";
  const vp: string[] = byVer ? [v] : [];

  const [summaryRows, dailyRows, winRateRows, recentSignals] = await Promise.all([
    query<Summary>(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE resolved)::int AS resolved,
        COUNT(*) FILTER (WHERE NOT resolved)::int AS open,
        COUNT(*) FILTER (WHERE outcome_won = true)::int AS wins,
        AVG(edge)::text AS avg_edge,
        SUM(pnl_pct)::text AS total_pnl
      FROM signals
      WHERE 1=1 ${vf}
    `, vp),

    query<DailyCount>(`
      SELECT
        TO_CHAR(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
        COUNT(*)::int AS count
      FROM signals
      WHERE created_at > NOW() - INTERVAL '30 days' ${vf}
      GROUP BY 1
      ORDER BY 1
    `, vp),

    query<WinRateByType>(`
      SELECT
        signal_type,
        COUNT(*) FILTER (WHERE resolved)::int AS resolved_count,
        COUNT(*) FILTER (WHERE outcome_won = true)::int AS win_count
      FROM signals
      WHERE 1=1 ${vf}
      GROUP BY signal_type
      ORDER BY resolved_count DESC
    `, vp),

    query<Signal>(`
      WITH deduped AS (
        SELECT DISTINCT ON (
          market_slug,
          direction,
          (EXTRACT(EPOCH FROM created_at)::bigint / 300)
        ) *
        FROM signals
        WHERE 1=1 ${vf}
        ORDER BY
          market_slug,
          direction,
          (EXTRACT(EPOCH FROM created_at)::bigint / 300),
          created_at DESC
      )
      SELECT * FROM deduped ORDER BY created_at DESC LIMIT 8
    `, vp),
  ]);

  const summary = summaryRows[0] ?? {
    total: 0,
    resolved: 0,
    open: 0,
    wins: 0,
    avg_edge: null,
    total_pnl: null,
  };

  const winRate =
    summary.resolved > 0 ? summary.wins / summary.resolved : null;

  const winRateData: WinRateData[] = winRateRows.map((r) => ({
    type: signalTypeLabel(r.signal_type),
    win_rate: r.resolved_count > 0 ? (r.win_count / r.resolved_count) * 100 : 0,
    resolved_count: r.resolved_count,
    win_count: r.win_count,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {byVer ? `v${v}` : "All time"} · {summary.total} signals
        </p>
      </div>

      {/* Row 1: Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          compact
          label="Total signals"
          value={summary.total.toLocaleString()}
          sublabel={`${summary.open} open`}
        />
        <StatCard
          compact
          label="Win rate"
          value={winRate !== null ? formatPct(winRate, 1) : "—"}
          sublabel={
            summary.resolved > 0
              ? `${summary.wins}/${summary.resolved} resolved`
              : "no resolved yet"
          }
          valueClassName={
            winRate === null ? "" : winRate >= 0.5 ? "text-success" : "text-danger"
          }
        />
        <StatCard
          compact
          label="Avg edge"
          value={summary.avg_edge ? formatPct(summary.avg_edge) : "—"}
        />
        <StatCard
          compact
          label="Total P&L"
          value={summary.total_pnl ? formatPnl(summary.total_pnl) : "—"}
          sublabel="resolved signals"
          valueClassName={
            !summary.total_pnl
              ? ""
              : parseFloat(summary.total_pnl) >= 0
              ? "text-success"
              : "text-danger"
          }
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Signals (30d)
          </h2>
          <SignalsOverTimeChart data={dailyRows} height={180} />
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Win rate by type
          </h2>
          <WinRateChart data={winRateData} />
          <div className="mt-3 space-y-1.5">
            {winRateRows.map((r) => (
              <div key={r.signal_type} className="flex items-center justify-between text-xs">
                <span className={`px-1.5 py-0.5 rounded font-medium ${signalTypeColor(r.signal_type)}`}>
                  {signalTypeLabel(r.signal_type)}
                </span>
                <span className="text-muted-foreground">
                  {r.resolved_count > 0
                    ? `${r.win_count}/${r.resolved_count} (${((r.win_count / r.resolved_count) * 100).toFixed(0)}%)`
                    : "no resolved"}
                </span>
              </div>
            ))}
            {winRateRows.length === 0 && (
              <div className="text-xs text-muted-foreground">No signals yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Recent signals */}
      <div className="rounded-lg border bg-card">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recent signals
          </h2>
          <Link
            href={byVer ? `/signals?version=${v}` : "/signals"}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Type</th>
                <th className="text-left px-4 py-2 font-medium">Market</th>
                <th className="text-left px-4 py-2 font-medium">Dir</th>
                <th className="text-right px-4 py-2 font-medium">Edge</th>
                <th className="text-right px-4 py-2 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {recentSignals.map((s) => (
                <tr key={s.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${signalTypeColor(s.signal_type)}`}>
                      {signalTypeLabel(s.signal_type)}
                    </span>
                  </td>
                  <td className="px-4 py-2 max-w-xs truncate text-xs" title={s.market_question ?? ""}>
                    {s.market_question}
                  </td>
                  <td className="px-4 py-2 uppercase text-xs text-muted-foreground">
                    {s.direction}
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-xs">
                    {formatPct(s.edge)}
                  </td>
                  <td className="px-4 py-2 text-right text-muted-foreground text-xs whitespace-nowrap">
                    {formatDate(s.created_at)}
                  </td>
                </tr>
              ))}
              {recentSignals.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                    No signals yet. Once your bot fires its first alert, it&apos;ll show up here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
