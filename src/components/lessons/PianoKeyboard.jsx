import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import audioEngine from '../../utils/audio';

function PianoKeyboard({ highlightedNotes = [], autoPlay = false, onNoteClick }) {
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [particles, setParticles] = useState([]);

  const keys = [
    { note: 'C', type: 'white', label: 'C' },
    { note: 'C#', type: 'black', label: 'C#' },
    { note: 'D', type: 'white', label: 'D' },
    { note: 'D#', type: 'black', label: 'D#' },
    { note: 'E', type: 'white', label: 'E' },
    { note: 'F', type: 'white', label: 'F' },
    { note: 'F#', type: 'black', label: 'F#' },
    { note: 'G', type: 'white', label: 'G' },
    { note: 'G#', type: 'black', label: 'G#' },
    { note: 'A', type: 'white', label: 'A' },
    { note: 'A#', type: 'black', label: 'A#' },
    { note: 'H', type: 'white', label: 'H' },
    { note: "C'", type: 'white', label: "c'", octave: 1 }, // c' = C5, jednočárkované
  ];

  const handleKeyPress = (e, note) => {
    e.stopPropagation();
    e.preventDefault();

    // Vždy přehrát zvuk
    audioEngine.playNote(note, 1.0);
    setActiveKeys(prev => new Set(prev).add(note));

    // Create smoke particle
    const id = Date.now() + Math.random();
    setParticles(prev => [...prev, { id, note }]);

    setTimeout(() => {
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(note);
        return newSet;
      });
    }, 200);

    // Remove particle after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 2000);

    // Pokud je callback onNoteClick, zavolat ho (pro zápis do textového pole)
    if (onNoteClick) {
      onNoteClick(note);
    }
  };

  const isHighlighted = (note) => {
    return highlightedNotes.includes(note);
  };

  const whiteKeys = keys.filter(k => k.type === 'white');
  const blackKeys = keys.filter(k => k.type === 'black');

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsivní šířka klávesy
  const getKeyWidth = () => {
    if (windowWidth < 360) return 28;  // Extra malé mobily (320px)
    if (windowWidth < 480) return 35;  // Malé mobily
    if (windowWidth < 768) return 45;  // Mobily
    if (windowWidth < 1024) return 50; // Tablety
    return 60;                         // Desktop
  };

  const getKeyHeight = () => {
    if (windowWidth < 360) return 120; // Extra malé mobily (320px)
    if (windowWidth < 480) return 140; // Malé mobily
    if (windowWidth < 768) return 160; // Mobily
    return 200;                        // Desktop & tablety
  };

  const keyWidth = getKeyWidth();
  const keyHeight = getKeyHeight();

  return (
    <div style={{
      position: 'relative',
      padding: windowWidth < 360 ? '0.75rem 0.25rem' : windowWidth < 768 ? '1rem 0.5rem' : '1.5rem 1rem',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--glass-shadow)',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'relative',
        height: `${keyHeight}px`,
        display: 'flex',
        justifyContent: 'flex-start',
        gap: '2px',
        width: 'fit-content',
        margin: '0 auto',
        maxWidth: '100%'
      }}>
        {/* White Keys */}
        {whiteKeys.map((key, index) => (
          <motion.div
            key={`${key.note}-${index}`}
            className={`piano-key white ${activeKeys.has(key.note) ? 'active' : ''}`}
            onClick={(e) => handleKeyPress(e, key.note)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: `${keyWidth}px`,
              height: `${keyHeight}px`,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: windowWidth < 360 ? '0.25rem' : windowWidth < 768 ? '0.5rem' : '1rem',
              fontSize: windowWidth < 360 ? '0.5rem' : windowWidth < 480 ? '0.625rem' : windowWidth < 768 ? '0.75rem' : '0.875rem',
              fontWeight: 500,
              position: 'relative',
              border: isHighlighted(key.note) ? '3px solid #2d5b78' : '2px solid #ddd',
              boxShadow: isHighlighted(key.note)
                ? '0 0 20px rgba(45, 91, 120, 0.5)'
                : '0 4px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            {key.label}
            {isHighlighted(key.note) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute',
                  top: '10px',
                  width: '20px',
                  height: '20px',
                  background: '#2d5b78',
                  borderRadius: '50%',
                  boxShadow: '0 0 15px rgba(45, 91, 120, 0.8)'
                }}
              />
            )}
          </motion.div>
        ))}

        {/* Black Keys */}
        {blackKeys.map((key, index) => {
          // Responsivní šířka a výška černé klávesy
          const blackKeyWidth = Math.floor(keyWidth * 0.67); // ~67% šířky bílé klávesy
          const blackKeyHeight = Math.floor(keyHeight * 0.6); // 60% výšky bílé klávesy
          const halfBlackWidth = Math.floor(blackKeyWidth / 2);

          // Dynamické pozice černých kláves
          const gap = 2;
          const getBlackKeyPosition = (noteIndex) => {
            // Pozice mezi středy bílých kláves minus polovina šířky černé klávesy
            const whiteKeyCenter = (pos) => (keyWidth / 2) + pos * (keyWidth + gap);

            switch(noteIndex) {
              case 0: return whiteKeyCenter(0.5) - halfBlackWidth; // C# mezi C a D
              case 1: return whiteKeyCenter(1.5) - halfBlackWidth; // D# mezi D a E
              case 2: return whiteKeyCenter(3.5) - halfBlackWidth; // F# mezi F a G
              case 3: return whiteKeyCenter(4.5) - halfBlackWidth; // G# mezi G a A
              case 4: return whiteKeyCenter(5.5) - halfBlackWidth; // A# mezi A a H
              default: return 0;
            }
          };

          return (
            <motion.div
              key={key.note}
              className={`piano-key black ${activeKeys.has(key.note) ? 'active' : ''}`}
              onClick={(e) => handleKeyPress(e, key.note)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: `${blackKeyWidth}px`,
                height: `${blackKeyHeight}px`,
                position: 'absolute',
                left: `${getBlackKeyPosition(index)}px`,
                top: 0,
                zIndex: 2,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: windowWidth < 360 ? '0.125rem' : windowWidth < 768 ? '0.25rem' : '0.5rem',
                fontSize: windowWidth < 360 ? '0.375rem' : windowWidth < 480 ? '0.5rem' : windowWidth < 768 ? '0.625rem' : '0.75rem',
                fontWeight: 500,
                color: 'white',
                border: isHighlighted(key.note) ? '3px solid #4a7a9e' : '2px solid #000',
                boxShadow: isHighlighted(key.note)
                  ? '0 0 20px rgba(74, 122, 158, 0.7)'
                  : '0 4px 8px rgba(0, 0, 0, 0.3)'
              }}
            >
              {key.label}
              {isHighlighted(key.note) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    width: '16px',
                    height: '16px',
                    background: '#4a7a9e',
                    borderRadius: '50%',
                    boxShadow: '0 0 15px rgba(74, 122, 158, 0.8)'
                  }}
                />
              )}
            </motion.div>
          );
        })}

        {/* Smoke Particles */}
        {particles.map(particle => {
          const keyIndex = keys.findIndex(k => k.note === particle.note);
          const key = keys[keyIndex];
          let left = 30;

          if (key.type === 'white') {
            const whiteIndex = whiteKeys.findIndex(k => k.note === particle.note);
            left = whiteIndex * 62 + 30;
          } else {
            const blackKeyPositions = {
              'C#': 41,
              'D#': 103,
              'F#': 227,
              'G#': 289,
              'A#': 351
            };
            left = blackKeyPositions[particle.note] + 20;
          }

          return (
            <div
              key={particle.id}
              className="smoke-particle"
              style={{
                left: `${left}px`,
                bottom: '50%',
              }}
            />
          );
        })}
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '1.5rem',
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
        fontSize: '0.875rem'
      }}>
        Klikněte na klávesy pro přehrání tónů
      </div>
    </div>
  );
}

export default PianoKeyboard;