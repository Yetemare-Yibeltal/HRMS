import { motion } from 'framer-motion'
import PageHeader from '../components/ui/PageHeader'
export default function Appraisals () {
  return (
    <motion.div
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader
        title='Performance Appraisals'
        subtitle='Manage employee performance reviews'
      />
      <div
        className='glass'
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--clr-muted)'
        }}
      >
        ⭐ Appraisals module — coming soon
      </div>
    </motion.div>
  )
}
