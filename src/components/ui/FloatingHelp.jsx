import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Minimize2, Maximize2, GripHorizontal } from 'lucide-react';

/**
 * FAB tlačítko s plovoucí nápovědou - kompletní modul
 *
 * @param {string} title - Titulek nápovědy
 * @param {React.ReactNode} children - Obsah nápovědy
 */
export function FloatingHelpButton({ title = 'Nápověda', children }) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      {/* FAB tlačítko - vpravo dole */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowHelp(true)}
        title={title}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'linear-gradient(135deg, var(--color-primary) 0%, rgba(221, 51, 121, 0.9) 100%)',
          border: 'none',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 6px 20px rgba(181, 31, 101, 0.4)',
          zIndex: 9990
        }}
      >
        <HelpCircle size={26} style={{ pointerEvents: 'none' }} />
      </motion.button>

      {/* Plovoucí nápověda */}
      <FloatingHelp
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title={title}
      >
        {children}
      </FloatingHelp>
    </>
  );
}

/**
 * Plovoucí nápověda - draggable modal
 *
 * @param {boolean} isOpen - Zda je nápověda otevřená
 * @param {function} onClose - Callback při zavření
 * @param {string} title - Titulek nápovědy
 * @param {React.ReactNode} children - Obsah nápovědy
 */
function FloatingHelp({ isOpen, onClose, title = 'Nápověda', children }) {
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dragRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  // Detekce mobilu
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset pozice při otevření
  useEffect(() => {
    if (isOpen && !isMobile) {
      // Pozice vpravo - nad FAB tlačítkem
      const windowHeight = window.innerHeight;
      const helpHeight = 500; // přibližná výška nápovědy
      setPosition({
        x: window.innerWidth - 420,
        y: Math.max(20, windowHeight - helpHeight - 120) // 120px = FAB + margin
      });
    }
  }, [isOpen, isMobile]);

  const handleMouseDown = (e) => {
    if (isMobile) return;
    setIsDragging(true);
    offsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = Math.max(0, Math.min(window.innerWidth - 400, e.clientX - offsetRef.current.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - offsetRef.current.y));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Touch events pro tablet
  const handleTouchStart = (e) => {
    if (isMobile) return;
    const touch = e.touches[0];
    setIsDragging(true);
    offsetRef.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    };
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];

    const newX = Math.max(0, Math.min(window.innerWidth - 400, touch.clientX - offsetRef.current.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 100, touch.clientY - offsetRef.current.y));

    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  // Mobile: fullscreen modal
  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '500px',
              maxHeight: '80vh',
              background: 'rgba(255, 255, 255, 0.98)',
              borderRadius: 'var(--radius)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1rem 1.25rem',
              background: 'linear-gradient(135deg, var(--color-secondary) 0%, rgba(45, 91, 120, 0.9) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle size={20} />
                <span style={{ fontWeight: 600 }}>{title}</span>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} color="#ffffff" />
              </button>
            </div>

            {/* Content */}
            <div style={{
              padding: '1.25rem',
              overflowY: 'auto',
              flex: 1
            }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Desktop: draggable floating window
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: isMinimized ? '200px' : '400px',
        maxHeight: isMinimized ? 'auto' : '70vh',
        background: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 'var(--radius)',
        boxShadow: isDragging
          ? '0 24px 80px rgba(45, 91, 120, 0.4)'
          : '0 12px 40px rgba(45, 91, 120, 0.25)',
        zIndex: 9999,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: '2px solid rgba(45, 91, 120, 0.2)',
        transition: isDragging ? 'none' : 'width 0.3s, box-shadow 0.3s'
      }}
    >
      {/* Header - draggable */}
      <div
        ref={dragRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          padding: '0.75rem 1rem',
          background: 'linear-gradient(135deg, var(--color-secondary) 0%, rgba(45, 91, 120, 0.9) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#ffffff',
          cursor: 'grab',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GripHorizontal size={16} style={{ opacity: 0.7 }} />
          <HelpCircle size={18} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '4px',
              padding: '0.35rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            {isMinimized ? <Maximize2 size={14} color="#ffffff" /> : <Minimize2 size={14} color="#ffffff" />}
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '4px',
              padding: '0.35rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <X size={14} color="#ffffff" />
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              overflowY: 'auto',
              flex: 1
            }}
          >
            <div style={{ padding: '1rem' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default FloatingHelp;
