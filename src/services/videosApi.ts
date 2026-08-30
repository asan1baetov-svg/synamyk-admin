import { baseApi } from './baseApi'
import type { AdminVideo, AdminVideoListItem, Page, VideoPayload } from '@/types/api'

interface VideoListArgs {
  page?: number
  size?: number
  search?: string
  testId?: number
  active?: boolean
}

export const videosApi = baseApi.injectEndpoints({
  endpoints: b => ({
    listVideos: b.query<Page<AdminVideoListItem>, VideoListArgs>({
      query: ({ page = 0, size = 20, search, testId, active }) => {
        const p = new URLSearchParams({ page: String(page), size: String(size) })
        if (search) p.set('search', search)
        if (testId) p.set('testId', String(testId))
        if (active !== undefined) p.set('active', String(active))
        return `/api/admin/videos?${p}`
      },
      providesTags: ['Video'],
    }),
    getVideo: b.query<AdminVideo, number>({
      query: id => `/api/admin/videos/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Video', id }],
    }),
    createVideo: b.mutation<AdminVideo, VideoPayload>({
      query: body => ({ url: '/api/admin/videos', method: 'POST', body }),
      invalidatesTags: ['Video'],
    }),
    updateVideo: b.mutation<AdminVideo, { id: number; body: VideoPayload }>({
      query: ({ id, body }) => ({
        url: `/api/admin/videos/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Video', id }, 'Video'],
    }),
    updateVideoStatus: b.mutation<AdminVideo, number>({
      query: id => ({ url: `/api/admin/videos/${id}/status`, method: 'PATCH' }),
      invalidatesTags: ['Video'],
    }),
    deleteVideo: b.mutation<void, number>({
      query: id => ({ url: `/api/admin/videos/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Video'],
    }),
  }),
})

export const {
  useListVideosQuery,
  useGetVideoQuery,
  useCreateVideoMutation,
  useUpdateVideoMutation,
  useUpdateVideoStatusMutation,
  useDeleteVideoMutation,
} = videosApi
