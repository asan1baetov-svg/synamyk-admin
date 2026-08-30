import { useSearchParams } from 'react-router-dom'
import type { ReportPeriod } from '@/types/api'
import type { PeriodArg } from '@/services/reportsApi'
import { cn } from '@/lib/utils'

const PRESETS: { value: ReportPeriod; label: string }[] = [
  { value: 'today', label: 'Сегодня' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' },
  { value: 'year', label: 'Год' },
  { value: 'all', label: 'Всё время' },
]

/** Reads/writes period|from|to in the URL, returns the resolved PeriodArg. */
export function usePeriod(): PeriodArg {
  const [params] = useSearchParams()
  const from = params.get('from') || undefined
  const to = params.get('to') || undefined
  if (from || to) return { from, to }
  const period = (params.get('period') as ReportPeriod) || 'month'
  return { period }
}

export function PeriodPicker() {
  const [params, setParams] = useSearchParams()
  const from = params.get('from') || ''
  const to = params.get('to') || ''
  const period = (params.get('period') as ReportPeriod) || 'month'
  const custom = Boolean(from || to)

  const setPreset = (p: ReportPeriod) => {
    setParams(
      prev => {
        const n = new URLSearchParams(prev)
        n.set('period', p)
        n.delete('from')
        n.delete('to')
        return n
      },
      { replace: true }
    )
  }

  const setRange = (key: 'from' | 'to', v: string) => {
    setParams(
      prev => {
        const n = new URLSearchParams(prev)
        if (v) n.set(key, v)
        else n.delete(key)
        n.delete('period')
        return n
      },
      { replace: true }
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex flex-wrap rounded-md border border-border bg-neutral-50 p-0.5">
        {PRESETS.map(p => (
          <button
            key={p.value}
            type="button"
            onClick={() => setPreset(p.value)}
            className={cn(
              'rounded px-2.5 py-1 text-xs font-medium transition-colors',
              !custom && period === p.value
                ? 'bg-white text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <input
          type="date"
          value={from}
          onChange={e => setRange('from', e.target.value)}
          className="h-8 rounded-md border border-border-input px-2 text-sm"
        />
        <span>—</span>
        <input
          type="date"
          value={to}
          onChange={e => setRange('to', e.target.value)}
          className="h-8 rounded-md border border-border-input px-2 text-sm"
        />
      </div>
    </div>
  )
}
