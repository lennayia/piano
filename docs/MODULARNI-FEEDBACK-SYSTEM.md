# Modulární Feedback Systém - Implementační Návod

## 📋 Přehled

Tento dokument popisuje, jak implementovat feedback systém (ikony ✓/✗ a oslavu) v jakékoli části aplikace pomocí univerzálních komponent.

---

## 🎯 Co máme k dispozici

### 1. **PracticeModeControls** - Univerzální modul
**Soubor:** `/src/components/ui/PracticeModeControls.jsx`

**Obsahuje:**
- ✅ Tlačítka režimů (Procvičovat, Výzva, Ukončit)
- ✅ Progress kartu (počet chyb, postup)
- ✅ **Feedback ikony** (✓/✗) s tlačítkem "Znovu"
- ✅ Podpora custom tlačítek (např. přehrávací)

### 2. **useProgressTracking** - Custom Hook
**Soubor:** `/src/hooks/useProgressTracking.js`

**Poskytuje:**
- `completedCount` - počet dokončených položek
- `incrementCompleted()` - zvýšit o 1
- `resetProgress()` - vrátit na 0

### 3. **InfoPanel** - Komponenta pro oslavu
**Soubor:** `/src/components/ui/CardComponents.jsx`

**Použití:**
- Velký InfoPanel s ikonou CheckCircle při úspěchu v Challenge režimu

---

## 🔧 Jak implementovat feedback v nové sekci

### Krok 1: Import modulů

```javascript
import PracticeModeControls from '../components/ui/PracticeModeControls';
import useProgressTracking from '../hooks/useProgressTracking';
import { InfoPanel } from '../components/ui/CardComponents';
import { CheckCircle } from 'lucide-react';
```

### Krok 2: Definovat stavy

```javascript
// Režimy
const [practicingMode, setPracticingMode] = useState(false);  // Procvičování (s nápovědou)
const [challengeMode, setChallengeMode] = useState(false);    // Výzva (bez nápovědy, s odměnami)

// Validace
const [playedNotes, setPlayedNotes] = useState([]);           // Co uživatel zahrál
const [showSuccess, setShowSuccess] = useState(false);        // Zobrazit ikonu úspěchu (✓)
const [showError, setShowError] = useState(false);            // Zobrazit ikonu chyby (✗)
const [practiceErrors, setPracticeErrors] = useState(0);      // Počet chyb v aktuálním pokusu

// Progress tracking
const { completedCount, incrementCompleted, resetProgress } = useProgressTracking();
const [completedItemIds, setCompletedItemIds] = useState(new Set());  // Anti-farming
```

### Krok 3: Validační logika (specifická pro každou sekci)

**Příklad: Akordy** (`Cviceni.jsx`)
```javascript
const handleNoteClick = (note) => {
  const requiredNotes = getChordNotes(currentChord);
  const expectedNote = requiredNotes[playedNotes.length];

  // Kontrola správnosti
  if (note !== expectedNote) {
    // CHYBA
    audioEngine.playError();
    setShowError(true);
    setPracticeErrors(prev => prev + 1);

    setTimeout(() => setShowError(false), 1000);
    return;
  }

  // Správná nota
  const newPlayedNotes = [...playedNotes, note];
  setPlayedNotes(newPlayedNotes);

  // Kontrola dokončení
  const isComplete = newPlayedNotes.length === requiredNotes.length;
  const isPerfect = practiceErrors === 0;  // DŮLEŽITÉ!

  if (isComplete && isPerfect) {
    // ÚSPĚCH!
    audioEngine.playSuccess();
    setShowSuccess(true);

    // V Challenge režimu: přidat odměny (jen jednou)
    if (challengeMode && !completedItemIds.has(currentChord.id)) {
      incrementCompleted();
      setCompletedItemIds(prev => new Set(prev).add(currentChord.id));
    }
  }
};
```

**Příklad: Písničky** (budoucí implementace)
```javascript
const handleSongComplete = (playedMelody) => {
  const requiredMelody = getSongMelody(currentSong);

  // Kontrola: správné noty + správné pořadí + správný počet
  const isCorrect = arraysEqual(playedMelody, requiredMelody);
  const isPerfect = practiceErrors === 0;

  if (isCorrect && isPerfect) {
    // ÚSPĚCH
    audioEngine.playSuccess();
    setShowSuccess(true);

    if (challengeMode && !completedItemIds.has(currentSong.id)) {
      incrementCompleted();
      setCompletedItemIds(prev => new Set(prev).add(currentSong.id));
    }
  } else {
    // CHYBA
    audioEngine.playError();
    setShowError(true);
    setPracticeErrors(prev => prev + 1);
  }
};
```

**Příklad: Stupnice** (budoucí implementace)
```javascript
const handleScalePlay = (playedScale) => {
  const requiredScale = getScale(currentScale, direction); // 'ascending' nebo 'descending'

  const isCorrect = arraysEqual(playedScale, requiredScale);
  const isPerfect = practiceErrors === 0;

  if (isCorrect && isPerfect) {
    audioEngine.playSuccess();
    setShowSuccess(true);

    if (challengeMode && !completedItemIds.has(currentScale.id)) {
      incrementCompleted();
      setCompletedItemIds(prev => new Set(prev).add(currentScale.id));
    }
  }
};
```

### Krok 4: Reset funkce

```javascript
const resetPractice = () => {
  setPlayedNotes([]);
  setShowSuccess(false);
  setShowError(false);
  setPracticeErrors(0);  // DŮLEŽITÉ: Resetovat chyby pro nový pokus
};
```

### Krok 5: Použití PracticeModeControls

```javascript
<PracticeModeControls
  // Stavy
  isPracticing={practicingMode}
  isChallenge={challengeMode}
  practiceErrors={practiceErrors}
  progress={playedNotes.length}
  totalNotes={requiredItems.length}

  // Callbacky pro režimy
  onStartPractice={() => {
    setPracticingMode(true);
    setChallengeMode(false);
    setPracticeErrors(0);
    setPlayedNotes([]);
    setShowSuccess(false);
  }}
  onStartChallenge={() => {
    setPracticingMode(false);
    setChallengeMode(true);
    setPracticeErrors(0);
    setPlayedNotes([]);
    setShowSuccess(false);
  }}
  onStop={() => {
    setPracticingMode(false);
    setChallengeMode(false);
    setPracticeErrors(0);
    setPlayedNotes([]);
    setShowSuccess(false);
  }}

  // Feedback ikony (✓/✗)
  showSuccess={showSuccess}
  showError={showError}
  onReset={resetPractice}

  // Zobrazení
  showStopButton={true}
>
  {/* Vlastní tlačítka (volitelné) */}
  <button onClick={playMelody}>Přehrát melodii</button>
</PracticeModeControls>
```

### Krok 6: InfoPanel pro Challenge režim (volitelné)

```javascript
<AnimatePresence>
  {showSuccess && challengeMode && (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <InfoPanel
        variant="secondary"
        style={{ textAlign: 'center', padding: '2rem 1.5rem' }}
      >
        <CheckCircle size={56} color="var(--color-secondary)" style={{ margin: '0 auto' }} />
        <h3 style={{ color: 'var(--color-secondary)', marginTop: '1rem' }}>
          Výborně!
        </h3>
        <p>Správně jste zahráli {currentItem?.name}!</p>
      </InfoPanel>
    </motion.div>
  )}
</AnimatePresence>
```

---

## ✅ Checklist pro úspěšnou implementaci

- [ ] Import `PracticeModeControls` a `useProgressTracking`
- [ ] Definovat všechny potřebné stavy (`practicingMode`, `challengeMode`, `showSuccess`, `showError`, `practiceErrors`)
- [ ] Implementovat **validační logiku** specifickou pro danou sekci
- [ ] Zkontrolovat `isPerfect = practiceErrors === 0` před zobrazením úspěchu
- [ ] Resetovat `practiceErrors` v `resetPractice()` funkci
- [ ] Přidat `showSuccess`, `showError`, `onReset` props do `PracticeModeControls`
- [ ] Volitelně: Přidat `InfoPanel` pro Challenge režim s velkou oslavou
- [ ] Anti-farming: Použít `Set` pro sledování dokončených ID

---

## 🎨 Vizuální chování

### Běžné hraní + Procvičování:
- ✓ **Malá ikona úspěchu (24px)** vedle tlačítka "Znovu"
- ✗ **Malá ikona chyby (24px)** vedle tlačítka "Znovu"
- **Tlačítko "Znovu"** vždy viditelné během režimu

### Challenge režim:
- ✓ **Velký InfoPanel** s oslavou (CheckCircle 56px)
- ✗ **Malá ikona chyby** vedle tlačítka "Znovu"
- **Odměny** (XP, statistiky) jen v Challenge + bez chyb

### Dokončení celé série:
- 🎊 **Velká oslava** s konfety (`PracticeCelebration`)
- 🏆 **Modal** s gratulací a statistikami

---

## 📝 Poznámky

1. **Validační logika** je vždy **specifická pro sekci** (akordy, písničky, stupnice).
2. **Modul** poskytuje **UI a zobrazení**, ale **stránka** rozhoduje, kdy zobrazit úspěch/chybu.
3. **Hook** poskytuje **logiku pro sledování pokroku**, ale neví nic o UI.
4. **Anti-farming**: Použít `Set` s ID pro sledování dokončených položek (odměny jen jednou).
5. **isPerfect check**: Vždy kontrolovat `practiceErrors === 0` před zobrazením úspěchu.

---

## 🔗 Související soubory

- `/src/components/ui/PracticeModeControls.jsx` - Univerzální modul
- `/src/hooks/useProgressTracking.js` - Custom hook
- `/src/components/ui/CardComponents.jsx` - InfoPanel komponenta
- `/src/pages/Cviceni.jsx` - Referenční implementace (akordy)
- `/src/components/resources/SongLibrary.jsx` - Implementace pro písničky

---

**Vytvořeno:** 2025-11-26
**Autor:** Claude Code
**Účel:** Univerzální návod pro implementaci feedback systému v jakékoli části aplikace
