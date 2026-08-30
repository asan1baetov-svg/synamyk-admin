import { useState } from 'react'
import type { ReactNode } from 'react'
import { Dialog, Button, Input } from '@/components/ui'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  loading?: boolean
  /** If set, user must type this exact word to enable the confirm button. */
  confirmWord?: string
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  destructive,
  loading,
  confirmWord,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('')
  const wordOk = !confirmWord || typed.trim() === confirmWord

  const handleClose = () => {
    setTyped('')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            disabled={!wordOk}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description && <div className="text-sm text-foreground">{description}</div>}
      {confirmWord && (
        <div className="mt-4 space-y-1">
          <p className="text-xs text-muted-foreground">
            Введите <span className="font-semibold text-foreground">{confirmWord}</span>, чтобы
            подтвердить:
          </p>
          <Input
            value={typed}
            onChange={e => setTyped(e.target.value)}
            placeholder={confirmWord}
            autoFocus
          />
        </div>
      )}
    </Dialog>
  )
}
