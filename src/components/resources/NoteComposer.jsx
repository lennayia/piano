import { useState } from 'react';
import { Music, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import PianoKeyboard from '../lessons/PianoKeyboard';

/**
 * SVG Ikony pro hudební noty
 */
export const NoteIcons = {
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

    </div>
  );
}

export default NoteComposer;
