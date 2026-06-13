// pages/Profile.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import GradientText from '../components/ui/GradientText'

export default function Profile () {
  const { user, role } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [pwSaving, setPwSaving] = useState(false)
  const [tab, setTab] = useState('info')

  useEffect(() => {
    api
      .get('/auth/me')
      .then(r => setProfile(r.data.user))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const handlePasswordChange = async e => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return toast.error('New passwords do not match.')
    }
    if (pwForm.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters.')
    }
    setPwSaving(true)
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      })
      toast.success('Password changed successfully.')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setPwSaving(false)
    }
  }

  const emp = profile?.employee

  const inp = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#f1f5f9',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  }
  const lbl = {
    display: 'block',
    fontSize: '0.7rem',
    color: 'var(--clr-muted)',
    marginBottom: '0.4rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase'
  }

  if (loading) {
    return (
      <div className='page' style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            fontSize: '2rem',
            display: 'inline-block',
            color: 'var(--clr-muted)'
          }}
        >
          ⟳
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader
        title='My Profile'
        subtitle='View your account information and settings'
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr)',
          gap: '1.5rem'
        }}
      >
        {/* Left — Avatar & Summary */}
        <div>
          <motion.div
            className='glass'
            style={{
              padding: '2rem',
              textAlign: 'center',
              marginBottom: '1rem'
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Avatar */}
            <motion.div
              style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#7c3aed,#db2777)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 700,
                color: '#fff',
                margin: '0 auto 1rem',
                boxShadow: '0 0 30px rgba(124,58,237,0.35)'
              }}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {emp
                ? `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`
                : profile?.email?.[0]?.toUpperCase() || 'U'}
            </motion.div>

            {emp ? (
              <>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.2rem',
                    marginBottom: '0.25rem'
                  }}
                >
                  <GradientText>
                    {emp.title} {emp.firstName} {emp.lastName}
                  </GradientText>
                </h2>
                <p
                  style={{
                    color: 'var(--clr-muted)',
                    fontSize: '0.82rem',
                    marginBottom: '0.5rem'
                  }}
                >
                  {emp.position?.title || 'No position assigned'}
                </p>
                <p
                  style={{
                    color: 'var(--clr-muted)',
                    fontSize: '0.78rem',
                    marginBottom: '1rem'
                  }}
                >
                  {emp.department?.name}
                </p>
              </>
            ) : (
              <>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.1rem',
                    marginBottom: '0.5rem'
                  }}
                >
                  <GradientText>{profile?.email}</GradientText>
                </h2>
              </>
            )}

            <span
              className={`badge ${
                role === 'super_admin'
                  ? 'badge-purple'
                  : role === 'hr_manager'
                  ? 'badge-blue'
                  : role === 'payroll_officer'
                  ? 'badge-green'
                  : role === 'hod'
                  ? 'badge-yellow'
                  : 'badge-gray'
              }`}
              style={{ fontSize: '0.72rem', padding: '0.3rem 0.8rem' }}
            >
              {role?.replace('_', ' ').toUpperCase()}
            </span>

            {/* Quick stats */}
            {emp && (
              <div
                style={{
                  marginTop: '1.5rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  textAlign: 'left'
                }}
              >
                {[
                  { label: 'Employee ID', value: emp.employeeCode },
                  { label: 'Type', value: emp.employmentType },
                  {
                    label: 'Joined',
                    value: emp.dateOfJoining
                      ? new Date(emp.dateOfJoining).toLocaleDateString()
                      : '—'
                  },
                  { label: 'Status', value: emp.status }
                ].map(s => (
                  <div
                    key={s.label}
                    style={{
                      padding: '0.6rem',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: 8
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.65rem',
                        color: 'var(--clr-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        marginBottom: '0.15rem'
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#f1f5f9'
                      }}
                    >
                      {s.value || '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Last login */}
          {profile?.lastLogin && (
            <div className='glass' style={{ padding: '0.9rem 1.1rem' }}>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--clr-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: '0.2rem'
                }}
              >
                Last Login
              </div>
              <div style={{ fontSize: '0.82rem', color: '#f1f5f9' }}>
                {new Date(profile.lastLogin).toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Right — Details & Password */}
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {['info', 'security'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '0.55rem 1.1rem',
                  borderRadius: 8,
                  background:
                    tab === t ? 'rgba(124,58,237,0.2)' : 'transparent',
                  border: `1px solid ${
                    tab === t
                      ? 'rgba(124,58,237,0.4)'
                      : 'rgba(255,255,255,0.08)'
                  }`,
                  color: tab === t ? '#a78bfa' : 'var(--clr-muted)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: tab === t ? 600 : 400
                }}
              >
                {t === 'info' ? '👤 Personal Info' : '🔒 Security'}
              </button>
            ))}
          </div>

          {/* Info Tab */}
          {tab === 'info' && (
            <motion.div
              className='glass'
              style={{ padding: '1.75rem' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1rem',
                  marginBottom: '1.25rem'
                }}
              >
                <GradientText variant='blue'>Account Information</GradientText>
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem'
                }}
              >
                {[
                  { label: 'Email', value: profile?.email },
                  { label: 'Role', value: role?.replace('_', ' ') },
                  {
                    label: 'Account Status',
                    value: profile?.isActive ? 'Active' : 'Inactive'
                  },
                  {
                    label: 'Member Since',
                    value: profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : '—'
                  }
                ].map(f => (
                  <div key={f.label}>
                    <div style={lbl}>{f.label}</div>
                    <div
                      style={{
                        padding: '0.65rem 0.9rem',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 8,
                        color: '#f1f5f9',
                        fontSize: '0.87rem'
                      }}
                    >
                      {f.value || '—'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Employee details */}
              {emp && (
                <>
                  <div
                    style={{
                      height: 1,
                      background: 'rgba(255,255,255,0.06)',
                      margin: '1.5rem 0'
                    }}
                  />
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1rem',
                      marginBottom: '1.25rem'
                    }}
                  >
                    <GradientText variant='green'>
                      Employment Details
                    </GradientText>
                  </h3>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem'
                    }}
                  >
                    {[
                      { label: 'Employee Code', value: emp.employeeCode },
                      { label: 'Department', value: emp.department?.name },
                      { label: 'Position', value: emp.position?.title },
                      {
                        label: 'Academic Rank',
                        value: emp.academicRank || '—'
                      },
                      {
                        label: 'Specialization',
                        value: emp.specialization || '—'
                      },
                      { label: 'Employment Type', value: emp.employmentType },
                      { label: 'Work Email', value: emp.workEmail },
                      { label: 'Phone', value: emp.phone }
                    ].map(f => (
                      <div key={f.label}>
                        <div style={lbl}>{f.label}</div>
                        <div
                          style={{
                            padding: '0.65rem 0.9rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 8,
                            color: '#f1f5f9',
                            fontSize: '0.87rem'
                          }}
                        >
                          {f.value || '—'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bank info */}
                  {emp.bankName && (
                    <>
                      <div
                        style={{
                          height: 1,
                          background: 'rgba(255,255,255,0.06)',
                          margin: '1.5rem 0'
                        }}
                      />
                      <h3
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '1rem',
                          marginBottom: '1.25rem'
                        }}
                      >
                        <GradientText variant='warm'>Bank Details</GradientText>
                      </h3>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr',
                          gap: '1rem'
                        }}
                      >
                        {[
                          { label: 'Bank Name', value: emp.bankName },
                          {
                            label: 'Account Number',
                            value: emp.bankAccountNumber
                          },
                          { label: 'Branch', value: emp.bankBranch }
                        ].map(f => (
                          <div key={f.label}>
                            <div style={lbl}>{f.label}</div>
                            <div
                              style={{
                                padding: '0.65rem 0.9rem',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 8,
                                color: '#f1f5f9',
                                fontSize: '0.87rem'
                              }}
                            >
                              {f.value || '—'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Security Tab */}
          {tab === 'security' && (
            <motion.div
              className='glass'
              style={{ padding: '1.75rem' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1rem',
                  marginBottom: '0.5rem'
                }}
              >
                <GradientText variant='primary'>Change Password</GradientText>
              </h3>
              <p
                style={{
                  color: 'var(--clr-muted)',
                  fontSize: '0.82rem',
                  marginBottom: '1.5rem'
                }}
              >
                Use a strong password with letters, numbers, and symbols.
              </p>

              <form onSubmit={handlePasswordChange}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={lbl}>Current Password *</label>
                  <input
                    type='password'
                    required
                    style={inp}
                    value={pwForm.currentPassword}
                    onChange={e =>
                      setPwForm(p => ({
                        ...p,
                        currentPassword: e.target.value
                      }))
                    }
                    placeholder='Enter current password'
                    onFocus={e => {
                      e.target.style.borderColor = '#7c3aed'
                      e.target.style.boxShadow =
                        '0 0 0 3px rgba(124,58,237,0.15)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.1)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={lbl}>New Password *</label>
                  <input
                    type='password'
                    required
                    minLength={6}
                    style={inp}
                    value={pwForm.newPassword}
                    onChange={e =>
                      setPwForm(p => ({ ...p, newPassword: e.target.value }))
                    }
                    placeholder='Minimum 6 characters'
                    onFocus={e => {
                      e.target.style.borderColor = '#7c3aed'
                      e.target.style.boxShadow =
                        '0 0 0 3px rgba(124,58,237,0.15)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.1)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.75rem' }}>
                  <label style={lbl}>Confirm New Password *</label>
                  <input
                    type='password'
                    required
                    style={{
                      ...inp,
                      borderColor:
                        pwForm.confirmPassword &&
                        pwForm.newPassword !== pwForm.confirmPassword
                          ? '#ef4444'
                          : 'rgba(255,255,255,0.1)'
                    }}
                    value={pwForm.confirmPassword}
                    onChange={e =>
                      setPwForm(p => ({
                        ...p,
                        confirmPassword: e.target.value
                      }))
                    }
                    placeholder='Repeat new password'
                    onFocus={e => {
                      e.target.style.borderColor = '#7c3aed'
                      e.target.style.boxShadow =
                        '0 0 0 3px rgba(124,58,237,0.15)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor =
                        pwForm.confirmPassword &&
                        pwForm.newPassword !== pwForm.confirmPassword
                          ? '#ef4444'
                          : 'rgba(255,255,255,0.1)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  {pwForm.confirmPassword &&
                    pwForm.newPassword !== pwForm.confirmPassword && (
                      <p
                        style={{
                          color: '#f87171',
                          fontSize: '0.75rem',
                          marginTop: '0.3rem'
                        }}
                      >
                        Passwords do not match
                      </p>
                    )}
                </div>

                <motion.button
                  type='submit'
                  disabled={pwSaving}
                  className='btn-primary'
                  style={{ minWidth: 180 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {pwSaving ? 'Changing...' : '🔒 Change Password'}
                </motion.button>
              </form>

              {/* Security info */}
              <div
                style={{
                  marginTop: '2rem',
                  padding: '1rem',
                  background: 'rgba(124,58,237,0.06)',
                  border: '1px solid rgba(124,58,237,0.15)',
                  borderRadius: 10
                }}
              >
                <h4
                  style={{
                    color: '#a78bfa',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '0.6rem'
                  }}
                >
                  🛡️ Security Tips
                </h4>
                {[
                  'Use at least 8 characters with uppercase, lowercase, numbers, and symbols',
                  'Never share your password with anyone',
                  'Change your password regularly',
                  'Do not reuse passwords from other accounts'
                ].map((tip, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--clr-muted)',
                      display: 'flex',
                      gap: '0.4rem',
                      marginBottom: '0.3rem'
                    }}
                  >
                    <span style={{ color: '#7c3aed', flexShrink: 0 }}>•</span>
                    {tip}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
