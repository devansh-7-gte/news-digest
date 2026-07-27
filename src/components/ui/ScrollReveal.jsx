'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * Wraps children in a scroll-triggered reveal animation.
 * Uses Intersection Observer via framer-motion's useInView.
 */
export default function ScrollReveal({
  children,
  variant = 'fade-up',
  delay = 0,
  className = '',
  once = true,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '0px' });

  const variants = {
    'fade-up':    { hidden: { opacity: 0, y: 30 },  visible: { opacity: 1, y: 0 } },
    'fade-left':  { hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } },
    'fade-right': { hidden: { opacity: 0, x: 30 },  visible: { opacity: 1, x: 0 } },
    'scale':      { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } },
  };

  const v = variants[variant] || variants['fade-up'];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={v}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
