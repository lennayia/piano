import { motion } from 'framer-motion';
import { RADIUS } from '../../utils/styleConstants';
import audioEngine from '../../utils/audio';
import { useResponsive } from '../../hooks/useResponsive';
import { getNoteCardValues } from '../../utils/responsiveConstants';

function NoteCard({ note, index = 0, onClick }) {
  const { width: windowWidth } = useResponsive();

  const handleClick = () => {
    if (onClick) {
      onClick(note);
    } else {
      audioEngine.playNote(note, 0.5);
    }
  };

  // Responzivní hodnoty z centralizovaných konstant
  const { padding, fontSize, minWidth } = getNoteCardValues(windowWidth);

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
