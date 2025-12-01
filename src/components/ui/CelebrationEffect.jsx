import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import audioEngine from '../../utils/audio';
import Confetti from '../common/Confetti';

/**
 * Vizuální komponenta pro oslavu dokončení
 * Zobrazuje konfety, ikonu, XP gain a zprávu
 */
function CelebrationEffect({
  isVisible,
  config = {},
  xpEarned = 0,
  achievements = [],
  onComplete
}) {
  const {
    sound = 'success',
    icon = 'Trophy',
    iconColor = 'primary',
    confetti: showConfetti = true,
    confettiType = 'metallic',
    message = 'Úspěch!'
  } = config;

  useEffect(() => {
    if (isVisible) {
      // Přehrát zvuk
      playSound(sound);

      // Automaticky zavřít po 3 sekundách
      const timer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, sound, onComplete]);

  const playSound = (soundType) => {
    switch (soundType) {
      case 'fanfare':
        audioEngine.playFanfare();
        break;
      case 'applause':
        audioEngine.playApplause();
        break;
      case 'achievement':
      case 'success':
      default:
        audioEngine.playSuccess();
        break;
    }
  };

  // Získat ikonu z Lucide
  const IconComponent = LucideIcons[icon] || LucideIcons.Trophy;

  return (
    <>
      {/* Konfety */}
      <Confetti show={isVisible && showConfetti} type={confettiType} onComplete={() => {}} />

      {/* Success Modal */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              borderRadius: 'calc(var(--radius) * 3)',
              padding: '3rem',
              textAlign: 'center',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              border: `2px solid var(--color-${iconColor})`
            }}
          >
            {/* Ikona */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 1.5rem',
                background: `linear-gradient(135deg, var(--color-${iconColor}), var(--color-${iconColor === 'primary' ? 'secondary' : 'primary'}))`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 32px var(--color-${iconColor}-transparent)`
              }}
            >
              <IconComponent size={64} color="white" />
            </motion.div>

            {/* Zpráva */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'var(--color-text)',
                marginBottom: '1rem'
              }}
            >
              {message}
            </motion.h2>

            {/* XP Gain */}
            {xpEarned > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  borderRadius: 'var(--radius-lg)',
                  display: 'inline-block',
                  marginBottom: '1.5rem',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 16px var(--color-primary-transparent)'
                }}
              >
                +{xpEarned} XP
              </motion.div>
            )}

            {/* Odemčené achievements */}
            {achievements && achievements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: 'var(--radius)',
                  border: '2px solid var(--color-secondary)'
                }}
              >
                <h3 style={{
                  fontSize: '1rem',
                  color: 'var(--color-secondary)',
                  marginBottom: '0.75rem'
                }}>
                  Nové odměny!
                </h3>
                {achievements.map((achievement, index) => (
                  <div
                    key={achievement.id}
                    style={{
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: index < achievements.length - 1 ? '0.5rem' : 0
                    }}
                  >
                    <strong>{achievement.title}</strong>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {achievement.description}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default CelebrationEffect;
