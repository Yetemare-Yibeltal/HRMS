// pages/Dashboard.jsx
// Full dashboard with live stats from backend,
// employee chart, attendance overview, recent activity

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import GradientText from '../components/ui/GradientText'
import PageHeader from '../components/ui/PageHeader'

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard ({ title, value, icon, gradient, delay = 0, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '1.4rem',
        cursor: 'default',
        transition: 'transform 0.25s, box-shadow 0.25s'
      }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.3rem',
          marginBottom: '1rem'
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          fontFamily: 'var(--font-heading)',
          background: gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1
        }}
      >
        {value ?? '—'}
      </div>
      <div
        style={{
          color: 'var(--clr-muted)',
          fontSize: '0.78rem',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          fontWeight: 500,
          marginTop: '0.3rem'
        }}
      >
        {title}
      </div>
      {sub && (
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--clr-green)',
            marginTop: '0.3rem'
          }}
        >
          {sub}
        </div>
      )}
    </motion.div>
  )
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'rgba(10,10,26,0.95)',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: 10,
        padding: '0.6rem 0.9rem',
        fontSize: '0.8rem',
        color: '#f1f5f9'
      }}
    >
      <p style={{ margin: '0 0 0.25rem', color: '#a78bfa' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: 0, color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

const PIE_COLORS = [
  '#7c3aed',
  '#db2777',
  '#f97316',
  '#06b6d4',
  '#10b981',
  '#f59e0b'
]

export default function Dashboard () {
  const { role, user } = useAuth()

  const [stats, setStats] = useState(null)
  const [attendance, setAttendance] = useState(null)
  const [payroll, setPayroll] = useState([])
  const [leaves, setLeaves] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [empStats, todayAtt, empList, leaveReqs] = await Promise.all([
          api.get('/employees/stats').catch(() => ({ data: {} })),
          api.get('/attendance/today').catch(() => ({ data: {} })),
          api
            .get('/employees?limit=5')
            .catch(() => ({ data: { employees: [] } })),
          api
            .get('/leaves/requests?status=Pending')
            .catch(() => ({ data: { requests: [] } }))
        ])

        setStats(empStats.data.stats || {})
        setAttendance(todayAtt.data || {})
        setEmployees(empList.data.employees || [])
        setLeaves(leaveReqs.data.requests || [])

        // Payroll last 6 months mock structure
        // Replace with real API when payroll report is ready
        const now = new Date()
        const months = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
          return d.toLocaleDateString('en-US', { month: 'short' })
        })
        setPayroll(
          months.map(m => ({
            month: m,
            gross: Math.floor(Math.random() * 200000 + 400000),
            net: Math.floor(Math.random() * 150000 + 300000)
          }))
        )
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const deptData = (stats?.byDepartment || []).map(d => ({
    name: d.department || 'Unknown',
    count: d.count
  }))

  const genderData = (stats?.byGender || []).map(g => ({
    name: g._id || 'Unknown',
    value: g.count
  }))

  const typeData = (stats?.byType || []).map(t => ({
    name: t._id,
    value: t.count
  }))

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <motion.div
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            color: 'var(--clr-muted)',
            fontSize: '0.8rem',
            letterSpacing: '0.06em',
            marginBottom: '0.25rem'
          }}
        >
          {today}
        </motion.p>
        <h1 style={{ fontSize: '2.2rem', margin: 0 }}>
          <GradientText font='playfair' animate>
            HR Dashboard
          </GradientText>
        </h1>
        <p
          style={{
            color: 'var(--clr-muted)',
            marginTop: '0.25rem',
            fontSize: '0.9rem'
          }}
        >
          Welcome back,{' '}
          <strong style={{ color: '#f1f5f9' }}>{user?.user?.email}</strong> ·{' '}
          {role?.replace('_', ' ').toUpperCase()}
        </p>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem',
            color: 'var(--clr-muted)'
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
              fontSize: '2rem',
              display: 'inline-block',
              marginBottom: '1rem'
            }}
          >
            ⟳
          </motion.div>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* ── Row 1: Key Stats ──────────────────────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}
          >
            <StatCard
              title='Total Employees'
              value={stats?.totalEmployees ?? 0}
              icon='👥'
              gradient='linear-gradient(135deg,#7c3aed,#db2777)'
              delay={0}
            />
            <StatCard
              title='Active Staff'
              value={stats?.activeEmployees ?? 0}
              icon='✅'
              gradient='linear-gradient(135deg,#10b981,#06b6d4)'
              delay={0.1}
            />
            <StatCard
              title='On Leave'
              value={stats?.onLeave ?? 0}
              icon='🌿'
              gradient='linear-gradient(135deg,#f59e0b,#f97316)'
              delay={0.2}
            />
            <StatCard
              title='Terminated'
              value={stats?.terminated ?? 0}
              icon='🚪'
              gradient='linear-gradient(135deg,#ef4444,#db2777)'
              delay={0.3}
            />
            <StatCard
              title='Present Today'
              value={attendance?.overview?.present ?? 0}
              icon='📅'
              gradient='linear-gradient(135deg,#06b6d4,#7c3aed)'
              delay={0.4}
            />
            <StatCard
              title='Pending Leaves'
              value={leaves.length}
              icon='📋'
              gradient='linear-gradient(135deg,#f97316,#f59e0b)'
              delay={0.5}
            />
          </div>

          {/* ── Row 2: Charts ─────────────────────────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}
          >
            {/* Employees by Department Bar Chart */}
            <motion.div
              className='glass'
              style={{ padding: '1.5rem' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1rem',
                  marginBottom: '1rem',
                  color: '#f1f5f9'
                }}
              >
                <GradientText variant='primary'>
                  Employees by Department
                </GradientText>
              </h3>
              {deptData.length > 0 ? (
                <ResponsiveContainer width='100%' height={200}>
                  <BarChart
                    data={deptData}
                    margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke='rgba(255,255,255,0.05)'
                    />
                    <XAxis
                      dataKey='name'
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey='count'
                      name='Employees'
                      radius={[6, 6, 0, 0]}
                      fill='url(#barGrad)'
                    />
                    <defs>
                      <linearGradient id='barGrad' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='0%' stopColor='#7c3aed' />
                        <stop offset='100%' stopColor='#db2777' />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--clr-muted)',
                    fontSize: '0.85rem'
                  }}
                >
                  No department data yet
                </div>
              )}
            </motion.div>

            {/* Gender Distribution Pie Chart */}
            <motion.div
              className='glass'
              style={{ padding: '1.5rem' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1rem',
                  marginBottom: '1rem',
                  color: '#f1f5f9'
                }}
              >
                <GradientText variant='blue'>Gender Distribution</GradientText>
              </h3>
              {genderData.length > 0 ? (
                <ResponsiveContainer width='100%' height={200}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx='50%'
                      cy='50%'
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey='value'
                    >
                      {genderData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={v => (
                        <span style={{ color: '#94a3b8', fontSize: 12 }}>
                          {v}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--clr-muted)',
                    fontSize: '0.85rem'
                  }}
                >
                  No gender data yet
                </div>
              )}
            </motion.div>

            {/* Employment Type Pie */}
            <motion.div
              className='glass'
              style={{ padding: '1.5rem' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1rem',
                  marginBottom: '1rem',
                  color: '#f1f5f9'
                }}
              >
                <GradientText variant='green'>Employment Types</GradientText>
              </h3>
              {typeData.length > 0 ? (
                <ResponsiveContainer width='100%' height={200}>
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx='50%'
                      cy='50%'
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey='value'
                    >
                      {typeData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[(i + 2) % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={v => (
                        <span style={{ color: '#94a3b8', fontSize: 12 }}>
                          {v}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--clr-muted)',
                    fontSize: '0.85rem'
                  }}
                >
                  No employment type data yet
                </div>
              )}
            </motion.div>
          </div>

          {/* ── Row 3: Payroll Trend ──────────────────────────────────────── */}
          <motion.div
            className='glass'
            style={{ padding: '1.5rem', marginBottom: '1.5rem' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                marginBottom: '1rem',
                color: '#f1f5f9'
              }}
            >
              <GradientText variant='warm'>
                Payroll Trend — Last 6 Months (ETB)
              </GradientText>
            </h3>
            <ResponsiveContainer width='100%' height={220}>
              <LineChart
                data={payroll}
                margin={{ top: 5, right: 10, bottom: 0, left: 10 }}
              >
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='rgba(255,255,255,0.05)'
                />
                <XAxis
                  dataKey='month'
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={v => (
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>
                  )}
                />
                <Line
                  type='monotone'
                  dataKey='gross'
                  name='Gross Salary'
                  stroke='#7c3aed'
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#7c3aed' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type='monotone'
                  dataKey='net'
                  name='Net Salary'
                  stroke='#10b981'
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* ── Row 4: Attendance Today + Pending Leaves ──────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}
          >
            {/* Today Attendance Overview */}
            <motion.div
              className='glass'
              style={{ padding: '1.5rem' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1rem',
                  marginBottom: '1rem',
                  color: '#f1f5f9'
                }}
              >
                <GradientText variant='blue'>Today's Attendance</GradientText>
              </h3>

              {[
                {
                  label: 'Present',
                  value: attendance?.overview?.present ?? 0,
                  color: '#10b981'
                },
                {
                  label: 'Late',
                  value: attendance?.overview?.late ?? 0,
                  color: '#f59e0b'
                },
                {
                  label: 'On Leave',
                  value: attendance?.overview?.onLeave ?? 0,
                  color: '#06b6d4'
                },
                {
                  label: 'Absent',
                  value: attendance?.overview?.absent ?? 0,
                  color: '#ef4444'
                }
              ].map(item => {
                const total = attendance?.overview?.totalEmployees || 1
                const pct = Math.round((item.value / total) * 100)
                return (
                  <div key={item.label} style={{ marginBottom: '0.9rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.3rem',
                        fontSize: '0.82rem'
                      }}
                    >
                      <span style={{ color: 'var(--clr-muted)' }}>
                        {item.label}
                      </span>
                      <span style={{ color: item.color, fontWeight: 600 }}>
                        {item.value} ({pct}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: 999
                      }}
                    >
                      <motion.div
                        style={{
                          height: 6,
                          background: item.color,
                          borderRadius: 999
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          duration: 0.8,
                          delay: 0.6,
                          ease: 'easeOut'
                        }}
                      />
                    </div>
                  </div>
                )
              })}

              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.65rem 0.9rem',
                  background: 'rgba(124,58,237,0.08)',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  color: 'var(--clr-muted)'
                }}
              >
                Total workforce:{' '}
                <strong style={{ color: '#f1f5f9' }}>
                  {attendance?.overview?.totalEmployees ?? 0}
                </strong>{' '}
                employees
              </div>
            </motion.div>

            {/* Pending Leave Requests */}
            <motion.div
              className='glass'
              style={{ padding: '1.5rem' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1rem',
                  marginBottom: '1rem',
                  color: '#f1f5f9'
                }}
              >
                <GradientText variant='warm'>
                  Pending Leave Requests
                </GradientText>
              </h3>

              {leaves.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'var(--clr-muted)',
                    fontSize: '0.85rem'
                  }}
                >
                  ✅ No pending leave requests
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}
                >
                  {leaves.slice(0, 5).map((req, i) => (
                    <motion.div
                      key={req._id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.06 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.65rem 0.75rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.06)'
                      }}
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: 'linear-gradient(135deg,#7c3aed,#db2777)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          color: '#fff'
                        }}
                      >
                        {req.employee?.firstName?.[0] || '?'}
                        {req.employee?.lastName?.[0] || ''}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: '#f1f5f9',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
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
                          {req.leaveType?.name} · {req.totalDays} day(s)
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.5rem',
                          borderRadius: 999,
                          background: 'rgba(245,158,11,0.15)',
                          color: '#f59e0b',
                          flexShrink: 0
                        }}
                      >
                        PENDING
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* ── Row 5: Recent Employees ───────────────────────────────────── */}
          <motion.div
            className='glass'
            style={{ padding: '1.5rem' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                marginBottom: '1rem',
                color: '#f1f5f9'
              }}
            >
              <GradientText variant='primary'>
                Recently Added Employees
              </GradientText>
            </h3>

            {employees.length === 0 ? (
              <p
                style={{
                  color: 'var(--clr-muted)',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  padding: '1.5rem'
                }}
              >
                No employees found. Add employees via the Employees module.
              </p>
            ) : (
              <div className='table-wrap'>
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Code</th>
                      <th>Department</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, i) => (
                      <motion.tr
                        key={emp._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.65 + i * 0.05 }}
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
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background:
                                  'linear-gradient(135deg,#7c3aed,#db2777)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
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
                        <td
                          style={{
                            fontSize: '0.8rem',
                            color: '#a78bfa',
                            fontFamily: 'monospace'
                          }}
                        >
                          {emp.employeeCode}
                        </td>
                        <td
                          style={{
                            fontSize: '0.82rem',
                            color: 'var(--clr-muted)'
                          }}
                        >
                          {emp.department?.name || '—'}
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
                        <td>
                          <span
                            className={`badge ${
                              emp.status === 'Active'
                                ? 'badge-green'
                                : emp.status === 'On-Leave'
                                ? 'badge-blue'
                                : emp.status === 'Suspended'
                                ? 'badge-yellow'
                                : 'badge-red'
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
