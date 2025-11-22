import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import audioEngine from '../../utils/audio';

function PianoKeyboard({ highlightedNotes = [], autoPlay = false, onNoteClick }) {
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [particles, setParticles] = useState([]);

  // Definice kláves s pozicí černé klávesy (afterWhiteIndex = za kterou bílou klávesou)
  const keys = [
    // Malá oktáva (a - h) - dolní tóny
    { note: 'A.', type: 'white', label: 'a' },
    { note: 'A#.', type: 'black', label: 'ais', afterWhiteIndex: 0 },
    { note: 'H.', type: 'white', label: 'h' },
    // Oktáva 1 (c1 - h1)
    { note: 'C', type: 'white', label: 'c1' },
    { note: 'C#', type: 'black', label: 'cis1', afterWhiteIndex: 2 },
    { note: 'D', type: 'white', label: 'd1' },
    { note: 'D#', type: 'black', label: 'dis1', afterWhiteIndex: 3 },
    { note: 'E', type: 'white', label: 'e1' },
    { note: 'F', type: 'white', label: 'f1' },
    { note: 'F#', type: 'black', label: 'fis1', afterWhiteIndex: 5 },
    { note: 'G', type: 'white', label: 'g1' },
    { note: 'G#', type: 'black', label: 'gis1', afterWhiteIndex: 6 },
    { note: 'A', type: 'white', label: 'a1' },
    { note: 'A#', type: 'black', label: 'ais1', afterWhiteIndex: 7 },
    { note: 'H', type: 'white', label: 'h1' },
    // Oktáva 2 (c2 - e2) - horní tóny
    { note: "C''", type: 'white', label: 'c2' },
    { note: "C#''", type: 'black', label: 'cis2', afterWhiteIndex: 9 },
    { note: "D''", type: 'white', label: 'd2' },
    { note: "D#''", type: 'black', label: 'dis2', afterWhiteIndex: 10 },
    { note: "E''", type: 'white', label: 'e2' },
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

  // Počet bílých kláves
  const whiteKeyCount = 12;
  const gap = 2;

  // Responsivní šířka klávesy - vypočítaná aby se vešly všechny klávesy
  const getKeyWidth = () => {
    // Padding kontejneru + padding stránky
    const containerPadding = windowWidth < 360 ? 8 : windowWidth < 768 ? 16 : 32;
    const pagePadding = windowWidth < 768 ? 32 : 48; // .container padding
    // Dostupná šířka pro klávesy
    const availableWidth = windowWidth - containerPadding * 2 - pagePadding - 30;
    // Šířka pro všechny klávesy včetně mezer
    const totalGaps = (whiteKeyCount - 1) * gap;
    const maxKeyWidth = Math.floor((availableWidth - totalGaps) / whiteKeyCount);

    // Omezíme na rozumné minimum a maximum
    if (windowWidth >= 1024) return Math.min(60, maxKeyWidth);
    if (windowWidth >= 768) return Math.min(50, maxKeyWidth);
    return Math.max(20, Math.min(45, maxKeyWidth));
  };

  const getKeyHeight = () => {
    if (windowWidth < 360) return 100;
    if (windowWidth < 480) return 120;
    if (windowWidth < 668) return 140;
    if (windowWidth < 768) return 160;
    return 200;
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
        minWidth: 'fit-content'
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
                  top: keyWidth < 30 ? '5px' : '10px',
                  width: keyWidth < 30 ? '12px' : keyWidth < 40 ? '16px' : '20px',
                  height: keyWidth < 30 ? '12px' : keyWidth < 40 ? '16px' : '20px',
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
          const blackKeyWidth = keyWidth * 0.65;
          const blackKeyHeight = keyHeight * 0.6;
          const gap = 2;

          // Pozice černé klávesy: střed černé = pravý okraj bílé klávesy na indexu afterWhiteIndex
          // Pravý okraj bílé [i] = (i+1) * keyWidth + i * gap
          const rightEdgeOfWhite = (key.afterWhiteIndex + 1) * keyWidth + key.afterWhiteIndex * gap;
          const blackKeyLeft = rightEdgeOfWhite - (blackKeyWidth / 2);

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
                left: `${blackKeyLeft}px`,
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
                    top: keyWidth < 30 ? '4px' : '10px',
                    width: keyWidth < 30 ? '10px' : keyWidth < 40 ? '12px' : '16px',
                    height: keyWidth < 30 ? '10px' : keyWidth < 40 ? '12px' : '16px',
                    background: '#4a7a9e',
                    borderRadius: '50%',
                    boxShadow: '0 0 15px rgba(74, 122, 158, 0.8)'
                  }}
                />
              )}
              {/* Svislá čára od kolečka dolů mezi bílé klávesy */}
              {isHighlighted(key.note) && (
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.15 }}
                  style={{
                    position: 'absolute',
                    top: `${blackKeyHeight - (keyWidth < 30 ? 2 : keyWidth < 40 ? 4 : 6)}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '3px',
                    height: `${keyWidth < 30 ? '34px' : keyWidth < 40 ? '56px' : '78px'}`,
                    background: '#2d5b78',
                    transformOrigin: 'top',
                    zIndex: 1
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