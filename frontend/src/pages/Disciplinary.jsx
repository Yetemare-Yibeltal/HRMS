// pages/Disciplinary.jsx
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import GradientText from '../components/ui/GradientText'

const statusColor = {
  Open: 'badge-red',
  'Under Review': 'badge-yellow',
  Resolved: 'badge-blue',
  Closed: 'badge-gray'
}

function CaseModal ({ employees, onClose, onSaved }) {
  const [form, setForm] = useState({
    employeeId: '',
    type: 'Warning',
    incidentDate: '',
    description: '',
    warningLevel: ''
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/disciplinary', form)
      toast.success('Disciplinary case opened.')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.')
    } finally {
      setSaving(false)
    }
  }

  const inp = {
    width: '100%',
    padding: '0.7rem 0.9rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: '0.87rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    boxSizing: 'border-box'
  }
  const lbl = {
    display: 'block',
    fontSize: '0.69rem',
    color: 'var(--clr-muted)',
    marginBottom: '0.3rem',
    letterSpacing: '0.07em',
    textTransform: 'uppercase'
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          width: '100%',
          maxWidth: 520,
          background: 'rgba(8,8,20,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          padding: '2rem'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>
            <GradientText>Open Disciplinary Case</GradientText>
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--clr-muted)',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={lbl}>Employee *</label>
            <select
              required
              style={inp}
              value={form.employeeId}
              onChange={e => set('employeeId', e.target.value)}
            >
              <option value=''>Select employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              marginBottom: '0.75rem'
            }}
          >
            <div>
              <label style={lbl}>Case Type *</label>
              <select
                required
                style={inp}
                value={form.type}
                onChange={e => set('type', e.target.value)}
              >
                {[
                  'Warning',
                  'Suspension',
                  'Demotion',
                  'Termination',
                  'Grievance'
                ].map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Incident Date *</label>
              <input
                required
                type='date'
                style={inp}
                value={form.incidentDate}
                onChange={e => set('incidentDate', e.target.value)}
              />
            </div>
          </div>

          {form.type === 'Warning' && (
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={lbl}>Warning Level</label>
              <select
                style={inp}
                value={form.warningLevel}
                onChange={e => set('warningLevel', e.target.value)}
              >
                <option value=''>Select level</option>
                {['Verbal', 'Written 1st', 'Written 2nd', 'Final'].map(w => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={lbl}>Description *</label>
            <textarea
              required
              style={{ ...inp, resize: 'vertical', minHeight: 100 }}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder='Detailed description of the incident...'
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem'
            }}
          >
            <button type='button' onClick={onClose} className='btn-ghost'>
              Cancel
            </button>
            <motion.button
              type='submit'
              disabled={saving}
              className='btn-primary'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {saving ? 'Opening...' : '✓ Open Case'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function CaseDetailModal ({ case_, onClose, onSaved }) {
  const [hearingForm, setHearingForm] = useState({
    hearingDate: '',
    hearingNotes: '',
    outcome: ''
  })
  const [resolveRemarks, setResolveRemarks] = useState('')
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('details')

  const handleHearing = async () => {
    setSaving(true)
    try {
      await api.put(`/disciplinary/${case_._id}/hearing`, hearingForm)
      toast.success('Hearing recorded.')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleResolve = async () => {
    setSaving(true)
    try {
      await api.put(`/disciplinary/${case_._id}/resolve`, {
        outcome: resolveRemarks
      })
      toast.success('Case resolved.')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = async () => {
    setSaving(true)
    try {
      await api.put(`/disciplinary/${case_._id}/close`)
      toast.success('Case closed.')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.')
    } finally {
      setSaving(false)
    }
  }

  const inp = {
    width: '100%',
    padding: '0.7rem 0.9rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: '0.87rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    boxSizing: 'border-box'
  }
  const lbl = {
    display: 'block',
    fontSize: '0.69rem',
    color: 'var(--clr-muted)',
    marginBottom: '0.3rem',
    letterSpacing: '0.07em',
    textTransform: 'uppercase'
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '2rem 1rem',
        overflowY: 'auto'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: 580,
          background: 'rgba(8,8,20,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          padding: '2rem',
          marginBottom: '2rem'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>
            <GradientText>Case Details</GradientText>
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--clr-muted)',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        {/* Case header */}
        <div
          style={{
            padding: '1rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 10,
            marginBottom: '1rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.4rem'
            }}
          >
            <div style={{ fontWeight: 600, color: '#f1f5f9' }}>
              {case_.employee?.firstName} {case_.employee?.lastName}
            </div>
            <span className={`badge ${statusColor[case_.status]}`}>
              {case_.status}
            </span>
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--clr-muted)',
              marginBottom: '0.25rem'
            }}
          >
            Type: <strong style={{ color: '#f1f5f9' }}>{case_.type}</strong>
            {case_.warningLevel && ` · ${case_.warningLevel}`}
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--clr-muted)',
              marginBottom: '0.5rem'
            }}
          >
            Incident: {new Date(case_.incidentDate).toLocaleDateString()}
          </div>
          <div
            style={{
              fontSize: '0.82rem',
              color: 'var(--clr-muted)',
              padding: '0.6rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 6,
              borderLeft: '3px solid rgba(239,68,68,0.4)'
            }}
          >
            {case_.description}
          </div>
        </div>

        {/* Tabs */}
        {case_.status !== 'Closed' && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {['details', 'hearing', 'resolve'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: 6,
                  background:
                    tab === t ? 'rgba(124,58,237,0.2)' : 'transparent',
                  border: `1px solid ${
                    tab === t
                      ? 'rgba(124,58,237,0.3)'
                      : 'rgba(255,255,255,0.08)'
                  }`,
                  color: tab === t ? '#a78bfa' : 'var(--clr-muted)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  textTransform: 'capitalize'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {tab === 'hearing' && (
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={lbl}>Hearing Date</label>
              <input
                type='date'
                style={inp}
                value={hearingForm.hearingDate}
                onChange={e =>
                  setHearingForm(p => ({ ...p, hearingDate: e.target.value }))
                }
              />
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={lbl}>Hearing Notes</label>
              <textarea
                style={{ ...inp, resize: 'vertical', minHeight: 80 }}
                value={hearingForm.hearingNotes}
                onChange={e =>
                  setHearingForm(p => ({ ...p, hearingNotes: e.target.value }))
                }
              />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={lbl}>Outcome</label>
              <input
                style={inp}
                value={hearingForm.outcome}
                onChange={e =>
                  setHearingForm(p => ({ ...p, outcome: e.target.value }))
                }
                placeholder='Result of hearing'
              />
            </div>
            <motion.button
              onClick={handleHearing}
              disabled={saving}
              className='btn-primary'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {saving ? 'Saving...' : '✓ Record Hearing'}
            </motion.button>
          </div>
        )}

        {tab === 'resolve' && (
          <div>
            {case_.hearingNotes && (
              <div
                style={{
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 8,
                  marginBottom: '0.75rem',
                  fontSize: '0.82rem'
                }}
              >
                <div
                  style={{
                    color: '#a78bfa',
                    fontSize: '0.68rem',
                    textTransform: 'uppercase',
                    marginBottom: '0.3rem'
                  }}
                >
                  Hearing Notes
                </div>
                <p style={{ color: 'var(--clr-muted)', margin: 0 }}>
                  {case_.hearingNotes}
                </p>
              </div>
            )}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={lbl}>Resolution / Outcome *</label>
              <textarea
                required
                style={{ ...inp, resize: 'vertical', minHeight: 90 }}
                value={resolveRemarks}
                onChange={e => setResolveRemarks(e.target.value)}
                placeholder='Final resolution and outcome...'
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <motion.button
                onClick={handleResolve}
                disabled={saving}
                className='btn-primary'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? 'Resolving...' : '✓ Resolve Case'}
              </motion.button>
              {case_.status === 'Resolved' && (
                <button
                  onClick={handleClose}
                  disabled={saving}
                  style={{
                    padding: '0.7rem 1.4rem',
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--clr-muted)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Close Case
                </button>
              )}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
          <button onClick={onClose} className='btn-ghost'>
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function Disciplinary () {
  const [cases, setCases] = useState([])
  const [employees, setEmployees] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [viewCase, setViewCase] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        ...(filterStatus && { status: filterStatus }),
        ...(filterType && { type: filterType })
      })
      const [caseRes, empRes, statsRes] = await Promise.all([
        api.get(`/disciplinary?${params}`),
        api.get('/employees?limit=200'),
        api.get('/disciplinary/stats')
      ])
      setCases(caseRes.data.cases || [])
      setEmployees(empRes.data.employees || [])
      setStats(statsRes.data.stats || null)
    } catch {
      toast.error('Failed to load disciplinary data')
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterType])

  useEffect(() => {
    load()
  }, [load])

  return (
    <motion.div
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader
        title='Disciplinary & Grievance'
        subtitle='Manage disciplinary cases, hearings, and grievances'
        action={
          <motion.button
            className='btn-primary'
            onClick={() => setShowCreate(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            + Open Case
          </motion.button>
        }
      />

      {/* Stats */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}
        >
          {[
            {
              label: 'Total',
              value: stats.total,
              color: '#7c3aed',
              icon: '⚖️'
            },
            { label: 'Open', value: stats.open, color: '#ef4444', icon: '🔴' },
            {
              label: 'Under Review',
              value: stats.underReview,
              color: '#f59e0b',
              icon: '🔄'
            },
            {
              label: 'Resolved',
              value: stats.resolved,
              color: '#06b6d4',
              icon: '✅'
            },
            {
              label: 'Closed',
              value: stats.closed,
              color: '#94a3b8',
              icon: '🔒'
            }
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className='glass'
              style={{ padding: '1rem', textAlign: 'center' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>
                {s.icon}
              </div>
              <div
                style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}
              >
                {s.value ?? 0}
              </div>
              <div
                style={{
                  fontSize: '0.65rem',
                  color: 'var(--clr-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em'
                }}
              >
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      <motion.div
        className='glass'
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1rem',
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <select
          className='input-field'
          style={{ maxWidth: 160 }}
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value=''>All Statuses</option>
          {['Open', 'Under Review', 'Resolved', 'Closed'].map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className='input-field'
          style={{ maxWidth: 160 }}
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value=''>All Types</option>
          {[
            'Warning',
            'Suspension',
            'Demotion',
            'Termination',
            'Grievance'
          ].map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {(filterStatus || filterType) && (
          <button
            className='btn-ghost'
            onClick={() => {
              setFilterStatus('')
              setFilterType('')
            }}
          >
            Clear
          </button>
        )}
      </motion.div>

      {loading ? (
        <div
          style={{
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--clr-muted)'
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ fontSize: '2rem', display: 'inline-block' }}
          >
            ⟳
          </motion.div>
        </div>
      ) : (
        <motion.div
          className='glass'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            className='table-wrap'
            style={{ border: 'none', borderRadius: 20 }}
          >
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Warning Level</th>
                  <th>Incident Date</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: 'center',
                        color: 'var(--clr-muted)',
                        padding: '2rem'
                      }}
                    >
                      No disciplinary cases found.
                    </td>
                  </tr>
                ) : (
                  cases.map((c, i) => (
                    <motion.tr
                      key={c._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <td>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            color: '#f1f5f9'
                          }}
                        >
                          {c.employee?.firstName} {c.employee?.lastName}
                        </div>
                        <div
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--clr-muted)'
                          }}
                        >
                          {c.employee?.employeeCode}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            c.type === 'Grievance'
                              ? 'badge-blue'
                              : c.type === 'Termination'
                              ? 'badge-red'
                              : c.type === 'Suspension'
                              ? 'badge-yellow'
                              : 'badge-purple'
                          }`}
                        >
                          {c.type}
                        </span>
                      </td>
                      <td
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--clr-muted)'
                        }}
                      >
                        {c.warningLevel || '—'}
                      </td>
                      <td
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--clr-muted)'
                        }}
                      >
                        {new Date(c.incidentDate).toLocaleDateString()}
                      </td>
                      <td
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--clr-muted)',
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {c.description}
                      </td>
                      <td>
                        <span className={`badge ${statusColor[c.status]}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        {c.status !== 'Closed' && (
                          <button
                            onClick={() => setViewCase(c)}
                            style={{
                              padding: '0.3rem 0.7rem',
                              borderRadius: 6,
                              background: 'rgba(124,58,237,0.1)',
                              border: '1px solid rgba(124,58,237,0.2)',
                              color: '#a78bfa',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Manage
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showCreate && (
          <CaseModal
            employees={employees}
            onClose={() => setShowCreate(false)}
            onSaved={load}
          />
        )}
        {viewCase && (
          <CaseDetailModal
            case_={viewCase}
            onClose={() => setViewCase(null)}
            onSaved={load}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
