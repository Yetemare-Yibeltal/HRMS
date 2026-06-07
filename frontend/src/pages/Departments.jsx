// pages/Departments.jsx — placeholder
import { motion } from 'framer-motion'
import PageHeader from '../components/ui/PageHeader'

export default function Departments () {
  return (
    <motion.div
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <PageHeader
        title='Departments'
        subtitle='Manage university departments'
      />
      <div
        className='glass'
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--clr-muted)'
        }}
      >
        🏗️ &nbsp; Departments module — coming in next part
      </div>
    </motion.div>
  )
}
