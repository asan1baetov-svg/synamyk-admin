import type { ReactNode } from 'react'
import { Skeleton } from '@/components/ui'

export function StatCard({
  label,
  value,
  hint,
  icon,
  loading,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: ReactNode
  loading?: boolean
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {icon && <span className="text-neutral-300">{icon}</span>}
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-24" />
      ) : (
        <div className="mt-1 text-2xl font-bold text-foreground-strong">{value}</div>
      )}
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  )
}
