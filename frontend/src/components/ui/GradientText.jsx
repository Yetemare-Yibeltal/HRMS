// components/ui/GradientText.jsx
// Renders text with an animated or static gradient fill.
// Uses CSS background-clip — GPU composited, zero layout impact.

import { motion } from 'framer-motion'

export default function GradientText ({
  children,
  className = '',
  variant = 'primary', // primary | blue | green | warm
  animate = false,
  font = 'cinzel', // cinzel | playfair | montserrat
  as = 'span'
}) {
  const fonts = {
    cinzel: 'var(--font-display)',
    playfair: 'var(--font-heading)',
    montserrat: 'var(--font-body)'
  }

  const gradients = {
    primary: 'linear-gradient(135deg, #a78bfa, #ec4899, #f97316)',
    blue: 'linear-gradient(135deg, #06b6d4, #a78bfa)',
    green: 'linear-gradient(135deg, #10b981, #06b6d4)',
    warm: 'linear-gradient(135deg, #f97316, #ec4899)'
  }

  const baseStyle = {
    fontFamily: fonts[font],
    background: animate
      ? 'linear-gradient(135deg, #a78bfa, #ec4899, #f97316, #a78bfa)'
      : gradients[variant],
    backgroundSize: animate ? '300% 300%' : '100%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    display: 'inline-block'
  }

  // Animated version uses Framer Motion for background-position
  if (animate) {
    return (
      <motion.span
        className={className}
        style={baseStyle}
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      >
        {children}
      </motion.span>
    )
  }

  const Tag = as
  return (
    <Tag className={className} style={baseStyle}>
      {children}
    </Tag>
  )
}
