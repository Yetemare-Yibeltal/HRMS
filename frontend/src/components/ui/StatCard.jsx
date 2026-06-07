// components/ui/StatCard.jsx
// Dashboard metric card with icon, value, label, and trend indicator.
// Hover animation uses transform only — no layout triggers.

import { motion } from 'framer-motion'

export default function StatCard ({
  title,
  value,
  icon,
  gradient = 'var(--grad-primary)',
  trend, // e.g. "+12% this month"
  trendUp, // true = green, false = red
  delay = 0
}) {
  return (
    <motion.div
      className='glass card-hover'
      style={{ padding: '1.5rem', cursor: 'default' }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {/* Icon bubble */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          marginBottom: '1rem',
          flexShrink: 0
        }}
      >
        {icon}
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          lineHeight: 1,
          marginBottom: '0.35rem',
          fontFamily: 'var(--font-heading)',
          background: gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        {value}
      </div>

      {/* Title */}
      <div
        style={{
          color: 'var(--clr-muted)',
          fontSize: '0.82rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: trend ? '0.5rem' : 0
        }}
      >
        {title}
      </div>

      {/* Trend */}
      {trend && (
        <div
          style={{
            fontSize: '0.78rem',
            color: trendUp ? 'var(--clr-green)' : 'var(--clr-red)',
            fontWeight: 500
          }}
        >
          {trendUp ? '↑' : '↓'} {trend}
        </div>
      )}
    </motion.div>
  )
}
