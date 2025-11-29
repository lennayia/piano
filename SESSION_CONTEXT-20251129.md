# Session Context - 29. listopadu 2025

## Přehled změn

### 1. Refaktoring nápovědy v SongLibrary - Modularizace Help dokumentace

**Cíl:** Sjednotit help dokumentaci napříč aplikací pomocí modulárních komponent HelpButton a HelpPanel.

**Problém:**
- Stará nápověda byla hardcoded přímo v NoteComposer komponentě jako accordion s ikonou knihy (📖)
- Duplicitní kód, nekonzistentní UI, těžší údržba
- Nová modulární help infrastruktura (HelpButton + HelpPanel) nebyla v SongLibrary využitá

**Řešení:**
- Přidání modularní help nápovědy do SongLibrary pod pole "Název písně"
- Odstranění staré accordion nápovědy z NoteComposer
- Využití existující komponenty NoteFormatHelpContent s novým HelpPanel systémem

---

## Změněné soubory

### 1. `/src/components/resources/SongLibrary.jsx`

**Přidané importy:**
```javascript
import { HelpButton } from '../ui/ButtonComponents';
import { HelpPanel } from '../ui/HelpPanel';
```

**Přidaný state:**
```javascript
const [showNoteFormatHelp, setShowNoteFormatHelp] = useState(false);
```

**Přidaná nápověda v NEW SONG formuláři (po poli "Název písně"):**
```javascript
{/* Nápověda - Formát zápisu not */}
<div style={{ marginBottom: '1rem' }}>
  <HelpButton
    onClick={(e) => {
      e.stopPropagation();
      setShowNoteFormatHelp(!showNoteFormatHelp);
    }}
    isActive={showNoteFormatHelp}
    title="Zobrazit nápovědu k formátu zápisu not"
  />
</div>

<HelpPanel isOpen={showNoteFormatHelp} title="Formát zápisu not">
  <NoteFormatHelpContent />
</HelpPanel>
```

**Přidaná nápověda v EDIT SONG formuláři (po poli "Název písně"):**
- Stejná struktura jako v new song formuláři
- Umístění: Řádky 1144-1159 (new song) a 1468-1483 (edit song)

---

### 2. `/src/components/resources/NoteComposer.jsx`

**Odstraněné:**
- **Celá stará accordion sekce s nápovědou** (251 řádků, původně řádky 377-627):
  - Motion button s ikonou `BookOpen` (📖)
  - AnimatePresence wrapper
  - Stará tabulka s formátem not
  - Všechny associated styles a animace

**Vyčištěné importy (řádek 2):**
```javascript
// PŘED:
import { Music, Plus, Trash2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

// PO:
import { Music, Plus, Trash2 } from 'lucide-react';
```

**Vyčištěné framer-motion importy (řádek 3):**
```javascript
// PŘED:
import { motion, AnimatePresence } from 'framer-motion';

// PO:
import { motion } from 'framer-motion';
```

**Odstraněný state (původně řádek 105):**
```javascript
const [showHelp, setShowHelp] = useState(false); // ODSTRANĚNO
```

---

## Benefity refaktoringu

### 1. Modularizace
- ✅ Help dokumentace nyní používá jednotný HelpButton + HelpPanel systém
- ✅ Konzistentní UI napříč celou aplikací (stejná ikona ❓, stejné animace)
- ✅ NoteFormatHelpContent zůstává zachován a je znovu použit

### 2. Čištění kódu
- ✅ Odstraněno 251 řádků duplicitního kódu z NoteComposer
- ✅ Vyčištěné unused importy (BookOpen, ChevronUp, ChevronDown, AnimatePresence)
- ✅ Vyčištěný unused state (showHelp)
- ✅ Menší bundle size

### 3. Lepší UX
- ✅ Nápověda je nyní dostupná v obou formulářích (new song + edit song)
- ✅ Nápověda je přímo pod polem "Název písně" (kde se zadávají noty)
- ✅ Konzistentní interakce s ostatními help panely v aplikaci

---

## Technické detaily

### Použité komponenty

**HelpButton** (`src/components/ui/ButtonComponents.jsx`)
- Modulární tlačítko s ikonou ❓
- Props: `onClick`, `isActive`, `title`
- Automatická rotace ikony při otevření/zavření

**HelpPanel** (`src/components/ui/HelpPanel.jsx`)
- Rozbalovací panel pro zobrazení help obsahu
- Props: `isOpen`, `title`, `children`
- Animace pomocí framer-motion (AnimatePresence)

**NoteFormatHelpContent** (`src/components/resources/SongLibrary.jsx`)
- Komponenta s tabulkami formátů not (délky not, speciální znaky, oktávy)
- Znovupoužitelná v různých kontextech
- Zůstává beze změny

---

## Proces refaktoringu

### Fáze 1: Přidání nové help nápovědy
1. Import HelpButton a HelpPanel do SongLibrary
2. Přidání state `showNoteFormatHelp`
3. Přidání HelpButton + HelpPanel do new song formuláře
4. Přidání HelpButton + HelpPanel do edit song formuláře
5. Umístění pod pole "Název písně" v obou formulářích

### Fáze 2: Odstranění staré nápovědy
1. Lokalizace staré accordion sekce v NoteComposer (řádky 377-627)
2. Odstranění celé sekce pomocí sed
3. Vytvoření zálohy (NoteComposer.jsx.bak)

### Fáze 3: Cleanup
1. Odstranění unused imports z lucide-react
2. Odstranění unused AnimatePresence z framer-motion
3. Odstranění unused state showHelp
4. Verifikace funkčnosti

---

## Soubory dotčené změnami

```
src/components/resources/SongLibrary.jsx       (+32 řádky)
src/components/resources/NoteComposer.jsx      (-255 řádků)
```

**Net změna:** -223 řádků kódu

---

## Testování

### Co testovat:
1. ✅ Otevření new song formuláře → kliknutí na HelpButton → zobrazení nápovědy
2. ✅ Otevření edit song formuláře → kliknutí na HelpButton → zobrazení nápovědy
3. ✅ Zavření help panelu kliknutím na HelpButton znovu
4. ✅ NoteComposer stále funguje bez staré nápovědy
5. ✅ Interaktivní klavír v NoteComposer stále funguje správně
6. ✅ Žádné console errors

---

## Poznámky

- Všechny změny jsou backwards compatible
- NoteFormatHelpContent komponenta zůstává nezměněna
- Stará záloha NoteComposer je uložena jako NoteComposer.jsx.bak
- Help dokumentace je nyní jednotná napříč celou aplikací
