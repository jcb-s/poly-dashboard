import { query, type Signal } from "@/lib/db";
import { StatCard } from "@/components/stat-card";
import { SignalsOverTimeChart } from "@/components/signals-over-time-chart";
import { EdgeDistributionChart } from "@/components/edge-distribution-chart";
import { formatPct, formatPnl, signalTypeColor, signalTypeLabel, formatDate } from "@/lib/utils";
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

type ByType = {
  signal_type: string;
  count: number;
};

type DailyCount = {
  day: string;
  count: number;
};

type EdgeBucket = {
  bucket: string;
  count: number;
};

export default async function OverviewPage() {
  const [summaryRows, byTypeRows, dailyRows, edgeRows, recentSignals] = await Promise.all([
    query<Summary>(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE resolved)::int AS resolved,
        COUNT(*) FILTER (WHERE NOT resolved)::int AS open,
        COUNT(*) FILTER (WHERE outcome_won = true)::int AS wins,
        AVG(edge)::text AS avg_edge,
        SUM(pnl_pct)::text AS total_pnl
      FROM signals
    `),
    query<ByType>(`
      SELECT signal_type, COUNT(*)::int AS count
      FROM signals
      GROUP BY signal_type
      ORDER BY count DESC
    `),
    query<DailyCount>(`
      SELECT
        TO_CHAR(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
        COUNT(*)::int AS count
      FROM signals
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY 1
      ORDER BY 1
    `),
    query<EdgeBucket>(`
      SELECT
        CASE
          WHEN edge < 0.05 THEN '4-5%'
          WHEN edge < 0.07 THEN '5-7%'
          WHEN edge < 0.10 THEN '7-10%'
          WHEN edge < 0.15 THEN '10-15%'
          ELSE '15%+'
        END AS bucket,
        COUNT(*)::int AS count
      FROM signals
      GROUP BY 1
      ORDER BY MIN(edge)
    `),
    query<Signal>(`
      SELECT * FROM signals
      ORDER BY created_at DESC
      LIMIT 8
    `),
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All signals fired by the bot
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total signals" value={summary.total.toLocaleString()} />
        <StatCard
          label="Open"
          value={summary.open.toLocaleString()}
          sublabel={`${summary.resolved} resolved`}
        />
        <StatCard
          label="Win rate"
          value={winRate !== null ? formatPct(winRate, 1) : "—"}
          sublabel={
            summary.resolved > 0
              ? `${summary.wins}/${summary.resolved}`
              : "no resolved yet"
          }
          valueClassName={
            winRate === null
              ? ""
              : winRate >= 0.5
              ? "text-success"
              : "text-danger"
          }
        />
        <StatCard
          label="Avg edge"
          value={summary.avg_edge ? formatPct(summary.avg_edge) : "—"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Total P&L"
          value={summary.total_pnl ? formatPnl(summary.total_pnl) : "—"}
          sublabel="sum across resolved signals"
          valueClassName={
            !summary.total_pnl
              ? ""
              : parseFloat(summary.total_pnl) >= 0
              ? "text-success"
              : "text-danger"
          }
        />
        <div className="rounded-lg border bg-card p-5">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            By category
          </div>
          <div className="mt-3 space-y-2">
            {byTypeRows.map((row) => (
              <div
                key={row.signal_type}
                className="flex items-center justify-between text-sm"
              >
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${signalTypeColor(
                    row.signal_type
                  )}`}
                >
                  {signalTypeLabel(row.signal_type)}
                </span>
                <span className="font-medium">{row.count}</span>
              </div>
            ))}
            {byTypeRows.length === 0 && (
              <div className="text-sm text-muted-foreground">No signals yet</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Signals over time (30d)</h2>
          <SignalsOverTimeChart data={dailyRows} />
        </div>
        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Edge distribution</h2>
          <EdgeDistributionChart data={edgeRows} />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent signals</h2>
          <Link
            href="/signals"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            View all →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Market</th>
              <th className="text-left p-3 font-medium">Direction</th>
              <th className="text-right p-3 font-medium">Edge</th>
              <th className="text-right p-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {recentSignals.map((s) => (
              <tr key={s.id} className="border-t hover:bg-muted/30">
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${signalTypeColor(
                      s.signal_type
                    )}`}
                  >
                    {signalTypeLabel(s.signal_type)}
                  </span>
                </td>
                <td className="p-3 max-w-md truncate" title={s.market_question}>
                  {s.market_question}
                </td>
                <td className="p-3 uppercase text-xs">{s.direction}</td>
                <td className="p-3 text-right font-medium">
                  {formatPct(s.edge)}
                </td>
                <td className="p-3 text-right text-muted-foreground text-xs">
                  {formatDate(s.created_at)}
                </td>
              </tr>
            ))}
            {recentSignals.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-muted-foreground"
                >
                  No signals yet. Once your bot fires its first alert, it'll
                  show up here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
