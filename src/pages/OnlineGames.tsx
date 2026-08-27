import { Box, Typography, CircularProgress, Alert } from '@mui/material'
import { Layout } from '@/components/layout/Layout'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { ActionButtons } from '@/components/shared/ActionButtons'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useListGamesQuery, useDeleteGameMutation } from '@/services/rtkApi'

export function OnlineGames() {
  const { data, isLoading, error } = useListGamesQuery()
  const [deleteGame] = useDeleteGameMutation()

  const handleDelete = async (id: number) => {
    try {
      await deleteGame(id).unwrap()
    } catch (err) {
      console.error('Failed to delete game:', err)
    }
  }

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'title',
      header: 'Название игры',
    },
    {
      key: 'description',
      header: 'Описание',
    },
    {
      key: 'questionCount',
      header: 'Вопросов',
    },
    {
      key: 'questionsPerGame',
      header: 'Вопросов в игре',
    },
    {
      key: 'timeLimitSeconds',
      header: 'Время (сек)',
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
          onEdit={() => {}}
          onDelete={() => handleDelete(row.id as number)}
        />
      ),
    },
  ]

  return (
    <Layout searchPlaceholder="Поиск по названию игры" createLabel="Создать игру">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Typography
          sx={{
            fontSize: '22px',
            fontWeight: 'bold',
            color: '#0f172a',
            letterSpacing: '-0.5px',
          }}
        >
          Онлайн-игры
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Ошибка загрузки игр</Alert>
      ) : (
        <DataTable
          columns={columns}
          data={(data || []) as unknown as Record<string, unknown>[]}
          currentPage={1}
          totalPages={1}
          keyField="id"
        />
      )}
    </Layout>
  )
}
