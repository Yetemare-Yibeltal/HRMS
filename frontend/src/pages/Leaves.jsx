import { motion } from 'framer-motion'
import PageHeader from '../components/ui/PageHeader'
export default function Leaves () {
  return (
    <motion.div
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader
        title='Leave Management'
        subtitle='Manage leave requests and balances'
      />
      <div
        className='glass'
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--clr-muted)'
        }}
      >
        🌿 Leave module — coming soon
      </div>
    </motion.div>
  )
}
