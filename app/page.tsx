'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { fetchTopCoins, Coin } from '@/lib/coingecko'
import { getFavorites, toggleFavorite } from '@/lib/favorites'
import CoinRowSkeleton from '@/components/CoinRowSkeleton'
import CoinDetailModal from '@/components/CoinDetailModal'

const REFRESH_INTERVAL_MS = 45_000

type SortKey = 'market_cap' | 'current_price' | 'price_change_percentage_24h'

function formatPrice(n: number) {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: n < 1 ? 4 : 2,
    maximumFractionDigits: n < 1 ? 4 : 2,
  })
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
  className = '',
}: {
  label: string
  active: boolean
  dir: 'asc' | 'desc'
  onClick: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 hover:text-[var(--ink)] transition-colors ${
        active ? 'text-[var(--ink)]' : 'text-[var(--ink-soft)]'
      } ${className}`}
    >
      {label}
      {active && <span className="text-[10px]">{dir === 'desc' ? '▼' : '▲'}</span>}
    </button>
  )
}

export default function DashboardPage() {
  const [coins, setCoins] = useState<Coin[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('market_cap')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null)

  useEffect(() => {
    setFavorites(getFavorites())
  }, [])

  const loadCoins = useCallback(async () => {
    try {
      const data = await fetchTopCoins()
      setCoins(data)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setInitialLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCoins()
    const interval = setInterval(loadCoins, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [loadCoins])

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  function handleToggleFavorite(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setFavorites(toggleFavorite(id))
  }

  const visibleCoins = useMemo(() => {
    let list = coins

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
      )
    }

    if (showFavoritesOnly) {
      list = list.filter((c) => favorites.includes(c.id))
    }

    const sorted = [...list].sort((a, b) => {
      const av = a[sortKey] ?? 0
      const bv = b[sortKey] ?? 0
      return sortDir === 'desc' ? bv - av : av - bv
    })

    return sorted
  }, [coins, query, showFavoritesOnly, favorites, sortKey, sortDir])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-baseline justify-between mb-6">
          <h1 className="font-display text-2xl">Crypto Dashboard</h1>
          {lastUpdated && (
            <p className="text-xs text-[var(--ink-soft)] font-mono-num">
              Updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Search coins…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 min-w-[160px] bg-[var(--surface)] border border-[var(--line)] rounded-md px-3 py-2 text-sm placeholder:text-[var(--ink-soft)] focus:outline-none focus:border-[var(--ink-soft)]"
          />
          <button
            onClick={() => setShowFavoritesOnly((v) => !v)}
            className={`text-sm px-3 py-2 rounded-md border transition-colors ${
              showFavoritesOnly
                ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10'
                : 'border-[var(--line)] text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            ★ Favorites
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-[var(--surface)] border border-[var(--down)]/40 rounded-md flex items-center justify-between gap-4">
            <p className="text-sm text-[var(--down)]">{error}</p>
            <button
              onClick={loadCoins}
              className="text-sm px-3 py-1.5 rounded-md bg-[var(--down)] text-black shrink-0 font-medium"
            >
              Retry
            </button>
          </div>
        )}

        <div className="border border-[var(--line)] rounded-md overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-2 text-xs bg-[var(--surface)] border-b border-[var(--line)]">
            <div className="w-7" />
            <div className="flex-1">Coin</div>
            <SortHeader
              label="Price"
              active={sortKey === 'current_price'}
              dir={sortDir}
              onClick={() => handleSort('current_price')}
              className="w-24 justify-end"
            />
            <SortHeader
              label="24h"
              active={sortKey === 'price_change_percentage_24h'}
              dir={sortDir}
              onClick={() => handleSort('price_change_percentage_24h')}
              className="w-16 justify-end"
            />
          </div>

          {initialLoading ? (
            Array.from({ length: 8 }).map((_, i) => <CoinRowSkeleton key={i} />)
          ) : visibleCoins.length === 0 && !error ? (
            <div className="p-8 text-center text-sm text-[var(--ink-soft)]">
              {query || showFavoritesOnly ? 'No coins match.' : 'No data available'}
            </div>
          ) : (
            visibleCoins.map((coin) => {
              const change = coin.price_change_percentage_24h
              const isUp = (change ?? 0) >= 0
              const isFav = favorites.includes(coin.id)
              return (
                <div
                  key={coin.id}
                  onClick={() => setSelectedCoin(coin)}
                  className="flex items-center gap-4 px-4 py-3 border-b border-[var(--line)] last:border-b-0 cursor-pointer hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <button
                    onClick={(e) => handleToggleFavorite(coin.id, e)}
                    className={`w-7 text-lg leading-none ${
                      isFav ? 'text-yellow-500' : 'text-[var(--line)] hover:text-[var(--ink-soft)]'
                    }`}
                  >
                    ★
                  </button>
                  <img src={coin.image} alt={coin.name} className="w-7 h-7 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{coin.name}</p>
                    <p className="text-xs text-[var(--ink-soft)] uppercase">{coin.symbol}</p>
                  </div>
                  <div className="w-24 text-right text-sm font-mono-num">
                    {formatPrice(coin.current_price)}
                  </div>
                  <div
                    className={`w-16 text-right text-sm font-mono-num ${
                      isUp ? 'text-[var(--up)]' : 'text-[var(--down)]'
                    }`}
                  >
                    {change !== null
                      ? `${isUp ? '▲' : '▼'} ${Math.abs(change).toFixed(1)}%`
                      : '—'}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <p className="mt-4 text-xs text-[var(--ink-soft)]">
          Data from CoinGecko · refreshes every 45 seconds · click a coin for its 7-day chart
        </p>
      </div>

      {selectedCoin && (
        <CoinDetailModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} />
      )}
    </div>
  )
}