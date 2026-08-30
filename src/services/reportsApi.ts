import { baseApi } from './baseApi'
import type {
  ActiveSessionEntry,
  OverviewReportResponse,
  PaymentReportResponse,
  ReportPeriod,
  TestReportResponse,
} from '@/types/api'

export interface PeriodArg {
  period?: ReportPeriod
  from?: string
  to?: string
}

const periodQs = (a: PeriodArg) => {
  const p = new URLSearchParams()
  if (a.from) p.set('from', a.from)
  if (a.to) p.set('to', a.to)
  if (!a.from && !a.to && a.period) p.set('period', a.period)
  return p.toString()
}

export const reportsApi = baseApi.injectEndpoints({
  endpoints: b => ({
    overviewReport: b.query<OverviewReportResponse, PeriodArg>({
      query: a => `/api/admin/reports/overview?${periodQs(a)}`,
      providesTags: ['Report'],
    }),
    testsReport: b.query<TestReportResponse, PeriodArg>({
      query: a => `/api/admin/reports/tests?${periodQs(a)}`,
      providesTags: ['Report'],
    }),
    paymentsReport: b.query<PaymentReportResponse, PeriodArg>({
      query: a => `/api/admin/reports/payments?${periodQs(a)}`,
      providesTags: ['Report'],
    }),
    activeSessions: b.query<ActiveSessionEntry[], void>({
      query: () => '/api/admin/reports/active-sessions',
    }),
  }),
})

export const {
  useOverviewReportQuery,
  useTestsReportQuery,
  usePaymentsReportQuery,
  useActiveSessionsQuery,
} = reportsApi
