import { useState } from 'react'
import { Box, Typography, CircularProgress, Alert } from '@mui/material'
import { Layout } from '@/components/layout/Layout'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { ActionButtons } from '@/components/shared/ActionButtons'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Select } from '@/components/ui/Select'
import { CreateTestModal, EditTestModal, ConfirmDeleteModal } from '@/components/modals/TestDialogs'
import { useListTestsQuery, useDeleteTestMutation, useCreateTestMutation, useUpdateTestMutation } from '@/services/rtkApi'
import type { Test } from '@/services/api'

const statusOptions = [
  { value: '', label: 'Статус' },
  { value: 'true', label: 'Активные' },
  { value: 'false', label: 'Неактивные' },
]

export function Tests() {
  const [page, setPage] = useState(0)
  const { data, isLoading, error } = useListTestsQuery({ page, size: 20 })
  const [deleteTest, { isLoading: isDeleting }] = useDeleteTestMutation()
  const [createTest, { isLoading: isCreating }] = useCreateTestMutation()
  const [updateTest, { isLoading: isUpdating }] = useUpdateTestMutation()

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null)
  const [selectedTest, setSelectedTest] = useState<Test | null>(null)

  const handleDeleteClick = (id: number) => {
    setSelectedTestId(id)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedTestId) return
    try {
      await deleteTest(selectedTestId).unwrap()
      setDeleteOpen(false)
      setSelectedTestId(null)
    } catch (err) {
      console.error('Failed to delete test:', err)
    }
  }

  const handleCreate = async (formData: Partial<Test>) => {
    try {
      await createTest(formData).unwrap()
      setCreateOpen(false)
    } catch (err) {
      console.error('Failed to create test:', err)
    }
  }

  const handleEditClick = (test: Test) => {
    setSelectedTest(test)
    setEditOpen(true)
  }

  const handleEdit = async (id: number, formData: Partial<Test>) => {
    try {
      await updateTest({ id, data: formData }).unwrap()
      setEditOpen(false)
    } catch (err) {
      console.error('Failed to update test:', err)
    }
  }

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'title',
      header: 'Название',
      render: row => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <UserAvatar name={(row.title as string) || ''} size={36} />
          <Box>
            <Typography sx={{ fontWeight: 500, color: '#1e293b', fontSize: '14px' }}>
              {row.title as string}
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '12px' }}>
              {row.subject as string}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: 'questionCount',
      header: 'Вопросы',
    },
    {
      key: 'attemptsCount',
      header: 'Попытки',
    },
    {
      key: 'price',
      header: 'Цена',
      render: row => `${row.price} сом`,
    },
    {
      key: 'createdAt',
      header: 'Дата создания',
      render: row => new Date(row.createdAt as string).toLocaleDateString('ru'),
    },
    {
      key: 'active',
      header: 'Статус',
      render: row => <StatusBadge status={(row.active as boolean) ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      header: 'Действия',
      width: '110px',
      render: row => (
        <ActionButtons
          isActive={(row.active as boolean) || false}
          onToggle={() => {}}
          onEdit={() => handleEditClick(row as Test)}
          onDelete={() => handleDeleteClick(row.id as number)}
        />
      ),
    },
  ]

  if (isLoading) {
    return (
      <Layout searchPlaceholder="Поиск по названию теста" createLabel="Создать тест">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout searchPlaceholder="Поиск по названию теста" createLabel="Создать тест">
        <Alert severity="error">Ошибка загрузки тестов</Alert>
      </Layout>
    )
  }

  return (
    <Layout
      searchPlaceholder="Поиск по названию теста"
      createLabel="Создать тест"
      onCreateClick={() => setCreateOpen(true)}
    >
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
          Тесты
        </Typography>
        <Select options={statusOptions} defaultValue="" />
      </Box>
      <DataTable
        columns={columns}
        data={(data?.content || []) as unknown as Record<string, unknown>[]}
        currentPage={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
        keyField="id"
      />

      <CreateTestModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} loading={isCreating} />
      <EditTestModal open={editOpen} test={selectedTest || undefined} onClose={() => setEditOpen(false)} onSubmit={handleEdit} loading={isUpdating} />
      <ConfirmDeleteModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} loading={isDeleting} />
    </Layout>
  )
}
