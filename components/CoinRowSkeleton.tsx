export default function CoinRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 animate-pulse">
      <div className="w-7 h-7 rounded-full bg-[var(--line)]" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-28 bg-[var(--line)] rounded" />
        <div className="h-2 w-10 bg-[var(--line)] rounded" />
      </div>
      <div className="h-3 w-20 bg-[var(--line)] rounded" />
      <div className="h-3 w-14 bg-[var(--line)] rounded" />
    </div>
  )
}