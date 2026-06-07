import { motion } from 'framer-motion'
import PageHeader from '../components/ui/PageHeader'
export default function Training () {
  return (
    <motion.div
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader
        title='Training & Development'
        subtitle='Manage training programs and nominations'
      />
      <div
        className='glass'
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--clr-muted)'
        }}
      >
        📚 Training module — coming soon
      </div>
    </motion.div>
  )
}
