# SESSION CONTEXT - Další Refaktoring
**Datum:** 3. prosince 2025
**Status:** PŘIPRAVENO pro novou session
**Předchozí session:** Card Component Modularizace (dokončeno)

---

## 📋 CO BYLO DOKONČENO (Předchozí session)

### Card Component Modularizace ✅
- ✅ Fix glass effect corner artifacts v EditFormContainer
- ✅ Přidán `as` prop do Card komponenty (polymorfní použití)
- ✅ PageCard, QuestionCard, ItemCard, StatCard refaktorovány na Card wrapper
- ✅ Standardizace: blur="30px", opacity={0.8}
- ✅ GlassCard.jsx odstraněn (duplicitní komponenta)
- ✅ Kompletní dokumentace aktualizována

**Výsledek:**
- Single source of truth pro glassmorphism efekty
- Eliminace všech duplikátů glassmorphism kódu
- Menší bundle size (odstranění GlassCard.jsx)

**Branch:** `feature/card-component-modularization` (merged do main)
**Commit:** `7f5bd1e`

---

## 🎯 AKTUÁLNÍ STAV PROJEKTU

### ✅ Komponenty již optimalizované:
1. **CardComponents.jsx** (605 řádků) - Card s `as` prop, všechny wrappers ✅
2. **EditFormContainer.jsx** (64 řádků) - Modulární, používá Card ✅
3. **UserDashboard.jsx** (480 řádků) - Extrakce dokončena ✅
4. **Leaderboard.jsx** (393 řádků) - Font styles, Chip komponenty ✅
5. **LessonList.jsx** (410 řádků) - GlassCard → Card ✅
6. **PianoKeyboard.jsx** - RADIUS, CSS variables ✅
7. **History.jsx** (~450 řádků) - activityService ✅

### 🔴 Komponenty čekající na refaktoring (PRIORITA):

#### 1. **SongLibrary.jsx** - 1817 řádků 🔴🔴🔴 NEJVYŠŠÍ PRIORITA
**Velikost:** Největší komponenta v projektu
**Cíl:** Zredukovat na ~500 řádků

**Potřebné extrakce:**
- [ ] `NoteFormatHelpContent` → samostatný soubor
- [ ] `SortableSongCard` → samostatný soubor
- [ ] `SongForm` → samostatný soubor (add/edit formulář)
- [ ] `SongPlayer` → samostatný soubor (přehrávač)
- [ ] `SongMetadata` → komponenta pro metadata (tónina, tempo)

**Kontrola modularizace:**
- [ ] Používá Card místo inline glassmorphism?
- [ ] Používá Chip pro metadata?
- [ ] Používá FormInput/FormSelect/FormTextarea?
- [ ] Používá SaveButton/CancelButton?
- [ ] Font styles převedeny na utility classes?
- [ ] CSS variables pro všechny barvy?

**Očekávaný benefit:**
- Redukce z 1817 na ~500 řádků (-72%)
- Reusable komponenty (SongForm použitelný jinde)
- Lepší performance (memoization sub-komponent)

---

#### 2. **Cviceni.jsx** - 767 řádků 🟡
**Popis:** Stránka s chord practice a dalšími cvičeními

**Potřebné extrakce:**
- [ ] `ChordPracticeSection` → samostatná komponenta
- [ ] `ExerciseControls` → kontroly pro cvičení
- [ ] Chord practice logika do custom hook: `useChordPractice`

**Kontrola modularizace:**
- [ ] Používá PracticeModeControls?
- [ ] Používá Card komponenty?
- [ ] CSS variables pro barvy?

---

#### 3. **UniversalTheoryQuiz.jsx** - 727 řádků 🟡
**Popis:** Univerzální kvíz pro teorii

**Potřebné extrakce:**
- [ ] Quiz logika → custom hook: `useTheoryQuiz`
- [ ] `QuizQuestion` → samostatná komponenta
- [ ] `QuizResults` → komponenta pro zobrazení výsledků
- [ ] `QuizProgress` → progress bar komponenta

**Kontrola modularizace:**
- [ ] Používá QuestionCard?
- [ ] Používá Chip pro score/feedback?
- [ ] Font styles převedeny na utility classes?

---

#### 4. **ChordQuiz.jsx** - 676 řádků 🟡
**Popis:** Poslechový kvíz akordů

**Potřebné extrakce:**
- [ ] Quiz logika → custom hook: `useChordQuiz`
- [ ] Sdílená logika s UniversalTheoryQuiz → `useQuizCore` hook
- [ ] Audio logic → samostatný modul

**Kontrola modularizace:**
- [ ] Používá Card komponenty?
- [ ] Používá Chip pro feedback?

---

#### 5. **GamificationManager.jsx** - 719 řádků 🟡
**Popis:** Admin správa gamifikace (XP, rewards, achievementy)

**Potřebné extrakce:**
- [ ] `XPRulesManager` → samostatná komponenta
- [ ] `RewardsManager` → samostatná komponenta
- [ ] `AchievementsManager` → samostatná komponenta
- [ ] `LeaderboardManager` → samostatná komponenta

**Kontrola modularizace:**
- [ ] Používá FormInput/FormSelect?
- [ ] Používá SaveButton/CancelButton?
- [ ] Používá Card komponenty?

---

## 📋 REFAKTORING TEMPLATE

### Krok 1: Analýza (10 min)
```bash
# Spočítat řádky
wc -l src/components/resources/SongLibrary.jsx

# Najít inline font styles
grep -n "fontSize:" src/components/resources/SongLibrary.jsx
grep -n "fontWeight:" src/components/resources/SongLibrary.jsx

# Najít hardcoded barvy
grep -n "#[0-9a-fA-F]\{6\}" src/components/resources/SongLibrary.jsx

# Najít bordery
grep -n "border:" src/components/resources/SongLibrary.jsx

# Najít glassmorphism
grep -n "backdropFilter" src/components/resources/SongLibrary.jsx
```

### Krok 2: Plán extrakce
- [ ] Identifikovat sub-komponenty (100+ řádků kódu = kandidát)
- [ ] Najít opakující se patterns
- [ ] Identifikovat business logiku → hooks
- [ ] Identifikovat UI komponenty → samostatné soubory

### Krok 3: Kontrola modularizace (DŮLEŽITÉ!)
#### CSS & Styling:
- [ ] **Border Radius** - Používá `RADIUS.sm/md/lg/xl` nebo `var(--radius-*)`?
- [ ] **Borders** - `border: 'none'` + `boxShadow` místo borderů?
- [ ] **Barvy** - Všechny `var(--color-primary)` místo hex?
- [ ] **Font sizes** - Utility classes (`.text-xs`, `.text-sm`, `.text-base`)?
- [ ] **Font weights** - Utility classes (`.font-medium`, `.font-semibold`) nebo číselné hodnoty?
- [ ] **Glassmorphism** - Používá Card komponentu místo inline stylů?

#### Komponenty:
- [ ] **Cards** - Používá `Card`, `PageCard`, `ItemCard`?
- [ ] **Buttons** - Používá `PrimaryButton`, `SecondaryButton`, `IconButton`?
- [ ] **Forms** - Používá `FormInput`, `FormSelect`, `FormTextarea`?
- [ ] **Chips** - Používá `Chip` pro badges/metadata?
- [ ] **Action buttons** - Používá `SaveButton`, `CancelButton`, `ActionButtonGroup`?

#### Services & Logic:
- [ ] **Achievement queries** - Používá `useAchievementsStore` cache?
- [ ] **Activity queries** - Používá `activityService`?
- [ ] **Completion logika** - Používá `celebrationService.celebrate()`?
- [ ] **XP hodnoty** - Žádné hardcoded XP?
- [ ] **DB queries** - Přesunuty do services?

#### Performance:
- [ ] **React.memo** - Velké sub-komponenty memoizované?
- [ ] **useCallback** - Event handlery stabilní?
- [ ] **useMemo** - Expensive computations memoizované?

#### Cleanup:
- [ ] **Console.log** - Všechny debug logy odstraněny?
- [ ] **Commented code** - Zakomentovaný kód odstraněn?
- [ ] **TODO comments** - Přesunuty do MASTER_TODO.md?

### Krok 4: Implementace
1. **Vytvořit novou větev:**
   ```bash
   git checkout -b refactor/song-library-modularization
   ```

2. **Extrahovat sub-komponenty:**
   - Začít s největšími bloky (100+ řádků)
   - Vytvořit nové soubory v `src/components/resources/`
   - Přesunout logiku, přidat props
   - Testovat po každé extrakci

3. **Aplikovat style checklist:**
   - Nahradit inline font styles
   - Nahradit hardcoded barvy
   - Použít modulární komponenty
   - Odstranit duplicity

4. **Optimalizace:**
   - Přidat React.memo
   - Přidat useCallback
   - Přidat useMemo

### Krok 5: Testování
- [ ] Komponenta se načítá bez chyb
- [ ] Všechny funkce fungují (add, edit, delete, play)
- [ ] Console bez errors
- [ ] Vizuální kontrola (barvy, fonty, spacing)
- [ ] Performance audit (React DevTools Profiler)

### Krok 6: Dokumentace a commit
- [ ] Aktualizovat MASTER_TODO.md
- [ ] Aktualizovat OPTIMALIZACE_CHECKLIST.md
- [ ] Vytvořit SESSION_CONTEXT-YYYYMMDD.md
- [ ] Git commit s detailním popisem
- [ ] Push do feature branch
- [ ] Merge do main

---

## 🔍 OČEKÁVANÉ VÝSLEDKY

### SongLibrary.jsx refaktoring:

**PŘED:**
```
- 1817 řádků v jednom souboru
- Inline glassmorphism styly
- Hardcoded font sizes
- Duplicitní formulářový kód (add/edit)
- Žádná memoization
```

**PO:**
```
- ~500 řádků v hlavním souboru
- 4-5 nových reusable komponent (každá 100-300 řádků)
- Používá Card komponenty
- Font utility classes
- Sdílený SongForm
- React.memo optimalizace
```

**Nové soubory:**
- `src/components/resources/SongForm.jsx` (~200 řádků)
- `src/components/resources/SongPlayer.jsx` (~150 řádků)
- `src/components/resources/SongMetadata.jsx` (~100 řádků)
- `src/components/resources/NoteFormatHelp.jsx` (~200 řádků)
- `src/components/resources/SortableSongCard.jsx` (~150 řádků)

---

## 📊 METRIKY - CÍLOVÉ HODNOTY

### Velikost souborů po refaktoringu:
- SongLibrary.jsx: 1817 → 500 řádků (-72%) 🎯
- Cviceni.jsx: 767 → 400 řádků (-48%) 🎯
- UniversalTheoryQuiz.jsx: 727 → 400 řádků (-45%) 🎯
- ChordQuiz.jsx: 676 → 400 řádků (-41%) 🎯
- GamificationManager.jsx: 719 → 400 řádků (-44%) 🎯

### Celková redukce:
- **Před:** 4706 řádků v 5 souborech
- **Po:** 2100 řádků v hlavních souborech + ~1500 řádků v nových komponentách
- **Net redukce:** ~1100 řádků (-23%)
- **Benefit:** Reusable komponenty, lepší organization, snadnější údržba

---

## 🎯 DOPORUČENÁ PRIORITA PRO DALŠÍ SESSION

### Session 1: SongLibrary.jsx (8-10 hodin)
**Proč první:**
- Největší soubor (1817 řádků)
- Nejvíc duplikátního kódu
- Používá se často (admin + uživatelé)
- Nejvíc benefitů z refaktoringu

**Plán:**
1. Extrakce NoteFormatHelp (1 hodina)
2. Extrakce SongForm (2 hodiny)
3. Extrakce SongPlayer (2 hodiny)
4. Extrakce SongMetadata (1 hodina)
5. Style modularizace (1 hodina)
6. Performance optimalizace (1 hodina)
7. Testování a dokumentace (1 hodina)

### Session 2: Cviceni.jsx (4-6 hodin)
**Extrakce:**
- ChordPracticeSection
- useChordPractice hook
- Style modularizace

### Session 3: Quiz komponenty (6-8 hodin)
**Extrakce:**
- Sdílený useQuizCore hook
- QuizQuestion komponenta
- QuizResults komponenta
- Style modularizace obou kvízů

### Session 4: GamificationManager.jsx (4-6 hodin)
**Extrakce:**
- 4 manager komponenty
- Style modularizace

---

## 💡 TIPY PRO REFAKTORING

### 1. Začít s největšími bloky
- Bloky 100+ řádků = kandidáti na extrakci
- Začít "zdola" (nejníže v komponentě)
- Testovat po každé extrakci

### 2. Sdílená logika do hooks
- Duplicitní useState/useEffect → custom hook
- Business logika mimo UI komponenty
- Prefix: `use*` (např. `useChordPractice`)

### 3. Props design
- Minimální props (jen co je nutné)
- Event handlers: `onSomething` (např. `onSave`, `onCancel`)
- Boolean flags: `is*`, `has*`, `show*`

### 4. Performance
- React.memo pro "expensive" komponenty
- useCallback pro funkce předávané do props
- useMemo pro expensive computations
- Lazy loading pro velké komponenty

### 5. Git workflow
- Malé commity (1 extrakce = 1 commit)
- Popisné commit messages
- Reference na issue/checklist v commitu
- Feature branch → main

---

## 🔗 REFERENCE DOKUMENTY

### Checklisty:
- `STYLE_CHECKLIST.md` - Kompletní style guidelines
- `OPTIMALIZACE_CHECKLIST.md` - Template pro optimalizaci
- `LESSONS_CHECKLIST.md` - Příklad hotového refaktoringu
- `LEADERBOARD_CHECKLIST.md` - Příklad font style refaktoringu

### Session dokumentace:
- `SESSION_CONTEXT-20251203-card-modularization.md` - Předchozí session
- `SESSION_CONTEXT-20251202-modularity.md` - UserDashboard extrakce
- `SESSION_CONTEXT-20251202-leaderboard.md` - Leaderboard refaktoring

### Utility soubory:
- `src/utils/styleConstants.js` - RADIUS, SHADOW, BORDER
- `src/styles/utilities.css` - Font utility classes
- `src/styles/index.css` - CSS variables

### Modulární komponenty:
- `src/components/ui/CardComponents.jsx` - Card, PageCard, ItemCard, QuestionCard
- `src/components/ui/ButtonComponents.jsx` - Všechny buttons a chips
- `src/components/ui/FormComponents.jsx` - Form inputs
- `src/components/ui/EditFormContainer.jsx` - Wrapper pro edit formuláře

---

## ✅ CHECKLIST PŘED STARTEM NOVÉ SESSION

Před začátkem refaktoringu zkontrolovat:
- [ ] Git status čistý (žádné uncommitted changes)
- [ ] Na main branch (nebo vytvořit novou feature branch)
- [ ] npm run dev běží bez chyb
- [ ] Console bez errors
- [ ] Přečíst STYLE_CHECKLIST.md
- [ ] Přečíst OPTIMALIZACE_CHECKLIST.md
- [ ] Mít po ruce SESSION_CONTEXT-20251203-card-modularization.md jako referenci

---

## 🚀 QUICK START PRO DALŠÍ SESSION

```bash
# 1. Pull nejnovější změny
git checkout main
git pull origin main

# 2. Vytvořit novou feature branch
git checkout -b refactor/song-library-modularization

# 3. Spustit dev server (pokud neběží)
npm run dev

# 4. Analyzovat SongLibrary.jsx
wc -l src/components/resources/SongLibrary.jsx
grep -n "fontSize:" src/components/resources/SongLibrary.jsx

# 5. Otevřít v editoru a začít s extrakcí NoteFormatHelp
# (první a nejjednodušší extrakce)
```

---

**Status:** ✅ PŘIPRAVENO pro novou refaktoringovou session
**Doporučený cíl:** SongLibrary.jsx (1817 → 500 řádků)
**Očekávaný čas:** 8-10 hodin práce
**Očekávaný benefit:** 72% redukce kódu + reusable komponenty

---

**Poznámka:** Tento dokument slouží jako startovní bod pro další session. Obsahuje vše potřebné pro úspěšný refaktoring: analýzu aktuálního stavu, prioritizaci, template, checklist, reference, quick start guide.
