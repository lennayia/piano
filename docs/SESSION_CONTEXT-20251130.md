# Session Context - 30. listopadu 2025

## 🎯 Cíl session
Kompletní refaktoring HarmonizationTemplates.jsx na modulární komponenty a vytvoření univerzálního PlayButton

---

## ✅ Co bylo dokončeno

### 1. Refaktoring HarmonizationTemplates.jsx
**Před:** 774 řádků s hardcoded komponenty
**Po:** 598 řádků s modulárními komponenty
**Úspora:** -176 řádků (-22.7%)

#### Nahrazené komponenty:
1. ✅ AddButton - "Přidat novou šablonu"
2. ✅ FormInput - input pole pro název, postup, příklad
3. ✅ FormSelect - select pro obtížnost
4. ✅ FormTextarea - textarea pro popis
5. ✅ SaveButton + CancelButton - akční tlačítka
6. ✅ ActionButtonGroup - Edit→Duplicate→Delete
7. ✅ Chip - badge pro obtížnost
8. ✅ PlayButton - přehrávání kadence
9. ✅ Style konstanty - RADIUS, SHADOW, BORDER
10. ✅ Odstranění inline fontSize/fontFamily stylů

---

### 2. Vytvoření PlayButton komponenta
**Soubor:** `src/components/ui/ButtonComponents.jsx` (řádky 380-443)

#### Props:
```javascript
{
  onClick,      // Callback
  isPlaying,    // Stav přehrávání
  variant,      // 'pause' | 'volume'
  size,         // px (default: 44)
  iconSize,     // px (default: 22)
  style         // Custom styles
}
```

#### Varianty:
1. **variant="pause"** (default)
   - Ikony: Play / Pause
   - Pro: SongLibrary (melodie)

2. **variant="volume"**
   - Ikony: Play / Volume2
   - Pro: HarmonizationTemplates (kadence)

#### Design:
- Modrý gradient: `rgba(45, 91, 120, 0.9)` → `rgba(65, 111, 140, 0.9)`
- Růžový při playing: `rgba(181, 31, 101, 0.9)` → `rgba(221, 51, 121, 0.9)`
- Backdrop blur: 20px
- Border: none
- Border radius: RADIUS.lg (16px)
- Velikost: 44px (stejná jako AddButton)

---

### 3. Implementace PlayButton

#### A) HarmonizationTemplates.jsx
```javascript
<PlayButton
  onClick={() => playCadence(template)}
  isPlaying={playingTemplate === template.id}
  disabled={playingTemplate !== null && playingTemplate !== template.id}
  variant="volume"
/>
```

#### B) SongLibrary.jsx
```javascript
<PlayButton
  onClick={() => playMelody(song)}
  isPlaying={playingSong === song.id}
/>
```

---

### 4. Optimalizace design systému

#### Změny:
- AddButton: borderRadius `'17px'` → `RADIUS.lg`
- PlayButton: size 64px → 44px (default)
- Sjednocení všech tlačítek na 44px
- Konzistentní použití RADIUS, SHADOW, BORDER

---

### 5. Bug fix
**Problém:** Eye/EyeOff toggle v HarmonizationTemplates neměl onClick handler
**Fix:** Přidán `onClick={(e) => { e.stopPropagation(); toggleTemplate(template.id); }}`

---

## 📁 Změněné soubory

### 1. HarmonizationTemplates.jsx
**Změny:**
- +11 importů (modular komponenty + constants)
- -2 importy (Play, Volume2 → nyní v PlayButton)
- Nahrazeno 8 typů komponent
- Odstraněno 176 řádků
- 0 inline fontSize stylů

**Řádky:** 774 → 598

### 2. ButtonComponents.jsx
**Změny:**
- +2 importy (Play, Pause, Volume2)
- +64 řádků (PlayButton komponent)
- AddButton: borderRadius → RADIUS.lg

**Nový komponent:** PlayButton

### 3. SongLibrary.jsx
**Změny:**
- +1 import (PlayButton)
- -2 importy (Play, Pause)
- Nahrazen inline motion.button → PlayButton
- size: 64 → 44 (default)

---

## 🎨 Design konzistence

### Tlačítka - sjednocené velikosti:
- **AddButton:** 44px
- **PlayButton:** 44px
- **ActionButton:** 38px (iconOnly)
- **IconButton:** 48px (default)
- **SaveButton/CancelButton:** Auto

### Border Radius - modulární hodnoty:
- `RADIUS.sm`: 10px (small buttons)
- `RADIUS.md`: 12px (medium)
- `RADIUS.lg`: 16px (AddButton, PlayButton)
- `RADIUS.xl`: 22px (cards)

### Gradienty:
```javascript
// Secondary (modrý) - default
'linear-gradient(135deg, rgba(45, 91, 120, 0.9), rgba(65, 111, 140, 0.9))'

// Primary (růžový) - active/playing
'linear-gradient(135deg, rgba(181, 31, 101, 0.9), rgba(221, 51, 121, 0.9))'
```

---

## 🔄 Workflow session

1. ✅ Analýza HarmonizationTemplates.jsx
2. ✅ Plán refaktoringu
3. ✅ Přidání importů
4. ✅ Nahrazení AddButton
5. ✅ Nahrazení form komponent
6. ✅ Nahrazení Save/Cancel
7. ✅ Nahrazení ActionButtonGroup
8. ✅ Nahrazení Chip
9. ✅ Aplikace style konstant
10. ✅ Odstranění inline stylů
11. ✅ Diskuze o PlayButton
12. ✅ Vytvoření PlayButton (snaha #1 - vlastní návrh)
13. ✅ Revize - převzetí designu z SongLibrary
14. ✅ Vytvoření finálního PlayButton
15. ✅ Implementace v HarmonizationTemplates
16. ✅ Implementace v SongLibrary
17. ✅ Optimalizace velikostí
18. ✅ Přidání variant systému (pause/volume)
19. ✅ Fix Eye/EyeOff onClick
20. ✅ Dokumentace

---

## 💡 Důležité poznatky

### 1. Konzultace s uživatelem
- Vždy se ptát na existující komponenty místo vymýšlení vlastních
- "vždyť už máme playbutton" → kontrola ButtonComponents.jsx
- User chtěl převzít design z SongLibrary, ne vymýšlet nový

### 2. Design systém
- PlayButton v SongLibrary měl kulatý tvar (borderRadius: 50%)
- User chtěl RADIUS.md → finálně RADIUS.lg
- User chtěl stejnou velikost jako AddButton → 44px
- Border 2px původně byl součástí, ale byl odstraněn

### 3. Variant systém
- Pause ikona dává smysl pro SongLibrary (melodie lze pausnout)
- Volume2 ikona dává smysl pro HarmonizationTemplates (kadence nelze pausnout)
- Řešení: prop `variant` pro výběr chování

### 4. Modulární přístup
- Všechny inline komponenty nahradit modulárními
- Style konstanty pro všechny rozměry
- 0 inline fontSize/fontFamily/fontWeight
- Konzistence napříč aplikací

---

## 🚀 Další kroky (budoucí)

1. Zvážit použití PlayButton v dalších komponentách:
   - Cviceni.jsx
   - TheoryQuizHub.jsx
   - Další místa s play funkčností

2. Refaktorovat další resource komponenty podobně jako HarmonizationTemplates

3. Vytvořit dokumentaci PlayButton variant systému

4. Přidat unit testy pro PlayButton

---

## 📊 Statistiky

- **Session trvání:** ~2 hodiny
- **Řádků kódu změněno:** ~250
- **Komponent vytvořeno:** 1 (PlayButton)
- **Komponent refaktorováno:** 3 (HarmonizationTemplates, SongLibrary, AddButton)
- **Bug fixes:** 1 (Eye/EyeOff onClick)

---

## 🔗 Související soubory

- `DOKUMENTACE-20251130.md` - detailní dokumentace změn
- `MASTER_TODO.md` - aktualizováno (30.11.2025)
- `src/components/resources/HarmonizationTemplates.jsx`
- `src/components/ui/ButtonComponents.jsx`
- `src/components/resources/SongLibrary.jsx`
- `src/utils/styleConstants.js`

---

## ⚠️ Poznámky pro další session

1. **PlayButton je nyní standardní** - používat všude kde je play funkcionalita
2. **Variant systém** - 'pause' vs 'volume' podle kontextu
3. **Velikost 44px** je standard pro icon buttons
4. **RADIUS.lg** je standard pro medium buttons
5. **Vždy kontrolovat existující komponenty** před vytvářením nových

---

**Kontext vytvořen:** 30. listopadu 2025
**Pro session:** Refaktoring HarmonizationTemplates + PlayButton
**Autor:** Claude Code
