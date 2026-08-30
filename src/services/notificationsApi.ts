import { baseApi } from './baseApi'
import type {
  BroadcastCreateResponse,
  BroadcastDetail,
  BroadcastHistoryEntry,
  BroadcastPayload,
  Page,
  PushStatusResponse,
} from '@/types/api'

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: b => ({
    broadcast: b.mutation<BroadcastCreateResponse, BroadcastPayload>({
      query: body => ({
        url: '/api/admin/notifications/broadcast',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Broadcast', 'PushStatus'],
    }),
    getBroadcast: b.query<BroadcastDetail, number>({
      query: id => `/api/admin/notifications/broadcast/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Broadcast', id }],
    }),
    cancelBroadcast: b.mutation<void, number>({
      query: id => ({
        url: `/api/admin/notifications/broadcast/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Broadcast', 'PushStatus'],
    }),
    listBroadcasts: b.query<Page<BroadcastHistoryEntry>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 20 }) =>
        `/api/admin/notifications/broadcast?page=${page}&size=${size}`,
      providesTags: ['Broadcast'],
    }),
    pushStatus: b.query<PushStatusResponse, void>({
      query: () => '/api/admin/notifications/status',
      providesTags: ['PushStatus'],
    }),
  }),
})

export const {
  useBroadcastMutation,
  useGetBroadcastQuery,
  useCancelBroadcastMutation,
  useListBroadcastsQuery,
  usePushStatusQuery,
} = notificationsApi
