// pages/Training.jsx
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import GradientText from '../components/ui/GradientText'

const statusColor = {
  Planned: 'badge-blue',
  Ongoing: 'badge-yellow',
  Completed: 'badge-green',
  Cancelled: 'badge-red'
}

function TrainingModal ({ training, onClose, onSaved }) {
  const editing = !!training
  const [form, setForm] = useState({
    title: training?.title || '',
    description: training?.description || '',
    type: training?.type || 'Workshop',
    provider: training?.provider || '',
    venue: training?.venue || '',
    startDate: training?.startDate ? training.startDate.slice(0, 10) : '',
    endDate: training?.endDate ? training.endDate.slice(0, 10) : '',
    duration: training?.duration || '',
    maxParticipants: training?.maxParticipants || 30,
    cost: training?.cost || 0
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/training/${training._id}`, form)
        toast.success('Training updated.')
      } else {
        await api.post('/training', form)
        toast.success('Training created.')
      }
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
            marginBottom: '1.5rem'
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>
            <GradientText>
              {editing ? 'Edit Training' : 'New Training Program'}
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={lbl}>Title *</label>
            <input
              required
              style={inp}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder='Advanced Teaching Methods Workshop'
            />
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
              <label style={lbl}>Type</label>
              <select
                style={inp}
                value={form.type}
                onChange={e => set('type', e.target.value)}
              >
                {[
                  'Workshop',
                  'Seminar',
                  'Online Course',
                  'Conference',
                  'On-the-Job'
                ].map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Provider</label>
              <input
                style={inp}
                value={form.provider}
                onChange={e => set('provider', e.target.value)}
                placeholder='External or Internal'
              />
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={lbl}>Venue</label>
            <input
              style={inp}
              value={form.venue}
              onChange={e => set('venue', e.target.value)}
              placeholder='Conference Hall / Online'
            />
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
              <label style={lbl}>Start Date *</label>
              <input
                required
                type='date'
                style={inp}
                value={form.startDate}
                onChange={e => set('startDate', e.target.value)}
              />
            </div>
            <div>
              <label style={lbl}>End Date *</label>
              <input
                required
                type='date'
                style={inp}
                value={form.endDate}
                onChange={e => set('endDate', e.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '0.75rem',
              marginBottom: '0.75rem'
            }}
          >
            <div>
              <label style={lbl}>Duration (hrs)</label>
              <input
                type='number'
                style={inp}
                value={form.duration}
                onChange={e => set('duration', e.target.value)}
              />
            </div>
            <div>
              <label style={lbl}>Max Participants</label>
              <input
                type='number'
                style={inp}
                value={form.maxParticipants}
                onChange={e => set('maxParticipants', e.target.value)}
              />
            </div>
            <div>
              <label style={lbl}>Cost (ETB)</label>
              <input
                type='number'
                style={inp}
                value={form.cost}
                onChange={e => set('cost', e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={lbl}>Description</label>
            <textarea
              style={{ ...inp, resize: 'vertical', minHeight: 70 }}
              value={form.description}
              onChange={e => set('description', e.target.value)}
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
              {saving ? 'Saving...' : editing ? '✓ Update' : '✓ Create'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function NominateModal ({ training, employees, onClose, onSaved }) {
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)

  const toggle = id =>
    setSelected(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]))

  const handleNominate = async () => {
    if (selected.length === 0)
      return toast.error('Select at least one employee.')
    setSaving(true)
    try {
      await api.post(`/training/${training._id}/nominate`, {
        employeeIds: selected
      })
      toast.success(`${selected.length} employee(s) nominated.`)
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.')
    } finally {
      setSaving(false)
    }
  }

  const alreadyNominated = (training.participants || []).map(
    p => p.employee?._id || p.employee
  )

  const available = employees.filter(e => !alreadyNominated.includes(e._id))

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
          padding: '2rem',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>
            <GradientText>Nominate Employees</GradientText>
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

        <p
          style={{
            fontSize: '0.82rem',
            color: 'var(--clr-muted)',
            marginBottom: '1rem'
          }}
        >
          {training.title} · {selected.length} selected
        </p>

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
          {available.length === 0 ? (
            <p
              style={{
                color: 'var(--clr-muted)',
                fontSize: '0.85rem',
                textAlign: 'center',
                padding: '1rem'
              }}
            >
              All employees are already nominated.
            </p>
          ) : (
            available.map(emp => (
              <div
                key={emp._id}
                onClick={() => toggle(emp._id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.75rem',
                  borderRadius: 8,
                  marginBottom: '0.35rem',
                  cursor: 'pointer',
                  background: selected.includes(emp._id)
                    ? 'rgba(124,58,237,0.12)'
                    : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${
                    selected.includes(emp._id)
                      ? 'rgba(124,58,237,0.35)'
                      : 'rgba(255,255,255,0.06)'
                  }`,
                  transition: 'all 0.15s ease'
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    flexShrink: 0,
                    background: selected.includes(emp._id)
                      ? '#7c3aed'
                      : 'transparent',
                    border: `2px solid ${
                      selected.includes(emp._id)
                        ? '#7c3aed'
                        : 'rgba(255,255,255,0.2)'
                    }`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {selected.includes(emp._id) && (
                    <span style={{ color: '#fff', fontSize: '0.6rem' }}>✓</span>
                  )}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#f1f5f9'
                    }}
                  >
                    {emp.firstName} {emp.lastName}
                  </div>
                  <div
                    style={{ fontSize: '0.72rem', color: 'var(--clr-muted)' }}
                  >
                    {emp.employeeCode} · {emp.department?.name}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

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
          <motion.button
            onClick={handleNominate}
            disabled={saving || selected.length === 0}
            className='btn-primary'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {saving ? 'Nominating...' : `✓ Nominate ${selected.length}`}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default function Training () {
  const [trainings, setTrainings] = useState([])
  const [employees, setEmployees] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [nomModal, setNomModal] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = filterStatus ? `?status=${filterStatus}` : ''
      const [traRes, empRes, statsRes] = await Promise.all([
        api.get(`/training${params}`),
        api.get('/employees?limit=200'),
        api.get('/training/stats')
      ])
      setTrainings(traRes.data.trainings || [])
      setEmployees(empRes.data.employees || [])
      setStats(statsRes.data.stats || null)
    } catch {
      toast.error('Failed to load training data')
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    load()
  }, [load])

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/training/${id}/status`, { status })
      toast.success(`Training status set to ${status}.`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.')
    }
  }

  return (
    <motion.div
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader
        title='Training & Development'
        subtitle='Manage training programs, nominations, and certifications'
        action={
          <motion.button
            className='btn-primary'
            onClick={() => setModal('create')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            + New Training
          </motion.button>
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
              icon: '📚'
            },
            {
              label: 'Planned',
              value: stats.planned,
              color: '#06b6d4',
              icon: '📅'
            },
            {
              label: 'Ongoing',
              value: stats.ongoing,
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
              label: 'Participants',
              value: stats.totalParticipants,
              color: '#f97316',
              icon: '👥'
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

      {/* Filter */}
      <div
        style={{
          marginBottom: '1rem',
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}
      >
        {['', 'Planned', 'Ongoing', 'Completed', 'Cancelled'].map(s => (
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))',
            gap: '1rem'
          }}
        >
          {trainings.length === 0 ? (
            <div
              style={{
                gridColumn: '1/-1',
                padding: '3rem',
                textAlign: 'center',
                color: 'var(--clr-muted)'
              }}
            >
              No training programs found.
            </div>
          ) : (
            trainings.map((tr, i) => (
              <motion.div
                key={tr._id}
                className='glass card-hover'
                style={{ padding: '1.5rem' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem'
                  }}
                >
                  <span className={`badge ${statusColor[tr.status]}`}>
                    {tr.status}
                  </span>
                  <span className='badge badge-purple'>{tr.type}</span>
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.97rem',
                    marginBottom: '0.3rem',
                    lineHeight: 1.3
                  }}
                >
                  <GradientText variant='primary'>{tr.title}</GradientText>
                </h3>
                <p
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--clr-muted)',
                    marginBottom: '0.75rem'
                  }}
                >
                  {tr.provider} · {tr.venue}
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '0.4rem',
                    marginBottom: '0.75rem'
                  }}
                >
                  {[
                    { label: 'Participants', value: tr.participantCount || 0 },
                    { label: 'Max', value: tr.maxParticipants },
                    {
                      label: 'Cost ETB',
                      value: tr.cost ? `${(tr.cost / 1000).toFixed(0)}k` : '0'
                    }
                  ].map(s => (
                    <div
                      key={s.label}
                      style={{
                        padding: '0.45rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 6,
                        textAlign: 'center'
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: '#f1f5f9'
                        }}
                      >
                        {s.value}
                      </div>
                      <div
                        style={{
                          fontSize: '0.62rem',
                          color: 'var(--clr-muted)',
                          textTransform: 'uppercase'
                        }}
                      >
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--clr-muted)',
                    marginBottom: '1rem'
                  }}
                >
                  📅{' '}
                  {tr.startDate
                    ? new Date(tr.startDate).toLocaleDateString()
                    : '—'}{' '}
                  —&nbsp;
                  {tr.endDate ? new Date(tr.endDate).toLocaleDateString() : '—'}
                </div>

                <div
                  style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}
                >
                  {tr.status !== 'Completed' && tr.status !== 'Cancelled' && (
                    <button
                      onClick={() => setNomModal(tr)}
                      style={{
                        flex: 1,
                        padding: '0.45rem',
                        borderRadius: 6,
                        background: 'rgba(124,58,237,0.1)',
                        border: '1px solid rgba(124,58,237,0.2)',
                        color: '#a78bfa',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      + Nominate
                    </button>
                  )}
                  {tr.status === 'Planned' && (
                    <button
                      onClick={() => handleStatusChange(tr._id, 'Ongoing')}
                      style={{
                        flex: 1,
                        padding: '0.45rem',
                        borderRadius: 6,
                        background: 'rgba(245,158,11,0.1)',
                        border: '1px solid rgba(245,158,11,0.2)',
                        color: '#f59e0b',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Start
                    </button>
                  )}
                  {tr.status === 'Ongoing' && (
                    <button
                      onClick={() => handleStatusChange(tr._id, 'Completed')}
                      style={{
                        flex: 1,
                        padding: '0.45rem',
                        borderRadius: 6,
                        background: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.2)',
                        color: '#10b981',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => setModal(tr)}
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--clr-muted)',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <TrainingModal
            training={modal === 'create' ? null : modal}
            onClose={() => setModal(null)}
            onSaved={load}
          />
        )}
        {nomModal && (
          <NominateModal
            training={nomModal}
            employees={employees}
            onClose={() => setNomModal(null)}
            onSaved={load}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
