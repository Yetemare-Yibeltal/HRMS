// pages/Appraisals.jsx
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import GradientText from '../components/ui/GradientText'

const ratingColor = {
  Excellent: 'badge-green',
  'Very Good': 'badge-blue',
  Good: 'badge-purple',
  'Needs Improvement': 'badge-yellow',
  Unsatisfactory: 'badge-red'
}

const stageColor = {
  'Not Started': 'badge-gray',
  'Self Appraisal': 'badge-yellow',
  'Manager Review': 'badge-blue',
  'HR Review': 'badge-purple',
  Completed: 'badge-green'
}

function CreateAppraisalModal ({ employees, onClose, onSaved }) {
  const [form, setForm] = useState({
    employeeId: '',
    period: '',
    year: new Date().getFullYear(),
    type: 'Annual'
  })
  const [goals, setGoals] = useState([
    { title: '', description: '', target: '', weight: 34 },
    { title: '', description: '', target: '', weight: 33 },
    { title: '', description: '', target: '', weight: 33 }
  ])
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const totalWeight = goals.reduce((s, g) => s + Number(g.weight || 0), 0)

  const handleSubmit = async e => {
    e.preventDefault()
    if (totalWeight !== 100) {
      return toast.error(
        `Goal weights must total 100%. Current: ${totalWeight}%`
      )
    }
    setSaving(true)
    try {
      await api.post('/appraisals', {
        ...form,
        goals: goals.map(g => ({ ...g, weight: Number(g.weight) }))
      })
      toast.success('Appraisal created.')
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
    padding: '0.6rem 0.8rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    boxSizing: 'border-box'
  }
  const lbl = {
    display: 'block',
    fontSize: '0.68rem',
    color: 'var(--clr-muted)',
    marginBottom: '0.25rem',
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
          maxWidth: 680,
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
            marginBottom: '1.5rem'
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>
            <GradientText>Create Appraisal</GradientText>
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              marginBottom: '0.75rem'
            }}
          >
            <div>
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
            <div>
              <label style={lbl}>Type</label>
              <select
                style={inp}
                value={form.type}
                onChange={e => set('type', e.target.value)}
              >
                <option value='Annual'>Annual</option>
                <option value='Probation'>Probation</option>
                <option value='Mid-Year'>Mid-Year</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              marginBottom: '1.25rem'
            }}
          >
            <div>
              <label style={lbl}>Period Label *</label>
              <input
                required
                style={inp}
                value={form.period}
                onChange={e => set('period', e.target.value)}
                placeholder='2024 Annual'
              />
            </div>
            <div>
              <label style={lbl}>Year *</label>
              <select
                required
                style={inp}
                value={form.year}
                onChange={e => set('year', Number(e.target.value))}
              >
                {[2023, 2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Goals */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem'
            }}
          >
            <p
              style={{
                color: '#a78bfa',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}
            >
              Goals (weights must total 100%)
            </p>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: totalWeight === 100 ? '#10b981' : '#ef4444'
              }}
            >
              Total: {totalWeight}%
            </span>
          </div>

          {goals.map((goal, gi) => (
            <div
              key={gi}
              style={{
                padding: '0.9rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.06)',
                marginBottom: '0.6rem'
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}
              >
                <div>
                  <label style={lbl}>Goal Title *</label>
                  <input
                    required
                    style={inp}
                    value={goal.title}
                    onChange={e =>
                      setGoals(g =>
                        g.map((item, i) =>
                          i === gi ? { ...item, title: e.target.value } : item
                        )
                      )
                    }
                    placeholder={`Goal ${gi + 1}`}
                  />
                </div>
                <div style={{ width: 80 }}>
                  <label style={lbl}>Weight %</label>
                  <input
                    type='number'
                    min='1'
                    max='100'
                    style={inp}
                    value={goal.weight}
                    onChange={e =>
                      setGoals(g =>
                        g.map((item, i) =>
                          i === gi ? { ...item, weight: e.target.value } : item
                        )
                      )
                    }
                  />
                </div>
              </div>
              <div>
                <label style={lbl}>Target</label>
                <input
                  style={inp}
                  value={goal.target}
                  onChange={e =>
                    setGoals(g =>
                      g.map((item, i) =>
                        i === gi ? { ...item, target: e.target.value } : item
                      )
                    )
                  }
                  placeholder='Measurable target'
                />
              </div>
            </div>
          ))}

          <button
            type='button'
            onClick={() =>
              setGoals(g => [
                ...g,
                { title: '', description: '', target: '', weight: 0 }
              ])
            }
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'rgba(124,58,237,0.08)',
              border: '1px dashed rgba(124,58,237,0.3)',
              borderRadius: 8,
              color: '#a78bfa',
              fontSize: '0.8rem',
              cursor: 'pointer',
              marginBottom: '1.5rem'
            }}
          >
            + Add Goal
          </button>

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
              {saving ? 'Creating...' : '✓ Create Appraisal'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function ReviewModal ({ appraisal, onClose, onSaved }) {
  const { role } = useAuth()
  const [feedback, setFeedback] = useState('')
  const [scores, setScores] = useState((appraisal.goals || []).map(() => 0))
  const [saving, setSaving] = useState(false)

  const isEmployee = role === 'employee'
  const isManager = ['hod', 'hr_manager', 'super_admin'].includes(role)
  const isHR = ['hr_manager', 'super_admin'].includes(role)
  const stage = appraisal.status

  const handleSelfAppraisal = async () => {
    if (!feedback.trim()) return toast.error('Self appraisal text is required.')
    setSaving(true)
    try {
      await api.put(`/appraisals/${appraisal._id}/self-appraisal`, {
        selfAppraisal: feedback,
        selfScores: scores.map((score, i) => ({
          goalIndex: i,
          score: Number(score)
        }))
      })
      toast.success('Self appraisal submitted.')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleManagerReview = async () => {
    if (!feedback.trim()) return toast.error('Manager feedback is required.')
    setSaving(true)
    try {
      await api.put(`/appraisals/${appraisal._id}/manager-review`, {
        managerFeedback: feedback,
        managerScores: scores.map((score, i) => ({
          goalIndex: i,
          score: Number(score)
        }))
      })
      toast.success('Manager review submitted.')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleComplete = async () => {
    setSaving(true)
    try {
      await api.put(`/appraisals/${appraisal._id}/complete`, {
        remarks: feedback
      })
      toast.success('Appraisal completed.')
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
    padding: '0.6rem 0.8rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    boxSizing: 'border-box'
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
          maxWidth: 640,
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
            <GradientText>
              {stage === 'Self Appraisal'
                ? 'Submit Self Appraisal'
                : stage === 'Manager Review'
                ? 'Manager Review'
                : stage === 'HR Review'
                ? 'Complete Appraisal'
                : 'Appraisal Details'}
            </GradientText>
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

        <div
          style={{
            padding: '0.75rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 8,
            marginBottom: '1rem',
            fontSize: '0.82rem'
          }}
        >
          <div style={{ color: '#f1f5f9', fontWeight: 600 }}>
            {appraisal.employee?.firstName} {appraisal.employee?.lastName}
          </div>
          <div style={{ color: 'var(--clr-muted)' }}>
            {appraisal.period} · {appraisal.type} ·&nbsp;
            <span className={`badge ${stageColor[stage]}`}>{stage}</span>
          </div>
          {appraisal.finalScore > 0 && (
            <div style={{ marginTop: '0.3rem', color: '#f1f5f9' }}>
              Score:{' '}
              <strong style={{ color: '#10b981' }}>
                {appraisal.finalScore}
              </strong>{' '}
              ·
              <span
                className={`badge ${ratingColor[appraisal.rating]} ml-1`}
                style={{ marginLeft: '0.4rem' }}
              >
                {appraisal.rating}
              </span>
            </div>
          )}
        </div>

        {/* Goals */}
        {appraisal.goals?.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <p
              style={{
                fontSize: '0.72rem',
                color: '#a78bfa',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.75rem'
              }}
            >
              Goals & Scoring
            </p>
            {appraisal.goals.map((goal, gi) => (
              <div
                key={gi}
                style={{
                  padding: '0.9rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 8,
                  marginBottom: '0.5rem',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.4rem'
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: '#f1f5f9',
                      fontSize: '0.87rem'
                    }}
                  >
                    {goal.title}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#a78bfa' }}>
                    Weight: {goal.weight}%
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--clr-muted)',
                    marginBottom: '0.5rem'
                  }}
                >
                  Target: {goal.target}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.78rem',
                    marginBottom: '0.4rem'
                  }}
                >
                  {goal.selfScore !== undefined && (
                    <span style={{ color: 'var(--clr-muted)' }}>
                      Self:{' '}
                      <strong style={{ color: '#f1f5f9' }}>
                        {goal.selfScore}
                      </strong>
                    </span>
                  )}
                  {goal.managerScore !== undefined && (
                    <span style={{ color: 'var(--clr-muted)' }}>
                      Manager:{' '}
                      <strong style={{ color: '#10b981' }}>
                        {goal.managerScore}
                      </strong>
                    </span>
                  )}
                </div>
                {(stage === 'Self Appraisal' && isEmployee) ||
                (stage === 'Manager Review' && isManager) ? (
                  <div>
                    <label
                      style={{
                        fontSize: '0.68rem',
                        color: 'var(--clr-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em'
                      }}
                    >
                      Score (0–100)
                    </label>
                    <input
                      type='number'
                      min='0'
                      max='100'
                      style={{ ...inp, maxWidth: 100 }}
                      value={scores[gi]}
                      onChange={e =>
                        setScores(s =>
                          s.map((v, i) => (i === gi ? e.target.value : v))
                        )
                      }
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {/* Feedback */}
        {(stage === 'Self Appraisal' ||
          stage === 'Manager Review' ||
          stage === 'HR Review') && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.68rem',
                color: 'var(--clr-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                marginBottom: '0.3rem'
              }}
            >
              {stage === 'Self Appraisal'
                ? 'Self Assessment *'
                : stage === 'Manager Review'
                ? 'Manager Feedback *'
                : 'HR Remarks'}
            </label>
            <textarea
              style={{ ...inp, resize: 'vertical', minHeight: 90 }}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder='Write your assessment...'
            />
          </div>
        )}

        {/* Previous feedback */}
        {appraisal.selfAppraisal && stage !== 'Self Appraisal' && (
          <div
            style={{
              padding: '0.75rem',
              background: 'rgba(124,58,237,0.06)',
              borderRadius: 8,
              marginBottom: '1rem'
            }}
          >
            <div
              style={{
                fontSize: '0.68rem',
                color: '#a78bfa',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                marginBottom: '0.3rem'
              }}
            >
              Self Appraisal
            </div>
            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--clr-muted)',
                margin: 0
              }}
            >
              {appraisal.selfAppraisal}
            </p>
          </div>
        )}
        {appraisal.managerFeedback && stage === 'HR Review' && (
          <div
            style={{
              padding: '0.75rem',
              background: 'rgba(6,182,212,0.06)',
              borderRadius: 8,
              marginBottom: '1rem'
            }}
          >
            <div
              style={{
                fontSize: '0.68rem',
                color: '#06b6d4',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                marginBottom: '0.3rem'
              }}
            >
              Manager Feedback
            </div>
            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--clr-muted)',
                margin: 0
              }}
            >
              {appraisal.managerFeedback}
            </p>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}
        >
          <button onClick={onClose} className='btn-ghost'>
            Cancel
          </button>
          {stage === 'Self Appraisal' && isEmployee && (
            <motion.button
              onClick={handleSelfAppraisal}
              disabled={saving}
              className='btn-primary'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {saving ? 'Submitting...' : '✓ Submit Self Appraisal'}
            </motion.button>
          )}
          {stage === 'Manager Review' && isManager && (
            <motion.button
              onClick={handleManagerReview}
              disabled={saving}
              className='btn-primary'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {saving ? 'Submitting...' : '✓ Submit Review'}
            </motion.button>
          )}
          {stage === 'HR Review' && isHR && (
            <motion.button
              onClick={handleComplete}
              disabled={saving}
              style={{
                padding: '0.7rem 1.4rem',
                borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(135deg,#10b981,#06b6d4)',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {saving ? 'Completing...' : '✓ Complete Appraisal'}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default function Appraisals () {
  const { role } = useAuth()
  const [appraisals, setAppraisals] = useState([])
  const [employees, setEmployees] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [reviewing, setReviewing] = useState(null)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())
  const [filterStatus, setFilterStatus] = useState('')

  const canManage = ['super_admin', 'hr_manager'].includes(role)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        year: filterYear,
        ...(filterStatus && { status: filterStatus })
      })
      const [appRes, statsRes, empRes] = await Promise.all([
        api.get(`/appraisals?${params}`),
        api.get(`/appraisals/stats?year=${filterYear}`),
        canManage
          ? api.get('/employees?limit=200')
          : Promise.resolve({ data: { employees: [] } })
      ])
      setAppraisals(appRes.data.appraisals || [])
      setStats(statsRes.data.stats || null)
      setEmployees(empRes.data.employees || [])
    } catch {
      toast.error('Failed to load appraisals')
    } finally {
      setLoading(false)
    }
  }, [filterYear, filterStatus, canManage])

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
        title='Performance Appraisals'
        subtitle='Manage performance reviews, goals, and ratings'
        action={
          canManage && (
            <motion.button
              className='btn-primary'
              onClick={() => setShowCreate(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              + New Appraisal
            </motion.button>
          )
        }
      />

      {/* Stats */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}
        >
          {[
            {
              label: 'Total',
              value: stats.total,
              color: '#7c3aed',
              icon: '📊'
            },
            {
              label: 'Not Started',
              value: stats.notStarted,
              color: '#94a3b8',
              icon: '⏳'
            },
            {
              label: 'In Progress',
              value: stats.inProgress,
              color: '#f59e0b',
              icon: '🔄'
            },
            {
              label: 'Completed',
              value: stats.completed,
              color: '#10b981',
              icon: '✅'
            },
            {
              label: 'Avg Score',
              value: stats.averageScore,
              color: '#f97316',
              icon: '⭐'
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
              <div style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>
                {s.icon}
              </div>
              <div
                style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}
              >
                {s.value ?? 0}
              </div>
              <div
                style={{
                  fontSize: '0.68rem',
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
      <div
        style={{
          marginBottom: '1rem',
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}
      >
        <select
          className='input-field'
          style={{ maxWidth: 110 }}
          value={filterYear}
          onChange={e => setFilterYear(Number(e.target.value))}
        >
          {[2023, 2024, 2025, 2026].map(y => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        {[
          '',
          'Not Started',
          'Self Appraisal',
          'Manager Review',
          'HR Review',
          'Completed'
        ].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: 999,
              background:
                filterStatus === s ? 'rgba(124,58,237,0.2)' : 'transparent',
              border: `1px solid ${
                filterStatus === s
                  ? 'rgba(124,58,237,0.4)'
                  : 'rgba(255,255,255,0.08)'
              }`,
              color: filterStatus === s ? '#a78bfa' : 'var(--clr-muted)',
              cursor: 'pointer',
              fontSize: '0.78rem'
            }}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

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
                  <th>Period</th>
                  <th>Type</th>
                  <th>Goals</th>
                  <th>Self Score</th>
                  <th>Final Score</th>
                  <th>Rating</th>
                  <th>Stage</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appraisals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        textAlign: 'center',
                        color: 'var(--clr-muted)',
                        padding: '2rem'
                      }}
                    >
                      No appraisals found. Create one to start the review cycle.
                    </td>
                  </tr>
                ) : (
                  appraisals.map((app, i) => (
                    <motion.tr
                      key={app._id}
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
                          {app.employee?.firstName} {app.employee?.lastName}
                        </div>
                        <div
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--clr-muted)'
                          }}
                        >
                          {app.employee?.employeeCode}
                        </div>
                      </td>
                      <td
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--clr-muted)'
                        }}
                      >
                        {app.period}
                      </td>
                      <td>
                        <span className='badge badge-blue'>{app.type}</span>
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          color: '#f1f5f9',
                          fontWeight: 600
                        }}
                      >
                        {app.goals?.length || 0}
                      </td>
                      <td style={{ textAlign: 'center', color: '#a78bfa' }}>
                        {app.selfTotalScore || '—'}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          fontWeight: 700,
                          color: app.finalScore ? '#10b981' : 'var(--clr-muted)'
                        }}
                      >
                        {app.finalScore || '—'}
                      </td>
                      <td>
                        {app.rating ? (
                          <span className={`badge ${ratingColor[app.rating]}`}>
                            {app.rating}
                          </span>
                        ) : (
                          <span
                            style={{
                              color: 'var(--clr-muted)',
                              fontSize: '0.8rem'
                            }}
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${stageColor[app.status]}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        {app.status !== 'Completed' && (
                          <button
                            onClick={() => setReviewing(app)}
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
                            {app.status === 'Self Appraisal'
                              ? 'Self Appraise'
                              : app.status === 'Manager Review'
                              ? 'Review'
                              : app.status === 'HR Review'
                              ? 'Complete'
                              : 'View'}
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
          <CreateAppraisalModal
            employees={employees}
            onClose={() => setShowCreate(false)}
            onSaved={load}
          />
        )}
        {reviewing && (
          <ReviewModal
            appraisal={reviewing}
            onClose={() => setReviewing(null)}
            onSaved={load}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
