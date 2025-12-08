# Modulární systém pro cvičení (Practice Modules)

Tento dokument popisuje **maximálně modulární architekturu** pro cvičení písniček a akordů.

## 📦 Přehled modulů

### 1. **Hook: `usePracticeMode`**
**Soubor:** `/src/hooks/usePracticeMode.js`

**Účel:** Správa stavu a logiky pro režimy cvičení

**Exportované hodnoty:**
```javascript
const {
  // States
  practicingMode,      // ID položky v režimu procvičování
  challengeMode,       // ID položky v režimu výzvy
  practiceProgress,    // [{note, correct}] - historie zahraných not
  practiceErrors,      // počet chyb
  showCelebration,     // zobrazit konfety
  showSuccessModal,    // zobrazit success modal
  completedItemTitle,  // název dokončené položky

  // Actions
  startPractice,       // (itemId) => void - spustit procvičování
  startChallenge,      // (itemId) => void - spustit výzvu
  stopPractice,        // () => void - ukončit cvičení
  recordNote,          // (note, isCorrect) => void - zaznamenat notu
  checkCompletion,     // (totalNotes, onComplete) => bool - zkontrolovat dokončení
  celebrate,           // (itemTitle) => void - spustit oslavu
  closeSuccessModal,   // () => void - zavřít modal

  // Computed
  isPracticing,        // boolean
  isChallenge,         // boolean
  isActive             // boolean
} = usePracticeMode();
```

**Použití:**
```javascript
import usePracticeMode from '../hooks/usePracticeMode';

function MyComponent() {
  const practice = usePracticeMode();

  // Start režimu
  practice.startChallenge(songId);

  // Zaznamenat notu
  practice.recordNote('C', true);

  // Zkontrolovat dokončení
  practice.checkCompletion(totalNotes, ({ isPerfect, isChallenge }) => {
    if (isPerfect && isChallenge) {
      practice.celebrate(songTitle);
    }
  });
}
```

---

### 2. **Komponenta: `PracticeModeControls`**
**Soubor:** `/src/components/ui/PracticeModeControls.jsx`

**Účel:** UI pro tlačítka režimů a progress kartu

**Props:**
```javascript
<PracticeModeControls
  isPracticing={boolean}      // režim procvičování aktivní
  isChallenge={boolean}       // režim výzvy aktivní
  practiceErrors={number}     // počet chyb
  progress={number}           // zahraných not
  totalNotes={number}         // celkem not
  onStartPractice={function}  // callback start procvičování
  onStartChallenge={function} // callback start výzvy
  onStop={function}           // callback ukončení
  showStopButton={boolean}    // zobrazit tlačítko Ukončit
  style={object}              // custom styling
/>
```

**Co zobrazuje:**
- Tlačítka "Procvičovat" a "Výzva" (nebo "Ukončit")
- Progress kartu s ikonou, popisem, chybami a postupem
- Automatické styly podle režimu (modrá/zlatá)

---

### 3. **Komponenta: `PracticeCelebration`**
**Soubor:** `/src/components/practice/PracticeCelebration.jsx`

**Účel:** Konfety a success modal pro perfektní zahrání

**Props:**
```javascript
<PracticeCelebration
  showCelebration={boolean}    // zobrazit konfety
  showSuccessModal={boolean}   // zobrazit success modal
  completedItemTitle={string}  // název dokončené položky
  xpAwarded={number}           // množství XP (default 100)
  onClose={function}           // callback pro zavření
/>
```

**Co zobrazuje:**
- Konfety animaci
- Success modal s Trophy ikonou
- Název dokončené položky
- Množství získaného XP
- Tlačítko "Pokračovat"

---

### 4. **Utility: `practiceValidation`**
**Soubor:** `/src/utils/practiceValidation.js`

**Účel:** Validační funkce pro kontrolu správnosti

**Exportované funkce:**
```javascript
import {
  normalizeNote,          // (note) => string - normalizovat notu
  validateNote,           // (played, expected, normalize) => bool
  validateSequence,       // (playedNotes, expectedNotes) => bool
  isPerfectCompletion,    // (errors, total, played) => bool
  filterValidNotes        // (notes) => array - filtrovat validní noty
} from '../utils/practiceValidation';
```

**Příklady použití:**
```javascript
// Normalizace noty (odstraní délku, zachová tón)
const normalized = normalizeNote('DDDis'); // => 'D#'

// Validace noty
const isCorrect = validateNote('C', 'C', false); // => true

// Validace sekvence (akordy)
const isCorrectSequence = validateSequence(['C', 'E', 'G'], ['C', 'E', 'G']); // => true

// Perfektní dokončení
const isPerfect = isPerfectCompletion(0, 10, 10); // => true
```

---

### 5. **Utility: `practiceStats`**
**Soubor:** `/src/utils/practiceStats.js`

**Účel:** Ukládání statistik do databáze

**Exportované funkce:**
```javascript
import {
  saveSongCompletion,     // (params) => Promise<bool>
  saveChordCompletion,    // (params) => Promise<bool>
  savePracticeCompletion  // (params) => Promise<bool> - univerzální
} from '../utils/practiceStats';
```

**Příklady použití:**
```javascript
// Uložit dokončení písničky
await saveSongCompletion({
  currentUser,
  songId: '123',
  songTitle: 'Skákal pes',
  mistakes: 0,
  isPerfect: true
});

// Uložit dokončení akordu
await saveChordCompletion({
  currentUser,
  chordId: '456',
  chordName: 'C dur',
  mistakes: 2,
  isPerfect: false
});

// Univerzální funkce (automaticky rozpozná typ)
await savePracticeCompletion({
  type: 'song', // nebo 'chord'
  currentUser,
  songId: '123',
  songTitle: 'Skákal pes',
  mistakes: 0,
  isPerfect: true
});
```

**Co ukládá:**
- Historie dokončení do tabulky
- Aktualizace user statistik (XP, počty dokončení)
- Automatický refresh lokálního store

---

## 🎯 Jak to použít v SongLibrary.jsx nebo Cviceni.jsx

### Kompletní příklad integrace:

```javascript
import usePracticeMode from '../hooks/usePracticeMode';
import PracticeModeControls from '../components/ui/PracticeModeControls';
import PracticeCelebration from '../components/practice/PracticeCelebration';
import { validateNote, filterValidNotes } from '../utils/practiceValidation';
import { savePracticeCompletion } from '../utils/practiceStats';
import useUserStore from '../store/useUserStore';

function MySongOrChordComponent() {
  const currentUser = useUserStore((state) => state.currentUser);
  const practice = usePracticeMode();

  // Handler pro zahrání noty
  const handleNoteClick = (playedNote) => {
    const expectedNote = validNotes[practice.practiceProgress.length];
    const isCorrect = validateNote(playedNote, expectedNote, true);

    // Zaznamenat notu
    practice.recordNote(playedNote, isCorrect);

    // Zkontrolovat dokončení
    practice.checkCompletion(validNotes.length, async ({ isPerfect, isChallenge }) => {
      if (isPerfect && isChallenge) {
        // Uložit statistiky
        await savePracticeCompletion({
          type: 'song',
          currentUser,
          songId: song.id,
          songTitle: song.title,
          mistakes: 0,
          isPerfect: true
        });

        // Spustit oslavu
        practice.celebrate(song.title);
      } else if (!isPerfect) {
        alert(`Dokončeno s ${practice.practiceErrors} chybami`);
        practice.stopPractice();
      }
    });
  };

  return (
    <>
      {/* Tlačítka a progress */}
      <PracticeModeControls
        isPracticing={practice.isPracticing}
        isChallenge={practice.isChallenge}
        practiceErrors={practice.practiceErrors}
        progress={practice.practiceProgress.length}
        totalNotes={validNotes.length}
        onStartPractice={() => practice.startPractice(song.id)}
        onStartChallenge={() => practice.startChallenge(song.id)}
        onStop={practice.stopPractice}
        showStopButton={true}
      />

      {/* Oslavy */}
      <PracticeCelebration
        showCelebration={practice.showCelebration}
        showSuccessModal={practice.showSuccessModal}
        completedItemTitle={practice.completedItemTitle}
        xpAwarded={100}
        onClose={practice.closeSuccessModal}
      />

      {/* Klaviatura nebo jiný UI */}
      <PianoKeyboard
        highlightedNotes={practice.isChallenge ? [] : chordNotes}
        onNoteClick={handleNoteClick}
      />
    </>
  );
}
```

---

## ✅ Výhody této architektury

1. **Maximální znovupoužitelnost** - všechny moduly fungují pro písničky i akordy
2. **Oddělení logiky a UI** - hook obsahuje logiku, komponenty jen UI
3. **Snadná údržba** - změna v jednom modulu se projeví všude
4. **Testovatelnost** - každý modul lze testovat samostatně
5. **Flexibilita** - snadné přidání nových funkcí
6. **Čistý kód** - komponenty jsou kratší a čitelnější

---

## 📁 Struktura souborů

```
src/
├── hooks/
│   └── usePracticeMode.js          ✅ Hook pro practice logiku
├── components/
│   ├── ui/
│   │   └── PracticeModeControls.jsx ✅ UI tlačítka + progress
│   └── practice/
│       └── PracticeCelebration.jsx  ✅ Konfety + success modal
└── utils/
    ├── practiceValidation.js        ✅ Validace not
    └── practiceStats.js              ✅ Ukládání statistik
```

---

## 🚀 Budoucí rozšíření

Tento systém lze snadno rozšířit o:
- Další typy cvičení (stupnice, rytmy, atd.)
- Různé obtížnosti s jinými odměnami
- Časové limity a speedrun režimy
- Multiplayer challenge režim
- Leaderboardy
- Achievementy

**Stačí použít stejné moduly a přidat nový obsah!**
