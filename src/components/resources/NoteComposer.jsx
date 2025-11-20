import { useState } from 'react';
import { Music, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PianoKeyboard from '../lessons/PianoKeyboard';

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
    const newValue = currentValue ? `${currentValue}_${formattedNote}` : formattedNote;
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
    const newValue = currentValue ? `${currentValue}_${pauses[length]}` : pauses[length];
    onChange(newValue);
  };

  // Přidat nový řádek
  const addNewLine = () => {
    const currentValue = value || '';
    onChange(`${currentValue}_|`);
  };

  // Smazat poslední prvek
  const removeLastElement = () => {
    const currentValue = value || '';
    const elements = currentValue.split('_');
    elements.pop();
    onChange(elements.join('_'));
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
          👆 Klikni na klávesu pro přidání noty:
        </p>
        <PianoKeyboard onNoteClick={handleNoteClick} />
      </div>

      {/* 2. Výběr délky noty - kompaktní s grafickými symboly */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem', display: 'block' }}>
          <Music size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Vyber délku noty:
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
                fontFamily: 'monospace',
                minWidth: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={format}
            >
              {/* Grafický symbol noty */}
              <span style={{ fontSize: '1.2rem' }}>
                {key === 'sixteenth' && '♬'}
                {key === 'eighth' && '♪'}
                {key === 'quarter' && '♩'}
                {key === 'quarterDotted' && '♩.'}
                {key === 'half' && '♫'}
                {key === 'halfDotted' && '♫.'}
                {key === 'whole' && '○'}
              </span>
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
          <span>📚 Nápověda - Formát zápisu not</span>
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
              {/* Kompletní tabulka s všemi možnostmi */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '1rem',
                fontSize: '0.7rem'
              }}>
                <thead>
                  <tr style={{ background: 'rgba(45, 91, 120, 0.1)' }}>
                    <th style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '2px solid rgba(45, 91, 120, 0.2)', width: '15%' }}>Nota</th>
                    <th style={{ padding: '0.4rem', textAlign: 'left', borderBottom: '2px solid rgba(45, 91, 120, 0.2)', width: '40%' }}>Délka</th>
                    <th style={{ padding: '0.4rem', textAlign: 'left', borderBottom: '2px solid rgba(45, 91, 120, 0.2)', width: '15%' }}>Formát</th>
                    <th style={{ padding: '0.4rem', textAlign: 'left', borderBottom: '2px solid rgba(45, 91, 120, 0.2)' }}>Příklady</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center', fontSize: '1.2rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>♬</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Šestnáctinová</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>dd</code></td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>cc, ddis, ee'</code></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center', fontSize: '1.2rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>♪</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Osminová</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>d</code></td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>c, dis, e'</code></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center', fontSize: '1.2rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>♩</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Čtvrťová</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>D</code></td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>C, Dis, E'</code></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center', fontSize: '1.2rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>♩.</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Čtvrťová s tečkou</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>Dd</code></td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>Cc, Ddis, Ee'</code></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center', fontSize: '1.2rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>♫</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Půlová</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>DD</code></td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>CC, DDis, EE'</code></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center', fontSize: '1.2rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>♫.</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Půlová s tečkou</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>DDD</code></td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>CCC, DDDis, EEE'</code></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center', fontSize: '1.2rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>○</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Celá</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>DDDD</code></td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>CCCC, DDDDis</code></td>
                  </tr>
                  <tr style={{ background: 'rgba(181, 31, 101, 0.05)' }}>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>♯</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Křížek</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>+is</code></td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>Cis, DDis, fis'</code></td>
                  </tr>
                  <tr style={{ background: 'rgba(181, 31, 101, 0.05)' }}>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>♭</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Béčko</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>+es</code></td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>Ces, DDes, ees'</code></td>
                  </tr>
                  <tr style={{ background: 'rgba(45, 91, 120, 0.05)' }}>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>↑</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Vyšší oktáva</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>+'</code></td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>C', Dis', ee'</code></td>
                  </tr>
                  <tr style={{ background: 'rgba(45, 91, 120, 0.05)' }}>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>↓</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Nižší oktáva</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>+.</code></td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>C., Dis., ee.</code></td>
                  </tr>
                  <tr style={{ background: 'rgba(100, 116, 139, 0.05)' }}>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>𝄽</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Krátká pauza</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>-</code></td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>200ms</td>
                  </tr>
                  <tr style={{ background: 'rgba(100, 116, 139, 0.05)' }}>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>𝄾</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Střední pauza</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>--</code></td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>400ms</td>
                  </tr>
                  <tr style={{ background: 'rgba(100, 116, 139, 0.05)' }}>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>𝄿</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Dlouhá pauza</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>---</code></td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>800ms</td>
                  </tr>
                  <tr style={{ background: 'rgba(100, 116, 139, 0.05)' }}>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>𝄿𝄿</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Extra dlouhá pauza</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>----</code></td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>1200ms</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>_</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}>Oddělovač not</td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>_</code></td>
                    <td style={{ padding: '0.4rem', borderBottom: '1px solid rgba(45, 91, 120, 0.1)' }}><code>C_D_E</code></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem', textAlign: 'center' }}>|</td>
                    <td style={{ padding: '0.4rem' }}>Nový řádek</td>
                    <td style={{ padding: '0.4rem' }}><code>|</code></td>
                    <td style={{ padding: '0.4rem' }}><code>C_D_|_E_F</code></td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Křížky a béčka:</strong><br />
                • Křížek (#): přidej <code>is</code> za notu → <code>Cis</code>, <code>DDis</code><br />
                • Béčko (♭): přidej <code>es</code> za notu → <code>Ces</code>, <code>DDes</code>
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Oktávy:</strong><br />
                • Nižší oktáva: přidej <code>.</code> na konec → <code>C.</code>, <code>DDis.</code><br />
                • Vyšší oktáva: přidej <code>'</code> na konec → <code>C'</code>, <code>DDis'</code>
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Pauzy:</strong><br />
                • <code>-</code> = krátká pauza (200ms)<br />
                • <code>--</code> = střední pauza (400ms)<br />
                • <code>---</code> = dlouhá pauza (800ms)<br />
                • <code>----</code> = extra dlouhá pauza (1200ms)
              </div>

              <div>
                <strong>Oddělovače:</strong><br />
                • <code>_</code> = odděluje jednotlivé noty<br />
                • <code>|</code> = nový řádek melodie
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default NoteComposer;
