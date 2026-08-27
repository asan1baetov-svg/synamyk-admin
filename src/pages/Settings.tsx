import { Layout } from '@/components/layout/Layout'
import { PageHeader } from '@/components/shared/PageHeader'

export function Settings() {
  return (
    <Layout>
      <PageHeader title="Настройки" />
      <div className="rounded-xl border border-[#e8ecf0] bg-white p-8 text-center text-[#9ca3af]">
        Страница настроек в разработке
      </div>
    </Layout>
  )
}
