# LESSONS CHECKLIST - Modularizace & Optimalizace
**Datum vytvoření:** 2. prosince 2025 (Session 4 - večer)
**Status:** 📋 PŘIPRAVENO K REFAKTORINGU

---

## 📊 KOMPONENTY K ANALÝZE

### Hlavní komponenty
- [ ] **Lekce.jsx** - hlavní stránka lekcí
- [ ] **LessonList.jsx** - seznam lekcí
- [ ] **LessonCard.jsx** - karta jednotlivé lekce
- [ ] **LessonModal.jsx** - modal pro přehrávání lekce
- [ ] **PianoKeyboard.jsx** - klaviatura (už optimalizováno 25.11.2025)
- [ ] **NoteCard.jsx** - zobrazení not

---

## ✅ STYLE CHECKLIST - Kontrola modularizace

### 1. Border Radius
- [ ] Zkontrolovat všechny `borderRadius:` hodnoty
- [ ] Nahradit za `RADIUS.sm/md/lg/xl` nebo `var(--radius-*)`
- [ ] Odstranit deprecated `var(--radius)`

**Hledat:**
```javascript
borderRadius: '10px'
borderRadius: '0.5rem'
borderRadius: 'var(--radius)'
```

**Nahradit za:**
```javascript
import { RADIUS } from '../../utils/styleConstants';
borderRadius: RADIUS.sm   // 10px
borderRadius: RADIUS.md   // 12px
borderRadius: RADIUS.lg   // 16px
borderRadius: RADIUS.xl   // 22px
```

---

### 2. Borders
- [ ] Zkontrolovat všechny `border:` hodnoty
- [ ] Nahradit bordery za `border: 'none'` + `boxShadow`

**Hledat:**
```javascript
border: '1px solid #ddd'
border: '2px solid rgba(45, 91, 120, 0.3)'
```

**Nahradit za:**
```javascript
border: 'none'
boxShadow: 'var(--shadow)'
```

---

### 3. Barvy
- [ ] Zkontrolovat všechny hardcoded barvy
- [ ] Nahradit za CSS variables

**Hledat:**
```javascript
color: '#b51f65'
color: '#2d5b78'
background: 'rgba(181, 31, 101, 0.08)'
```

**Nahradit za:**
```javascript
color: 'var(--color-primary)'
color: 'var(--color-secondary)'
background: 'var(--color-primary-transparent)'
```

---

### 4. Inline Font Styles
- [ ] Zkontrolovat všechny `fontSize` hodnoty
- [ ] Zkontrolovat všechny `fontWeight` hodnoty
- [ ] Nahradit za utility classes z utilities.css

**Hledat:**
```javascript
fontSize: '0.7rem'    → className="text-xs"
fontSize: '0.75rem'   → className="text-sm"
fontSize: '0.875rem'  → className="text-base"
fontWeight: '500'     → className="font-medium" nebo fontWeight: 500
fontWeight: '600'     → className="font-semibold" nebo fontWeight: 600
fontWeight: 'bold'    → fontWeight: 700 (číselná hodnota!)
```

**Dostupné utility classes:**
```css
.text-xs     { font-size: 0.7rem; }    /* 11.2px */
.text-sm     { font-size: 0.75rem; }   /* 12px */
.text-base   { font-size: 0.875rem; }  /* 14px */
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
```

---

### 5. Komponenty
- [ ] Zkontrolovat použití modulárních komponent
- [ ] Nahradit custom komponenty za modulární

**Modulární komponenty k použití:**

**Cards:**
```javascript
import { PageCard, ItemCard, Card } from '../ui/CardComponents';
```

**Buttons:**
```javascript
import { PrimaryButton, SecondaryButton, IconButton, AddButton } from '../ui/ButtonComponents';
```

**Forms:**
```javascript
import { FormInput, FormSelect, FormTextarea } from '../ui/FormComponents';
```

**Chips:**
```javascript
import { Chip, DifficultyChip } from '../ui/ButtonComponents';
// Varianty: primary, secondary, light, info, difficulty, inactive
```

---

### 6. Glassmorphism
- [ ] Zkontrolovat použití `backdropFilter`
- [ ] Použít CSS variables pro glassmorphism

```javascript
background: 'var(--glass-bg)'
backdropFilter: 'blur(30px)'
boxShadow: 'var(--glass-shadow)'
```

---

## 📝 PRIORITY CHECKLIST

### Priorita 1 - Rychlé fixy (10 min)
- [ ] Import RADIUS z styleConstants
- [ ] Nahradit `var(--radius)` za `RADIUS.*`
- [ ] Zkontrolovat že všechny barvy jsou CSS variables
- [ ] Odstranit všechny stringové fontWeight ('bold', '600')

### Priorita 2 - Font Styles (15 min)
- [ ] Převést fontSize na utility classes (.text-xs, .text-sm, .text-base)
- [ ] Převést fontWeight na utility classes (.font-medium, .font-semibold)
- [ ] Číselné hodnoty pro custom fontWeight (700, 600)

### Priorita 3 - Modularizace (30-60 min)
- [ ] Nahradit custom buttons za PrimaryButton/SecondaryButton
- [ ] Nahradit custom cards za Card/ItemCard
- [ ] Nahradit custom inputs za FormInput/FormSelect
- [ ] Použít Chip komponenty pro badges

---

## 🎯 KOMPONENTY - DETAILNÍ CHECKLIST

### Lekce.jsx
- [ ] **Border Radius:** Zkontrolovat a nahradit
- [ ] **Borders:** Odstranit a použít shadows
- [ ] **Barvy:** CSS variables
- [ ] **Font styles:** Utility classes
- [ ] **Komponenty:** Použít modulární
- [ ] **Console logy:** Odstranit debug logy

### LessonList.jsx
- [ ] **Border Radius:** Zkontrolovat a nahradit
- [ ] **Borders:** Odstranit a použít shadows
- [ ] **Barvy:** CSS variables
- [ ] **Font styles:** Utility classes
- [ ] **Komponenty:** Použít modulární
- [ ] **Console logy:** Odstranit debug logy

### LessonCard.jsx
- [ ] **Border Radius:** Zkontrolovat a nahradit
- [ ] **Borders:** Odstranit a použít shadows
- [ ] **Barvy:** CSS variables
- [ ] **Font styles:** Utility classes
- [ ] **Komponenty:** Použít modulární (Chip pro difficulty)
- [ ] **Console logy:** Odstranit debug logy

### LessonModal.jsx
- [ ] **Border Radius:** Zkontrolovat a nahradit
- [ ] **Borders:** Odstranit a použít shadows
- [ ] **Barvy:** CSS variables
- [ ] **Font styles:** Utility classes
- [ ] **Komponenty:** Použít modulární
- [ ] **Console logy:** Odstranit debug logy

### PianoKeyboard.jsx
- [x] ✅ **UŽ OPTIMALIZOVÁNO** (25.11.2025)
- Použity RADIUS.xl, var(--shadow-lg)
- Puntíky přesunuty dolů, vnitřní stíny
- Konzistentní barvy var(--color-secondary)

### NoteCard.jsx
- [ ] **Border Radius:** Zkontrolovat a nahradit
- [ ] **Borders:** Odstranit a použít shadows
- [ ] **Barvy:** CSS variables
- [ ] **Font styles:** Utility classes
- [ ] **Komponenty:** Použít modulární
- [ ] **Console logy:** Odstranit debug logy

---

## 📋 AKČNÍ PLÁN

### Krok 1: Analýza (10 min)
```bash
# Najít všechny inline font styles
grep -n "fontSize:" src/components/lessons/*.jsx src/pages/Lekce.jsx
grep -n "fontWeight:" src/components/lessons/*.jsx src/pages/Lekce.jsx

# Najít všechny borderRadius
grep -n "borderRadius:" src/components/lessons/*.jsx src/pages/Lekce.jsx

# Najít všechny hardcoded barvy (hex)
grep -n "#[0-9a-fA-F]\{6\}" src/components/lessons/*.jsx src/pages/Lekce.jsx

# Najít všechny console.log
grep -n "console.log" src/components/lessons/*.jsx src/pages/Lekce.jsx
```

### Krok 2: Refaktoring (per komponenta)
1. Vytvořit novou větev: `git checkout -b refactor/lessons-modularity`
2. Pro každou komponentu:
   - Přečíst soubor
   - Aplikovat STYLE_CHECKLIST.md
   - Nahradit inline styly
   - Použít modulární komponenty
   - Testovat funkčnost
   - Commitnout změny

### Krok 3: Testování (15 min)
- [ ] Lekce se načítají
- [ ] Přehrávání lekcí funguje
- [ ] Klaviatura funguje
- [ ] Vizuální kontrola (barvy, fonty, spacing)
- [ ] Console.error kontrola

### Krok 4: Dokumentace (10 min)
- [ ] Aktualizovat SESSION_CONTEXT
- [ ] Aktualizovat MASTER_TODO
- [ ] Označit checklist jako hotový

---

## 🔍 OČEKÁVANÉ VÝSLEDKY

### Před refaktoringem
- ❌ Hardcoded barvy
- ❌ Inline font styles
- ❌ Deprecated var(--radius)
- ❌ Custom komponenty místo modulárních
- ❌ Console.log debug zprávy

### Po refaktoringu
- ✅ Pouze CSS variables pro barvy
- ✅ Utility classes pro fonty
- ✅ RADIUS konstanty
- ✅ Modulární komponenty (Card, Chip, Button)
- ✅ Žádné debug logy

---

## 📊 PROGRESS TRACKING

### Komponenty hotové: 6/6 ✅
- [x] Lekce.jsx - ✅ HOTOVO
- [x] LessonList.jsx - ✅ HOTOVO
- [x] LessonCard.jsx - ✅ HOTOVO
- [x] LessonModal.jsx - ✅ HOTOVO
- [x] PianoKeyboard.jsx - ✅ HOTOVO (už dříve)
- [x] NoteCard.jsx - ✅ HOTOVO

---

## 🎯 CÍL

**Minimální cíl:**
- ✅ Žádné hardcoded barvy
- ✅ Font styles převedeny na utility classes
- ✅ RADIUS konstanty místo deprecated `var(--radius)`
- ✅ Žádné console.log debug zprávy
- ✅ Číselné fontWeight hodnoty (ne stringy)

**Optimální cíl:**
- ✅ Modulární komponenty (Card, Chip, Button)
- ✅ Zredukovaný počet řádků
- ✅ Reusable komponenty místo duplicit
- ✅ Kompletní dokumentace změn

---

## 💡 TIPY

1. **Font Styles:**
   - Použij utilities.css classes kde možné
   - Číselné hodnoty pro custom velikosti
   - NIKDY stringy pro čísla ('bold' → 700)

2. **Komponenty:**
   - Vždy import Card místo custom div
   - Chip komponenta pro badges
   - IconButton pro malá tlačítka

3. **Testování:**
   - Testuj po každé komponentě
   - Zkontroluj console před commitem
   - Vizuální kontrola všech stavů

4. **Git:**
   - Commituj po každé komponentě
   - Popisné commit messages
   - Reference na checklist v commitech

---

## 🔗 ODKAZY

- [STYLE_CHECKLIST.md](./STYLE_CHECKLIST.md) - Kompletní style guidelines
- [LEADERBOARD_CHECKLIST.md](./LEADERBOARD_CHECKLIST.md) - Příklad hotového checklistu
- [utilities.css](./src/styles/utilities.css) - Dostupné utility classes
- [styleConstants.js](./src/utils/styleConstants.js) - RADIUS, SHADOW, BORDER

---

**Status:** ✅ 100% HOTOVO
**Vytvořeno:** 2. prosince 2025 (Session 4 - večer)
**Dokončeno:** 2. prosince 2025 (Session 4 - večer)
**Výsledek:** Všechny lesson komponenty refaktorovány na CSS variables a modulární styly

---

## 📊 FINAL SUMMARY

### Refaktorované soubory
- ✅ Lekce.jsx (186 → 185 řádků) - odstraněn unused import
- ✅ LessonList.jsx (383 řádků) - CSS variables pro background, borders
- ✅ LessonCard.jsx (170 řádků) - font utility classes, CSS variables
- ✅ LessonModal.jsx (233 řádků) - CSS variables pro backgrounds a borders
- ✅ NoteCard.jsx (48 řádků) - už čisté, žádné změny

### Hlavní změny
- **Borders:** Všechny bordery nahrazeny za border: 'none' + boxShadow
- **Backgrounds:** Hardcoded rgba() nahrazeny za CSS variables (--glass-bg, --color-secondary-transparent, --color-success-transparent)
- **Font styles:** Převedeny na utility classes (.text-sm)
- **Unused imports:** Odstraněny

### Výsledek
**100% KOMPLETNÍ** - Všechny lesson komponenty jsou modulární a používají CSS variables

---

## 📋 CARD MODULARIZACE UPDATE (3.12.2025)

### EditFormContainer.jsx
- ✅ **Fix glass effect corner artifacts** - Opraveny viditelné rohy
- ✅ **Refaktorováno na Card komponentu** - Místo inline stylů
- ✅ **Modulární design** - Používá Card, SectionHeader
- ✅ **Dokumentace aktualizována** - JSDoc komentáře

### LessonList.jsx - GlassCard Removal
- ✅ **GlassCard odstraněn** - Nahrazen Card komponentou
- ✅ **Import změněn** - `import { Card } from '../ui/CardComponents'`
- ✅ **Props aktualizovány:**
  ```jsx
  // Před:
  <GlassCard animate animationProps={{...}}>

  // Po:
  <Card as={motion.div} opacity={0.8} blur="30px" initial={{...}} animate={{...}}>
  ```

### Card Component Enhancement
- ✅ **Přidán `as` prop** - Polymorfní komponenta
- ✅ **Motion.div support** - `<Card as={motion.div} />`
- ✅ **Standardizace:** blur="30px", opacity={0.8}
- ✅ **Single source of truth** pro glassmorphism

### Soubory změněny
- `src/components/ui/EditFormContainer.jsx` - refaktorováno
- `src/components/lessons/LessonList.jsx` - GlassCard → Card
- `src/components/ui/CardComponents.jsx` - přidán `as` prop
- `src/components/ui/GlassCard.jsx` - **SMAZÁN** (duplicitní)

### Benefity
- ✅ Konzistentní glassmorphism napříč všemi lekcemi
- ✅ Menší bundle size (odstranění GlassCard)
- ✅ Modulární EditFormContainer používaný v lesson editaci
- ✅ Fix corner artifacts pro lepší vizuální kvalitu

### Dokumentace
- `SESSION_CONTEXT-20251203-card-modularization.md` - Detailní dokumentace změn
