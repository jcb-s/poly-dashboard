"use client";

import { Component, type ReactNode } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

class ChartErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
          Chart unavailable
        </div>
      );
    }
    return this.props.children;
  }
}

export function PnlChart({
  data,
}: {
  data: { day: string; cumulative_pnl: number }[];
}) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
        No resolved signals yet
      </div>
    );
  }

  const formatted = data.map((d) => ({
    label: new Date(d.day).toLocaleDateString("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "numeric",
    }),
    cumulative_pnl: Number(d.cumulative_pnl),
  }));

  const latest = formatted[formatted.length - 1]?.cumulative_pnl ?? 0;
  const color = latest >= 0 ? "#16a34a" : "#dc2626";

  return (
    <ChartErrorBoundary>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={formatted}>
          <defs>
            <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="#94a3b8"
            tickFormatter={(v) => {
              const n = Number(v);
              return isNaN(n) ? "" : `${n > 0 ? "+" : ""}${n.toFixed(0)}%`;
            }}
          />
          <Tooltip
            contentStyle={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              fontSize: 12,
            }}
            formatter={(v) => {
              const n = Number(v);
              return isNaN(n)
                ? ["—", "Cumulative P&L"]
                : [`${n >= 0 ? "+" : ""}${n.toFixed(2)}%`, "Cumulative P&L"];
            }}
          />
          <Area
            type="monotone"
            dataKey="cumulative_pnl"
            stroke={color}
            strokeWidth={2}
            fill="url(#pnlGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartErrorBoundary>
  );
}
