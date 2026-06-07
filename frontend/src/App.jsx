// App.jsx
// Root router — defines all routes and protection rules.
// Public routes: /login
// Protected routes: everything else (redirects to /login if not authenticated)

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import LoadingSpinner from './components/ui/LoadingSpinner'

// ── Pages (lazy-loadable in future) ──────────────────────────────────────────
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Departments from './pages/Departments'
import Positions from './pages/Positions'
import Leaves from './pages/Leaves'
import Attendance from './pages/Attendance'
import Payroll from './pages/Payroll'
import Recruitment from './pages/Recruitment'
import Appraisals from './pages/Appraisals'
import Training from './pages/Training'
import Disciplinary from './pages/Disciplinary'
import Exit from './pages/Exit'
import Profile from './pages/Profile'

// ── Protected Route wrapper ───────────────────────────────────────────────────
function ProtectedRoute ({ children, roles }) {
  const { isLoggedIn, role, loading } = useAuth()

  if (loading) return <LoadingSpinner message='Authenticating...' />
  if (!isLoggedIn) return <Navigate to='/login' replace />

  // Role-based guard
  if (roles && !roles.includes(role)) {
    return <Navigate to='/dashboard' replace />
  }

  return children
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App () {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Toast notifications */}
        <Toaster
          position='top-right'
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#f1f5f9',
              border: '1px solid rgba(124,58,237,0.3)',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '0.875rem'
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
          }}
        />

        <Routes>
          {/* Public */}
          <Route path='/login' element={<Login />} />

          {/* Protected — all inside MainLayout */}
          <Route
            path='/'
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to='/dashboard' replace />} />
            <Route path='dashboard' element={<Dashboard />} />
            <Route
              path='employees'
              element={
                <ProtectedRoute roles={['super_admin', 'hr_manager', 'hod']}>
                  <Employees />
                </ProtectedRoute>
              }
            />
            <Route
              path='departments'
              element={
                <ProtectedRoute roles={['super_admin', 'hr_manager']}>
                  <Departments />
                </ProtectedRoute>
              }
            />
            <Route
              path='positions'
              element={
                <ProtectedRoute roles={['super_admin', 'hr_manager']}>
                  <Positions />
                </ProtectedRoute>
              }
            />
            <Route path='leaves' element={<Leaves />} />
            <Route path='attendance' element={<Attendance />} />
            <Route
              path='payroll'
              element={
                <ProtectedRoute
                  roles={['super_admin', 'hr_manager', 'payroll_officer']}
                >
                  <Payroll />
                </ProtectedRoute>
              }
            />
            <Route
              path='recruitment'
              element={
                <ProtectedRoute roles={['super_admin', 'hr_manager']}>
                  <Recruitment />
                </ProtectedRoute>
              }
            />
            <Route path='appraisals' element={<Appraisals />} />
            <Route path='training' element={<Training />} />
            <Route
              path='disciplinary'
              element={
                <ProtectedRoute roles={['super_admin', 'hr_manager']}>
                  <Disciplinary />
                </ProtectedRoute>
              }
            />
            <Route
              path='exit'
              element={
                <ProtectedRoute roles={['super_admin', 'hr_manager']}>
                  <Exit />
                </ProtectedRoute>
              }
            />
            <Route path='profile' element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path='*' element={<Navigate to='/dashboard' replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
