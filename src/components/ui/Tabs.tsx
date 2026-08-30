import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface TabDef {
  value: string
  label: ReactNode
}

export function Tabs({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: TabDef[]
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  return (
    <div className={cn('flex gap-1 border-b border-border', className)}>
      {tabs.map(t => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={cn(
            '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
            value === t.value
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: ReactNode }[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div
      className={cn('inline-flex rounded-md border border-border bg-neutral-50 p-0.5', className)}
    >
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded px-3 py-1 text-sm font-medium transition-colors',
            value === o.value
              ? 'bg-white text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
