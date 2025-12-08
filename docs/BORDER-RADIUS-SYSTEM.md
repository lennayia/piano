# Border Radius System

Modulární systém pro konzistentní border-radius napříč celou aplikací.

## Struktura

### CSS Proměnné (`src/styles/index.css`)

```css
:root {
  /* Border Radius System */
  --radius-sm: 0.625rem;      /* 10px - small elements */
  --radius-md: 0.75rem;       /* 12px - medium elements */
  --radius-lg: 1rem;          /* 16px - large elements */
  --radius-xl: 1.375rem;      /* 22px - extra large */
}
```

### JavaScript Konstanty (`src/utils/styleConstants.js`)

```javascript
export const RADIUS = {
  sm: '10px',    // Small elements
  md: '12px',    // Medium elements
  lg: '16px',    // Large elements
  xl: '22px',    // Extra large
};
```

## Použití

### V CSS

```css
.button {
  border-radius: var(--radius-sm);
}

.card {
  border-radius: var(--radius-xl);
}
```

### V inline stylech (React)

```javascript
import { RADIUS } from '@/utils/styleConstants';

// V komponentě
<div style={{ borderRadius: RADIUS.xl }}>
  Content
</div>
```

## Aplikační guide

### RADIUS.sm (10px)
**Použití:** Malé interaktivní elementy
- Tlačítka (buttons)
- Input pole (text, number, select)
- Chip komponenty (badges, tags)
- Radio button labels
- Checkbox labels

**Příklady:**
- Tlačítka "Zrušit", "Uložit"
- Input pole v formulářích
- Odpovědi v kvízech ("Správná")
- Možnosti odpovědí

### RADIUS.md (12px)
**Použití:** Středně velké kontejnery
- Form containers
- Modal dialogy
- Tooltips
- Dropdown menu

**Příklady:**
- Formulář pro přidání/editaci otázky (vnitřní kontejner)

### RADIUS.lg (16px)
**Použití:** Velké kontejnery a panely
- Cards (původní hodnota)
- Panels
- Sidebars
- Navigation bars

**Příklady:**
- Dashboard cards
- Statistické panely
- Side panels

### RADIUS.xl (22px)
**Použití:** Extra velké hlavní kontejnery
- Main page containers
- Question cards
- Feature sections
- Hero sections

**Příklady:**
- Hlavní kontejner QuizManager (.card)
- Jednotlivé karty s otázkami
- Formulář pro přidání/editaci (vnější kontejner)

## Implementované komponenty

### ✅ UniversalQuizManager
- [x] Hlavní kontejner (.card) → RADIUS.xl
- [x] Form container → RADIUS.xl
- [x] Textarea (text otázky) → RADIUS.lg
- [x] Select (obtížnost) → RADIUS.sm
- [x] Input (pořadí) → RADIUS.sm
- [x] Checkbox label (aktivní) → RADIUS.sm
- [x] Option container → RADIUS.sm
- [x] Option input → RADIUS.sm
- [x] Tlačítka (Zrušit, Uložit) → RADIUS.sm
- [x] Question cards → RADIUS.xl

### ✅ QuizManager
- [x] Card container (UniversalQuizManager) → RADIUS.xl
- [x] Card container (ChordManager) → RADIUS.xl

## Budoucí rozšíření

### Další komponenty k implementaci:
- [ ] Admin.jsx - všechny card kontejnery
- [ ] ChordManager.jsx - form elementy
- [ ] AchievementManager.jsx - karty a formuláře
- [ ] TheoryQuizManager.jsx - všechny elementy
- [ ] GamificationManager.jsx - kontejnery
- [ ] UserList.jsx - karty uživatelů
- [ ] Dashboard.jsx - statistické karty

## Maintenance

### Změna hodnot
1. Upravte CSS proměnné v `src/styles/index.css`
2. Synchronizujte hodnoty v `src/utils/styleConstants.js`
3. Aplikace se automaticky aktualizuje

### Přidání nové velikosti
1. Přidejte CSS proměnnou: `--radius-xxl: 2rem;`
2. Přidejte JS konstantu: `xxl: '32px'`
3. Dokumentujte použití v tomto souboru

## Notes

- Staré hardcoded hodnoty byly nahrazeny modulárním systémem
- Systém je zpětně kompatibilní (stará `--radius` proměnná zůstává)
- Všechny změny jsou centralizované v jednom souboru
- Pro CSS použijte CSS proměnné, pro inline styly JS konstanty
