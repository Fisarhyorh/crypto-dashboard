export type Coin = {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  price_change_percentage_24h: number | null
}

export type PricePoint = { date: string; price: number }

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Request failed (${res.status})`)
  }
  return res.json()
}

export function fetchTopCoins(): Promise<Coin[]> {
  return fetchJSON<Coin[]>('/api/coins')
}

export async function fetchCoinHistory(id: string): Promise<PricePoint[]> {
  const data = await fetchJSON<{ prices: [number, number][] }>(
    `/api/coins/${id}/history`
  )
  return data.prices.map(([timestamp, price]) => ({
    date: new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    price,
  }))
}