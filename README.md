# Poly Signal Dashboard

Web dashboard for the `poly-signal` Telegram bot. Reads from the same Railway Postgres database the bot writes to.

**3 pages:**
- **Overview** — stats, charts, recent signals
- **Signals** — full filterable/sortable table
- **Performance** — win rate and P&L by category

## Deploy to Railway (the way you'll actually do it)

You're going to put this code in a new GitHub repo, then add it as a second service in your existing Railway project so it can talk to your Postgres database privately.

### 1. Push this code to GitHub

Create a new repo on GitHub called `poly-dashboard`, then from this folder run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/jcb-s/poly-dashboard.git
git push -u origin main
```

### 2. Add it to your existing Railway project

1. Open your Railway project (the one with `poly-signal` and Postgres in it)
2. Click **+ New** → **GitHub Repo** → pick `poly-dashboard`
3. Railway will detect Next.js and start building automatically

### 3. Connect it to your database

In the new dashboard service, go to the **Variables** tab and add:

- **Variable name:** `DATABASE_URL`
- **Value:** click "Add Reference" and pick `Postgres.DATABASE_URL` (this uses Railway's private network — no public exposure)

### 4. Generate a public URL

In the dashboard service: **Settings** → **Networking** → **Generate Domain**.

You'll get a URL like `poly-dashboard-production.up.railway.app`. That's your dashboard.

## Run locally

```bash
npm install
echo 'DATABASE_URL=postgresql://...' > .env.local  # public URL from Railway
npm run dev
```

Open http://localhost:3000.

## Notes

- For win rate and P&L to populate, your bot needs to set `resolved`, `outcome_won`, and `pnl_pct` after markets settle. If those columns stay null, the dashboard still works for tracking which signals fired — those metrics just show as "—".
- The signals table caps at 200 rows to keep things fast. Use filters to narrow down.
