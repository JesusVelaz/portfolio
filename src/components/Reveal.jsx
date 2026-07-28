import { motion } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion.js'

export function Reveal({ children, as = 'div', delay = 0, className, ...rest }) {
  const reduced = useReducedMotion()
  const Tag = motion[as] ?? motion.div

  if (reduced) {
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    )
  }

  // opacity and transform only. A blur here re-rasterizes the element's full area on the main
  // thread every frame, and Reveal wraps whole page sections — see the test in reveal.test.jsx.
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
