import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { ActionButtons } from '@/components/shared/ActionButtons'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Select } from '@/components/ui/Select'
import { CreateVideoModal, ConfirmDeleteModal, StatusChangeModal, EditVideoModal } from '@/components/modals/VideoDialogs'
import { useListVideosQuery, useDeleteVideoMutation, useUpdateVideoStatusMutation, useCreateVideoMutation, useUpdateVideoMutation } from '@/services/rtkApi'
import type { Video } from '@/services/api'
import { Box, CircularProgress, Alert } from '@mui/material'

const subjectOptions = [
  { value: '', label: 'Предмет' },
  { value: 'math', label: 'Математика' },
  { value: 'physics', label: 'Физика' },
]
const statusOptions = [
  { value: '', label: 'Статус' },
  { value: 'published', label: 'Опубликован' },
  { value: 'draft', label: 'Черновик' },
]
const sortOptions = [
  { value: '', label: 'Сортировка' },
  { value: 'date', label: 'По дате' },
  { value: 'views', label: 'По просмотрам' },
]

export function VideoLessons() {
  const [page, setPage] = useState(0)
  const { data, isLoading, error } = useListVideosQuery({ page, size: 20 })
  const [deleteVideo, { isLoading: isDeleting }] = useDeleteVideoMutation()
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateVideoStatusMutation()
  const [createVideo, { isLoading: isCreating }] = useCreateVideoMutation()
  const [updateVideo, { isLoading: isUpdating }] = useUpdateVideoMutation()

  const [createOpen, setCreateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  const handleDeleteClick = (id: number) => {
    setSelectedVideoId(id)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedVideoId) return
    try {
      await deleteVideo(selectedVideoId).unwrap()
      setDeleteOpen(false)
      setSelectedVideoId(null)
    } catch (err) {
      console.error('Failed to delete video:', err)
    }
  }

  const handleStatusClick = (id: number, video: Video) => {
    setSelectedVideoId(id)
    setSelectedVideo(video)
    setStatusOpen(true)
  }

  const handleToggleStatus = async () => {
    if (!selectedVideoId) return
    try {
      await updateStatus(selectedVideoId).unwrap()
      setStatusOpen(false)
      setSelectedVideoId(null)
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const handleCreate = async (formData: Partial<Video>) => {
    try {
      await createVideo(formData).unwrap()
      setCreateOpen(false)
    } catch (err) {
      console.error('Failed to create video:', err)
    }
  }

  const handleEditClick = (video: Video) => {
    setSelectedVideo(video)
    setEditOpen(true)
  }

  const handleEdit = async (id: number, formData: Partial<Video>) => {
    try {
      await updateVideo({ id, data: formData }).unwrap()
      setEditOpen(false)
    } catch (err) {
      console.error('Failed to update video:', err)
    }
  }

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'title',
      header: 'Название',
      render: row => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UserAvatar name={(row.title as string) || ''} />
          <span style={{ fontWeight: 500, color: '#1e293b' }}>{row.title as string}</span>
        </Box>
      ),
    },
    { key: 'subject', header: 'Предмет' },
    { key: 'duration', header: 'Длительность' },
    {
      key: 'viewCount',
      header: 'Просмотры',
      render: row => (row.viewCount as number).toLocaleString('ru'),
    },
    {
      key: 'createdAt',
      header: 'Дата',
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
          onToggle={() => handleStatusClick(row.id as number, row as Video)}
          onEdit={() => handleEditClick(row as Video)}
          onDelete={() => handleDeleteClick(row.id as number)}
        />
      ),
    },
  ]

  if (isLoading) {
    return (
      <Layout searchPlaceholder="Поиск по названию урока" createLabel="Добавить урок">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout searchPlaceholder="Поиск по названию урока" createLabel="Добавить урок">
        <Alert severity="error">Ошибка загрузки видеоуроков</Alert>
      </Layout>
    )
  }

  return (
    <Layout
      searchPlaceholder="Поиск по названию урока"
      createLabel="Добавить урок"
      onCreateClick={() => setCreateOpen(true)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', marginRight: 'auto' }}>
          Видеоуроки
        </h1>
        <Select options={subjectOptions} defaultValue="" />
        <Select options={statusOptions} defaultValue="" />
        <Select options={sortOptions} defaultValue="" />
      </Box>
      <DataTable
        columns={columns}
        data={(data?.content || []) as unknown as Record<string, unknown>[]}
        currentPage={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
        keyField="id"
      />

      <CreateVideoModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} loading={isCreating} />
      <EditVideoModal open={editOpen} video={selectedVideo || undefined} onClose={() => setEditOpen(false)} onSubmit={handleEdit} loading={isUpdating} />
      <ConfirmDeleteModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} loading={isDeleting} />
      <StatusChangeModal
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        onConfirm={handleToggleStatus}
        currentStatus={selectedVideo?.active}
        loading={isUpdatingStatus}
      />
    </Layout>
  )
}
