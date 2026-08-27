import { Button as MuiButton } from '@mui/material'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'export'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  onClick?: () => void
  children?: React.ReactNode
  endIcon?: React.ReactNode
  startIcon?: React.ReactNode
  sx?: any
}

const variantMap: Record<ButtonVariant, any> = {
  primary: {
    backgroundColor: '#3b6ff0',
    color: 'white',
    '&:hover': { backgroundColor: '#2d5ed4' },
    boxShadow: '0 1px 3px rgba(59, 111, 240, 0.2)',
  },
  secondary: {
    backgroundColor: 'white',
    color: '#334155',
    border: '1px solid #e8ecf0',
    '&:hover': { backgroundColor: '#f8fafc' },
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#64748b',
    '&:hover': { backgroundColor: '#f1f5f9', color: '#334155' },
    borderRadius: '8px',
  },
  danger: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    '&:hover': { backgroundColor: '#fecaca' },
  },
  success: {
    backgroundColor: '#f0fdf4',
    color: '#059669',
    '&:hover': { backgroundColor: '#dbeafe' },
  },
  export: {
    backgroundColor: '#22c55e',
    color: 'white',
    '&:hover': { backgroundColor: '#16a34a' },
    boxShadow: '0 1px 3px rgba(34, 197, 94, 0.2)',
  },
}

const sizeMap: Record<ButtonSize, any> = {
  sm: { height: 32, padding: '0 12px', fontSize: '12px' },
  md: { height: 36, padding: '0 16px', fontSize: '14px' },
  lg: { height: 40, padding: '0 20px', fontSize: '14px' },
  icon: { width: 32, height: 32, padding: 0, minWidth: 'unset' },
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  endIcon,
  startIcon,
  sx,
}: ButtonProps) {
  return (
    <MuiButton
      onClick={onClick}
      endIcon={endIcon}
      startIcon={startIcon}
      sx={{
        textTransform: 'none',
        borderRadius: '12px',
        fontWeight: 500,
        ...variantMap[variant],
        ...sizeMap[size],
        ...sx,
      }}
    >
      {children}
    </MuiButton>
  )
}
