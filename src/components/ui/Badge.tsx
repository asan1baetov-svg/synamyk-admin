import { Chip, ChipProps } from '@mui/material'

interface BadgeProps extends Omit<ChipProps, 'variant'> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default'
}

const variantMap: Record<string, any> = {
  success: { backgroundColor: '#dcfce7', color: '#166534' },
  warning: { backgroundColor: '#fef3c7', color: '#92400e' },
  danger: { backgroundColor: '#fee2e2', color: '#991b1b' },
  info: { backgroundColor: '#dbeafe', color: '#0c4a6e' },
  default: { backgroundColor: '#f3f4f6', color: '#374151' },
}

export function Badge({ variant = 'default', ...props }: BadgeProps) {
  return (
    <Chip
      {...props}
      size="small"
      sx={{
        fontSize: '12px',
        fontWeight: 500,
        borderRadius: '6px',
        ...variantMap[variant],
      }}
    />
  )
}
