// Pořadí not v oktávě (C=0, D=1, ... H=6)
export const NOTE_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'H'];

// Kompletní pořadí not na klaviatuře (od malé oktávy po dvoučárkovanou)
const KEYBOARD_ORDER = [
  'A.', 'A#.', 'H.',  // Malá oktáva (pouze a-h)
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'H',  // Oktáva 1
  "C''", "C#''", "D''", "D#''", "E''"  // Oktáva 2 (pouze c-e)
];

/**
 * Seřadí noty podle pořadí na klaviatuře (odleva doprava)
 * @param {string[]} notes - Pole názvů not (např. ['E', 'C', 'G'])
 * @returns {string[]} - Seřazené pole not podle klaviatury
 */
export const sortNotesByKeyboard = (notes) => {
  if (!notes || notes.length === 0) return [];

  return [...notes].sort((a, b) => {
    const indexA = KEYBOARD_ORDER.indexOf(a);
    const indexB = KEYBOARD_ORDER.indexOf(b);

    // Pokud nota není v KEYBOARD_ORDER, dej ji na konec
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });
};

/**
 * Převede noty akordu na správné oktávy (respektuje přechod do vyšší oktávy)
 * @param {string[]} notes - Pole názvů not (např. ['C', 'E', 'G'])
 * @returns {string[]} - Pole not s oktávovou notací pro klaviaturu
 */
export const getChordNotesWithOctaves = (notes) => {
  if (!notes || notes.length === 0) return [];

  const result = [];
  const normalizeNote = (n) => n.toUpperCase().replace('#', '');
  const firstNote = normalizeNote(notes[0]);
  const firstNoteIndex = NOTE_ORDER.indexOf(firstNote);

  notes.forEach((note) => {
    const upperNote = note.toUpperCase();
    const baseNote = normalizeNote(note);
    const isSharp = upperNote.includes('#');
    const noteIndex = NOTE_ORDER.indexOf(baseNote);
    const isHigherOctave = noteIndex < firstNoteIndex;

    if (!isHigherOctave) {
      result.push(isSharp ? `${baseNote}#` : baseNote);
    } else {
      result.push(isSharp ? `${baseNote}#''` : `${baseNote}''`);
    }
  });

  return result;
};

/**
 * Zamíchá pole náhodně (Fisher-Yates shuffle)
 * @param {any[]} array - Pole k zamíchání
 * @returns {any[]} - Nové zamíchané pole
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
