"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function SignalsOverTimeChart({
  data,
}: {
  data: { day: string; count: number }[];
}) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
        No data yet
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.day).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="hsl(222 47% 11%)"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
