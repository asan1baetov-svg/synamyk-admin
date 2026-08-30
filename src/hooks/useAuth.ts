import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRefreshToken, getSession, clearAuth } from '@/lib/auth'
import { useLogoutMutation } from '@/services'
import { baseApi } from '@/services'
import { useAppDispatch } from './redux'

export function useAuth() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [logoutRequest] = useLogoutMutation()
  const session = getSession()

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        await logoutRequest({ refreshToken }).unwrap()
      } catch {
        /* ignore — clear locally regardless */
      }
    }
    clearAuth()
    dispatch(baseApi.util.resetApiState())
    navigate('/login', { replace: true })
  }, [dispatch, logoutRequest, navigate])

  return { session, isAdmin: session?.role === 'ADMIN', logout }
}
