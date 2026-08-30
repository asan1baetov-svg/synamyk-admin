import { useMemo, useState } from 'react'
import { ArrowUpDown } from 'lucide-react'
import { useTestsReportQuery } from '@/services'
import { usePeriod, PeriodPicker, PageHeader, StatCard } from '@/components/common'
import { Card, CardBody, Skeleton } from '@/components/ui'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatNumber, formatPercent } from '@/lib/format'
import type { TestReportRow } from '@/types/api'

type SortKey = keyof Pick<
  TestReportRow,
  'attempts' | 'completed' | 'distinctUsers' | 'avgPercent' | 'completionRate'
>

export function TestsReport() {
  useDocumentTitle('Отчёт по тестам')
  const period = usePeriod()
  const { data, isLoading } = useTestsReportQuery(period)
  const [sortKey, setSortKey] = useState<SortKey>('attempts')
  const [dir, setDir] = useState<'asc' | 'desc'>('desc')

  const rows = useMemo(() => {
    const list = [...(data?.rows ?? [])]
    list.sort((a, b) => {
      const av = a[sortKey] ?? -1
      const bv = b[sortKey] ?? -1
      return dir === 'asc' ? av - bv : bv - av
    })
    return list
  }, [data, sortKey, dir])

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(k)
      setDir('desc')
    }
  }

  const th = (k: SortKey, label: string) => (
    <button
      onClick={() => toggleSort(k)}
      className="inline-flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground hover:text-foreground"
    >
      {label} <ArrowUpDown size={11} />
    </button>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Отчёт по тестам"
        description="Попытки, завершения и средний результат"
        actions={<PeriodPicker />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="Всего попыток"
          value={formatNumber(data?.totalAttempts)}
          loading={isLoading}
        />
        <StatCard
          label="Завершено"
          value={formatNumber(data?.totalCompleted)}
          loading={isLoading}
        />
        <StatCard
          label="Доля завершений"
          value={
            data && data.totalAttempts
              ? formatPercent((data.totalCompleted / data.totalAttempts) * 100)
              : '—'
          }
          loading={isLoading}
        />
      </div>

      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2, 3].map(i => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50 text-left">
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
                      Тест / подтест
                    </th>
                    <th className="px-4 py-3">{th('attempts', 'Попытки')}</th>
                    <th className="px-4 py-3">{th('completed', 'Завершено')}</th>
                    <th className="px-4 py-3">{th('distinctUsers', 'Учеников')}</th>
                    <th className="px-4 py-3">{th('avgPercent', 'Ср. %')}</th>
                    <th className="px-4 py-3">{th('completionRate', 'Завершаемость')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr
                      key={`${r.testId}-${r.subTestId}`}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{r.testTitle}</div>
                        <div className="text-xs text-muted-foreground">{r.subTestTitle}</div>
                      </td>
                      <td className="px-4 py-3">{r.attempts}</td>
                      <td className="px-4 py-3">{r.completed}</td>
                      <td className="px-4 py-3">{r.distinctUsers}</td>
                      <td className="px-4 py-3">
                        <Bar value={r.avgPercent} />
                      </td>
                      <td className="px-4 py-3">
                        <Bar value={r.completionRate} />
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-sm text-muted-foreground"
                      >
                        Нет данных за период
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

function Bar({ value }: { value: number | null }) {
  if (value == null) return <span className="text-xs text-muted-foreground">—</span>
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 rounded-full bg-neutral-200">
        <div
          className="h-2 rounded-full bg-primary"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="text-xs">{Math.round(value)}%</span>
    </div>
  )
}
