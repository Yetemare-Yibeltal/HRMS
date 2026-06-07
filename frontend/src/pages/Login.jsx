// pages/Login.jsx — temporary placeholder until Part 12
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import ParticleBackground from '../components/3d/ParticleBackground'
import GradientText from '../components/ui/GradientText'

export default function Login () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      setError(err.response?.data?.message || 'Login failed.')
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

      <motion.div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '420px'
        }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className='glass' style={{ padding: '2.5rem' }}>
          {/* Logo */}
          <motion.div
            style={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              background: 'var(--grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              margin: '0 auto 1.5rem',
              boxShadow: '0 0 30px rgba(124,58,237,0.4)'
            }}
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          >
            🎓
          </motion.div>

          {/* Title */}
          <h1
            style={{
              textAlign: 'center',
              fontSize: '1.6rem',
              marginBottom: '0.25rem'
            }}
          >
            <GradientText font='cinzel' animate>
              Injibara University
            </GradientText>
          </h1>

          <p
            style={{
              textAlign: 'center',
              color: 'var(--clr-muted)',
              fontSize: '0.75rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginBottom: '2rem',
              fontFamily: 'var(--font-body)'
            }}
          >
            Human Resource Management System
          </p>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                padding: '0.65rem 1rem',
                marginBottom: '1rem',
                color: '#f87171',
                fontSize: '0.85rem',
                textAlign: 'center'
              }}
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  color: 'var(--clr-muted)',
                  marginBottom: '0.4rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                Email Address
              </label>
              <input
                type='email'
                required
                className='input-field'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='admin@injibara.edu.et'
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  color: 'var(--clr-muted)',
                  marginBottom: '0.4rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                Password
              </label>
              <input
                type='password'
                required
                className='input-field'
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='••••••••'
              />
            </div>

            <motion.button
              type='submit'
              disabled={loading}
              className='btn-primary'
              style={{ marginTop: '0.5rem' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </motion.button>
          </form>

          <p
            style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              fontSize: '0.72rem',
              color: 'rgba(148,163,184,0.4)'
            }}
          >
            © {new Date().getFullYear()} Injibara University · All rights
            reserved
          </p>
        </div>
      </motion.div>
    </div>
  )
}
