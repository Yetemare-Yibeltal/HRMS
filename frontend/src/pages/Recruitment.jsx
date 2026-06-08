// pages/Recruitment.jsx
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import GradientText from '../components/ui/GradientText'

const jobStatusColor = {
  Draft: 'badge-gray',
  Published: 'badge-green',
  Closed: 'badge-red',
  Cancelled: 'badge-red'
}
const appStatusColor = {
  Applied: 'badge-blue',
  Shortlisted: 'badge-purple',
  'Interview Scheduled': 'badge-yellow',
  Offered: 'badge-blue',
  Hired: 'badge-green',
  Rejected: 'badge-red'
}

function JobModal ({ job, departments, onClose, onSaved }) {
  const editing = !!job
  const [form, setForm] = useState({
    title: job?.title || '',
    department: job?.department?._id || '',
    description: job?.description || '',
    requirements: (job?.requirements || []).join('\n'),
    vacancies: job?.vacancies || 1,
    type: job?.type || 'Both',
    closingDate: job?.closingDate ? job.closingDate.slice(0, 10) : ''
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
        await api.put(`/recruitment/jobs/${job._id}`, payload)
        toast.success('Job posting updated.')
      } else {
        await api.post('/recruitment/jobs', payload)
        toast.success('Job posting created.')
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
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '2rem 1rem',
        overflowY: 'auto'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
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
              {editing ? 'Edit Job Posting' : 'New Job Posting'}
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
            <label style={lbl}>Job Title *</label>
            <input
              required
              style={inp}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder='Lecturer in Computer Science'
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
            <div>
              <label style={lbl}>Type</label>
              <select
                style={inp}
                value={form.type}
                onChange={e => set('type', e.target.value)}
              >
                <option value='Both'>Internal & External</option>
                <option value='Internal'>Internal Only</option>
                <option value='External'>External Only</option>
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
              <label style={lbl}>Vacancies</label>
              <input
                type='number'
                min='1'
                style={inp}
                value={form.vacancies}
                onChange={e => set('vacancies', Number(e.target.value))}
              />
            </div>
            <div>
              <label style={lbl}>Closing Date *</label>
              <input
                required
                type='date'
                style={inp}
                value={form.closingDate}
                onChange={e => set('closingDate', e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={lbl}>Description</label>
            <textarea
              style={{ ...inp, resize: 'vertical', minHeight: 80 }}
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
              placeholder={'MSc in relevant field\n2 years teaching experience'}
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

function ApplicantsModal ({ job, onClose }) {
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get(`/recruitment/applicants?jobPosting=${job._id}`)
      .then(r => setApplicants(r.data.applicants || []))
      .catch(() => toast.error('Failed to load applicants'))
      .finally(() => setLoading(false))
  }, [job._id])

  const handleStatusChange = async (appId, status) => {
    try {
      await api.put(`/recruitment/applicants/${appId}/status`, { status })
      toast.success(`Status updated to ${status}`)
      const r = await api.get(`/recruitment/applicants?jobPosting=${job._id}`)
      setApplicants(r.data.applicants || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.')
    }
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
          maxWidth: 740,
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
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.2rem',
                marginBottom: '0.2rem'
              }}
            >
              <GradientText>Applicants — {job.title}</GradientText>
            </h2>
            <p style={{ color: 'var(--clr-muted)', fontSize: '0.8rem' }}>
              {job.department?.name} · {applicants.length} applicant(s)
            </p>
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

        {loading ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--clr-muted)'
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ fontSize: '1.5rem', display: 'inline-block' }}
            >
              ⟳
            </motion.div>
          </div>
        ) : applicants.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--clr-muted)'
            }}
          >
            No applicants yet for this position.
          </div>
        ) : (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            {applicants.map(app => (
              <div
                key={app._id}
                style={{
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: '#f1f5f9',
                        marginBottom: '0.25rem'
                      }}
                    >
                      {app.firstName} {app.lastName}
                    </div>
                    <div
                      style={{ fontSize: '0.8rem', color: 'var(--clr-muted)' }}
                    >
                      {app.email} · {app.phone}
                    </div>
                    {app.coverLetter && (
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--clr-muted)',
                          marginTop: '0.3rem',
                          fontStyle: 'italic',
                          maxWidth: 400,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        "{app.coverLetter}"
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      alignItems: 'flex-end'
                    }}
                  >
                    <span
                      className={`badge ${
                        appStatusColor[app.status] || 'badge-gray'
                      }`}
                    >
                      {app.status}
                    </span>
                    <select
                      value={app.status}
                      onChange={e =>
                        handleStatusChange(app._id, e.target.value)
                      }
                      style={{
                        padding: '0.3rem 0.6rem',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6,
                        color: '#f1f5f9',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)'
                      }}
                    >
                      <option value='Applied'>Applied</option>
                      <option value='Shortlisted'>Shortlisted</option>
                      <option value='Interview Scheduled'>
                        Interview Scheduled
                      </option>
                      <option value='Offered'>Offered</option>
                      <option value='Hired'>Hired</option>
                      <option value='Rejected'>Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
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

export default function Recruitment () {
  const [jobs, setJobs] = useState([])
  const [departments, setDepartments] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [appModal, setAppModal] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = filterStatus ? `?status=${filterStatus}` : ''
      const [jobRes, deptRes, statsRes] = await Promise.all([
        api.get(`/recruitment/jobs${params}`),
        api.get('/departments'),
        api.get('/recruitment/stats')
      ])
      setJobs(jobRes.data.jobs || [])
      setDepartments(deptRes.data.departments || [])
      setStats(statsRes.data.stats || null)
    } catch {
      toast.error('Failed to load recruitment data')
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    load()
  }, [load])

  const handlePublish = async id => {
    try {
      await api.put(`/recruitment/jobs/${id}/publish`)
      toast.success('Job posting published.')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot publish.')
    }
  }

  const handleClose = async id => {
    if (!window.confirm('Close this job posting?')) return
    try {
      await api.put(`/recruitment/jobs/${id}/close`)
      toast.success('Job posting closed.')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot close.')
    }
  }

  return (
    <motion.div
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader
        title='Recruitment'
        subtitle='Manage job postings, applicants, and hiring pipeline'
        action={
          <motion.button
            className='btn-primary'
            onClick={() => setModal('create')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            + New Job Posting
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
              label: 'Open Jobs',
              value: stats.openJobs,
              color: '#10b981',
              icon: '📋'
            },
            {
              label: 'Applicants',
              value: stats.totalApplicants,
              color: '#7c3aed',
              icon: '👥'
            },
            {
              label: 'Shortlisted',
              value: stats.shortlisted,
              color: '#06b6d4',
              icon: '⭐'
            },
            {
              label: 'Hired',
              value: stats.hired,
              color: '#f97316',
              icon: '✅'
            },
            {
              label: 'Rejected',
              value: stats.rejected,
              color: '#ef4444',
              icon: '❌'
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
        {['', 'Draft', 'Published', 'Closed'].map(s => (
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
          {jobs.length === 0 ? (
            <div
              style={{
                gridColumn: '1/-1',
                padding: '3rem',
                textAlign: 'center',
                color: 'var(--clr-muted)'
              }}
            >
              No job postings found. Create one to get started.
            </div>
          ) : (
            jobs.map((job, i) => (
              <motion.div
                key={job._id}
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
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem'
                  }}
                >
                  <span className={`badge ${jobStatusColor[job.status]}`}>
                    {job.status}
                  </span>
                  <span
                    style={{ fontSize: '0.75rem', color: 'var(--clr-muted)' }}
                  >
                    {job.type}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1rem',
                    marginBottom: '0.3rem'
                  }}
                >
                  <GradientText variant='primary'>{job.title}</GradientText>
                </h3>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--clr-muted)',
                    marginBottom: '0.75rem'
                  }}
                >
                  {job.department?.name}
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    marginBottom: '0.75rem'
                  }}
                >
                  {[
                    { label: 'Vacancies', value: job.vacancies },
                    { label: 'Applicants', value: job.applicantCount || 0 }
                  ].map(s => (
                    <div
                      key={s.label}
                      style={{
                        padding: '0.5rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 6,
                        textAlign: 'center'
                      }}
                    >
                      <div
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color: '#f1f5f9'
                        }}
                      >
                        {s.value}
                      </div>
                      <div
                        style={{
                          fontSize: '0.65rem',
                          color: 'var(--clr-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em'
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
                  Closes:{' '}
                  {job.closingDate
                    ? new Date(job.closingDate).toLocaleDateString()
                    : '—'}
                </div>

                {job.requirements?.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    {job.requirements.slice(0, 2).map((req, ri) => (
                      <div
                        key={ri}
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--clr-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          marginBottom: '0.2rem'
                        }}
                      >
                        <span style={{ color: '#7c3aed' }}>•</span> {req}
                      </div>
                    ))}
                    {job.requirements.length > 2 && (
                      <div style={{ fontSize: '0.72rem', color: '#7c3aed' }}>
                        +{job.requirements.length - 2} more
                      </div>
                    )}
                  </div>
                )}

                <div
                  style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}
                >
                  <button
                    onClick={() => setAppModal(job)}
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
                    👥 Applicants ({job.applicantCount || 0})
                  </button>
                  {job.status === 'Draft' && (
                    <button
                      onClick={() => handlePublish(job._id)}
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
                      Publish
                    </button>
                  )}
                  {job.status === 'Published' && (
                    <button
                      onClick={() => handleClose(job._id)}
                      style={{
                        flex: 1,
                        padding: '0.45rem',
                        borderRadius: 6,
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        color: '#f87171',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Close
                    </button>
                  )}
                  {['Draft', 'Published'].includes(job.status) && (
                    <button
                      onClick={() => setModal(job)}
                      style={{
                        padding: '0.45rem 0.75rem',
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'var(--clr-muted)',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <JobModal
            job={modal === 'create' ? null : modal}
            departments={departments}
            onClose={() => setModal(null)}
            onSaved={load}
          />
        )}
        {appModal && (
          <ApplicantsModal job={appModal} onClose={() => setAppModal(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
