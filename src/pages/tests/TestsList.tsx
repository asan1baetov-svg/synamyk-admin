import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useListTestsQuery, useTestSubjectsQuery } from '@/services'
import type { AdminTestListItem } from '@/types/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useUrlParam, useUrlNumber } from '@/hooks/useUrlState'
import { PageHeader, DataTable, SearchInput, EmptyState } from '@/components/common'
import type { Column } from '@/components/common'
import { Button, Select, Badge } from '@/components/ui'
import { formatMoney } from '@/lib/format'
import { formatDate } from '@/lib/datetime'
import { TestFormDialog } from './TestFormDialog'

export function TestsList() {
  useDocumentTitle('Тесты')
  const navigate = useNavigate()
  const [search, setSearch] = useUrlParam('search')
  const [subject, setSubject] = useUrlParam('subject')
  const [status, setStatus] = useUrlParam('status', 'all')
  const [page, setPage] = useUrlNumber('page', 0)
  const [createOpen, setCreateOpen] = useState(false)

  const { data: subjects } = useTestSubjectsQuery()
  const { data, isLoading, isFetching } = useListTestsQuery({
    page,
    size: 20,
    search: search || undefined,
    subject: subject || undefined,
    active: status === 'all' ? undefined : status === 'active',
  })

  const columns: Column<AdminTestListItem>[] = [
    {
      key: 'icon',
      header: '',
      width: '48px',
      render: t =>
        t.iconUrl ? (
          <img src={t.iconUrl} alt="" className="h-8 w-8 rounded object-cover" />
        ) : (
          <div className="h-8 w-8 rounded bg-neutral-100" />
        ),
    },
    {
      key: 'title',
      header: 'Название',
      render: t => <span className="font-medium text-foreground">{t.title}</span>,
    },
    { key: 'subject', header: 'Предмет', render: t => t.subject || '—' },
    {
      key: 'price',
      header: 'Цена',
      render: t => (t.price > 0 ? formatMoney(t.price) : <Badge tone="success">Бесплатный</Badge>),
    },
    { key: 'questions', header: 'Вопросов', render: t => t.questionCount },
    { key: 'attempts', header: 'Попыток', render: t => t.attemptsCount },
    {
      key: 'status',
      header: 'Статус',
      render: t =>
        t.active ? <Badge tone="success">Активен</Badge> : <Badge tone="neutral">Скрыт</Badge>,
    },
    {
      key: 'created',
      header: 'Создан',
      render: t => formatDate(t.createdAt),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Тесты"
        description="ОРТ-курсы: тесты → подтесты (уровни) → вопросы"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={15} /> Создать тест
          </Button>
        }
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Поиск по названию…" />
        <Select value={subject} onChange={e => setSubject(e.target.value)} className="w-44">
          <option value="">Все предметы</option>
          {subjects?.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
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
        rowKey={t => t.id}
        loading={isLoading || isFetching}
        onRowClick={t => navigate(`/tests/${t.id}`)}
        page={page}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements}
        onPageChange={setPage}
        empty={
          <EmptyState
            title="Тестов пока нет"
            description="Создайте первый тест, чтобы добавить подтесты и вопросы."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus size={15} /> Создать тест
              </Button>
            }
          />
        }
      />

      <TestFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
