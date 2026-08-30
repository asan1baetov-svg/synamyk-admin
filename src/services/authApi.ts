import { baseApi } from './baseApi'
import type { AuthResponse } from '@/lib/auth'

export const authApi = baseApi.injectEndpoints({
  endpoints: b => ({
    login: b.mutation<AuthResponse, { phone: string; password: string }>({
      query: body => ({ url: '/api/auth/login', method: 'POST', body }),
    }),
    logout: b.mutation<{ success: boolean; message: string }, { refreshToken: string }>({
      query: body => ({ url: '/api/auth/logout', method: 'POST', body }),
    }),
  }),
})

export const { useLoginMutation, useLogoutMutation } = authApi
