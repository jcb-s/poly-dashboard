"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export type WinRateData = {
  type: string;
  win_rate: number;
  resolved_count: number;
  win_count: number;
};

export function WinRateChart({ data }: { data: WinRateData[] }) {
  if (data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
        No resolved signals yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="type"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          stroke="hsl(var(--border))"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          stroke="hsl(var(--border))"
          domain={[0, 100]}
          tickFormatter={(v: number) => `${v}%`}
        />
        <Tooltip
          formatter={(v) => {
            const n = typeof v === "number" ? v : Number(v);
            return [`${isNaN(n) ? "0" : n.toFixed(1)}%`, "Win rate"];
          }}
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 6,
            fontSize: 12,
            color: "hsl(var(--foreground))",
          }}
        />
        <Bar dataKey="win_rate" radius={[3, 3, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.type}
              fill={
                entry.win_rate >= 50
                  ? "hsl(142 76% 36%)"
                  : "hsl(0 84% 60%)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
