import { query, type Signal } from "@/lib/db";
import {
  formatDate,
  formatPct,
  formatPnl,
  formatPrice,
  signalTypeColor,
  signalTypeLabel,
  confidenceScore,
} from "@/lib/utils";
import { SignalsFilters } from "@/components/signals-filters";

export const dynamic = "force-dynamic";

type SearchParams = {
  type?: string;
  status?: string;
  direction?: string;
  min_edge?: string;
  sort?: string;
};

export default async function SignalsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const where: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (params.type && params.type !== "all") {
    where.push(`signal_type = $${i++}`);
    values.push(params.type);
  }
  if (params.status === "open") where.push(`resolved = false`);
  if (params.status === "resolved") where.push(`resolved = true`);
  if (params.status === "won") where.push(`outcome_won = true`);
  if (params.status === "lost") where.push(`outcome_won = false`);
  if (params.direction && params.direction !== "all") {
    where.push(`direction = $${i++}`);
    values.push(params.direction);
  }
  if (params.min_edge) {
    const minEdge = parseFloat(params.min_edge);
    if (!isNaN(minEdge)) {
      where.push(`edge >= $${i++}`);
      values.push(minEdge / 100);
    }
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const sortMap: Record<string, string> = {
    newest: "created_at DESC",
    oldest: "created_at ASC",
    edge_desc: "edge DESC",
    edge_asc: "edge ASC",
    pnl_desc: "pnl_pct DESC NULLS LAST",
    pnl_asc: "pnl_pct ASC NULLS LAST",
  };
  const orderBy = sortMap[params.sort ?? "newest"] ?? sortMap.newest;

  const signals = await query<Signal>(
    `SELECT * FROM signals ${whereSql} ORDER BY ${orderBy} LIMIT 200`,
    values
  );

  const types = await query<{ signal_type: string }>(
    `SELECT DISTINCT signal_type FROM signals ORDER BY signal_type`
  );
  const directions = await query<{ direction: string }>(
    `SELECT DISTINCT direction FROM signals ORDER BY direction`
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Signals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {signals.length} {signals.length === 1 ? "signal" : "signals"}
          {signals.length === 200 ? " (showing latest 200)" : ""}
        </p>
      </div>

      <SignalsFilters
        types={types.map((t) => t.signal_type)}
        directions={directions.map((d) => d.direction)}
      />

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Market</th>
              <th className="text-left p-3 font-medium">Dir</th>
              <th className="text-right p-3 font-medium">Entry</th>
              <th className="text-right p-3 font-medium">Implied</th>
              <th className="text-right p-3 font-medium">Edge</th>
              <th className="text-right p-3 font-medium">Current</th>
              <th className="text-center p-3 font-medium">Status</th>
              <th className="text-right p-3 font-medium">P&L</th>
              <th className="text-center p-3 font-medium">Confidence</th>
              <th className="text-right p-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((s) => (
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
                <td className="p-3 max-w-xs">
                  <a
                    href={`https://polymarket.com/event/${
                      s.event_slug ?? s.market_slug
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline line-clamp-2"
                    title={s.market_question}
                  >
                    {s.market_question}
                  </a>
                </td>
                <td className="p-3 uppercase text-xs font-medium">
                  {s.direction}
                </td>
                <td className="p-3 text-right tabular-nums">
                  {formatPrice(s.entry_price)}
                </td>
                <td className="p-3 text-right tabular-nums text-muted-foreground">
                  {formatPrice(s.implied_price)}
                </td>
                <td className="p-3 text-right tabular-nums font-medium">
                  {formatPct(s.edge)}
                </td>
                <td className="p-3 text-right tabular-nums text-muted-foreground">
                  {formatPrice(s.current_price)}
                </td>
                <td className="p-3 text-center">
                  <StatusBadge signal={s} />
                </td>
                <td
                  className={`p-3 text-right tabular-nums font-medium ${
                    s.pnl_pct === null
                      ? ""
                      : parseFloat(s.pnl_pct) >= 0
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {formatPnl(s.pnl_pct)}
                </td>
                <td className="p-3 text-center text-xs">
                  {(() => {
                    const c = confidenceScore(s.edge);
                    return <span className={c.className}>{c.label}</span>;
                  })()}
                </td>
                <td className="p-3 text-right text-muted-foreground text-xs whitespace-nowrap">
                  {formatDate(s.created_at)}
                </td>
              </tr>
            ))}
            {signals.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="p-12 text-center text-muted-foreground"
                >
                  No signals match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ signal }: { signal: Signal }) {
  if (!signal.resolved) {
    return (
      <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
        Open
      </span>
    );
  }
  if (signal.outcome_won === true) {
    return (
      <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
        Won
      </span>
    );
  }
  if (signal.outcome_won === false) {
    return (
      <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-800">
        Lost
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
      Resolved
    </span>
  );
}
