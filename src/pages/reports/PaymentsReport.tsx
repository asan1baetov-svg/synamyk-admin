import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { usePaymentsReportQuery } from '@/services'
import { usePeriod, PeriodPicker, PageHeader, StatCard } from '@/components/common'
import { Card, CardHeader, CardBody } from '@/components/ui'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatMoney, formatNumber } from '@/lib/format'

const PIE_COLORS = ['#156ce6', '#17a1e6', '#4b993a', '#e6930b', '#d9211d', '#7a7a7a']

export function PaymentsReport() {
  useDocumentTitle('Отчёт по оплатам')
  const period = usePeriod()
  const { data, isLoading } = usePaymentsReportQuery(period)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Отчёт по оплатам"
        description="Выручка, статусы и разбивка по тестам"
        actions={<PeriodPicker />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Выручка" value={formatMoney(data?.totalRevenue)} loading={isLoading} />
        <StatCard
          label="Успешных оплат"
          value={formatNumber(data?.completedCount)}
          loading={isLoading}
        />
        <StatCard
          label="Средний чек"
          value={
            data && data.completedCount ? formatMoney(data.totalRevenue / data.completedCount) : '—'
          }
          loading={isLoading}
        />
      </div>

      <Card>
        <CardHeader title="Выручка по месяцам" description="По дате оплаты" />
        <CardBody>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.byMonth ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={((v: number) => formatMoney(v)) as never} />
                <Bar dataKey="revenue" name="Выручка" fill="#156ce6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="По тестам" description="По дате оплаты" />
          <CardBody>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.byTest ?? []}
                    dataKey="revenue"
                    nameKey="testTitle"
                    outerRadius={90}
                    label
                  >
                    {(data?.byTest ?? []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={((v: number) => formatMoney(v)) as never} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="По статусам" description="По дате создания платежа" />
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-neutral-50 text-left text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-2">Статус</th>
                  <th className="px-4 py-2">Кол-во</th>
                  <th className="px-4 py-2">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {(data?.byStatus ?? []).map(s => (
                  <tr key={s.status} className="border-b border-border last:border-0">
                    <td className="px-4 py-2">{s.status}</td>
                    <td className="px-4 py-2">{s.count}</td>
                    <td className="px-4 py-2">{formatMoney(s.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Источники дат различаются: статусы считаются по дате создания платежа, выручка и разбивки —
        по дате оплаты. На границах периода цифры могут не сходиться.
      </p>
    </div>
  )
}
