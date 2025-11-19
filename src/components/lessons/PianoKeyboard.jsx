import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import audioEngine from '../../utils/audio';

function PianoKeyboard({ highlightedNotes = [], autoPlay = false }) {
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
    { note: 'C', type: 'white', label: 'C', octave: 2 }, // Další C o oktávu výš
  ];

  const handleKeyPress = (note) => {
    console.log(`🎹 Clicked key: ${note}`);
    audioEngine.playNote(note, 0.5);
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
  };

  const isHighlighted = (note) => {
    return highlightedNotes.includes(note);
  };

  const whiteKeys = keys.filter(k => k.type === 'white');
  const blackKeys = keys.filter(k => k.type === 'black');

  return (
    <div style={{
      position: 'relative',
      padding: '2rem',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--glass-shadow)',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'relative',
        height: '200px',
        display: 'flex',
        justifyContent: 'flex-start',
        gap: '2px',
        width: 'fit-content',
        margin: '0 auto'
      }}>
        {/* White Keys */}
        {whiteKeys.map((key, index) => (
          <motion.div
            key={`${key.note}-${index}`}
            className={`piano-key white ${activeKeys.has(key.note) ? 'active' : ''}`}
            onClick={() => handleKeyPress(key.note)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '60px',
              height: '200px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: '1rem',
              fontSize: '0.875rem',
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
          // Správné pozice černých kláves - vycentrované mezi středy bílých kláves
          // Bílé klávesy (60px široké): C(0-60), D(62-122), E(124-184), F(186-246), G(248-308), A(310-370), H(372-432)
          // Středy bílých: C(30), D(92), E(154), F(216), G(278), A(340), H(402)
          // Černá klávesa 40px široká, takže střed mezi bílými minus 20px
          const blackKeyPositions = {
            'C#': 41,   // mezi C a D: (30 + 92) / 2 - 20 = 61 - 20
            'D#': 103,  // mezi D a E: (92 + 154) / 2 - 20 = 123 - 20
            'F#': 227,  // mezi F a G: (216 + 278) / 2 - 20 = 247 - 20
            'G#': 289,  // mezi G a A: (278 + 340) / 2 - 20 = 309 - 20
            'A#': 351   // mezi A a H: (340 + 402) / 2 - 20 = 371 - 20
          };

          return (
            <motion.div
              key={key.note}
              className={`piano-key black ${activeKeys.has(key.note) ? 'active' : ''}`}
              onClick={() => handleKeyPress(key.note)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: '40px',
                height: '120px',
                position: 'absolute',
                left: `${blackKeyPositions[key.note]}px`,
                top: 0,
                zIndex: 2,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '0.5rem',
                fontSize: '0.75rem',
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