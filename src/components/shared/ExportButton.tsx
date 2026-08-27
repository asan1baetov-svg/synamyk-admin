import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ExportButtonProps {
  onClick?: () => void
}

export function ExportButton({ onClick }: ExportButtonProps) {
  return (
    <Button
      variant="export"
      onClick={onClick}
      endIcon={<Upload size={14} strokeWidth={2.5} />}
    >
      Экспорт (CSV / Excel)
    </Button>
  )
}
