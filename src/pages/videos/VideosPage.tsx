import { useState } from 'react'
import { Plus, Pencil, EyeOff, Eye } from 'lucide-react'
import { toast } from 'sonner'
import {
  useListVideosQuery,
  useDeleteVideoMutation,
  useUpdateVideoStatusMutation,
} from '@/services'
import type { AdminVideoListItem } from '@/types/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useUrlParam, useUrlNumber } from '@/hooks/useUrlState'
import { extractErrorMessage } from '@/lib/errors'
import { PageHeader, DataTable, SearchInput, ConfirmDialog } from '@/components/common'
import type { Column } from '@/components/common'
import { Button, Select, Badge } from '@/components/ui'
import { formatDate } from '@/lib/datetime'
import { VideoFormDialog } from './VideoFormDialog'

export function VideosPage() {
  useDocumentTitle('Видеоуроки')
  const [search, setSearch] = useUrlParam('search')
  const [status, setStatus] = useUrlParam('status', 'all')
  const [page, setPage] = useUrlNumber('page', 0)

  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<AdminVideoListItem | null>(null)
  const [toHide, setToHide] = useState<AdminVideoListItem | null>(null)

  const { data, isLoading, isFetching } = useListVideosQuery({
    page,
    size: 20,
    search: search || undefined,
    active: status === 'all' ? undefined : status === 'active',
  })
  const [deleteVideo, { isLoading: deleting }] = useDeleteVideoMutation()
  const [updateStatus] = useUpdateVideoStatusMutation()

  const columns: Column<AdminVideoListItem>[] = [
    {
      key: 'thumb',
      header: '',
      width: '72px',
      render: v =>
        v.thumbnailUrl ? (
          <img src={v.thumbnailUrl} alt="" className="h-10 w-16 rounded object-cover" />
        ) : (
          <div className="h-10 w-16 rounded bg-neutral-100" />
        ),
    },
    {
      key: 'title',
      header: 'Название',
      render: v => <span className="font-medium">{v.title}</span>,
    },
    { key: 'subject', header: 'Предмет', render: v => v.subject || '—' },
    { key: 'duration', header: 'Длит.', render: v => v.duration || '—' },
    { key: 'views', header: 'Просмотры', render: v => v.viewCount },
    { key: 'created', header: 'Создано', render: v => formatDate(v.createdAt) },
    {
      key: 'status',
      header: 'Статус',
      render: v =>
        v.active ? <Badge tone="success">Активно</Badge> : <Badge tone="neutral">Скрыто</Badge>,
    },
    {
      key: 'actions',
      header: '',
      render: v => (
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditItem(v)
              setFormOpen(true)
            }}
          >
            <Pencil size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              try {
                await updateStatus(v.id).unwrap()
                toast.success('Статус изменён')
              } catch (err) {
                toast.error(extractErrorMessage(err))
              }
            }}
          >
            {v.active ? <Eye size={14} /> : <EyeOff size={14} />}
          </Button>
          {v.active && (
            <Button size="sm" variant="ghost" onClick={() => setToHide(v)}>
              <EyeOff size={14} className="text-error" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Видеоуроки"
        actions={
          <Button
            onClick={() => {
              setEditItem(null)
              setFormOpen(true)
            }}
          >
            <Plus size={15} /> Видео
          </Button>
        }
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Поиск…" />
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-36">
          <option value="all">Все</option>
          <option value="active">Активные</option>
          <option value="hidden">Скрытые</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={data?.content}
        rowKey={v => v.id}
        loading={isLoading || isFetching}
        page={page}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements}
        onPageChange={setPage}
      />

      <VideoFormDialog open={formOpen} onClose={() => setFormOpen(false)} item={editItem} />

      <ConfirmDialog
        open={Boolean(toHide)}
        onClose={() => setToHide(null)}
        onConfirm={async () => {
          if (!toHide) return
          try {
            await deleteVideo(toHide.id).unwrap()
            toast.success('Видео скрыто')
          } catch (err) {
            toast.error(extractErrorMessage(err))
          } finally {
            setToHide(null)
          }
        }}
        title="Скрыть видео?"
        description="Вернуть скрытое видео через админку нельзя."
        confirmLabel="Скрыть"
        destructive
        loading={deleting}
      />
    </div>
  )
}
