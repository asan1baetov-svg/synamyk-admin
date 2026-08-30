import { baseApi } from './baseApi'
import type { UploadResponse, UploadType } from '@/types/api'

export const uploadApi = baseApi.injectEndpoints({
  endpoints: b => ({
    uploadImage: b.mutation<UploadResponse, { file: File; type: UploadType }>({
      query: ({ file, type }) => {
        const form = new FormData()
        form.append('file', file)
        return {
          url: `/api/upload?type=${type}`,
          method: 'POST',
          body: form,
        }
      },
    }),
  }),
})

export const { useUploadImageMutation } = uploadApi
