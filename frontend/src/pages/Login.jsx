// pages/Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import ParticleBackground from '../components/3d/ParticleBackground'
import GradientText from '../components/ui/GradientText'

export default function Login () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Invalid credentials. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        position: 'relative'
      }}
    >
      <ParticleBackground />

      {/* Ambient glow blobs — CSS only, no JS */}
      <div
        style={{
          position: 'fixed',
          top: '20%',
          left: '15%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(124,58,237,0.06)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '20%',
          right: '15%',
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'rgba(219,39,119,0.06)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      <motion.div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '440px'
        }}
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Card */}
        <div
          style={{
            background: 'rgba(8,8,20,0.85)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 28,
            padding: '2.5rem',
            boxShadow:
              '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
          }}
        >
          {/* Rotating seal */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <motion.div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: 'linear-gradient(135deg,#7c3aed,#db2777,#f97316)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                marginBottom: '1rem',
                boxShadow: '0 0 40px rgba(124,58,237,0.35)'
              }}
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              🎓
            </motion.div>

            <h1 style={{ margin: 0, fontSize: '1.75rem', lineHeight: 1.2 }}>
              <GradientText font='cinzel' animate>
                Injibara University
              </GradientText>
            </h1>
            <p
              style={{
                margin: '0.4rem 0 0',
                color: 'rgba(148,163,184,0.7)',
                fontSize: '0.7rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-body)'
              }}
            >
              Human Resource Management System
            </p>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background:
                'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)',
              margin: '0 0 1.75rem'
            }}
          />

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 10,
                padding: '0.7rem 1rem',
                marginBottom: '1.25rem',
                color: '#fca5a5',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>⚠️</span> {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.7rem',
                  color: 'rgba(148,163,184,0.8)',
                  marginBottom: '0.45rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-body)'
                }}
              >
                Email Address
              </label>
              <input
                type='email'
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='admin@injibara.edu.et'
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  color: '#f1f5f9',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#7c3aed'
                  e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.7rem',
                  color: 'rgba(148,163,184,0.8)',
                  marginBottom: '0.45rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-body)'
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder='••••••••'
                  style={{
                    width: '100%',
                    padding: '0.8rem 3rem 0.8rem 1rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    color: '#f1f5f9',
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-body)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#7c3aed'
                    e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type='button'
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(148,163,184,0.6)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0.25rem'
                  }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type='submit'
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              style={{
                width: '100%',
                padding: '0.9rem',
                background: loading
                  ? 'rgba(124,58,237,0.4)'
                  : 'linear-gradient(135deg,#7c3aed,#db2777)',
                border: 'none',
                borderRadius: 10,
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.04em',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(124,58,237,0.3)',
                transition: 'background 0.2s, box-shadow 0.2s'
              }}
            >
              {loading ? (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                    style={{ display: 'inline-block' }}
                  >
                    ⟳
                  </motion.span>
                  Signing in...
                </span>
              ) : (
                'Sign In →'
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p
            style={{
              textAlign: 'center',
              marginTop: '1.75rem',
              fontSize: '0.72rem',
              color: 'rgba(148,163,184,0.3)',
              fontFamily: 'var(--font-body)'
            }}
          >
            © {new Date().getFullYear()} Injibara University · Secure Login
          </p>
        </div>
      </motion.div>
    </div>
  )
}
