// pages/Employees.jsx
// Full employee list with search, filter, pagination,
// create employee modal, and view employee details

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import GradientText from '../components/ui/GradientText'

// ── Status badge helper ───────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Active: 'badge-green',
    'On-Leave': 'badge-blue',
    Inactive: 'badge-gray',
    Suspended: 'badge-yellow',
    Terminated: 'badge-red'
  }
  return (
    <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>
  )
}

// ── Create Employee Modal ─────────────────────────────────────────────────────
function CreateEmployeeModal ({ onClose, onCreated, departments, positions }) {
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    title: '',
    dateOfBirth: '',
    workEmail: '',
    phone: '',
    nationalId: '',
    tinNumber: '',
    department: '',
    position: '',
    employmentType: '',
    dateOfJoining: '',
    basicSalary: '',
    salaryGrade: '',
    academicRank: '',
    specialization: '',
    bankName: '',
    bankAccountNumber: '',
    bankBranch: ''
  })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // Filter positions by selected department
  const filteredPositions = positions.filter(
    p => !form.department || p.department?._id === form.department
  )

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/employees', form)
      toast.success('Employee created successfully!')
      onCreated()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create employee')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.65rem 0.9rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    boxSizing: 'border-box'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '0.7rem',
    color: 'var(--clr-muted)',
    marginBottom: '0.3rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase'
  }

  const row = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem'
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '2rem 1rem',
        overflowY: 'auto',
        backdropFilter: 'blur(4px)'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
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
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem' }}>
            <GradientText>Add New Employee</GradientText>
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
          {/* Personal Info */}
          <p
            style={{
              color: '#a78bfa',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem'
            }}
          >
            Personal Information
          </p>

          <div style={row}>
            <div>
              <label style={labelStyle}>Title</label>
              <select
                style={inputStyle}
                value={form.title}
                onChange={e => set('title', e.target.value)}
              >
                <option value=''>Select</option>
                {['Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Ato', 'W/ro', 'W/t'].map(
                  t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Gender *</label>
              <select
                required
                style={inputStyle}
                value={form.gender}
                onChange={e => set('gender', e.target.value)}
              >
                <option value=''>Select</option>
                <option value='Male'>Male</option>
                <option value='Female'>Female</option>
              </select>
            </div>
          </div>

          <div style={{ ...row, marginTop: '0.75rem' }}>
            <div>
              <label style={labelStyle}>First Name *</label>
              <input
                required
                style={inputStyle}
                value={form.firstName}
                onChange={e => set('firstName', e.target.value)}
                placeholder='Abebe'
              />
            </div>
            <div>
              <label style={labelStyle}>Middle Name</label>
              <input
                style={inputStyle}
                value={form.middleName}
                onChange={e => set('middleName', e.target.value)}
                placeholder='Kebede'
              />
            </div>
          </div>

          <div style={{ ...row, marginTop: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Last Name *</label>
              <input
                required
                style={inputStyle}
                value={form.lastName}
                onChange={e => set('lastName', e.target.value)}
                placeholder='Tadesse'
              />
            </div>
            <div>
              <label style={labelStyle}>Date of Birth</label>
              <input
                type='date'
                style={inputStyle}
                value={form.dateOfBirth}
                onChange={e => set('dateOfBirth', e.target.value)}
              />
            </div>
          </div>

          <div style={{ ...row, marginTop: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Work Email</label>
              <input
                type='email'
                style={inputStyle}
                value={form.workEmail}
                onChange={e => set('workEmail', e.target.value)}
                placeholder='name@injibara.edu.et'
              />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input
                style={inputStyle}
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder='0911234567'
              />
            </div>
          </div>

          <div style={{ ...row, marginTop: '0.75rem' }}>
            <div>
              <label style={labelStyle}>National ID</label>
              <input
                style={inputStyle}
                value={form.nationalId}
                onChange={e => set('nationalId', e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>TIN Number</label>
              <input
                style={inputStyle}
                value={form.tinNumber}
                onChange={e => set('tinNumber', e.target.value)}
              />
            </div>
          </div>

          {/* Employment Info */}
          <div
            style={{
              height: 1,
              background: 'rgba(255,255,255,0.06)',
              margin: '1.25rem 0'
            }}
          />
          <p
            style={{
              color: '#a78bfa',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem'
            }}
          >
            Employment Details
          </p>

          <div style={row}>
            <div>
              <label style={labelStyle}>Department *</label>
              <select
                required
                style={inputStyle}
                value={form.department}
                onChange={e => set('department', e.target.value)}
              >
                <option value=''>Select department</option>
                {departments.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Position</label>
              <select
                style={inputStyle}
                value={form.position}
                onChange={e => set('position', e.target.value)}
              >
                <option value=''>Select position</option>
                {filteredPositions.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ ...row, marginTop: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Employment Type *</label>
              <select
                required
                style={inputStyle}
                value={form.employmentType}
                onChange={e => set('employmentType', e.target.value)}
              >
                <option value=''>Select type</option>
                {[
                  'Permanent',
                  'Contract',
                  'Part-Time',
                  'Visiting',
                  'Intern'
                ].map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Date of Joining *</label>
              <input
                required
                type='date'
                style={inputStyle}
                value={form.dateOfJoining}
                onChange={e => set('dateOfJoining', e.target.value)}
              />
            </div>
          </div>

          <div style={{ ...row, marginTop: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Basic Salary (ETB)</label>
              <input
                type='number'
                style={inputStyle}
                value={form.basicSalary}
                onChange={e => set('basicSalary', e.target.value)}
                placeholder='10000'
              />
            </div>
            <div>
              <label style={labelStyle}>Salary Grade</label>
              <select
                style={inputStyle}
                value={form.salaryGrade}
                onChange={e => set('salaryGrade', e.target.value)}
              >
                <option value=''>Select grade</option>
                {[
                  'Graduate Assistant',
                  'Assistant Lecturer',
                  'Lecturer',
                  'Assistant Professor',
                  'Associate Professor',
                  'Professor',
                  'HR Officer',
                  'Administrative Staff'
                ].map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ ...row, marginTop: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Academic Rank</label>
              <select
                style={inputStyle}
                value={form.academicRank}
                onChange={e => set('academicRank', e.target.value)}
              >
                <option value=''>N/A</option>
                {[
                  'Graduate Assistant',
                  'Assistant Lecturer',
                  'Lecturer',
                  'Assistant Professor',
                  'Associate Professor',
                  'Professor'
                ].map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Specialization</label>
              <input
                style={inputStyle}
                value={form.specialization}
                onChange={e => set('specialization', e.target.value)}
                placeholder='e.g. Software Engineering'
              />
            </div>
          </div>

          {/* Bank Info */}
          <div
            style={{
              height: 1,
              background: 'rgba(255,255,255,0.06)',
              margin: '1.25rem 0'
            }}
          />
          <p
            style={{
              color: '#a78bfa',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem'
            }}
          >
            Bank Details (for Payroll)
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '0.75rem'
            }}
          >
            <div>
              <label style={labelStyle}>Bank Name</label>
              <input
                style={inputStyle}
                value={form.bankName}
                onChange={e => set('bankName', e.target.value)}
                placeholder='CBE'
              />
            </div>
            <div>
              <label style={labelStyle}>Account Number</label>
              <input
                style={inputStyle}
                value={form.bankAccountNumber}
                onChange={e => set('bankAccountNumber', e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Branch</label>
              <input
                style={inputStyle}
                value={form.bankBranch}
                onChange={e => set('bankBranch', e.target.value)}
                placeholder='Injibara'
              />
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1.75rem'
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
              {saving ? 'Creating...' : '✓ Create Employee'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ── Employee Detail Modal ─────────────────────────────────────────────────────
function EmployeeDetailModal ({ employee, onClose }) {
  if (!employee) return null
  const field = (label, value) => (
    <div style={{ marginBottom: '0.75rem' }}>
      <div
        style={{
          fontSize: '0.68rem',
          color: 'var(--clr-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '0.2rem'
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: '0.88rem', color: '#f1f5f9', fontWeight: 500 }}>
        {value || '—'}
      </div>
    </div>
  )
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(4px)'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          width: '100%',
          maxWidth: 620,
          background: 'rgba(8,8,20,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          padding: '2rem',
          maxHeight: '85vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: 'linear-gradient(135deg,#7c3aed,#db2777)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                fontWeight: 700,
                color: '#fff'
              }}
            >
              {employee.firstName?.[0]}
              {employee.lastName?.[0]}
            </div>
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.3rem',
                  margin: 0
                }}
              >
                <GradientText>
                  {employee.title} {employee.firstName} {employee.lastName}
                </GradientText>
              </h2>
              <p
                style={{
                  margin: 0,
                  color: 'var(--clr-muted)',
                  fontSize: '0.8rem'
                }}
              >
                {employee.employeeCode} ·{' '}
                {employee.position?.title || 'No position'}
              </p>
            </div>
          </div>
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

        <StatusBadge status={employee.status} />

        <div
          style={{
            height: 1,
            background: 'rgba(255,255,255,0.06)',
            margin: '1rem 0'
          }}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0 2rem'
          }}
        >
          {field('Department', employee.department?.name)}
          {field('Employment Type', employee.employmentType)}
          {field('Academic Rank', employee.academicRank)}
          {field('Specialization', employee.specialization)}
          {field('Work Email', employee.workEmail)}
          {field('Phone', employee.phone)}
          {field(
            'Basic Salary',
            employee.basicSalary
              ? `ETB ${employee.basicSalary.toLocaleString()}`
              : null
          )}
          {field('Salary Grade', employee.salaryGrade)}
          {field(
            'Date of Joining',
            employee.dateOfJoining
              ? new Date(employee.dateOfJoining).toLocaleDateString()
              : null
          )}
          {field('Bank Name', employee.bankName)}
          {field('Account Number', employee.bankAccountNumber)}
          {field('Bank Branch', employee.bankBranch)}
        </div>

        {employee.employmentHistory?.length > 0 && (
          <>
            <div
              style={{
                height: 1,
                background: 'rgba(255,255,255,0.06)',
                margin: '1rem 0'
              }}
            />
            <p
              style={{
                color: '#a78bfa',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem'
              }}
            >
              Employment History
            </p>
            {employee.employmentHistory.map((h, i) => (
              <div
                key={i}
                style={{
                  padding: '0.6rem 0.8rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 8,
                  marginBottom: '0.5rem',
                  borderLeft: '3px solid #7c3aed',
                  fontSize: '0.82rem'
                }}
              >
                <strong style={{ color: '#f1f5f9' }}>{h.event}</strong>
                <span
                  style={{ color: 'var(--clr-muted)', marginLeft: '0.5rem' }}
                >
                  {h.from} → {h.to}
                </span>
                {h.date && (
                  <span
                    style={{ color: 'var(--clr-muted)', marginLeft: '0.5rem' }}
                  >
                    · {new Date(h.date).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </>
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

// ── Main Employees Page ───────────────────────────────────────────────────────
export default function Employees () {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedEmp, setSelectedEmp] = useState(null)
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(search && { search }),
        ...(filterDept && { department: filterDept }),
        ...(filterStatus && { status: filterStatus }),
        ...(filterType && { employmentType: filterType })
      })
      const [empRes, deptRes, posRes] = await Promise.all([
        api.get(`/employees?${params}`),
        api.get('/departments'),
        api.get('/positions')
      ])
      setEmployees(empRes.data.employees || [])
      setTotalPages(empRes.data.pages || 1)
      setTotal(empRes.data.total || 0)
      setDepartments(deptRes.data.departments || [])
      setPositions(posRes.data.positions || [])
    } catch {
      toast.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }, [page, search, filterDept, filterStatus, filterType])

  useEffect(() => {
    load()
  }, [load])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, filterDept, filterStatus, filterType])

  return (
    <motion.div
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <PageHeader
        title='Employees'
        subtitle={`${total} total staff and faculty members`}
        action={
          <motion.button
            className='btn-primary'
            onClick={() => setShowCreate(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            + Add Employee
          </motion.button>
        }
      />

      {/* Filters */}
      <motion.div
        className='glass'
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1rem',
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Search */}
        <input
          className='input-field'
          style={{ maxWidth: 240, flex: 1 }}
          placeholder='Search by name or code...'
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Department filter */}
        <select
          className='input-field'
          style={{ maxWidth: 200 }}
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
        >
          <option value=''>All Departments</option>
          {departments.map(d => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          className='input-field'
          style={{ maxWidth: 160 }}
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value=''>All Statuses</option>
          {['Active', 'Inactive', 'On-Leave', 'Suspended', 'Terminated'].map(
            s => (
              <option key={s} value={s}>
                {s}
              </option>
            )
          )}
        </select>

        {/* Type filter */}
        <select
          className='input-field'
          style={{ maxWidth: 160 }}
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value=''>All Types</option>
          {['Permanent', 'Contract', 'Part-Time', 'Visiting', 'Intern'].map(
            t => (
              <option key={t} value={t}>
                {t}
              </option>
            )
          )}
        </select>

        {/* Clear */}
        {(search || filterDept || filterStatus || filterType) && (
          <button
            className='btn-ghost'
            onClick={() => {
              setSearch('')
              setFilterDept('')
              setFilterStatus('')
              setFilterType('')
            }}
          >
            Clear
          </button>
        )}
      </motion.div>

      {/* Table */}
      <motion.div
        className='glass'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
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
              style={{
                fontSize: '2rem',
                display: 'inline-block',
                marginBottom: '0.5rem'
              }}
            >
              ⟳
            </motion.div>
            <p style={{ fontSize: '0.85rem' }}>Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: 'var(--clr-muted)'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
              👥
            </div>
            <p>
              No employees found. Try adjusting your filters or add a new
              employee.
            </p>
          </div>
        ) : (
          <div
            className='table-wrap'
            style={{ borderRadius: 20, border: 'none' }}
          >
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Code</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Type</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {employees.map((emp, i) => (
                    <motion.tr
                      key={emp._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem'
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 9,
                              background:
                                'linear-gradient(135deg,#7c3aed,#db2777)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: '#fff',
                              flexShrink: 0
                            }}
                          >
                            {emp.firstName?.[0]}
                            {emp.lastName?.[0]}
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#f1f5f9'
                              }}
                            >
                              {emp.title} {emp.firstName} {emp.lastName}
                            </div>
                            <div
                              style={{
                                fontSize: '0.72rem',
                                color: 'var(--clr-muted)'
                              }}
                            >
                              {emp.workEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            color: '#a78bfa',
                            fontFamily: 'monospace',
                            fontSize: '0.8rem'
                          }}
                        >
                          {emp.employeeCode}
                        </span>
                      </td>
                      <td
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--clr-muted)'
                        }}
                      >
                        {emp.department?.name || '—'}
                      </td>
                      <td
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--clr-muted)'
                        }}
                      >
                        {emp.position?.title || '—'}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            emp.employmentType === 'Permanent'
                              ? 'badge-green'
                              : emp.employmentType === 'Contract'
                              ? 'badge-yellow'
                              : 'badge-blue'
                          }`}
                        >
                          {emp.employmentType}
                        </span>
                      </td>
                      <td
                        style={{
                          fontSize: '0.82rem',
                          color: '#10b981',
                          fontWeight: 600
                        }}
                      >
                        {emp.basicSalary
                          ? `ETB ${emp.basicSalary.toLocaleString()}`
                          : '—'}
                      </td>
                      <td>
                        <StatusBadge status={emp.status} />
                      </td>
                      <td
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--clr-muted)'
                        }}
                      >
                        {emp.dateOfJoining
                          ? new Date(emp.dateOfJoining).toLocaleDateString()
                          : '—'}
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedEmp(emp)}
                          style={{
                            background: 'rgba(124,58,237,0.1)',
                            border: '1px solid rgba(124,58,237,0.25)',
                            borderRadius: 6,
                            color: '#a78bfa',
                            fontSize: '0.75rem',
                            padding: '0.3rem 0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          View
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem'
            }}
          >
            <button
              className='btn-ghost'
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  padding: '0.4rem 0.7rem',
                  fontSize: '0.8rem',
                  borderRadius: 6,
                  border: `1px solid ${
                    p === page ? '#7c3aed' : 'rgba(255,255,255,0.1)'
                  }`,
                  background:
                    p === page ? 'rgba(124,58,237,0.2)' : 'transparent',
                  color: p === page ? '#a78bfa' : 'var(--clr-muted)',
                  cursor: 'pointer'
                }}
              >
                {p}
              </button>
            ))}
            <button
              className='btn-ghost'
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              Next →
            </button>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <CreateEmployeeModal
            onClose={() => setShowCreate(false)}
            onCreated={load}
            departments={departments}
            positions={positions}
          />
        )}
      </AnimatePresence>

      {selectedEmp && (
        <EmployeeDetailModal
          employee={selectedEmp}
          onClose={() => setSelectedEmp(null)}
        />
      )}
    </motion.div>
  )
}
