'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Coin, PricePoint, fetchCoinHistory } from '@/lib/coingecko'

type Props = {
  coin: Coin
  onClose: () => void
}

export default function CoinDetailModal({ coin, onClose }: Props) {
  const [history, setHistory] = useState<PricePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchCoinHistory(coin.id)
      .then((data) => {
        if (!cancelled) setHistory(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load chart')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [coin.id])

  const isUp = (coin.price_change_percentage_24h ?? 0) >= 0

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-5 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-1">
          <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
          <div>
            <h2 className="font-display text-lg leading-tight">{coin.name}</h2>
            <p className="text-xs text-[var(--ink-soft)] uppercase">{coin.symbol}</p>
          </div>
          <span
            className={`ml-auto font-mono-num text-sm ${isUp ? 'text-[var(--up)]' : 'text-[var(--down)]'}`}
          >
            {isUp ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h ?? 0).toFixed(1)}%
          </span>
        </div>
        <p className="font-mono-num text-2xl mb-4">
          ${coin.current_price.toLocaleString()}
        </p>

        <div className="h-48">
          {loading ? (
            <div className="h-full flex items-center justify-center text-sm text-[var(--ink-soft)]">
              Loading chart…
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center text-sm text-[var(--down)] text-center px-4">
              {error}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'var(--ink-soft)' }}
                  axisLine={{ stroke: 'var(--line)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--ink-soft)' }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: 'var(--ink-soft)' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={isUp ? 'var(--up)' : 'var(--down)'}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full text-sm py-2 rounded-md border border-[var(--line)] text-[var(--ink-soft)] hover:text-[var(--ink)] hover:border-[var(--ink-soft)] transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}