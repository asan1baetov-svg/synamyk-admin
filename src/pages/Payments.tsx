import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { ActionButtons } from '@/components/shared/ActionButtons'
import { ExportButton } from '@/components/shared/ExportButton'
import { Select } from '@/components/ui/Select'
import { UserAvatar } from '@/components/shared/UserAvatar'

interface Payment {
  id: number
  txId: string
  user: string
  amount: string
  method: string
  date: string
  score: number
}

const mockPayments: Payment[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  txId: '12345678',
  user: 'Даниар Р.',
  amount: '0700 700 700',
  method: 'synamyk@gmail.com',
  date: '23.03.2026',
  score: 657,
}))

const periodOptions = [
  { value: '', label: 'Период' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
]
const typeOptions = [
  { value: '', label: 'Тип' },
  { value: 'finik', label: 'Finik' },
  { value: 'card', label: 'Карта' },
]

export function Payments() {
  const [page, setPage] = useState(1)

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'txId', header: 'ID транзакции' },
    {
      key: 'user',
      header: 'Пользователь',
      render: row => (
        <div className="flex items-center gap-2.5">
          <UserAvatar name={row.user as string} />
          <span className="font-medium text-[#1e293b]">{row.user as string}</span>
        </div>
      ),
    },
    { key: 'amount', header: 'Сумма' },
    { key: 'method', header: 'Способ оплаты' },
    { key: 'date', header: 'Дата' },
    { key: 'score', header: 'Балл' },
    {
      key: 'actions',
      header: 'Действия',
      width: '110px',
      render: () => <ActionButtons onToggle={() => {}} onEdit={() => {}} onDelete={() => {}} />,
    },
  ]

  return (
    <Layout searchPlaceholder="По ID транзакции / пользователю / телефону">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <h1 className="text-[22px] font-bold text-[#0f172a] tracking-tight mr-auto">Платежи (Finik)</h1>
        <Select options={periodOptions} defaultValue="" />
        <Select options={typeOptions} defaultValue="" />
        <ExportButton />
      </div>
      <DataTable
        columns={columns}
        data={mockPayments as unknown as Record<string, unknown>[]}
        currentPage={page}
        totalPages={20}
        onPageChange={setPage}
        keyField="id"
      />
    </Layout>
  )
}
