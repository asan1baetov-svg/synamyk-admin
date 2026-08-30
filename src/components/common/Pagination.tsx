import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui'

export function Pagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
}: {
  page: number
  totalPages: number
  totalElements?: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) {
    return totalElements != null ? (
      <div className="px-4 py-3 text-xs text-muted-foreground">Всего: {totalElements}</div>
    ) : null
  }

  return (
    <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
      <span className="text-xs text-muted-foreground">
        Страница {page + 1} из {totalPages}
        {totalElements != null && ` · всего ${totalElements}`}
      </span>
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="secondary"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={14} /> Назад
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          Вперёд <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  )
}
