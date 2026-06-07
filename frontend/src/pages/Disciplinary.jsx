import { motion } from 'framer-motion'
import PageHeader from '../components/ui/PageHeader'
export default function Disciplinary () {
  return (
    <motion.div
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader
        title='Disciplinary & Grievance'
        subtitle='Manage disciplinary cases and grievances'
      />
      <div
        className='glass'
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--clr-muted)'
        }}
      >
        ⚖️ Disciplinary module — coming soon
      </div>
    </motion.div>
  )
}
