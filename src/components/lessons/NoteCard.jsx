import { motion } from 'framer-motion';
import { RADIUS } from '../../utils/styleConstants';
import audioEngine from '../../utils/audio';
import { useResponsive } from '../../hooks/useResponsive';

/**
 * Komponenta pro zobrazení hudební noty s animacemi
 * @param {string} note - Nota k zobrazení (např. "C", "D#", "Eb")
 * @param {number} index - Index pro animační delay
 * @param {function} onClick - Volitelná funkce pro kliknutí (výchozí: přehrát notu)
 */
function NoteCard({ note, index = 0, onClick }) {
  const { width: windowWidth } = useResponsive();

  const handleClick = () => {
    if (onClick) {
      onClick(note);
    } else {
      audioEngine.playNote(note, 0.5);
    }
  };

  // Responzivní hodnoty podle stejných breakpointů jako PianoKeyboard
  const padding = windowWidth < 360 ? '0.65rem' : windowWidth < 480 ? '0.75rem' : '1rem';
  const fontSize = windowWidth < 360 ? '1.15rem' : windowWidth < 480 ? '1.35rem' : '1.5rem';
  const minWidth = windowWidth < 360 ? '50px' : windowWidth < 480 ? '55px' : '60px';

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 0.7, rotate: 0 }} // 30% menší
      transition={{ delay: index * 0.1, type: 'spring' }}
      whileHover={{ scale: 0.77, rotate: 5 }} // proporcionálně i hover
      style={{
        width: minWidth,
        flex: '0 0 auto',
        textAlign: 'center',
        padding,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: RADIUS.lg,
        fontSize,
        fontWeight: 600,
        color: 'var(--color-primary)',
        boxShadow: '0 4px 15px rgba(45, 91, 120, 0.2)',
        cursor: 'pointer'
      }}
      onClick={handleClick}
    >
      {note}
    </motion.div>
  );
}

export default NoteCard;
