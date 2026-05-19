import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import FindingsListPage from './pages/FindingsListPage'
import FindingDetailPage from './pages/FindingDetailPage'
import FindingFormPage from './pages/FindingFormPage'
import SearchPage from './pages/SearchPage'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><FindingsListPage /></PrivateRoute>} />
      <Route path="/hallazgos/:id" element={<PrivateRoute><FindingDetailPage /></PrivateRoute>} />
      <Route path="/nuevo" element={<PrivateRoute><FindingFormPage /></PrivateRoute>} />
      <Route path="/busqueda" element={<PrivateRoute><SearchPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
