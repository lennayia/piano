import { motion, AnimatePresence } from 'framer-motion';
import { Target, Trophy, X, Eye, EyeOff, Piano, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { RADIUS } from '../../utils/styleConstants';
import { InfoPanel } from './CardComponents';

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
  completedItems = 0,          // kolik položek (akordů/písniček) bylo dokončeno
  totalItems = 0,              // celkový počet položek v sérii

  // Callbacks
  onStartPractice,             // callback pro start procvičování
  onStartChallenge,            // callback pro start výzvy
  onStop,                      // callback pro ukončení

  // Feedback ikony (✓ / ✗)
  showSuccess = false,         // zobrazit ikonu úspěchu
  showError = false,           // zobrazit ikonu chyby
  onReset,                     // callback pro reset/znovu (tlačítko "Znovu")

  // Skrýt noty tlačítko
  showHideNotesButton = false, // zobrazit tlačítko "Skrýt noty"
  hideNotes = false,           // jsou noty skryté?
  onToggleHideNotes,           // callback pro toggle skrytí not
  hideNotesDisabled = false,   // je tlačítko disabled?

  // Klavír tlačítko
  showKeyboardButton = false,  // zobrazit tlačítko "Zkusit na klavíru"
  keyboardVisible = false,     // je klavír viditelný?
  onToggleKeyboard,            // callback pro toggle klavíru

  // Styling
  showStopButton = true,       // zobrazit tlačítko "Ukončit"
  style = {},

  // Extra obsah
  children                     // extra tlačítka nebo obsah k zobrazení před hlavními tlačítky
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
        {/* Extra tlačítka (např. přehrávací) */}
        {children}

        {/* Tlačítko Skrýt noty */}
        {showHideNotesButton && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleHideNotes}
            disabled={hideNotesDisabled}
            className="btn"
            style={{
              fontSize: '0.875rem',
              padding: '0.5rem 1rem',
              background: 'rgba(45, 91, 120, 0.1)',
              color: 'var(--color-secondary)',
              border: 'none',
              borderRadius: RADIUS.md,
              opacity: hideNotesDisabled ? 0.5 : 1,
              cursor: hideNotesDisabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {hideNotes ? <Eye size={16} /> : <EyeOff size={16} />}
            {hideNotes ? 'Zobrazit noty' : 'Skrýt noty'}
          </motion.button>
        )}

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
              background: 'var(--color-primary)',
              border: 'none',
              borderRadius: RADIUS.md,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
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
                background: 'var(--color-secondary)',
                color: 'white',
                border: 'none',
                borderRadius: RADIUS.md,
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
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: RADIUS.md,
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

        {/* Tlačítko Zkusit na klavíru */}
        {showKeyboardButton && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleKeyboard}
            className="btn"
            style={{
              fontSize: '0.875rem',
              padding: '0.5rem 1rem',
              background: 'rgba(45, 91, 120, 0.1)',
              color: 'var(--color-secondary)',
              border: 'none',
              borderRadius: RADIUS.md,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Piano size={16} />
            {keyboardVisible ? 'Skrýt klavír' : 'Zkusit na klavíru'}
          </motion.button>
        )}
      </div>

      {/* Progress karta - zobrazit jen když je aktivní režim */}
      {isActive && (
        <InfoPanel
          as={motion.div}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          variant="primary"
          style={{ marginBottom: '1rem', marginTop: 0, borderRadius: RADIUS.lg }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', marginTop: '-0.25rem' }}>
            {isChallenge ? <Trophy size={20} color="var(--color-primary)" /> : <Target size={20} color="var(--color-secondary)" />}
            <span style={{ fontWeight: 600, color: isChallenge ? 'var(--color-primary)' : 'var(--color-secondary)' }}>
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
            Správné tóny: <strong>{progress}</strong> / <strong>{totalNotes}</strong>
          </div>
          {totalItems > 0 && (
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
              Bezchybné akordy: <strong style={{ color: 'var(--color-primary)' }}>{completedItems}</strong> / <strong>{totalItems}</strong>
            </div>
          )}
        </InfoPanel>
      )}

      {/* Feedback ikony a tlačítko Znovu - zobrazit když je aktivní režim a callback existuje */}
      {isActive && onReset && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          {/* Ikona úspěchu - BĚŽNÉ HRANÍ + PROCVIČOVÁNÍ (ne výzva) */}
          <AnimatePresence>
            {showSuccess && !isChallenge && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <CheckCircle size={24} color="var(--color-secondary)" fill="rgba(45, 91, 120, 0.15)" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ikona chyby */}
          <AnimatePresence>
            {showError && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  <XCircle size={24} color="var(--color-primary)" fill="rgba(181, 31, 101, 0.15)" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tlačítko Znovu */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1rem' }}
          >
            <RotateCcw size={16} />
            Znovu
          </motion.button>
        </div>
      )}
    </>
  );
}

export default PracticeModeControls;
