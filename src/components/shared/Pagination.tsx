import { Pagination as MuiPagination } from '@mui/material'

interface PaginationProps {
  current: number
  total: number
  onChange: (page: number) => void
}

export function Pagination({ current, total, onChange }: PaginationProps) {
  return (
    <MuiPagination
      count={total}
      page={current}
      onChange={(_, page) => onChange(page)}
      shape="rounded"
      sx={{
        '& .MuiPaginationItem-root': {
          borderRadius: '8px',
          fontWeight: 500,
          color: '#64748b',
          '&.Mui-selected': {
            backgroundColor: '#3b6ff0',
            color: 'white',
            boxShadow: '0 1px 3px rgba(59, 111, 240, 0.3)',
          },
        },
      }}
    />
  )
}
