import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

// Slide from right (for forward navigation)
export function SlideIn({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-30%', opacity: 0 }}
      transition={{ 
        type: 'tween',
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide from left (for back navigation)
export function SlideOut({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ x: '-100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '30%', opacity: 0 }}
      transition={{ 
        type: 'tween',
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Fade transition (for tab switches)
export function FadeTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Full-screen slide (for modals/overlays)
export function FullScreenSlide({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ 
        type: 'tween',
        duration: 0.35,
        ease: [0.32, 0.72, 0, 1] as [number, number, number, number]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale fade (for dialogs)
export function ScaleFade({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
