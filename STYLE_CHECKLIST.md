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

## ✅ FONTY - Používat globální CSS třídy

### ❌ ŠPATNĚ (inline styles):
```jsx
<h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Title</h1>
<p style={{ fontSize: '0.875rem', color: '#64748b' }}>Text</p>
```

### ✅ SPRÁVNĚ (CSS classes nebo variables):
```jsx
<h1>Title</h1>  // dědí z global.css
<p className="text-secondary">Text</p>  // utility class
<div style={{ color: 'var(--color-text-secondary)' }}>Text</div>
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
- [ ] Inline font styles - nahradit CSS classes nebo odstranit

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

**Použití:** Kontrolovat podle tohoto checklistu při každé extrakci komponenty!
