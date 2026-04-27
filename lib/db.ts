import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

const pool =
  global.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("railway")
      ? { rejectUnauthorized: false }
      : undefined,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") {
  global.pgPool = pool;
}

export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}

export type Signal = {
  id: number;
  signal_type: string;
  market_question: string;
  market_slug: string;
  event_slug: string | null;
  condition_id: string | null;
  direction: string;
  entry_price: string;
  implied_price: string;
  edge: string;
  current_price: string | null;
  resolved: boolean;
  outcome_won: boolean | null;
  pnl_pct: string | null;
  bot_version: string | null;
  created_at: string;
  updated_at: string;
};
