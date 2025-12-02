import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloseButton } from './ButtonComponents';
import { useResponsive } from '../../hooks/useResponsive';
import { DRAWER_SPACING } from '../../utils/styleConstants';

/**
 * Modulární Drawer/SlideoutPanel komponenta
 * Slideuje zprava, moderní alternativa k Modalu pro zobrazení detailu
 *
 * @param {boolean} isOpen - Je drawer otevřený
 * @param {function} onClose - Callback pro zavření
 * @param {ReactNode} children - Obsah draweru
 * @param {string} title - Volitelný nadpis v headeru
 * @param {string} width - Volitelná šířka (default: '500px')
 * @param {boolean} showCloseButton - Zobrazit CloseButton v top-right (default: true)
 */
function Drawer({
  isOpen,
  onClose,
  children,
  title,
  width = '500px',
  showCloseButton = true
}) {
  const { isMobile } = useResponsive();
  const spacing = isMobile ? DRAWER_SPACING.mobile : DRAWER_SPACING.desktop;

  // Body scroll locking
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Escape key support
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 1000
            }}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: isMobile ? '100%' : width,
              maxWidth: '100%',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: 'none',
              boxShadow: '-4px 0 60px rgba(181, 31, 101, 0.2)',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto'
            }}
          >
            {/* Header s CloseButton */}
            {(title || showCloseButton) && (
              <div style={{
                position: 'sticky',
                top: 0,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                padding: isMobile ? '1rem' : '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 10
              }}>
                {title && (
                  <h2 style={{
                    margin: 0,
                    color: 'var(--color-text)',
                    fontSize: isMobile ? '1.25rem' : '1.5rem',
                    fontWeight: 600
                  }}>
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <CloseButton
                    onClick={onClose}
                    style={{ marginLeft: title ? 'auto' : 0 }}
                  />
                )}
              </div>
            )}

            {/* Content */}
            <div style={{
              flex: 1,
              padding: spacing.contentPadding
            }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default Drawer;
