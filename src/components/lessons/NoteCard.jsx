import { motion } from 'framer-motion';
import { RADIUS } from '../../utils/styleConstants';
import audioEngine from '../../utils/audio';

/**
 * Komponenta pro zobrazení hudební noty s animacemi
 * @param {string} note - Nota k zobrazení (např. "C", "D#", "Eb")
 * @param {number} index - Index pro animační delay
 * @param {function} onClick - Volitelná funkce pro kliknutí (výchozí: přehrát notu)
 */
function NoteCard({ note, index = 0, onClick }) {
  const handleClick = () => {
    if (onClick) {
      onClick(note);
    } else {
      audioEngine.playNote(note, 0.5);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: index * 0.1, type: 'spring' }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      style={{
        flex: 1,
        textAlign: 'center',
        padding: '1rem',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: RADIUS.lg,
        fontSize: '1.5rem',
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
