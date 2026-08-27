import { useState } from 'react'
import { Box, CircularProgress, Alert } from '@mui/material'
import { Layout } from '@/components/layout/Layout'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { ActionButtons } from '@/components/shared/ActionButtons'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Select } from '@/components/ui/Select'
import { CreateNewsModal, EditNewsModal, ConfirmDeleteModal, StatusChangeModal } from '@/components/modals/NewsDialogs'
import {
  useListNewsQuery,
  useDeleteNewsMutation,
  useUpdateNewsStatusMutation,
  useCreateNewsMutation,
  useUpdateNewsMutation,
} from '@/services/rtkApi'
import type { News } from '@/services/api'

const typeOptions = [
  { value: '', label: 'Тип' },
  { value: 'news', label: 'Новость' },
  { value: 'announce', label: 'Анонс' },
]
const statusOptions = [
  { value: '', label: 'Статус' },
  { value: 'true', label: 'Опубликован' },
  { value: 'false', label: 'Черновик' },
]

export function News() {
  const [page, setPage] = useState(0)
  const { data, isLoading, error } = useListNewsQuery({ page, size: 20 })
  const [deleteNews, { isLoading: isDeleting }] = useDeleteNewsMutation()
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateNewsStatusMutation()
  const [createNews, { isLoading: isCreating }] = useCreateNewsMutation()
  const [updateNews, { isLoading: isUpdating }] = useUpdateNewsMutation()

  const [createOpen, setCreateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedNewsId, setSelectedNewsId] = useState<number | null>(null)
  const [selectedNews, setSelectedNews] = useState<News | null>(null)

  const handleDeleteClick = (id: number) => {
    setSelectedNewsId(id)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedNewsId) return
    try {
      await deleteNews(selectedNewsId).unwrap()
      setDeleteOpen(false)
      setSelectedNewsId(null)
    } catch (err) {
      console.error('Failed to delete news:', err)
    }
  }

  const handleStatusClick = (id: number, news: News) => {
    setSelectedNewsId(id)
    setSelectedNews(news)
    setStatusOpen(true)
  }

  const handleToggleStatus = async () => {
    if (!selectedNewsId) return
    try {
      await updateStatus(selectedNewsId).unwrap()
      setStatusOpen(false)
      setSelectedNewsId(null)
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const handleCreate = async (formData: Partial<News>) => {
    try {
      await createNews(formData).unwrap()
      setCreateOpen(false)
    } catch (err) {
      console.error('Failed to create news:', err)
    }
  }

  const handleEditClick = (news: News) => {
    setSelectedNews(news)
    setEditOpen(true)
  }

  const handleEdit = async (id: number, formData: Partial<News>) => {
    try {
      await updateNews({ id, data: formData }).unwrap()
      setEditOpen(false)
    } catch (err) {
      console.error('Failed to update news:', err)
    }
  }

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'title',
      header: 'Название',
      render: row => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <div style={{ fontSize: '20px' }}>📰</div>
          <span style={{ fontWeight: 500, color: '#1e293b' }}>{row.title as string}</span>
        </Box>
      ),
    },
    { key: 'type', header: 'Тип' },
    {
      key: 'viewCount',
      header: 'Просмотры',
      render: row => (row.viewCount as number).toLocaleString('ru'),
    },
    { key: 'authorName', header: 'Автор' },
    {
      key: 'publishedAt',
      header: 'Дата',
      render: row => new Date(row.publishedAt as string).toLocaleDateString('ru'),
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
          onToggle={() => handleStatusClick(row.id as number, row as News)}
          onEdit={() => handleEditClick(row as News)}
          onDelete={() => handleDeleteClick(row.id as number)}
        />
      ),
    },
  ]

  if (isLoading) {
    return (
      <Layout searchPlaceholder="Поиск по заголовку или тексту" createLabel="Создать пост">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout searchPlaceholder="Поиск по заголовку или тексту" createLabel="Создать пост">
        <Alert severity="error">Ошибка загрузки новостей</Alert>
      </Layout>
    )
  }

  return (
    <Layout
      searchPlaceholder="Поиск по заголовку или тексту"
      createLabel="Создать пост"
      onCreateClick={() => setCreateOpen(true)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', marginRight: 'auto' }}>
          Новости
        </h1>
        <Select options={typeOptions} defaultValue="" />
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

      <CreateNewsModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} loading={isCreating} />
      <EditNewsModal open={editOpen} news={selectedNews || undefined} onClose={() => setEditOpen(false)} onSubmit={handleEdit} loading={isUpdating} />
      <ConfirmDeleteModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} loading={isDeleting} />
      <StatusChangeModal
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        onConfirm={handleToggleStatus}
        currentStatus={selectedNews?.active}
        loading={isUpdatingStatus}
      />
    </Layout>
  )
}
