import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { TableSkeleton } from '@/components/ui'
import { EmptyState } from './EmptyState'
import { Pagination } from './Pagination'

export interface Column<T> {
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
  className?: string
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[] | undefined
  rowKey: (row: T) => string | number
  loading?: boolean
  onRowClick?: (row: T) => void
  page?: number
  totalPages?: number
  totalElements?: number
  onPageChange?: (page: number) => void
  empty?: ReactNode
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  onRowClick,
  page,
  totalPages,
  totalElements,
  onPageChange,
  empty,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-neutral-50 text-left">
              {columns.map(c => (
                <th
                  key={c.key}
                  className={cn(
                    'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
                    c.className
                  )}
                  style={c.width ? { width: c.width } : undefined}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length}>
                  <TableSkeleton cols={columns.length} />
                </td>
              </tr>
            ) : !rows || rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>{empty ?? <EmptyState title="Нет данных" />}</td>
              </tr>
            ) : (
              rows.map(row => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'border-b border-border last:border-0',
                    onRowClick && 'cursor-pointer hover:bg-neutral-50'
                  )}
                >
                  {columns.map(c => (
                    <td key={c.key} className={cn('px-4 py-3 align-middle', c.className)}>
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!loading && page != null && totalPages != null && onPageChange && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
