import { NextResponse } from 'next/server'

const API_BASE = 'https://api.coingecko.com/api/v3'

export async function GET() {
  const apiKey = process.env.COINGECKO_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Server is missing COINGECKO_API_KEY' },
      { status: 500 }
    )
  }

  const url = `${API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`

  const res = await fetch(url, {
    headers: { 'x-cg-demo-api-key': apiKey },
    cache: 'no-store',
  })

  if (!res.ok) {
    if (res.status === 429) {
      return NextResponse.json(
        { error: 'Rate limited by CoinGecko. Wait a moment and try again.' },
        { status: 429 }
      )
    }
    return NextResponse.json(
      { error: `CoinGecko request failed (${res.status})` },
      { status: res.status }
    )
  }

  const data = await res.json()
  return NextResponse.json(data)
}