import { Link } from 'react-router-dom'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { Users, Activity, CheckCircle2, Wallet, Radar } from 'lucide-react'
import { useOverviewReportQuery, useActiveSessionsQuery } from '@/services'
import { usePeriod, PeriodPicker, PageHeader, StatCard } from '@/components/common'
import { Card, CardHeader, CardBody } from '@/components/ui'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatMoney, formatNumber } from '@/lib/format'

export function Dashboard() {
  useDocumentTitle('Сводка')
  const period = usePeriod()
  const { data, isLoading } = useOverviewReportQuery(period)
  const { data: sessions } = useActiveSessionsQuery(undefined, {
    pollingInterval: 10000,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Сводка"
        description="Ключевые показатели платформы"
        actions={<PeriodPicker />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Регистрации"
          value={formatNumber(data?.registrations)}
          icon={<Users size={16} />}
          loading={isLoading}
        />
        <StatCard
          label="Активные"
          value={formatNumber(data?.activeUsers)}
          icon={<Activity size={16} />}
          loading={isLoading}
        />
        <StatCard
          label="Сессий начато"
          value={formatNumber(data?.sessionsStarted)}
          icon={<Activity size={16} />}
          loading={isLoading}
        />
        <StatCard
          label="Сессий завершено"
          value={formatNumber(data?.sessionsCompleted)}
          icon={<CheckCircle2 size={16} />}
          loading={isLoading}
        />
        <StatCard
          label="Выручка"
          value={formatMoney(data?.revenue)}
          icon={<Wallet size={16} />}
          loading={isLoading}
        />
      </div>

      <Card>
        <CardHeader title="Динамика по месяцам" />
        <CardBody>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.byMonth ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="registrations" name="Регистрации" fill="#156ce6" />
                <Bar dataKey="sessionsStarted" name="Сессий начато" fill="#17a1e6" />
                <Bar dataKey="sessionsCompleted" name="Сессий завершено" fill="#4b993a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Сейчас проходят тест"
          description="Обновляется каждые 10 секунд"
          action={
            <Link
              to="/reports/active"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Radar size={14} /> Подробнее
            </Link>
          }
        />
        <CardBody>
          {!sessions || sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Сейчас никто не проходит тест.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {sessions.slice(0, 5).map(s => (
                <li key={s.sessionId} className="flex justify-between py-2">
                  <span>
                    {s.userName} · {s.testTitle} / {s.subTestTitle}
                  </span>
                  <span className="text-muted-foreground">
                    {s.currentIndex}/{s.totalQuestions}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
