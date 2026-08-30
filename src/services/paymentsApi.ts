import { baseApi } from './baseApi'
import { API_URL } from '@/lib/config'
import { getToken } from '@/lib/auth'
import type { AdminPayment, Page, PaymentStatus } from '@/types/api'

interface PaymentListArgs {
  page?: number
  size?: number
  search?: string
  status?: PaymentStatus | ''
  dateFrom?: string
  dateTo?: string
}

const paymentsQs = (a: Omit<PaymentListArgs, 'page' | 'size'>) => {
  const p = new URLSearchParams()
  if (a.search) p.set('search', a.search)
  if (a.status) p.set('status', a.status)
  if (a.dateFrom) p.set('dateFrom', a.dateFrom)
  if (a.dateTo) p.set('dateTo', a.dateTo)
  return p
}

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: b => ({
    listPayments: b.query<Page<AdminPayment>, PaymentListArgs>({
      query: ({ page = 0, size = 20, ...rest }) => {
        const p = paymentsQs(rest)
        p.set('page', String(page))
        p.set('size', String(size))
        return `/api/admin/payments?${p}`
      },
      providesTags: ['Payment'],
    }),
    getPayment: b.query<AdminPayment, number>({
      query: id => `/api/admin/payments/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Payment', id }],
    }),
    setPaymentStatus: b.mutation<AdminPayment, { id: number; status: PaymentStatus }>({
      query: ({ id, status }) => ({
        url: `/api/admin/payments/${id}/status?status=${status}`,
        method: 'PATCH',
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Payment', id }, 'Payment'],
    }),
    deletePayment: b.mutation<void, number>({
      query: id => ({ url: `/api/admin/payments/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Payment'],
    }),
  }),
})

export async function exportPayments(
  format: 'csv' | 'excel',
  args: Omit<PaymentListArgs, 'page' | 'size'>
): Promise<Blob> {
  const p = paymentsQs(args)
  p.set('format', format)
  const res = await fetch(`${API_URL}/api/admin/payments/export?${p}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error('export failed')
  return res.blob()
}

export const {
  useListPaymentsQuery,
  useGetPaymentQuery,
  useSetPaymentStatusMutation,
  useDeletePaymentMutation,
} = paymentsApi
