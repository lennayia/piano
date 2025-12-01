import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Konfigurace různých typů konfet
const CONFETTI_TYPES = {
  golden: {
    colors: ['#FFD700', '#FFC700', '#FFB700', '#FFA500'],
    count: 100,
    shapes: ['rect', 'circle', 'star'],
    intensity: 'high'
  },
  rainbow: {
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'],
    count: 120,
    shapes: ['rect', 'circle'],
    intensity: 'high'
  },
  pink: {
    colors: ['#B51F65', '#DD3379', '#E5B8F4', '#FFB6D9', '#FF69B4'],
    count: 80,
    shapes: ['rect', 'circle'],
    intensity: 'medium'
  },
  blue: {
    colors: ['#2D5B78', '#3B82F6', '#60A5FA', '#93C5FD', '#B9F2FF'],
    count: 80,
    shapes: ['rect', 'circle'],
    intensity: 'medium'
  },
  metallic: {
    colors: ['#FFD700', '#C0C0C0', '#CD7F32', '#E5B8F4', '#B9F2FF', '#FFB6D9'],
    count: 80,
    shapes: ['rect', 'circle'],
    intensity: 'medium'
  },
  stars: {
    colors: ['#FFD700', '#FFC700', '#FFFFFF', '#F0E68C'],
    count: 60,
    shapes: ['star'],
    intensity: 'medium'
  },
  minimal: {
    colors: ['#E5E7EB', '#D1D5DB', '#F3F4F6'],
    count: 40,
    shapes: ['circle'],
    intensity: 'low'
  }
};

function Confetti({ show, onComplete, type = 'metallic' }) {
  const [confettiPieces, setConfettiPieces] = useState([]);

  useEffect(() => {
    if (show) {
      const config = CONFETTI_TYPES[type] || CONFETTI_TYPES.metallic;

      // Vytvořit konfety podle typu
      const pieces = Array.from({ length: config.count }, (_, i) => {
        const shape = config.shapes[Math.floor(Math.random() * config.shapes.length)];
        const color = config.colors[Math.floor(Math.random() * config.colors.length)];

        return {
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: config.intensity === 'high' ? 2.5 + Math.random() * 2 : 2 + Math.random() * 2,
          rotation: Math.random() * 360,
          color,
          size: config.intensity === 'high' ? 8 + Math.random() * 12 : 6 + Math.random() * 10,
          shape
        };
      });
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
                background: piece.shape === 'star'
                  ? 'transparent'
                  : piece.shape === 'rect'
                    ? `linear-gradient(135deg, ${piece.color} 0%, ${piece.color}dd 50%, ${piece.color} 100%)`
                    : `radial-gradient(circle at 30% 30%, ${piece.color}ff, ${piece.color}99)`,
                borderRadius: piece.shape === 'rect' ? '2px' : piece.shape === 'circle' ? '50%' : '0',
                boxShadow: `0 0 ${piece.size}px ${piece.color}, inset 0 0 ${piece.size / 2}px rgba(255, 255, 255, 0.5)`,
                border: piece.shape === 'star' ? 'none' : `1px solid rgba(255, 255, 255, 0.3)`,
                transform: `rotateX(${Math.random() * 360}deg)`,
                ...(piece.shape === 'star' && {
                  clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                  background: `linear-gradient(135deg, ${piece.color} 0%, ${piece.color}dd 100%)`
                })
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Export konfigurace pro použití v admin rozhraní
export { CONFETTI_TYPES };

export default Confetti;
