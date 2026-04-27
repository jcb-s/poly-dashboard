import { query } from "@/lib/db";
import { formatDate, formatPct, formatPnl } from "@/lib/utils";

export const dynamic = "force-dynamic";

type TrackedWallet = {
  address: string;
  win_rate: string;
  markets_resolved: number;
  total_pnl: string | null;
  first_seen: string;
  last_seen: string;
};

type WalletPosition = {
  id: number;
  address: string;
  condition_id: string;
  outcome: string;
  slug: string | null;
  title: string | null;
  avg_price: string | null;
  size: string | null;
  alerted_at: string;
};

export default async function WalletsPage() {
  const [wallets, positions] = await Promise.all([
    query<TrackedWallet>(
      `SELECT * FROM tracked_wallets ORDER BY win_rate DESC, markets_resolved DESC`
    ),
    query<WalletPosition>(
      `SELECT * FROM wallet_positions ORDER BY alerted_at DESC LIMIT 50`
    ),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Sharp Wallets</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {wallets.length} tracked wallet{wallets.length !== 1 ? "s" : ""} with
          win rate ≥ 65% across ≥ 50 resolved markets
        </p>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Address</th>
              <th className="text-right p-3 font-medium">Win Rate</th>
              <th className="text-right p-3 font-medium">Markets</th>
              <th className="text-right p-3 font-medium">Total P&L</th>
              <th className="text-right p-3 font-medium">First Seen</th>
              <th className="text-right p-3 font-medium">Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {wallets.map((w) => (
              <tr key={w.address} className="border-t hover:bg-muted/30">
                <td className="p-3 font-mono text-xs">
                  <a
                    href={`https://polymarket.com/profile/${w.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-blue-600"
                  >
                    {w.address.slice(0, 6)}…{w.address.slice(-4)}
                  </a>
                </td>
                <td className="p-3 text-right font-medium text-green-700">
                  {formatPct(w.win_rate, 1)}
                </td>
                <td className="p-3 text-right tabular-nums">
                  {w.markets_resolved}
                </td>
                <td
                  className={`p-3 text-right tabular-nums font-medium ${
                    w.total_pnl === null
                      ? ""
                      : parseFloat(w.total_pnl) >= 0
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {w.total_pnl !== null ? formatPnl(w.total_pnl) : "—"}
                </td>
                <td className="p-3 text-right text-muted-foreground text-xs whitespace-nowrap">
                  {formatDate(w.first_seen)}
                </td>
                <td className="p-3 text-right text-muted-foreground text-xs whitespace-nowrap">
                  {formatDate(w.last_seen)}
                </td>
              </tr>
            ))}
            {wallets.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-12 text-center text-muted-foreground"
                >
                  No sharp wallets tracked yet. The bot will add wallets once it
                  finds traders with a verified edge.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Positions</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Latest positions taken by tracked wallets (most recent 50)
        </p>
        <div className="rounded-lg border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Wallet</th>
                <th className="text-left p-3 font-medium">Market</th>
                <th className="text-left p-3 font-medium">Outcome</th>
                <th className="text-right p-3 font-medium">Avg Price</th>
                <th className="text-right p-3 font-medium">Size</th>
                <th className="text-right p-3 font-medium">Alerted</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs">
                    <a
                      href={`https://polymarket.com/profile/${p.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-blue-600"
                    >
                      {p.address.slice(0, 6)}…{p.address.slice(-4)}
                    </a>
                  </td>
                  <td className="p-3 max-w-xs">
                    {p.slug ? (
                      <a
                        href={`https://polymarket.com/event/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline line-clamp-2"
                        title={p.title ?? undefined}
                      >
                        {p.title ?? p.slug}
                      </a>
                    ) : (
                      <span className="text-muted-foreground font-mono text-xs">
                        {p.condition_id.slice(0, 10)}…
                      </span>
                    )}
                  </td>
                  <td className="p-3 uppercase text-xs font-medium">
                    {p.outcome}
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {p.avg_price !== null ? parseFloat(p.avg_price).toFixed(4) : "—"}
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {p.size !== null
                      ? `$${parseFloat(p.size).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                      : "—"}
                  </td>
                  <td className="p-3 text-right text-muted-foreground text-xs whitespace-nowrap">
                    {formatDate(p.alerted_at)}
                  </td>
                </tr>
              ))}
              {positions.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-12 text-center text-muted-foreground"
                  >
                    No positions recorded yet.
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
