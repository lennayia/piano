# AUDIT: ChordQuiz.jsx - "Poznáte akord?"
**Datum**: 8. prosince 2025
**Soubor**: `src/components/games/ChordQuiz.jsx`
**Velikost**: 665 řádků
**Status**: ❌ POTŘEBUJE OPTIMALIZACI

---

## 📊 AKTUÁLNÍ STAV

### Metriky
| Metrika | Hodnota | Ideál | Rozdíl |
|---------|---------|-------|--------|
| Celkové řádky | 665 | ~300 | **-55% potřeba** |
| Inline styly | ~450 | ~50 | **-89% potřeba** |
| Duplicitní kód | ~160 | 0 | **-100% potřeba** |
| Komponenty | 1 | 5 | **+4 potřeba** |
| useCallback | 0 | 7 | **+7 potřeba** |
| useMemo | 0 | 2 | **+2 potřeba** |
| Hardcoded colors | 8 | 0 | **-100% potřeba** |

---

## ❌ IDENTIFIKOVANÉ PROBLÉMY

### 🔴 KRITICKÉ (Vysoká priorita)

#### 1. **MASIVNÍ inline styly (70% souboru)**
**Problém**: ~450 řádků inline `style={{...}}` objektů
**Dopad**:
- Nečitelný kód
- Špatná maintainability
- Zbytečné re-rendery (nové objekty při každém renderu)

**Příklady**:
```javascript
// Lines 247-250: Loading state
<div style={{ textAlign: 'center', padding: '3rem' }}>
  <Music size={48} color="var(--color-primary)" style={{ animation: 'pulse 1.5s infinite', margin: '0 auto 1rem' }} />
  <p style={{ color: 'var(--text-secondary)' }}>Načítám akordy...</p>
</div>

// Lines 291-315: Title with nested inline styles
<h2 className="card-title" style={{
  marginBottom: '1.5rem',
  color: '#1e293b', // ❌ Hardcoded!
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem'
}}>
  <div style={{
    width: '48px',
    height: '48px',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid rgba(181, 31, 101, 0.2)',
    boxShadow: '0 4px 15px rgba(181, 31, 101, 0.2)'
  }}>
    <Target size={24} color="var(--color-primary)" />
  </div>
</h2>
```

**Řešení**: Extrakce do separátních komponent s minimálními inline styly

---

#### 2. **Duplicitní statistické karty (160 řádků)**
**Problém**: Stejný kód opakován 6x ve 2 sekcích

**Výskyty**:
1. **Start screen stats** (lines 366-415):
   - Otázek card (lines 366-381)
   - Nejlepší série card (lines 383-398)
   - Max XP card (lines 400-415)

2. **Game stats** (lines 448-497):
   - Skóre card (lines 448-463)
   - Série card (lines 465-480)
   - Otázka card (lines 482-497)

**Kód (opakuje se s variací)**:
```javascript
<div style={{
  background: 'rgba(45, 91, 120, 0.05)', // nebo primary color
  padding: isMobile ? '0.875rem 1.25rem' : '1rem 1.5rem',
  borderRadius: RADIUS.md,
  boxShadow: SHADOW.default
}}>
  <div style={{
    fontSize: isMobile ? '1.25rem' : '1.5rem',
    fontWeight: 'bold',
    color: 'var(--color-secondary)',
    marginBottom: '0.25rem'
  }}>
    {value}
  </div>
  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
    {label}
  </div>
</div>
```

**Řešení**: Vytvořit `QuizStatCard` komponentu, použít 6x

---

#### 3. **Žádná memoizace - Performance issue**
**Problém**: Všechny funkce se znovu vytváří při každém render

**Funkce bez useCallback**:
```javascript
// Line 42: fetchChords - používá se v useEffect
const fetchChords = async () => { ... }

// Line 106: playChord - event handler
const playChord = async (notes) => { ... }

// Line 115: saveQuizCompletion - async operace
const saveQuizCompletion = async (finalScore) => { ... }

// Line 158: startGame - event handler
const startGame = () => { ... }

// Line 168: handleAnswer - event handler (kritický!)
const handleAnswer = (answer) => { ... }

// Line 207: nextQuestion - event handler
const nextQuestion = () => { ... }

// Line 215: previousQuestion - event handler
const previousQuestion = () => { ... }

// Line 232: resetGame - event handler
const resetGame = () => { ... }
```

**Dopad**:
- Nové funkce při každém renderu
- Zbytečné re-rendery child komponent
- Horší performance při rychlém klikání

**Řešení**: Obalit všechny do useCallback s správnými dependencies

---

### 🟡 STŘEDNÍ (Střední priorita)

#### 4. **Hardcoded colors (8 výskytů)**
**Problém**: Barvy napsané přímo místo CSS variables

**Výskyty**:
```javascript
Line 83-86: Colors array
const colors = [
  'rgba(45, 91, 120, 0.05)', // ❌ Should be COLORS.secondaryTransparent
  'rgba(181, 31, 101, 0.05)', // ❌ Should be COLORS.primaryTransparent
];

Line 260: Error background
background: 'rgba(239, 68, 68, 0.1)' // ❌ Should be var(--color-danger-bg)

Line 262: Error border
border: '2px solid rgba(239, 68, 68, 0.3)' // ❌ Should be BORDER.danger

Line 264: Error icon color
color="#ef4444" // ❌ Should be var(--color-danger)

Line 293: Title color
color: '#1e293b' // ❌ Should be var(--color-text-primary)

Line 306: Icon border
border: '2px solid rgba(181, 31, 101, 0.2)' // ❌ Should be BORDER.primary

Line 316: Description color
color: '#64748b' // ❌ Should be var(--color-text-secondary)

Line 367, 384, 400, 449, 466, 483: Stat card backgrounds
background: 'rgba(45, 91, 120, 0.05)' // ❌ Duplicated
background: 'rgba(181, 31, 101, 0.05)' // ❌ Duplicated
```

**Řešení**: Nahradit CSS variables nebo COLORS konstantami

---

#### 5. **Chybějící modularita - Monolitická komponenta**
**Problém**: Vše v jedné 665-řádkové komponentě

**Sub-komponenty k extrakci**:

**A) QuizStartScreen** (lines 322-433) - 112 řádků
```javascript
// Obsahuje:
- Title section
- Description
- 3 stat cards (duplicitní!)
- Start button
```
**Benefit**: -112 řádků z main komponenty

**B) QuizStatCard** (opakuje se 6x) - ~60 řádků duplicity
```javascript
// Props:
- value: number | string
- label: string
- variant: 'primary' | 'secondary'
- isMobile: boolean
```
**Benefit**: -160 řádků duplicitního kódu, +1 reusable komponenta

**C) QuizQuestionCard** (lines 501-599) - 99 řádků
```javascript
// Obsahuje:
- Title "Který akord slyšíte?"
- Play button (circular gradient)
- Answer options grid
- Answer feedback (checkmarks/crosses)
```
**Benefit**: -99 řádků z main komponenty

**D) QuizAnswerButton** (lines 566-596) - 31 řádků x 4 = 124 řádků
```javascript
// Props:
- option: string
- isSelected: boolean
- isCorrect: boolean
- showResult: boolean
- onClick: () => void
- isMobile: boolean
```
**Benefit**: -124 řádků duplicitního kódu

**E) QuizNavigationButtons** (lines 602-646) - 45 řádků
```javascript
// Obsahuje:
- Previous button (ChevronLeft)
- Next button (ChevronRight)
- "Hrát znovu" button
- Podmíněné zobrazení podle stavu
```
**Benefit**: -45 řádků z main komponenty

---

### 🟢 NÍZKÁ (Nice to have)

#### 6. **Responzivní logika opakovaná 45x**
**Problém**: `isMobile ?` ternary operátory všude

**Příklady**:
```javascript
fontSize: isMobile ? '0.875rem' : '1rem'
padding: isMobile ? '1.5rem' : '2rem'
gap: isMobile ? '0.5rem' : '1rem'
// ... 42 dalších výskytů
```

**Řešení**:
- Použít utility classes nebo
- Responsive komponenty s CSS media queries

---

#### 7. **Magic numbers bez konstant**
**Problém**: Číselné hodnoty přímo v kódu

**Příklady**:
```javascript
Line 199: setTimeout(() => audioEngine.playApplause(), 500)
Line 202: setTimeout(() => setShowCelebration(false), 3000)
Line 147: setTimeout(() => triggerCelebration(...), 1000)
Line 536-537: width: '96px', height: '96px' // Play button size
```

**Řešení**: Vytvořit konstanty
```javascript
const ANIMATION_DELAYS = {
  APPLAUSE: 500,
  CELEBRATION_HIDE: 3000,
  LEVEL_UP: 1000
};

const PLAY_BUTTON_SIZE = { mobile: 80, desktop: 96 };
```

---

## 🎯 DOPORUČENÝ PLÁN OPTIMALIZACE

### Fáze 1: Extrakce komponent (Priorita 🔴)
**Cíl**: Rozdělit monolitickou komponentu na modulární části

1. **QuizStatCard.jsx** - Reusable stat card
   - Props: value, label, variant, isMobile
   - Eliminuje 160 řádků duplicity
   - Použití: 6x v ChordQuiz

2. **QuizStartScreen.jsx** - Úvodní obrazovka
   - Props: chords, bestStreak, onStart, isMobile
   - Eliminuje 112 řádků z ChordQuiz
   - Používá QuizStatCard 3x

3. **QuizQuestionCard.jsx** - Karta s otázkou
   - Props: chord, onPlayChord, isMobile
   - Eliminuje 99 řádků z ChordQuiz
   - Children: QuizAnswerButton komponenty

4. **QuizAnswerButton.jsx** - Tlačítko odpovědi
   - Props: option, isSelected, isCorrect, showResult, onClick, isMobile
   - Eliminuje 124 řádků duplicity
   - Použití: 4x v QuizQuestionCard

5. **QuizNavigation.jsx** - Navigační tlačítka
   - Props: showResult, currentQuestion, totalQuestions, onPrevious, onNext, onReset, isMobile
   - Eliminuje 45 řádků z ChordQuiz

**Očekávaný výsledek**: 665 → ~325 řádků (-51%)

---

### Fáze 2: Performance optimalizace (Priorita 🔴)
**Cíl**: Přidat memoizaci pro lepší performance

**useCallback pro event handlers**:
```javascript
const fetchChords = useCallback(async () => { ... }, []);
const playChord = useCallback(async (notes) => { ... }, []);
const handleAnswer = useCallback((answer) => { ... }, [showResult, chords, currentQuestion, score, streak, bestStreak, onDailyGoalComplete]);
const startGame = useCallback(() => { ... }, []);
const nextQuestion = useCallback(() => { ... }, [currentQuestion, chords.length]);
const previousQuestion = useCallback(() => { ... }, [currentQuestion]);
const resetGame = useCallback(() => { ... }, []);
const saveQuizCompletion = useCallback(async (finalScore) => { ... }, [chords.length, bestStreak]);
```

**useMemo pro computed values**:
```javascript
const currentChord = useMemo(() => chords[currentQuestion], [chords, currentQuestion]);
const isLastQuestion = useMemo(() => currentQuestion === chords.length - 1, [currentQuestion, chords.length]);
```

**Očekávaný benefit**:
- Méně re-renderů
- Rychlejší response při klikání
- Lepší performance na slabších zařízeních

---

### Fáze 3: Code quality (Priorita 🟡)
**Cíl**: Odstranit hardcoded values a zlepšit maintainability

1. **Nahradit hardcoded colors**:
   ```javascript
   // PŘED
   color: '#1e293b'

   // PO
   color: 'var(--color-text-primary)'
   ```

2. **Vytvořit konstanty pro colors**:
   ```javascript
   const STAT_CARD_COLORS = {
     primary: 'rgba(181, 31, 101, 0.05)',
     secondary: 'rgba(45, 91, 120, 0.05)'
   };
   ```

3. **Odstranit inline styly z extrahovaných komponent**:
   - Přesunout do component CSS nebo styled-components
   - Použít utility classes kde možné

**Očekávaný výsledek**:
- Konzistentní barvy napříč aplikací
- Snadná změna theme
- Lepší maintainability

---

### Fáze 4: Polish (Priorita 🟢)
**Cíl**: Vylepšení UX a DX

1. **Vytvořit konstanty pro timeouty**:
   ```javascript
   const TIMING = {
     APPLAUSE_DELAY: 500,
     CELEBRATION_DURATION: 3000,
     LEVEL_UP_DELAY: 1000
   };
   ```

2. **Responzivní utility funkce**:
   ```javascript
   const getResponsiveValue = (mobile, desktop) =>
     isMobile ? mobile : desktop;

   // Usage:
   fontSize: getResponsiveValue('0.875rem', '1rem')
   ```

3. **Error boundary**:
   - Přidat error boundary pro lepší error handling
   - Fallback UI při chybě načítání

---

## 📊 OČEKÁVANÉ VÝSLEDKY

### Před optimalizací
```
ChordQuiz.jsx: 665 řádků
├─ Inline styly: ~450 řádků (70%)
├─ Duplicitní kód: ~160 řádků
├─ Komponenty: 1
├─ useCallback: 0
├─ useMemo: 0
└─ Maintainability: ⭐⭐☆☆☆
```

### Po optimalizaci
```
ChordQuiz.jsx: ~300 řádků (-55%)
├─ QuizStartScreen.jsx: ~80 řádků
├─ QuizStatCard.jsx: ~40 řádků
├─ QuizQuestionCard.jsx: ~70 řádků
├─ QuizAnswerButton.jsx: ~50 řádků
└─ QuizNavigation.jsx: ~60 řádků

Performance:
├─ useCallback: 8
├─ useMemo: 2
└─ Inline styly: ~50 řádků (17%)

Maintainability: ⭐⭐⭐⭐⭐
```

### Benefits
- ✅ **-55% kódu** v main komponentě
- ✅ **-89% inline stylů**
- ✅ **0 duplicitního kódu**
- ✅ **5 reusable komponent**
- ✅ **Lepší performance** (memoizace)
- ✅ **Lepší maintainability**
- ✅ **Konzistentní styling**

---

## ⏱️ ESTIMACE ČASU

| Fáze | Čas | Priorita |
|------|-----|----------|
| Fáze 1: Extrakce komponent | 2-3h | 🔴 Vysoká |
| Fáze 2: Performance | 1h | 🔴 Vysoká |
| Fáze 3: Code quality | 1h | 🟡 Střední |
| Fáze 4: Polish | 30min | 🟢 Nízká |
| **CELKEM** | **4.5-5.5h** | - |

---

## ✅ CHECKLIST PŘED ZAČÁTKEM

- [ ] Backup aktuální verze (git commit)
- [ ] Vytvořit feature branch `feature/optimize-chord-quiz`
- [ ] Připravit test cases pro regression testing
- [ ] Ověřit že dev server běží

## ✅ CHECKLIST PO DOKONČENÍ

- [ ] Všechny testy prošly
- [ ] Build úspěšný bez warnings
- [ ] Vizuální kontrola - vše vypadá stejně
- [ ] Funkční kontrola - vše funguje stejně
- [ ] Performance lepší (DevTools)
- [ ] Žádné console errors
- [ ] Git commit s popisným message
- [ ] Push do remote branch

---

**Připraven na začátek**: ✅
**Next step**: Extrakce QuizStatCard komponenty
