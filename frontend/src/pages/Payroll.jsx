// pages/Payroll.jsx
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import GradientText from '../components/ui/GradientText'

const statusColor = {
  Draft: 'badge-yellow',
  Approved: 'badge-blue',
  Paid: 'badge-green'
}

function ProcessModal ({ employees, onClose, onSaved }) {
  const [mode, setMode] = useState('single') // single | all
  const [form, setForm] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    bonuses: 0
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (mode === 'single') {
        await api.post('/payroll/process/single', form)
        toast.success('Payroll processed successfully.')
      } else {
        await api.post('/payroll/process/all', {
          month: form.month,
          year: form.year
        })
        toast.success('Bulk payroll processing complete.')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Processing failed.')
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
          maxWidth: 500,
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
            marginBottom: '1.25rem'
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>
            <GradientText>Process Payroll</GradientText>
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

        {/* Mode toggle */}
        <div
          style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}
        >
          {['single', 'all'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: '0.6rem',
                background: mode === m ? 'rgba(124,58,237,0.2)' : 'transparent',
                border: `1px solid ${
                  mode === m ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.1)'
                }`,
                borderRadius: 8,
                color: mode === m ? '#a78bfa' : 'var(--clr-muted)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: mode === m ? 600 : 400,
                textTransform: 'capitalize'
              }}
            >
              {m === 'single' ? '👤 Single Employee' : '👥 All Employees'}
            </button>
          ))}
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
              <label style={lbl}>Month *</label>
              <select
                required
                style={inp}
                value={form.month}
                onChange={e => set('month', Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i, 1).toLocaleDateString('en-US', {
                      month: 'long'
                    })}
                  </option>
                ))}
              </select>
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

          {mode === 'single' && (
            <>
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
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={lbl}>Bonuses (ETB)</label>
                <input
                  type='number'
                  min='0'
                  style={inp}
                  value={form.bonuses}
                  onChange={e => set('bonuses', Number(e.target.value))}
                  placeholder='0'
                />
              </div>
            </>
          )}

          {mode === 'all' && (
            <div
              style={{
                padding: '0.9rem',
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 8,
                marginBottom: '1.5rem',
                fontSize: '0.82rem',
                color: '#fcd34d'
              }}
            >
              ⚠️ This will process payroll for all active employees for the
              selected month.
            </div>
          )}

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
              {saving ? 'Processing...' : '✓ Process Payroll'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function PayslipModal ({ payroll, onClose }) {
  if (!payroll) return null
  const emp = payroll.employee

  const row = (label, value, color = '#f1f5f9') => (
    <tr key={label}>
      <td
        style={{
          padding: '0.5rem 0',
          color: 'var(--clr-muted)',
          fontSize: '0.85rem'
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding: '0.5rem 0',
          textAlign: 'right',
          fontWeight: 600,
          fontSize: '0.85rem',
          color
        }}
      >
        {value}
      </td>
    </tr>
  )

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
        padding: '1rem',
        overflowY: 'auto'
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
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              fontSize: '0.7rem',
              color: 'var(--clr-muted)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase'
            }}
          >
            Injibara University HRMS
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.3rem',
              margin: '0.3rem 0'
            }}
          >
            <GradientText>Payslip — {payroll.payPeriod}</GradientText>
          </h2>
          <div style={{ fontSize: '0.82rem', color: 'var(--clr-muted)' }}>
            {emp?.firstName} {emp?.lastName} · {emp?.employeeCode}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--clr-muted)' }}>
            {emp?.department?.name} · {emp?.position?.title}
          </div>
        </div>

        <div
          style={{
            height: 1,
            background: 'rgba(255,255,255,0.06)',
            margin: '0 0 1rem'
          }}
        />

        {/* Earnings */}
        <p
          style={{
            fontSize: '0.7rem',
            color: '#10b981',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem'
          }}
        >
          Earnings
        </p>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '1rem'
          }}
        >
          <tbody>
            {row(
              'Basic Salary',
              `ETB ${(payroll.basicSalary || 0).toLocaleString()}`,
              '#f1f5f9'
            )}
            {(payroll.allowances || []).map(a =>
              row(a.name, `ETB ${(a.amount || 0).toLocaleString()}`, '#f1f5f9')
            )}
            {payroll.overtimePay > 0 &&
              row(
                'Overtime Pay',
                `ETB ${payroll.overtimePay.toLocaleString()}`,
                '#f97316'
              )}
            {payroll.bonuses > 0 &&
              row(
                'Bonuses',
                `ETB ${payroll.bonuses.toLocaleString()}`,
                '#f97316'
              )}
            {payroll.unpaidLeaveAmount > 0 &&
              row(
                `Unpaid Leave (${payroll.unpaidLeaveDays}d)`,
                `- ETB ${payroll.unpaidLeaveAmount.toLocaleString()}`,
                '#ef4444'
              )}
            {row(
              'Gross Salary',
              `ETB ${(payroll.grossSalary || 0).toLocaleString()}`,
              '#10b981'
            )}
          </tbody>
        </table>

        {/* Deductions */}
        <p
          style={{
            fontSize: '0.7rem',
            color: '#ef4444',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem'
          }}
        >
          Deductions
        </p>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '1rem'
          }}
        >
          <tbody>
            {row(
              'Income Tax',
              `ETB ${(payroll.incomeTax || 0).toLocaleString()}`,
              '#ef4444'
            )}
            {row(
              'Pension (Employee 7%)',
              `ETB ${(payroll.pensionEmployee || 0).toLocaleString()}`,
              '#ef4444'
            )}
            {(payroll.otherDeductions || []).map(d =>
              row(d.name, `ETB ${(d.amount || 0).toLocaleString()}`, '#ef4444')
            )}
            {row(
              'Total Deductions',
              `ETB ${(payroll.totalDeductions || 0).toLocaleString()}`,
              '#ef4444'
            )}
          </tbody>
        </table>

        {/* Employer pension info */}
        <div
          style={{
            padding: '0.7rem 0.9rem',
            background: 'rgba(124,58,237,0.08)',
            borderRadius: 8,
            fontSize: '0.8rem',
            marginBottom: '1rem'
          }}
        >
          <span style={{ color: 'var(--clr-muted)' }}>
            Employer Pension (11%):{' '}
          </span>
          <strong style={{ color: '#a78bfa' }}>
            ETB {(payroll.pensionEmployer || 0).toLocaleString()}
          </strong>
          <span
            style={{
              color: 'var(--clr-muted)',
              marginLeft: '0.5rem',
              fontSize: '0.72rem'
            }}
          >
            (paid by university)
          </span>
        </div>

        <div
          style={{
            height: 1,
            background:
              'linear-gradient(90deg,transparent,rgba(124,58,237,0.4),transparent)',
            margin: '0 0 1rem'
          }}
        />

        {/* Net Salary */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem'
          }}
        >
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>
            <GradientText variant='green'>Net Salary</GradientText>
          </span>
          <span
            style={{
              fontSize: '1.6rem',
              fontWeight: 700,
              color: '#10b981',
              fontFamily: 'var(--font-heading)'
            }}
          >
            ETB {(payroll.netSalary || 0).toLocaleString()}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            color: 'var(--clr-muted)',
            marginBottom: '1.5rem'
          }}
        >
          <span>Payment: {payroll.paymentMethod || 'Bank Transfer'}</span>
          <span>
            Status:{' '}
            <span className={`badge ${statusColor[payroll.status]}`}>
              {payroll.status}
            </span>
          </span>
        </div>

        <button
          onClick={onClose}
          className='btn-ghost'
          style={{ width: '100%' }}
        >
          Close
        </button>
      </motion.div>
    </div>
  )
}

export default function Payroll () {
  const { role } = useAuth()
  const [payrolls, setPayrolls] = useState([])
  const [employees, setEmployees] = useState([])
  const [totals, setTotals] = useState({})
  const [loading, setLoading] = useState(true)
  const [showProcess, setShowProcess] = useState(false)
  const [payslip, setPayslip] = useState(null)
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: ''
  })

  const canManage = ['super_admin', 'hr_manager', 'payroll_officer'].includes(
    role
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        month: filters.month,
        year: filters.year,
        ...(filters.status && { status: filters.status })
      })
      const [payRes, empRes] = await Promise.all([
        api.get(`/payroll?${params}`),
        canManage
          ? api.get('/employees?limit=200')
          : api.get('/payroll/my-payslips')
      ])

      if (canManage) {
        setPayrolls(payRes.data.payrolls || [])
        setTotals(payRes.data.totals || {})
        setEmployees(empRes.data.employees || [])
      } else {
        setPayrolls(empRes.data.payslips || [])
      }
    } catch {
      toast.error('Failed to load payroll data')
    } finally {
      setLoading(false)
    }
  }, [filters, canManage])

  useEffect(() => {
    load()
  }, [load])

  const handleApprove = async id => {
    try {
      await api.put(`/payroll/${id}/approve`)
      toast.success('Payroll approved.')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot approve.')
    }
  }

  const handleMarkPaid = async id => {
    try {
      await api.put(`/payroll/${id}/mark-paid`, {
        paymentDate: new Date().toISOString().slice(0, 10),
        paymentMethod: 'Bank Transfer'
      })
      toast.success('Payroll marked as paid.')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot mark as paid.')
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
        title='Payroll & Compensation'
        subtitle='Process salaries, view payslips, and manage compensation'
        action={
          canManage && (
            <motion.button
              className='btn-primary'
              onClick={() => setShowProcess(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              ⚡ Process Payroll
            </motion.button>
          )
        }
      />

      {/* Summary Cards */}
      {canManage && Object.keys(totals).length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}
        >
          {[
            {
              label: 'Total Gross',
              value: `ETB ${(totals.grossSalary || 0).toLocaleString()}`,
              color: '#7c3aed'
            },
            {
              label: 'Total Net',
              value: `ETB ${(totals.netSalary || 0).toLocaleString()}`,
              color: '#10b981'
            },
            {
              label: 'Deductions',
              value: `ETB ${(totals.totalDeductions || 0).toLocaleString()}`,
              color: '#ef4444'
            },
            {
              label: 'Emp. Pension',
              value: `ETB ${(totals.pensionEmployer || 0).toLocaleString()}`,
              color: '#f97316'
            }
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className='glass'
              style={{ padding: '1rem' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--clr-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: '0.3rem'
                }}
              >
                {s.label}
              </div>
              <div
                style={{ fontSize: '1.05rem', fontWeight: 700, color: s.color }}
              >
                {s.value}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      {canManage && (
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
            value={filters.month}
            onChange={e => setF('month', Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
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
            onChange={e => setF('year', Number(e.target.value))}
          >
            {[2023, 2024, 2025, 2026].map(y => (
              <option key={y} value={y}>
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
            <option value='Draft'>Draft</option>
            <option value='Approved'>Approved</option>
            <option value='Paid'>Paid</option>
          </select>
        </motion.div>
      )}

      {/* Payroll Table */}
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
                  <th>Basic</th>
                  <th>Gross</th>
                  <th>Tax</th>
                  <th>Pension</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        textAlign: 'center',
                        color: 'var(--clr-muted)',
                        padding: '2rem'
                      }}
                    >
                      No payroll records found. Process payroll first.
                    </td>
                  </tr>
                ) : (
                  payrolls.map((p, i) => (
                    <motion.tr
                      key={p._id}
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
                          {p.employee?.firstName} {p.employee?.lastName}
                        </div>
                        <div
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--clr-muted)'
                          }}
                        >
                          {p.employee?.employeeCode}
                        </div>
                      </td>
                      <td
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--clr-muted)'
                        }}
                      >
                        {p.payPeriod || `${p.month}/${p.year}`}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#f1f5f9' }}>
                        ETB {(p.basicSalary || 0).toLocaleString()}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#a78bfa' }}>
                        ETB {(p.grossSalary || 0).toLocaleString()}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#ef4444' }}>
                        ETB {(p.incomeTax || 0).toLocaleString()}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#f97316' }}>
                        ETB {(p.pensionEmployee || 0).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 700, color: '#10b981' }}>
                        ETB {(p.netSalary || 0).toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge ${statusColor[p.status]}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.35rem',
                            flexWrap: 'wrap'
                          }}
                        >
                          <button
                            onClick={() => setPayslip(p)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              borderRadius: 6,
                              background: 'rgba(124,58,237,0.1)',
                              border: '1px solid rgba(124,58,237,0.2)',
                              color: '#a78bfa',
                              fontSize: '0.72rem',
                              cursor: 'pointer'
                            }}
                          >
                            Payslip
                          </button>
                          {canManage && p.status === 'Draft' && (
                            <button
                              onClick={() => handleApprove(p._id)}
                              style={{
                                padding: '0.3rem 0.6rem',
                                borderRadius: 6,
                                background: 'rgba(6,182,212,0.1)',
                                border: '1px solid rgba(6,182,212,0.2)',
                                color: '#06b6d4',
                                fontSize: '0.72rem',
                                cursor: 'pointer'
                              }}
                            >
                              Approve
                            </button>
                          )}
                          {canManage && p.status === 'Approved' && (
                            <button
                              onClick={() => handleMarkPaid(p._id)}
                              style={{
                                padding: '0.3rem 0.6rem',
                                borderRadius: 6,
                                background: 'rgba(16,185,129,0.1)',
                                border: '1px solid rgba(16,185,129,0.2)',
                                color: '#10b981',
                                fontSize: '0.72rem',
                                cursor: 'pointer'
                              }}
                            >
                              Mark Paid
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

      <AnimatePresence>
        {showProcess && (
          <ProcessModal
            employees={employees}
            onClose={() => setShowProcess(false)}
            onSaved={load}
          />
        )}
      </AnimatePresence>

      {payslip && (
        <PayslipModal payroll={payslip} onClose={() => setPayslip(null)} />
      )}
    </motion.div>
  )
}
