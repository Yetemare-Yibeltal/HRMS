// pages/Departments.jsx
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import GradientText from '../components/ui/GradientText'

function DeptModal({ dept, onClose, onSaved }) {
  const editing = !!dept
  const [form, setForm] = useState({
    name:        dept?.name        || '',
    code:        dept?.code        || '',
    description: dept?.description || '',
    budget:      dept?.budget      || ''
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/departments/${dept._id}`, form)
        toast.success('Department updated.')
      } else {
        await api.post('/departments', form)
        toast.success('Department created.')
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
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        style={{
          width: '100%', maxWidth: 500,
          background: 'rgba(8,8,20,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, padding: '2rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>
            <GradientText>{editing ? 'Edit Department' : 'New Department'}</GradientText>
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            color: 'var(--clr-muted)', fontSize: '1.5rem', cursor: 'pointer'
          }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={lbl}>Department Name *</label>
              <input required style={inp} value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Computer Science" />
            </div>
            <div>
              <label style={lbl}>Code *</label>
              <input required style={inp} value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase())}
                placeholder="CS" />
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={lbl}>Description</label>
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 80 }}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Brief description of this department" />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={lbl}>Annual Budget (ETB)</label>
            <input type="number" style={inp} value={form.budget}
              onChange={e => set('budget', e.target.value)}
              placeholder="500000" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <motion.button type="submit" disabled={saving}
              className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {saving ? 'Saving...' : editing ? '✓ Update' : '✓ Create'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function Departments() {
  const [departments, setDepartments] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [modal,       setModal]       = useState(null) // null | 'create' | dept object
  const [deleting,    setDeleting]    = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/departments')
      setDepartments(data.departments || [])
    } catch {
      toast.error('Failed to load departments')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department? This cannot be undone.')) return
    setDeleting(id)
    try {
      await api.delete(`/departments/${id}`)
      toast.success('Department deleted.')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <motion.div className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title="Departments"
        subtitle={`${departments.length} departments`}
        action={
          <motion.button className="btn-primary"
            onClick={() => setModal('create')}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            + New Department
          </motion.button>
        }
      />

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--clr-muted)' }}>
          <motion.div animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ fontSize: '2rem', display: 'inline-block' }}>⟳</motion.div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {departments.map((dept, i) => (
            <motion.div
              key={dept._id}
              className="glass card-hover"
              style={{ padding: '1.5rem' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ delay: i * 0.06 }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'linear-gradient(135deg,#7c3aed,#db2777)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', fontWeight: 700, color: '#fff'
                }}>
                  {dept.code?.slice(0, 2)}
                </div>
                <span className="badge badge-green" style={{ alignSelf: 'flex-start' }}>
                  {dept.status}
                </span>
              </div>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem',
                marginBottom: '0.25rem' }}>
                <GradientText variant="primary">{dept.name}</GradientText>
              </h3>
              <p style={{ color: 'var(--clr-muted)', fontSize: '0.8rem', marginBottom: '1rem',
                lineHeight: 1.5 }}>
                {dept.description || 'No description provided.'}
              </p>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem',
                marginBottom: '1rem' }}>
                {[
                  { label: 'Employees', value: dept.employeeCount ?? 0 },
                  { label: 'Budget',    value: dept.budget ? `ETB ${(dept.budget/1000).toFixed(0)}k` : '—' }
                ].map(s => (
                  <div key={s.label} style={{
                    padding: '0.6rem', background: 'rgba(255,255,255,0.03)',
                    borderRadius: 8, textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--clr-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {dept.headOfDepartment && (
                <div style={{ fontSize: '0.78rem', color: 'var(--clr-muted)',
                  marginBottom: '1rem' }}>
                  👤 HOD: {dept.headOfDepartment.firstName} {dept.headOfDepartment.lastName}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setModal(dept)}
                  style={{
                    flex: 1, padding: '0.5rem',
                    background: 'rgba(124,58,237,0.1)',
                    border: '1px solid rgba(124,58,237,0.2)',
                    borderRadius: 8, color: '#a78bfa',
                    fontSize: '0.78rem', cursor: 'pointer'
                  }}>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(dept._id)}
                  disabled={deleting === dept._id}
                  style={{
                    flex: 1, padding: '0.5rem',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8, color: '#f87171',
                    fontSize: '0.78rem', cursor: 'pointer'
                  }}>
                  {deleting === dept._id ? '...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <DeptModal
            dept={modal === 'create' ? null : modal}
            onClose={() => setModal(null)}
            onSaved={load}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}