import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import Confetti from '../common/Confetti';

/**
 * Univerzální komponenta pro oslavy při perfektním zahrání v režimu výzvy
 * Zobrazuje konfety a success modal
 */
function PracticeCelebration({
  showCelebration = false,
  showSuccessModal = false,
  completedItemTitle = '',
  xpAwarded = 100,
  onClose
}) {
  return (
    <>
      {/* Confetti při perfektním zahrání */}
      <Confetti show={showCelebration} onComplete={() => {}} />

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="card"
              style={{
                maxWidth: '500px',
                width: '100%',
                padding: '2rem',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '2px solid rgba(181, 31, 101, 0.3)',
                boxShadow: '0 20px 60px rgba(181, 31, 101, 0.4)',
                textAlign: 'center'
              }}
            >
              {/* Trophy Icon */}
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 1.5rem',
                background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.2) 0%, rgba(221, 51, 121, 0.2) 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid rgba(181, 31, 101, 0.3)'
              }}>
                <Trophy size={40} color="var(--color-primary)" />
              </div>

              {/* Success Message */}
              <h2 style={{
                marginBottom: '0.5rem',
                color: '#1e293b',
                fontSize: '1.75rem'
              }}>
                Skvěle, naprosto bez chyb!
              </h2>

              <p style={{
                fontSize: '1.125rem',
                color: '#64748b',
                marginBottom: '1.5rem'
              }}>
                Dokončili jste <strong style={{ color: 'var(--color-primary)' }}>"{completedItemTitle}"</strong>
              </p>

              {/* Reward Info */}
              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.1) 0%, rgba(221, 51, 121, 0.1) 100%)',
                borderRadius: 'var(--radius)',
                marginBottom: '1.5rem',
                border: '2px solid rgba(181, 31, 101, 0.2)'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: 'var(--color-primary)',
                  marginBottom: '0.5rem'
                }}>
                  +{xpAwarded} XP
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#64748b'
                }}>
                  Odměna za perfektní zahrání
                </div>
              </div>

              {/* Info where to find stats */}
              <p style={{
                fontSize: '0.875rem',
                color: '#64748b',
                marginBottom: '1.5rem'
              }}>
                Své statistiky a odměny najdete na{' '}
                <strong style={{ color: 'var(--color-primary)' }}>Dashboardu</strong>
              </p>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="btn btn-primary"
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.9) 0%, rgba(221, 51, 121, 0.9) 100%)',
                  border: '2px solid rgba(181, 31, 101, 0.3)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(181, 31, 101, 0.3)',
                  transition: 'all 0.3s'
                }}
              >
                Pokračovat
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default PracticeCelebration;
