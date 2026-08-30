import { useState } from 'react'
import { Plus, Pencil, EyeOff, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { useListNewsQuery, useDeleteNewsMutation, useUpdateNewsStatusMutation } from '@/services'
import type { AdminNewsListItem, NewsType } from '@/types/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useUrlParam, useUrlNumber } from '@/hooks/useUrlState'
import { extractErrorMessage } from '@/lib/errors'
import { PageHeader, DataTable, SearchInput, ConfirmDialog } from '@/components/common'
import type { Column } from '@/components/common'
import { Button, Select, Badge } from '@/components/ui'
import { formatDT } from '@/lib/datetime'
import { NewsFormDialog } from './NewsFormDialog'

const TYPE_LABEL: Record<NewsType, string> = {
  NEWS: 'Новость',
  ARTICLE: 'Статья',
  ANNOUNCEMENT: 'Объявление',
}

export function NewsPage() {
  useDocumentTitle('Новости')
  const [search, setSearch] = useUrlParam('search')
  const [type, setType] = useUrlParam('type')
  const [status, setStatus] = useUrlParam('status', 'all')
  const [page, setPage] = useUrlNumber('page', 0)

  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<AdminNewsListItem | null>(null)
  const [toHide, setToHide] = useState<AdminNewsListItem | null>(null)

  const { data, isLoading, isFetching } = useListNewsQuery({
    page,
    size: 20,
    search: search || undefined,
    type: (type || undefined) as NewsType | undefined,
    active: status === 'all' ? undefined : status === 'active',
  })
  const [deleteNews, { isLoading: deleting }] = useDeleteNewsMutation()
  const [updateStatus] = useUpdateNewsStatusMutation()

  const columns: Column<AdminNewsListItem>[] = [
    {
      key: 'cover',
      header: '',
      width: '56px',
      render: n =>
        n.coverImageUrl ? (
          <img src={n.coverImageUrl} alt="" className="h-9 w-14 rounded object-cover" />
        ) : (
          <div className="h-9 w-14 rounded bg-neutral-100" />
        ),
    },
    {
      key: 'title',
      header: 'Заголовок',
      render: n => <span className="font-medium">{n.title}</span>,
    },
    { key: 'type', header: 'Тип', render: n => TYPE_LABEL[n.type] },
    { key: 'views', header: 'Просмотры', render: n => n.viewCount },
    { key: 'author', header: 'Автор', render: n => n.authorName },
    { key: 'published', header: 'Опубликовано', render: n => formatDT(n.publishedAt) },
    {
      key: 'status',
      header: 'Статус',
      render: n =>
        n.active ? <Badge tone="success">Активна</Badge> : <Badge tone="neutral">Скрыта</Badge>,
    },
    {
      key: 'actions',
      header: '',
      render: n => (
        <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditItem(n)
              setFormOpen(true)
            }}
          >
            <Pencil size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            title="Переключить публикацию"
            onClick={async () => {
              try {
                await updateStatus(n.id).unwrap()
                toast.success('Статус изменён')
              } catch (err) {
                toast.error(extractErrorMessage(err))
              }
            }}
          >
            {n.active ? <Eye size={14} /> : <EyeOff size={14} />}
          </Button>
          {n.active && (
            <Button size="sm" variant="ghost" onClick={() => setToHide(n)}>
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
        title="Новости"
        description="Публичная лента — видна всем без авторизации"
        actions={
          <Button
            onClick={() => {
              setEditItem(null)
              setFormOpen(true)
            }}
          >
            <Plus size={15} /> Новость
          </Button>
        }
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Поиск…" />
        <Select value={type} onChange={e => setType(e.target.value)} className="w-40">
          <option value="">Все типы</option>
          <option value="NEWS">Новость</option>
          <option value="ARTICLE">Статья</option>
          <option value="ANNOUNCEMENT">Объявление</option>
        </Select>
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-36">
          <option value="all">Все</option>
          <option value="active">Активные</option>
          <option value="hidden">Скрытые</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={data?.content}
        rowKey={n => n.id}
        loading={isLoading || isFetching}
        page={page}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements}
        onPageChange={setPage}
      />

      <NewsFormDialog open={formOpen} onClose={() => setFormOpen(false)} item={editItem} />

      <ConfirmDialog
        open={Boolean(toHide)}
        onClose={() => setToHide(null)}
        onConfirm={async () => {
          if (!toHide) return
          try {
            await deleteNews(toHide.id).unwrap()
            toast.success('Новость скрыта')
          } catch (err) {
            toast.error(extractErrorMessage(err))
          } finally {
            setToHide(null)
          }
        }}
        title="Скрыть новость?"
        description="Вернуть скрытую новость через админку нельзя."
        confirmLabel="Скрыть"
        destructive
        loading={deleting}
      />
    </div>
  )
}
