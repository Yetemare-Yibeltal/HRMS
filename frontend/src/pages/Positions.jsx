// pages/Positions.jsx
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import GradientText from '../components/ui/GradientText'

function PositionModal ({ position, departments, onClose, onSaved }) {
  const editing = !!position
  const [form, setForm] = useState({
    title: position?.title || '',
    department: position?.department?._id || '',
    grade: position?.grade || '',
    minSalary: position?.minSalary || '',
    maxSalary: position?.maxSalary || '',
    totalSlots: position?.totalSlots || 1,
    description: position?.description || '',
    requirements: (position?.requirements || []).join('\n')
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        requirements: form.requirements
          .split('\n')
          .map(r => r.trim())
          .filter(Boolean)
      }
      if (editing) {
        await api.put(`/positions/${position._id}`, payload)
        toast.success('Position updated.')
      } else {
        await api.post('/positions', payload)
        toast.success('Position created.')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save.')
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
        padding: '1rem',
        overflowY: 'auto'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          width: '100%',
          maxWidth: 560,
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
            <GradientText>
              {editing ? 'Edit Position' : 'New Position'}
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              marginBottom: '0.75rem'
            }}
          >
            <div>
              <label style={lbl}>Title *</label>
              <input
                required
                style={inp}
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder='Lecturer'
              />
            </div>
            <div>
              <label style={lbl}>Department *</label>
              <select
                required
                style={inp}
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
              <label style={lbl}>Salary Grade</label>
              <select
                style={inp}
                value={form.grade}
                onChange={e => set('grade', e.target.value)}
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
            <div>
              <label style={lbl}>Total Slots</label>
              <input
                type='number'
                min='1'
                style={inp}
                value={form.totalSlots}
                onChange={e => set('totalSlots', e.target.value)}
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
              <label style={lbl}>Min Salary (ETB)</label>
              <input
                type='number'
                style={inp}
                value={form.minSalary}
                onChange={e => set('minSalary', e.target.value)}
                placeholder='8000'
              />
            </div>
            <div>
              <label style={lbl}>Max Salary (ETB)</label>
              <input
                type='number'
                style={inp}
                value={form.maxSalary}
                onChange={e => set('maxSalary', e.target.value)}
                placeholder='15000'
              />
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={lbl}>Description</label>
            <textarea
              style={{ ...inp, resize: 'vertical', minHeight: 70 }}
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={lbl}>Requirements (one per line)</label>
            <textarea
              style={{ ...inp, resize: 'vertical', minHeight: 90 }}
              value={form.requirements}
              onChange={e => set('requirements', e.target.value)}
              placeholder={'MSc in relevant field\n2 years experience'}
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

export default function Positions () {
  const [positions, setPositions] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [filterDept, setFilterDept] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = filterDept ? `?department=${filterDept}` : ''
      const [posRes, deptRes] = await Promise.all([
        api.get(`/positions${params}`),
        api.get('/departments')
      ])
      setPositions(posRes.data.positions || [])
      setDepartments(deptRes.data.departments || [])
    } catch {
      toast.error('Failed to load positions')
    } finally {
      setLoading(false)
    }
  }, [filterDept])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async id => {
    if (!window.confirm('Delete this position?')) return
    try {
      await api.delete(`/positions/${id}`)
      toast.success('Position deleted.')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete.')
    }
  }

  return (
    <motion.div
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader
        title='Positions'
        subtitle={`${positions.length} job positions`}
        action={
          <motion.button
            className='btn-primary'
            onClick={() => setModal('create')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            + New Position
          </motion.button>
        }
      />

      {/* Filter */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}>
        <select
          className='input-field'
          style={{ maxWidth: 240 }}
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
        {filterDept && (
          <button className='btn-ghost' onClick={() => setFilterDept('')}>
            Clear
          </button>
        )}
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
                  <th>Title</th>
                  <th>Department</th>
                  <th>Grade</th>
                  <th>Salary Range</th>
                  <th>Slots</th>
                  <th>Filled</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {positions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: 'center',
                        color: 'var(--clr-muted)',
                        padding: '2rem'
                      }}
                    >
                      No positions found
                    </td>
                  </tr>
                ) : (
                  positions.map((pos, i) => (
                    <motion.tr
                      key={pos._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <td>
                        <div
                          style={{
                            fontWeight: 600,
                            color: '#f1f5f9',
                            fontSize: '0.87rem'
                          }}
                        >
                          {pos.title}
                        </div>
                        {pos.requirements?.length > 0 && (
                          <div
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--clr-muted)',
                              marginTop: '0.15rem'
                            }}
                          >
                            {pos.requirements.length} requirement(s)
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--clr-muted)'
                        }}
                      >
                        {pos.department?.name || '—'}
                      </td>
                      <td>
                        <span className='badge badge-purple'>
                          {pos.grade || '—'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#10b981' }}>
                        {pos.minSalary && pos.maxSalary
                          ? `ETB ${pos.minSalary.toLocaleString()} – ${pos.maxSalary.toLocaleString()}`
                          : '—'}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          fontWeight: 600,
                          color: '#f1f5f9'
                        }}
                      >
                        {pos.totalSlots}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            color:
                              pos.filledSlots >= pos.totalSlots
                                ? '#ef4444'
                                : '#10b981',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                          }}
                        >
                          {pos.filledSlots || 0}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            pos.status === 'Active'
                              ? 'badge-green'
                              : 'badge-red'
                          }`}
                        >
                          {pos.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => setModal(pos)}
                            style={{
                              padding: '0.3rem 0.65rem',
                              borderRadius: 6,
                              background: 'rgba(124,58,237,0.1)',
                              border: '1px solid rgba(124,58,237,0.2)',
                              color: '#a78bfa',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(pos._id)}
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
                            Del
                          </button>
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
        {modal && (
          <PositionModal
            position={modal === 'create' ? null : modal}
            departments={departments}
            onClose={() => setModal(null)}
            onSaved={load}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
