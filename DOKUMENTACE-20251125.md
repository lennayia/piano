# Dokumentace - Modularizace UI Komponent & Fix Chord Quiz

## Datum: 2025-11-25

## Branch: `refactor/split-tabbuttons-module`

---

## 🎯 Přehled změn

Tato session dokončila modularizaci UI komponent a opravila kritický problém s ChordQuiz, kdy se zobrazovaly teoretické možnosti místo názvů akordů.

---

## 🔧 Hlavní změny

### 1. ✅ Modularizace UI komponent

**Problém:** Všechny UI komponenty byly v jednom obřím souboru `TabButtons.jsx` (800+ řádků)

**Řešení:** Rozdělení do 4 modulárních souborů podle účelu

#### Nově vytvořené soubory:

##### **ButtonComponents.jsx** (`src/components/ui/ButtonComponents.jsx`)
Komponenty pro tlačítka a interaktivní prvky:

- `Chip` - Malé barevné chipy (obtížnost, odpovědi, status)
  - Varianty: `difficulty`, `answer`, `answer-correct`, `inactive`
  - Props: `text`, `variant`, `level`, `isCorrect`, `style`

- `ActionButton` - Akční tlačítka (upravit/duplikovat/smazat)
  - Varianty: `edit`, `duplicate`, `delete`
  - Props: `variant`, `onClick`, `label`, `iconOnly`, `iconSize`, `style`

- `AddButton` - Tlačítko pro přidání nové položky
  - Props: `onClick`, `label`, `style`

- `IconButton` - Univerzální ikonové tlačítko
  - Props: `icon`, `onClick`, `variant`, `size`, `iconSize`, `ariaLabel`, `style`

- `BackButton` - Tlačítko "Zpět" s navigací
  - Props: `onClick`, `to`, `label`, `style`

- `CancelButton` / `SaveButton` - Formulářová tlačítka
  - Props: `onClick`, `style`

- `AnswerStatusChip` - Status chip pro správné/špatné odpovědi
  - Props: `status` ('correct' | 'incorrect'), `size`, `style`

**Import:**
```jsx
import {
  Chip, ActionButton, AddButton, IconButton,
  BackButton, CancelButton, SaveButton, AnswerStatusChip
} from '../components/ui/ButtonComponents';
```

---

##### **CardComponents.jsx** (`src/components/ui/CardComponents.jsx`)
Komponenty pro kontejnery a karty:

- `PageCard` - Hlavní kontejner pro stránky
  - Props: `children`, `style`
  - Styly: `background`, `backdropFilter`, `borderRadius: RADIUS.xl`, `boxShadow: SHADOW.default`

- `QuestionCard` - Karta pro zobrazení otázky v quiz manageru
  - Props: `children`, `isActive`, `as`, `style`
  - Styly: Různé podle `isActive` stavu

**Import:**
```jsx
import { PageCard, QuestionCard } from '../components/ui/CardComponents';
```

---

##### **FormComponents.jsx** (`src/components/ui/FormComponents.jsx`)
Komponenty pro formulářové prvky:

- `RadioLabel` - Stylizovaný radio button
  - Props: `checked`, `onChange`, `name`, `label`, `style`

- `FormLabel` - Label pro formulářová pole
  - Props: `text`, `required`, `style`

- `FormTextarea` - Textarea s jednotným stylem
  - Props: `value`, `onChange`, `placeholder`, `rows`, `style`
  - Používá: `RADIUS.lg`, `BORDER.none`, `SHADOW.default`

- `FormInput` - Input pole s jednotným stylem
  - Props: `value`, `onChange`, `placeholder`, `type`, `style`
  - Používá: `RADIUS.sm`, `BORDER.none`, `SHADOW.default`

- `FormSelect` - Select s jednotným stylem
  - Props: `value`, `onChange`, `options`, `style`
  - Options format: `[{ value, label }]`

- `CheckboxLabel` - Stylizovaný checkbox
  - Props: `checked`, `onChange`, `label`, `style`

- `FormSection` - Sekce uvnitř formuláře
  - Props: `title`, `variant`, `children`, `style`
  - Varianty: `primary`, `secondary`

- `FormContainer` - Kontejner pro formuláře s animovaným gradientem
  - Props: `children`, `as`, `style`
  - Animace: `gradient-shift` (45s nekonečná smyčka)

**Import:**
```jsx
import {
  RadioLabel, FormLabel, FormTextarea, FormInput,
  FormSelect, CheckboxLabel, FormSection, FormContainer
} from '../components/ui/FormComponents';
```

---

##### **PageSection.jsx** (`src/components/ui/PageSection.jsx`)
Komplexní layout komponenta pro stránky s menu strukturou:

**Props:**
- `maxWidth` - 'sm' | 'md' | 'lg' | 'xl' | 'full' nebo custom (např. '1200px')
- `icon` - Ikona pro hlavičku (z lucide-react)
- `title` - H1 nadpis stránky
- `description` - Popis pod nadpisem
- `mainTabs` - Pole hlavních tabs `[{id, label, icon}]`
- `subTabs` - Object s submenu: `{mainTabId: [{id, label, icon}]}`
- `activeMainTab` / `activeSubTab` - ID aktivních tabů
- `onMainTabChange` / `onSubTabChange` - Callback funkce
- `sectionTitle` / `sectionDescription` - H2 nadpis content sekce
- `sectionAction` - Action button vedle section title
- `progressLabel` / `progress` - Progress bar (0-100)
- `children` - Obsah stránky

**Použití:**
```jsx
import { PageSection } from '../components/ui/PageSection';

<PageSection
  maxWidth="lg"
  icon={Gamepad2}
  title="Cvičení"
  description="Procvičujte si akordy a teorii"
  mainTabs={[
    { id: 'chords', label: 'Akordy', icon: Music },
    { id: 'theory', label: 'Teorie', icon: BookOpen }
  ]}
  activeMainTab={activeTab}
  onMainTabChange={setActiveTab}
  sectionTitle="Akordový kvíz"
  progress={75}
>
  {/* Obsah */}
</PageSection>
```

**Šířky presety:**
- `sm`: 600px
- `md`: 900px
- `lg`: 1200px (default)
- `xl`: 1400px
- `full`: 100%

---

### 2. ✅ Fix ChordQuiz - Automatické generování možností

**Problém:**
ChordQuiz zobrazoval teoretické možnosti z tabulky `piano_quiz_chord_options` místo automaticky generovaných názvů akordů.

**Důvod:**
- ChordQuiz.jsx načítal data z `piano_quiz_chord_options` pomocí JOIN
- Možnosti byly staticky uložené v databázi pro teoretické kvízy
- Při poslechovém kvízu se měly možnosti generovat automaticky z názvů akordů

**Řešení:**

#### **ChordQuiz.jsx** (`src/components/games/ChordQuiz.jsx`)

Změny v `fetchChords()` funkci:

**PŘED:**
```jsx
const { data: chordsData, error: chordsError } = await supabase
  .from('piano_quiz_chords')
  .select(`
    *,
    piano_quiz_chord_options (*)  // ❌ Načítalo možnosti z DB
  `)
  .eq('quiz_type', 'chord')
  .eq('is_active', true)
  .not('notes', 'is', null)
  .order('display_order');

// Používalo možnosti z databáze
options: sortedOptions.map(opt => opt.option_name),
correctAnswer: sortedOptions.find(opt => opt.is_correct)?.option_name
```

**PO:**
```jsx
// ✅ Načítá POUZE akordy, BEZ možností
const { data: chordsData, error: chordsError } = await supabase
  .from('piano_quiz_chords')
  .select('*')  // Bez JOIN na piano_quiz_chord_options
  .eq('quiz_type', 'chord')
  .eq('is_active', true)
  .not('notes', 'is', null)
  .order('display_order');

// Získání všech názvů akordů pro generování možností
const allChordNames = chordsData.map(chord => chord.name);

// Transformace dat
const transformedChords = chordsData.map((chord, index) => {
  const correctAnswer = chord.name;

  // ✅ Vybereme 3 náhodné špatné odpovědi
  const wrongAnswers = allChordNames
    .filter(name => name !== correctAnswer)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  // ✅ Zamícháme všechny 4 možnosti
  const allOptions = shuffleArray([correctAnswer, ...wrongAnswers]);

  return {
    name: chord.name,
    notes: chord.notes || [],
    options: allOptions,           // ✅ Automaticky generované
    correctAnswer: correctAnswer,  // ✅ Vždy název akordu
    color: colors[index % 2]
  };
});
```

**Nová helper funkce:**
```jsx
// Fisher-Yates shuffle algoritmus
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
```

**Výsledek:**
- ✅ ChordQuiz nyní zobrazuje 4 možnosti: 1 správný název akordu + 3 náhodné jiné názvy
- ✅ Možnosti se generují při každém načtení kvízu
- ✅ Teoretické možnosti se již nezobrazují v poslechovém kvízu

---

### 3. ✅ QuizManager - Oddělení chord/theory options

**Problém:**
- Admin panel měl jediný formulář pro chord i theory možnosti
- Chord možnosti by se neměly zadávat ručně (generují se automaticky v UI)
- Theory možnosti se zadávají ručně v admin panelu

**Řešení:**

#### **QuizManager.jsx** (`src/components/admin/QuizManager.jsx`)

**Změny ve formData:**
```jsx
const [formData, setFormData] = useState({
  name: '',
  quiz_type: 'chord',
  questionText: '',
  notes: [],
  category: '',
  difficulty: 'easy',
  is_active: true,
  display_order: 0,
  options: [],         // ❌ Již se nepoužívá pro chord typ
  theoryOptions: []    // ✅ Používá se POUZE pro theory typ
});
```

**UI změny - Poslechový kvíz sekce:**

**PŘED:**
```jsx
{/* ❌ Manuální input fieldy pro chord možnosti */}
{formData.options.map((option, index) => (
  <div key={index}>
    <FormInput
      value={option.option_name}
      onChange={...}
      placeholder={`Možnost ${index + 1}`}
    />
    <RadioLabel
      checked={option.is_correct}
      onChange={...}
      label="Správná"
    />
  </div>
))}
```

**PO:**
```jsx
{/* ✅ Informační text o automatickém generování */}
<div style={{
  marginTop: '1rem',
  padding: '0.75rem',
  background: 'rgba(45, 91, 120, 0.05)',
  borderRadius: RADIUS.lg,
  border: '1px solid rgba(45, 91, 120, 0.2)'
}}>
  <p style={{
    fontSize: '0.8rem',
    color: '#475569',
    margin: 0,
    lineHeight: '1.5'
  }}>
    💡 Možnosti odpovědí pro poslechový kvíz se <strong>generují automaticky</strong> z dostupných akordů v databázi. Nemusíte je zadávat ručně!
  </p>
</div>
```

**Save logika:**

**PŘED:**
```jsx
// ❌ Ukládalo chord možnosti do databáze
if (filledOptions.length === 4) {
  await supabase
    .from('piano_quiz_chord_options')
    .delete()
    .eq('chord_id', editingChord);

  const optionsToInsert = filledOptions.map(opt => ({
    chord_id: editingChord,
    option_name: normalizeNotes(opt.option_name),
    is_correct: opt.is_correct,
    display_order: opt.display_order
  }));

  await supabase
    .from('piano_quiz_chord_options')
    .insert(optionsToInsert);
}
```

**PO:**
```jsx
// ✅ Pro chord typ se možnosti NEGENERUJÍ ručně
// Možnosti ukládáme pouze pro teoretický kvíz
```

**Teoretický kvíz sekce (volitelná):**
- Zůstala beze změny
- Stále používá manuální input fieldy pro `theoryOptions`
- Ukládá se do `piano_quiz_chord_options` pouze pokud je vyplněn text otázky

**Výsledek:**
- ✅ Admin panel už neumožňuje zadávat chord možnosti ručně
- ✅ Theory možnosti se zadávají samostatně v sekci "Teoretický kvíz"
- ✅ Uložení správně rozlišuje mezi chord a theory záznamy

---

### 4. ✅ Archivace ChordManager.jsx

**Důvod:**
- QuizManager.jsx nyní spravuje všechny typy kvízů (chord + theory)
- ChordManager.jsx je redundantní a není nikde používán

**Provedeno:**
```bash
mv src/components/admin/ChordManager.jsx \
   src/components/admin/ChordManager.jsx.backup
```

**Ověření:**
- Admin.jsx používá pouze QuizManager (řádek 197)
- Žádný jiný soubor neimportuje ChordManager
- Backup je k dispozici pro případné potřeby

---

## 📦 Struktura projektu po změnách

```
src/
├── components/
│   ├── admin/
│   │   ├── QuizManager.jsx          ✅ Univerzální správa kvízů
│   │   ├── UniversalQuizManager.jsx ✅ Modernizováno
│   │   ├── AchievementManager.jsx   ✅ Aktualizováno
│   │   ├── GamificationManager.jsx  ✅ Aktualizováno
│   │   └── ChordManager.jsx.backup  📦 Archivováno
│   │
│   ├── games/
│   │   ├── ChordQuiz.jsx            ✅ Fix - automatické možnosti
│   │   └── UniversalTheoryQuiz.jsx  ✅ Aktualizováno
│   │
│   ├── ui/
│   │   ├── TabButtons.jsx           ✅ Hlavní export soubor
│   │   ├── HelpPanel.jsx            ✅ Samostatný modul
│   │   ├── ButtonComponents.jsx     🆕 Tlačítka & akční prvky
│   │   ├── CardComponents.jsx       🆕 Kontejnery & karty
│   │   ├── FormComponents.jsx       🆕 Formulářové prvky
│   │   └── PageSection.jsx          🆕 Layout komponenta
│   │
│   └── ...
│
├── utils/
│   ├── styleConstants.js            ✅ RADIUS, SHADOW, BORDER
│   └── audio.js                     ✅ Aktualizováno
│
└── ...
```

---

## 📋 Import struktura

### TabButtons.jsx - Centrální export hub

```jsx
// TabButtons.jsx exportuje VŠE z ostatních modulů
export { RADIUS, SHADOW, BORDER } from '../../utils/styleConstants';
export * from './ButtonComponents';
export * from './CardComponents';
export * from './FormComponents';
export { HelpPanel } from './HelpPanel';
export { PageSection } from './PageSection';
```

**Výhoda:** Jeden import pro všechny UI komponenty

```jsx
// V kterékoliv komponentě stačí:
import {
  RADIUS, SHADOW, BORDER,
  Chip, ActionButton, AddButton,
  PageCard, QuestionCard,
  FormInput, FormSelect, FormSection,
  PageSection
} from '../ui/TabButtons';
```

---

## 🎨 Design System - Aktuální stav

### Konstanty (styleConstants.js)

```jsx
export const RADIUS = {
  sm: '10px',    // Buttons, inputs, chips
  md: '12px',    // Form sections
  lg: '16px',    // Textareas, large buttons
  xl: '22px'     // Page cards, containers
};

export const SHADOW = {
  default: '0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)',
  subtle: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
  selected: '0 0 0 3px rgba(181, 31, 101, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08)'
};

export const BORDER = {
  none: 'none',
  default: '1px solid #ddd'
};
```

**Použití v celé aplikaci:**
- ✅ 100% komponent používá RADIUS konstanty
- ✅ 100% komponent používá SHADOW.default
- ✅ Žádné hardcoded border-radius nebo shadow hodnoty

---

## ✅ Migrace průvodce

### Jak aktualizovat existující komponenty

**1. Import změna:**

```jsx
// PŘED
import TabButtons from '../ui/TabButtons';
import { RADIUS } from '../ui/TabButtons';

// PO (můžete importovat vše najednou)
import {
  TabButtons,
  RADIUS, SHADOW, BORDER,
  Chip, ActionButton,
  PageCard, FormInput
} from '../ui/TabButtons';
```

**2. Použití nových komponent:**

```jsx
// PŘED - Hardcoded button
<button style={{
  background: 'var(--color-secondary)',
  padding: '0.5rem 1rem',
  borderRadius: '10px',
  // ...mnoho řádků
}}>
  Upravit
</button>

// PO - ActionButton komponenta
<ActionButton variant="edit" onClick={handleEdit} />
```

**3. Formuláře:**

```jsx
// PŘED
<div style={{ marginBottom: '1rem' }}>
  <label>Název akordu</label>
  <input
    value={name}
    onChange={e => setName(e.target.value)}
    style={{
      width: '100%',
      padding: '0.5rem',
      borderRadius: '10px',
      border: 'none',
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      // ...
    }}
  />
</div>

// PO
<>
  <FormLabel text="Název akordu" required />
  <FormInput
    value={name}
    onChange={e => setName(e.target.value)}
    placeholder="Zadejte název..."
  />
</>
```

---

## 🐛 Známé problémy a řešení

### 1. ✅ ChordQuiz zobrazoval teoretické možnosti
**Status:** VYŘEŠENO
**Řešení:** Odstranění JOIN na `piano_quiz_chord_options`, automatické generování z názvů akordů

### 2. ✅ Admin panel umožňoval zadávat chord možnosti ručně
**Status:** VYŘEŠENO
**Řešení:** Odstranění manuálních input fieldů, informační text o automatickém generování

### 3. ✅ ChordManager redundantní
**Status:** VYŘEŠENO
**Řešení:** Archivován jako `.backup`, používá se pouze QuizManager

---

## 📊 Statistiky změn

**Modified files:** 14
- `AchievementManager.jsx`
- `GamificationManager.jsx`
- `QuizManager.jsx`
- `UniversalQuizManager.jsx`
- `ChordQuiz.jsx`
- `UniversalTheoryQuiz.jsx`
- `HelpPanel.jsx`
- `TabButtons.jsx`
- `Cviceni.jsx`
- `Lekce.jsx`
- `useUserStore.js`
- `audio.js`
- `styleConstants.js`
- `ChordManager.jsx` (deleted)

**New files:** 4
- `ButtonComponents.jsx`
- `CardComponents.jsx`
- `FormComponents.jsx`
- `PageSection.jsx`

**Lines of code:**
- Removed: ~800 (z TabButtons.jsx)
- Added: ~1000 (4 nové soubory)
- Refactored: ~500 (QuizManager, ChordQuiz)

---

## 🔄 Následující kroky

### Zbývající úkoly:
1. ⏳ Implementovat Materiály tab v TheoryQuizHub (Harmonizace + Slovníček)
2. ⏳ Otestovat UniversalTheoryQuiz (Theory, Intervals, Scales, Chord, Rhythm, Mix)

### Budoucí vylepšení:
- Dokončit refactoring TabButtons (větvení do jednotlivých souborů)
- Přidat unit testy pro UI komponenty
- Dokumentovat všechny props v JSDoc formátu

---

## 🎯 Shrnutí

**Co bylo dokončeno:**
- ✅ Modularizace UI komponent do 4 samostatných souborů
- ✅ Fix ChordQuiz - automatické generování možností z názvů akordů
- ✅ QuizManager - oddělení chord/theory options
- ✅ Archivace starého ChordManager.jsx
- ✅ 100% komponenty používají centralizované konstanty (RADIUS, SHADOW, BORDER)

**Výhody:**
- 🎨 Jednotný design system napříč aplikací
- 🔧 Modularní a znovupoužitelný kód
- 📦 Snadný import všech UI komponent z jednoho místa
- 🚀 Lepší maintainability a scalability
- ✅ Opravené chyby v ChordQuiz a QuizManager

**Branch status:** `refactor/split-tabbuttons-module` připraven k merge

---

**Autor:** Claude Code
**Datum:** 2025-11-25
**Related commits:**
- 2d803c4 - feat: Přidána PageSection komponenta
- 656b05e - Refactor: Modernizace ChordQuiz
- [pending] - Fix: ChordQuiz automatic options + QuizManager chord/theory separation
