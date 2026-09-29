import { NextResponse } from 'next/server'

const API_BASE = 'https://api.coingecko.com/api/v3'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const apiKey = process.env.COINGECKO_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Server is missing COINGECKO_API_KEY' },
      { status: 500 }
    )
  }

  const url = `${API_BASE}/coins/${id}/market_chart?vs_currency=usd&days=7&interval=daily`

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