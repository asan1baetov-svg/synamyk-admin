import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Dashboard } from '@/pages/Dashboard'
import { Login } from '@/pages/Login'
import { Users } from '@/pages/Users'
import { Tests } from '@/pages/Tests'
import { VideoLessons } from '@/pages/VideoLessons'
import { News } from '@/pages/News'
import { Rating } from '@/pages/Rating'
import { Payments } from '@/pages/Payments'
import { OnlineGames } from '@/pages/OnlineGames'
import { Settings } from '@/pages/Settings'
import { Roles } from '@/pages/Roles'
import { ProtectedRoute } from '@/components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/tests" element={<ProtectedRoute><Tests /></ProtectedRoute>} />
        <Route path="/videos" element={<ProtectedRoute><VideoLessons /></ProtectedRoute>} />
        <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
        <Route path="/rating" element={<ProtectedRoute><Rating /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
        <Route path="/games" element={<ProtectedRoute><OnlineGames /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
