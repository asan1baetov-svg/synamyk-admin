import { baseApi } from './baseApi'
import type { AccessGrant, AccessGrantPayload } from '@/types/api'

export const accessApi = baseApi.injectEndpoints({
  endpoints: b => ({
    listAccessByUser: b.query<AccessGrant[], number>({
      query: userId => `/api/admin/access?userId=${userId}`,
      providesTags: ['Access'],
    }),
    listAccessByTest: b.query<AccessGrant[], number>({
      query: testId => `/api/admin/access?testId=${testId}`,
      providesTags: ['Access'],
    }),
    grantAccess: b.mutation<AccessGrant, AccessGrantPayload>({
      query: body => ({ url: '/api/admin/access', method: 'POST', body }),
      invalidatesTags: ['Access'],
    }),
    revokeAccess: b.mutation<void, { userId: number; testId: number }>({
      query: ({ userId, testId }) => ({
        url: `/api/admin/access?userId=${userId}&testId=${testId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Access'],
    }),
  }),
})

export const {
  useListAccessByUserQuery,
  useListAccessByTestQuery,
  useGrantAccessMutation,
  useRevokeAccessMutation,
} = accessApi
