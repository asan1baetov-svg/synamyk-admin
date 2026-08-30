import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { SchedulePayload } from '@/types/api'
import { Button, Badge } from '@/components/ui'
import { freeWindowLabel, toLocalInput, fromLocalInput } from '@/lib/schedule'

interface Props {
  freeFrom?: string | null
  freeUntil?: string | null
  saving?: boolean
  onSave: (payload: SchedulePayload) => Promise<void> | void
  compact?: boolean
}

/** "Бесплатный период": freeFrom / freeUntil editor with clear + validation. */
export function FreeWindowEditor({ freeFrom, freeUntil, saving, onSave, compact }: Props) {
  const [from, setFrom] = useState(toLocalInput(freeFrom))
  const [until, setUntil] = useState(toLocalInput(freeUntil))

  useEffect(() => {
    setFrom(toLocalInput(freeFrom))
    setUntil(toLocalInput(freeUntil))
  }, [freeFrom, freeUntil])

  const currentLabel = freeWindowLabel(freeFrom, freeUntil)
  const dirty = from !== toLocalInput(freeFrom) || until !== toLocalInput(freeUntil)

  const save = () => {
    if (from && until && new Date(until) <= new Date(from)) {
      toast.error('Дата окончания бесплатности должна быть позже даты начала')
      return
    }
    onSave({ freeFrom: fromLocalInput(from), freeUntil: fromLocalInput(until) })
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs text-muted-foreground">
          Бесплатно с
          <input
            type="datetime-local"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="mt-1 block h-9 rounded-md border border-border-input px-2 text-sm"
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Бесплатно до
          <input
            type="datetime-local"
            value={until}
            onChange={e => setUntil(e.target.value)}
            className="mt-1 block h-9 rounded-md border border-border-input px-2 text-sm"
          />
        </label>
        <Button size="sm" onClick={save} loading={saving} disabled={!dirty}>
          Сохранить
        </Button>
        {(from || until) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setFrom('')
              setUntil('')
              onSave({ freeFrom: null, freeUntil: null })
            }}
          >
            Очистить
          </Button>
        )}
      </div>
      {!compact && (
        <div className="text-xs text-muted-foreground">
          Текущее:{' '}
          {currentLabel ? <Badge tone="info">{currentLabel}</Badge> : <span>окно не задано</span>}
        </div>
      )}
    </div>
  )
}
