import { motion } from 'framer-motion'
import PageHeader from '../components/ui/PageHeader'
export default function Exit () {
  return (
    <motion.div
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader
        title='Exit & Offboarding'
        subtitle='Manage employee exit processes'
      />
      <div
        className='glass'
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--clr-muted)'
        }}
      >
        🚪 Exit module — coming soon
      </div>
    </motion.div>
  )
}
