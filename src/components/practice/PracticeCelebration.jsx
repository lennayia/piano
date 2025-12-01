import { Trophy, Music, Target, BookOpen, Star, Award, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Confetti from '../common/Confetti';
import Modal from '../ui/Modal';

/**
 * Univerzální komponenta pro oslavy
 * Používá existující moduly: Modal, Confetti
 * @param {boolean} showCelebration - Zobrazit konfety
 * @param {boolean} showSuccessModal - Zobrazit modal
 * @param {string} icon - Lucide ikona
 * @param {string} iconColor - Barva ikony
 * @param {string} title - Hlavní nadpis
 * @param {string} subtitle - Podnadpis
 * @param {number} xpAwarded - Počet XP
 * @param {string} xpLabel - Popisek k XP
 * @param {Function} onClose - Callback po zavření
 */
function PracticeCelebration({
  showCelebration = false,
  showSuccessModal = false,
  icon = 'Trophy',
  iconColor = 'var(--color-primary)',
  title = 'Skvěle, naprosto bez chyb!',
  subtitle = '',
  completedItemTitle = '',
  xpAwarded = 100,
  xpLabel = 'Odměna za perfektní zahrání',
  onClose
}) {
  const iconMap = { Trophy, Music, Target, BookOpen, Star, Award, Zap };
  const Icon = iconMap[icon] || Trophy;

  return (
    <>
      <Confetti show={showCelebration} onComplete={() => {}} />

      <Modal isOpen={showSuccessModal} onClose={onClose} hideHeader={true}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 250, 252, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: 'var(--radius-xxl)',
            padding: '2rem'
          }}>
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.1
            }}
            style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 2rem',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)',
              borderRadius: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
              border: 'none'
            }}>
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Icon size={56} color={iconColor} strokeWidth={2} />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-2"
            style={{ fontWeight: 'bold' }}
          >
            {title}
          </motion.h1>

          {/* Subtitle */}
          {(subtitle || completedItemTitle) && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-secondary mb-4"
              style={{ fontSize: '1.125rem' }}
            >
              Dokončili jste <strong>"{subtitle || completedItemTitle}"</strong>
            </motion.p>
          )}

          {/* XP Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 240, 245, 0.9) 0%, rgba(255, 245, 250, 0.7) 100%)',
              borderRadius: '24px',
              padding: '2rem',
              marginBottom: '2rem',
              border: 'none',
              boxShadow: '0 8px 24px rgba(181, 31, 101, 0.12), inset 0 0 40px rgba(181, 31, 101, 0.05)'
            }}>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--color-primary)' }}
              >
                +{xpAwarded} XP
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-secondary"
                style={{ fontSize: '1rem', marginTop: '0.5rem' }}
              >
                {xpLabel}
              </motion.div>
            </div>
          </motion.div>

          {/* Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-secondary mb-4"
            style={{ fontSize: '1rem' }}
          >
            Své statistiky a odměny najdete na <strong>Dashboardu</strong>
          </motion.p>

          {/* Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(45, 91, 120, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="btn btn-primary"
          >
            Pokračovat
          </motion.button>
        </motion.div>
      </Modal>
    </>
  );
}

export default PracticeCelebration;
