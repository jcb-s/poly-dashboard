"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { signalTypeLabel } from "@/lib/utils";

export function SignalsFilters({
  types,
  directions,
  versions,
}: {
  types: string[];
  directions: string[];
  versions: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`/signals?${params.toString()}`);
    },
    [router, searchParams]
  );

  const get = (key: string) => searchParams.get(key) ?? "";

  const status = get("status") || "all";

  const statusPills: { value: string; label: string; active: string; inactive: string }[] = [
    { value: "all", label: "All", active: "bg-foreground text-background", inactive: "border hover:bg-accent" },
    { value: "open", label: "Open", active: "bg-gray-600 text-white", inactive: "border hover:bg-accent" },
    { value: "won", label: "Won", active: "bg-green-600 text-white", inactive: "border hover:bg-accent" },
    { value: "lost", label: "Lost", active: "bg-red-600 text-white", inactive: "border hover:bg-accent" },
    { value: "resolved", label: "Resolved", active: "bg-gray-500 text-white", inactive: "border hover:bg-accent" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {statusPills.map((p) => (
          <button
            key={p.value}
            onClick={() => setParam("status", p.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              status === p.value ? p.active : p.inactive
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg border">
      <Select
        label="Type"
        value={get("type") || "all"}
        onChange={(v) => setParam("type", v)}
        options={[
          { value: "all", label: "All types" },
          ...types.map((t) => ({ value: t, label: signalTypeLabel(t) })),
        ]}
      />
      <Select
        label="Direction"
        value={get("direction") || "all"}
        onChange={(v) => setParam("direction", v)}
        options={[
          { value: "all", label: "All" },
          ...directions.map((d) => ({ value: d, label: d.toUpperCase() })),
        ]}
      />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Min edge %
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          defaultValue={get("min_edge")}
          placeholder="4"
          className="px-3 py-1.5 border rounded-md text-sm bg-background w-24"
          onBlur={(e) => setParam("min_edge", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              setParam("min_edge", (e.target as HTMLInputElement).value);
          }}
        />
      </div>
      {versions.length > 0 && (
        <Select
          label="Version"
          value={get("version") || "all"}
          onChange={(v) => setParam("version", v)}
          options={[
            { value: "all", label: "All versions" },
            ...versions.map((v) => ({ value: v, label: `v${v}` })),
          ]}
        />
      )}
      <Select
        label="Sort"
        value={get("sort") || "newest"}
        onChange={(v) => setParam("sort", v)}
        options={[
          { value: "newest", label: "Newest first" },
          { value: "oldest", label: "Oldest first" },
          { value: "edge_desc", label: "Edge (high→low)" },
          { value: "edge_asc", label: "Edge (low→high)" },
          { value: "pnl_desc", label: "P&L (high→low)" },
          { value: "pnl_asc", label: "P&L (low→high)" },
        ]}
      />
      {searchParams.toString() && (
        <button
          onClick={() => router.push("/signals")}
          className="self-end px-3 py-1.5 text-sm border rounded-md hover:bg-accent"
        >
          Clear
        </button>
      )}
    </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 border rounded-md text-sm bg-background"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
