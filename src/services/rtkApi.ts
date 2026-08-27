import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { User, UsersResponse, GameTest, Video, VideosResponse, News, NewsResponse, Test, TestsResponse, TestQuestion } from './api'

export const rtkApi = createApi({
  reducerPath: 'rtkApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://synamyk-production.up.railway.app/api/admin',
    prepareHeaders: headers => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['User', 'Game', 'Video', 'News', 'Test'],
  endpoints: builder => ({
    // Users
    listUsers: builder.query<
      UsersResponse,
      { page?: number; size?: number; search?: string; active?: boolean; role?: string }
    >({
      query: ({ page = 0, size = 20, search, active, role }) => {
        const params = new URLSearchParams({ page: page.toString(), size: size.toString() })
        if (search) params.append('search', search)
        if (active !== undefined) params.append('active', active.toString())
        if (role) params.append('role', role)
        return `/users?${params}`
      },
      providesTags: ['User'],
    }),

    getUser: builder.query<User, number>({
      query: id => `/users/${id}`,
      providesTags: ['User'],
    }),

    updateUser: builder.mutation<User, { id: number; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    deleteUser: builder.mutation<void, number>({
      query: id => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    exportUsers: builder.query<Blob, { active?: boolean; role?: string }>({
      query: ({ active, role }) => {
        const params = new URLSearchParams()
        if (active !== undefined) params.append('active', active.toString())
        if (role) params.append('role', role)
        return `/users/export?${params}`
      },
    }),

    // Games
    listGames: builder.query<GameTest[], void>({
      query: () => '/game-tests',
      providesTags: ['Game'],
    }),

    getGame: builder.query<GameTest, number>({
      query: id => `/game-tests/${id}`,
      providesTags: ['Game'],
    }),

    updateGame: builder.mutation<GameTest, { id: number; data: Partial<GameTest> }>({
      query: ({ id, data }) => ({
        url: `/game-tests/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Game'],
    }),

    deleteGame: builder.mutation<void, number>({
      query: id => ({
        url: `/game-tests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Game'],
    }),

    // Videos
    listVideos: builder.query<
      VideosResponse,
      { page?: number; size?: number; search?: string; testId?: number; active?: boolean }
    >({
      query: ({ page = 0, size = 20, search, testId, active }) => {
        const params = new URLSearchParams({ page: page.toString(), size: size.toString() })
        if (search) params.append('search', search)
        if (testId) params.append('testId', testId.toString())
        if (active !== undefined) params.append('active', active.toString())
        return `/videos?${params}`
      },
      providesTags: ['Video'],
    }),

    getVideo: builder.query<Video, number>({
      query: id => `/videos/${id}`,
      providesTags: ['Video'],
    }),

    updateVideo: builder.mutation<Video, { id: number; data: Partial<Video> }>({
      query: ({ id, data }) => ({
        url: `/videos/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Video'],
    }),

    deleteVideo: builder.mutation<void, number>({
      query: id => ({
        url: `/videos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Video'],
    }),

    createVideo: builder.mutation<Video, Partial<Video>>({
      query: data => ({
        url: '/videos',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Video'],
    }),

    updateVideoStatus: builder.mutation<Video, number>({
      query: id => ({
        url: `/videos/${id}/status`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Video'],
    }),

    // News
    listNews: builder.query<
      NewsResponse,
      { page?: number; size?: number; search?: string; type?: string; active?: boolean; dateFrom?: string; dateTo?: string }
    >({
      query: ({ page = 0, size = 20, search, type, active, dateFrom, dateTo }) => {
        const params = new URLSearchParams({ page: page.toString(), size: size.toString() })
        if (search) params.append('search', search)
        if (type) params.append('type', type)
        if (active !== undefined) params.append('active', active.toString())
        if (dateFrom) params.append('dateFrom', dateFrom)
        if (dateTo) params.append('dateTo', dateTo)
        return `/news?${params}`
      },
      providesTags: ['News'],
    }),

    getNews: builder.query<News, number>({
      query: id => `/news/${id}`,
      providesTags: ['News'],
    }),

    createNews: builder.mutation<News, Partial<News>>({
      query: data => ({
        url: '/news',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['News'],
    }),

    updateNews: builder.mutation<News, { id: number; data: Partial<News> }>({
      query: ({ id, data }) => ({
        url: `/news/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['News'],
    }),

    deleteNews: builder.mutation<void, number>({
      query: id => ({
        url: `/news/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['News'],
    }),

    updateNewsStatus: builder.mutation<News, number>({
      query: id => ({
        url: `/news/${id}/status`,
        method: 'PATCH',
      }),
      invalidatesTags: ['News'],
    }),

    // Tests
    listTests: builder.query<
      TestsResponse,
      { page?: number; size?: number; search?: string; active?: boolean }
    >({
      query: ({ page = 0, size = 20, search, active }) => {
        const params = new URLSearchParams({ page: page.toString(), size: size.toString() })
        if (search) params.append('search', search)
        if (active !== undefined) params.append('active', active.toString())
        return `/tests?${params}`
      },
      providesTags: ['Test'],
    }),

    getTest: builder.query<Test, number>({
      query: id => `/tests/${id}`,
      providesTags: ['Test'],
    }),

    createTest: builder.mutation<Test, Partial<Test>>({
      query: data => ({
        url: '/tests',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Test'],
    }),

    updateTest: builder.mutation<Test, { id: number; data: Partial<Test> }>({
      query: ({ id, data }) => ({
        url: `/tests/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Test'],
    }),

    deleteTest: builder.mutation<void, number>({
      query: id => ({
        url: `/tests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Test'],
    }),

    updateQuestion: builder.mutation<void, { questionId: number; data: TestQuestion }>({
      query: ({ questionId, data }) => ({
        url: `/questions/${questionId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Test'],
    }),

    deleteQuestion: builder.mutation<void, number>({
      query: id => ({
        url: `/questions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Test'],
    }),
  }),
})

export const {
  useListUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useExportUsersQuery,
  useListGamesQuery,
  useGetGameQuery,
  useUpdateGameMutation,
  useDeleteGameMutation,
  useListVideosQuery,
  useGetVideoQuery,
  useUpdateVideoMutation,
  useDeleteVideoMutation,
  useCreateVideoMutation,
  useUpdateVideoStatusMutation,
  useListNewsQuery,
  useGetNewsQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
  useUpdateNewsStatusMutation,
  useListTestsQuery,
  useGetTestQuery,
  useCreateTestMutation,
  useUpdateTestMutation,
  useDeleteTestMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} = rtkApi
