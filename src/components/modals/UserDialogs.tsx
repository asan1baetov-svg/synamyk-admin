import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
} from '@mui/material'
import type { User } from '@/services/api'

interface EditUserModalProps {
  open: boolean
  user?: User
  onClose: () => void
  onSubmit: (id: number, data: Partial<User>) => Promise<void>
  loading?: boolean
}

export function EditUserModal({ open, user, onClose, onSubmit, loading }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'USER',
    active: true,
  })

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'USER',
        active: user.active || true,
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as HTMLInputElement
    setFormData(prev => ({
      ...prev,
      [name]: name === 'active' ? value === 'true' : value,
    }))
  }

  const handleSubmit = async () => {
    if (!user) return
    await onSubmit(user.id, formData)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Редактировать пользователя</DialogTitle>
      <DialogContent sx={{ gap: 2, display: 'flex', flexDirection: 'column', pt: 2 }}>
        <TextField
          fullWidth
          label="Имя"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          size="small"
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          size="small"
        />
        <TextField
          fullWidth
          label="Телефон"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          size="small"
        />
        <TextField
          select
          fullWidth
          label="Роль"
          name="role"
          value={formData.role}
          onChange={handleChange}
          size="small"
        >
          <MenuItem value="USER">Пользователь</MenuItem>
          <MenuItem value="ADMIN">Администратор</MenuItem>
        </TextField>
        <TextField
          select
          fullWidth
          label="Статус"
          name="active"
          value={formData.active.toString()}
          onChange={handleChange}
          size="small"
        >
          <MenuItem value="true">Активный</MenuItem>
          <MenuItem value="false">Неактивный</MenuItem>
        </TextField>
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
  title = 'Деактивировать пользователя?',
  loading,
}: ConfirmDeleteModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>Это действие нельзя отменить.</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={onConfirm} variant="contained" color="error" disabled={loading}>
          Деактивировать
        </Button>
      </DialogActions>
    </Dialog>
  )
}
