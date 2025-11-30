# Dokumentace změn - 30. listopadu 2025

## 🎯 Hlavní změny

### 1. Kompletní refaktoring HarmonizationTemplates.jsx - 100% modulární architektura
**Účel:** Aplikovat modularitu na všechny komponenty v Šablonách harmonizace

**Provedené změny:**

#### A) Nahrazení všech hardcoded komponent modulárními

**Soubor:** `src/components/resources/HarmonizationTemplates.jsx`

**Nové importy:**
```javascript
import {
  Chip, ActionButtonGroup, AddButton, SaveButton, CancelButton, PlayButton
} from '../ui/ButtonComponents';
import {
  FormInput, FormTextarea, FormSelect, FormLabel
} from '../ui/FormComponents';
import { RADIUS, SHADOW, BORDER } from '../../utils/styleConstants';
```

**Nahrazené komponenty:**
1. **AddButton** - tlačítko "Přidat novou šablonu"
2. **FormInput** - input pole pro název, akordový postup, příklad
3. **FormSelect** - select pro obtížnost
4. **FormTextarea** - textarea pro popis
5. **SaveButton + CancelButton** - akční tlačítka formulářů
6. **ActionButtonGroup** - Edit→Duplicate→Delete skupina
7. **Chip** - badge pro obtížnost
8. **PlayButton** - tlačítko pro přehrání kadence

**Výsledky:**
- **Před:** 774 řádků
- **Po:** 598 řádků
- **Úspora:** -176 řádků (-22.7%)
- **Inline fontSize/fontFamily:** 0 výskytů
- **Style konstanty:** RADIUS, SHADOW, BORDER používány konzistentně

---

### 2. Vytvoření modularního PlayButton komponenta
**Účel:** Sjednotit play buttony napříč aplikací (SongLibrary, HarmonizationTemplates)

**Soubor:** `src/components/ui/ButtonComponents.jsx`

**Nový komponent:** `PlayButton` (řádky 380-443)

**Props:**
```javascript
{
  onClick,           // Callback při kliknutí
  isPlaying,         // Je právě přehráváno?
  variant,           // 'pause' (Play/Pause) nebo 'volume' (Play/Volume2)
  size,              // Velikost v px (default: 44)
  iconSize,          // Velikost ikony (default: 22)
  style              // Dodatečné styly
}
```

**Design:**
- Modrý gradient (secondary color): `linear-gradient(135deg, rgba(45, 91, 120, 0.9), rgba(65, 111, 140, 0.9))`
- Růžový gradient při playing: `linear-gradient(135deg, rgba(181, 31, 101, 0.9), rgba(221, 51, 121, 0.9))`
- Backdrop blur efekt: `blur(20px)`
- Border: `BORDER.none`
- Border radius: `RADIUS.lg` (16px)
- Box shadow: dynamický podle stavu

**Varianty:**
1. **variant="pause"** (default)
   - Ikony: Play / Pause
   - Použití: SongLibrary (melodie lze pausnout)

2. **variant="volume"**
   - Ikony: Play / Volume2
   - Použití: HarmonizationTemplates (kadence se přehraje celá)

**Animace:**
- whileHover: `{ scale: 1.15, rotate: 5 }`
- whileTap: `{ scale: 0.9 }`

---

### 3. Implementace PlayButton v aplikaci

#### A) HarmonizationTemplates.jsx
**Řádky:** 423-428

```javascript
<PlayButton
  onClick={() => playCadence(template)}
  isPlaying={playingTemplate === template.id}
  disabled={playingTemplate !== null && playingTemplate !== template.id}
  variant="volume"
/>
```

**Chování:**
- Přehrává celou kadenci (sekvence akordů)
- Volume2 ikona při přehrávání (nelze pausnout)
- Disabled stav když hraje jiná šablona

#### B) SongLibrary.jsx
**Řádky:** 1372-1375

```javascript
<PlayButton
  onClick={() => playMelody(song)}
  isPlaying={playingSong === song.id}
/>
```

**Chování:**
- Přehrává melodii písničky
- Pause ikona při přehrávání (lze pausnout)
- Size: 44px (stejné jako AddButton)

---

### 4. Optimalizace AddButton
**Soubor:** `src/components/ui/ButtonComponents.jsx`

**Změna:**
- Border radius: `'17px'` → `RADIUS.lg` (16px)
- Kompletní modularizace všech buttonů

---

### 5. Sjednocení velikostí tlačítek

**Standard velikosti:**
- **AddButton:** 44px (padding: 0.75rem, minWidth/minHeight: 44px)
- **PlayButton:** 44px (padding: 0.75rem, minWidth/minHeight: 44px)
- **ActionButton:** 38px (iconOnly režim)
- **SaveButton/CancelButton:** Auto (podle obsahu)

**Border radius:**
- AddButton, PlayButton: `RADIUS.lg` (16px)
- ActionButton: `14px`
- SaveButton, CancelButton: `10px`

---

### 6. Oprava chyby - Eye/EyeOff toggle v HarmonizationTemplates
**Problém:** Toggle tlačítko pro rozbalení šablony nemělo onClick handler

**Oprava:** Přidán onClick s `toggleTemplate(template.id)`

**Řádky:** 383-403

```javascript
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  onClick={(e) => {
    e.stopPropagation();
    toggleTemplate(template.id);
  }}
  style={{ /* ... */ }}
>
  {expandedTemplate === template.id ? (
    <EyeOff size={20} color="var(--color-secondary)" />
  ) : (
    <Eye size={20} color="var(--color-secondary)" />
  )}
</motion.button>
```

---

## 📊 Statistiky změn

### HarmonizationTemplates.jsx
- **Řádků před:** 774
- **Řádků po:** 598
- **Úspora:** -176 řádků (-22.7%)
- **Inline styly:** Kompletně odstraněny
- **Modulární komponenty:** 100%

### ButtonComponents.jsx
- **Nových komponent:** PlayButton
- **Upravených:** AddButton (RADIUS.lg)
- **Nových řádků:** +64 (PlayButton)

### SongLibrary.jsx
- **Nahrazeno:** Inline motion.button → PlayButton
- **Odstraněno z importů:** Play, Pause (nyní v PlayButton)

---

## 🎨 Design systém

### Gradienty
```javascript
// Modrý (secondary) - default stav
'linear-gradient(135deg, rgba(45, 91, 120, 0.9), rgba(65, 111, 140, 0.9))'

// Růžový (primary) - playing/active stav
'linear-gradient(135deg, rgba(181, 31, 101, 0.9), rgba(221, 51, 121, 0.9))'
```

### Border Radius
- `RADIUS.sm`: 10px
- `RADIUS.md`: 12px
- `RADIUS.lg`: 16px
- `RADIUS.xl`: 22px

### Shadows
- `SHADOW.subtle`: Jemný stín pro inputs
- `SHADOW.md`: Střední stín pro buttony
- Custom: `0 8px 32px rgba(...)` pro PlayButton

---

## ✅ Benefity

1. **100% modularita** - Všechny komponenty v HarmonizationTemplates jsou modulární
2. **Konzistence** - Jednotný design napříč SongLibrary a HarmonizationTemplates
3. **Reusabilita** - PlayButton lze použít kdekoliv v aplikaci
4. **Menší kód** - Úspora 176 řádků v HarmonizationTemplates
5. **Lepší UX** - Variant system pro Play/Pause vs Play/Volume2
6. **Snadná údržba** - Změna designu PlayButtonu se projeví všude

---

## 🔧 Technické detaily

### Nové komponenty a jejich použití

#### PlayButton
```javascript
// SongLibrary - melodie s pauzou
<PlayButton
  onClick={() => playMelody(song)}
  isPlaying={playingSong === song.id}
/>

// HarmonizationTemplates - kadence bez pauzy
<PlayButton
  onClick={() => playCadence(template)}
  isPlaying={playingTemplate === template.id}
  variant="volume"
/>
```

#### ActionButtonGroup
```javascript
<ActionButtonGroup
  onEdit={() => startEditingTemplate(template)}
  onDuplicate={() => duplicateTemplate(template.id)}
  onDelete={() => handleDeleteTemplate(template.id)}
  iconOnly={true}
  iconSize={14}
/>
```

#### FormComponents
```javascript
<FormInput
  label="Název šablony"
  value={newTemplateForm.title}
  onChange={(e) => handleNewTemplateChange('title', e.target.value)}
  placeholder="Zadejte název šablony"
/>

<FormSelect
  label="Obtížnost"
  value={newTemplateForm.difficulty}
  onChange={(e) => handleNewTemplateChange('difficulty', e.target.value)}
  options={[
    { value: 'začátečník', label: 'začátečník' },
    { value: 'mírně pokročilý začátečník', label: 'mírně pokročilý začátečník' },
    { value: 'pokročilý', label: 'pokročilý' }
  ]}
/>
```

---

## 📝 Historie session

### Refaktoring workflow
1. ✅ Přidány importy modularních komponent
2. ✅ Nahrazeno AddButton
3. ✅ Nahrazeny všechny form komponenty (FormInput, FormSelect, FormTextarea)
4. ✅ Nahrazeny Save/Cancel tlačítka
5. ✅ Nahrazena ActionButtonGroup
6. ✅ Nahrazen Chip pro obtížnost
7. ✅ Odstraněna funkce getDifficultyColor()
8. ✅ Aplikovány style konstanty (RADIUS, SHADOW, BORDER)
9. ✅ Odstraněny všechny inline font styly
10. ✅ Vytvořen PlayButton komponent
11. ✅ Implementován PlayButton v HarmonizationTemplates
12. ✅ Implementován PlayButton v SongLibrary
13. ✅ Optimalizovány velikosti a border-radius
14. ✅ Opravena chyba s Eye/EyeOff toggle onClick handlerem

---

## 🚀 Další kroky

1. Zvážit použití PlayButton i v dalších komponentách (Cviceni.jsx, TheoryQuizHub.jsx)
2. Vytvořit podobný refaktoring pro ostatní resource komponenty
3. Dokumentovat PlayButton variant system v design systému
4. Přidat unit testy pro PlayButton komponent

---

## 📌 Poznámky

- PlayButton má dva režimy (pause/volume) kvůli rozdílnému chování v různých částech aplikace
- Velikosti tlačítek jsou sjednoceny na 44px pro konzistenci
- Backdrop blur efekt dodává moderní frosted glass look
- Všechny změny jsou zpětně kompatibilní
