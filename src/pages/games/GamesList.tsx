import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useListGamesQuery } from '@/services'
import type { GameTest } from '@/types/api'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PageHeader, DataTable, EmptyState } from '@/components/common'
import type { Column } from '@/components/common'
import { Button, Badge } from '@/components/ui'
import { GameFormDialog } from './GameFormDialog'

export function GamesList() {
  useDocumentTitle('Игровые тесты')
  const navigate = useNavigate()
  const { data, isLoading } = useListGamesQuery()
  const [createOpen, setCreateOpen] = useState(false)

  const columns: Column<GameTest>[] = [
    {
      key: 'title',
      header: 'Название',
      render: g => <span className="font-medium">{g.title}</span>,
    },
    { key: 'time', header: 'Сек/вопрос', render: g => g.timeLimitSeconds },
    {
      key: 'perGame',
      header: 'Вопросов/игра',
      render: g => (g.questionsPerGame === 0 ? 'все' : g.questionsPerGame),
    },
    { key: 'count', header: 'Всего вопросов', render: g => g.questionCount },
    {
      key: 'status',
      header: 'Статус',
      render: g =>
        g.active ? <Badge tone="success">Активен</Badge> : <Badge tone="neutral">Скрыт</Badge>,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Игровые тесты"
        description="Дуэли 1-на-1: быстрые вопросы, только RU, один правильный ответ"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={15} /> Создать
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={data}
        rowKey={g => g.id}
        loading={isLoading}
        onRowClick={g => navigate(`/games/${g.id}`)}
        empty={
          <EmptyState
            title="Пока нет игровых тестов"
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus size={15} /> Создать
              </Button>
            }
          />
        }
      />

      <GameFormDialog open={createOpen} onClose={() => setCreateOpen(false)} game={null} />
    </div>
  )
}
