// context/AuthContext.jsx
// Global authentication state provider.
// Wraps the whole app — provides user, login, logout to any component.

import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback
} from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function AuthProvider ({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on first load
  useEffect(() => {
    const stored = localStorage.getItem('hrms_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('hrms_user')
      }
    }
    setLoading(false)
  }, [])

  // Login — calls backend, stores user + token
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('hrms_user', JSON.stringify(data))
    setUser(data)
    return data
  }, [])

  // Logout — clears everything
  const logout = useCallback(() => {
    localStorage.removeItem('hrms_user')
    setUser(null)
  }, [])

  // Check if user has a specific role
  const hasRole = useCallback(
    (...roles) => {
      return roles.includes(user?.user?.role)
    },
    [user]
  )

  const value = {
    user, // full user object from backend
    role: user?.user?.role,
    token: user?.token,
    login,
    logout,
    hasRole,
    loading,
    isLoggedIn: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
