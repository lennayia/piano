import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { getMotivationalMessage } from '../../utils/quizUtils';
import { RADIUS, BORDER, SHADOW } from '../../utils/styleConstants';

/**
 * Komponenta pro zobrazení výsledků kvízu
 * @param {number} score - Počet správných odpovědí
 * @param {number} total - Celkový počet otázek
 * @param {number} bestStreak - Nejlepší série správných odpovědí za sebou
 * @param {number} totalXpEarned - Celkový počet získaných XP
 * @param {boolean} isMobile - Zda je zobrazeno na mobilním zařízení
 */
function QuizResultsPanel({ score, total, bestStreak, totalXpEarned, isMobile = false }) {
  const motivation = getMotivationalMessage(score, total);
  const percentage = Math.round((score / total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        marginTop: '2rem',
        padding: isMobile ? '1.5rem' : '2rem',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderRadius: RADIUS.xl,
        textAlign: 'center',
        border: BORDER.default,
        boxShadow: SHADOW.default
      }}
    >
      {/* Emoji */}
      <div style={{
        fontSize: isMobile ? '2rem' : '2.5rem',
        marginBottom: '1rem'
      }}>
        {motivation.emoji}
      </div>

      {/* Titulek */}
      <h3 style={{
        fontSize: isMobile ? '1.5rem' : '2rem',
        marginBottom: '0.5rem',
        color: 'var(--color-primary)'
      }}>
        {motivation.title}
      </h3>

      {/* Zpráva */}
      <p style={{
        fontSize: isMobile ? '0.95rem' : '1.125rem',
        color: 'var(--text-secondary)',
        marginBottom: '1rem'
      }}>
        {motivation.message}
      </p>

      {/* Skóre */}
      <p style={{
        fontSize: isMobile ? '1rem' : '1.25rem',
        color: 'var(--text-secondary)'
      }}>
        Vaše skóre: <strong style={{ color: 'var(--color-secondary)' }}>{score}/{total}</strong>
        {' '}({percentage}%)
      </p>

      {/* Nejlepší série */}
      {bestStreak > 1 && (
        <p style={{
          fontSize: isMobile ? '0.875rem' : '1rem',
          color: 'var(--text-secondary)',
          marginTop: '0.5rem'
        }}>
          Nejlepší série: <strong style={{ color: 'var(--color-secondary)' }}>
            {bestStreak} správně za sebou!
          </strong>
        </p>
      )}

      {/* XP získáno */}
      {totalXpEarned > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          style={{
            marginTop: '1rem',
            padding: isMobile ? '0.75rem' : '1rem',
            background: 'rgba(45, 91, 120, 0.05)',
            borderRadius: RADIUS.lg,
            display: 'inline-block'
          }}
        >
          <Zap
            size={isMobile ? 20 : 24}
            color="var(--color-secondary)"
            style={{
              display: 'inline',
              verticalAlign: 'middle',
              marginRight: '0.5rem'
            }}
          />
          <strong style={{
            fontSize: isMobile ? '1.125rem' : '1.5rem',
            color: 'var(--color-secondary)'
          }}>
            +{totalXpEarned} XP získáno!
          </strong>
        </motion.div>
      )}
    </motion.div>
  );
}

export default QuizResultsPanel;
