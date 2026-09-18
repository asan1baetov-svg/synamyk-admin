import { baseApi } from './baseApi'
import type {
  AllAccessPayload,
  AppConfig,
  District,
  DistrictPayload,
  Page,
  Product,
  ProductCode,
  ProductPayload,
  ReadingText,
  ReadingTextPayload,
  Region,
  School,
  SchoolPayload,
} from '@/types/api'

interface SchoolListArgs {
  districtId: number
  search?: string
  active?: boolean
  page?: number
  size?: number
}

export const catalogApi = baseApi.injectEndpoints({
  endpoints: b => ({
    /* ───── products & settings ───── */

    listProducts: b.query<Product[], void>({
      query: () => '/api/admin/products',
      providesTags: ['Product'],
    }),

    updateProduct: b.mutation<Product, { code: ProductCode; body: ProductPayload }>({
      query: ({ code, body }) => ({ url: `/api/admin/products/${code}`, method: 'PUT', body }),
      invalidatesTags: ['Product'],
    }),

    /** Public app config — the only place the current ОРТ date can be read back. */
    appConfig: b.query<AppConfig, void>({
      query: () => '/api/app/config',
      providesTags: ['AppConfig'],
    }),

    setOrtExamDate: b.mutation<AppConfig, string | null>({
      query: date => ({
        url: '/api/admin/settings/ort-exam-date',
        method: 'PUT',
        body: { date },
      }),
      invalidatesTags: ['AppConfig'],
    }),

    grantAllAccess: b.mutation<{ success: boolean; message: string }, AllAccessPayload>({
      query: body => ({ url: '/api/admin/all-access', method: 'POST', body }),
    }),

    revokeAllAccess: b.mutation<void, { userId: number; product: ProductCode }>({
      query: ({ userId, product }) => ({
        url: `/api/admin/all-access?userId=${userId}&product=${product}`,
        method: 'DELETE',
      }),
    }),

    /* ───── reading library ───── */

    listReadingTexts: b.query<ReadingText[], void>({
      query: () => '/api/admin/texts',
      providesTags: ['ReadingText'],
    }),

    uploadTextPdf: b.mutation<{ key: string }, File>({
      query: file => {
        const form = new FormData()
        form.append('file', file)
        return { url: '/api/admin/texts/pdf', method: 'POST', body: form }
      },
    }),

    createReadingText: b.mutation<ReadingText, ReadingTextPayload>({
      query: body => ({ url: '/api/admin/texts', method: 'POST', body }),
      invalidatesTags: ['ReadingText'],
    }),

    updateReadingText: b.mutation<ReadingText, { id: number; body: ReadingTextPayload }>({
      query: ({ id, body }) => ({ url: `/api/admin/texts/${id}`, method: 'PUT', body }),
      invalidatesTags: ['ReadingText'],
    }),

    deleteReadingText: b.mutation<void, number>({
      query: id => ({ url: `/api/admin/texts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ReadingText'],
    }),

    /* ───── regions / districts / schools ───── */

    listRegions: b.query<Region[], void>({
      query: () => '/api/regions',
      providesTags: ['Region'],
    }),

    listDistricts: b.query<District[], number>({
      query: regionId => `/api/admin/regions/${regionId}/districts`,
      providesTags: (_r, _e, regionId) => [{ type: 'District', id: regionId }],
    }),

    createDistrict: b.mutation<District, DistrictPayload>({
      query: body => ({ url: '/api/admin/districts', method: 'POST', body }),
      invalidatesTags: (_r, _e, { regionId }) => [{ type: 'District', id: regionId }],
    }),

    updateDistrict: b.mutation<District, { id: number; body: DistrictPayload }>({
      query: ({ id, body }) => ({ url: `/api/admin/districts/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { body }) => [{ type: 'District', id: body.regionId }],
    }),

    listSchools: b.query<Page<School>, SchoolListArgs>({
      query: ({ districtId, search, active, page = 0, size = 50 }) => {
        const p = new URLSearchParams({ page: String(page), size: String(size) })
        if (search) p.set('search', search)
        if (active !== undefined) p.set('active', String(active))
        return `/api/admin/districts/${districtId}/schools?${p}`
      },
      providesTags: (_r, _e, { districtId }) => [{ type: 'School', id: districtId }],
    }),

    createSchool: b.mutation<School, SchoolPayload>({
      query: body => ({ url: '/api/admin/schools', method: 'POST', body }),
      invalidatesTags: (_r, _e, { districtId }) => [{ type: 'School', id: districtId }],
    }),

    updateSchool: b.mutation<School, { id: number; body: SchoolPayload }>({
      query: ({ id, body }) => ({ url: `/api/admin/schools/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { body }) => [{ type: 'School', id: body.districtId }],
    }),

    bulkCreateSchools: b.mutation<{ created: number }, { districtId: number; names: string[] }>({
      query: body => ({ url: '/api/admin/schools/bulk', method: 'POST', body }),
      invalidatesTags: (_r, _e, { districtId }) => [{ type: 'School', id: districtId }],
    }),
  }),
})

export const {
  useListProductsQuery,
  useUpdateProductMutation,
  useAppConfigQuery,
  useSetOrtExamDateMutation,
  useGrantAllAccessMutation,
  useRevokeAllAccessMutation,
  useListReadingTextsQuery,
  useUploadTextPdfMutation,
  useCreateReadingTextMutation,
  useUpdateReadingTextMutation,
  useDeleteReadingTextMutation,
  useListRegionsQuery,
  useListDistrictsQuery,
  useCreateDistrictMutation,
  useUpdateDistrictMutation,
  useListSchoolsQuery,
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useBulkCreateSchoolsMutation,
} = catalogApi
