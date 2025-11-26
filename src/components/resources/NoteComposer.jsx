import { useState } from 'react';
import { Music, Plus, Trash2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PianoKeyboard from '../lessons/PianoKeyboard';

/**
 * SVG Ikony pro hudební noty
 */
const NoteIcons = {
  // Šestnáctinová nota (1/16)
  Sixteenth: () => (
    <svg width="20" height="28" viewBox="0 0 20 28" fill="currentColor">
      <ellipse cx="7" cy="23" rx="4" ry="3" transform="rotate(-20 7 23)" />
      <rect x="10" y="5" width="1.5" height="18" />
      <path d="M11.5 5 Q15 3 17 4 L17 6 Q15 5 11.5 7 Z" />
      <path d="M11.5 8 Q15 6 17 7 L17 9 Q15 8 11.5 10 Z" />
    </svg>
  ),

  // Osminová nota (1/8)
  Eighth: () => (
    <svg width="20" height="28" viewBox="0 0 20 28" fill="currentColor">
      <ellipse cx="7" cy="23" rx="4" ry="3" transform="rotate(-20 7 23)" />
      <rect x="10" y="5" width="1.5" height="18" />
      <path d="M11.5 5 Q15 3 17 5 L17 7 Q15 5 11.5 8 Z" />
    </svg>
  ),

  // Čtvrťová nota (1/4)
  Quarter: () => (
    <svg width="20" height="28" viewBox="0 0 20 28" fill="currentColor">
      <ellipse cx="7" cy="23" rx="4" ry="3" transform="rotate(-20 7 23)" />
      <rect x="10" y="5" width="1.5" height="18" />
    </svg>
  ),

  // Čtvrťová nota s tečkou (1/4.)
  QuarterDotted: () => (
    <svg width="24" height="28" viewBox="0 0 24 28" fill="currentColor">
      <ellipse cx="7" cy="23" rx="4" ry="3" transform="rotate(-20 7 23)" />
      <rect x="10" y="5" width="1.5" height="18" />
      <circle cx="17" cy="23" r="1.5" />
    </svg>
  ),

  // Půlová nota (1/2)
  Half: () => (
    <svg width="20" height="28" viewBox="0 0 20 28" fill="currentColor">
      <ellipse cx="7" cy="23" rx="4" ry="3" transform="rotate(-20 7 23)" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="5" width="1.5" height="18" />
    </svg>
  ),

  // Půlová nota s tečkou (1/2.)
  HalfDotted: () => (
    <svg width="24" height="28" viewBox="0 0 24 28" fill="currentColor">
      <ellipse cx="7" cy="23" rx="4" ry="3" transform="rotate(-20 7 23)" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="5" width="1.5" height="18" />
      <circle cx="17" cy="23" r="1.5" />
    </svg>
  ),

  // Celá nota
  Whole: () => (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="currentColor">
      <ellipse cx="10" cy="8" rx="6" ry="4" transform="rotate(-20 10 8)" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),

  // Krátká pauza
  QuarterRest: () => (
    <svg width="16" height="28" viewBox="0 0 16 28" fill="currentColor">
      <path d="M4 8 L12 8 L8 14 L12 14 L6 22 L7 14 L3 14 Z" />
    </svg>
  ),

  // Střední pauza (dvojitá)
  HalfRest: () => (
    <svg width="16" height="28" viewBox="0 0 16 28" fill="currentColor">
      <rect x="3" y="12" width="10" height="3" />
    </svg>
  ),

  // Dlouhá pauza
  LongRest: () => (
    <svg width="16" height="28" viewBox="0 0 16 28" fill="currentColor">
      <rect x="3" y="9" width="10" height="6" />
    </svg>
  ),

  // Extra dlouhá pauza
  ExtraLongRest: () => (
    <svg width="16" height="28" viewBox="0 0 16 28" fill="currentColor">
      <rect x="3" y="8" width="10" height="8" />
    </svg>
  )
};

/**
 * NoteComposer - Komponenta pro snadný zápis not klikáním na klavír
 * Admin vybere délku noty, klikne na klavír a nota se automaticky přidá do textového pole
 */
function NoteComposer({ value, onChange }) {
  const [selectedDuration, setSelectedDuration] = useState('quarter'); // Výchozí čtvrťová
  const [showHelp, setShowHelp] = useState(false);

  // Mapování délek not
  const durations = {
    sixteenth: { label: 'Šestnáctinová', format: 'dd', example: 'cc' },
    eighth: { label: 'Osminová', format: 'd', example: 'c' },
    quarter: { label: 'Čtvrťová', format: 'D', example: 'C' },
    quarterDotted: { label: 'Čtvrťová s tečkou', format: 'Dd', example: 'Cc' },
    half: { label: 'Půlová', format: 'DD', example: 'CC' },
    halfDotted: { label: 'Půlová s tečkou', format: 'DDD', example: 'CCC' },
    whole: { label: 'Celá', format: 'DDDD', example: 'CCCC' }
  };

  // Mapování not z PianoKeyboard formátu do našeho formátu
  const mapNoteToFormat = (note, duration) => {
    // note může být např: "C", "C#", "C'", "D#"
    let baseName = note.replace(/[#'\.]/g, ''); // Získat jen C, D, E, F, G, A, H
    let hasSharp = note.includes('#');
    let hasApostrophe = note.includes("'");

    // Formát podle délky
    let formatted = '';
    switch (duration) {
      case 'sixteenth':
        formatted = baseName.toLowerCase() + baseName.toLowerCase(); // dd
        break;
      case 'eighth':
        formatted = baseName.toLowerCase(); // d
        break;
      case 'quarter':
        formatted = baseName.toUpperCase(); // D
        break;
      case 'quarterDotted':
        formatted = baseName.toUpperCase() + baseName.toLowerCase(); // Dd
        break;
      case 'half':
        formatted = baseName.toUpperCase() + baseName.toUpperCase(); // DD
        break;
      case 'halfDotted':
        formatted = baseName.toUpperCase() + baseName.toUpperCase() + baseName.toUpperCase(); // DDD
        break;
      case 'whole':
        formatted = baseName.toUpperCase() + baseName.toUpperCase() + baseName.toUpperCase() + baseName.toUpperCase(); // DDDD
        break;
      default:
        formatted = baseName.toUpperCase(); // výchozí čtvrťová
    }

    // Přidat křížek
    if (hasSharp) formatted += 'is';

    // Přidat oktávu
    if (hasApostrophe) formatted += "'";

    return formatted;
  };

  // Když admin klikne na notu na klavíru
  const handleNoteClick = (note) => {
    const formattedNote = mapNoteToFormat(note, selectedDuration);
    const currentValue = value || '';
    const newValue = currentValue ? `${currentValue} ${formattedNote}` : formattedNote;
    onChange(newValue);
  };

  // Přidat pauzu
  const addPause = (length) => {
    const pauses = {
      short: '-',
      medium: '--',
      long: '---',
      extraLong: '----'
    };
    const currentValue = value || '';
    const newValue = currentValue ? `${currentValue} ${pauses[length]}` : pauses[length];
    onChange(newValue);
  };

  // Přidat nový řádek
  const addNewLine = () => {
    const currentValue = value || '';
    onChange(`${currentValue} |`);
  };

  // Smazat poslední prvek
  const removeLastElement = () => {
    const currentValue = value || '';
    const elements = currentValue.split(/\s+/);
    elements.pop();
    onChange(elements.join(' '));
  };

  return (
    <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
      {/* 1. Interaktivní klavír */}
      <div style={{
        marginBottom: '1rem',
        padding: '1rem',
        background: 'rgba(45, 91, 120, 0.05)',
        borderRadius: 'var(--radius)',
        border: '2px dashed rgba(45, 91, 120, 0.3)'
      }}>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>
          👆 Klikněte na klávesu pro přidání noty:
        </p>
        <PianoKeyboard onNoteClick={handleNoteClick} />
      </div>

      {/* 2. Výběr délky noty - kompaktní s grafickými symboly */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem', display: 'block' }}>
          <Music size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Vyberte délku noty:
        </label>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {Object.entries(durations).map(([key, { format, example }]) => (
            <motion.button
              key={key}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDuration(key)}
              style={{
                padding: '0.4rem 0.6rem',
                background: selectedDuration === key
                  ? 'linear-gradient(135deg, rgba(181, 31, 101, 0.9) 0%, rgba(221, 51, 121, 0.9) 100%)'
                  : 'rgba(45, 91, 120, 0.1)',
                border: selectedDuration === key
                  ? '2px solid rgba(181, 31, 101, 0.5)'
                  : '1px solid rgba(45, 91, 120, 0.3)',
                borderRadius: 'var(--radius)',
                color: selectedDuration === key ? '#ffffff' : '#1e293b',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                minWidth: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={format}
            >
              {/* SVG ikona noty + text */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                <div style={{ height: '28px', display: 'flex', alignItems: 'center' }}>
                  {key === 'sixteenth' && <NoteIcons.Sixteenth />}
                  {key === 'eighth' && <NoteIcons.Eighth />}
                  {key === 'quarter' && <NoteIcons.Quarter />}
                  {key === 'quarterDotted' && <NoteIcons.QuarterDotted />}
                  {key === 'half' && <NoteIcons.Half />}
                  {key === 'halfDotted' && <NoteIcons.HalfDotted />}
                  {key === 'whole' && <NoteIcons.Whole />}
                </div>
                <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>
                  {key === 'sixteenth' && '1/16'}
                  {key === 'eighth' && '1/8'}
                  {key === 'quarter' && '1/4'}
                  {key === 'quarterDotted' && '3/8'}
                  {key === 'half' && '1/2'}
                  {key === 'halfDotted' && '3/4'}
                  {key === 'whole' && '1'}
                </span>
              </div>
              <code style={{
                fontSize: '0.65rem',
                marginLeft: '0.25rem',
                opacity: 0.9
              }}>
                {example}
              </code>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tlačítka pro pauzy a další akce */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => addPause('short')}
          style={{
            padding: '0.4rem 0.8rem',
            background: 'rgba(100, 116, 139, 0.1)',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            borderRadius: 'var(--radius)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            color: '#475569'
          }}
        >
          Krátká pauza (-)
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => addPause('medium')}
          style={{
            padding: '0.4rem 0.8rem',
            background: 'rgba(100, 116, 139, 0.1)',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            borderRadius: 'var(--radius)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            color: '#475569'
          }}
        >
          Střední pauza (--)
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => addPause('long')}
          style={{
            padding: '0.4rem 0.8rem',
            background: 'rgba(100, 116, 139, 0.1)',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            borderRadius: 'var(--radius)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            color: '#475569'
          }}
        >
          Dlouhá pauza (---)
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addNewLine}
          style={{
            padding: '0.4rem 0.8rem',
            background: 'rgba(45, 91, 120, 0.1)',
            border: '1px solid rgba(45, 91, 120, 0.3)',
            borderRadius: 'var(--radius)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            color: 'var(--color-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <Plus size={12} />
          Nový řádek (|)
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={removeLastElement}
          style={{
            padding: '0.4rem 0.8rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <Trash2 size={12} />
          Smazat poslední
        </motion.button>
      </div>

      {/* Accordion s nápovědou a tabulkou */}
      <div style={{
        marginTop: '1rem',
        border: '1px solid rgba(45, 91, 120, 0.2)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden'
      }}>
        <motion.button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            background: 'rgba(45, 91, 120, 0.05)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1e293b'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={18} color="var(--color-primary)" />
            Nápověda - Formát zápisu not
          </span>
          {showHelp ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </motion.button>

        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.75rem',
                color: '#475569'
              }}
            >
              {/* Tabulka not */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '1rem',
                fontSize: '0.7rem'
              }}>
                <thead>
                  <tr style={{ background: 'rgba(45, 91, 120, 0.1)' }}>
                    <th style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '2px solid rgba(45, 91, 120, 0.2)', width: '12%' }}>Nota</th>
                    <th style={{ padding: '0.4rem', textAlign: 'left', borderBottom: '2px solid rgba(45, 91, 120, 0.2)', width: '20%' }}>Délka</th>
                    <th style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '2px solid rgba(45, 91, 120, 0.2)', width: '10%' }}>Formát</th>
                    <th style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '2px solid rgba(45, 91, 120, 0.2)', width: '15%' }}>♯</th>
                    <th style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '2px solid rgba(45, 91, 120, 0.2)', width: '15%' }}>♭</th>
                    <th style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '2px solid rgba(45, 91, 120, 0.2)' }}>Vyšší/Nižší</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.2rem' }}>
                        <NoteIcons.Sixteenth />
                      </div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>1/16</div>
                    </td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Šestnáctinová</td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>dd</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>ccis</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>ddes</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>ee' / ff.</code></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.2rem' }}>
                        <NoteIcons.Eighth />
                      </div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>1/8</div>
                    </td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Osminová</td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>d</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>cis</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>des</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>e' / f.</code></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.2rem' }}>
                        <NoteIcons.Quarter />
                      </div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>1/4</div>
                    </td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Čtvrťová</td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>D</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>Cis</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>Des</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>E' / F.</code></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.2rem' }}>
                        <NoteIcons.QuarterDotted />
                      </div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>3/8</div>
                    </td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Čtvrťová s tečkou</td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>Dd</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>Ccis</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>Ddes</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>Ee' / Ff.</code></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.2rem' }}>
                        <NoteIcons.Half />
                      </div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>1/2</div>
                    </td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Půlová</td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>DD</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>CCis</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>DDes</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>EE' / FF.</code></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.2rem' }}>
                        <NoteIcons.HalfDotted />
                      </div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>3/4</div>
                    </td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Půlová s tečkou</td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>DDD</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>CCCis</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>DDDes</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>EEE' / FFF.</code></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.2rem' }}>
                        <NoteIcons.Whole />
                      </div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>1</div>
                    </td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Celá</td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>DDDD</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>CCCCis</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>DDDDes</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>EEEE' / FFFF.</code></td>
                  </tr>
                </tbody>
              </table>

              {/* Tabulka pauz */}
              <div style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>Pauzy:</div>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '1rem',
                fontSize: '0.7rem'
              }}>
                <thead>
                  <tr style={{ background: 'rgba(100, 116, 139, 0.1)' }}>
                    <th style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '2px solid rgba(100, 116, 139, 0.2)', width: '20%' }}>Symbol</th>
                    <th style={{ padding: '0.4rem', textAlign: 'left', borderBottom: '2px solid rgba(100, 116, 139, 0.2)', width: '40%' }}>Název</th>
                    <th style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '2px solid rgba(100, 116, 139, 0.2)', width: '20%' }}>Formát</th>
                    <th style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '2px solid rgba(100, 116, 139, 0.2)' }}>Délka</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(100, 116, 139, 0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <NoteIcons.QuarterRest />
                      </div>
                    </td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(100, 116, 139, 0.1)' }}>Krátká pauza</td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(100, 116, 139, 0.1)' }}><code>-</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(100, 116, 139, 0.1)' }}>200ms</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(100, 116, 139, 0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <NoteIcons.HalfRest />
                      </div>
                    </td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(100, 116, 139, 0.1)' }}>Střední pauza</td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(100, 116, 139, 0.1)' }}><code>--</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(100, 116, 139, 0.1)' }}>400ms</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(100, 116, 139, 0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <NoteIcons.LongRest />
                      </div>
                    </td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(100, 116, 139, 0.1)' }}>Dlouhá pauza</td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(100, 116, 139, 0.1)' }}><code>---</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(100, 116, 139, 0.1)' }}>800ms</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <NoteIcons.ExtraLongRest />
                      </div>
                    </td>
                    <td style={{ padding: '0.4rem' }}>Extra dlouhá pauza</td>
                    <td style={{ padding: '0.4rem', textAlign: 'center' }}><code>----</code></td>
                    <td style={{ padding: '0.4rem', textAlign: 'center' }}>1200ms</td>
                  </tr>
                </tbody>
              </table>

              {/* Tabulka oddělovačů */}
              <div style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>Oddělovače:</div>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '1rem',
                fontSize: '0.7rem'
              }}>
                <thead>
                  <tr style={{ background: 'rgba(45, 91, 120, 0.1)' }}>
                    <th style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '2px solid rgba(45, 91, 120, 0.2)', width: '20%' }}>Symbol</th>
                    <th style={{ padding: '0.4rem', textAlign: 'left', borderBottom: '2px solid rgba(45, 91, 120, 0.2)', width: '40%' }}>Popis</th>
                    <th style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '2px solid rgba(45, 91, 120, 0.2)', width: '20%' }}>Formát</th>
                    <th style={{ padding: '0.4rem', textAlign: 'left', borderBottom: '2px solid rgba(45, 91, 120, 0.2)' }}>Příklad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>mezera</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Oddělovač not</td>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code> </code></td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>C D E</code></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center' }}>| / ↵</td>
                    <td style={{ padding: '0.4rem' }}>Nový řádek</td>
                    <td style={{ padding: '0.4rem', textAlign: 'center' }}><code>| nebo ↵</code></td>
                    <td style={{ padding: '0.4rem' }}><code>C D | E F</code></td>
                  </tr>
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default NoteComposer;
