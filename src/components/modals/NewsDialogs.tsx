import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material'
import type { News } from '@/services/api'

interface CreateNewsModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Partial<News>) => Promise<void>
  loading?: boolean
}

export function CreateNewsModal({ open, onClose, onSubmit, loading }: CreateNewsModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    coverImageUrl: '',
    content: '',
    contentKey: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async () => {
    await onSubmit(formData)
    setFormData({
      title: '',
      type: '',
      coverImageUrl: '',
      content: '',
      contentKey: '',
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Создать новость</DialogTitle>
      <DialogContent sx={{ gap: 2, display: 'flex', flexDirection: 'column', pt: 2 }}>
        <TextField
          fullWidth
          label="Заголовок"
          name="title"
          value={formData.title}
          onChange={handleChange}
          size="small"
        />
        <TextField
          fullWidth
          label="Тип"
          name="type"
          value={formData.type}
          onChange={handleChange}
          size="small"
          placeholder="news, announce, etc."
        />
        <TextField
          fullWidth
          label="URL Обложки"
          name="coverImageUrl"
          value={formData.coverImageUrl}
          onChange={handleChange}
          size="small"
        />
        <TextField
          fullWidth
          label="Содержание"
          name="content"
          value={formData.content}
          onChange={handleChange}
          size="small"
          multiline
          rows={4}
        />
        <TextField
          fullWidth
          label="Ключ контента"
          name="contentKey"
          value={formData.contentKey}
          onChange={handleChange}
          size="small"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  )
}

interface EditNewsModalProps {
  open: boolean
  news?: News
  onClose: () => void
  onSubmit: (id: number, data: Partial<News>) => Promise<void>
  loading?: boolean
}

export function EditNewsModal({ open, news, onClose, onSubmit, loading }: EditNewsModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    coverImageUrl: '',
    content: '',
    contentKey: '',
  })

  useEffect(() => {
    if (news) {
      setFormData({
        title: news.title || '',
        type: news.type || '',
        coverImageUrl: news.coverImageUrl || '',
        content: news.content || '',
        contentKey: news.contentKey || '',
      })
    }
  }, [news])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async () => {
    if (!news) return
    await onSubmit(news.id, formData)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Редактировать новость</DialogTitle>
      <DialogContent sx={{ gap: 2, display: 'flex', flexDirection: 'column', pt: 2 }}>
        <TextField
          fullWidth
          label="Заголовок"
          name="title"
          value={formData.title}
          onChange={handleChange}
          size="small"
        />
        <TextField
          fullWidth
          label="Тип"
          name="type"
          value={formData.type}
          onChange={handleChange}
          size="small"
          placeholder="news, announce, etc."
        />
        <TextField
          fullWidth
          label="URL Обложки"
          name="coverImageUrl"
          value={formData.coverImageUrl}
          onChange={handleChange}
          size="small"
        />
        <TextField
          fullWidth
          label="Содержание"
          name="content"
          value={formData.content}
          onChange={handleChange}
          size="small"
          multiline
          rows={4}
        />
        <TextField
          fullWidth
          label="Ключ контента"
          name="contentKey"
          value={formData.contentKey}
          onChange={handleChange}
          size="small"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  )
}

interface ConfirmDeleteModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title?: string
  loading?: boolean
}

export function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  title = 'Удалить новость?',
  loading,
}: ConfirmDeleteModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>Это действие нельзя отменить.</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={onConfirm} variant="contained" color="error" disabled={loading}>
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  )
}

interface StatusChangeModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  currentStatus?: boolean
  loading?: boolean
}

export function StatusChangeModal({
  open,
  onClose,
  onConfirm,
  currentStatus,
  loading,
}: StatusChangeModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {currentStatus ? 'Снять с публикации?' : 'Опубликовать новость?'}
      </DialogTitle>
      <DialogContent>
        {currentStatus
          ? 'Новость станет недоступна для пользователей.'
          : 'Новость будет доступна для пользователей.'}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={onConfirm} variant="contained" disabled={loading}>
          {currentStatus ? 'Снять' : 'Опубликовать'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
