import { baseApi } from './baseApi'
import type {
  AdminQuestion,
  AdminSubTest,
  AdminTest,
  AdminTestListItem,
  Page,
  Passage,
  PassagePayload,
  PricingPayload,
  QuestionPayload,
  SchedulePayload,
  SubTestPayload,
  TestPayload,
} from '@/types/api'

interface TestListArgs {
  page?: number
  size?: number
  search?: string
  subject?: string
  active?: boolean
}

export const testsApi = baseApi.injectEndpoints({
  endpoints: b => ({
    listTests: b.query<Page<AdminTestListItem>, TestListArgs>({
      query: ({ page = 0, size = 20, search, subject, active }) => {
        const p = new URLSearchParams({ page: String(page), size: String(size) })
        if (search) p.set('search', search)
        if (subject) p.set('subject', subject)
        if (active !== undefined) p.set('active', String(active))
        return `/api/admin/tests?${p}`
      },
      providesTags: ['TestList'],
    }),

    listTestsFull: b.query<AdminTest[], void>({
      query: () => '/api/admin/tests?full=true',
      providesTags: ['TestList'],
    }),

    testSubjects: b.query<string[], void>({
      query: () => '/api/admin/tests/subjects',
      providesTags: ['Subject'],
    }),

    getTest: b.query<AdminTest, number>({
      query: id => `/api/admin/tests/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Test', id }],
    }),

    createTest: b.mutation<AdminTest, TestPayload>({
      query: body => ({ url: '/api/admin/tests', method: 'POST', body }),
      invalidatesTags: ['TestList', 'Subject'],
    }),

    updateTest: b.mutation<AdminTest, { id: number; body: TestPayload }>({
      query: ({ id, body }) => ({
        url: `/api/admin/tests/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Test', id }, 'TestList', 'Subject'],
    }),

    deleteTest: b.mutation<void, number>({
      query: id => ({ url: `/api/admin/tests/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Test', id }, 'TestList'],
    }),

    updatePricing: b.mutation<AdminTest, { id: number; body: PricingPayload }>({
      query: ({ id, body }) => ({
        url: `/api/admin/tests/${id}/pricing`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Test', id }, 'TestList'],
    }),

    updateTestSchedule: b.mutation<AdminTest, { id: number; body: SchedulePayload }>({
      query: ({ id, body }) => ({
        url: `/api/admin/tests/${id}/schedule`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Test', id }, 'TestList'],
    }),

    updateSubTestSchedule: b.mutation<
      AdminSubTest,
      { subTestId: number; testId: number; body: SchedulePayload }
    >({
      query: ({ subTestId, body }) => ({
        url: `/api/admin/sub-tests/${subTestId}/schedule`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { testId }) => [{ type: 'Test', id: testId }],
    }),

    setSubTestPaid: b.mutation<AdminSubTest, { subTestId: number; paid: boolean; testId: number }>({
      query: ({ subTestId, paid }) => ({
        url: `/api/admin/sub-tests/${subTestId}/paid?paid=${paid}`,
        method: 'PATCH',
      }),
      invalidatesTags: (_r, _e, { testId }) => [{ type: 'Test', id: testId }],
    }),

    createSubTest: b.mutation<AdminSubTest, { testId: number; body: SubTestPayload }>({
      query: ({ testId, body }) => ({
        url: `/api/admin/tests/${testId}/sub-tests`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { testId }) => [{ type: 'Test', id: testId }, 'TestList'],
    }),

    updateSubTest: b.mutation<
      AdminSubTest,
      { subTestId: number; testId: number; body: SubTestPayload }
    >({
      query: ({ subTestId, body }) => ({
        url: `/api/admin/sub-tests/${subTestId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { testId }) => [{ type: 'Test', id: testId }],
    }),

    deleteSubTest: b.mutation<void, { subTestId: number; testId: number }>({
      query: ({ subTestId }) => ({
        url: `/api/admin/sub-tests/${subTestId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { testId }) => [{ type: 'Test', id: testId }, 'TestList'],
    }),

    listQuestions: b.query<AdminQuestion[], number>({
      query: subTestId => `/api/admin/sub-tests/${subTestId}/questions`,
      providesTags: (_r, _e, subTestId) => [{ type: 'Question', id: subTestId }],
    }),

    createQuestion: b.mutation<
      AdminQuestion,
      { subTestId: number; testId?: number; body: QuestionPayload }
    >({
      query: ({ subTestId, body }) => ({
        url: `/api/admin/sub-tests/${subTestId}/questions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { subTestId, testId }) => [
        { type: 'Question', id: subTestId },
        { type: 'Passage', id: subTestId },
        ...(testId ? [{ type: 'Test' as const, id: testId }] : []),
        'TestList',
      ],
    }),

    updateQuestion: b.mutation<
      AdminQuestion,
      { questionId: number; subTestId: number; testId?: number; body: QuestionPayload }
    >({
      query: ({ questionId, body }) => ({
        url: `/api/admin/questions/${questionId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { subTestId, testId }) => [
        { type: 'Question', id: subTestId },
        { type: 'Passage', id: subTestId },
        ...(testId ? [{ type: 'Test' as const, id: testId }] : []),
      ],
    }),

    deleteQuestion: b.mutation<void, { questionId: number; subTestId: number; testId?: number }>({
      query: ({ questionId }) => ({
        url: `/api/admin/questions/${questionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { subTestId, testId }) => [
        { type: 'Question', id: subTestId },
        ...(testId ? [{ type: 'Test' as const, id: testId }] : []),
        'TestList',
      ],
    }),

    listPassages: b.query<Passage[], number>({
      query: subTestId => `/api/admin/sub-tests/${subTestId}/passages`,
      providesTags: (_r, _e, subTestId) => [{ type: 'Passage', id: subTestId }],
    }),

    createPassage: b.mutation<Passage, { subTestId: number; body: PassagePayload }>({
      query: ({ subTestId, body }) => ({
        url: `/api/admin/sub-tests/${subTestId}/passages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { subTestId }) => [{ type: 'Passage', id: subTestId }],
    }),

    updatePassage: b.mutation<
      Passage,
      { passageId: number; subTestId: number; body: PassagePayload }
    >({
      query: ({ passageId, body }) => ({
        url: `/api/admin/passages/${passageId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { subTestId }) => [{ type: 'Passage', id: subTestId }],
    }),

    deletePassage: b.mutation<void, { passageId: number; subTestId: number }>({
      query: ({ passageId }) => ({ url: `/api/admin/passages/${passageId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { subTestId }) => [{ type: 'Passage', id: subTestId }],
    }),
  }),
})

export const {
  useListTestsQuery,
  useListTestsFullQuery,
  useTestSubjectsQuery,
  useGetTestQuery,
  useCreateTestMutation,
  useUpdateTestMutation,
  useDeleteTestMutation,
  useUpdatePricingMutation,
  useUpdateTestScheduleMutation,
  useUpdateSubTestScheduleMutation,
  useSetSubTestPaidMutation,
  useCreateSubTestMutation,
  useUpdateSubTestMutation,
  useDeleteSubTestMutation,
  useListQuestionsQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useListPassagesQuery,
  useCreatePassageMutation,
  useUpdatePassageMutation,
  useDeletePassageMutation,
} = testsApi
