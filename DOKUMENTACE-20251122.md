# Dokumentace Piano Learning App - 22. listopadu 2025

## Přehled session

Session zaměřená na kompletní redesign TheoryQuizManager s důrazem na moderní UI komponenty a konzistentní design napříč aplikací.

## Hlavní změny

### 1. Oprava column names v databázi
**Problém:** Aplikace používala nesprávné názvy sloupců z databáze
- Databáze obsahuje `option_name` (ne `option_text`)
- Databáze obsahuje `name` (ne `question`)

**Řešení:**
- Opraveny všechny reference v `TheoryQuizManager.jsx` a `TheoryQuiz.jsx`
- Použit `Edit` tool s `replace_all` parametrem pro bulk změny

### 2. Nový Chip komponent (TabButtons.jsx)

Moderní chip komponent pro zobrazení obtížnosti a odpovědí.

**Varianty:**
- `difficulty` - Číselná úroveň obtížnosti (1, 2, 3)
- `answer` - Neutrální chip pro odpovědi
- `answer-correct` - Správná odpověď s inner glow efektem
- `inactive` - Neaktivní stav

**Vlastnosti:**
```javascript
<Chip
  text="5 čar"
  variant="answer"
  isCorrect={true}
/>
```

**Design:**
- Border-radius: 10px
- Obtížnost: Primary barva gradient (růžová)
- Odpovědi: Neutrální šedý gradient
- Správná odpověď: Bílé pozadí + inner glow (secondary barva)
  - `boxShadow: 'inset 0 0 16px rgba(45, 91, 120, 1)'`
- Kompaktní velikost: padding 0.2-0.25rem, font-size 0.6875-0.75rem

### 3. ActionButton komponent (TabButtons.jsx)

Modulární tlačítka pro akce (upravit, duplikovat, smazat).

**Varianty:**
- `edit` - Secondary barva (modrá)
- `duplicate` - Neutrální šedá
- `delete` - Primary barva (růžová)

**Vlastnosti:**
```javascript
<ActionButton
  variant="edit"
  onClick={handleEdit}
  iconOnly={true}
/>
```

**Design:**
- Border-radius: 14px
- Border: 1px solid rgba(0, 0, 0, 0.08)
- Gradient pozadí pro každou variantu
- iconOnly režim: 38×38px čtvercové tlačítko
- Hover: Scale 1.03 + posun nahoru
- Touch-friendly velikost

### 4. AddButton komponent (TabButtons.jsx)

Primární akční tlačítko pro přidání nové položky.

**Vlastnosti:**
```javascript
<AddButton
  onClick={handleAdd}
  iconOnly={true}
/>
```

**Design:**
- Border-radius: 17px
- Border: 1px solid rgba(0, 0, 0, 0.08)
- Primary gradient pozadí
- Shine efekt při hoveru (bílá animace)
- iconOnly režim: 44×44px kulaté tlačítko s ikonou Plus
- Box-shadow: Dvojitý stín s primary barvou
- Animace: Scale + slide up při vstupu

### 5. HelpButton komponent (TabButtons.jsx)

Tlačítko nápovědy s jemným designem.

**Vlastnosti:**
```javascript
<HelpButton
  onClick={toggleHelp}
  isActive={showHelp}
/>
```

**Design:**
- Border-radius: 14px
- Border: 1px solid rgba(0, 0, 0, 0.08)
- Velikost: 36×36px
- Background: Secondary barva (0.08 opacity)
- Backdrop blur: 10px
- Active stav: Primary gradient
- Ikona mění barvu podle stavu

### 6. Redesign TheoryQuizManager

**Layout otázek:**

**Řádek 1:** Otázka (vlevo) + Chip obtížnosti + Status (vpravo)
**Řádek 2:** Chipy odpovědí (vlevo, vodorovně) + Akční ikony (vpravo)

**Kontejner otázky:**
- Border-radius: 18px (zvětšeno z var(--radius))
- Border: 1px solid rgba(181, 31, 101, 0.2) (ztenčeno z 2px)
- Box-shadow: Dvojitý růžový glow
  - `0 6px 24px rgba(181, 31, 101, 0.2), 0 2px 8px rgba(181, 31, 101, 0.1)`
- Backdrop blur: 20px
- Hover: Scale 1.01 + posun nahoru -2px

**Funkce duplikace:**
```javascript
const handleDuplicateQuestion = async (question) => {
  // Vytvoří kopii otázky s "(kopie)" sufixem
  // Zkopíruje všechny možnosti odpovědí
}
```

## Soubory změněny

### src/components/ui/TabButtons.jsx
**Nové komponenty:**
- `Chip` - Zobrazení obtížnosti a odpovědí
- `ActionButton` - Akční tlačítka (edit, duplicate, delete)
- `AddButton` - Primární tlačítko pro přidání
- `HelpButton` - Tlačítko nápovědy

**Importy:**
```javascript
import { Edit, Copy, Trash2, Plus, HelpCircle } from 'lucide-react';
```

### src/components/admin/TheoryQuizManager.jsx
**Změny:**
- Import nových komponent z TabButtons
- Oprava column names (option_text → option_name, question → name)
- Použití Chip pro zobrazení obtížnosti a odpovědí
- Použití ActionButton pro akční ikony
- Použití AddButton pro přidání otázky
- Použití HelpButton pro nápovědu
- Implementace handleDuplicateQuestion funkce
- Modernizace layoutu s flexboxem
- Zvětšený border-radius (18px) a glow efekt

### src/components/games/TheoryQuiz.jsx
**Změny:**
- Oprava column names (option_text → option_name, question → name)

## Design principles

### Border-radius hodnoty
- Chip: 10px
- ActionButton: 14px
- AddButton: 17px
- HelpButton: 14px
- Kontejner otázky: 18px

### Barvy
- Primary: `var(--color-primary)` - Růžová (181, 31, 101)
- Secondary: `var(--color-secondary)` - Modrá (45, 91, 120)
- Neutrální: Šedá (100, 116, 139)

### Shadows
- Jemné: `0 2px 6px rgba(0, 0, 0, 0.06)`
- Střední: `0 3px 12px rgba(0, 0, 0, 0.12)`
- Glow: Dvojitý stín s barvou komponenty

### Animace
- Scale: 1.01-1.05 při hoveru
- Posun nahoru: -1px až -2px
- Transition: cubic-bezier(0.4, 0, 0.2, 1)
- Framer Motion pro vstupní animace

## Touch-friendly
- Minimální velikost: 38×38px (ActionButton)
- Preferováno: 44×44px (AddButton)
- Gap mezi tlačítky: 0.375-0.5rem
- IconOnly režim pro čistší UI

## Responzivita
- FlexWrap na chipech odpovědí
- marginLeft: auto pro zarovnání ikon vpravo
- Chipy se automaticky zalomí na menších obrazovkách

## Konzistence
Všechny komponenty používají:
- Framer Motion pro animace
- Inline styles (CSS-in-JS)
- Lucide React ikony
- Gradient backgrounds
- Border s jemnou opacity
- Box-shadow pro hloubku

## Technické detaily

### Inner glow efekt (správná odpověď)
```css
boxShadow: 'inset 0 0 16px rgba(45, 91, 120, 1), 0 1px 3px rgba(45, 91, 120, 0.15)'
```

### Shine efekt (AddButton)
```javascript
<motion.div
  initial={{ x: '-100%' }}
  animate={{ x: '200%' }}
  transition={{ duration: 0.6 }}
  style={{
    position: 'absolute',
    width: '50%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
  }}
/>
```

### Backdrop blur
```css
backdropFilter: 'blur(10px)',
WebkitBackdropFilter: 'blur(10px)'
```

## Budoucí vylepšení

1. Aplikovat ActionButton a AddButton do ChordManager
2. Vytvořit SaveButton a CancelButton komponenty
3. Unified spacing system (8px grid)
4. Themovací systém pro barvy
5. Accessibility (aria-labels, keyboard navigation)

## Časová osa změn

1. Fix column names (option_text → option_name)
2. Vytvoření Chip komponenty
3. Iterace designu chipů (obtížnost jen číslo, menší velikost)
4. Inner glow pro správnou odpověď
5. ActionButton komponenta (3 varianty)
6. Implementace duplicate funkce
7. Layout změny (2 řádky)
8. AddButton komponenta s iconOnly
9. HelpButton komponenta
10. Border-radius optimalizace
11. Border 1px a větší glow na kontejneru

---

**Datum:** 22. listopadu 2025
**Autor:** Claude Code + Lenka Roubalová
**Verze:** 1.0
