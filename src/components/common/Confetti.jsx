import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Confetti({ show, onComplete }) {
  const [confettiPieces, setConfettiPieces] = useState([]);

  useEffect(() => {
    if (show) {
      // Vytvořit 50 konfet
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        rotation: Math.random() * 360,
        color: ['#b51f65', '#d63384', '#2d5b78', '#ffd700', '#ff69b4', '#87ceeb'][Math.floor(Math.random() * 6)],
        size: 8 + Math.random() * 8
      }));
      setConfettiPieces(pieces);

      // Po 4 sekundách zavolat onComplete
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 9999,
            overflow: 'hidden'
          }}
        >
          {confettiPieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                top: '-10%',
                left: `${piece.left}%`,
                rotate: 0,
                opacity: 1
              }}
              animate={{
                top: '110%',
                rotate: piece.rotation * 3,
                opacity: [1, 1, 0.8, 0]
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: 'linear'
              }}
              style={{
                position: 'absolute',
                width: `${piece.size}px`,
                height: `${piece.size}px`,
                backgroundColor: piece.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                boxShadow: `0 0 ${piece.size / 2}px ${piece.color}`
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

export default Confetti;
