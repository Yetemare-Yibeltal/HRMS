// components/ui/PageHeader.jsx
// Consistent page title area with gradient heading and breadcrumb.

import { motion } from 'framer-motion'
import GradientText from './GradientText'

export default function PageHeader ({
  title,
  subtitle,
  action, // optional JSX button/element on the right
  variant = 'primary'
}) {
  return (
    <motion.div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        gap: '1rem',
        flexWrap: 'wrap'
      }}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h1 className='page-title'>
          <GradientText variant={variant} font='playfair' animate>
            {title}
          </GradientText>
        </h1>
        {subtitle && (
          <p className='page-subtitle' style={{ marginBottom: 0 }}>
            {subtitle}
          </p>
        )}
      </div>

      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </motion.div>
  )
}
