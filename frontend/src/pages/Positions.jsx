import { motion } from 'framer-motion'
import PageHeader from '../components/ui/PageHeader'
export default function Positions() {
  return (
    <motion.div className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="Positions" subtitle="Manage job titles and salary grades" />
      <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--clr-muted)' }}>
        💼 Positions module — coming soon
      </div>
    </motion.div>
  )
}