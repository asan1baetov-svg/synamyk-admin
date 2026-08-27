import type { ReactNode } from 'react'
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Box,
} from '@mui/material'
import { Pagination } from './Pagination'

export interface Column<T> {
  key: keyof T | string
  header: string
  width?: string
  render?: (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  keyField?: keyof T
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  keyField,
}: DataTableProps<T>) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TableContainer
        sx={{
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          border: '1px solid #eef1f6',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#fafbff', borderBottom: '1px solid #f0f3f8' }}>
              {columns.map(col => (
                <TableCell
                  key={String(col.key)}
                  sx={{
                    padding: '16px 24px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#94a3b8',
                    whiteSpace: 'nowrap',
                    ...(col.width && { width: col.width }),
                  }}
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow
                key={keyField ? String(row[keyField]) : idx}
                sx={{
                  '&:hover': {
                    backgroundColor: '#fafbff',
                  },
                  borderBottom: idx !== data.length - 1 ? '1px solid #f4f6fb' : 'none',
                  transition: 'background-color 0.2s',
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                {columns.map(col => (
                  <TableCell
                    key={String(col.key)}
                    sx={{
                      padding: '16px 24px',
                      fontSize: '14px',
                      color: '#374151',
                      overflow: col.key === 'actions' ? 'visible' : 'hidden',
                      position: col.key === 'actions' ? 'relative' : 'static',
                      ...(col.width && { width: col.width }),
                    }}
                  >
                    {col.render ? col.render(row) : (row[col.key as keyof T] as ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && onPageChange && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Pagination current={currentPage} total={totalPages} onChange={onPageChange} />
        </Box>
      )}
    </Box>
  )
}
