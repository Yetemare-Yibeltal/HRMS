import { motion } from 'framer-motion'
import PageHeader from '../components/ui/PageHeader'
export default function Profile () {
  return (
    <motion.div
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader
        title='My Profile'
        subtitle='View and update your personal information'
      />
      <div
        className='glass'
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--clr-muted)'
        }}
      >
        👤 Profile module — coming soon
      </div>
    </motion.div>
  )
}
