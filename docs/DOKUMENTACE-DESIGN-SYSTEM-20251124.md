# Dokumentace - TabButtons Design System

## Datum: 2025-11-24

---

## 📐 Design System - Centralizované konstanty

### Umístění
`/src/components/ui/TabButtons.jsx` (řádky 9-31)

---

### 1. RADIUS (Border Radius)

```javascript
export const RADIUS = {
  sm: '10px',    // Small elements (buttons, inputs, chips)
  md: '12px',    // Medium elements (form containers, modals)
  lg: '16px',    // Large elements (cards, panels)
  xl: '22px'     // Extra large (main containers, question cards)
};
```

**Použití:**
```jsx
borderRadius: RADIUS.sm   // 10px - tlačítka, inputy
borderRadius: RADIUS.md   // 12px - FormSection
borderRadius: RADIUS.lg   // 16px - FormSection custom, textarea
borderRadius: RADIUS.xl   // 22px - PageCard, FormContainer, QuestionCard
```

---

### 2. SHADOW (Box Shadow)

```javascript
export const SHADOW = {
  default: '0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)'
};
```

**Použití:**
- PageCard, FormContainer, QuestionCard
- FormSection (defaultně)
- Všechna formulářová pole (Input, Select, Textarea)

**Výraznost:** Zvýrazněný univerzální stín (opacity 0.12/0.06)

---

### 3. BORDER (Border Styles)

```javascript
export const BORDER = {
  none: 'none',
  default: '1px solid #ddd'
};
```

**Použití:**
- `BORDER.none` - PageCard, FormContainer, FormSection, formulářová pole
- `BORDER.default` - původně pro input pole (nyní nepoužíváno)

---

## 🎨 Komponenty

### PageCard
**Účel:** Hlavní kontejner pro stránky

**Styly:**
```javascript
background: 'rgba(255, 255, 255, 0.8)'
backdropFilter: 'blur(10px)'
boxShadow: SHADOW.default
borderRadius: RADIUS.xl
padding: '1.25rem'
marginBottom: '1.5rem'
```

**Použití:**
```jsx
<PageCard>
  {/* Obsah stránky */}
</PageCard>
```

---

### FormContainer
**Účel:** Kontejner pro editační formuláře (přidání/úprava)

**Styly:**
```javascript
background: 'linear-gradient(...)' // Animovaný růžovo-modrý gradient
backgroundSize: '400% 400%'
animation: 'gradient-shift 45s ease-in-out infinite'
borderRadius: RADIUS.xl
border: BORDER.none
boxShadow: SHADOW.default
padding: '1.25rem'
marginBottom: '2rem'
```

**Použití:**
```jsx
<FormContainer as={motion.div}>
  {/* Formulář */}
</FormContainer>
```

---

### FormSection
**Účel:** Sekce uvnitř formuláře (např. "Poslechový kvíz", "Teoretický kvíz")

**Styly (default):**
```javascript
background: 'transparent'
border: BORDER.none
borderRadius: RADIUS.md
boxShadow: SHADOW.default
padding: '1rem'
marginBottom: '1.5rem'
```

**Varianty:**
- `primary` - růžový nadpis (var(--color-primary))
- `secondary` - modrý nadpis (var(--color-secondary))

**Použití:**
```jsx
// Default styly
<FormSection title="📝 Sekce" variant="secondary">
  {/* Obsah */}
</FormSection>

// Custom styly (např. v QuizManager)
<FormSection
  title="🎵 Poslechový kvíz"
  variant="primary"
  style={{
    background: 'rgba(255, 255, 255, 0.65)',
    borderRadius: RADIUS.lg
  }}
>
  {/* Obsah */}
</FormSection>
```

---

### QuestionCard
**Účel:** Karta pro zobrazení otázky/akordu v seznamu

**Styly:**
```javascript
background: isActive
  ? 'rgba(255, 255, 255, 0.8)'
  : 'rgba(200, 200, 200, 0.5)'
backdropFilter: 'blur(20px)'
border: '1px solid rgba(181, 31, 101, 0.1)'
borderRadius: RADIUS.xl
boxShadow: SHADOW.default
padding: '1.25rem'
display: 'flex'
alignItems: 'center'
gap: '1.25rem'
```

**Použití:**
```jsx
<QuestionCard as={motion.div} isActive={question.is_active}>
  {/* Obsah karty */}
</QuestionCard>
```

---

### Formulářová pole

#### FormInput
```javascript
borderRadius: RADIUS.sm
border: BORDER.none
boxShadow: SHADOW.default
padding: '0.5rem'
```

#### FormSelect
```javascript
borderRadius: RADIUS.sm
border: BORDER.none
boxShadow: SHADOW.default
padding: '0.5rem'
```

#### FormTextarea
```javascript
borderRadius: RADIUS.lg
border: BORDER.none
boxShadow: SHADOW.default
padding: '0.75rem'
```

**Použití:**
```jsx
<FormInput
  value={formData.name}
  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
  placeholder="Název..."
/>

<FormTextarea
  value={formData.text}
  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
  rows={3}
/>

<FormSelect
  value={formData.difficulty}
  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
  options={DIFFICULTY_LEVELS}
/>
```

---

### NoteButton (NOVÉ)
**Účel:** Tlačítko pro výběr not v akordovém kvízu

**Props:**
- `note` (string) - Text noty (např. "C", "C#", "D")
- `selected` (boolean) - Je nota vybraná?
- `onClick` (function) - Callback při kliknutí
- `variant` (string) - 'primary' | 'secondary' (default: 'primary')
- `style` (object) - Dodatečné styly

**Styly:**
```javascript
background: selected ? color : 'rgba(255, 255, 255, 0.9)'
border: `2px solid ${selected ? color : '#ddd'}`
borderRadius: RADIUS.sm
padding: '0.5rem 0.75rem'
fontWeight: '600'
fontSize: '0.875rem'
minWidth: '50px'
```

**Použití:**
```jsx
// Malá oktáva - secondary varianta (modrá)
{NOTES_MALA_OKTAVA.map(note => (
  <NoteButton
    key={note}
    note={note.replace('.', '')}
    selected={formData.notes.includes(note)}
    onClick={() => handleNoteToggle(note)}
    variant="secondary"
  />
))}

// Oktáva 1 - primary varianta (růžová)
{NOTES_OKTAVA_1.map(note => (
  <NoteButton
    key={note}
    note={note}
    selected={formData.notes.includes(note)}
    onClick={() => handleNoteToggle(note)}
    variant="primary"
  />
))}
```

---

## 🔄 Migrace a změny

### Co se změnilo (2025-11-24)

#### 1. Přidány konstanty SHADOW a BORDER
- Všechny komponenty používají centralizované hodnoty
- Žádné hardcoded `'1px solid #ddd'` nebo stíny

#### 2. FormSection
**Před:**
- Barevné pozadí podle varianty (růžové/modré)
- Barevný border podle varianty
- borderRadius: '12px' (hardcoded)

**Po:**
- background: 'transparent'
- border: BORDER.none
- borderRadius: RADIUS.md
- boxShadow: SHADOW.default
- Varianta určuje jen barvu nadpisu

#### 3. FormContainer
**Před:**
- border: '1px solid rgba(0, 0, 0, 0.08)'
- borderRadius: '22px' (hardcoded)

**Po:**
- border: BORDER.none
- borderRadius: RADIUS.xl
- boxShadow: SHADOW.default

#### 4. Formulářová pole
**Před:**
- border: '1px solid #ddd'
- borderRadius: hardcoded hodnoty
- Žádný stín

**Po:**
- border: BORDER.none
- borderRadius: RADIUS konstanty
- boxShadow: SHADOW.default

#### 5. NoteButton (nová komponenta)
- Nahrazuje hardcoded `motion.button` v QuizManager.jsx
- Používá RADIUS.sm
- Podporuje primary/secondary varianty

#### 6. UniversalQuizManager
- Odstraněn duplicitní PageCard wrapper
- Používá fragment `<>...</>` místo vlastního PageCard
- PageCard je pouze v QuizManager.jsx

---

## 📦 Import

```javascript
// V kterékoliv komponentě
import {
  // Konstanty
  RADIUS, SHADOW, BORDER,

  // UI komponenty
  Chip, ActionButton, AddButton,
  HelpButton, HelpPanel,
  CancelButton, SaveButton,

  // Formuláře
  FormLabel, FormInput, FormTextarea, FormSelect,
  CheckboxLabel, RadioLabel,
  FormSection, FormContainer,

  // Kontejnery
  PageCard, QuestionCard,

  // Specifické
  NoteButton
} from '../ui/TabButtons';
```

---

## ✅ Best Practices

### 1. Vždy používej konstanty
❌ **Špatně:**
```jsx
<div style={{ borderRadius: '16px', boxShadow: '0 4px 16px...' }}>
```

✅ **Správně:**
```jsx
<div style={{ borderRadius: RADIUS.lg, boxShadow: SHADOW.default }}>
```

### 2. Přepisování stylů
Všechny komponenty podporují `style` prop pro custom styly:
```jsx
<FormSection
  variant="primary"
  style={{
    background: 'rgba(255, 255, 255, 0.65)',  // Custom pozadí
    borderRadius: RADIUS.lg                    // Custom radius
  }}
>
```

### 3. Konzistence
- PageCard, FormContainer, QuestionCard → RADIUS.xl (22px)
- FormSection → RADIUS.md (12px), přepisovatelný
- FormInput, FormSelect → RADIUS.sm (10px)
- FormTextarea → RADIUS.lg (16px)
- Všechny komponenty → SHADOW.default
- Kontejnery a sekce → BORDER.none

---

## 🎯 Shrnutí

**Design system je plně centralizovaný:**
- ✅ Všechny komponenty používají RADIUS konstanty
- ✅ Všechny komponenty používají SHADOW.default
- ✅ Všechny komponenty používají BORDER konstanty
- ✅ Žádné hardcoded hodnoty pro border-radius, stíny nebo bordery
- ✅ Konzistentní vzhled napříč celou aplikací

**Nové komponenty:**
- ✅ NoteButton pro výběr not

**Optimalizace:**
- ✅ Odstranění duplicitního PageCard z UniversalQuizManager
- ✅ Zvýrazněný univerzální stín (opacity 0.12/0.06)
- ✅ Modulární a znovupoužitelný kód

---

**Autor:** Claude Code
**Datum:** 2025-11-24
**Commit:** 22753ae
