import { useState } from 'react'
import { Box, Typography, CircularProgress, Alert } from '@mui/material'
import { Layout } from '@/components/layout/Layout'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { ActionButtons } from '@/components/shared/ActionButtons'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Select } from '@/components/ui/Select'
import { ExportButton } from '@/components/shared/ExportButton'
import { EditUserModal, ConfirmDeleteModal } from '@/components/modals/UserDialogs'
import { useListUsersQuery, useDeleteUserMutation, useUpdateUserMutation } from '@/services/rtkApi'
import type { User } from '@/services/api'

const roleOptions = [
  { value: '', label: 'Роль' },
  { value: 'USER', label: 'Пользователь' },
  { value: 'ADMIN', label: 'Администратор' },
]

const statusOptions = [
  { value: '', label: 'Статус' },
  { value: 'true', label: 'Активные' },
  { value: 'false', label: 'Неактивные' },
]

export function Users() {
  const [page, setPage] = useState(0)
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation()
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const active = selectedStatus ? selectedStatus === 'true' : undefined
  const { data, isLoading, error } = useListUsersQuery({
    page,
    size: 20,
    active,
    role: selectedRole || undefined,
  })

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (active !== undefined) params.append('active', active.toString())
      if (selectedRole) params.append('role', selectedRole)

      const response = await fetch(
        `https://synamyk-production.up.railway.app/api/admin/users/export?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'text/csv, application/octet-stream',
          },
        }
      )
      if (!response.ok) throw new Error('Export failed')

      const blob = new Blob([await response.text()], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `users-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const handleEditClick = (user: User) => {
    setSelectedUser(user)
    setEditOpen(true)
  }

  const handleEdit = async (id: number, formData: Partial<User>) => {
    try {
      await updateUser({ id, data: formData }).unwrap()
      setEditOpen(false)
    } catch (err) {
      console.error('Failed to update user:', err)
    }
  }

  const handleDeleteClick = (id: number) => {
    setSelectedUserId(id)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedUserId) return
    try {
      await deleteUser(selectedUserId).unwrap()
      setDeleteOpen(false)
      setSelectedUserId(null)
    } catch (err) {
      console.error('Failed to delete user:', err)
    }
  }

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'fullName',
      header: 'Пользователь',
      render: row => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <UserAvatar name={row.fullName as string} size={36} />
          <Box>
            <Typography sx={{ fontWeight: 500, color: '#1e293b', fontSize: '14px' }}>
              {row.fullName as string}
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '12px' }}>
              {row.email as string}
            </Typography>
          </Box>
        </Box>
      ),
    },
    { key: 'phone', header: 'Телефон' },
    { key: 'regionName', header: 'Регион' },
    { key: 'role', header: 'Роль' },
    {
      key: 'registeredAt',
      header: 'Дата регистрации',
      render: row => new Date(row.registeredAt as string).toLocaleDateString('ru'),
    },
    {
      key: 'active',
      header: 'Статус',
      render: row => (
        <StatusBadge status={row.active ? 'active' : 'inactive'} />
      ),
    },
    {
      key: 'actions',
      header: 'Действия',
      width: '110px',
      render: (row) => (
        <ActionButtons
          isActive={row.active as boolean}
          onToggle={() => {}}
          onEdit={() => handleEditClick(row as User)}
          onDelete={() => handleDeleteClick(row.id as number)}
        />
      ),
    },
  ]

  return (
    <Layout searchPlaceholder="Поиск по имени, телефону, email" createLabel="Добавить пользователя">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Typography
          sx={{
            fontSize: '22px',
            fontWeight: 'bold',
            color: '#0f172a',
            letterSpacing: '-0.5px',
            mr: 'auto',
          }}
        >
          Пользователи
        </Typography>
        <Select
          options={roleOptions}
          defaultValue=""
          value={selectedRole}
          onChange={setSelectedRole}
        />
        <Select
          options={statusOptions}
          defaultValue=""
          value={selectedStatus}
          onChange={setSelectedStatus}
        />
        <ExportButton onClick={handleExport} />
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Ошибка загрузки пользователей</Alert>
      ) : (
        <DataTable
          columns={columns}
          data={(data?.content || []) as unknown as Record<string, unknown>[]}
          currentPage={page}
          totalPages={data?.totalPages || 1}
          onPageChange={setPage}
          keyField="id"
        />
      )}

      <EditUserModal open={editOpen} user={selectedUser || undefined} onClose={() => setEditOpen(false)} onSubmit={handleEdit} loading={isUpdating} />
      <ConfirmDeleteModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} loading={isDeleting} />
    </Layout>
  )
}
