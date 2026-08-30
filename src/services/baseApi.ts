import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Test',
    'TestList',
    'SubTest',
    'Question',
    'Subject',
    'User',
    'Access',
    'Payment',
    'Report',
    'Broadcast',
    'PushStatus',
    'News',
    'Video',
    'Game',
    'GameReport',
    'Rating',
  ],
  endpoints: () => ({}),
})
