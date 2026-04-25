import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, ListFilter, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Poly Signal Dashboard",
  description: "Polymarket edge signals dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex">
          <aside className="w-60 border-r bg-muted/30 p-4 flex flex-col gap-1">
            <div className="px-3 py-4 mb-2">
              <h1 className="text-lg font-semibold">Poly Signal</h1>
              <p className="text-xs text-muted-foreground">
                Edge dashboard
              </p>
            </div>
            <NavLink href="/" icon={<LayoutDashboard size={16} />}>
              Overview
            </NavLink>
            <NavLink href="/signals" icon={<ListFilter size={16} />}>
              Signals
            </NavLink>
            <NavLink href="/performance" icon={<TrendingUp size={16} />}>
              Performance
            </NavLink>
          </aside>
          <main className="flex-1 p-8 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
    >
      {icon}
      {children}
    </Link>
  );
}
