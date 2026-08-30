import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getSession, isAuthenticated } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { logout } = useAuth()

  if (!isAuthenticated()) return <Navigate to="/login" replace />

  const session = getSession()
  if (session && session.role !== 'ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
        <div className="w-full max-w-sm rounded-lg bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-bold text-foreground-strong">
            Доступ только для администраторов
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ваша учётная запись не имеет прав администратора.
          </p>
          <button
            onClick={logout}
            className="mt-6 w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Выйти
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
