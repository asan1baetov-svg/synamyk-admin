import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import { toast } from 'sonner'
import { API_URL } from '@/lib/config'
import { clearAuth, getRefreshToken, getToken, saveAuth, type AuthResponse } from '@/lib/auth'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: headers => {
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

let isRefreshing = false
let pendingResolvers: ((token: string | null) => void)[] = []

const waitForRefresh = () => new Promise<string | null>(resolve => pendingResolvers.push(resolve))

const flushQueue = (token: string | null) => {
  pendingResolvers.forEach(r => r(token))
  pendingResolvers = []
}

const forceLogout = () => {
  clearAuth()
  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

/**
 * fetchBaseQuery + the interceptor rules from the spec:
 *  - 401 -> refresh once via /api/auth/refresh, retry the original request.
 *          Concurrent 401s wait on a single refresh (isRefreshing + queue).
 *          If refresh fails -> clear storage, redirect to /login.
 *  - 403 -> toast "Недостаточно прав", do NOT log out.
 */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 403) {
    toast.error('Недостаточно прав для этого действия')
    return result
  }

  if (result.error?.status === 401) {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      forceLogout()
      return result
    }

    if (isRefreshing) {
      const newToken = await waitForRefresh()
      if (!newToken) return result
      return rawBaseQuery(args, api, extraOptions)
    }

    isRefreshing = true
    try {
      const refreshResult = await rawBaseQuery(
        {
          url: '/api/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      )

      if (refreshResult.data) {
        saveAuth(refreshResult.data as AuthResponse)
        flushQueue((refreshResult.data as AuthResponse).token)
        result = await rawBaseQuery(args, api, extraOptions)
      } else {
        flushQueue(null)
        forceLogout()
      }
    } finally {
      isRefreshing = false
    }
  }

  return result
}
