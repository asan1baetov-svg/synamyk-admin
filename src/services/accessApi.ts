import { baseApi } from './baseApi'
import type { AccessGrant, AccessGrantPayload } from '@/types/api'

export const accessApi = baseApi.injectEndpoints({
  endpoints: b => ({
    /** Mixed list: test-level (subTestId=null) and sub-test-level grants. */
    listAccessByUser: b.query<AccessGrant[], number>({
      query: userId => `/api/admin/access?userId=${userId}`,
      providesTags: ['Access'],
    }),
    listAccessByTest: b.query<AccessGrant[], number>({
      query: testId => `/api/admin/access?testId=${testId}`,
      providesTags: ['Access'],
    }),
    listAccessBySubTest: b.query<AccessGrant[], number>({
      query: subTestId => `/api/admin/access?subTestId=${subTestId}`,
      providesTags: ['Access'],
    }),
    grantAccess: b.mutation<AccessGrant, AccessGrantPayload>({
      query: body => ({ url: '/api/admin/access', method: 'POST', body }),
      invalidatesTags: ['Access'],
    }),
    revokeAccess: b.mutation<void, { userId: number; testId?: number; subTestId?: number }>({
      query: ({ userId, testId, subTestId }) => {
        const p = new URLSearchParams({ userId: String(userId) })
        if (subTestId != null) p.set('subTestId', String(subTestId))
        else if (testId != null) p.set('testId', String(testId))
        return { url: `/api/admin/access?${p}`, method: 'DELETE' }
      },
      invalidatesTags: ['Access'],
    }),
  }),
})

export const {
  useListAccessByUserQuery,
  useListAccessByTestQuery,
  useListAccessBySubTestQuery,
  useGrantAccessMutation,
  useRevokeAccessMutation,
} = accessApi
