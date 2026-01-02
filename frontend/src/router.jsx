import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.jsx'
import HomePage from './pages/HomePage.jsx'
import WelcomePage from './pages/WelcomePage.jsx'
import LoginPage from './pages/Auth/LoginPage.jsx'
import RegisterPage from './pages/Auth/RegisterPage.jsx'
import JoinRoomPage from './pages/Rooms/JoinRoomPage.jsx' 
import RoomsListPage from './pages/Rooms/RoomsListPage.jsx'
import RoomDetailPage from './pages/Rooms/RoomDetailPage.jsx'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/" replace />
}

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/welcome" element={<ProtectedRoute><WelcomePage /></ProtectedRoute>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/rooms" element={<ProtectedRoute><RoomsListPage /></ProtectedRoute>} />
      <Route path="/rooms/:id" element={<ProtectedRoute><RoomDetailPage /></ProtectedRoute>} />
      <Route path="/join" element={<ProtectedRoute><JoinRoomPage /></ProtectedRoute>} />  
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
