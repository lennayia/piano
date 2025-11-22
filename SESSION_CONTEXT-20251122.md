# Session Context - 22. listopadu 2025

## Cíl session
Kompletní modernizace TheoryQuizManager s důrazem na modulární UI komponenty a konzistentní design.

## Co bylo hotovo

### 1. Oprava databázových column names
- Zjištěno: Databáze používá `option_name` místo `option_text`
- Zjištěno: Databáze používá `name` místo `question`
- Opraveno ve všech souborech pomocí bulk replace

### 2. Vytvoření modulárních UI komponent

#### Chip komponent
- 4 varianty: difficulty, answer, answer-correct, inactive
- Moderní gradient design
- Inner glow efekt pro správné odpovědi
- Kompaktní velikost

#### ActionButton komponent
- 3 varianty: edit, duplicate, delete
- IconOnly režim
- Touch-friendly (38×38px)
- Gradient pozadí podle varianty

#### AddButton komponent
- Primary barva
- Shine efekt při hoveru
- IconOnly režim (44×44px)
- Vstupní animace

#### HelpButton komponent
- Jemný design
- Backdrop blur
- Active stav s primary barvou
- 36×36px velikost

### 3. Redesign TheoryQuizManager
- 2-řádkový layout pro každou otázku
- Responzivní chipy odpovědí
- Akční ikony vpravo
- Větší border-radius (18px)
- Jemnější border (1px)
- Výraznější glow efekt

### 4. Implementace nových funkcí
- Funkce handleDuplicateQuestion
- Kopírování otázky s "(kopie)" sufixem
- Kopírování všech odpovědí

## Soubory změněny

### TabButtons.jsx (+155 řádků)
- Chip komponent
- ActionButton komponent
- AddButton komponent
- HelpButton komponent

### TheoryQuizManager.jsx (-70 řádků, +87 upravených)
- Import nových komponent
- Oprava column names
- Nový layout
- Duplikace funkce
- Modernizace designu

### TheoryQuiz.jsx (malé změny)
- Oprava column names

## Design systém

### Border-radius škála
```
10px - Chip, ActionButton (small)
14px - ActionButton, HelpButton
17px - AddButton
18px - Kontejner otázky
```

### Border
```
1px solid rgba(0, 0, 0, 0.08) - Univerzální jemný border
```

### Shadows
```
Jemný:   0 2px 6px rgba(0, 0, 0, 0.06)
Střední: 0 3px 12px rgba(0, 0, 0, 0.12)
Glow:    0 6px 24px rgba(181, 31, 101, 0.2), 0 2px 8px rgba(181, 31, 101, 0.1)
Inner:   inset 0 0 16px rgba(45, 91, 120, 1)
```

## Klíčové technologie

### Framer Motion
- whileHover animace
- whileTap animace
- initial/animate pro vstupy
- transition konfigurace

### Lucide React Icons
- Edit, Copy, Trash2, Plus, HelpCircle
- Konzistentní velikost: 14-22px

### CSS-in-JS
- Inline styles
- Gradient backgrounds
- Backdrop blur
- Box-shadow layers

## Responsive design
- FlexWrap pro zalamování chipů
- marginLeft: auto pro zarovnání vpravo
- Touch-friendly minimální velikosti
- Gap pro spacing mezi elementy

## Performance optimalizace
- useState pro hover stavy
- React.useState místo importu
- Memoizace není nutná (malé komponenty)

## Accessibility připraveno
- Semantic HTML (button)
- Title attributy
- Cursor: pointer
- Keyboard navigace (native button)

## Použití komponent

### Příklad Chip
```jsx
<Chip text="1" variant="difficulty" />
<Chip text="5 čar" variant="answer" isCorrect={true} />
<Chip text="Neaktivní" variant="inactive" />
```

### Příklad ActionButton
```jsx
<ActionButton variant="edit" onClick={handleEdit} iconOnly={true} />
<ActionButton variant="duplicate" onClick={handleDuplicate} iconOnly={true} />
<ActionButton variant="delete" onClick={handleDelete} iconOnly={true} />
```

### Příklad AddButton
```jsx
<AddButton onClick={handleAdd} iconOnly={true} />
<AddButton onClick={handleAdd} label="Přidat otázku" />
```

### Příklad HelpButton
```jsx
<HelpButton onClick={toggleHelp} isActive={showHelp} />
```

## Iterace během session

1. První pokus - chipy s textem obtížnosti → změněno na čísla
2. Velikost chipů - zmenšeno několikrát
3. Správná odpověď - iterace opacity → inner glow
4. ActionButton - původně vertikálně → horizontálně vpravo
5. AddButton - s textem → iconOnly
6. Border-radius - postupné zvětšování na 17-18px

## Naučené lekce

1. **Column names** - Vždy zkontrolovat skutečné názvy sloupců v DB
2. **Iterativní design** - Postupné úpravy vedou k lepšímu výsledku
3. **Modulární komponenty** - Lepší než inline definice
4. **Touch-friendly** - Minimálně 38×38px pro ikony
5. **Flexbox** - marginLeft: auto pro zarovnání vpravo
6. **Border-radius** - Větší hodnoty (15-18px) vypadají moderněji
7. **Box-shadow** - Dvojité stíny pro větší hloubku

## Následující kroky

### Bezprostřední
- [ ] Push změn do gitu
- [ ] Test na mobilních zařízeních
- [ ] Zkontrolovat všechny stavy (hover, active, disabled)

### Krátkodobé
- [ ] Aplikovat ActionButton do ChordManager
- [ ] Vytvořit SaveButton a CancelButton
- [ ] Unified spacing system

### Dlouhodobé
- [ ] Theme system
- [ ] Dark mode podpora
- [ ] Animation presets
- [ ] Component library dokumentace

## Poznámky pro budoucí session

### Důležité kontexty
- Databáze: `piano_quiz_theory` + `piano_quiz_theory_options`
- Column names: `name`, `option_name`, `is_correct`, `display_order`
- Barvy: Primary (růžová), Secondary (modrá)

### Stylovací konvence
- Border-radius: 10-18px škála
- Border: 1px solid s nízkou opacity
- Shadows: Vícevrstevné pro hloubku
- Gradients: 135deg směr
- Transitions: 0.2-0.3s ease

### Component props pattern
```javascript
{
  onClick: function,
  variant: string,
  iconOnly: boolean,
  style: object,
  ...props: rest
}
```

## SQL připomínky

### Tabulky
```sql
piano_quiz_theory {
  id, name, difficulty, is_active, display_order
}

piano_quiz_theory_options {
  id, theory_question_id, option_name, is_correct, display_order
}
```

## Git workflow
- Branch: main
- Commit messages: Podrobné s emojis
- Co-Authored-By: Claude

---

**Session délka:** ~2 hodiny
**Počet změn:** 194+ řádků
**Soubory:** 3 hlavní + 2 dokumentační
**Status:** Připraveno k push
