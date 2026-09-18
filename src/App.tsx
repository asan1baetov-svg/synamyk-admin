import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { Login } from '@/pages/Login'

const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const TestsList = lazy(() =>
  import('@/pages/tests/TestsList').then(m => ({ default: m.TestsList }))
)
const TestDetail = lazy(() =>
  import('@/pages/tests/TestDetail').then(m => ({ default: m.TestDetail }))
)
const QuestionsPage = lazy(() =>
  import('@/pages/tests/QuestionsPage').then(m => ({ default: m.QuestionsPage }))
)
const UsersPage = lazy(() =>
  import('@/pages/users/UsersPage').then(m => ({ default: m.UsersPage }))
)
const UserDetail = lazy(() =>
  import('@/pages/users/UserDetail').then(m => ({ default: m.UserDetail }))
)
const AccessPage = lazy(() =>
  import('@/pages/access/AccessPage').then(m => ({ default: m.AccessPage }))
)
const PaymentsPage = lazy(() =>
  import('@/pages/payments/PaymentsPage').then(m => ({ default: m.PaymentsPage }))
)
const TestsReport = lazy(() =>
  import('@/pages/reports/TestsReport').then(m => ({ default: m.TestsReport }))
)
const PaymentsReport = lazy(() =>
  import('@/pages/reports/PaymentsReport').then(m => ({ default: m.PaymentsReport }))
)
const ActiveSessionsPage = lazy(() =>
  import('@/pages/reports/ActiveSessionsPage').then(m => ({ default: m.ActiveSessionsPage }))
)
const NotificationsPage = lazy(() =>
  import('@/pages/notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage }))
)
const NewsPage = lazy(() => import('@/pages/news/NewsPage').then(m => ({ default: m.NewsPage })))
const VideosPage = lazy(() =>
  import('@/pages/videos/VideosPage').then(m => ({ default: m.VideosPage }))
)
const GamesList = lazy(() =>
  import('@/pages/games/GamesList').then(m => ({ default: m.GamesList }))
)
const GameDetail = lazy(() =>
  import('@/pages/games/GameDetail').then(m => ({ default: m.GameDetail }))
)
const ProductsPage = lazy(() =>
  import('@/pages/catalog/ProductsPage').then(m => ({ default: m.ProductsPage }))
)
const ReadingTextsPage = lazy(() =>
  import('@/pages/catalog/ReadingTextsPage').then(m => ({ default: m.ReadingTextsPage }))
)
const SchoolsPage = lazy(() =>
  import('@/pages/catalog/SchoolsPage').then(m => ({ default: m.SchoolsPage }))
)
const RatingPage = lazy(() =>
  import('@/pages/rating/RatingPage').then(m => ({ default: m.RatingPage }))
)

function PageFallback() {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
      Загрузка…
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            path="*"
            element={
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="reports/overview" element={<Dashboard />} />
                  <Route path="reports/tests" element={<TestsReport />} />
                  <Route path="reports/payments" element={<PaymentsReport />} />
                  <Route path="reports/active" element={<ActiveSessionsPage />} />

                  <Route path="tests" element={<TestsList />} />
                  <Route path="tests/:testId" element={<TestDetail />} />
                  <Route
                    path="tests/:testId/sub-tests/:subTestId/questions"
                    element={<QuestionsPage />}
                  />

                  <Route path="games" element={<GamesList />} />
                  <Route path="games/:gameId" element={<GameDetail />} />

                  <Route path="news" element={<NewsPage />} />
                  <Route path="videos" element={<VideosPage />} />
                  <Route path="texts" element={<ReadingTextsPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="schools" element={<SchoolsPage />} />

                  <Route path="users" element={<UsersPage />} />
                  <Route path="users/:userId" element={<UserDetail />} />
                  <Route path="access" element={<AccessPage />} />

                  <Route path="payments" element={<PaymentsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="rating" element={<RatingPage />} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
