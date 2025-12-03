import { motion } from 'framer-motion';
import { RADIUS } from '../../utils/styleConstants';

/**
 * Glassmorphism card komponenta
 * Použití: <GlassCard>{children}</GlassCard>
 */
function GlassCard({
  children,
  className = '',
  animate = false,
  animationProps = {},
  style = {},
  ...props
}) {
  const baseStyle = {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    border: 'none',
    boxShadow: '0 8px 32px rgba(181, 31, 101, 0.25), var(--shadow-lg)',
    borderRadius: RADIUS.lg,
    padding: '1.5rem',
    ...style
  };

  if (animate) {
    return (
      <motion.div
        className={`card ${className}`}
        style={baseStyle}
        {...animationProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={`card ${className}`}
      style={baseStyle}
      {...props}
    >
      {children}
    </div>
  );
}

export default GlassCard;
