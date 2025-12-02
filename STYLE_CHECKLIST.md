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
- `PageCard` - základní card
- `QuestionCard` - quiz card
- `InfoPanel` - info panel s ikonou
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

**Použití:** Kontrolovat podle tohoto checklistu při každé extrakci komponenty!

---

**Poslední update:** 2. prosince 2025 (Session 4 - večer)
**Aktualizováno:**
- FONTY sekce - detailní návod na utility classes z utilities.css
- Kontrolní postup - rozšířen o konkrétní font style checks
- Příklady z Leaderboard.jsx refaktoringu (text-xs, text-sm, text-base, font-medium, font-semibold)
**Dříve přidáno:** Database Views - Modularizace na databázové úrovni
