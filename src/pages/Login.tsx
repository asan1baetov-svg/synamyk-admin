import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, TextField, Typography, CircularProgress, Alert } from '@mui/material'

export function Login() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!phone || !password) {
      setError('Заполните все поля')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('https://synamyk-production.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      })

      if (!response.ok) {
        throw new Error('Неверные учетные данные')
      }

      const data = await response.json()
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f4f6fa',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: 4,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Typography sx={{ fontSize: '24px', fontWeight: 'bold', mb: 1, textAlign: 'center', color: '#0f172a' }}>
          Synamyk Admin
        </Typography>
        <Typography sx={{ fontSize: '14px', color: '#94a3b8', mb: 3, textAlign: 'center' }}>
          Вход в административную панель
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          fullWidth
          label="Номер телефона"
          placeholder="996700000000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Пароль"
          type="password"
          placeholder="Admin1234!"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          disabled={loading}
          sx={{
            backgroundColor: '#3b6ff0',
            padding: '10px',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Вход'}
        </Button>

        <Typography sx={{ fontSize: '12px', color: '#94a3b8', mt: 2, textAlign: 'center' }}>
          Тестовые данные: 996700000000 / Admin1234!
        </Typography>
      </Box>
    </Box>
  )
}
