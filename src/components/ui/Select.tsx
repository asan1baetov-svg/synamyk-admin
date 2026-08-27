import { Select as MuiSelect, MenuItem, FormControl } from '@mui/material'

interface SelectProps {
  placeholder?: string
  options: { value: string; label: string }[]
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  sx?: any
}

export function Select({ placeholder, options, defaultValue, value, onChange, sx }: SelectProps) {
  return (
    <FormControl size="small" sx={{ minWidth: '140px' }}>
      <MuiSelect
        defaultValue={defaultValue || ''}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        sx={{
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 500,
          backgroundColor: '#f8fafc',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e8ecf0',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d1d5db',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3b6ff0',
          },
          '&.Mui-focused': {
            backgroundColor: '#ffffff',
          },
          ...sx,
        }}
      >
        {options.map(opt => (
          <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '14px' }}>
            {opt.label}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  )
}
