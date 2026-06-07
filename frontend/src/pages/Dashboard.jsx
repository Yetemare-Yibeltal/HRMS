// pages/Dashboard.jsx — placeholder until Part 12
import { motion } from 'framer-motion'
import GradientText from '../components/ui/GradientText'
import { useAuth } from '../context/AuthContext'

export default function Dashboard () {
  const { user, role } = useAuth()
  return (
    <motion.div
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className='page-title'>
        <GradientText font='playfair' animate>
          Welcome to HRMS
        </GradientText>
      </h1>
      <p className='page-subtitle'>
        {user?.user?.email} — {role}
      </p>
      <div
        className='glass'
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--clr-muted)'
        }}
      >
        🚀 &nbsp; Full dashboard coming in Part 12
      </div>
    </motion.div>
  )
}
