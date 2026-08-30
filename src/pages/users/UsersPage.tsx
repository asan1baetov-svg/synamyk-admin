import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Pencil, UserX } from 'lucide-react'
import { toast } from 'sonner'
import { useListUsersQuery, useDeleteUserMutation, exportUsersCsv } from '@/services'
import type { AdminUser, Role } from '@/types/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useUrlParam, useUrlNumber } from '@/hooks/useUrlState'
import { extractErrorMessage } from '@/lib/errors'
import { downloadBlob } from '@/lib/download'
import { PageHeader, DataTable, SearchInput, ConfirmDialog, UserAvatar } from '@/components/common'
import type { Column } from '@/components/common'
import { Button, Select, Badge } from '@/components/ui'
import { formatDate } from '@/lib/datetime'
import { formatPhone } from '@/lib/format'
import { UserFormDialog } from './UserFormDialog'

export function UsersPage() {
  useDocumentTitle('Пользователи')
  const navigate = useNavigate()
  const [search, setSearch] = useUrlParam('search')
  const [status, setStatus] = useUrlParam('status', 'all')
  const [role, setRole] = useUrlParam('role')
  const [dateFrom, setDateFrom] = useUrlParam('dateFrom')
  const [dateTo, setDateTo] = useUrlParam('dateTo')
  const [page, setPage] = useUrlNumber('page', 0)

  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [deactivate, setDeactivate] = useState<AdminUser | null>(null)
  const [exporting, setExporting] = useState(false)

  const filters = {
    search: search || undefined,
    active: status === 'all' ? undefined : status === 'active',
    role: (role || undefined) as Role | undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }

  const { data, isLoading, isFetching } = useListUsersQuery({ page, size: 20, ...filters })
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation()

  const doExport = async () => {
    setExporting(true)
    try {
      const blob = await exportUsersCsv(filters)
      downloadBlob(blob, `users-${new Date().toISOString().slice(0, 10)}.csv`)
    } catch {
      toast.error('Не удалось экспортировать')
    } finally {
      setExporting(false)
    }
  }

  const columns: Column<AdminUser>[] = [
    {
      key: 'user',
      header: 'Пользователь',
      render: u => (
        <div className="flex items-center gap-2">
          <UserAvatar name={u.fullName} src={u.avatarUrl} size={32} />
          <div>
            <div className="font-medium">{u.fullName}</div>
            <div className="text-xs text-muted-foreground">{formatPhone(u.phone)}</div>
          </div>
        </div>
      ),
    },
    { key: 'region', header: 'Регион', render: u => u.regionName || '—' },
    {
      key: 'role',
      header: 'Роль',
      render: u =>
        u.role === 'ADMIN' ? (
          <Badge tone="primary">ADMIN</Badge>
        ) : (
          <Badge tone="neutral">USER</Badge>
        ),
    },
    { key: 'score', header: 'Баллы', render: u => u.totalScore },
    {
      key: 'status',
      header: 'Статус',
      render: u =>
        u.active ? <Badge tone="success">Активен</Badge> : <Badge tone="neutral">Отключён</Badge>,
    },
    {
      key: 'registered',
      header: 'Регистрация',
      render: u => formatDate(u.registeredAt),
    },
    {
      key: 'actions',
      header: '',
      render: u => (
        <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
          <Button size="sm" variant="ghost" onClick={() => setEditUser(u)}>
            <Pencil size={14} />
          </Button>
          {u.active && (
            <Button size="sm" variant="ghost" onClick={() => setDeactivate(u)}>
              <UserX size={14} />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Пользователи"
        actions={
          <Button variant="secondary" onClick={doExport} loading={exporting}>
            <Download size={14} /> Экспорт CSV
          </Button>
        }
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Имя или телефон…" />
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-36">
          <option value="all">Все</option>
          <option value="active">Активные</option>
          <option value="inactive">Отключённые</option>
        </Select>
        <Select value={role} onChange={e => setRole(e.target.value)} className="w-32">
          <option value="">Все роли</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
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
        rowKey={u => u.id}
        loading={isLoading || isFetching}
        onRowClick={u => navigate(`/users/${u.id}`)}
        page={page}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements}
        onPageChange={setPage}
      />

      <UserFormDialog open={Boolean(editUser)} onClose={() => setEditUser(null)} user={editUser} />

      <ConfirmDialog
        open={Boolean(deactivate)}
        onClose={() => setDeactivate(null)}
        onConfirm={async () => {
          if (!deactivate) return
          try {
            await deleteUser(deactivate.id).unwrap()
            toast.success('Пользователь отключён')
          } catch (err) {
            toast.error(extractErrorMessage(err))
          } finally {
            setDeactivate(null)
          }
        }}
        title="Отключить пользователя?"
        description={`${deactivate?.fullName} потеряет доступ к приложению. Данные сохранятся.`}
        confirmLabel="Отключить"
        destructive
        loading={deleting}
      />
    </div>
  )
}
