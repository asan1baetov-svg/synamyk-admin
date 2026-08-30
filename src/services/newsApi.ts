import { baseApi } from './baseApi'
import type { AdminNews, AdminNewsListItem, NewsPayload, NewsType, Page } from '@/types/api'

interface NewsListArgs {
  page?: number
  size?: number
  search?: string
  type?: NewsType | ''
  active?: boolean
  dateFrom?: string
  dateTo?: string
}

export const newsApi = baseApi.injectEndpoints({
  endpoints: b => ({
    listNews: b.query<Page<AdminNewsListItem>, NewsListArgs>({
      query: ({ page = 0, size = 20, search, type, active, dateFrom, dateTo }) => {
        const p = new URLSearchParams({ page: String(page), size: String(size) })
        if (search) p.set('search', search)
        if (type) p.set('type', type)
        if (active !== undefined) p.set('active', String(active))
        if (dateFrom) p.set('dateFrom', dateFrom)
        if (dateTo) p.set('dateTo', dateTo)
        return `/api/admin/news?${p}`
      },
      providesTags: ['News'],
    }),
    getNews: b.query<AdminNews, number>({
      query: id => `/api/admin/news/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'News', id }],
    }),
    createNews: b.mutation<AdminNews, NewsPayload>({
      query: body => ({ url: '/api/admin/news', method: 'POST', body }),
      invalidatesTags: ['News'],
    }),
    updateNews: b.mutation<AdminNews, { id: number; body: NewsPayload }>({
      query: ({ id, body }) => ({
        url: `/api/admin/news/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'News', id }, 'News'],
    }),
    updateNewsStatus: b.mutation<AdminNews, number>({
      query: id => ({ url: `/api/admin/news/${id}/status`, method: 'PATCH' }),
      invalidatesTags: ['News'],
    }),
    deleteNews: b.mutation<void, number>({
      query: id => ({ url: `/api/admin/news/${id}`, method: 'DELETE' }),
      invalidatesTags: ['News'],
    }),
  }),
})

export const {
  useListNewsQuery,
  useGetNewsQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useUpdateNewsStatusMutation,
  useDeleteNewsMutation,
} = newsApi
