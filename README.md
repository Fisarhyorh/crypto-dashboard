# Crypto Dashboard

A live cryptocurrency price dashboard with search, sorting, favorites, and per-coin price history — built to demonstrate handling real async state (loading, errors, retries) rather than just displaying data that's already there.

**Live demo:** _add your Vercel link here once deployed_

## Features

- **Live market data** — top 50 coins by market cap, auto-refreshing every 45 seconds
- **Loading skeletons** — placeholder rows shown on first load, not just a spinner
- **Error handling with retry** — a failed request shows a clear error and a retry button rather than a blank screen or a console error
- **Search** — filter by coin name or symbol
- **Sortable columns** — click Price or 24h to sort, click again to reverse direction
- **Favorites** — star coins to save them, persisted in the browser via localStorage, with a toggle to show favorites only
- **Price history chart** — click any coin for a 7-day price chart
- **Server-side API key handling** — CoinGecko requests are proxied through Next.js API routes so the API key is never exposed to the browser

## Tech stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Data:** CoinGecko API (Demo plan)

## Why these choices

CoinGecko's fully keyless public tier is aggressively rate-limited and, in practice, gets blocked outright by their CDN firewall for many requests. This project uses a free Demo API key instead, which is far more reliable — but an API key should never be called directly from the browser, since anyone can read it out of the network tab. So every CoinGecko request is proxied through a Next.js API route (`app/api/coins` and `app/api/coins/[id]/history`), which attaches the key server-side. The browser only ever talks to our own server, never to CoinGecko directly.

Favorites are stored in `localStorage` rather than a database, which is a deliberate scope choice for a project with no authentication — it means favorites are per-browser, not per-account, and won't follow a user across devices. A database-backed version would require adding auth, which was intentionally left out here since that's already demonstrated in a separate project.

## Running it locally

1. Clone the repo:
   ```
   git clone https://github.com/YOUR-USERNAME/crypto-dashboard.git
   cd crypto-dashboard
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Get a free Demo API key at [coingecko.com](https://www.coingecko.com) (Developer's Dashboard → create a new API key).

4. Create a `.env.local` file in the project root:
   ```
   COINGECKO_API_KEY=your_demo_api_key
   ```
   No `NEXT_PUBLIC_` prefix — this key stays server-side only.

5. Run the dev server:
   ```
   npm run dev
   ```
   Visit `http://localhost:3000`.

## Project structure

```
app/
  page.tsx                       — main dashboard: search, sort, favorites, table
  api/coins/route.ts              — proxies the top-50 coin list from CoinGecko
  api/coins/[id]/history/route.ts — proxies 7-day price history for one coin
components/
  CoinRowSkeleton.tsx              — loading placeholder rows
  CoinDetailModal.tsx              — price chart modal
lib/
  coingecko.ts                     — client-side fetch helpers
  favorites.ts                     — localStorage helpers for favorites
```

## Known limitations

- Favorites are per-browser (localStorage), not tied to a user account.
- CoinGecko's Demo plan has its own rate limits; heavy traffic on a deployed version could hit them faster than a single local user would.