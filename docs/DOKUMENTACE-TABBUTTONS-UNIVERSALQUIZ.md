# Dokumentace - TabButtons & UniversalQuizManager

## Datum: 2025-11-23

---

## 1. TabButtons - Modulární UI komponenty

### Umístění
`/src/components/ui/TabButtons.jsx`

### Popis
Centralizovaný systém UI komponent pro celou aplikaci. Všechny kvízové managery a admin komponenty používají tyto komponenty pro zajištění konzistentního designu.

### Exportované komponenty

#### 1.1 Chip
**Účel:** Zobrazení značek pro odpovědi, obtížnost a stavy

**Props:**
- `text` (string) - Text chipu
- `variant` (string) - 'answer' | 'difficulty' | 'inactive' | 'answer-correct'
- `level` (number) - Úroveň obtížnosti 1-3 (pro variant='difficulty')
- `isCorrect` (boolean) - Je odpověď správná? (pro variant='answer')
- `style` (object) - Dodatečné styly

**Styly podle variant:**
- `difficulty`: Růžový gradient s borderem
- `answer`: Šedý gradient, neutrální
- `answer-correct`: Bílý background s vnitřním glow
- `inactive`: Šedý, neaktivní vzhled

**Příklad:**
```jsx
<Chip text="1" variant="difficulty" level={1} />
<Chip text="C dur" variant="answer" isCorrect={true} />
```

---

#### 1.2 ActionButton
**Účel:** Akční tlačítka pro edit, duplikovat, smazat

**Props:**
- `variant` (string) - 'edit' | 'duplicate' | 'delete'
- `onClick` (function) - Callback funkce
- `iconOnly` (boolean) - **Default: true** - Zobrazit jen ikonu
- `style` (object) - Dodatečné styly

**Styly:**
- BorderRadius: 14px
- Hover efekt se scale a stínem
- Velikost: 38x38px (iconOnly)

**Příklad:**
```jsx
<ActionButton variant="edit" onClick={() => handleEdit(id)} />
<ActionButton variant="delete" onClick={() => handleDelete(id)} />
```

---

#### 1.3 RadioLabel
**Účel:** Radio button pro výběr správné odpovědi

**Props:**
- `checked` (boolean) - Je zaškrtnutý?
- `onChange` (function) - Callback při změně
- `name` (string) - Name atribut
- `label` (string) - Default: 'Správná'

**Styly:**
- Padding: 0.35rem 0.6rem
- BorderRadius: 10px
- MinWidth: 95px

**Příklad:**
```jsx
<RadioLabel
  checked={option.is_correct}
  onChange={() => handleChange()}
  name="correct_answer"
/>
```

---

#### 1.4 FormContainer
**Účel:** Kontejner pro formuláře

**Props:**
- `children` (node) - Obsah kontejneru
- `style` (object) - Dodatečné styly
- `as` (Component) - Custom element (default: 'div')

**Styly:**
- Padding: 1.25rem
- BorderRadius: 22px
- BoxShadow: Univerzální šedý stín

**Příklad:**
```jsx
<FormContainer style={{ background: 'transparent' }}>
  <FormLabel text="Otázka" required />
  <FormTextarea value={text} onChange={handleChange} />
</FormContainer>
```

---

#### 1.5 PageCard
**Účel:** Hlavní kontejner stránky

**Props:**
- `children` (node) - Obsah karty
- `style` (object) - Dodatečné styly

**Styly:**
- Background: Gradient animace
- BorderRadius: 22px
- Padding: 1.25rem
- BoxShadow: Univerzální šedý stín

---

## 2. UniversalQuizManager

### Umístění
`/src/components/admin/UniversalQuizManager.jsx`

### Popis
Univerzální komponenta pro správu kvízových otázek.

### Props
- `quizType` (string) - Default: 'theory'
- `title` (string) - Default: 'Správa kvízů'
- `icon` (Component) - Default: BookOpen

### Konstanty

#### DEFAULT_OPTIONS
```javascript
const DEFAULT_OPTIONS = [
  { option_name: '', is_correct: true, display_order: 1 },
  { option_name: '', is_correct: false, display_order: 2 },
  { option_name: '', is_correct: false, display_order: 3 },
  { option_name: '', is_correct: false, display_order: 4 }
];
```

#### getDifficultyLevel(difficulty)
Převádí textovou obtížnost na číselnou úroveň.

```javascript
getDifficultyLevel('easy')    // → 1
getDifficultyLevel('medium')  // → 2
getDifficultyLevel('hard')    // → 3
```

### UI Komponenty z TabButtons

- ✅ PageCard - Hlavní kontejner
- ✅ FormContainer - Formulář
- ✅ Chip - Obtížnost, status, odpovědi
- ✅ ActionButton - Edit, duplikovat, smazat
- ✅ RadioLabel - Správná odpověď
- ✅ FormLabel, FormTextarea, FormSelect, FormInput
- ✅ CheckboxLabel, AddButton, HelpButton
- ✅ CancelButton, SaveButton

---

## 3. Help Content - Nápověda pro uživatele

### getHelpContent()
Funkce vrací kontextovou nápovědu podle typu kvízu.

#### Struktura:
- `steps` - Kroky pro přidání otázky (stejné pro všechny typy)
- `tips` - Tipy specifické podle typu kvízu

#### Theory Quiz (quizType='theory'):
**Rozšířené tipy:**
- Základní tipy (správná odpověď, vyplnění polí, aktivnost, pořadí)
- Témata: intervaly, stupnice, akordy, harmonie, notace
- Obtížnost Snadné: základní pojmy (durové/mollové akordy, jednoduché intervaly)
- Obtížnost Střední: složitější teorie (septakordy, kvintakord, inverze)
- Obtížnost Těžké: pokročilá harmonie (alterované akordy, modulace, tonální funkce)
- Formulace otázek: jasně a jednoznačně
- Odpovědi: podobné obtížnosti, aby nebyla jasná hned na první pohled

**Příklad použití:**
```javascript
const helpContent = getHelpContent();
<HelpPanel
  isOpen={showHelp}
  title={`Nápověda - ${title}`}
  content={helpContent}
/>
```

---

## 4. Optimalizace

### Provedené:

1. **Odstranění duplicity DEFAULT_OPTIONS**
   - Jedna konstanta místo 3x opakování

2. **Helper funkce getDifficultyLevel()**
   - Nahradila duplicitní ternary operátory

3. **Modulární komponenty**
   - Vše centralizováno v TabButtons.jsx

4. **Kontextová nápověda**
   - Specifický obsah pro teorii hudby

### Zachováno:

- ✅ Console.error pro error tracking
- ✅ Vodící komentáře

---

## 5. Budoucí změny

- [ ] Success/Error zprávy → Notifikační systém
- [ ] Rozšíření na další quiz managery
- [ ] Specifická nápověda pro listening quiz
