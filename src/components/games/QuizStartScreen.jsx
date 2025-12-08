import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { RADIUS, SHADOW, BORDER } from '../../utils/styleConstants';
import QuizStatCard from './QuizStatCard';

/**
 * QuizStartScreen - Univerzální úvodní obrazovka pro kvízy
 * Reusable komponenta pro ChordQuiz, UniversalTheoryQuiz a další
 *
 * @param {string} title - Nadpis kvízu (např. "Kvíz: Akordy")
 * @param {string} description - Popisek kvízu
 * @param {React.Component} icon - Lucide ikona komponenta
 * @param {number} questionCount - Počet otázek
 * @param {number} bestStreak - Nejlepší série
 * @param {number} maxXP - Maximum XP
 * @param {function} onStart - Callback při kliknutí na "Začít kvíz"
 * @param {boolean} isMobile - Responzivní úpravy
 * @param {string} buttonText - Text tlačítka (default: "Začít kvíz")
 */
function QuizStartScreen({
  title,
  description,
  icon: Icon,
  questionCount,
  bestStreak = 0,
  maxXP = 100,
  onStart,
  isMobile = false,
  buttonText = 'Začít kvíz'
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255, 255, 255, 0.6)',
        borderRadius: RADIUS.lg,
        padding: isMobile ? '1.5rem' : '2rem',
        textAlign: 'center',
        border: BORDER.default,
        boxShadow: SHADOW.default
      }}
    >
      {/* Title s ikonou */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}>
        <Icon size={isMobile ? 28 : 32} color="var(--color-primary)" />
        <h2 style={{
          fontSize: isMobile ? '1.5rem' : '1.75rem',
          margin: 0,
          color: 'var(--text-primary)'
        }}>
          {title}
        </h2>
      </div>

      {/* Description */}
      <p style={{
        fontSize: isMobile ? '0.875rem' : '1rem',
        color: 'var(--text-secondary)',
        marginBottom: '2rem',
        maxWidth: '500px',
        margin: '0 auto 2rem'
      }}>
        {description} Odpovězte na {questionCount} otázek a prokažte své znalosti!
      </p>

      {/* Stat karty */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '2rem',
        maxWidth: '600px',
        margin: '0 auto 2rem'
      }}>
        <QuizStatCard
          value={questionCount}
          label="Otázek"
          variant="secondary"
          size="normal"
          isMobile={isMobile}
        />

        <QuizStatCard
          value={bestStreak}
          label="Nejlepší série"
          variant="primary"
          size="normal"
          isMobile={isMobile}
        />

        <QuizStatCard
          value={maxXP}
          label="Max XP"
          variant="secondary"
          size="normal"
          isMobile={isMobile}
        />
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        className="btn btn-primary"
        style={{
          fontSize: isMobile ? '0.875rem' : '1rem',
          padding: isMobile ? '0.625rem 1.25rem' : '0.625rem 1.5rem',
          borderRadius: RADIUS.md,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <Play size={isMobile ? 16 : 18} />
        {buttonText}
      </button>
    </motion.div>
  );
}

export default QuizStartScreen;
