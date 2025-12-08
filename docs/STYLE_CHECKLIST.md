# STYLE MODULARIZACE CHECKLIST
**Pro každou komponentu kontrolujeme:**

---

## ✅ BORDER RADIUS - Používat CSS variables

### ❌ ŠPATNĚ (hardcoded):
```jsx
borderRadius: '10px'
borderRadius: '0.5rem'
borderRadius: '22px'
```

### ✅ SPRÁVNĚ (modulární):
```jsx
borderRadius: 'var(--radius-sm)'    // 10px - buttons, inputs, chips
borderRadius: 'var(--radius-md)'    // 12px - forms
borderRadius: 'var(--radius-lg)'    // 16px - cards
borderRadius: 'var(--radius-xl)'    // 22px - main containers
borderRadius: 'var(--radius-xxl)'   // 40px - modals
```

**Nebo z JS konstant:**
```jsx
import { RADIUS } from '../../utils/styleConstants';
borderRadius: RADIUS.xl
```

---

## ✅ BORDERS - border: none + stín místo border

### ❌ ŠPATNĚ:
```jsx
border: '1px solid #ddd'
border: '2px solid rgba(181, 31, 101, 0.4)'
```

### ✅ SPRÁVNĚ:
```jsx
border: 'none'
boxShadow: 'var(--shadow)'          // jemný stín
boxShadow: 'var(--shadow-md)'       // střední stín
boxShadow: 'var(--shadow-lg)'       // velký stín
boxShadow: 'var(--glass-shadow)'    // glassmorphism
```

**Nebo z JS konstant:**
```jsx
import { SHADOW, BORDER } from '../../utils/styleConstants';
border: BORDER.none
boxShadow: SHADOW.default
```

---

## ✅ BARVY - Používat CSS variables

### ❌ ŠPATNĚ (hardcoded):
```jsx
color: '#b51f65'
color: '#2d5b78'
background: 'rgba(181, 31, 101, 0.08)'
```

### ✅ SPRÁVNĚ (CSS variables):
```jsx
color: 'var(--color-primary)'
color: 'var(--color-secondary)'
color: 'var(--color-success)'
color: 'var(--color-danger)'
color: 'var(--color-text)'
color: 'var(--color-text-secondary)'
background: 'var(--color-primary-transparent)'
background: 'var(--glass-bg)'
```

**Nebo z JS konstant (jen pokud nutné):**
```jsx
import { COLORS } from '../../utils/styleConstants';
color: COLORS.primary
```

---

## ✅ KOMPONENTY - Používat modulární komponenty

### ❌ ŠPATNĚ (custom JSX):
```jsx
<div style={{
  background: 'rgba(255, 255, 255, 0.8)',
  padding: '1rem',
  borderRadius: '16px'
}}>
  {content}
</div>
```

### ✅ SPRÁVNĚ (modulární komponenty):
```jsx
import { PageCard, InfoPanel, ItemCard } from '../ui/CardComponents';
<PageCard>{content}</PageCard>
```

### Dostupné komponenty:

**Cards:**
- `Card` - čistý glassmorphism (BEZ paddingu) - base komponenta
- `PageCard` - Card + padding 1.25rem - pro obsah stránek
- `QuestionCard` - quiz card
- `InfoPanel` - info panel s ikonou (podporuje as={motion.div})
- `ItemCard` - univerzální card (list/grid)
- `ProgressBar` - progress bar

**Buttons:**
- `PrimaryButton` - hlavní tlačítko
- `SecondaryButton` - sekundární tlačítko
- `IconButton` - tlačítko s ikonou
- `CloseButton` - zavírací křížek

**Forms:**
- `FormInput` - input pole
- `FormLabel` - label
- `FormSelect` - select

**Layout:**
- `PageSection` - layout s tabs a daily goal
- `Modal` - modal wrapper

**Chipy:**
- `Chip` - základní chip
- `DifficultyChip` - obtížnost
- `StatusChip` - status

**Feedback systém:**
- `PracticeModeControls` - univerzální modul (režimy, progress, feedback ikony)
- `useProgressTracking` - hook pro sledování pokroku
- `InfoPanel` - oslavy v Challenge režimu
- `PracticeCelebration` - velká oslava po dokončení série

---

## ✅ FONTY - Používat utility třídy z utilities.css

### ❌ ŠPATNĚ (inline styles):
```jsx
<div style={{ fontSize: '0.7rem', fontWeight: '600' }}>Label</div>
<span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Text</span>
<h3 style={{ fontSize: '0.875rem', color: '#64748b' }}>Title</h3>
<div style={{ fontWeight: 'bold' }}>Bold</div>  // String místo čísla!
```

### ✅ SPRÁVNĚ (utility classes z utilities.css):
```jsx
// Font Sizes:
<div className="text-xs">Label</div>          // 0.7rem (11.2px)
<span className="text-sm">Text</span>          // 0.75rem (12px)
<h3 className="text-base">Title</h3>           // 0.875rem (14px)

// Font Weights:
<div className="font-medium">Text</div>        // 500
<div className="font-semibold">Bold</div>      // 600

// Kombinace:
<span className="text-sm font-medium">(Vy)</span>
<div className="text-xs">XP</div>
```

### ✅ POKUD NENÍ UTILITY CLASS - číselné hodnoty:
```jsx
// Pokud utilities.css nemá odpovídající class, použij číselné hodnoty:
<div style={{ fontSize: '1rem' }}>Username</div>          // OK - není utility
<div style={{ fontSize: '1.25rem' }}>Rank</div>           // OK - není utility
<div style={{ fontWeight: 700 }}>Bold</div>               // OK - číslo, ne string!
<div style={{ fontWeight: 600 }}>Semibold</div>           // OK - číslo

// ❌ NIKDY stringy pro čísla:
<div style={{ fontWeight: 'bold' }}>Bad</div>             // ŠPATNĚ!
<div style={{ fontWeight: '600' }}>Bad</div>              // ŠPATNĚ!
```

### Dostupné utility classes (utilities.css):
```css
/* Font Sizes */
.text-xs    { font-size: 0.7rem; }    /* 11.2px - Extra small */
.text-sm    { font-size: 0.75rem; }   /* 12px - Small */
.text-base  { font-size: 0.875rem; }  /* 14px - Base */

/* Font Weights */
.font-medium   { font-weight: 500; }
.font-semibold { font-weight: 600; }
```

### Příklad refaktoringu (Leaderboard.jsx):
```jsx
// PŘED:
<div style={{
  fontSize: '0.75rem',
  fontWeight: '500',
  color: 'var(--color-primary)'
}}>
  (Vy)
</div>

// PO:
<span
  className="text-sm font-medium"
  style={{ color: 'var(--color-primary)' }}
>
  (Vy)
</span>
```

---

## ✅ GLASSMORPHISM - Používat CSS variables

### ❌ ŠPATNĚ:
```jsx
background: 'rgba(255, 255, 255, 0.8)'
backdropFilter: 'blur(30px)'
border: '1px solid rgba(255, 255, 255, 0.3)'
```

### ✅ SPRÁVNĚ:
```jsx
background: 'var(--glass-bg)'
backdropFilter: 'blur(30px)'  // OK - blur zůstává custom
border: 'none'
boxShadow: 'var(--glass-shadow)'
```

---

## 🔍 KONTROLNÍ POSTUP PŘI EXTRAKCI

### Krok 1: Najít v komponentě
- [ ] `borderRadius:` - nahradit CSS variable nebo RADIUS
- [ ] `border:` - nahradit `border: 'none'` + `boxShadow`
- [ ] `color:` nebo `background:` s hex/rgba - nahradit CSS variable
- [ ] Custom karty - nahradit PageCard/ItemCard
- [ ] Custom buttons - nahradit PrimaryButton/SecondaryButton
- [ ] **Inline font styles:**
  - [ ] `fontSize: '0.7rem'` → `className="text-xs"`
  - [ ] `fontSize: '0.75rem'` → `className="text-sm"`
  - [ ] `fontSize: '0.875rem'` → `className="text-base"`
  - [ ] `fontWeight: '500'` → `className="font-medium"` nebo `fontWeight: 500`
  - [ ] `fontWeight: '600'` → `className="font-semibold"` nebo `fontWeight: 600`
  - [ ] `fontWeight: 'bold'` → `fontWeight: 700` (číselná hodnota!)

### Krok 2: Přidat importy
```jsx
import { RADIUS, SHADOW, BORDER } from '../../utils/styleConstants';
import { PageCard, ItemCard } from '../ui/CardComponents';
import { PrimaryButton } from '../ui/ButtonComponents';
```

### Krok 3: Přepsat styly
- Použít CSS variables: `var(--color-primary)`
- Nebo JS konstanty: `RADIUS.xl`, `SHADOW.default`

---

## 📝 PŘÍKLAD BEFORE/AFTER

### PŘED:
```jsx
<div style={{
  background: 'rgba(255, 255, 255, 0.8)',
  borderRadius: '22px',
  border: '1px solid #ddd',
  padding: '1.5rem'
}}>
  <button style={{
    background: '#b51f65',
    color: 'white',
    borderRadius: '10px',
    padding: '0.5rem 1rem'
  }}>
    Click
  </button>
</div>
```

### PO:
```jsx
import { PageCard } from '../ui/CardComponents';
import { PrimaryButton } from '../ui/ButtonComponents';

<PageCard>
  <PrimaryButton onClick={...}>
    Click
  </PrimaryButton>
</PageCard>
```

---

## ✅ FEEDBACK SYSTÉM - Používat modulární komponenty

### ❌ ŠPATNĚ (custom feedback):
```jsx
{showSuccess && <div>✓ Správně!</div>}
{showError && <div>✗ Špatně!</div>}
<button onClick={retry}>Zkusit znovu</button>
```

### ✅ SPRÁVNĚ (modulární):
```jsx
import PracticeModeControls from '../ui/PracticeModeControls';
import useProgressTracking from '../../hooks/useProgressTracking';
import { InfoPanel } from '../ui/CardComponents';

const { completedCount, incrementCompleted, resetProgress } = useProgressTracking();

<PracticeModeControls
  isPracticing={practicingMode}
  isChallenge={challengeMode}
  showSuccess={showSuccess}
  showError={showError}
  onReset={resetPractice}
  progress={current}
  totalNotes={total}
/>

{/* Velká oslava v Challenge */}
{showSuccess && challengeMode && (
  <InfoPanel variant="secondary">
    <CheckCircle size={56} />
    <h3>Výborně!</h3>
  </InfoPanel>
)}
```

**Detaily:** Viz `MODULARNI-FEEDBACK-SYSTEM.md`

---

## ✅ RESPONSIVE DESIGN - Používat useResponsive hook

### ❌ ŠPATNĚ (opakované window.innerWidth checks):
```jsx
const isMobile = window.innerWidth <= 640;

<div style={{
  padding: window.innerWidth <= 640 ? '0.75rem' : '2rem',
  gap: window.innerWidth <= 640 ? '0.5rem' : '1rem',
  borderRadius: window.innerWidth <= 640 ? '12px' : '16px'
}}>
  {content}
</div>

// Problém: Opakování, nedetekuje resize, duplicitní kód
```

### ✅ SPRÁVNĚ (useResponsive hook + DRAWER_SPACING):
```jsx
import { useResponsive } from '../../hooks/useResponsive';
import { DRAWER_SPACING } from '../../utils/styleConstants';

const { isMobile, isTablet, isDesktop } = useResponsive();
const spacing = isMobile ? DRAWER_SPACING.mobile : DRAWER_SPACING.desktop;

<div style={{
  padding: spacing.contentPadding,
  gap: isMobile ? '0' : '0.5rem',
  borderRadius: isMobile ? 'var(--radius-md)' : 'var(--radius-lg)'
}}>
  {content}
</div>
```

### Dostupné DRAWER_SPACING hodnoty:
```javascript
// mobile (≤640px):
DRAWER_SPACING.mobile = {
  contentPadding: '0.75rem 0.75rem 0.5rem 0.75rem',
  margin: '0.75rem',
  cardPadding: '0.75rem',
  sectionGap: '0.5rem'
}

// desktop (>640px):
DRAWER_SPACING.desktop = {
  contentPadding: '2rem 2rem 1.5rem 2rem',
  margin: '1.5rem',
  cardPadding: '1rem',
  sectionGap: '1rem'
}
```

### useResponsive hook vrací:
```javascript
{
  isMobile: boolean,   // ≤640px
  isTablet: boolean,   // 641-1024px
  isDesktop: boolean,  // >1024px
  width: number        // aktuální šířka okna
}
```

### Výhody:
- ✅ **Single source of truth** - breakpoint definován na 1 místě
- ✅ **Automatický resize** - hook reaguje na změny šířky okna
- ✅ **Žádné duplicity** - eliminace opakování `window.innerWidth <= 640`
- ✅ **Centralizované spacing** - konzistentní hodnoty napříč aplikací
- ✅ **Snadná údržba** - změna breakpointu = úprava na 1 místě

---

## ✅ DATABASE VIEWS - Modularizace na databázové úrovni

### ❌ ŠPATNĚ (složitá aplikační logika):
```javascript
// 150+ řádků kódu pro agregaci dat
export const getAllUsersActivities = async (limit = 100) => {
  const allActivities = [];

  // Fetch all users first
  const { data: allUsers } = await supabase
    .from('piano_users')
    .select('*');

  const usersMap = new Map();
  allUsers.forEach(user => usersMap.set(user.id, user));

  // Fetch songs
  const { data: songs } = await supabase
    .from('piano_song_completions')
    .select('*');

  // Manuální join a mapping...
  songs.forEach(song => {
    const user = usersMap.get(song.user_id);
    allActivities.push({ ...song, user });
  });

  // Opakování pro každou tabulku (lessons, quizzes, atd.)
  // ...další 100 řádků
};
```

### ✅ SPRÁVNĚ (SQL view + jednoduchý dotaz):
```sql
-- migrations/create_user_activities_view.sql
CREATE OR REPLACE VIEW piano.user_activities AS
SELECT
  CONCAT('song-', psc.id::text) as id,
  'song' as type,
  psc.song_title as title,
  psc.completed_at as date,
  100 as xp,
  psc.user_id,
  pu.first_name,
  pu.last_name,
  pu.email
FROM piano.piano_song_completions psc
JOIN piano.piano_users pu ON psc.user_id = pu.id
UNION ALL
-- ... další completion tabulky
```

```javascript
// activityService.js - 50 řádků místo 150
export const getAllUsersActivities = async (limit = 100) => {
  const { data, error } = await supabase
    .from('user_activities')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit);

  return data.map(activity => ({
    id: activity.id,
    type: activity.type,
    title: activity.title,
    date: new Date(activity.date),
    xp: activity.xp,
    user: {
      id: activity.user_id,
      first_name: activity.first_name,
      last_name: activity.last_name,
      email: activity.email
    }
  }));
};
```

### Výhody database views:
- ✅ **Redukce kódu** - 150 řádků → 50 řádků (-66%)
- ✅ **Výkon** - database JOIN je rychlejší než aplikační mapping
- ✅ **Jednotné API** - všechny completion tabulky mají stejný formát
- ✅ **Údržba** - změny v databázi = úprava view, ne JS kód
- ✅ **Testovatelnost** - SQL view lze testovat přímo v databázi

### Kdy používat views:
- Agregace dat z více tabulek
- Složité JOINy s user informacemi
- Transformace dat (CASE, CONCAT, kalkulace XP)
- Opakované dotazy napříč aplikací

**Příklad:** `piano.user_activities` view agreguje 10 completion tabulek do jednoho konzistentního formátu.

---

## ✅ CARD COMPONENT - Single Source of Truth pro Glassmorphism

### ❌ ŠPATNĚ (duplicitní glassmorphism kód):
```jsx
// V každé komponentě jinak:
<div style={{
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: 'none',
  borderRadius: 'var(--radius-xl)',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)'
}}>
  {children}
</div>

// Jiná komponenta - jiné hodnoty:
<motion.div style={{
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(30px)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(45, 91, 120, 0.15)'
}}>
  {children}
</motion.div>
```

### ✅ SPRÁVNĚ (Card komponenta):
```jsx
import { Card } from '../ui/CardComponents';

// Základní použití:
<Card opacity={0.8} blur="30px" radius="xl" shadow="default">
  {children}
</Card>

// S motion.div pro animace:
<Card
  as={motion.div}
  opacity={0.8}
  blur="30px"
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
>
  {children}
</Card>
```

### Card Component API:
```jsx
<Card
  as={Component}        // Custom element (div, motion.div)
  opacity={0.8}         // 0-1 (standard: 0.8)
  blur="30px"           // Blur radius (standard: "30px")
  radius="xl"           // sm/md/lg/xl (z RADIUS konstant)
  shadow="default"      // none/default/primary/secondary/gold
  style={{}}            // Custom styles (override)
>
  {children}
</Card>
```

### Standardizované hodnoty (3.12.2025):
```jsx
// STANDARD pro všechny card komponenty:
blur="30px"           // Jednotný blur
opacity={0.8}         // Jednotná průhlednost

// VÝJIMKY (záměrné):
// StatCard icon container:
<Card opacity={0.95} blur="10px" />  // Menší element, vyšší opacity

// EditFormContainer:
<Card opacity={0.4} blur="30px" />   // Subtilnější background
```

### Modularizované komponenty používající Card:

#### 1. PageCard
```jsx
// PŘED:
<div style={{
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px)',
  borderRadius: 'var(--radius-xl)',
  padding: '1.25rem'
}}>
  {children}
</div>

// PO:
<PageCard>{children}</PageCard>

// Interní implementace:
export function PageCard({ children, style = {}, ...props }) {
  return (
    <Card
      opacity={0.8}
      blur="30px"
      radius="xl"
      shadow="default"
      style={{ padding: '1.25rem', marginBottom: '1.5rem', ...style }}
      {...props}
    >
      {children}
    </Card>
  );
}
```

#### 2. ItemCard (s motion.div)
```jsx
// PŘED:
<motion.div
  style={{
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: '0 8px 32px rgba(45, 91, 120, 0.15)'
  }}
  whileHover={{ scale: 1.02 }}
>
  {children}
</motion.div>

// PO:
<ItemCard whileHover={{ scale: 1.02 }}>
  {children}
</ItemCard>

// Interní implementace používá: as={motion.div}
```

#### 3. EditFormContainer
```jsx
// PŘED (inline glassmorphism):
<div style={{
  background: 'rgba(255, 255, 255, 0.4)',
  backdropFilter: 'blur(30px)',
  overflow: 'hidden'  // Způsobovalo corner artifacts!
}}>
  {children}
</div>

// PO (Card komponenta):
<Card
  shadow="primary"
  radius="xl"
  opacity={0.4}
  blur="30px"
  style={{ padding: '1rem 0.75rem', overflow: 'hidden' }}
>
  {children}
</Card>
```

### GlassCard.jsx - ODSTRANĚN ❌
```jsx
// GlassCard byl duplicitní komponenta:
// - Méně flexibilní než Card
// - Žádné props pro opacity/blur/radius
// - Používán pouze v LessonList.jsx (1 místo)
// - Nahrazen Card komponentou a SMAZÁN
```

### Výhody modularizace:
- ✅ **Single source of truth** - Všechny glassmorphism efekty z Card
- ✅ **Eliminace duplikátů** - 0 inline glassmorphism kódu
- ✅ **Konzistence** - Standardizované blur/opacity hodnoty
- ✅ **Flexibilita** - `as` prop pro motion.div support
- ✅ **Snadná údržba** - Změna v Card = změna všude
- ✅ **Menší bundle** - Odstranění GlassCard.jsx

### Soubory změněny (3.12.2025):
- `src/components/ui/CardComponents.jsx` - Card s `as` prop, refactoring
- `src/components/ui/EditFormContainer.jsx` - refaktorováno na Card
- `src/components/lessons/LessonList.jsx` - GlassCard → Card
- `src/components/ui/GlassCard.jsx` - **SMAZÁN** (duplicitní)

### Soubory změněny (4.12.2025 - Session 8):
- `src/components/practice/ChordPracticeSection.jsx` - Card → PageCard fix
- `src/components/ui/CardComponents.jsx` - InfoPanel as={motion.div} podpora
- `src/components/ui/PageSection.jsx` - maxWidth implementation
- `src/pages/Cviceni.jsx` - responzivní padding fixes

### Dokumentace:
- `SESSION_CONTEXT-20251203-card-modularization.md` - kompletní dokumentace
- `SESSION_CONTEXT-20251204-chord-refactoring-done.md` - Card vs PageCard pattern

---

## ✅ RESPONZIVNÍ PADDING - Používat CSS .container

### ❌ ŠPATNĚ (fixní inline padding):
```jsx
<div style={{ padding: '0 1rem' }}>
  {content}
</div>

// Problém: Fixní padding je příliš velký na mobilech!
```

### ✅ SPRÁVNĚ (CSS .container třída):
```jsx
<div className="container">
  {content}
</div>

// CSS .container má responzivní padding:
// - Mobil: menší padding
// - Desktop: větší padding
```

### Kdy používat .container:
- Pro vnější padding kolem karet a komponent
- Když chcete responzivní spacing
- Místo inline `padding: '0 1rem'`

### Příklad z ChordPracticeSection:
```jsx
// PŘED:
<div style={{ padding: '0 1rem' }}>
  <PageCard>{content}</PageCard>
</div>

// PO:
<div className="container">
  <PageCard>{content}</PageCard>
</div>
```

---

## ✅ CARD vs PAGECARD - Kdy co použít

### Card - Čistý glassmorphism (BEZ paddingu)
```jsx
<Card opacity={0.8} blur="30px">
  <div style={{ padding: '1rem' }}>
    Custom padding uvnitř
  </div>
</Card>
```

**Použití:**
- Když potřebujete custom padding
- Když chcete kontrolu nad vnitřním spacingem
- Base komponenta pro ostatní karty

### PageCard - Card + padding 1.25rem
```jsx
<PageCard>
  {content}
</PageCard>

// Interní implementace:
<Card style={{ padding: '1.25rem' }}>
  {content}
</Card>
```

**Použití:**
- Pro standardní obsah stránek
- Když chcete jednotný padding
- Většina use-cases

### Příklad - ChordPracticeSection.jsx:
```jsx
// ❌ ŠPATNĚ (Card bez paddingu):
<Card style={{ marginBottom: '2rem', paddingBottom: '1rem' }}>
  {content}
</Card>

// ✅ SPRÁVNĚ (PageCard s defaultním paddingem):
<PageCard style={{ marginBottom: '2rem' }}>
  {content}
</PageCard>
```

---

**Použití:** Kontrolovat podle tohoto checklistu při každé extrakci komponenty!

---

**Poslední update:** 8. prosince 2025 (Session 11 - ChordQuiz Modularization)
**Aktualizováno:**
- ✅ **Nové reusable komponenty vytvořeny** (Session 11):
  - QuizStatCard.jsx - Používá RADIUS, SHADOW konstanty, CSS variables
  - QuizStartScreen.jsx - Používá RADIUS, SHADOW, BORDER konstanty
  - PianoPrepareDialog.jsx - Používá Card komponentu, RADIUS konstanty
- ✅ **ChordQuiz.jsx** - Modularizace dokončena, eliminace inline stylů
- ✅ **Cviceni.jsx** - React Hooks order fix, odstranění optional chaining
**Dříve aktualizováno (Session 10):**
- ✅ Code Quality - Odstranění console.log() z audio enginu (PianoContext.jsx, audio.js)
- ✅ Sekce Cvičení/Akordy production-ready (0 debug logů, čistá konzole)
**Dříve aktualizováno (Session 8):**
- ✅ RESPONZIVNÍ PADDING sekce - CSS .container pattern
- ✅ CARD vs PAGECARD sekce - kdy co použít
- ✅ Dostupné komponenty - aktualizace Card/PageCard rozdílů
- ✅ InfoPanel as={motion.div} podpora
- FONTY sekce - detailní návod na utility classes z utilities.css
- Kontrolní postup - rozšířen o konkrétní font style checks
- Příklady z Leaderboard.jsx refaktoringu (text-xs, text-sm, text-base, font-medium, font-semibold)
- Database Views - Modularizace na databázové úrovni
