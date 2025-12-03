import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloseButton } from './ButtonComponents';
import { useResponsive } from '../../hooks/useResponsive';

function Modal({ isOpen, onClose, children, title, hideHeader = false }) {
  const { width: windowWidth } = useResponsive();

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

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Responzivní padding: 320-700px = menší, 700px+ = plný
  const backdropPadding = windowWidth < 700 ? '0.75rem' : '2rem';
  const contentPadding = windowWidth < 700 ? '0.75rem' : '1.5rem';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            className="modal-backdrop"
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
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: backdropPadding,
              overflowY: 'auto'
            }}
          >
            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: 'spring' }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 20px 60px rgba(31, 38, 135, 0.3)',
                borderRadius: 'var(--radius-xl)',
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative'
              }}
            >
              {/* Header - podmíněně skrytý */}
              {!hideHeader && (
                <div style={{
                  position: 'sticky',
                  top: 0,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  padding: contentPadding,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  zIndex: 10,
                  borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0'
                }}>
                  {title && <h2 style={{ margin: 0, color: '#1e293b' }}>{title}</h2>}
                  <CloseButton
                    onClick={onClose}
                    style={{ marginLeft: 'auto' }}
                  />
                </div>
              )}

              {/* Body */}
              <div className="modal-body" style={{ padding: contentPadding }}>
                {children}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default Modal;
