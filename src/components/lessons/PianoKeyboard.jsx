import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, MousePointerClick } from 'lucide-react';
import audioEngine from '../../utils/audio';

function PianoKeyboard({ highlightedNotes = [], autoPlay = false, onNoteClick }) {
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [particles, setParticles] = useState([]);
  const [volume, setVolume] = useState(0.8); // Defaultní hlasitost 80%

  // Nastavit hlasitost při mount a při změně
  useEffect(() => {
    audioEngine.init();
    audioEngine.setVolume(volume);
  }, [volume]);

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
    // Modal padding (backdrop + content body) - pro malé obrazovky bez bezpečnostní rezervy
    const modalPadding = windowWidth < 480 ? 48 : windowWidth < 540 ? 56 : windowWidth < 700 ? 60 : 132; // 48px = skutečný modal padding
    // Padding karty klaviatury (horizontální)
    const cardHorizontalPadding = windowWidth < 700 ? 0.25 * 16 : 1 * 16; // převod rem na px
    // Dostupná šířka = celá šířka okna minus modal padding minus padding karty na obou stranách
    const availableWidth = windowWidth - modalPadding - (cardHorizontalPadding * 2);
    // Šířka pro všechny klávesy včetně mezer
    const totalGaps = (whiteKeyCount - 1) * gap;
    const maxKeyWidth = Math.floor((availableWidth - totalGaps) / whiteKeyCount);

    // Omezíme na rozumné minimum a maximum
    if (windowWidth >= 1024) return Math.min(60, maxKeyWidth);
    if (windowWidth >= 768) return Math.min(50, maxKeyWidth);
    return Math.max(20, Math.min(45, maxKeyWidth));
  };

  const keyWidth = getKeyWidth();
  // Výška proporcionální k šířce (poměr 1:5.5 jako u reálných kláves)
  const keyHeight = Math.max(100, Math.min(200, Math.floor(keyWidth * 5.5)));

  // Responzivní padding - minimální horizontální padding pro <700px (maximum místa pro klaviaturu)
  const keyboardPadding = windowWidth < 360 ? '0.75rem 0.25rem' : windowWidth < 700 ? '0.75rem 0.25rem' : '1.5rem 1rem';

  return (
    <div style={{
      position: 'relative',
      padding: keyboardPadding,
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-lg)',
      overflow: 'hidden'
    }}>
      {/* Instrukce a Volume Control v jednom řádku */}
      <div style={{
        display: 'flex',
        flexDirection: windowWidth < 540 ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: windowWidth < 540 ? '0.5rem' : windowWidth < 700 ? '1rem' : '1.5rem',
        marginBottom: windowWidth < 700 ? '0.75rem' : '1rem',
        padding: windowWidth < 700 ? '0.5rem 0' : '0.5rem 1rem',  // Bez horizontálního paddingu na malých obrazovkách
        background: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 'var(--radius-md)',
        width: 'fit-content',
        margin: windowWidth < 700 ? '0 auto 0.75rem auto' : '0 auto 1rem auto',
        flexWrap: 'wrap'
      }}>
        {/* Instrukce */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--color-secondary)',
          
          fontWeight: 500
        }}>
          <MousePointerClick size={18} />
          <span>Klikejte na klávesy a hrajte</span>
        </div>

        {/* Volume Control */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Volume2 size={20} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={(e) => setVolume(e.target.value / 100)}
            className="volume-slider"
            style={{
              width: windowWidth < 480 ? '100px' : '150px',
              height: '6px',
              borderRadius: '3px',
              background: `linear-gradient(to right, var(--color-secondary) 0%, var(--color-secondary) ${volume * 100}%, #ddd ${volume * 100}%, #ddd 100%)`,
              outline: 'none',
              cursor: 'pointer'
            }}
          />
          <span style={{
            
            fontWeight: 600,
            color: 'var(--color-secondary)',
            minWidth: '3ch',
            textAlign: 'right'
          }}>
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

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
              paddingBottom: keyWidth < 30 ? '32px' : keyWidth < 40 ? '41px' : '45px',
              fontSize: windowWidth < 360 ? '0.5rem' : windowWidth < 480 ? '0.625rem' : windowWidth < 768 ? '0.75rem' : '0.875rem',
              fontWeight: 500,
              position: 'relative',
              border: isHighlighted(key.note) ? '2px solid var(--color-secondary)' : '2px solid #ddd',
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
                  bottom: keyWidth < 30 ? '10px' : '15px',
                  width: keyWidth < 30 ? '12px' : keyWidth < 40 ? '16px' : '20px',
                  height: keyWidth < 30 ? '12px' : keyWidth < 40 ? '16px' : '20px',
                  background: 'var(--color-secondary)',
                  borderRadius: '50%',
                  boxShadow: '0 0 15px rgba(45, 91, 120, 0.8), inset 0 1px 3px rgba(255, 255, 255, 0.5)'
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
                paddingBottom: keyWidth < 30 ? '29px' : keyWidth < 40 ? '37px' : '41px',
                fontSize: windowWidth < 360 ? '0.375rem' : windowWidth < 480 ? '0.5rem' : windowWidth < 768 ? '0.625rem' : '0.75rem',
                fontWeight: 500,
                color: 'white',
                border: isHighlighted(key.note) ? '3px solid var(--color-secondary)' : '2px solid #000',
                boxShadow: isHighlighted(key.note)
                  ? '0 0 20px rgba(45, 91, 120, 0.7)'
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
                    bottom: keyWidth < 30 ? '9px' : '15px',
                    width: keyWidth < 30 ? '10px' : keyWidth < 40 ? '12px' : '16px',
                    height: keyWidth < 30 ? '10px' : keyWidth < 40 ? '12px' : '16px',
                    background: 'var(--color-secondary)',
                    borderRadius: '50%',
                    boxShadow: '0 0 15px rgba(45, 91, 120, 0.8), inset 0 -2px 6px rgba(107, 168, 200, 0.5)'
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
                    width: '1px',
                    height: `${keyWidth < 30 ? '34px' : keyWidth < 40 ? '56px' : '78px'}`,
                    background: 'var(--color-secondary)',
                    transformOrigin: 'top',
                    zIndex: 10
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
    </div>
  );
}

export default PianoKeyboard;