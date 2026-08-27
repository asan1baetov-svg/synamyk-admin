import { Box } from '@mui/material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
} from 'recharts'
import { Layout } from '@/components/layout/Layout'
import { StatsCard } from '@/components/shared/StatsCard'
import { Select } from '@/components/ui/Select'

const activityData = [
  { name: 'Регистрация', value: 48 },
  { name: 'Тест', value: 141 },
  { name: 'Онлайн-игра', value: 11 },
  { name: 'Продажи', value: 20 },
]

const successData = [
  { name: 'ОРТ', value: 26 },
  { name: 'Математика', value: 14 },
  { name: 'Логика', value: 50 },
  { name: 'Английский', value: 43 },
  { name: 'Кыргыз', value: 100 },
]

const periodOptions = [
  { value: '24h', label: '24 часа' },
  { value: '7d', label: '7 дней' },
  { value: '30d', label: '30 дней' },
]

function Icon1() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="8.5" cy="7.5" r="3.5" fill="#16a34a" />
      <path d="M1.5 19.5C1.5 16 4.7 13.5 8.5 13.5C12.3 13.5 15.5 16 15.5 19.5z" fill="#16a34a" />
      <circle cx="17.5" cy="8" r="2.5" fill="#4ade80" />
      <path
        d="M13.5 19.5C13.5 17.2 15.3 15.5 17.5 15.5C19.7 15.5 21.5 17.2 21.5 19.5z"
        fill="#4ade80"
      />
    </svg>
  )
}

function Icon2() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="4.5" y="3" width="15" height="19" rx="2" fill="#0d9488" />
      <rect x="9" y="1.5" width="6" height="3.5" rx="1" fill="#0f766e" />
      <path
        d="M8.5 13L11 15.5L16 10.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Icon3() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7.5" r="3.5" fill="#9333ea" />
      <path d="M2 19.5C2 16.2 5.1 13.5 9 13.5z" fill="#9333ea" />
      <circle cx="19.5" cy="7.5" r="4" fill="#c084fc" />
      <line
        x1="19.5"
        y1="5"
        x2="19.5"
        y2="10"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="17"
        y1="7.5"
        x2="22"
        y2="7.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Icon4() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="8" width="18" height="13" rx="2.5" fill="#ea580c" />
      <path
        d="M9 8V6.5A3 3 0 0 1 12 3.5A3 3 0 0 1 15 6.5V8"
        stroke="#ea580c"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="3" y="13" width="18" height="2" fill="#c2410c" />
      <circle cx="12" cy="14" r="2.5" fill="#fed7aa" />
    </svg>
  )
}

export function Dashboard() {
  return (
    <Layout searchPlaceholder="Поиск по тестам, урокам, пользователям..." createLabel="Создать">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Stats cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
          <Box>
            <StatsCard
              icon={<Icon1 />}
              value="1 320"
              label="Активные пользователи"
              sub="Онлайн за последние 24ч."
              iconBg="bg-green-50"
            />
          </Box>
          <Box>
            <StatsCard
              icon={<Icon2 />}
              value="12 084"
              label="Пройдено тестов"
              sub="Всего за 24ч."
              iconBg="bg-teal-50"
            />
          </Box>
          <Box>
            <StatsCard
              icon={<Icon3 />}
              value="178"
              label="Новые регистрации"
              sub="Новичков сегодня"
              iconBg="bg-purple-50"
            />
          </Box>
          <Box>
            <StatsCard
              icon={<Icon4 />}
              value="94 500 сом"
              label="Продажи"
              sub="Доход за неделю"
              iconBg="bg-orange-50"
            />
          </Box>
        </Box>

        {/* Charts */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3 }}>
          <Box>
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '1px solid #edf0f5',
                padding: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
                  График активности пользователей
                </Box>
                <Select
                  defaultValue="24h"
                  options={periodOptions}
                  sx={{ minWidth: '120px' }}
                />
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#edf0f5" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #edf0f5',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#3b6ff0" radius={8}>
                    <LabelList dataKey="value" position="top" fill="#0f172a" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          <Box>
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '1px solid #edf0f5',
                padding: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
                  График успешности тестов
                </Box>
                <Select
                  defaultValue="24h"
                  options={periodOptions}
                  sx={{ minWidth: '120px' }}
                />
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={successData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#edf0f5" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #edf0f5',
                      borderRadius: '8px',
                    }}
                  />
                  <ReferenceLine y={40} stroke="#cbd5e1" strokeDasharray="5 5" />
                  <Bar dataKey="value" fill="#3b6ff0" radius={8}>
                    <LabelList dataKey="value" position="top" fill="#0f172a" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Box>
      </Box>
    </Layout>
  )
}
