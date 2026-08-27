import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
} from '@mui/material'
import { Trash2 } from 'lucide-react'
import type { Test, TestQuestion } from '@/services/api'

interface CreateTestModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Partial<Test>) => Promise<void>
  loading?: boolean
}

export function CreateTestModal({ open, onClose, onSubmit, loading }: CreateTestModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    titleKy: '',
    description: '',
    descriptionKy: '',
    iconUrl: '',
    price: 0,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = async () => {
    await onSubmit(formData)
    setFormData({
      title: '',
      titleKy: '',
      description: '',
      descriptionKy: '',
      iconUrl: '',
      price: 0,
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Создать тест</DialogTitle>
      <DialogContent sx={{ gap: 2, display: 'flex', flexDirection: 'column', pt: 2 }}>
        <TextField
          fullWidth
          label="Название (РУ)"
          name="title"
          value={formData.title}
          onChange={handleChange}
          size="small"
        />
        <TextField
          fullWidth
          label="Название (КY)"
          name="titleKy"
          value={formData.titleKy}
          onChange={handleChange}
          size="small"
        />
        <TextField
          fullWidth
          label="Описание (РУ)"
          name="description"
          value={formData.description}
          onChange={handleChange}
          size="small"
          multiline
          rows={3}
        />
        <TextField
          fullWidth
          label="Описание (КY)"
          name="descriptionKy"
          value={formData.descriptionKy}
          onChange={handleChange}
          size="small"
          multiline
          rows={3}
        />
        <TextField
          fullWidth
          label="URL Иконки"
          name="iconUrl"
          value={formData.iconUrl}
          onChange={handleChange}
          size="small"
        />
        <TextField
          fullWidth
          label="Цена"
          name="price"
          type="number"
          value={formData.price}
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

interface EditTestModalProps {
  open: boolean
  test?: Test
  onClose: () => void
  onSubmit: (id: number, data: Partial<Test>) => Promise<void>
  loading?: boolean
}

export function EditTestModal({ open, test, onClose, onSubmit, loading }: EditTestModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    titleKy: '',
    description: '',
    descriptionKy: '',
    iconUrl: '',
    price: 0,
  })

  useEffect(() => {
    if (test) {
      setFormData({
        title: test.title || '',
        titleKy: test.titleKy || '',
        description: test.description || '',
        descriptionKy: test.descriptionKy || '',
        iconUrl: test.iconUrl || '',
        price: test.price || 0,
      })
    }
  }, [test])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = async () => {
    if (!test) return
    await onSubmit(test.id, formData)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Редактировать тест</DialogTitle>
      <DialogContent sx={{ gap: 2, display: 'flex', flexDirection: 'column', pt: 2 }}>
        <TextField
          fullWidth
          label="Название (РУ)"
          name="title"
          value={formData.title}
          onChange={handleChange}
          size="small"
        />
        <TextField
          fullWidth
          label="Название (КY)"
          name="titleKy"
          value={formData.titleKy}
          onChange={handleChange}
          size="small"
        />
        <TextField
          fullWidth
          label="Описание (РУ)"
          name="description"
          value={formData.description}
          onChange={handleChange}
          size="small"
          multiline
          rows={3}
        />
        <TextField
          fullWidth
          label="Описание (КY)"
          name="descriptionKy"
          value={formData.descriptionKy}
          onChange={handleChange}
          size="small"
          multiline
          rows={3}
        />
        <TextField
          fullWidth
          label="URL Иконки"
          name="iconUrl"
          value={formData.iconUrl}
          onChange={handleChange}
          size="small"
        />
        <TextField
          fullWidth
          label="Цена"
          name="price"
          type="number"
          value={formData.price}
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
  title = 'Удалить тест?',
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

interface EditQuestionModalProps {
  open: boolean
  question?: TestQuestion
  onClose: () => void
  onSubmit: (questionId: number, data: TestQuestion) => Promise<void>
  loading?: boolean
}

export function EditQuestionModal({
  open,
  question,
  onClose,
  onSubmit,
  loading,
}: EditQuestionModalProps) {
  const [formData, setFormData] = useState<TestQuestion>({
    text: '',
    textKy: '',
    sectionName: '',
    sectionNameKy: '',
    imageUrl: '',
    explanation: '',
    explanationKy: '',
    orderIndex: 0,
    pointValue: 1,
    options: [],
  })

  useEffect(() => {
    if (question) {
      setFormData(question)
    }
  }, [question])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'orderIndex' || name === 'pointValue' ? parseInt(value) : value,
    }))
  }

  const handleSubmit = async () => {
    if (!question) return
    await onSubmit(question.text.length ? Math.random() : 0, formData)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Редактировать вопрос</DialogTitle>
      <DialogContent sx={{ gap: 2, display: 'flex', flexDirection: 'column', pt: 2 }}>
        <TextField
          fullWidth
          label="Вопрос (РУ)"
          name="text"
          value={formData.text}
          onChange={handleChange}
          size="small"
          multiline
          rows={2}
        />
        <TextField
          fullWidth
          label="Вопрос (КY)"
          name="textKy"
          value={formData.textKy}
          onChange={handleChange}
          size="small"
          multiline
          rows={2}
        />
        <TextField
          fullWidth
          label="Раздел (РУ)"
          name="sectionName"
          value={formData.sectionName}
          onChange={handleChange}
          size="small"
        />
        <TextField
          fullWidth
          label="Раздел (КY)"
          name="sectionNameKy"
          value={formData.sectionNameKy}
          onChange={handleChange}
          size="small"
        />
        <TextField
          fullWidth
          label="URL Изображения"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          size="small"
        />
        <TextField
          fullWidth
          label="Объяснение (РУ)"
          name="explanation"
          value={formData.explanation}
          onChange={handleChange}
          size="small"
          multiline
          rows={2}
        />
        <TextField
          fullWidth
          label="Балл"
          name="pointValue"
          type="number"
          value={formData.pointValue}
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
