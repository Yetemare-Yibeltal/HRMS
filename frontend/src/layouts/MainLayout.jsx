// layouts/MainLayout.jsx
// Root layout for all authenticated pages.
// Contains: sidebar navigation, top bar, main content area.
// Sidebar collapses on mobile and can be toggled.

import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import GradientText from '../components/ui/GradientText'
import ParticleBackground from '../components/3d/ParticleBackground'

// ── Navigation items per role ─────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    group: 'Overview',
    items: [
      {
        path: '/dashboard',
        label: 'Dashboard',
        icon: '📊',
        roles: [
          'super_admin',
          'hr_manager',
          'hod',
          'employee',
          'payroll_officer'
        ]
      }
    ]
  },
  {
    group: 'Organization',
    items: [
      {
        path: '/employees',
        label: 'Employees',
        icon: '👥',
        roles: ['super_admin', 'hr_manager', 'hod']
      },
      {
        path: '/departments',
        label: 'Departments',
        icon: '🏢',
        roles: ['super_admin', 'hr_manager']
      },
      {
        path: '/positions',
        label: 'Positions',
        icon: '💼',
        roles: ['super_admin', 'hr_manager']
      }
    ]
  },
  {
    group: 'HR Operations',
    items: [
      {
        path: '/leaves',
        label: 'Leave',
        icon: '🌿',
        roles: ['super_admin', 'hr_manager', 'hod', 'employee']
      },
      {
        path: '/attendance',
        label: 'Attendance',
        icon: '📅',
        roles: ['super_admin', 'hr_manager', 'hod', 'employee']
      },
      {
        path: '/payroll',
        label: 'Payroll',
        icon: '💰',
        roles: ['super_admin', 'hr_manager', 'payroll_officer']
      },
      {
        path: '/recruitment',
        label: 'Recruitment',
        icon: '📋',
        roles: ['super_admin', 'hr_manager']
      }
    ]
  },
  {
    group: 'Performance',
    items: [
      {
        path: '/appraisals',
        label: 'Appraisals',
        icon: '⭐',
        roles: ['super_admin', 'hr_manager', 'hod', 'employee']
      },
      {
        path: '/training',
        label: 'Training',
        icon: '📚',
        roles: ['super_admin', 'hr_manager', 'hod', 'employee']
      }
    ]
  },
  {
    group: 'Administration',
    items: [
      {
        path: '/disciplinary',
        label: 'Disciplinary',
        icon: '⚖️',
        roles: ['super_admin', 'hr_manager']
      },
      {
        path: '/exit',
        label: 'Exit',
        icon: '🚪',
        roles: ['super_admin', 'hr_manager']
      },
      {
        path: '/profile',
        label: 'My Profile',
        icon: '👤',
        roles: [
          'super_admin',
          'hr_manager',
          'hod',
          'employee',
          'payroll_officer'
        ]
      }
    ]
  }
]

// ── Sidebar Component ─────────────────────────────────────────────────────────
function Sidebar ({ open, onClose }) {
  const { role, logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Filter nav items based on role
  const visibleGroups = NAV_ITEMS.map(group => ({
    ...group,
    items: group.items.filter(item => item.roles.includes(role))
  })).filter(group => group.items.length > 0)

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 40,
              display: 'block'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '260px',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(5,5,15,0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--clr-border)',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
        initial={false}
        animate={{ x: open ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--clr-border)',
            flexShrink: 0
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.5rem'
            }}
          >
            {/* University seal */}
            <motion.div
              style={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'var(--grad-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                flexShrink: 0
              }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              🎓
            </motion.div>

            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.12em',
                  color: 'var(--clr-muted)',
                  textTransform: 'uppercase'
                }}
              >
                Injibara University
              </div>
              <GradientText
                font='cinzel'
                animate
                style={{ fontSize: '0.9rem', fontWeight: 700 }}
              >
                HRMS
              </GradientText>
            </div>
          </div>

          {/* User info */}
          <div
            style={{
              marginTop: '0.75rem',
              padding: '0.6rem 0.75rem',
              background: 'rgba(124,58,237,0.08)',
              borderRadius: '8px',
              border: '1px solid rgba(124,58,237,0.15)'
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--clr-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}
            >
              {role?.replace('_', ' ')}
            </div>
            <div
              style={{
                fontSize: '0.82rem',
                color: 'var(--clr-text)',
                fontWeight: 600,
                marginTop: '0.1rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {user?.user?.email}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          {visibleGroups.map(group => (
            <div key={group.group} style={{ marginBottom: '1.5rem' }}>
              {/* Group label */}
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: 'var(--clr-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  padding: '0 0.5rem',
                  marginBottom: '0.4rem'
                }}
              >
                {group.group}
              </div>

              {/* Nav items */}
              {group.items.map(item => {
                const isActive = location.pathname.startsWith(item.path)
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => window.innerWidth < 768 && onClose()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      marginBottom: '0.15rem',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#fff' : 'var(--clr-muted)',
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(219,39,119,0.15))'
                        : 'transparent',
                      borderLeft: isActive
                        ? '3px solid #7c3aed'
                        : '3px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Logout button */}
        <div
          style={{
            padding: '1rem 0.75rem',
            borderTop: '1px solid var(--clr-border)',
            flexShrink: 0
          }}
        >
          <button
            onClick={handleLogout}
            className='btn-ghost'
            style={{ width: '100%', textAlign: 'left' }}
          >
            🚪 &nbsp; Sign Out
          </button>
        </div>
      </motion.aside>
    </>
  )
}

// ── Top Bar ───────────────────────────────────────────────────────────────────
function TopBar ({ onMenuClick }) {
  const location = useLocation()

  // Get current page title from path
  const getTitle = () => {
    const segment = location.pathname.split('/')[1]
    return segment
      ? segment.charAt(0).toUpperCase() + segment.slice(1)
      : 'Dashboard'
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        gap: '1rem',
        background: 'rgba(5,5,15,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--clr-border)'
      }}
    >
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--clr-text)',
          fontSize: '1.2rem',
          cursor: 'pointer',
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        ☰
      </button>

      {/* Page title */}
      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.1rem',
          fontWeight: 600
        }}
      >
        <GradientText variant='primary' font='playfair'>
          {getTitle()}
        </GradientText>
      </h2>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Time display */}
      <LiveClock />
    </header>
  )
}

// ── Live Clock ────────────────────────────────────────────────────────────────
function LiveClock () {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.8rem',
        color: 'var(--clr-muted)',
        letterSpacing: '0.04em'
      }}
    >
      {time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })}
    </div>
  )
}

// ── Main Layout ───────────────────────────────────────────────────────────────
export default function MainLayout () {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Close sidebar by default on mobile
  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false)
  }, [])

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* 3D background — fixed, behind everything */}
      <ParticleBackground />

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area — offset by sidebar width on desktop */}
      <div
        style={{
          marginLeft: sidebarOpen && window.innerWidth >= 768 ? '260px' : 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 10,
          transition: 'margin-left 0.3s ease'
        }}
      >
        <TopBar onMenuClick={() => setSidebarOpen(prev => !prev)} />

        {/* Page content */}
        <main style={{ flex: 1, padding: '0' }}>
          <AnimatePresence mode='wait'>
            <Outlet />
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
