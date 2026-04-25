import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPct(value: number | string | null, digits = 2): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  return `${(num * 100).toFixed(digits)}%`;
}

export function formatPrice(value: number | string | null): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  return num.toFixed(4);
}

export function formatPnl(value: number | string | null): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  const sign = num >= 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
}

export function formatDate(value: string): string {
  const d = new Date(value);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function signalTypeLabel(type: string): string {
  const map: Record<string, string> = {
    crypto: "Crypto",
    sports: "Sports",
    weather: "Weather",
  };
  return map[type.toLowerCase()] ?? type;
}

export function signalTypeColor(type: string): string {
  const map: Record<string, string> = {
    crypto: "bg-orange-100 text-orange-800",
    sports: "bg-blue-100 text-blue-800",
    weather: "bg-cyan-100 text-cyan-800",
  };
  return map[type.toLowerCase()] ?? "bg-gray-100 text-gray-800";
}
