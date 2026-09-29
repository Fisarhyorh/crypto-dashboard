const KEY = 'crypto-dashboard:favorites'

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function toggleFavorite(id: string): string[] {
  const current = getFavorites()
  const next = current.includes(id)
    ? current.filter((f) => f !== id)
    : [...current, id]
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}