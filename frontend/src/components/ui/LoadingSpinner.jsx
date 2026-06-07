// components/ui/LoadingSpinner.jsx
// Full page loader shown during route transitions and data fetching.

import { motion } from 'framer-motion'

export default function LoadingSpinner ({ message = 'Loading...' }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem'
      }}
    >
      {/* Spinning gradient ring */}
      <motion.div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: '3px solid rgba(124,58,237,0.2)',
          borderTopColor: '#7c3aed',
          borderRightColor: '#db2777'
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />

      <p
        style={{
          color: 'var(--clr-muted)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}
      >
        {message}
      </p>
    </div>
  )
}
