# 📋 MASTER TODO - Piano Learning App

Datum poslední aktualizace: 8. prosince 2025 (Session 11 - ChordQuiz Modularization)

## ✅ Dokončeno v Session 11 - ChordQuiz Modularizace + Optimalizace (8.12.2025)

### 🎯 Modularizace "Poznáte akord?" kvízu

**Fáze 1: Extrakce reusable komponent (-140 řádků duplicate kódu):**
1. ✅ **QuizStatCard.jsx** (110 řádků)
   - Univerzální stat karty s 2 sizes (normal, compact)
   - 2 varianty (primary, secondary)
   - Eliminuje 87 řádků duplicate kódu (6x usage)

2. ✅ **QuizStartScreen.jsx** (124 řádků)
   - Reusable start screen pro všechny kvízy
   - Nahrazuje 82 řádků inline kódu → 12 řádků usage
   - Čistý zisk: -70 řádků

3. ✅ **PianoPrepareDialog.jsx** (68 řádků)
   - Reusable dialog pro Salamander Piano inicializaci
   - Použitý v ChordQuiz + ChordPracticeSection
   - ChordPracticeSection: -28 řádků

**Fáze 2: Performance optimalizace:**
1. ✅ **useCallback** pro 8 funkcí v ChordQuiz:
   - fetchChords, playChord, saveQuizCompletion, startGame
   - handleAnswer, nextQuestion, previousQuestion, resetGame
   - Prevence zbytečných re-renders

2. ✅ **useMemo** pro computed hodnoty:
   - currentChord (depends: chords, currentQuestion)

**Audio fix:**
- ✅ Piano Context integrace v ChordQuiz
- ✅ Eliminován "plechový" zvuk (tinny/synthetic fallback)
- ✅ Správné čekání na Salamander Grand Piano samples

**UX vylepšení:**
- ✅ Odstraněn denní cíl z kvízu (trackuje se jen session stats)
- ✅ Kvíz zobrazuje jen real-time progress (score, streak, XP)
- ✅ Denní cíle zachovány pro Akordy a Písničky sekce
- ✅ Conditional rendering: `showDailyGoal={activeSection !== 'quiz'}`

**Cviceni.jsx refactoring:**
- ✅ Fix React Hooks order violation (useMemo před early returns)
- ✅ Odstranění fallback hodnot (`|| 5`, `|| 0`) pro konzistenci s Lekce.jsx
- ✅ Odstranění zbytečného optional chaining (`?.`)
- ✅ Conditional rendering denního cíle + progress baru pro quiz

**Statistiky změn:**
- **7 souborů změněno**
- **+945 řádků** (nové komponenty + dokumentace)
- **-269 řádků** (odstranění duplicit)
- **Čistý zisk: +676 řádků** (ale s eliminací duplicit a modularizací)

**Soubory:**
- ➕ `src/components/games/QuizStartScreen.jsx` (127 řádků)
- ➕ `src/components/games/QuizStatCard.jsx` (110 řádků)
- ➕ `src/components/ui/PianoPrepareDialog.jsx` (68 řádků)
- ➕ `docs/AUDIT-ChordQuiz-20251208.md` (485 řádků - kompletní audit)
- 🔧 `src/components/games/ChordQuiz.jsx` (optimalizace + modularizace)
- 🔧 `src/components/practice/ChordPracticeSection.jsx` (refactor na PianoPrepareDialog)
- 🔧 `src/pages/Cviceni.jsx` (hooks fix + UX vylepšení)

**Git:**
- ✅ Branch: `feat/chord-quiz-modularization`
- ✅ Commit: `41cf409` - pushnutý do origin/main
- ✅ Fast-forward merge do main

**Dokumentace:**
- ✅ `docs/AUDIT-ChordQuiz-20251208.md` (kompletní audit před refactoringem)
- ✅ MASTER_TODO.md aktualizován
- ✅ OPTIMALIZACE_CHECKLIST.md aktualizován
- ✅ STYLE_CHECKLIST.md aktualizován

---

## ✅ Dokončeno v Session 10 - Console Logs Cleanup (8.12.2025)

### 🧹 Odstranění vývojových console.log() z audio enginu

**Audit sekce Cvičení/Akordy:**
- ✅ Ověření čistoty kódu od debug logů
- ✅ Všechny soubory (Cviceni.jsx, ChordQuiz.jsx, ChordPracticeSection.jsx, SongLibrary.jsx)
- ✅ Žádné console.log() debug statements v sekci Cvičení/Akordy
- ✅ Pouze console.error() v catch blocích (správná praxe)

**Odstraněné vývojové logy:**
1. ✅ `PianoContext.jsx:18` - '🎹 Initializing Salamander Piano with user gesture...'
2. ✅ `PianoContext.jsx:22` - '✅ Salamander Piano ready globally!'
3. ✅ `audio.js:67` - '🎹 Tone.js started with user gesture'
4. ✅ `audio.js:119` - '✅ Salamander Piano loaded successfully!'

**Zachováno:**
- ✅ Všechny console.error() pro error handling (PianoContext, audio.js)
- ✅ Kritická error diagnostika zachována

**Audit modernosti kódu:**
- ✅ **Lazy Loading**: ChordQuiz, ChordPracticeSection, SongLibrary (67% redukce initial bundle)
- ✅ **Suspense**: Implementováno s fallbacky
- ✅ **Custom Hooks**: useResponsive, useDailyGoal
- ✅ **Memoizace**: useCallback v Cviceni.jsx, ChordPracticeSection; useMemo v SongLibrary
- ✅ **Zero Duplicate Code**: Callbacks sloučeny v předchozích sessions
- ✅ **Modern React Patterns**: 100% React 18 best practices

**Výsledek:**
- ✅ Čistá konzole v produkci (0 debug logů)
- ✅ Sekce Cvičení/Akordy production-ready
- ✅ Moderní a optimalizovaný kód

**Poznámka:**
- ⚠️ Vite Fast Refresh warning v PianoContext.jsx (component + hook v jednom souboru)
  - Není production problém
  - HMR nefunguje jen pro tento soubor
  - Volitelné řešení: Rozdělit do 2 souborů

**Soubory změněny:**
- `src/contexts/PianoContext.jsx` - odstranění 2 console.log()
- `src/utils/audio.js` - odstranění 2 console.log()

**Dokumentace:**
- ✅ `docs/SESSION_CONTEXT-20251208-cleanup-logs.md` (kompletní)

---

## ✅ Dokončeno v Session 9 - Practice UI Improvements (5.12.2025)

### 🐛 Hotfix: PianoContext Vite Fast Refresh Error

**Problém:**
- ✅ Error "usePiano must be used within PianoProvider" po keyboard responsiveness session
- ✅ Vite HMR nekompatibilita s `export function` pro component + hook v jednom souboru
- ✅ Při hot reload se kontext "ztratil"

**Řešení:**
- ✅ Změna `export function` → `export const` s arrow functions
- ✅ PianoProvider: `export const PianoProvider = ({ children }) => { ... }`
- ✅ usePiano: `export const usePiano = () => { ... }`

**Výsledek:**
- ✅ Vite Fast Refresh nyní správně funguje
- ✅ Žádné HMR problémy během developmentu
- ✅ Kontext stabilní při hot reloadech

**Soubory:** `src/contexts/PianoContext.jsx`

---

### 🎨 Feature: Vylepšení PracticeModeControls Info Panelu

**User feedback:**
- ❌ "Chyby: 0, Postup: 0/3" - matoucí, co to znamená?
- ❌ Není vidět celkový pokrok v sérii
- ❌ Technické labely místo srozumitelných českých

**Implementace:**

**1. Nové props v PracticeModeControls:**
- ✅ `completedItems` - počet dokončených položek v sérii
- ✅ `totalItems` - celkový počet položek v sérii
- ✅ Zpětně kompatibilní (default = 0)

**2. Vylepšené labely:**
- ✅ "Postup aktuální položky" → **"Správné tóny"**
- ✅ "Dokončeno v sérii" → **"Bezchybné akordy"**
- ✅ Pořadí: Chyby → Správné tóny → Bezchybné akordy

**3. Display před/po:**

**PŘED:**
```
Chyby: 0
Postup: 0 / 3
```

**PO:**
```
Chyby: 0
Správné tóny: 0 / 3
Bezchybné akordy: 2 / 12
```

**4. ChordPracticeSection integrace:**
- ✅ Předávání `completedItems={challengeMode ? completedCount : practiceCompletedChordIds.size}`
- ✅ Předávání `totalItems={chords.length}`
- ✅ Info panel nyní zobrazuje kompletní přehled

**UX výsledky:**
- ✅ Jasný přehled o pokroku v aktuálním akordu (správné tóny)
- ✅ Jasný přehled o celkovém pokroku série (bezchybné akordy)
- ✅ Srozumitelné české labely
- ✅ Kompletní informace v jednom panelu

**Soubory změněny:**
- `src/components/ui/PracticeModeControls.jsx` - nové props + display
- `src/components/practice/ChordPracticeSection.jsx` - předávání dat

**Dokumentace:**
- ✅ `SESSION_CONTEXT-20251205-practice-ui-improvements.md` (kompletní)

**Commits:**
- Připraveno pro commit: "feat: Improve PracticeModeControls UX + fix PianoContext HMR"

---

## ✅ Dokončeno v Session 8 - ChordPracticeSection refactoring + modularizace (4.12.2025)

### 🧩 Extrakce ChordPracticeSection + Card/PageCard modularizace

**ChordPracticeSection.jsx - Nová komponenta:**
- ✅ Vytvoření samostatné komponenty pro procvičování akordů (577 řádků)
  - Kompletní logika pro režim "Procvičovat" (s nápovědou)
  - Kompletní logika pro režim "Výzva" (bez nápovědy, pro odměny)
  - Audio playback (full chord + arpeggio)
  - Progress tracking + celebrations
  - Daily goal integrace
  - State management (20+ useState hooks)
  - Props: chords, selectedDifficulty, isShuffled, currentUser, onDailyGoalComplete, onResetProgress

**Cviceni.jsx - Redukce 52%:**
- ✅ Redukce z 1010 → 486 řádků (-524 řádků, -52%)
  - Nyní pouze page controller
  - PageSection pro controls (tabs, search, daily goals)
  - Routing mezi sekcemi (chords, quiz, songs)
  - Daily goal management pro 3 sekce
  - Conditional rendering obsahu
  - Odstraněno: 20+ useState, useEffects, audio funkce, handleNoteClick logika

**Modularizace Card komponent:**
- ✅ Card → PageCard conversion
  - Card: čistý glassmorphism (bez paddingu)
  - PageCard: Card + padding 1.25rem (pro obsah stránek)
  - Fix chybějícího paddingu v ChordPracticeSection

- ✅ InfoPanel enhancement
  - Přidán `as` prop pro polymorfismus
  - Podpora motion.div integrace
  - Pattern: `<InfoPanel as={motion.div} variant="primary" />`

**Responzivní padding fixes:**
- ✅ Odstranění fixního inline `padding: '0 1rem'`
  - Použití CSS `.container` třídy s responzivním paddingem
  - Mobil: menší padding, Desktop: větší padding
  - Aplikováno na chord card i keyboard card containers

**PageSection.jsx - MaxWidth fix:**
- ✅ Implementace maxWidth prop functionality
  - maxWidthMap: sm (640px), md (768px), lg (1024px), xl (1280px), full (100%)
  - Aplikace na container element

**Architektonické poznatky:**
- ✅ PageSection POUZE pro controls (title, tabs, search, daily goals)
- ✅ Content (ChordPracticeSection, ChordQuiz, SongLibrary) MIMO PageSection
- ✅ Umožňuje full-width layouts pro komponenty jako klaviatura

**Verifikace gamifikačního systému:**
- ✅ Denní cíle: localStorage → Supabase flow funguje správně
- ✅ Celebrate service: centralizovaný, ukládá do všech tabulek
- ✅ Supabase persistence: piano_daily_goal_completions, piano_user_stats, piano_level_history, piano_achievements
- ✅ User stats tracking: XP, level, streaks, completion counts

**Dokumentace:**
- ✅ `SESSION_CONTEXT-20251204-chord-refactoring-done.md` (437 řádků)
  - Kompletní popis dnešní práce
  - Architektonické vzory
  - Priority pro další refactoring
  - Git workflow preferences
  - Quick start guide pro další session

**Soubory změněny:**
- `src/components/practice/ChordPracticeSection.jsx` (+577 řádků, nový soubor)
- `src/pages/Cviceni.jsx` (1010 → 486 řádků, -524 řádků)
- `src/components/ui/CardComponents.jsx` (InfoPanel as prop)
- `src/components/ui/PageSection.jsx` (maxWidth implementation)

**Commits:**
- `02c3213` - refactor: Extract ChordPracticeSection + modularize cards
- `694a016` - fix: Card → PageCard + responzivní padding pro mobily

**Netto změna:** +61 řádků (ale lepší modularita!)

---

## ✅ Dokončeno v Session 7 - ProgressBar integrace a zjemnění barev (4.12.2025)

### 🎨 Kompletní integrace ProgressBar modulu + zjemnění barev

**ProgressBar modul v PageSection:**
- ✅ Integrace ProgressBar modulu přímo do PageSection
  - Přidány nové props: `progressCurrent`, `progressTotal`, `progressTitle`
  - Backward compatibility s původním `progress` prop (inline fallback)
  - Flex properties pro správnou velikost: `flex: '1 1 250px'`, `minWidth: '250px'`
  - Modulární approach místo inline progress bar kódu

**Lekce - Celkový pokrok:**
- ✅ Přidán ProgressBar pro celkový pokrok všech lekcí
  - Import useLessonStore, ProgressBar, supabase
  - Načítání dokončených lekcí z `piano_lesson_completions`
  - State: `completedLessonIds` (Set) + `lessons` (array)
  - Zobrazení "Celkový pokrok: X z Y" pod PageSection
  - Barva: `var(--color-secondary)` (modrá) pro konzistenci

**Cvičení - Přechod na nový modul:**
- ✅ Aktualizace props z `progress` na modulární variantu
  - `progressCurrent={currentGoalData.goal.completedToday}`
  - `progressTotal={currentGoalData.goal.dailyGoal}`
  - `progressTitle="Dnešní pokrok:"`
  - Odstranění deprecated `progressLabel` prop

**Zjemnění barev progress barů:**
- ✅ **ProgressBar modul** (CardComponents.jsx):
  - Track: `rgba(181, 31, 101, 0.06)` → `0.02` (-67% opacity)
  - Fill: gradient s opacity `1.0` → `0.5-0.6` (-40-50% opacity)

- ✅ **AchievementGrid** (achievement karty):
  - Track: `rgba(148, 163, 184, 0.2)` → `0.1` (-50% opacity)
  - Fill: `rgba(..., 0.6)` → `0.5-0.6` (zjemnění)

- ✅ **AchievementDetail** (detail panel):
  - Track: `rgba(181, 31, 101, 0.06)` → `0.02` (-67% opacity)
  - Fill: **PLNÁ barva `1.0`** → `0.5-0.6` (-40-50% opacity!)
  - Největší vizuální změna - z výrazné na jemnou

**Výsledky:**
- ✅ Jednotný ProgressBar modul napříč Lekcemi a Cvičením
- ✅ Lekce mají celkový pokrok všech dokončených lekcí
- ✅ Konzistentní jemné barvy napříč celou aplikací (3 místa)
- ✅ Modulární architektura - změna v CardComponents = změna všude
- ✅ Flex properties zajišťují správnou velikost na všech obrazovkách

**Dokumentace**: Bude vytvořena `DOKUMENTACE-20251204-progressbar-integration.md`

**Soubory změněny:**
- `src/components/ui/PageSection.jsx` - ProgressBar modul integrace
- `src/components/ui/CardComponents.jsx` - zjemnění barev
- `src/pages/Lekce.jsx` - celkový pokrok + nové props
- `src/pages/Cviceni.jsx` - nové props
- `src/components/dashboard/AchievementGrid.jsx` - zjemnění barev
- `src/components/dashboard/AchievementDetail.jsx` - zjemnění barev

---

## ✅ Dokončeno v Session 6 - Večerní optimalizace (3.12.2025)

### 🧹 Kompletní optimalizace a čištění kódu stránky Lekce

**Priorita 1 - Console.logy:**
- ✅ Odstranění 3x console.error z produkčního kódu
  - LessonList.jsx:183
  - LessonModal.jsx:46, 98
  - Nahrazeno tichým selháním

**Priorita 2-3 - Centralizace a DRY:**
- ✅ Vytvořen `src/utils/responsiveConstants.js` (72 řádků)
  - BREAKPOINTS konstanty
  - getModalPadding(), getCardHorizontalPadding()
  - getKeyboardPadding(), getNoteCardValues()
  - calculateKeyWidth() - unified responsive logic
- ✅ Vytvořen `src/hooks/useResponsiveValue.js`
  - Custom hook pro responzivní hodnoty s memoizací
- ✅ Sjednocen DIFFICULTY_MAP do lessonUtils.js
  - Eliminace duplicity v LessonList

**Priorita 4 - Refaktoring komponent:**
- ✅ NoteCard.jsx - použití getNoteCardValues() (3 řádky → 1 řádek)
- ✅ PianoKeyboard.jsx - použití calculateKeyWidth() (20+ řádků → 2 řádky)
- ✅ LessonList.jsx - import DIFFICULTY_MAP místo lokální konstanty

**Priorita 5 - Code cleanup:**
- ✅ Odstranění zbytečných JSDoc komentářů (NoteCard, LessonForm)

**Výsledky:**
- ✅ Eliminováno ~30+ řádků duplicitního kódu
- ✅ Žádné console.logy v production ✓
- ✅ Centralizované responzivní konstanty
- ✅ DRY princip napříč všemi Lekce komponenty

**Dokumentace**: `DOKUMENTACE-20251203-optimization-cleanup.md`

---

## ✅ Dokončeno v Session 5 - Odpolední (3.12.2025)

### 1. ✅ PianoKeyboard - Responzivní optimalizace
- Proporcionální výška kláves (1:5.5 ratio)
- Zjednodušený výpočet šířky pro modal kontext
- Minimalizace horizontálního paddingu (0.25rem na < 700px)
- Vertikální layout ovládacích prvků na < 540px
- **Soubor**: `src/components/lessons/PianoKeyboard.jsx`

### 2. ✅ NoteCard - Zmenšení chipů
- Proporcionální scale (0.7) místo změny rozměrů
- Fixní šířka pro konzistentní zobrazení
- Snížené mezery mezi chipy (0.35rem)
- **Soubor**: `src/components/lessons/NoteCard.jsx`

### 3. ✅ LessonModal - Integrace reward modalu
- PracticeCelebration modal pro zobrazení XP odměn
- Propojení s celebrate() service
- Kompletní flow: completion → reward modal → level-up celebration
- **Soubor**: `src/components/lessons/LessonModal.jsx`

### 4. ✅ Modal - Design tweaks
- Zmenšené border-radius (xxl → xl)
- **Soubor**: `src/components/ui/Modal.jsx`

### 5. ✅ CardComponents - Framer Motion fix
- Oprava "transparent" animation warning
- **Soubor**: `src/components/ui/CardComponents.jsx`

### 6. ✅ useDailyGoal - Code cleanup
- Odstranění verbose console.logs
- **Soubor**: `src/hooks/useDailyGoal.js`

**Dokumentace**: `DOKUMENTACE-20251203-responsive-and-rewards.md`

---

## 🆕 Nově přidané úkoly (2.12.2025)
1. **User Rating System** - Hodnocení aktivit (hvězdičky + náročnost)
2. **Admin Analytics** - Kompletní dashboard pro analýzu použití aktivit

---

## 🔥 Priorita 1 - Kritické (Nutné pro správné fungování)

---

### 1. ⏳ Vlastní systém notifikací
**Status:** Pending
**Priorita:** 🔴 Kritická

**Popis:**
- Nahradit ošklivé browser notifikace a `alert()` moderním notifikačním systémem
- Design v souladu s aplikací
- Notifikace zmizí automaticky po X sekundách
- Alerty zůstanou pro důležité zprávy (error, warning)

**Typy notifikací:**
- **Toast (notifikace)** - automaticky zmizí (success, info, warning)
  - Pozice: top-right nebo bottom-right
  - Animace: slide-in + fade-out
  - Automatické zavření po 3-5 sekundách

- **Alert (modální dialog)** - musí být potvrzeno uživatelem (error, confirm)
  - Backdrop overlay
  - Tlačítka: OK, Cancel, Confirm
  - Zůstává dokud není zavřeno

**Soubory k vytvoření:**
- `src/components/ui/Toast.jsx` - toast notifikace
- `src/components/ui/AlertDialog.jsx` - modální alerty
- `src/context/NotificationContext.jsx` - context pro správu notifikací
- `src/hooks/useNotification.js` - hook pro jednoduché použití

**Použití:**
```jsx
const { showToast, showAlert } = useNotification();

// Toast notifikace (zmizí automaticky)
showToast('Kvíz dokončen!', 'success');
showToast('Chyba při ukládání', 'error');

// Alert dialog (musí být potvrzen)
const confirmed = await showAlert('Opravdu smazat?', 'warning', {
  confirmText: 'Smazat',
  cancelText: 'Zrušit'
});
```

**Design:**
- Použít RADIUS, SHADOW, BORDER konstanty
- Ikony z lucide-react
- Barvy podle typu (success: zelená, error: červená, warning: žlutá, info: modrá)
- Framer Motion animace

---

## 🔥 Priorita 2 - Vysoká (Důležité pro UX)

### 1. ⏳ User Rating System - Hodnocení aktivit
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- Umožnit uživatelům hodnotit lekce, písně, kvízy, cvičení
- **Oblíbenost** - hodnocení hvězdičkami (1-5 hvězdiček)
- **Náročnost** - subjektivní obtížnost (Easy/Medium/Hard)
- Zobrazení průměrného hodnocení u každé aktivity
- Filtrování podle hodnocení
- Analytics pro admina - co je nejoblíbenější

**Databázové změny:**
- Nová tabulka `piano_user_ratings`:
  - `id` (uuid, PK)
  - `user_id` (uuid, FK → piano_users)
  - `activity_type` (ENUM: 'lesson', 'song', 'quiz', 'exercise')
  - `activity_id` (text) - ID aktivity (lesson_id, song_id, quiz_type)
  - `rating` (integer, 1-5) - hvězdičky oblíbenosti
  - `difficulty_rating` (ENUM: 'easy', 'medium', 'hard') - subjektivní náročnost
  - `comment` (text, nullable) - volitelný komentář
  - `created_at` (timestamp)
  - UNIQUE constraint na (user_id, activity_type, activity_id)

- Přidat sloupce do aktivit pro agregaci:
  - `piano_lessons.avg_rating` (decimal) - průměrné hodnocení
  - `piano_lessons.rating_count` (integer) - počet hodnocení
  - `piano_lessons.avg_difficulty` (text) - převažující náročnost
  - Podobně pro `piano_songs`, `piano_quiz_chords`, atd.

**UI komponenty:**
- `src/components/rating/StarRating.jsx` - hvězdičky pro hodnocení
- `src/components/rating/DifficultyRating.jsx` - Easy/Medium/Hard buttons
- `src/components/rating/RatingModal.jsx` - modal pro ohodnocení po dokončení
- `src/components/rating/RatingDisplay.jsx` - zobrazení průměrného hodnocení

**Integrace:**
- Po dokončení lekce/písně/kvízu → zobrazit RatingModal
- "Jak byste ohodnotil/a tuto aktivitu?"
- Hvězdičky + náročnost + volitelný komentář
- "Přeskočit" button pro uživatele, kteří nechtějí hodnotit

**Admin Analytics:**
- Dashboard s Top 10 nejoblíbenějších aktivit
- Filter podle typu aktivity
- Zobrazení průměrného ratingu a počtu hodnocení
- Export do CSV

**Design:**
- Hvězdičky: žluté (plné), šedé (prázdné), animace při hover
- Náročnost: zelená (Easy), oranžová (Medium), červená (Hard)
- Tooltip s průměrným hodnocením a počtem uživatelů
- Použít RADIUS, SHADOW konstanty

**RLS Policies:**
- User může vytvořit/upravit pouze své vlastní hodnocení
- User může číst všechna hodnocení (pro zobrazení průměru)
- Admin může číst všechna hodnocení

---

### 2. ⏳ Admin Analytics - Statistiky použití aktivit
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- Kompletní analytics pro admina o využívání aktivit
- Grafy, tabulky, export dat
- Zjistit co uživatelé nejvíc používají
- Identifikovat nepoužívané aktivity (kandidáti na vylepšení/odstranění)

**Features:**

**1. Dashboard "Přehled aktivit":**
- Karta pro každý typ aktivity (Lekce, Písně, Kvízy, Cvičení)
- Celkový počet dokončení
- Průměrné hodnocení
- Top 5 nejpoužívanějších
- Bottom 5 nejméně používaných

**2. Detailní statistiky podle typu:**

**Lekce:**
- Tabulka všech lekcí s:
  - Název lekce
  - Počet dokončení
  - Průměrné hodnocení (hvězdičky)
  - Průměrná náročnost (Easy/Medium/Hard)
  - Poslední použití
  - Akce: Zobrazit detail / Upravit
- Třídění podle:
  - Oblíbenosti (rating DESC)
  - Počtu dokončení (completion_count DESC)
  - Názvu (alphabetical)
  - Náročnosti
  - Data poslední použití

**Písně:**
- Stejná struktura jako lekce
- Navíc: Režim (Procvičovat vs Výzva)
- Perfect rate (kolik % bez chyb)

**Kvízy:**
- Název kvízu / typ
- Počet dokončení
- Průměrné skóre
- Průměrné hodnocení
- Třídění jako výše

**Cvičení:**
- Typ cvičení (Akordy, Stupnice, atd.)
- Počet dokončení
- Průměrné hodnocení
- Třídění jako výše

**3. Grafy a vizualizace:**
- Line chart: Dokončení aktivit v čase (týden/měsíc)
- Bar chart: Top 10 aktivit podle typu
- Pie chart: Rozložení typů aktivit (kolik % lekcí vs písní vs kvízů)
- Heatmap: Aktivita podle dne v týdnu a hodiny

**4. Filtry:**
- Časové období (týden, měsíc, rok, custom range)
- Typ aktivity (všechny, lekce, písně, kvízy)
- Obtížnost (všechny, easy, medium, hard)
- Rating (všechny, 4+, 3+, 2+, 1+)

**5. Export:**
- CSV export pro každou tabulku
- PDF report s grafy
- JSON export pro další zpracování

**Soubory k vytvoření:**
- `src/pages/admin/Analytics.jsx` - hlavní stránka analytics
- `src/components/admin/analytics/ActivityStatsTable.jsx` - tabulka statistik
- `src/components/admin/analytics/TopActivities.jsx` - top aktivit
- `src/components/admin/analytics/ActivityChart.jsx` - grafy
- `src/components/admin/analytics/UsageHeatmap.jsx` - heatmap
- `src/services/analyticsService.js` - API funkce pro data

**Databázové views:**
- `piano_activity_stats` - agregované statistiky aktivit
- JOIN completion tabulek s ratings
- Agregace: COUNT, AVG, MAX, MIN

**SQL příklad:**
```sql
CREATE VIEW piano_lesson_stats AS
SELECT
  pl.id,
  pl.title,
  COUNT(plc.id) as completion_count,
  AVG(pur.rating) as avg_rating,
  COUNT(pur.id) as rating_count,
  MODE() WITHIN GROUP (ORDER BY pur.difficulty_rating) as common_difficulty,
  MAX(plc.completed_at) as last_completed
FROM piano_lessons pl
LEFT JOIN piano_lesson_completions plc ON pl.id = plc.lesson_id
LEFT JOIN piano_user_ratings pur ON pur.activity_type = 'lesson' AND pur.activity_id = pl.id
GROUP BY pl.id, pl.title;
```

**Knihovny:**
- `recharts` - pro grafy
- `react-table` - pro tabulky s třídením
- `date-fns` - pro práci s datumy

**Design:**
- Dashboard layout s kartami
- Tabulky s inline sorting
- Barevné indikátory (zelená: high usage, žlutá: medium, červená: low)
- Export button v každé sekci
- Responsivní (mobile: stacked layout)

**Admin navigace:**
- Přidat "Analytics" do Admin menu
- Ikona: BarChart3 z lucide-react
- Umístění: mezi "Přehled" a "Uživatelé"

---

### 3. ⏳ Metronom
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- Essential nástroj pro cvičení rytmu
- Nastavitelné tempo (BPM) - rozsah 40-200
- Různé rytmy (2/4, 3/4, 4/4, 6/8)
- Vizuální + zvukový feedback
- Accent na první dobu
- Tracking kolikrát cvičili s metronomem → achievement

**Soubory k vytvoření:**
- `src/components/practice/Metronome.jsx` - hlavní komponenta
- `src/utils/metronomeEngine.js` - audio engine pro metronom
- `src/store/useMetronomeStore.js` - Zustand store pro nastavení

**Databáze:**
- `piano_metronome_sessions` - tracking použití metronomu
- Sloupce: user_id, duration_seconds, tempo, time_signature, created_at

**Features:**
- BPM slider (40-200)
- Time signature selector (2/4, 3/4, 4/4, 6/8)
- Start/Stop/Pause
- Tap tempo (klikání pro nastavení tempa)
- Visual metronome (blikající indikátor)
- Volume control
- Subdivision options (quarter notes, eighth notes)

**Design:**
- Použít RADIUS, SHADOW, BORDER konstanty
- Ikony z lucide-react (Play, Pause, Volume2)
- Kruhový vizuál s animací
- Framer Motion pro smooth animace

**Integrace:**
- Přidat do `src/pages/Cviceni.jsx` jako novou sekci
- Floating metronome button pro použití během jiných aktivit
- Achievement: "Rytmický mistr" - 10 hodin s metronomem

---

### 3. ⏳ Denní cvičební rutina
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- Strukturovaný denní plán pro začátečníky
- Doporučená rutina: "10 min škály, 15 min písně, 5 min teorie"
- Tracking času cvičení
- Streak za každodenní cvičení
- Reminder notifications (pokud má povolen notifications)

**Soubory k vytvoření:**
- `src/components/practice/DailyRoutine.jsx` - hlavní komponenta
- `src/components/practice/PracticeTimer.jsx` - timer pro jednotlivé sekce
- `src/store/usePracticeRoutineStore.js` - Zustand store

**Databáze:**
- `piano_practice_sessions` - tracking cvičebních session
- Sloupce: user_id, activity_type, duration_minutes, completed_at
- `piano_daily_routine_completions` - denní completion tracking

**Features:**
- Přednastavené rutiny podle úrovně:
  - Začátečník: 20 min/den
  - Pokročilý: 30 min/den
  - Expert: 45+ min/den
- Vlastní rutina (custom plán)
- Timer s automatickým přechodem mezi sekcemi
- Pause/Resume
- Statistiky: celkový čas za týden/měsíc
- Heatmap kalendář (jako GitHub contributions)
- Achievement: "30denní výzva" - 30 dní v řadě

**Design:**
- Karta s timeline jednotlivých aktivit
- Progress bar pro každou sekci
- Barevné kategorie (škály: modrá, písně: zelená, teorie: fialová)
- Countdown timer s kruhovou animací

---

### 4. ⏳ Nápověda na každé stránce - HelpIcon + HelpPanel
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- Rozšířit help systém na všechny stránky aplikace
- Každá stránka má vlastní kontextovou nápovědu
- Jednotný design (HelpIcon + HelpPanel komponenty)
- Možnost mít zvlášť nápovědu pro uživatele a pro admina

**Soubory k úpravě:**
- Všechny hlavní stránky:
  - `src/pages/UserDashboard.jsx` - nápověda k dashboard
  - `src/pages/Lekce.jsx` - nápověda k lekcím
  - `src/pages/Cviceni.jsx` - nápověda k cvičení
  - `src/pages/TheoryQuizzes.jsx` - nápověda k kvízům
  - `src/pages/History.jsx` - nápověda k historii
  - Admin stránky - zvlášť admin nápověda

**Soubory k vytvoření:**
- `src/data/helpContent.js` - centralizovaný obsah všech nápověd
- `src/data/adminHelpContent.js` - nápověda specifická pro adminy

**Struktura help content:**
```javascript
export const helpContent = {
  dashboard: {
    title: "Dashboard",
    sections: [...]
  },
  lessons: {
    title: "Lekce",
    sections: [...]
  },
  // ...
};
```

**Features:**
- Role-based help (user vs admin)
- Searchable help content (vyhledávání v nápovědě)
- Bookmarks pro často používané části
- "Pomohl vám tento článek?" feedback

---

### 5. ⏳ Centrální nápověda v menu
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- Kompletní nápověda na jednom místě
- Přidat do hlavního menu (vedle Historie)
- Kategorizovaná nápověda: Začátečník, Pokročilý, FAQ, Admin
- Vyhledávání napříč všemi nápovědami

**Soubory k vytvoření:**
- `src/pages/Help.jsx` - stránka s kompletní nápovědou
- `src/components/help/HelpSearch.jsx` - vyhledávání v nápovědě
- `src/components/help/HelpCategory.jsx` - kategorie nápověd
- `src/components/help/HelpArticle.jsx` - jednotlivý článek

**Kategorie:**
1. **Pro začátečníky**
   - Jak začít
   - První lekce
   - Jak používat klaviaturu
   - Co znamenají značky v notách

2. **Pro pokročilé**
   - Harmonizace
   - Kvízy
   - Cvičení stupnic
   - Tracking pokroku

3. **FAQ**
   - Nejčastější dotazy
   - Problémy a řešení

4. **Admin návody** (pouze pro adminy)
   - Jak přidat lekci
   - Jak vytvořit kvíz
   - Správa uživatelů

**Design:**
- Sidebar s kategoriemi
- Main content s články
- Breadcrumb navigace
- Related articles
- Contact support button

---

### 6. ⏳ Dokončit refaktoring TabButtons
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- Zkontrolovat re-exporty v TabButtons.jsx
- Ověřit, že všechny komponenty používají správné importy
- Zajistit konzistenci napříč celou aplikací

**Soubory k ověření:**
- `src/components/ui/TabButtons.jsx` - centrální export hub
- `src/components/ui/ButtonComponents.jsx`
- `src/components/ui/CardComponents.jsx`
- `src/components/ui/FormComponents.jsx`
- `src/components/ui/PageSection.jsx`

---

### 3. ⏳ Paginace pro dlouhé seznamy
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- Využít modularitu UI komponent
- Vytvořit univerzální Pagination komponentu
- Přidat do všech admin seznamů (kvízy, písničky, lekce, achievementy)
- Server-side pagination (limit/offset) pro velké datasety

**Kde implementovat:**
- QuizManager - seznam kvízů
- SongLibrary - seznam písní
- LessonList - seznam lekcí
- AchievementManager - seznam achievementů
- UserList - seznam uživatelů

**Soubory k vytvoření:**
- `src/components/ui/Pagination.jsx` - univerzální komponenta
- Props: `currentPage`, `totalPages`, `onPageChange`, `pageSize`

**Design:**
- Použít RADIUS, SHADOW konstanty
- Tlačítka: Previous, 1, 2, 3, ..., Next
- Zobrazit "Showing X-Y of Z items"
- Responsive (mobile: jen Previous/Next)

---

### 4. ⏳ Free/Premium obsah v admin panelu
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- Možnost označit lekce, cvičení, kvízy, materiály jako:
  - **Free** - dostupné pro všechny
  - **Premium** - dostupné po zaplacení a registraci
- Filtrování v uživatelském rozhraní podle subscription statusu

**Databázové změny:**
- Přidat sloupec `access_level` do tabulek:
  - `piano_lessons` - ENUM('free', 'premium')
  - `piano_quiz_chords` - ENUM('free', 'premium')
  - `piano_songs` - ENUM('free', 'premium')
  - `piano_theory_materials` - ENUM('free', 'premium')

**Admin UI:**
- Přidat checkbox nebo select "Přístup" v každém formuláři
- Ikona 🔓 Free / 🔒 Premium v seznamech

**User tabulka:**
- `piano_users.subscription_status` - ENUM('free', 'premium')
- `piano_users.subscription_expires_at` - TIMESTAMP

**Frontend filtrace:**
- Zobrazit pouze free obsah pro free uživatele
- Zobrazit vše pro premium uživatele
- Tlačítko "Upgrade na Premium" pro locked obsah

---

### 5. ⏳ Drag & Drop pro pořadí otázek v admin panelu
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- Nahradit manuální pole `display_order` drag & drop funkcionalitou
- Uživatel může přetahovat otázky/písničky/lekce pro změnu pořadí
- Automatické přečíslování `display_order` po přetažení

**Knihovna:**
- `@dnd-kit/core` + `@dnd-kit/sortable` (moderní, lightweight)
- Nebo `react-beautiful-dnd` (starší, ale stabilní)

**Kde implementovat:**
- QuizManager - přetahování kvízů
- SongLibrary - přetahování písní
- LessonList - přetahování lekcí
- AchievementManager - přetahování achievementů

**Soubory:**
- `src/components/ui/DraggableList.jsx` - univerzální komponenta
- `src/components/ui/DraggableItem.jsx` - jednotlivá položka

**Design:**
- Ikona ⋮⋮⋮ (grip-vertical z lucide-react) pro uchopení
- Hover efekt při přetahování
- Placeholder při přesunu
- Smooth animace

---

### 6. ⏳ Zobrazit teoretické otázky pro akordy v UI
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- V sekci Teorie → Kvízy → Akordy zobrazit teoretické otázky pro akordy
- Filtrace teoretických otázek podle `quiz_type = 'chord'` a `questionText IS NOT NULL`
- Zobrazení v TheoryQuizHub nebo samostatné komponentě
- Oddělení od poslechového kvízu (ChordQuiz) a obecných teoretických otázek

**Soubory k úpravě:**
- `src/pages/Teorie.jsx` nebo `src/components/theory/TheoryQuizHub.jsx`
- Přidat filtraci pro teoretické otázky typu "chord"
- UI pro zobrazení a hraní těchto otázek

**Poznámka:** Teoretické otázky pro akordy jsou uložené v `piano_quiz_chords` s vyplněným `questionText` a možnostmi v `piano_quiz_chord_options`.

---

## 🔥 Priorita 3 - Střední (Nice to have)

### 7. ⏳ Breadcrumb navigace
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Drobečková navigace pro lepší orientaci v aplikaci
- Moderní design v souladu s aplikací
- Zobrazit aktuální cestu: Home → Teorie → Kvízy → Akordy

**Soubory k vytvoření:**
- `src/components/ui/Breadcrumb.jsx` - komponenta
- `src/hooks/useBreadcrumbs.js` - hook pro automatické generování

**Design:**
- Použít RADIUS konstanty
- Separator: `/` nebo `>` nebo ikona (ChevronRight)
- Poslední položka: bold, neaktivní
- Předchozí: klikací, navigace zpět

**Použití:**
```jsx
<Breadcrumb
  items={[
    { label: 'Home', to: '/' },
    { label: 'Teorie', to: '/teorie' },
    { label: 'Kvízy', to: '/teorie/kvízy' },
    { label: 'Akordy' } // aktivní, bez "to"
  ]}
/>
```

---

### 8. ⏳ Škály a technická cvičení
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Strukturované cvičení stupnic pro rozvoj techniky
- Gamifikace: "Zahraj škálu C dur 5x bez chyby"
- Různé varianty (legato, staccato, různá tempa)
- Tracking které škály už umí
- Prstoklady (fingering) zobrazené u každé noty

**Typy stupnic:**
- Durové stupnice (C, D, E, F, G, A, H)
- Mollové stupnice (a, d, e, g, h)
- Chromatická stupnice
- Arpeggia (rozložené akordy)

**Soubory k vytvoření:**
- `src/components/practice/ScalePractice.jsx` - hlavní komponenta
- `src/components/practice/FingeringDisplay.jsx` - zobrazení prstokladů
- `src/data/scales.js` - definice stupnic s fingering
- Přidat do `src/pages/Cviceni.jsx`

**Databáze:**
- `piano_scales` - tabulka s definicemi stupnic
  - Sloupce: id, name, notes (JSON), fingering (JSON), difficulty, type
- `piano_scale_completions` - historie procvičování
  - Sloupce: user_id, scale_id, mistakes_count, tempo, completed_at

**Features:**
- Metronom integrace
- Tempo adjustment (slow, medium, fast)
- Visualization: čísla prstů (1-5) nad notami
- Challenge mode: bez prstokladů
- Practice mode: s prstoklady
- Achievement: "Mistr stupnic" - všechny stupnice perfektně

**Design:**
- Barevné kódování prstů (např. palec = modrá, ukazovák = zelená)
- Animace postupu (zleva doprava)
- Progress tracking per scale

---

### 9. ⏳ Notová osnova - čtení not
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Mini-hra na trénink čtení not z notové osnovy
- "Která nota je to na osnově?" - zobrazí notu, user klikne na klavír
- Violinový (G klíč) i basový klíč (F klíč)
- Gamifikace čtení not - score, streak, time limit
- Postupné odemykání (začít s C-G, pak přidat H/Fis atd.)

**Soubory k vytvoření:**
- `src/components/games/NoteReadingGame.jsx` - hlavní hra
- `src/components/music/StaffNotation.jsx` - komponenta notové osnovy
- `src/utils/musicNotation.js` - helper funkce pro notový zápis

**Databáze:**
- `piano_note_reading_scores` - tracking progress
- Sloupce: user_id, clef_type, notes_correct, notes_total, avg_time, completed_at

**Features:**
- Dva režimy:
  - Treble clef (violinový klíč) - pravá ruka
  - Bass clef (basový klíč) - levá ruka
- Difficulty levels:
  - Easy: C-G (bez předznamenání)
  - Medium: C-C (oktáva, s křížky/béčky)
  - Hard: 2 oktávy
- Timer: kolik sekund na notu
- Streak counter
- Leaderboard
- Achievement: "Notový mistr" - 100 not správně

**Design:**
- SVG notová osnova (canvas nebo react-music)
- Animace noty při správné/špatné odpovědi
- Sound feedback
- Score display v rohu

---

### 10. ⏳ Rytmická cvičení
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Trénink rytmu bez hraní not
- Tleskání/tapping rytmů
- Rozpoznávání notových hodnot (celá, půlová, čtvrťová, osminová)
- Quiz na rytmy - "Jaká je hodnota této noty?"
- Rytmické diktáty - slyš rytmus, zopakuj ho

**Soubory k vytvoření:**
- `src/components/games/RhythmTraining.jsx` - hlavní komponenta
- `src/components/games/RhythmDictation.jsx` - rytmické diktáty
- `src/utils/rhythmEngine.js` - přehrávání rytmů

**Databáze:**
- `piano_rhythm_scores` - tracking progress
- Sloupce: user_id, exercise_type, score, completed_at

**Features:**
- Rytmické vzory:
  - Základní: celá, půlová, čtvrťová
  - Pokročilé: osminové, tečkované noty, trioly
- Tap game: klikej podle rytmu
- Rhythm dictation: slyš → zopakuj
- Visual metronome během cvičení
- Různé time signatures (2/4, 3/4, 4/4, 6/8)

**Design:**
- Vizuální reprezentace rytmu (obdélníky různých délek)
- Animace při tapping
- Score a accuracy feedback

---

### 11. ⏳ Repertoár - "Co umím zahrát"
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Seznam písní které už perfektně umí
- Možnost označit jako:
  - 🎵 "Zatím se učím"
  - ✅ "Umím zahrát"
  - ⭐ "Perfektně ovládám"
- Sharing s kamarády (pokud implementujeme social features)
- Export repertoáru do PDF

**Soubory k vytvoření:**
- `src/components/repertoire/RepertoireManager.jsx` - správa repertoáru
- `src/components/repertoire/RepertoireCard.jsx` - karta písně
- `src/pages/Repertoire.jsx` - samostatná stránka

**Databáze:**
- Přidat sloupec do `piano_song_completions`:
  - `mastery_level` - ENUM('learning', 'can_play', 'mastered')
- `piano_repertoire_items` - custom user repertoár
  - Sloupce: user_id, title, composer, mastery_level, last_practiced, notes

**Features:**
- Filtrování podle mastery level
- Sorting podle data, abecedy, obtížnosti
- "Kdy jsem naposledy hrál?" - reminder
- Statistics: kolik písní v každé kategorii
- Achievement: "Velký repertoár" - 50 písní na úrovni "Umím"

**Design:**
- Grid nebo seznam s kartami
- Barevné kódování podle mastery (šedá, žlutá, zelená)
- Progress bar: učící se → umím → perfektní

---

### 12. ⏳ Progress tracking & vizualizace
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Graf pokroku v čase
- "Před měsícem jsi udělal X lekcí, teď Y"
- Milníky: "První píseň!", "10 lekcí dokončeno!", "Level 5!"
- Heatmap aktivity (jako GitHub contributions)
- Porovnání s minulým týdnem/měsícem

**Soubory k vytvoření:**
- `src/components/stats/ProgressChart.jsx` - grafy
- `src/components/stats/Heatmap.jsx` - heatmap kalendář
- `src/components/stats/Milestones.jsx` - milníky
- `src/pages/Progress.jsx` - samostatná stránka pro pokrok

**Knihovny:**
- `recharts` - pro grafy
- `react-calendar-heatmap` - pro heatmap

**Features:**
- Line chart: XP v čase
- Bar chart: aktivity za týden
- Heatmap: dny kdy praktikoval
- Milestones timeline
- Comparison: tento týden vs minulý týden
- Export dat do CSV/JSON

**Design:**
- Moderní dashboard s kartami
- Barevné grafy (modrá pro XP, zelená pro písně)
- Tooltip s detaily při hover
- Responsive (na mobilu stacked layout)

---

### 13. ⏳ Audio ukázky písní
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Možnost poslechnout si, jak má píseň znít
- Zpomalené přehrávání (50%, 75%, 100%)
- Loop sekce písně
- Přehrávání s vizuálním highlightem not

**Soubory k vytvoření:**
- `src/components/audio/AudioPlayer.jsx` - audio přehrávač
- `src/components/audio/SpeedControl.jsx` - control rychlosti
- `src/utils/audioProcessor.js` - zpracování audio (tempo change)

**Databáze:**
- Přidat sloupec do `piano_songs`:
  - `audio_url` - URL k audio souboru (Supabase Storage)
  - `audio_duration` - délka v sekundách

**Features:**
- Upload audio v admin panelu
- Playback speed control (0.5x, 0.75x, 1x, 1.25x)
- Loop mode
- A-B repeat (označit sekci a opakovat)
- Waveform visualization
- Sync s notami (highlight aktuální nota)

**Knihovny:**
- `howler.js` - audio playback
- `wavesurfer.js` - waveform viz
- Web Audio API pro tempo change bez pitch change

**Design:**
- Moderní audio player pod písní
- Waveform s progress
- Speed dropdown
- Loop button

---

### 14. ⏳ PageComponent - Vyhledávání a řazení
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Přidat vyhledávání do PageComponent (hledat v položkách)
- Přidat možnost řazení podle názvu, obtížnosti, data
- Použitelné na všech stránkách kde je seznam (lekce, písně, kvízy)
- Responsive design (desktop: dropdown, mobile: bottom sheet)

**Soubory k úpravě:**
- `src/components/ui/PageSection.jsx` - přidat search + sort komponenty
- `src/components/ui/SearchBar.jsx` - nová komponenta pro vyhledávání
- `src/components/ui/SortDropdown.jsx` - nová komponenta pro řazení

**Features:**
- **Vyhledávání:**
  - Real-time search (filtruje během psaní)
  - Search v názvu, popisu, kategoriích
  - Clear button
  - Highlight matched text

- **Řazení:**
  - Podle názvu (A-Z, Z-A)
  - Podle obtížnosti (Easy → Hard, Hard → Easy)
  - Podle data (Nejnovější, Nejstarší)
  - Podle popularity (nejvíc hraných)

**Props pro PageComponent:**
```javascript
<PageSection
  searchable={true}
  searchFields={['title', 'description']}
  sortable={true}
  sortOptions={[
    { value: 'title-asc', label: 'Název (A-Z)' },
    { value: 'difficulty-asc', label: 'Obtížnost' },
    { value: 'date-desc', label: 'Nejnovější' }
  ]}
/>
```

**Design:**
- Search bar: ikona Search z lucide-react
- Sort dropdown: ikona ArrowUpDown
- Compact layout: search + sort v jednom řádku
- Mobile: search full-width, sort jako bottom drawer

---

### 15. ⏳ Notová osnova pod klaviaturou
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Zobrazit noty v notové osnově pod klaviaturou
- Real-time: zobrazuje aktuální notu během hraní
- Postupné zobrazování not podle postupu ve skladbě
- Podporuje violinový i basový klíč

**Soubory k vytvoření:**
- `src/components/music/StaffNotation.jsx` - komponenta notové osnovy
- `src/components/music/NoteRenderer.jsx` - vykreslení not na osnově
- `src/utils/musicNotation.js` - helper funkce (note → staff position)

**Integrace:**
- `src/components/lessons/PianoKeyboard.jsx` - přidat StaffNotation component
- `src/pages/Cviceni.jsx` - zobrazit noty během procvičování
- `src/components/resources/SongLibrary.jsx` - zobrazit při hraní písní

**Features:**
- SVG notová osnova (5 linek)
- Automatic clef selection (violinový pro vysoké noty, basový pro nízké)
- Highlight aktuální nota (barevně odlišená)
- Show next notes (předpověď dalších 2-3 not)
- Animation při přechodu na další notu

**Knihovny:**
- `vexflow` - profesionální music notation rendering
- Nebo vlastní SVG implementace (lightweight)

**Design:**
- Kompaktní: max 80px výška
- Pod klaviaturou, nad notami/text
- Smooth scroll při postupu
- Barevné kódování (aktuální nota: modrá, příští: šedá)

---

### 16. ⏳ Lepší zvuk pro klavír
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Nahradit současné kovové tóny kvalitnějšími samply
- Přidat možnost "legato" (svázat tóny při přehrávání)
- Různé piano sounds (grand piano, upright, electric)
- Volume envelope (attack, decay, sustain, release)

**Soubory k úpravě:**
- `src/utils/audio.js` - audioEngine rozšíření
- Nový `src/utils/audioSamples.js` - správa audio samples

**Audio samply:**
- Zdroje kvalitních samples:
  - Freesound.org - CC licensed piano samples
  - Piano in 162 (open source piano samples)
  - Salamander Grand Piano (open source)
- Formát: MP3/OGG (komprese) nebo WAV (kvalita)
- Uložení: Supabase Storage nebo CDN

**Features:**
- **Legato mode:**
  - Overlap notes (plynulé přechody)
  - Crossfade mezi tóny
  - Toggle button v UI

- **Piano sounds:**
  - Grand Piano (výchozí)
  - Upright Piano
  - Electric Piano
  - Selector v settings

- **ADSR envelope:**
  - Attack: jak rychle začne znít
  - Decay: pokles po začátku
  - Sustain: úroveň při držení
  - Release: jak rychle zmizí po uvolnění

**Implementace:**
- Web Audio API (AudioContext, GainNode)
- Preload samples při startu aplikace
- Audio sprite pro optimalizaci (všechny tóny v jednom souboru)

---

### 17. ⏳ SEO pro Landing Page
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Optimalizace Home page pro vyhledávače
- Meta tags, Open Graph, Twitter Cards
- Schema.org markup
- Sitemap.xml a robots.txt

**Soubory k vytvoření:**
- `public/sitemap.xml` - sitemap
- `public/robots.txt` - robots
- `src/components/seo/SEOHead.jsx` - meta tags komponenta

**Meta tags:**
```html
<meta name="description" content="Naučte se hrát na klavír online...">
<meta name="keywords" content="klavír, výuka, online, kurz">
<meta property="og:title" content="Piano Learning App">
<meta property="og:image" content="/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
```

**Schema.org:**
```json
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Piano Learning App",
  "description": "...",
  "url": "https://..."
}
```

**Optimalizace:**
- Semantic HTML (h1, h2, nav, main, footer)
- Image alt texts
- Internal linking
- Performance optimization (lazy loading, compression)

---

### 18. ⏳ Marketing - Sběr kontaktů
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Propojení s email marketing platformami
- Formuláře pro sběr kontaktů (newsletter, early access)
- Integrace s CRM systémy

**Platformy:**
- **SmartEmailing** - český email marketing
- **MailerLite** - zahraniční alternativa
- **EcoMail** - český CRM + email marketing

**Soubory k vytvoření:**
- `src/components/marketing/NewsletterForm.jsx` - formulář
- `src/services/emailMarketing.js` - API integrace
- `src/pages/Landing.jsx` - landing page s formulářem

**Features:**
- Newsletter signup (email + jméno)
- Early access registration
- Popup při opuštění stránky (exit intent)
- Thank you page po registraci
- Automatické emaily (welcome email)

**API integrace:**
```javascript
// SmartEmailing API
const addContact = async (email, name) => {
  await fetch('https://app.smartemailing.cz/api/v3/import', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      emailaddress: email,
      name: name
    })
  });
};
```

**GDPR compliance:**
- Checkbox pro souhlas
- Odkaz na privacy policy
- Možnost odhlásit se

---

### 19. ⏳ Kompletní dokumentace
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Kompletní developer dokumentace po dokončení projektu
- User manual pro end-users
- Admin manual pro správce

**Dokumenty k vytvoření:**
- `SYSTEM_ARCHITECTURE.md` - architektura aplikace
- `DATABASE_SCHEMA.md` - databázové schéma
- `API_DOCUMENTATION.md` - Supabase API calls
- `COMPONENT_LIBRARY.md` - UI komponenty
- `DEPLOYMENT_GUIDE.md` - nasazení do produkce
- `USER_MANUAL.md` - návod pro uživatele
- `ADMIN_MANUAL.md` - návod pro adminy

**Obsah SYSTEM_ARCHITECTURE:**
- Tech stack overview
- Folder structure
- State management (Zustand stores)
- Routing structure
- Authentication flow
- Component hierarchy

**Obsah USER_MANUAL:**
- Jak začít
- Registrace a přihlášení
- Procházení lekcí
- Hraní písní
- Kvízy a cvičení
- Tracking pokroku
- FAQ

**Obsah ADMIN_MANUAL:**
- Přidání lekce
- Vytvoření kvízu
- Správa písní
- Nastavení gamifikace
- Export dat
- Správa uživatelů

---

---

## 🔥 Priorita 4 - Nízká (Budoucí features)

### 14. ⏳ Videonávody k lekcím
**Status:** Pending
**Priorita:** 🔵 Nízká

**Popis:**
- Krátká videa (1-3 min) ukazující správnou techniku
- Tipy od "učitele" nebo virtuálního asistenta
- Embedding YouTube nebo Vimeo videí
- Nebo vlastní video hosting v Supabase Storage

**Soubory k vytvoření:**
- `src/components/video/VideoPlayer.jsx` - video přehrávač
- `src/components/lessons/LessonVideo.jsx` - integrace do lekcí

**Databáze:**
- Přidat sloupec do `piano_lessons`:
  - `video_url` - URL k video souboru
  - `video_provider` - ENUM('youtube', 'vimeo', 'supabase')
  - `video_duration` - délka v sekundách

**Features:**
- Embed YouTube/Vimeo s YouTube IFrame API
- Vlastní upload video do Supabase Storage
- Video progress tracking (sledovat, kolik procent shlédli)
- Playback controls
- Fullscreen mode
- Captions/subtitles support

**Design:**
- Moderní video player
- Thumbnail preview
- Play overlay button
- Progress bar

---

### 15. ⏳ Skladatel - skládání melodií
**Status:** Pending
**Priorita:** 🔵 Nízká

**Popis:**
- Možnost skládat jednoduché melodie (note by note)
- Přidávat akordy, které se k melodii hodí
- Uložit a sdílet kompozice
- Přehrát s metronomen

**Soubory k vytvoření:**
- `src/components/composer/Composer.jsx` - hlavní komponenta
- `src/components/composer/MelodyEditor.jsx` - editace melodie
- `src/components/composer/ChordSuggestions.jsx` - návrhy akordů
- `src/components/composer/Playback.jsx` - přehrávání

**Databáze:**
- `piano_compositions` - uložené skladby
- Sloupce: user_id, title, melody (JSON), chords (JSON), tempo, created_at

**Features:**
- Piano roll editor (vizuální editor not)
- Chord suggestions based on melody (AI?)
- Export to MIDI
- Share link

---

### 12. ⏳ Offline režim (PWA)
**Status:** Pending
**Priorita:** 🔵 Nízká

**Popis:**
- Možnost používat apku offline
- Service Worker pro caching
- Progressive Web App (PWA) manifest
- Sync při obnovení připojení

**Implementace:**
- `public/manifest.json` - PWA manifest
- `public/sw.js` - Service Worker
- `src/utils/offline.js` - offline strategie

**Co cache-ovat:**
- Static assets (CSS, JS, fonts, images)
- API responses (kvízy, písničky, lekce)
- User progress (sync při online)

**Knihovny:**
- Workbox (Google) - pro snadnou konfiguraci SW
- localForage - IndexedDB storage

**Poznámka:** Vyžaduje HTTPS a Vite PWA plugin

---

### 13. ⏳ Vytvořit front-end komponentu pro teoretický kvíz
**Status:** Pending
**Priorita:** 🔵 Nízká (UniversalTheoryQuiz už existuje?)

**Popis:**
- Kvíz pro hraní teoretických otázek (bez klaviatury)
- Podobný ChordQuiz, ale textové otázky
- Multiple choice s 4 možnostmi

**Soubory:**
- `src/components/games/UniversalTheoryQuiz.jsx` - už existuje, ověřit funkčnost
- Přidat do `src/pages/Cviceni.jsx` jako nový typ cvičení (pokud není)

---

### 14. ⏳ Opravit duplikaci lekcí - chybějící duration column
**Status:** Pending
**Priorita:** 🔵 Nízká

**Popis:**
- Při duplikaci lekcí chybí sloupec `duration`
- Přidat sloupec do databáze
- Opravit funkci duplikace v admin panelu

**Soubory k úpravě:**
- Databázová migrace pro přidání `duration` sloupce
- `src/components/lessons/LessonModal.jsx` - opravit duplikaci

---

### 15. ⏳ Vytvořit RLS policy pro piano_song_completions INSERT
**Status:** Pending
**Priorita:** 🔵 Nízká

**Popis:**
- Uživatelé nemůžou ukládat dokončení písní
- Chybí RLS policy pro INSERT operaci

**Soubory k úpravě:**
- SQL migrace v Supabase pro přidání policy

---

## 📚 Dokumentace k vytvoření

### Priorita 1: Systémová dokumentace
- [ ] `SYSTEM_ARCHITECTURE.md` - celková architektura aplikace
- [ ] `DATABASE_SCHEMA.md` - popis databázových tabulek a vztahů
- [ ] `API_ENDPOINTS.md` - popis všech Supabase dotazů a RLS policies

### Priorita 2: Vývojářská dokumentace
- [ ] `DEVELOPMENT_GUIDE.md` - návod pro vývojáře
- [ ] `COMPONENT_STRUCTURE.md` - struktura React komponent
- [ ] `STATE_MANAGEMENT.md` - popis Zustand store

### Priorita 3: Uživatelská dokumentace
- [ ] `USER_MANUAL.md` - manuál pro uživatele
- [ ] `ADMIN_MANUAL.md` - manuál pro administrátory

---

## 🎯 Best Practices & Code Quality

### Každá nová feature musí projít quality check:

**1. Funkčnost**
- ✅ Všechny features fungují podle specifikace
- ✅ Testováno na desktop i mobile
- ✅ Cross-browser kompatibilita (Chrome, Firefox, Safari)

**2. Duplicita v kódu**
- ✅ DRY princip (Don't Repeat Yourself)
- ✅ Znovupoužitelné komponenty
- ✅ Sdílené utility funkce

**3. Logy a debugy**
- ✅ Odstranit všechny `console.log()` debug zprávy
- ✅ Použít `console.error()` pouze pro kritické chyby
- ✅ Implementovat proper error handling

**4. Komentáře**
- ✅ Odstranit zakomentovaný kód
- ✅ Odstranit TODO komentáře (přesunout do MASTER_TODO)
- ✅ Ponechat jen JSDoc dokumentaci a vysvětlující komentáře

**5. Modularita**
- ✅ Každá nová komponenta musí být modulární
- ✅ Props dokumentace v JSDoc
- ✅ Použití centralizovaných konstant (RADIUS, SHADOW, BORDER)
- ✅ Konzistentní import struktura

**6. Performance**
- ✅ Lazy loading pro velké komponenty
- ✅ Memoizace pro expensive operace
- ✅ Optimalizované obrázky
- ✅ Code splitting

**7. Accessibility**
- ✅ ARIA labels pro interaktivní prvky
- ✅ Keyboard navigation
- ✅ Correct semantic HTML
- ✅ Contrast ratio (WCAG AA)

**8. Security**
- ✅ RLS policies v Supabase
- ✅ Input validation
- ✅ XSS protection
- ✅ CSRF tokens (pokud potřeba)

---

## 🐛 Známé problémy (Backlog)

1. **Historie aktivit** - chybějící sloupec user_id
2. **Song completions RLS** - chybějící policy pro INSERT
3. **Lesson duplication** - chybějící duration column

---

## 🎯 Budoucí vylepšení (Icebox)

1. **MIDI podpora** - přehrávání pomocí MIDI klávesnice
2. **Audio nahrávání** - nahrávání vlastního hraní
3. **Multiplayer režim** - hraní s přáteli
4. **Export/Import** - zálohování pokroku uživatele
5. **Responsivita audit** - kompletní audit mobile UX
6. **Unit testy** - Jest + React Testing Library
7. **E2E testy** - Playwright nebo Cypress
8. **SEO optimalizace** - meta tags, sitemap, robots.txt
9. **Analytics** - Google Analytics nebo Plausible
10. **Performance monitoring** - Sentry nebo LogRocket

---

## ✅ Nedávno dokončené úkoly

### Card Component Modularizace + Glass Effect Fix (3.12.2025)
**Dokončeno:** ✅
**Popis:** Kompletní modularizace CardComponents, fix glass effect artifacts, standardizace glassmorphism hodnot

**Změny:**
- ✅ **EditFormContainer.jsx - Fix corner artifacts:**
  - Opraveny viditelné rohy glass efektu
  - Root cause: Dvojité `overflow: 'hidden'` způsobovalo artifacts
  - Řešení: Odstranění overflow z motion.div wrapperu
  - Refaktorováno na použití Card komponenty místo inline stylů

- ✅ **Card Component - Přidán `as` prop:**
  - Polymorfní komponenta podporující motion.div a další elementy
  - Props: opacity, blur, radius, shadow, as
  - Umožňuje: `<Card as={motion.div} initial={...} animate={...} />`

- ✅ **CardComponents.jsx - Kompletní refaktoring:**
  - PageCard refaktorován na Card wrapper (-2 řádky duplicitního kódu)
  - QuestionCard refaktorován na Card wrapper
  - ItemCard refaktorován na Card wrapper (s motion.div)
  - StatCard icon container refaktorován na Card wrapper
  - Eliminace všech duplikací glassmorphism kódu

- ✅ **GlassCard.jsx - Odstranění:**
  - Duplicitní komponenta, méně flexibilní než Card
  - Používána pouze v LessonList.jsx (1 místo)
  - Nahrazena Card komponentou a smazána
  - LessonList.jsx: GlassCard → Card

- ✅ **Standardizace glassmorphism hodnot:**
  - **blur: 30px** (standard pro všechny card komponenty)
  - **opacity: 0.8** (standard pro všechny card komponenty)
  - Výjimky: StatCard icon (blur="10px", opacity={0.95}), EditFormContainer (opacity={0.4})

**Soubory:**
- `src/components/ui/EditFormContainer.jsx` (fix + refactored)
- `src/components/ui/CardComponents.jsx` (přidán `as` prop, refactoring)
- `src/components/lessons/LessonList.jsx` (nahrazeno GlassCard)
- `src/components/ui/GlassCard.jsx` (SMAZÁN)
- `SESSION_CONTEXT-20251203-card-modularization.md` (nová dokumentace)

**Benefity:**
- Single source of truth pro glassmorphism efekty
- Eliminace duplicitního kódu
- Konzistentní blur/opacity hodnoty napříč aplikací
- Flexibilní Card komponenta s `as` prop pro motion.div
- Menší bundle size (odstranění GlassCard)
- Snadnější maintenance (změna v Card = změna všude)

**Architektonická vylepšení:**
- Modularita: Všechny komponenty používají Card jako wrapper
- Flexibilita: Props lze přepisovat per usage
- Konzistence: Standardizované hodnoty napříč aplikací
- DRY principle: Žádné duplikáty glassmorphism kódu

---

### Leaderboard Refactoring + Admin Table (2.12.2025 večer)
**Dokončeno:** ✅
**Popis:** Kompletní refaktoring Leaderboard komponenty a vytvoření admin table verze

**Změny:**
- ✅ **Leaderboard.jsx font style refactoring:**
  - Konverze inline font styles na utilities.css třídy
  - Oprava `fontWeight: 'bold'` → `fontWeight: 700` (číselná hodnota)
  - Aplikace .text-xs, .text-sm, .text-base, .font-medium, .font-semibold tříd
  - Změna "Vaše pozice" chip na variant="primary" bez shadow
  - Stat chips změněny na nový variant="light"

- ✅ **Nový Chip variant - "light":**
  - Background: `rgba(45, 91, 120, 0.1)`
  - Bez borderu, bez stínu
  - Použití pro stat badges (Lekce, Kvízy, Písně, Cíle)

- ✅ **LeaderboardTable.jsx - nový admin komponent:**
  - Kompaktní tabulková verze pro admin panel
  - Pagination: 50 uživatelů na stránku
  - Responzivní: 3 breakpointy (<480px, 480-640px, >640px)
  - Minimální padding (0.5rem), žádné ikony
  - Email sloupec skrytý pod 480px
  - Stats sloupce skryté na mobile (≤640px)
  - Integrace do StatisticsOverview.jsx

- ✅ **STYLE_CHECKLIST.md aktualizace:**
  - Přidána kompletní sekce pro fonty (lines 143-213)
  - Návod na utilities.css třídy
  - Příklady správného/špatného použití
  - Kontrolní postup pro font style audit

- ✅ **Rozhodnutí o architektuře:**
  - Separate LeaderboardTable component (Composition over Configuration)
  - Leaderboard.jsx: Card-based view (TOP 10, visual emphasis)
  - LeaderboardTable.jsx: Table view (all users, data density)

**Soubory:**
- `src/components/dashboard/Leaderboard.jsx` (393 řádků, refactored)
- `src/components/ui/ButtonComponents.jsx` (nový variant "light")
- `src/components/admin/LeaderboardTable.jsx` (444 řádků, nový soubor)
- `src/components/admin/overview/StatisticsOverview.jsx` (integrace)
- `STYLE_CHECKLIST.md` (aktualizováno)
- `LEADERBOARD_CHECKLIST.md` (označeno jako hotové)

**Benefity:**
- Konzistentní font styles napříč komponentou
- Admin může vidět všechny uživatele s paginací
- Responzivní design pro 3 velikosti obrazovky
- Dokumentované font guidelines pro budoucí komponenty
- Znovupoužitelný "light" Chip variant

**Dokumentace:**
- `SESSION_CONTEXT-20251202-leaderboard.md` (nový soubor)

---

### Database View pro Admin Historie - user_activities (2.12.2025)
**Dokončeno:** ✅
**Popis:** Vytvoření SQL view pro sjednocení všech aktivit uživatelů do jednoho pohledu

**Změny:**
- ✅ **Vytvoření piano.user_activities view:**
  - Agregace 10 completion tabulek do jednoho view
  - Automatické joiny s piano_users
  - Jednotný formát dat (id, type, title, subtitle, date, xp, icon, user info)

- ✅ **Zahrnuté tabulky:**
  1. `piano_song_completions` - písně (100 XP default, subtitle: perfektní/chyby)
  2. `piano_quiz_scores` - obecné kvízy (score × 5 XP)
  3. `piano_quiz_completions` - starý chord quiz (má xp_earned)
  4. `piano_quiz_interval_completions` - Kvíz: Intervaly (10 XP pokud správně)
  5. `piano_quiz_mixed_completions` - Kvíz: Mix (10 XP pokud správně)
  6. `piano_quiz_rhythm_completions` - Kvíz: Rytmus (10 XP pokud správně)
  7. `piano_quiz_scale_completions` - Kvíz: Stupnice (10 XP pokud správně)
  8. `piano_quiz_theory_completions` - Kvíz: Teorie (10 XP pokud správně)
  9. `piano_lesson_completions` - lekce (má xp_earned)
  10. `piano_daily_goal_completions` - denní cíle (má xp_earned)

- ✅ **Zjednodušení activityService.js:**
  - getAllUsersActivities: 150 řádků → 50 řádků (-66%)
  - Místo 5 dotazů + složitá logika → 1 jednoduchý dotaz
  - Automatická transformace dat z view

- ✅ **Admin Historie funkční:**
  - Admin → Přehledy → Uživatelé → Historie
  - Zobrazení všech typů aktivit
  - Vyhledávání v historii
  - Konzole logging pro debug

**Problém řešený:**
- Původní dotazy selhávaly kvůli chybějícím foreign key vztahům
- View používá explicitní joiny místo Supabase auto-joins
- Workaround: načíst všechny users do Map a přiřadit ručně

**Soubory:**
- `migrations/create_user_activities_view.sql` (242 řádků, nový soubor)
- `src/services/activityService.js` (getAllUsersActivities refactored)
- `src/components/admin/overview/UsersOverview.jsx` (používá novou funkci)

**SQL view features:**
- Řazení podle data (DESC)
- Unifikované sloupce pro všechny typy aktivit
- XP výpočty podle typu aktivity
- Subtitle s kontextovými informacemi (score, chyby, atd.)
- Grant SELECT pro authenticated users

**Benefity:**
- Admin vidí kompletní přehled aktivit všech uživatelů
- Jednoduchá údržba (1 view místo 10 dotazů)
- Připraveno pro budoucí analytics
- Rychlejší dotazy díky database-level agregaci

**Účel:**
- Admin může analyzovat, co uživatelé nejvíc používají
- Podklad pro budoucí User Rating System
- Podklad pro budoucí Admin Analytics Dashboard

---

### Refaktoring Help dokumentace - Modularizace nápovědy (29.11.2025)
**Dokončeno:** ✅
**Popis:** Sjednocení help systému napříč aplikací, odstranění duplicitní accordion nápovědy z NoteComposer

**Změny:**
- ✅ **Přidání modularní help nápovědy do SongLibrary:**
  - Import a použití HelpButton + HelpPanel komponent
  - Nový state `showNoteFormatHelp`
  - Help umístěný pod pole "Název písně" v obou formulářích (new song + edit song)
  - Znovu použitá komponenta NoteFormatHelpContent s novým HelpPanel systémem

- ✅ **Odstranění staré accordion nápovědy z NoteComposer:**
  - Odstranění celé sekce s ikonou knihy 📖 (251 řádků kódu)
  - Vyčištěné unused importy (BookOpen, ChevronUp, ChevronDown, AnimatePresence)
  - Vyčištěný unused state (showHelp)
  - NoteComposer je nyní jednodušší a má jen jednu odpovědnost (interaktivní zadávání not)

**Soubory:**
- `src/components/resources/SongLibrary.jsx` (+32 řádků)
- `src/components/resources/NoteComposer.jsx` (-255 řádků)
- Net změna: -223 řádků kódu

**Benefity:**
- Konzistentní help systém (ikona ❓) v celé aplikaci
- Lepší UX - nápověda přímo u pole, kde se zadávají noty
- Menší bundle size
- Snadnější údržba

**Dokumentace:**
- `SESSION_CONTEXT-20251129.md`
- `DOKUMENTACE-20251129.md`

---

### Database Integration - Quiz Results & Leaderboards (29.11.2025 odpoledne)
**Dokončeno:** ✅
**Popis:** Migrace z localStorage na Supabase pro statistiky kvízů a žebříčky

**Změny:**
- ✅ **Vytvoření utility funkce saveQuizResults.js:**
  - Centralizovaná logika pro ukládání výsledků kvízů
  - Insert do piano_quiz_scores (user_id, quiz_type, score, total_questions, streak)
  - Update/insert piano_user_stats (total_xp, level, current_streak, best_streak)
  - Automatický výpočet levelu podle XP (Level 1-5, thresholdy: 100, 250, 500, 1000)
  - Error handling s graceful degradation

- ✅ **Aktualizace ChordQuiz pro ukládání výsledků:**
  - Import a použití saveQuizResults()
  - Předání parametrů: 'chord_quiz', score, totalQuestions, bestStreak, xpEarned
  - Odstranění závislosti na piano_quiz_completions tabulce
  - Konzistentní error handling

- ✅ **Aktualizace UniversalTheoryQuiz:**
  - Zachování detailního trackingu jednotlivých otázek (completionsTable)
  - Přidání agregovaného ukládání pro žebříčky (saveQuizResults)
  - Quiz type: `theory_${quizType}` (např. theory_interval, theory_scale)
  - Dual-mode: detailní analýza + celkové statistiky

- ✅ **SQL migrace pro XP bonusy:**
  - Soubor: `supabase/migrations/002_add_quiz_xp_bonuses.sql`
  - 4 nové záznamy v piano_rewards_config:
    - quiz_perfect (100 XP) - 100% správně
    - quiz_excellent (75 XP) - 80%+ správně
    - quiz_good (50 XP) - 70%+ správně
    - quiz_decent (25 XP) - 50%+ správně
  - ON CONFLICT handling pro opakované migrace

- ✅ **Integrace s GamificationManager:**
  - Import useQuizXPStore (loadQuizBonuses, saveQuizBonuses, error handling)
  - Temporary state pattern (tempQuizBonuses) pro editaci před save
  - 4 input fields s color-coded borders (zelená, oranžová, modrá, fialová)
  - Save button s loading state a success/error notifikacemi
  - Admin může upravit XP hodnoty pro všechny výkonnostní úrovně

**Soubory:**
- `src/utils/saveQuizResults.js` (+119 řádků, nový soubor)
- `src/components/games/ChordQuiz.jsx` (~30 řádků změněno)
- `src/components/games/UniversalTheoryQuiz.jsx` (~60 řádků změněno)
- `src/components/admin/GamificationManager.jsx` (+170 řádků)
- `supabase/migrations/002_add_quiz_xp_bonuses.sql` (+23 řádků, nový soubor)
- Net změna: +402 řádků kódu

**Výsledky:**
✅ Žebříčky napříč uživateli fungují (TOP 50 podle total_xp)
✅ Perzistentní statistiky v databázi s RLS policies
✅ Admin kontrola XP bonusů (configurable rewards)
✅ Odstranění localStorage pro quiz data
✅ Automatický výpočet levelů a streaks
✅ Konzistentní data flow: Quiz → saveQuizResults → piano_quiz_scores + piano_user_stats

**Dokumentace:**
- `DOKUMENTACE-20251129.md` (přidáno +439 řádků s kompletním popisem implementace)

**Git:**
- Branch: `feature/database-quiz-integration-20251129`
- Commit: `5c59136`
- Pushnuto do: main + feature branch
- PR: https://github.com/username/piano/pull/XX

**Testování:**
- ✅ ChordQuiz ukládá výsledky do databáze
- ✅ UniversalTheoryQuiz ukládá výsledky + detail tracking
- ✅ piano_user_stats se správně aktualizuje (XP, level, streak)
- ✅ Žebříček v Admin → Gamifikace zobrazuje data
- ✅ XP bonusy lze editovat v admin panelu
- ✅ localStorage neobsahuje žádná quiz data

---

### Modularizace UI + Unifikace fontů + Migrace not na mezery (26.11.2025)
**Dokončeno:** ✅
**Popis:** Kompletní modularizace UI komponent v SongLibrary, unifikace fontů (Google Fonts), změna separátoru not z podtržítek na mezery

**Změny:**
- ✅ **Modularizace SongLibrary:**
  - Import a použití Chip, ActionButtonGroup, SaveButton, CancelButton z ButtonComponents
  - Nový Chip variant "info" pro metadata (tónina, tempo)
  - Odstranění hardcoded komponent a duplikátního kódu

- ✅ **Odstranění sekce Písničky z Admin panelu:**
  - Admin rozhraní pro písničky je nyní pouze v sekci Písničky
  - Cleanup Admin.jsx - odstranění SongLibrary, songCategories, activeCategory
  - Admin menu nyní: Přehled, Uživatelé, Gamifikace, Odměny, Kvízy

- ✅ **Unifikace fontů - Google Fonts (Lato + Roboto):**
  - Import Lato (300, 400, 700) a Roboto (400, 500, 700) do index.css
  - Body: 'Lato', sans-serif
  - Nadpisy: 'Roboto', sans-serif
  - Override browser defaults: input, textarea, select, button, code, pre → font-family: inherit
  - Odstranění všech inline fontFamily deklarací z celé aplikace
  - Soubory: SongLibrary.jsx, NoteComposer.jsx, AchievementManager.jsx, FormComponents.jsx

- ✅ **Migrace notového zápisu: Podtržítka → Mezery:**

  **Kód:**
  - SongLibrary.jsx: `split('_')` → `split(/\s+/)`, placeholders s mezerami
  - NoteComposer.jsx: `_` → mezera v přidávání not, pauz, nových řádků
  - LessonList.jsx + LessonCard.jsx: `join(', ')` → `join(' ')`, čárky → mezery
  - Aktualizace help tabulky v NoteComposer (oddělovač: _ → mezera)

  **Databáze:**
  - Piano songs: SQL UPDATE `REPLACE(notes, '_', ' ')` - migrace proběhla ✅
  - Piano lessons: Migrace nebyla potřeba (JSON pole zůstává stejné)

  **Výsledek:**
  - Písničky: `"D D E - F | G A H"` (string s mezerami)
  - Lekce: `["C", "D", "E"]` (JSON pole, UI s mezerami)

**Soubory:**
- `src/components/resources/SongLibrary.jsx`
- `src/components/resources/NoteComposer.jsx`
- `src/components/lessons/LessonList.jsx`
- `src/components/lessons/LessonCard.jsx`
- `src/pages/Admin.jsx`
- `src/components/admin/AchievementManager.jsx`
- `src/components/ui/FormComponents.jsx`
- `src/components/ui/ButtonComponents.jsx` (nový variant: info)
- `src/styles/index.css`
- `migrate-notes-to-spaces.js` (nový skript)
- Dokumentace: `DOKUMENTACE-20251126.md`

**Benefity:**
- Konzistentní UI napříč aplikací (modularizace)
- Jednotný font systém (Lato + Roboto) - žádný monospace
- Intuitivnější notový zápis (mezery místo podtržítek)
- Snadnější údržba díky modularizaci

---

### Optimalizace Cvičení + PianoKeyboard vylepšení (25.11.2025 večer)
**Dokončeno:** ✅
**Popis:** Optimalizace stránky Cvičení pro mobil, vylepšení klaviatury a aplikace modulárního designu

**Změny:**
- ✅ **Optimalizace stránky Cvičení:**
  - Nahrazeny velké navigační tlačítka IconButtons (ChevronLeft, ChevronRight)
  - Odstraněn text "Zahrajte postupně tyto tóny:"
  - Přidán filtr `quiz_type = 'chord'` pro správné zobrazení cvičení
  - Aplikovány modulární konstanty (RADIUS.md, RADIUS.lg, RADIUS.sm, SHADOW.lg)

- ✅ **PianoKeyboard vylepšení:**
  - Puntíky přesunuty dolů (bottom: 10px/15px)
  - Text not umístěn 15px nad puntíky
  - Sjednoceny barvy na `var(--color-secondary)` (#2d5b78)
  - Konzistentní glow efekty (opacity 0.7 pro klávesy, 0.8 pro puntíky)
  - Border na klávesách zmenšen z 3px na 2px
  - Vnitřní stíny na puntících (bílé: světlý, černé: tmavší)
  - Svislá čára 1px místo 3px, zIndex 10

- ✅ **CSS optimalizace:**
  - Přidáno `overflow-y: scroll` na html pro konzistentní scrollbar

- ✅ **Modulární design aplikace:**
  - Klaviatura: `var(--radius-xl)`, `var(--shadow-lg)`
  - Nahrazeny deprecated `var(--radius)` za specifické hodnoty
  - Použity konstanty z `styleConstants.js`

**Soubory:**
- `src/pages/Cviceni.jsx`
- `src/components/lessons/PianoKeyboard.jsx`
- `src/styles/index.css`
- Dokumentace: `SESSION_CONTEXT-20251125.md`

**Výsledek:**
- Stránka Cvičení se vejde na jednu obrazovku i na mobilech
- Vizuálně konzistentnější a elegantnější vzhled
- Lepší viditelnost zvýraznění díky vnitřním stínům

---

### Modularizace UI komponent + Fix ChordQuiz (25.11.2025)
**Dokončeno:** ✅
**Popis:** Rozdělení TabButtons do modulárních souborů a oprava automatického generování možností v ChordQuiz

**Změny:**
- ✅ **Modularizace UI komponent:**
  - `ButtonComponents.jsx` - Chip, ActionButton, AddButton, IconButton atd.
  - `CardComponents.jsx` - PageCard, QuestionCard
  - `FormComponents.jsx` - FormInput, FormSelect, FormSection atd.
  - `PageSection.jsx` - Komplexní layout komponenta s menu strukturou
  - `TabButtons.jsx` - Centrální export hub pro všechny UI komponenty

- ✅ **Fix ChordQuiz - Automatické generování možností:**
  - Odstranění JOIN na `piano_quiz_chord_options`
  - Možnosti se generují automaticky z názvů akordů (1 správná + 3 náhodné)
  - Přidána `shuffleArray()` helper funkce
  - Teoretické možnosti se již nezobrazují v poslechovém kvízu

- ✅ **QuizManager refactoring:**
  - Oddělení chord/theory options
  - Odstranění manuálních input fieldů pro chord možnosti
  - Informační text o automatickém generování
  - Save logika rozlišuje mezi chord a theory záznamy

- ✅ **Archivace:**
  - `ChordManager.jsx` → `ChordManager.jsx.backup`
  - QuizManager je nyní jediný univerzální správce všech kvízů

**Soubory:**
- Branch: `refactor/split-tabbuttons-module`
- Commit: `e6195e7`
- Dokumentace: `DOKUMENTACE-20251125.md`
- 19 souborů změněno (+1962, -1294 řádků)

---

### Univerzální struktura kvízů (22.11.2025)
**Dokončeno:** ✅
**Popis:** Rozšíření kvízové struktury pro podporu více typů kvízů

**Změny:**
- ✅ SQL migrace: `supabase_migration_universal_quiz.sql`
  - Přidán sloupec `quiz_type` (chord, theory, rhythm, interval, scale, mixed)
  - Přidán sloupec `category` pro kategorizaci
  - Sloupec `notes` je nyní volitelný (NULL pro ne-akordové kvízy)
  - Vytvořeny VIEW pohledy pro každý typ kvízu

- ✅ `src/components/admin/ChordManager.jsx` - rozšířeno na univerzální správu
  - Záložky pro 6 typů kvízů: Akordy, Teorie, Intervaly, Stupnice, Rytmus, Mix
  - Filtrování podle typu kvízu
  - Dynamický formulář (input pro akordy, textarea pro teorii)
  - Pole kategorie pro teoretické otázky

**Soubory:**
- `supabase_migration_universal_quiz.sql`
- `src/components/admin/ChordManager.jsx`

---

### Oprava pořadí not v akordu (21.11.2025)
**Dokončeno:** ✅
**Popis:** Noty v akordu se nyní zobrazují a přehrávají podle pořadí na klaviatuře (zleva doprava)

**Změny:**
- ✅ `src/utils/noteUtils.js` - přidána funkce `sortNotesByKeyboard()`
  - KEYBOARD_ORDER pole s notami od A. po E''
  - Seřazení podle pozice na klaviatuře

- ✅ `src/components/games/ChordQuiz.jsx` - seřazení před přehráním
- ✅ `src/pages/Cviceni.jsx` - odstranění špatné transformace
- ✅ `src/components/admin/ChordManager.jsx` - seřazení při zobrazení i ukládání

**Soubory:**
- `src/utils/noteUtils.js`
- `src/components/games/ChordQuiz.jsx`
- `src/pages/Cviceni.jsx`
- `src/components/admin/ChordManager.jsx`

---

### Vizuální zvýraznění černých kláves (21.11.2025)
**Dokončeno:** ✅
**Popis:** Přidána svislá čára od indikátoru dolů pro lepší orientaci

**Změny:**
- ✅ `src/components/lessons/PianoKeyboard.jsx`
  - Přidán motion.div s čarou pod kolečkem
  - Responsivní výška čáry (34/56/78px)
  - Animace s delay 0.15s

**Soubory:**
- `src/components/lessons/PianoKeyboard.jsx`

---

### Refaktoring HarmonizationTemplates + PlayButton (30.11.2025)
**Dokončeno:** ✅
**Popis:** Kompletní modularizace Šablon harmonizace a vytvoření univerzálního PlayButton

**Změny:**
- ✅ **HarmonizationTemplates.jsx - 100% modulární:**
  - Nahrazeny všechny hardcoded komponenty modulárními
  - AddButton, FormInput, FormSelect, FormTextarea
  - SaveButton, CancelButton, ActionButtonGroup
  - Chip pro obtížnost, PlayButton pro přehrávání
  - Úspora: 774 → 598 řádků (-176, -22.7%)
  - 0 inline fontSize/fontFamily stylů

- ✅ **Nový PlayButton komponent:**
  - Modulární play button pro celou aplikaci
  - Variant system: 'pause' (Play/Pause) vs 'volume' (Play/Volume2)
  - Design z SongLibrary: modrý/růžový gradient, backdrop blur
  - Velikost 44px (sjednoceno s AddButton)
  - Border radius: RADIUS.lg (16px)

- ✅ **Implementace PlayButton:**
  - SongLibrary: variant="pause" (melodie lze pausnout)
  - HarmonizationTemplates: variant="volume" (kadence bez pauzy)
  - Odstranění inline motion.button

- ✅ **Optimalizace design systému:**
  - AddButton: borderRadius '17px' → RADIUS.lg
  - Sjednocení velikostí tlačítek na 44px
  - Konzistentní použití RADIUS, SHADOW, BORDER

- ✅ **Bug fix:**
  - Eye/EyeOff toggle v HarmonizationTemplates měl chybějící onClick handler
  - Přidán toggleTemplate(template.id)

**Soubory:**
- `src/components/resources/HarmonizationTemplates.jsx` (774 → 598 řádků)
- `src/components/ui/ButtonComponents.jsx` (+64 řádků - PlayButton)
- `src/components/resources/SongLibrary.jsx` (nahrazen inline button)
- Dokumentace: `DOKUMENTACE-20251130.md`

**Výsledek:**
- 100% modulární architektura v HarmonizationTemplates
- Reusable PlayButton pro celou aplikaci
- Konzistentní design napříč SongLibrary a HarmonizationTemplates
- Lepší UX díky variant systému (pause vs volume ikony)

---

### Migrace User ID (20.11.2025)
**Dokončeno:** ✅
**Popis:** Synchronizace User ID mezi Supabase Auth a piano_users tabulkou

**Problém:**
- User měl rozdílné ID v auth.users a piano_users
- RLS policies blokovaly operace kvůli neshode ID

**Řešení:**
- SQL migrace s kaskádovým přepsáním všech FK
- Zachování všech dat (stats, progress, achievements)

**Soubory:**
- SQL migrace v Supabase

---

## 📊 Statistiky projektu

- **Počet komponent:** ~50+
- **Počet DB tabulek:** ~20+
- **Počet migrací:** 6+
- **Řádků kódu:** ~18,000+
- **UI modulárních komponent:** 4 (ButtonComponents, CardComponents, FormComponents, PageSection)

---

## 🔗 Užitečné odkazy

- [Supabase Dashboard](https://supabase.com)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Documentation](https://react.dev)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Lucide Icons](https://lucide.dev)
- [DnD Kit](https://dndkit.com) - Drag & Drop
- [Workbox](https://developers.google.com/web/tools/workbox) - PWA

---

**Poznámky:**
- Tento soubor by měl být aktualizován při každé větší změně
- Udržujte ho synchronizovaný s aktuálním stavem projektu
- Pro detailní changelog viz `CHANGELOG.md`
- Každá nová feature musí projít quality check (funkčnost, duplicita, logy, komentáře)
- Vše dělat modulárně a znovupoužitelně
