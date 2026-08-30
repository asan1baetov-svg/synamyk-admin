import { useEffect, useState } from 'react'
import { useActiveSessionsQuery } from '@/services'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PageHeader, DataTable, EmptyState } from '@/components/common'
import type { Column } from '@/components/common'
import type { ActiveSessionEntry } from '@/types/api'
import { formatDuration } from '@/lib/datetime'
import { formatPhone } from '@/lib/format'

export function ActiveSessionsPage() {
  useDocumentTitle('Сейчас проходят')
  const { data, isLoading, fulfilledTimeStamp } = useActiveSessionsQuery(undefined, {
    pollingInterval: 10000,
  })

  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const elapsed = fulfilledTimeStamp
    ? Math.max(0, Math.floor((now - fulfilledTimeStamp) / 1000))
    : 0

  const columns: Column<ActiveSessionEntry>[] = [
    {
      key: 'user',
      header: 'Ученик',
      render: s => (
        <div>
          <div className="font-medium">{s.userName}</div>
          <div className="text-xs text-muted-foreground">{formatPhone(s.userPhone)}</div>
        </div>
      ),
    },
    {
      key: 'test',
      header: 'Тест',
      render: s => (
        <div>
          <div>{s.testTitle}</div>
          <div className="text-xs text-muted-foreground">{s.subTestTitle}</div>
        </div>
      ),
    },
    {
      key: 'progress',
      header: 'Прогресс',
      render: s => {
        const pct = s.totalQuestions ? Math.round((s.currentIndex / s.totalQuestions) * 100) : 0
        return (
          <div className="w-40">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>
                {s.currentIndex}/{s.totalQuestions}
              </span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-neutral-200">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      },
    },
    {
      key: 'time',
      header: 'Осталось',
      render: s => {
        const remaining = s.remainingSeconds - elapsed
        return (
          <span className={remaining <= 60 ? 'font-semibold text-error' : 'text-foreground'}>
            {formatDuration(remaining)}
          </span>
        )
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Сейчас проходят тест"
        description="Автообновление каждые 10 секунд · таймер тикает на клиенте"
      />
      <DataTable
        columns={columns}
        rows={data}
        rowKey={s => s.sessionId}
        loading={isLoading}
        empty={<EmptyState title="Сейчас никто не проходит тест" />}
      />
    </div>
  )
}
