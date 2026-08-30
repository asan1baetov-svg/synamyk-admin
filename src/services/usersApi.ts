import { baseApi } from './baseApi'
import { API_URL } from '@/lib/config'
import { getToken } from '@/lib/auth'
import type { AdminUser, Page, Role, UserUpdatePayload } from '@/types/api'

interface UserListArgs {
  page?: number
  size?: number
  search?: string
  active?: boolean
  role?: Role
  dateFrom?: string
  dateTo?: string
}

const usersQs = (a: Omit<UserListArgs, 'page' | 'size'>) => {
  const p = new URLSearchParams()
  if (a.search) p.set('search', a.search)
  if (a.active !== undefined) p.set('active', String(a.active))
  if (a.role) p.set('role', a.role)
  if (a.dateFrom) p.set('dateFrom', a.dateFrom)
  if (a.dateTo) p.set('dateTo', a.dateTo)
  return p
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: b => ({
    listUsers: b.query<Page<AdminUser>, UserListArgs>({
      query: ({ page = 0, size = 20, ...rest }) => {
        const p = usersQs(rest)
        p.set('page', String(page))
        p.set('size', String(size))
        return `/api/admin/users?${p}`
      },
      providesTags: ['User'],
    }),

    getUser: b.query<AdminUser, number>({
      query: id => `/api/admin/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'User', id }],
    }),

    updateUser: b.mutation<AdminUser, { id: number; data: UserUpdatePayload }>({
      query: ({ id, data }) => ({
        url: `/api/admin/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'User', id }, 'User'],
    }),

    deleteUser: b.mutation<void, number>({
      query: id => ({ url: `/api/admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
  }),
})

/** CSV export — returns a Blob, done outside RTK Query (file download). */
export async function exportUsersCsv(args: Omit<UserListArgs, 'page' | 'size'>): Promise<Blob> {
  const p = usersQs(args)
  const res = await fetch(`${API_URL}/api/admin/users/export?${p}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error('export failed')
  return res.blob()
}

export const { useListUsersQuery, useGetUserQuery, useUpdateUserMutation, useDeleteUserMutation } =
  usersApi
