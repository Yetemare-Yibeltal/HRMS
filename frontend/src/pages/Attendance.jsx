import { motion } from 'framer-motion'
import PageHeader from '../components/ui/PageHeader'
export default function Attendance () {
  return (
    <motion.div
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader
        title='Attendance Tracking'
        subtitle='Monitor daily attendance and time records'
      />
      <div
        className='glass'
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--clr-muted)'
        }}
      >
        📅 Attendance module — coming soon
      </div>
    </motion.div>
  )
}
