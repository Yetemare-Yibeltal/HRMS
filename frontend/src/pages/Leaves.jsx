// pages/Leaves.jsx
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import GradientText from '../components/ui/GradientText'

const statusColor = {
  Pending: 'badge-yellow',
  'Approved by HOD': 'badge-blue',
  Approved: 'badge-green',
  Rejected: 'badge-red',
  Cancelled: 'badge-gray'
}

function RequestModal ({ leaveTypes, onClose, onSaved }) {
  const [form, setForm] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: ''
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/leaves/requests', form)
      toast.success('Leave request submitted.')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit.')
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
          maxWidth: 480,
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
            <GradientText>Apply for Leave</GradientText>
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
            <label style={lbl}>Leave Type *</label>
            <select
              required
              style={inp}
              value={form.leaveTypeId}
              onChange={e => set('leaveTypeId', e.target.value)}
            >
              <option value=''>Select leave type</option>
              {leaveTypes.map(t => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.defaultDays} days/year)
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={lbl}>Reason</label>
            <textarea
              style={{ ...inp, resize: 'vertical', minHeight: 80 }}
              value={form.reason}
              onChange={e => set('reason', e.target.value)}
              placeholder='Brief reason for leave request'
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
              {saving ? 'Submitting...' : '✓ Submit Request'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function ActionModal ({ request, action, onClose, onDone }) {
  const [remarks, setRemarks] = useState('')
  const [saving, setSaving] = useState(false)
  const { role } = useAuth()

  const isHOD = role === 'hod' || role === 'super_admin'
  const isHR = role === 'hr_manager' || role === 'super_admin'

  const handleAction = async act => {
    setSaving(true)
    try {
      if (isHR && request.status === 'Approved by HOD') {
        await api.put(`/leaves/requests/${request._id}/hr-action`, {
          action: act,
          remarks
        })
      } else if (isHR && request.status === 'Pending') {
        await api.put(`/leaves/requests/${request._id}/hr-action`, {
          action: act,
          remarks
        })
      } else if (isHOD) {
        await api.put(`/leaves/requests/${request._id}/hod-action`, {
          action: act,
          remarks
        })
      }
      toast.success(
        `Leave request ${act === 'approve' ? 'approved' : 'rejected'}.`
      )
      onDone()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.')
    } finally {
      setSaving(false)
    }
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
          maxWidth: 440,
          background: 'rgba(8,8,20,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          padding: '2rem'
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.1rem',
            marginBottom: '1rem'
          }}
        >
          <GradientText>Review Leave Request</GradientText>
        </h2>

        {/* Request info */}
        <div
          style={{
            padding: '1rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 10,
            marginBottom: '1rem',
            fontSize: '0.85rem'
          }}
        >
          <div
            style={{
              color: '#f1f5f9',
              fontWeight: 600,
              marginBottom: '0.4rem'
            }}
          >
            {request.employee?.firstName} {request.employee?.lastName}
          </div>
          <div style={{ color: 'var(--clr-muted)' }}>
            {request.leaveType?.name} · {request.totalDays} day(s)
          </div>
          <div style={{ color: 'var(--clr-muted)', marginTop: '0.25rem' }}>
            {new Date(request.startDate).toLocaleDateString()} —{' '}
            {new Date(request.endDate).toLocaleDateString()}
          </div>
          {request.reason && (
            <div
              style={{
                color: 'var(--clr-muted)',
                marginTop: '0.25rem',
                fontStyle: 'italic'
              }}
            >
              "{request.reason}"
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.69rem',
              color: 'var(--clr-muted)',
              marginBottom: '0.3rem',
              letterSpacing: '0.07em',
              textTransform: 'uppercase'
            }}
          >
            Remarks
          </label>
          <textarea
            style={{
              width: '100%',
              padding: '0.7rem 0.9rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#f1f5f9',
              fontSize: '0.87rem',
              fontFamily: 'var(--font-body)',
              outline: 'none',
              boxSizing: 'border-box',
              resize: 'vertical',
              minHeight: 70
            }}
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder='Optional remarks...'
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onClose} className='btn-ghost' style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            onClick={() => handleAction('reject')}
            disabled={saving}
            style={{
              flex: 1,
              padding: '0.7rem',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8,
              color: '#f87171',
              cursor: 'pointer',
              fontSize: '0.87rem',
              fontWeight: 600
            }}
          >
            ✕ Reject
          </button>
          <motion.button
            onClick={() => handleAction('approve')}
            disabled={saving}
            style={{
              flex: 1,
              padding: '0.7rem',
              background: 'linear-gradient(135deg,#10b981,#06b6d4)',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.87rem',
              fontWeight: 600
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ✓ Approve
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default function Leaves () {
  const { role } = useAuth()
  const [requests, setRequests] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)
  const [showApply, setShowApply] = useState(false)
  const [actionReq, setActionReq] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [tab, setTab] = useState('requests') // requests | balances | types

  const canApprove = ['super_admin', 'hr_manager', 'hod'].includes(role)
  const isEmployee = role === 'employee'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = filterStatus ? `?status=${filterStatus}` : ''
      const [reqRes, typeRes] = await Promise.all([
        api.get(`/leaves/requests${params}`),
        api.get('/leaves/types')
      ])
      setRequests(reqRes.data.requests || [])
      setLeaveTypes(typeRes.data.types || [])
    } catch {
      toast.error('Failed to load leave data')
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    load()
  }, [load])

  const handleCancel = async id => {
    if (!window.confirm('Cancel this leave request?')) return
    try {
      await api.put(`/leaves/requests/${id}/cancel`)
      toast.success('Request cancelled.')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel.')
    }
  }

  const tabs = ['requests', ...(canApprove ? ['types'] : [])]

  return (
    <motion.div
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader
        title='Leave Management'
        subtitle='Manage leave requests, balances, and policies'
        action={
          <motion.button
            className='btn-primary'
            onClick={() => setShowApply(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            + Apply for Leave
          </motion.button>
        }
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {[
          { key: 'requests', label: '📋 Requests' },
          ...(canApprove ? [{ key: 'types', label: '⚙️ Leave Types' }] : [])
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: 8,
              background:
                tab === t.key ? 'rgba(124,58,237,0.2)' : 'transparent',
              border: `1px solid ${
                tab === t.key
                  ? 'rgba(124,58,237,0.4)'
                  : 'rgba(255,255,255,0.08)'
              }`,
              color: tab === t.key ? '#a78bfa' : 'var(--clr-muted)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: tab === t.key ? 600 : 400
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Requests Tab */}
      {tab === 'requests' && (
        <>
          <div
            style={{
              marginBottom: '1rem',
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}
          >
            {[
              '',
              'Pending',
              'Approved by HOD',
              'Approved',
              'Rejected',
              'Cancelled'
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
            <motion.div className='glass'>
              <div
                className='table-wrap'
                style={{ border: 'none', borderRadius: 20 }}
              >
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          style={{
                            textAlign: 'center',
                            color: 'var(--clr-muted)',
                            padding: '2rem'
                          }}
                        >
                          No leave requests found
                        </td>
                      </tr>
                    ) : (
                      requests.map((req, i) => (
                        <motion.tr
                          key={req._id}
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
                              {req.employee?.firstName} {req.employee?.lastName}
                            </div>
                            <div
                              style={{
                                fontSize: '0.72rem',
                                color: 'var(--clr-muted)'
                              }}
                            >
                              {req.employee?.employeeCode}
                            </div>
                          </td>
                          <td>
                            <span className='badge badge-blue'>
                              {req.leaveType?.name}
                            </span>
                          </td>
                          <td
                            style={{
                              fontSize: '0.82rem',
                              color: 'var(--clr-muted)'
                            }}
                          >
                            {new Date(req.startDate).toLocaleDateString()}
                          </td>
                          <td
                            style={{
                              fontSize: '0.82rem',
                              color: 'var(--clr-muted)'
                            }}
                          >
                            {new Date(req.endDate).toLocaleDateString()}
                          </td>
                          <td
                            style={{
                              textAlign: 'center',
                              fontWeight: 700,
                              color: '#f1f5f9'
                            }}
                          >
                            {req.totalDays}
                          </td>
                          <td
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--clr-muted)',
                              maxWidth: 160,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {req.reason || '—'}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                statusColor[req.status] || 'badge-gray'
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              {canApprove && req.status === 'Pending' && (
                                <button
                                  onClick={() => setActionReq(req)}
                                  style={{
                                    padding: '0.3rem 0.65rem',
                                    borderRadius: 6,
                                    background: 'rgba(16,185,129,0.1)',
                                    border: '1px solid rgba(16,185,129,0.25)',
                                    color: '#10b981',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Review
                                </button>
                              )}
                              {canApprove &&
                                req.status === 'Approved by HOD' &&
                                role !== 'hod' && (
                                  <button
                                    onClick={() => setActionReq(req)}
                                    style={{
                                      padding: '0.3rem 0.65rem',
                                      borderRadius: 6,
                                      background: 'rgba(6,182,212,0.1)',
                                      border: '1px solid rgba(6,182,212,0.25)',
                                      color: '#06b6d4',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Final Approve
                                  </button>
                                )}
                              {req.status === 'Pending' && (
                                <button
                                  onClick={() => handleCancel(req._id)}
                                  style={{
                                    padding: '0.3rem 0.65rem',
                                    borderRadius: 6,
                                    background: 'rgba(239,68,68,0.08)',
                                    border: '1px solid rgba(239,68,68,0.2)',
                                    color: '#f87171',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Leave Types Tab */}
      {tab === 'types' && (
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
                  <th>Name</th>
                  <th>Code</th>
                  <th>Days/Year</th>
                  <th>Paid</th>
                  <th>Proof Required</th>
                  <th>Carry Forward</th>
                  <th>Gender</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaveTypes.map((lt, i) => (
                  <motion.tr
                    key={lt._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <td style={{ fontWeight: 600, color: '#f1f5f9' }}>
                      {lt.name}
                    </td>
                    <td>
                      <span className='badge badge-purple'>{lt.code}</span>
                    </td>
                    <td
                      style={{
                        textAlign: 'center',
                        fontWeight: 700,
                        color: '#f1f5f9'
                      }}
                    >
                      {lt.defaultDays}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {lt.isPaid ? (
                        <span className='badge badge-green'>Yes</span>
                      ) : (
                        <span className='badge badge-red'>No</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {lt.requiresProof ? (
                        <span className='badge badge-yellow'>Yes</span>
                      ) : (
                        <span className='badge badge-gray'>No</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {lt.carryForward ? (
                        <span className='badge badge-green'>
                          {lt.maxCarryDays} days
                        </span>
                      ) : (
                        <span className='badge badge-gray'>No</span>
                      )}
                    </td>
                    <td
                      style={{ fontSize: '0.82rem', color: 'var(--clr-muted)' }}
                    >
                      {lt.gender || 'All'}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          lt.status === 'Active' ? 'badge-green' : 'badge-red'
                        }`}
                      >
                        {lt.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showApply && (
          <RequestModal
            leaveTypes={leaveTypes}
            onClose={() => setShowApply(false)}
            onSaved={load}
          />
        )}
        {actionReq && (
          <ActionModal
            request={actionReq}
            onClose={() => setActionReq(null)}
            onDone={load}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
