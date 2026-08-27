import { Search } from 'lucide-react'
import { TextField, InputAdornment } from '@mui/material'

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function SearchBar({
  placeholder = 'Поиск...',
  value,
  onChange,
}: SearchBarProps) {
  return (
    <TextField
      fullWidth
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search size={15} style={{ color: '#c0cad8' }} />
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          backgroundColor: '#f8fafc',
          fontSize: '14px',
          '& fieldset': {
            borderColor: '#edf0f5',
          },
          '&:hover fieldset': {
            borderColor: '#edf0f5',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#3b6ff0',
            boxShadow: '0 0 0 3px rgba(59, 111, 240, 0.1)',
          },
        },
        '& .MuiOutlinedInput-input::placeholder': {
          color: '#b0bac9',
          opacity: 1,
        },
      }}
    />
  )
}
