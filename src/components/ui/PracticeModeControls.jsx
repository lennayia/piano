import { motion } from 'framer-motion';
import { Target, Trophy, X } from 'lucide-react';
import { RADIUS } from '../../utils/styleConstants';

/**
 * Univerzální komponenta pro režimy cvičení (Procvičovat / Výzva)
 * Používá se v SongLibrary i v Cviceni (akordy)
 */
function PracticeModeControls({
  // States
  isPracticing = false,       // true pokud je aktivní procvičování
  isChallenge = false,         // true pokud je aktivní výzva
  practiceErrors = 0,          // počet chyb
  progress = 0,                // kolik not už bylo zahráno
  totalNotes = 0,              // celkový počet not

  // Callbacks
  onStartPractice,             // callback pro start procvičování
  onStartChallenge,            // callback pro start výzvy
  onStop,                      // callback pro ukončení

  // Styling
  showStopButton = true,       // zobrazit tlačítko "Ukončit"
  style = {}
}) {
  const isActive = isPracticing || isChallenge;

  return (
    <>
      {/* Tlačítka pro výběr režimu */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        ...style
      }}>
        {/* Pokud je aktivní režim, zobrazit tlačítko Ukončit */}
        {isActive && showStopButton ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStop}
            className="btn btn-primary"
            style={{
              fontSize: '0.875rem',
              padding: '0.5rem 1rem',
              background: 'var(--color-danger)',
              border: 'none'
            }}
          >
            <X size={16} />
            Ukončit {isPracticing ? 'procvičování' : 'výzvu'}
          </motion.button>
        ) : (
          <>
            {/* Tlačítko Procvičovat */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartPractice}
              className="btn"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                background: isPracticing ? 'var(--color-secondary)' : 'transparent',
                color: isPracticing ? 'white' : 'var(--color-secondary)',
                border: isPracticing ? 'none' : '2px solid var(--color-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Target size={16} />
              Procvičovat
            </motion.button>

            {/* Tlačítko Výzva */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartChallenge}
              className="btn"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                background: isChallenge
                  ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
                  : 'transparent',
                color: isChallenge ? 'white' : 'var(--color-primary)',
                border: isChallenge ? 'none' : '2px solid var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Trophy size={16} />
              Výzva
            </motion.button>
          </>
        )}
      </div>

      {/* Progress karta - zobrazit jen když je aktivní režim a jsou nějaké data */}
      {isActive && (progress > 0 || practiceErrors > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '1rem',
            background: isChallenge
              ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(181, 31, 101, 0.15))'
              : 'rgba(45, 91, 120, 0.1)',
            borderRadius: RADIUS.lg,
            marginBottom: '1rem',
            border: isChallenge
              ? '2px solid #FFD700'
              : '2px solid var(--color-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            {isChallenge ? <Trophy size={20} color="#FFD700" /> : <Target size={20} color="var(--color-secondary)" />}
            <span style={{ fontWeight: 600, color: isChallenge ? '#FFD700' : 'var(--color-secondary)' }}>
              {isChallenge ? 'Režim výzvy - Hraj bez nápovědy!' : 'Režim procvičování - S nápovědou'}
            </span>
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
            {isChallenge
              ? 'Zahrajte všechny noty bez chyb pro získání odměn!'
              : 'Procvičujte si s nápovědou. Odměny získáte v režimu Výzva.'
            } Chyby: <strong style={{ color: practiceErrors > 0 ? '#ef4444' : '#10b981' }}>{practiceErrors}</strong>
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
            Postup: <strong>{progress}</strong> / <strong>{totalNotes}</strong>
          </div>
        </motion.div>
      )}
    </>
  );
}

export default PracticeModeControls;
