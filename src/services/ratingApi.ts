import { baseApi } from './baseApi'
import type { Page, RatingEntry } from '@/types/api'

interface RatingArgs {
  page?: number
  size?: number
  testId?: number
  dateFrom?: string
  dateTo?: string
}

export const ratingApi = baseApi.injectEndpoints({
  endpoints: b => ({
    listRating: b.query<Page<RatingEntry>, RatingArgs>({
      query: ({ page = 0, size = 20, testId, dateFrom, dateTo }) => {
        const p = new URLSearchParams({ page: String(page), size: String(size) })
        if (testId) p.set('testId', String(testId))
        if (dateFrom) p.set('dateFrom', dateFrom)
        if (dateTo) p.set('dateTo', dateTo)
        return `/api/admin/rating?${p}`
      },
      providesTags: ['Rating'],
    }),
    resetRating: b.mutation<{ success: boolean; message: string }, void>({
      query: () => ({ url: '/api/admin/rating/reset', method: 'POST' }),
      invalidatesTags: ['Rating'],
    }),
  }),
})

export const { useListRatingQuery, useResetRatingMutation } = ratingApi
