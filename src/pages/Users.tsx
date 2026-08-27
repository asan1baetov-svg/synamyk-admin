import { useState } from 'react'
import { Box, Typography, CircularProgress, Alert } from '@mui/material'
import { Layout } from '@/components/layout/Layout'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { ActionButtons } from '@/components/shared/ActionButtons'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Select } from '@/components/ui/Select'
import { ExportButton } from '@/components/shared/ExportButton'
import { useListUsersQuery, useDeleteUserMutation, useExportUsersQuery } from '@/services/rtkApi'
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
  const [deleteUser] = useDeleteUserMutation()

  const active = selectedStatus ? selectedStatus === 'true' : undefined
  const { data, isLoading, error } = useListUsersQuery({
    page,
    size: 20,
    active,
    role: selectedRole || undefined,
  })
  const { data: exportData } = useExportUsersQuery({ active, role: selectedRole || undefined })

  const handleExport = () => {
    if (exportData instanceof Blob) {
      const url = window.URL.createObjectURL(exportData)
      const a = document.createElement('a')
      a.href = url
      a.download = 'users.csv'
      a.click()
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id).unwrap()
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
          onEdit={() => {}}
          onDelete={() => handleDelete(row.id as number)}
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
    </Layout>
  )
}
