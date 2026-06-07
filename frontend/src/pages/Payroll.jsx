import { motion } from 'framer-motion'
import PageHeader from '../components/ui/PageHeader'
export default function Payroll () {
  return (
    <motion.div
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader
        title='Payroll & Compensation'
        subtitle='Process salaries and manage compensation'
      />
      <div
        className='glass'
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--clr-muted)'
        }}
      >
        💰 Payroll module — coming soon
      </div>
    </motion.div>
  )
}
