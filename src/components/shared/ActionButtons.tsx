import { Pencil, Trash2 } from 'lucide-react'
import { Box, IconButton } from '@mui/material'

interface ActionButtonsProps {
  isActive?: boolean
  onToggle?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function ActionButtons({ isActive = true, onToggle, onEdit, onDelete }: ActionButtonsProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        onClick={onToggle}
        title={isActive ? 'Деактивировать' : 'Активировать'}
        sx={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          cursor: 'pointer',
          border: '2px solid white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s',
          backgroundColor: isActive ? '#22c55e' : '#d1d5db',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        }}
      />
      <IconButton
        size="small"
        onClick={onEdit}
        title="Редактировать"
        sx={{
          color: '#3b6ff0',
          '&:hover': {
            backgroundColor: '#eff4ff',
          },
        }}
      >
        <Pencil size={14} strokeWidth={2} />
      </IconButton>
      <IconButton
        size="small"
        onClick={onDelete}
        title="Удалить"
        sx={{
          color: '#ef4444',
          '&:hover': {
            backgroundColor: '#fee2e2',
          },
        }}
      >
        <Trash2 size={14} strokeWidth={2} />
      </IconButton>
    </Box>
  )
}
