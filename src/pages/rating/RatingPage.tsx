import { useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'
import { useListRatingQuery, useResetRatingMutation, useListTestsQuery } from '@/services'
import type { RatingEntry } from '@/types/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useUrlParam, useUrlNumber } from '@/hooks/useUrlState'
import { extractErrorMessage } from '@/lib/errors'
import { PageHeader, DataTable, ConfirmDialog, UserAvatar } from '@/components/common'
import type { Column } from '@/components/common'
import { Select, Button } from '@/components/ui'
import { formatPhone } from '@/lib/format'

export function RatingPage() {
  useDocumentTitle('Рейтинг')
  const [testId, setTestId] = useUrlParam('testId')
  const [dateFrom, setDateFrom] = useUrlParam('dateFrom')
  const [dateTo, setDateTo] = useUrlParam('dateTo')
  const [page, setPage] = useUrlNumber('page', 0)
  const [dangerOpen, setDangerOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  const { data: tests } = useListTestsQuery({ size: 200 })
  const { data, isLoading, isFetching } = useListRatingQuery({
    page,
    size: 20,
    testId: testId ? Number(testId) : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  })
  const [resetRating, { isLoading: resetting }] = useResetRatingMutation()

  const columns: Column<RatingEntry>[] = [
    {
      key: 'rank',
      header: '#',
      width: '48px',
      render: r => <span className="font-semibold">{r.rank}</span>,
    },
    {
      key: 'user',
      header: 'Пользователь',
      render: r => (
        <div className="flex items-center gap-2">
          <UserAvatar name={r.fullName} src={r.avatarUrl} size={28} />
          <div>
            <div className="font-medium">{r.fullName}</div>
            <div className="text-xs text-muted-foreground">{formatPhone(r.phone)}</div>
          </div>
        </div>
      ),
    },
    { key: 'points', header: 'Баллы', render: r => r.totalPoints },
    { key: 'wins', header: 'Победы PvP', render: r => r.pvpWins },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Рейтинг" />

      <div className="flex flex-wrap items-center gap-2">
        <Select value={testId} onChange={e => setTestId(e.target.value)} className="w-56">
          <option value="">Все тесты</option>
          {tests?.content.map(t => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </Select>
        <input
          type="date"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          className="h-9 rounded-md border border-border-input px-2 text-sm"
        />
        <input
          type="date"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          className="h-9 rounded-md border border-border-input px-2 text-sm"
        />
      </div>

      <DataTable
        columns={columns}
        rows={data?.content}
        rowKey={r => r.userId}
        loading={isLoading || isFetching}
        page={page}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements}
        onPageChange={setPage}
      />

      <div className="rounded-lg border border-error/30 bg-error-soft/40">
        <button
          onClick={() => setDangerOpen(o => !o)}
          className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-error"
        >
          {dangerOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <AlertTriangle size={15} /> Опасная зона
        </button>
        {dangerOpen && (
          <div className="border-t border-error/20 px-4 py-4">
            <p className="mb-3 text-sm text-foreground">
              Сброс рейтинга <b>обнуляет заработанные баллы во всех завершённых сессиях</b>.
              Действие необратимо.
            </p>
            <Button variant="danger" onClick={() => setResetOpen(true)}>
              Сбросить рейтинг
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={async () => {
          try {
            await resetRating().unwrap()
            toast.success('Рейтинг сброшен')
            setResetOpen(false)
          } catch (err) {
            toast.error(extractErrorMessage(err))
          }
        }}
        title="Сбросить рейтинг?"
        description="Заработанные баллы во всех завершённых сессиях будут обнулены безвозвратно."
        confirmLabel="Сбросить"
        destructive
        confirmWord="СБРОСИТЬ"
        loading={resetting}
      />
    </div>
  )
}
