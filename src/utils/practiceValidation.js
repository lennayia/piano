/**
 * Univerzální validační funkce pro cvičení (písničky i akordy)
 */

/**
 * Normalizovat notu pro porovnání
 * Používá se v písničkách pro odstranění notové délky a získání základního tónu
 */
export function normalizeNote(note) {
  if (!note) return null;

  let normalized = note.trim();

  // Ignorovat pauzy
  if (/^-+$/.test(normalized)) return null;

  // Ignorovat text (slova delší než 2 znaky bez notového formátu)
  if (/[a-zčďěňřšťůžá]{3,}/.test(normalized.toLowerCase()) && !/^[a-h]+\.?'?$/.test(normalized.toLowerCase())) {
    return null;
  }

  // Extrahovat základní notu (první písmeno) před is/es/tečkou/apostrofem
  let baseNote = normalized[0];

  // Zachovat apostrof pro vyšší oktávu (pokud je na konci)
  let octaveModifier = '';
  if (normalized.endsWith("'")) {
    octaveModifier = "'";
  }

  // Zkontrolovat is/es suffix (po opakování písmen)
  let accidental = '';
  if (/is$/i.test(normalized)) {
    accidental = '#';
  } else if (/es$/i.test(normalized)) {
    accidental = '#';
  }

  // Převést na velké písmeno
  baseNote = baseNote.toUpperCase();

  // Složit dohromady: nota + accidental + oktáva
  normalized = baseNote + accidental + octaveModifier;

  return normalized;
}

/**
 * Validovat, zda zahraná nota odpovídá očekávané notě
 * @param {string} playedNote - zahraná nota
 * @param {string} expectedNote - očekávaná nota
 * @param {boolean} useNormalization - použít normalizaci (pro písničky)
 * @returns {boolean}
 */
export function validateNote(playedNote, expectedNote, useNormalization = false) {
  if (useNormalization) {
    const normalizedPlayed = normalizeNote(playedNote);
    const normalizedExpected = normalizeNote(expectedNote);
    return normalizedPlayed === normalizedExpected;
  }

  return playedNote === expectedNote;
}

/**
 * Validovat sekvenci not (pro akordy)
 * @param {Array} playedNotes - pole zahraných not
 * @param {Array} expectedNotes - pole očekávaných not
 * @returns {boolean}
 */
export function validateSequence(playedNotes, expectedNotes) {
  if (playedNotes.length !== expectedNotes.length) {
    return false;
  }

  return playedNotes.every((note, index) => note === expectedNotes[index]);
}

/**
 * Zkontrolovat, zda je cvičení dokončeno perfektně
 * @param {number} errorsCount - počet chyb
 * @param {number} totalNotes - celkový počet not
 * @param {number} playedNotes - počet zahraných not
 * @returns {boolean}
 */
export function isPerfectCompletion(errorsCount, totalNotes, playedNotes) {
  return errorsCount === 0 && playedNotes >= totalNotes;
}

/**
 * Filtrovat validní noty z pole (odstranit pauzy a text)
 * @param {Array} notes - pole not
 * @returns {Array} - pole validních not
 */
export function filterValidNotes(notes) {
  return notes.map(n => normalizeNote(n)).filter(n => n !== null);
}
