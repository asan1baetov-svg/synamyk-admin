import { Layout } from '@/components/layout/Layout'
import { PageHeader } from '@/components/shared/PageHeader'

export function Roles() {
  return (
    <Layout>
      <PageHeader title="Роли админов" />
      <div className="rounded-xl border border-[#e8ecf0] bg-white p-8 text-center text-[#9ca3af]">
        Страница ролей в разработке
      </div>
    </Layout>
  )
}
