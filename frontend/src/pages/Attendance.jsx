// pages/Attendance.jsx
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import GradientText from '../components/ui/GradientText'

const statusColor = {
  Present: 'badge-green',
  Absent: 'badge-red',
  Late: 'badge-yellow',
  'Half-Day': 'badge-blue',
  'On-Leave': 'badge-purple',
  Holiday: 'badge-gray'
}

function ManualEntryModal ({ employees, onClose, onSaved }) {
  const [form, setForm] = useState({
    employeeId: '',
    date: new Date().toISOString().slice(0, 10),
    checkIn: '',
    checkOut: '',
    status: 'Present',
    source: 'Manual',
    remarks: ''
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/attendance/manual', form)
      toast.success('Attendance recorded.')
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
        background: 'rgba(0,0,0,0.7)',
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
            <GradientText>Manual Attendance Entry</GradientText>
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
              <label style={lbl}>Date *</label>
              <input
                required
                type='date'
                style={inp}
                value={form.date}
                onChange={e => set('date', e.target.value)}
              />
            </div>
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
              <label style={lbl}>Check In Time</label>
              <input
                type='time'
                style={inp}
                value={form.checkIn}
                onChange={e => set('checkIn', e.target.value)}
              />
            </div>
            <div>
              <label style={lbl}>Check Out Time</label>
              <input
                type='time'
                style={inp}
                value={form.checkOut}
                onChange={e => set('checkOut', e.target.value)}
              />
            </div>
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
              <label style={lbl}>Status *</label>
              <select
                required
                style={inp}
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                {[
                  'Present',
                  'Absent',
                  'Late',
                  'Half-Day',
                  'On-Leave',
                  'Holiday'
                ].map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Source</label>
              <select
                style={inp}
                value={form.source}
                onChange={e => set('source', e.target.value)}
              >
                <option value='Manual'>Manual</option>
                <option value='Biometric'>Biometric</option>
                <option value='Self-Service'>Self-Service</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={lbl}>Remarks</label>
            <input
              style={inp}
              value={form.remarks}
              onChange={e => set('remarks', e.target.value)}
              placeholder='Optional remarks'
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
              {saving ? 'Saving...' : '✓ Record Attendance'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function Attendance () {
  const { role } = useAuth()
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [today, setToday] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showManual, setShowManual] = useState(false)
  const [tab, setTab] = useState('records')
  const [filters, setFilters] = useState({
    employeeId: '',
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString(),
    status: ''
  })

  const canManage = ['super_admin', 'hr_manager'].includes(role)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        ...(filters.employeeId && { employeeId: filters.employeeId }),
        ...(filters.month && { month: filters.month }),
        ...(filters.year && { year: filters.year }),
        ...(filters.status && { status: filters.status })
      })
      const [recRes, todayRes, empRes] = await Promise.all([
        api.get(`/attendance?${params}`),
        api.get('/attendance/today'),
        canManage
          ? api.get('/employees?limit=100')
          : Promise.resolve({ data: { employees: [] } })
      ])
      setRecords(recRes.data.records || [])
      setToday(todayRes.data || null)
      setEmployees(empRes.data.employees || [])
    } catch {
      toast.error('Failed to load attendance data')
    } finally {
      setLoading(false)
    }
  }, [filters, canManage])

  useEffect(() => {
    load()
  }, [load])

  const handleCheckIn = async () => {
    try {
      const now = new Date().toTimeString().slice(0, 5)
      await api.post('/attendance/checkin', {
        checkIn: now,
        source: 'Self-Service'
      })
      toast.success(`Checked in at ${now}`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed.')
    }
  }

  const handleCheckOut = async () => {
    try {
      const now = new Date().toTimeString().slice(0, 5)
      await api.put('/attendance/checkout', { checkOut: now })
      toast.success(`Checked out at ${now}`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed.')
    }
  }

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v }))

  return (
    <motion.div
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader
        title='Attendance & Time'
        subtitle='Track daily attendance, hours worked, and overtime'
        action={
          canManage && (
            <motion.button
              className='btn-primary'
              onClick={() => setShowManual(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              + Manual Entry
            </motion.button>
          )
        }
      />

      {/* Self Check-in/out for employees */}
      {!canManage && (
        <motion.div
          className='glass'
          style={{
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--clr-muted)' }}>
              Today's Actions
            </div>
            <div
              style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9' }}
            >
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
          <motion.button
            onClick={handleCheckIn}
            style={{
              padding: '0.65rem 1.4rem',
              background: 'linear-gradient(135deg,#10b981,#06b6d4)',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.87rem'
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            ✓ Check In
          </motion.button>
          <motion.button
            onClick={handleCheckOut}
            style={{
              padding: '0.65rem 1.4rem',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8,
              color: '#f87171',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.87rem'
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            ✕ Check Out
          </motion.button>
        </motion.div>
      )}

      {/* Today's Overview Cards */}
      {today?.overview && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}
        >
          {[
            {
              label: 'Total',
              value: today.overview.totalEmployees,
              color: '#7c3aed',
              icon: '👥'
            },
            {
              label: 'Present',
              value: today.overview.present,
              color: '#10b981',
              icon: '✅'
            },
            {
              label: 'Late',
              value: today.overview.late,
              color: '#f59e0b',
              icon: '⏰'
            },
            {
              label: 'On Leave',
              value: today.overview.onLeave,
              color: '#06b6d4',
              icon: '🌿'
            },
            {
              label: 'Absent',
              value: today.overview.absent,
              color: '#ef4444',
              icon: '❌'
            }
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className='glass'
              style={{ padding: '1rem', textAlign: 'center' }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>
                {s.icon}
              </div>
              <div
                style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color }}
              >
                {s.value ?? 0}
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
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
        {canManage && (
          <select
            className='input-field'
            style={{ maxWidth: 220 }}
            value={filters.employeeId}
            onChange={e => setF('employeeId', e.target.value)}
          >
            <option value=''>All Employees</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>
        )}

        <select
          className='input-field'
          style={{ maxWidth: 140 }}
          value={filters.month}
          onChange={e => setF('month', e.target.value)}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={String(i + 1)}>
              {new Date(2024, i, 1).toLocaleDateString('en-US', {
                month: 'long'
              })}
            </option>
          ))}
        </select>

        <select
          className='input-field'
          style={{ maxWidth: 110 }}
          value={filters.year}
          onChange={e => setF('year', e.target.value)}
        >
          {[2023, 2024, 2025, 2026].map(y => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>

        <select
          className='input-field'
          style={{ maxWidth: 140 }}
          value={filters.status}
          onChange={e => setF('status', e.target.value)}
        >
          <option value=''>All Statuses</option>
          {['Present', 'Absent', 'Late', 'Half-Day', 'On-Leave', 'Holiday'].map(
            s => (
              <option key={s} value={s}>
                {s}
              </option>
            )
          )}
        </select>
      </motion.div>

      {/* Records Table */}
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
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours</th>
                  <th>Overtime</th>
                  <th>Status</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: 'center',
                        color: 'var(--clr-muted)',
                        padding: '2rem'
                      }}
                    >
                      No attendance records found for the selected period
                    </td>
                  </tr>
                ) : (
                  records.map((rec, i) => (
                    <motion.tr
                      key={rec._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            color: '#f1f5f9'
                          }}
                        >
                          {rec.employee?.firstName} {rec.employee?.lastName}
                        </div>
                        <div
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--clr-muted)'
                          }}
                        >
                          {rec.employee?.employeeCode}
                        </div>
                      </td>
                      <td
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--clr-muted)'
                        }}
                      >
                        {new Date(rec.date).toLocaleDateString()}
                      </td>
                      <td
                        style={{
                          fontSize: '0.87rem',
                          fontWeight: 600,
                          color: rec.checkIn ? '#10b981' : 'var(--clr-muted)'
                        }}
                      >
                        {rec.checkIn || '—'}
                      </td>
                      <td
                        style={{
                          fontSize: '0.87rem',
                          color: rec.checkOut ? '#f1f5f9' : 'var(--clr-muted)'
                        }}
                      >
                        {rec.checkOut || '—'}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          fontWeight: 600,
                          color:
                            (rec.workHours || 0) >= 8 ? '#10b981' : '#f59e0b'
                        }}
                      >
                        {rec.workHours ? `${rec.workHours}h` : '—'}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          color:
                            (rec.overtimeHours || 0) > 0
                              ? '#f97316'
                              : 'var(--clr-muted)',
                          fontWeight: (rec.overtimeHours || 0) > 0 ? 700 : 400
                        }}
                      >
                        {rec.overtimeHours ? `+${rec.overtimeHours}h` : '—'}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            statusColor[rec.status] || 'badge-gray'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--clr-muted)'
                        }}
                      >
                        {rec.source}
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
        {showManual && (
          <ManualEntryModal
            employees={employees}
            onClose={() => setShowManual(false)}
            onSaved={load}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
