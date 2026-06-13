// pages/Exit.jsx
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import GradientText from '../components/ui/GradientText'

const statusColor = {
  Initiated:      'badge-blue',
  'In Progress':  'badge-yellow',
  'Clearance Done':'badge-purple',
  Completed:      'badge-green'
}

function InitiateModal({ employees, onClose, onSaved }) {
  const [form, setForm] = useState({
    employeeId: '', type: 'Resignation',
    exitDate: '', noticeDate: '', reason: ''
  })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/exit', form)
      toast.success('Exit process initiated.')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.')
    } finally {
      setSaving(false)
    }
  }

  const inp = {
    width: '100%', padding: '0.7rem 0.9rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, color: '#f1f5f9',
    fontSize: '0.87rem', fontFamily: 'var(--font-body)',
    outline: 'none', boxSizing: 'border-box'
  }
  const lbl = {
    display: 'block', fontSize: '0.69rem',
    color: 'var(--clr-muted)', marginBottom: '0.3rem',
    letterSpacing: '0.07em', textTransform: 'uppercase'
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '1rem'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1   }}
        style={{
          width: '100%', maxWidth: 520,
          background: 'rgba(8,8,20,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, padding: '2rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>
            <GradientText>Initiate Exit Process</GradientText>
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            color: 'var(--clr-muted)', fontSize: '1.5rem', cursor: 'pointer'
          }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={lbl}>Employee *</label>
            <select required style={inp} value={form.employeeId}
              onChange={e => set('employeeId', e.target.value)}>
              <option value="">Select employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={lbl}>Exit Type *</label>
              <select required style={inp} value={form.type}
                onChange={e => set('type', e.target.value)}>
                {['Resignation','Retirement','Termination','Contract End','Death'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Exit Date *</label>
              <input required type="date" style={inp} value={form.exitDate}
                onChange={e => set('exitDate', e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={lbl}>Notice Date</label>
            <input type="date" style={inp} value={form.noticeDate}
              onChange={e => set('noticeDate', e.target.value)} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={lbl}>Reason</label>
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 80 }}
              value={form.reason}
              onChange={e => set('reason', e.target.value)}
              placeholder="Reason for leaving..." />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <motion.button type="submit" disabled={saving}
              className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {saving ? 'Initiating...' : '✓ Initiate Exit'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function ExitDetailModal({ exit, onClose, onSaved }) {
  const [tab, setTab] = useState('clearance')
  const [saving, setSaving] = useState(false)
  const [clearance, setClearance] = useState({
    library: { cleared: false, clearedBy: '', date: '' },
    it:      { cleared: false, clearedBy: '', date: '' },
    finance: { cleared: false, clearedBy: '', date: '' },
    hostel:  { cleared: false, clearedBy: '', date: '' },
    hr:      { cleared: false, clearedBy: '', date: '' }
  })
  const [settlement, setSettlement] = useState({
    gratuity: 0, otherDues: 0,
    settlementDate: '', settlementStatus: 'Pending'
  })
  const [interview, setInterview] = useState({
    responses: {
      'Why are you leaving?': '',
      'What did you enjoy most?': '',
      'What could be improved?': '',
      'Would you recommend Injibara University?': ''
    },
    overallRating: 3
  })

  const depts = ['library','it','finance','hostel','hr']

  const handleClearance = async () => {
    setSaving(true)
    try {
      await api.put(`/exit/${exit._id}/clearance`, clearance)
      toast.success('Clearance updated.')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleSettlement = async () => {
    setSaving(true)
    try {
      await api.put(`/exit/${exit._id}/settlement`, settlement)
      toast.success('Settlement updated.')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleInterview = async () => {
    setSaving(true)
    try {
      await api.put(`/exit/${exit._id}/interview`, interview)
      toast.success('Exit interview recorded.')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleComplete = async () => {
    if (!window.confirm('Complete the exit process? This will terminate the employee account.')) return
    setSaving(true)
    try {
      await api.put(`/exit/${exit._id}/complete`, {})
      toast.success('Exit process completed. Employee account deactivated.')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.')
    } finally {
      setSaving(false)
    }
  }

  const inp = {
    padding: '0.6rem 0.8rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6, color: '#f1f5f9',
    fontSize: '0.82rem', fontFamily: 'var(--font-body)',
    outline: 'none', boxSizing: 'border-box'
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-start',
      justifyContent: 'center', padding: '2rem 1rem', overflowY: 'auto'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0  }}
        style={{
          width: '100%', maxWidth: 640,
          background: 'rgba(8,8,20,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, padding: '2rem', marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '0.2rem' }}>
              <GradientText>Exit Process</GradientText>
            </h2>
            <p style={{ color: 'var(--clr-muted)', fontSize: '0.82rem' }}>
              {exit.employee?.firstName} {exit.employee?.lastName} · {exit.type}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
            <button onClick={onClose} style={{
              background: 'none', border: 'none',
              color: 'var(--clr-muted)', fontSize: '1.5rem', cursor: 'pointer'
            }}>×</button>
            <span className={`badge ${statusColor[exit.status]}`}>{exit.status}</span>
          </div>
        </div>

        {/* Exit summary */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.5rem', marginBottom: '1rem'
        }}>
          {[
            { label: 'Exit Date', value: exit.exitDate ? new Date(exit.exitDate).toLocaleDateString() : '—' },
            { label: 'Type',      value: exit.type },
            { label: 'Pending Leave', value: `${exit.settlement?.pendingLeaveDays || 0} days` }
          ].map(s => (
            <div key={s.label} style={{
              padding: '0.6rem', background: 'rgba(255,255,255,0.03)',
              borderRadius: 8, textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--clr-muted)',
                textTransform: 'uppercase', marginBottom: '0.2rem' }}>{s.label}</div>
              <div style={{ fontSize: '0.87rem', fontWeight: 600, color: '#f1f5f9' }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {['clearance','settlement','interview'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '0.45rem 0.9rem', borderRadius: 6,
              background: tab === t ? 'rgba(124,58,237,0.2)' : 'transparent',
              border: `1px solid ${tab===t ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.08)'}`,
              color: tab === t ? '#a78bfa' : 'var(--clr-muted)',
              cursor: 'pointer', fontSize: '0.8rem', textTransform: 'capitalize'
            }}>
              {t === 'clearance' ? '🏛️ Clearance' :
               t === 'settlement' ? '💰 Settlement' : '💬 Interview'}
            </button>
          ))}
        </div>

        {/* Clearance Tab */}
        {tab === 'clearance' && (
          <div>
            {depts.map(dept => (
              <div key={dept} style={{
                display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto',
                gap: '0.5rem', alignItems: 'center',
                padding: '0.65rem 0.75rem', marginBottom: '0.4rem',
                background: clearance[dept].cleared
                  ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
                borderRadius: 8,
                border: `1px solid ${clearance[dept].cleared
                  ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`
              }}>
                <input type="checkbox"
                  checked={clearance[dept].cleared}
                  onChange={e => setClearance(c => ({
                    ...c, [dept]: { ...c[dept], cleared: e.target.checked }
                  }))}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <div style={{ fontSize: '0.85rem', color: '#f1f5f9', textTransform: 'capitalize',
                  fontWeight: 600 }}>
                  {dept === 'it' ? 'IT Department' : dept.charAt(0).toUpperCase() + dept.slice(1)}
                </div>
                <input style={{ ...inp, width: '100%' }}
                  placeholder="Cleared by"
                  value={clearance[dept].clearedBy}
                  onChange={e => setClearance(c => ({
                    ...c, [dept]: { ...c[dept], clearedBy: e.target.value }
                  }))} />
                <input type="date" style={{ ...inp, width: 130 }}
                  value={clearance[dept].date}
                  onChange={e => setClearance(c => ({
                    ...c, [dept]: { ...c[dept], date: e.target.value }
                  }))} />
              </div>
            ))}
            <div style={{ marginTop: '1rem' }}>
              <motion.button onClick={handleClearance} disabled={saving}
                className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {saving ? 'Saving...' : '✓ Update Clearance'}
              </motion.button>
            </div>
          </div>
        )}

        {/* Settlement Tab */}
        {tab === 'settlement' && (
          <div>
            <div style={{
              padding: '0.75rem', background: 'rgba(124,58,237,0.06)',
              borderRadius: 8, marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--clr-muted)', marginBottom: '0.3rem' }}>
                Leave Encashment (Auto-calculated)
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>
                ETB {(exit.settlement?.leaveEncashment || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--clr-muted)' }}>
                {exit.settlement?.pendingLeaveDays || 0} days × daily rate
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--clr-muted)',
                  textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.07em' }}>
                  Gratuity (ETB)
                </label>
                <input type="number" style={{ ...inp, width: '100%' }}
                  value={settlement.gratuity}
                  onChange={e => setSettlement(s => ({ ...s, gratuity: Number(e.target.value) }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--clr-muted)',
                  textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.07em' }}>
                  Other Dues (ETB)
                </label>
                <input type="number" style={{ ...inp, width: '100%' }}
                  value={settlement.otherDues}
                  onChange={e => setSettlement(s => ({ ...s, otherDues: Number(e.target.value) }))} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--clr-muted)',
                  textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.07em' }}>
                  Settlement Date
                </label>
                <input type="date" style={{ ...inp, width: '100%' }}
                  value={settlement.settlementDate}
                  onChange={e => setSettlement(s => ({ ...s, settlementDate: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--clr-muted)',
                  textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.07em' }}>
                  Payment Status
                </label>
                <select style={{ ...inp, width: '100%' }}
                  value={settlement.settlementStatus}
                  onChange={e => setSettlement(s => ({ ...s, settlementStatus: e.target.value }))}>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>

            <motion.button onClick={handleSettlement} disabled={saving}
              className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {saving ? 'Saving...' : '✓ Update Settlement'}
            </motion.button>
          </div>
        )}

        {/* Interview Tab */}
        {tab === 'interview' && (
          <div>
            {Object.keys(interview.responses).map(q => (
              <div key={q} style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#a78bfa',
                  marginBottom: '0.3rem' }}>
                  {q}
                </label>
                <textarea
                  style={{ ...inp, width: '100%', resize: 'vertical', minHeight: 60 }}
                  value={interview.responses[q]}
                  onChange={e => setInterview(iv => ({
                    ...iv,
                    responses: { ...iv.responses, [q]: e.target.value }
                  }))} />
              </div>
            ))}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--clr-muted)',
                textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.07em' }}>
                Overall Rating (1–5)
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setInterview(iv => ({ ...iv, overallRating: n }))}
                    style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: interview.overallRating >= n ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${interview.overallRating >= n ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.1)'}`,
                      color: interview.overallRating >= n ? '#f59e0b' : 'var(--clr-muted)',
                      cursor: 'pointer', fontSize: '1rem'
                    }}>
                    ★
                  </button>
                ))}
              </div>
            </div>

            <motion.button onClick={handleInterview} disabled={saving}
              className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {saving ? 'Saving...' : '✓ Save Exit Interview'}
            </motion.button>
          </div>
        )}

        {/* Complete Exit */}
        {exit.status === 'Clearance Done' && (
          <div style={{
            marginTop: '1.5rem', padding: '1rem',
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 10
          }}>
            <p style={{ color: '#10b981', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              ✅ All clearances complete. Ready to finalize exit.
            </p>
            <motion.button onClick={handleComplete} disabled={saving}
              style={{
                padding: '0.7rem 1.4rem', background: 'linear-gradient(135deg,#10b981,#06b6d4)',
                border: 'none', borderRadius: 8, color: '#fff',
                fontWeight: 600, cursor: 'pointer', fontSize: '0.87rem'
              }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {saving ? 'Completing...' : '✓ Complete Exit & Deactivate Account'}
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function Exit() {
  const [exits,       setExits]       = useState([])
  const [employees,   setEmployees]   = useState([])
  const [stats,       setStats]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [showInitiate,setShowInitiate]= useState(false)
  const [viewExit,    setViewExit]    = useState(null)
  const [filterStatus,setFilterStatus]= useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = filterStatus ? `?status=${filterStatus}` : ''
      const [exitRes, empRes, statsRes] = await Promise.all([
        api.get(`/exit${params}`),
        api.get('/employees?limit=200&status=Active'),
        api.get('/exit/stats')
      ])
      setExits(exitRes.data.exits       || [])
      setEmployees(empRes.data.employees || [])
      setStats(statsRes.data.stats      || null)
    } catch {
      toast.error('Failed to load exit data')
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => { load() }, [load])

  return (
    <motion.div className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Exit & Offboarding"
        subtitle="Manage employee exits, clearances, and final settlements"
        action={
          <motion.button className="btn-primary"
            onClick={() => setShowInitiate(true)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            + Initiate Exit
          </motion.button>
        }
      />

      {/* Stats */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))',
          gap: '0.75rem', marginBottom: '1.5rem'
        }}>
          <motion.div className="glass" style={{ padding: '1rem', textAlign: 'center' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>🚪</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7c3aed' }}>
              {stats.totalThisYear ?? 0}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--clr-muted)',
              textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Exits This Year
            </div>
          </motion.div>
          <motion.div className="glass" style={{ padding: '1rem', textAlign: 'center' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>💰</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>
              {stats.pendingSettlements ?? 0}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--clr-muted)',
              textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Pending Settlements
            </div>
          </motion.div>
          {(stats.byType || []).map((t, i) => (
            <motion.div key={t._id} className="glass" style={{ padding: '1rem', textAlign:
              'center' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i*0.05 }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f97316' }}>
                {t.count}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--clr-muted)',
                textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {t._id}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['','Initiated','In Progress','Clearance Done','Completed'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{
            padding: '0.4rem 0.9rem', borderRadius: 999,
            background: filterStatus === s ? 'rgba(124,58,237,0.2)' : 'transparent',
            border: `1px solid ${filterStatus===s ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`,
            color: filterStatus === s ? '#a78bfa' : 'var(--clr-muted)',
            cursor: 'pointer', fontSize: '0.78rem'
          }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--clr-muted)' }}>
          <motion.div animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ fontSize: '2rem', display: 'inline-block' }}>⟳</motion.div>
        </div>
      ) : (
        <motion.div className="glass" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="table-wrap" style={{ border: 'none', borderRadius: 20 }}>
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Exit Date</th>
                  <th>Notice Date</th>
                  <th>Leave Encashment</th>
                  <th>Settlement</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exits.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center',
                      color: 'var(--clr-muted)', padding: '2rem' }}>
                      No exit records found.
                    </td>
                  </tr>
                ) : exits.map((ex, i) => (
                  <motion.tr key={ex._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i*0.04 }}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f1f5f9' }}>
                        {ex.employee?.firstName} {ex.employee?.lastName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--clr-muted)' }}>
                        {ex.employee?.employeeCode}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        ex.type === 'Resignation' ? 'badge-blue' :
                        ex.type === 'Retirement'  ? 'badge-purple' :
                        ex.type === 'Termination' ? 'badge-red' :
                        'badge-gray'
                      }`}>
                        {ex.type}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--clr-muted)' }}>
                      {ex.exitDate ? new Date(ex.exitDate).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--clr-muted)' }}>
                      {ex.noticeDate ? new Date(ex.noticeDate).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 600 }}>
                      ETB {(ex.settlement?.leaveEncashment || 0).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${
                        ex.settlement?.settlementStatus === 'Paid'
                          ? 'badge-green' : 'badge-yellow'
                      }`}>
                        {ex.settlement?.settlementStatus || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${statusColor[ex.status]}`}>{ex.status}</span>
                    </td>
                    <td>
                      {ex.status !== 'Completed' && (
                        <button onClick={() => setViewExit(ex)} style={{
                          padding: '0.3rem 0.7rem', borderRadius: 6,
                          background: 'rgba(124,58,237,0.1)',
                          border: '1px solid rgba(124,58,237,0.2)',
                          color: '#a78bfa', fontSize: '0.75rem', cursor: 'pointer'
                        }}>Manage</button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showInitiate && (
          <InitiateModal
            employees={employees}
            onClose={() => setShowInitiate(false)}
            onSaved={load}
          />
        )}
        {viewExit && (
          <ExitDetailModal
            exit={viewExit}
            onClose={() => setViewExit(null)}
            onSaved={load}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}