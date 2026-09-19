import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useListPaymentsQuery,
  useSetPaymentStatusMutation,
  useDeletePaymentMutation,
  exportPayments,
} from '@/services'
import type { AdminPayment, PaymentStatus } from '@/types/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useUrlParam, useUrlNumber } from '@/hooks/useUrlState'
import { extractErrorMessage } from '@/lib/errors'
import { downloadBlob } from '@/lib/download'
import { PageHeader, DataTable, SearchInput, ConfirmDialog, UserAvatar } from '@/components/common'
import type { Column } from '@/components/common'
import { Button, Select, Badge, Dialog } from '@/components/ui'
import { formatDT } from '@/lib/datetime'
import { formatMoney, formatPhone } from '@/lib/format'

const STATUS_TONE: Record<PaymentStatus, 'success' | 'warning' | 'neutral' | 'error'> = {
  COMPLETED: 'success',
  PENDING: 'warning',
  EXPIRED: 'neutral',
  CANCELLED: 'error',
}

export function PaymentsPage() {
  useDocumentTitle('Платежи')
  const [search, setSearch] = useUrlParam('search')
  const [status, setStatus] = useUrlParam('status', 'COMPLETED')
  const [dateFrom, setDateFrom] = useUrlParam('dateFrom')
  const [dateTo, setDateTo] = useUrlParam('dateTo')
  const [page, setPage] = useUrlNumber('page', 0)

  const [detail, setDetail] = useState<AdminPayment | null>(null)
  const [toDelete, setToDelete] = useState<AdminPayment | null>(null)
  const [exporting, setExporting] = useState(false)

  const filters = {
    search: search || undefined,
    status: (status || undefined) as PaymentStatus | undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }
  const { data, isLoading, isFetching } = useListPaymentsQuery({ page, size: 20, ...filters })
  const [setPaymentStatus, { isLoading: patching }] = useSetPaymentStatusMutation()
  const [deletePayment, { isLoading: deleting }] = useDeletePaymentMutation()

  const doExport = async (format: 'csv' | 'excel') => {
    setExporting(true)
    try {
      const blob = await exportPayments(format, filters)
      downloadBlob(
        blob,
        `payments-${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xlsx' : 'csv'}`
      )
    } catch {
      toast.error('Не удалось экспортировать')
    } finally {
      setExporting(false)
    }
  }

  const columns: Column<AdminPayment>[] = [
    { key: 'txn', header: 'Транзакция', render: p => p.transactionId },
    {
      key: 'user',
      header: 'Пользователь',
      render: p => (
        <div className="flex items-center gap-2">
          <UserAvatar name={p.user.fullName} src={p.user.avatarUrl} size={28} />
          <div>
            <div className="font-medium">{p.user.fullName}</div>
            <div className="text-xs text-muted-foreground">{formatPhone(p.user.phone)}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'test',
      header: 'Тест / продукт',
      render: p => p.testTitle,
    },
    { key: 'amount', header: 'Сумма', render: p => formatMoney(p.amount) },
    { key: 'method', header: 'Метод', render: p => p.paymentMethod },
    {
      key: 'status',
      header: 'Статус',
      render: p => <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>,
    },
    { key: 'date', header: 'Дата', render: p => formatDT(p.date) },
  ]

  return (
    <div>
      <PageHeader
        title="Платежи"
        description="Finik-транзакции. Изменение статуса и удаление НЕ управляют доступом к тесту."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => doExport('csv')} loading={exporting}>
              <Download size={14} /> CSV
            </Button>
            <Button variant="secondary" onClick={() => doExport('excel')} loading={exporting}>
              <Download size={14} /> Excel
            </Button>
          </div>
        }
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Транзакция, имя…" />
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-40">
          <option value="">Все статусы</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="PENDING">PENDING</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="CANCELLED">CANCELLED</option>
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
        rowKey={p => p.id}
        loading={isLoading || isFetching}
        onRowClick={p => setDetail(p)}
        page={page}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements}
        onPageChange={setPage}
      />

      {/* detail */}
      <Dialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={`Платёж ${detail?.transactionId ?? ''}`}
        size="md"
        footer={
          detail && (
            <>
              <Button
                variant="danger"
                onClick={() => {
                  setToDelete(detail)
                  setDetail(null)
                }}
              >
                <Trash2 size={14} /> Удалить
              </Button>
              <span className="flex-1" />
              <Select
                value={detail.status}
                onChange={async e => {
                  try {
                    await setPaymentStatus({
                      id: detail.id,
                      status: e.target.value as PaymentStatus,
                    }).unwrap()
                    toast.success('Статус изменён (доступ к тесту не выдан)')
                    setDetail(null)
                  } catch (err) {
                    toast.error(extractErrorMessage(err))
                  }
                }}
                disabled={patching}
                className="w-44"
              >
                <option value="PENDING">PENDING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="CANCELLED">CANCELLED</option>
              </Select>
            </>
          )
        }
      >
        {detail && (
          <div className="space-y-2 text-sm">
            <Row
              label="Пользователь"
              value={`${detail.user.fullName} · ${formatPhone(detail.user.phone)}`}
            />
            <Row label="Тест / продукт" value={detail.testTitle} />
            <Row label="Сумма" value={formatMoney(detail.amount)} />
            <Row label="Метод" value={detail.paymentMethod} />
            <Row label="Статус" value={detail.status} />
            <Row label="Дата" value={formatDT(detail.date)} />
            <Row label="Начислено баллов" value={String(detail.earnedPoints)} />
            <div className="mt-3 rounded-md bg-info-soft px-3 py-2 text-xs text-info">
              Чтобы реально открыть тест пользователю, выдайте доступ на странице{' '}
              <Link to="/access" className="underline">
                Доступы к тестам
              </Link>
              .
            </div>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return
          try {
            await deletePayment(toDelete.id).unwrap()
            toast.success('Платёж удалён')
          } catch (err) {
            toast.error(extractErrorMessage(err))
          } finally {
            setToDelete(null)
          }
        }}
        title="Удалить платёж безвозвратно?"
        description="Запись платежа будет удалена без возможности восстановления. Доступ к тесту при этом НЕ отзывается — управляйте им на странице «Доступы к тестам»."
        confirmLabel="Удалить"
        destructive
        loading={deleting}
      />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}
