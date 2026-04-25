"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function EdgeDistributionChart({
  data,
}: {
  data: { bucket: string; count: number }[];
}) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="bucket" tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" fill="hsl(222 47% 11%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
