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
import type { Video } from '@/services/api'

interface CreateVideoModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Partial<Video>) => Promise<void>
  loading?: boolean
}

export function CreateVideoModal({ open, onClose, onSubmit, loading }: CreateVideoModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    duration: '',
    thumbnailUrl: '',
    videoUrl: '',
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
      description: '',
      subject: '',
      duration: '',
      thumbnailUrl: '',
      videoUrl: '',
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Добавить видеоурок</DialogTitle>
      <DialogContent sx={{ gap: 2, display: 'flex', flexDirection: 'column', pt: 2 }}>
        <TextField
          fullWidth
          label="Название"
          name="title"
          value={formData.title}
          onChange={handleChange}
          size="small"
        />
        <TextField
          fullWidth
          label="Описание"
          name="description"
          value={formData.description}
          onChange={handleChange}
          size="small"
          multiline
          rows={3}
        />
        <TextField
          fullWidth
          label="Предмет"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          size="small"
        />
        <TextField
          fullWidth
          label="Длительность"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          size="small"
          placeholder="mm:ss"
        />
        <TextField
          fullWidth
          label="URL Миниатюры"
          name="thumbnailUrl"
          value={formData.thumbnailUrl}
          onChange={handleChange}
          size="small"
        />
        <TextField
          fullWidth
          label="URL Видео"
          name="videoUrl"
          value={formData.videoUrl}
          onChange={handleChange}
          size="small"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Добавить
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
  title = 'Удалить видеоурок?',
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
        {currentStatus ? 'Деактивировать видеоурок?' : 'Активировать видеоурок?'}
      </DialogTitle>
      <DialogContent>
        {currentStatus
          ? 'Видеоурок станет недоступен для пользователей.'
          : 'Видеоурок будет доступен для пользователей.'}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={onConfirm} variant="contained" disabled={loading}>
          {currentStatus ? 'Деактивировать' : 'Активировать'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

interface EditVideoModalProps {
  open: boolean
  video?: Video
  onClose: () => void
  onSubmit: (id: number, data: Partial<Video>) => Promise<void>
  loading?: boolean
}

export function EditVideoModal({ open, video, onClose, onSubmit, loading }: EditVideoModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    duration: '',
    thumbnailUrl: '',
    videoUrl: '',
  })

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || '',
        description: video.title || '',
        subject: video.subject || '',
        duration: video.duration || '',
        thumbnailUrl: video.thumbnailUrl || '',
        videoUrl: video.thumbnailUrl || '',
      })
    }
  }, [video])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async () => {
    if (!video) return
    await onSubmit(video.id, formData)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Редактировать видеоурок</DialogTitle>
      <DialogContent sx={{ gap: 2, display: 'flex', flexDirection: 'column', pt: 2 }}>
        <TextField
          fullWidth
          label="Название"
          name="title"
          value={formData.title}
          onChange={handleChange}
          size="small"
        />
        <TextField
          fullWidth
          label="Описание"
          name="description"
          value={formData.description}
          onChange={handleChange}
          size="small"
          multiline
          rows={3}
        />
        <TextField
          fullWidth
          label="Предмет"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          size="small"
        />
        <TextField
          fullWidth
          label="Длительность"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          size="small"
          placeholder="mm:ss"
        />
        <TextField
          fullWidth
          label="URL Миниатюры"
          name="thumbnailUrl"
          value={formData.thumbnailUrl}
          onChange={handleChange}
          size="small"
        />
        <TextField
          fullWidth
          label="URL Видео"
          name="videoUrl"
          value={formData.videoUrl}
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
