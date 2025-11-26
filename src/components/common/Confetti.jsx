import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Confetti({ show, onComplete }) {
  const [confettiPieces, setConfettiPieces] = useState([]);

  useEffect(() => {
    if (show) {
      // Vytvořit 80 konfet - víc pro lepší efekt
      const pieces = Array.from({ length: 80 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        rotation: Math.random() * 360,
        // Kovové barvy - zlatá, stříbrná, bronzová, růžovo-zlatá
        color: ['#FFD700', '#C0C0C0', '#CD7F32', '#E5B8F4', '#B9F2FF', '#FFB6D9'][Math.floor(Math.random() * 6)],
        size: 6 + Math.random() * 10,
        shape: Math.random() > 0.5 ? 'rect' : 'circle' // Mix obdélníků a kruhů
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
            zIndex: 10000,
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
                height: piece.shape === 'rect' ? `${piece.size * 0.6}px` : `${piece.size}px`,
                background: piece.shape === 'rect'
                  ? `linear-gradient(135deg, ${piece.color} 0%, ${piece.color}dd 50%, ${piece.color} 100%)`
                  : `radial-gradient(circle at 30% 30%, ${piece.color}ff, ${piece.color}99)`,
                borderRadius: piece.shape === 'rect' ? '2px' : '50%',
                boxShadow: `0 0 ${piece.size}px ${piece.color}, inset 0 0 ${piece.size / 2}px rgba(255, 255, 255, 0.5)`,
                border: `1px solid rgba(255, 255, 255, 0.3)`,
                transform: `rotateX(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

export default Confetti;
