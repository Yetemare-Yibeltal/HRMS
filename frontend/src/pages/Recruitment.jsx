import { motion } from 'framer-motion'
import PageHeader from '../components/ui/PageHeader'
export default function Recruitment () {
  return (
    <motion.div
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader
        title='Recruitment'
        subtitle='Manage job postings and applicants'
      />
      <div
        className='glass'
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--clr-muted)'
        }}
      >
        📋 Recruitment module — coming soon
      </div>
    </motion.div>
  )
}
