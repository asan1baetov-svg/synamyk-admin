import { Chip } from '@mui/material'

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    published: { label: 'Опубликован', color: '#166534', bg: '#dcfce7' },
    active: { label: 'Активен', color: '#166534', bg: '#dcfce7' },
    draft: { label: 'Черновик', color: '#b45309', bg: '#fef3c7' },
    inactive: { label: 'Неактивен', color: '#991b1b', bg: '#fee2e2' },
  }
  const cfg = map[status] ?? { label: status, color: '#475569', bg: '#f1f5f9' }

  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: cfg.bg,
        color: cfg.color,
        borderRadius: '8px',
      }}
    />
  )
}
