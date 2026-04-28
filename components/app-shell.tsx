"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  ListFilter,
  TrendingUp,
  Wallet,
  GitCompare,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/signals", label: "Signals", icon: ListFilter },
  { href: "/performance", label: "Performance", icon: TrendingUp },
  { href: "/wallets", label: "Wallets", icon: Wallet },
  { href: "/versions", label: "Versions", icon: GitCompare },
];

const VERSION_OPTIONS = [
  { value: "2.0.0", label: "v2.0.0" },
  { value: "1.0.0", label: "v1.0.0" },
  { value: "lifetime", label: "Lifetime" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);

  const version = searchParams.get("version") ?? "2.0.0";

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark =
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDark = useCallback(() => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [dark]);

  const versionedHref = useCallback(
    (path: string) => {
      if (version === "2.0.0") return path;
      const qs = `?version=${version}`;
      return `${path}${qs}`;
    },
    [version]
  );

  const handleVersionChange = useCallback(
    (v: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (v === "2.0.0") {
        params.delete("version");
      } else {
        params.set("version", v);
      }
      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
    },
    [pathname, router, searchParams]
  );

  const sidebar = (
    <nav className="flex flex-col gap-1 flex-1">
      <div className="px-3 py-4 mb-2">
        <h1 className="text-lg font-semibold">DUB</h1>
        <p className="text-xs text-muted-foreground">Trading bot dashboard</p>
      </div>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={versionedHref(href)}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
              active ? "bg-accent font-medium" : "hover:bg-accent/60"
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 border-r bg-muted/30 p-4 flex-col shrink-0">
        {sidebar}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 border-r bg-background p-4 flex flex-col transition-transform duration-200 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="self-end mb-2 p-1 rounded hover:bg-accent/60"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={16} />
        </button>
        {sidebar}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-12 border-b flex items-center gap-3 px-4 bg-background/80 backdrop-blur sticky top-0 z-30">
          <button
            className="md:hidden p-1 rounded hover:bg-accent/60"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={16} />
          </button>
          <span className="md:hidden font-semibold text-sm">DUB</span>

          <div className="flex-1" />

          <select
            value={version}
            onChange={(e) => handleVersionChange(e.target.value)}
            className="text-xs rounded border border-border bg-background px-2 py-1 focus:outline-none focus:ring-1 focus:ring-border text-foreground"
          >
            {VERSION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <button
            onClick={toggleDark}
            className="p-1.5 rounded hover:bg-accent/60 transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
