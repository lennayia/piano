# Použití univerzálních editačních formulářových komponent

Tento dokument popisuje, jak použít optimalizované formulářové komponenty v různých částech aplikace (Gamifikace, XP Body, atd.).

## 📦 Dostupné komponenty

### 1. EditFormContainer
Univerzální kontejner pro editační formuláře s optimalizovaným designem.

**Vlastnosti:**
- ✅ Kompaktní padding (1rem 0.75rem)
- ✅ Světlé pozadí s jemným stínem
- ✅ Animované otevírání/zavírání
- ✅ Border-radius: RADIUS.lg
- ✅ Responzivní pro mobily

### 2. FormField
Wrapper pro jednotlivá form pole s konzistentním spacingem.

**Spacing varianty:**
- `compact`: 0.5rem (výchozí)
- `tight`: 0.35rem (pro ještě kompaktnější layout)
- `none`: 0 (žádný margin)

### 3. FormFieldGrid
Grid kontejner pro dva fieldy vedle sebe (např. Obtížnost + Délka).

**Vlastnosti:**
- ✅ Responzivní grid (auto-fit)
- ✅ Minimální šířka 200px
- ✅ Wrap na mobilech
- ✅ Konfigurovatelný gap a margin

---

## 🎯 Příklady použití

### Příklad 1: Jednoduchý editační formulář (např. XP Body)

\`\`\`jsx
import { useState } from 'react';
import { Edit3 } from 'lucide-react';
import EditFormContainer from '../ui/EditFormContainer';
import { FormField, FormFieldGrid } from '../ui/FormField';
import { FormLabel, FormInput, FormSelect } from '../ui/FormComponents';
import { SaveButton, CancelButton } from '../ui/ButtonComponents';

function XPBodyManager() {
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});

  return (
    <div>
      {/* Grid s kartami */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {items.map(item => (
          <div key={item.id} style={{ gridColumn: editingItem === item.id ? '1 / -1' : 'auto' }}>
            {/* Karta */}
            <div style={{ maxWidth: editingItem === item.id ? '400px' : 'none' }}>
              <ItemCard
                item={item}
                onEdit={() => setEditingItem(item.id)}
              />
            </div>

            {/* Editační formulář */}
            <EditFormContainer
              isOpen={editingItem === item.id}
              icon={Edit3}
              title="Upravit XP Body"
            >
              <FormField spacing="compact">
                <FormLabel text="Název aktivity" />
                <FormInput
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </FormField>

              <FormFieldGrid gap="tight" marginBottom="tight">
                <FormField spacing="none">
                  <FormLabel text="XP Body" />
                  <FormInput
                    type="number"
                    value={editForm.xp}
                    onChange={(e) => setEditForm({ ...editForm, xp: e.target.value })}
                  />
                </FormField>

                <FormField spacing="none">
                  <FormLabel text="Kategorie" />
                  <FormSelect
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    options={[
                      { value: 'lesson', label: 'Lekce' },
                      { value: 'song', label: 'Písnička' }
                    ]}
                  />
                </FormField>
              </FormFieldGrid>

              <FormField spacing="compact">
                <FormLabel text="Popis" />
                <FormTextarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={2}
                />
              </FormField>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <SaveButton onClick={handleSave} label="Uložit" />
                <CancelButton onClick={() => setEditingItem(null)} />
              </div>
            </EditFormContainer>
          </div>
        ))}
      </div>
    </div>
  );
}
\`\`\`

---

### Příklad 2: Formulář pro Gamifikaci (achievementy)

\`\`\`jsx
import { Trophy } from 'lucide-react';
import EditFormContainer from '../ui/EditFormContainer';
import { FormField } from '../ui/FormField';

function AchievementManager() {
  // ... state management

  return (
    <EditFormContainer
      isOpen={isEditing}
      icon={Trophy}
      title="Upravit Achievement"
    >
      <FormField spacing="compact">
        <FormLabel text="Název achievementu" />
        <FormInput value={form.title} onChange={handleChange} />
      </FormField>

      <FormField spacing="compact">
        <FormLabel text="Ikona (emoji)" />
        <FormInput
          value={form.icon}
          onChange={handleChange}
          placeholder="např. 🏆"
        />
      </FormField>

      <FormField spacing="compact">
        <FormLabel text="Podmínka pro odemčení" />
        <FormTextarea
          value={form.condition}
          onChange={handleChange}
          rows={3}
        />
      </FormField>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <SaveButton onClick={handleSave} />
        <CancelButton onClick={handleCancel} />
      </div>
    </EditFormContainer>
  );
}
\`\`\`

---

### Příklad 3: Vlastní spacing pro specifické případy

\`\`\`jsx
// Ultra kompaktní formulář
<EditFormContainer isOpen={true} icon={Settings} title="Nastavení">
  <FormField spacing="tight">
    <FormLabel text="Pole 1" />
    <FormInput />
  </FormField>

  <FormField spacing="tight">
    <FormLabel text="Pole 2" />
    <FormInput />
  </FormField>
</EditFormContainer>

// Bez mezer mezi poli
<FormFieldGrid gap="tight" marginBottom="none">
  <FormField spacing="none">
    <FormLabel text="Od" />
    <FormInput type="number" />
  </FormField>

  <FormField spacing="none">
    <FormLabel text="Do" />
    <FormInput type="number" />
  </FormField>
</FormFieldGrid>
\`\`\`

---

## 🎨 Design specifikace

### Barvy a styly
- **Pozadí kontejneru**: `rgba(248, 249, 250, 0.95)`
- **Stín**: `0 2px 8px rgba(0, 0, 0, 0.1)`
- **Border-radius**: `RADIUS.lg` (ze styleConstants)
- **Ikona barva**: `var(--color-secondary)`

### Spacing
- **Container padding**: `1rem 0.75rem`
- **Field margin (compact)**: `0.5rem`
- **Field margin (tight)**: `0.35rem`
- **Grid gap (tight)**: `0.35rem`

### Responzivita
- Minimální šířka gridu: `320px`
- Auto-wrap na mobilech
- Kompaktní padding pro malé obrazovky

---

## 📝 Tips & Best Practices

1. **Používej konzistentní spacing**
   - Pro většinu formulářů: `spacing="compact"`
   - Pro extra kompaktní layout: `spacing="tight"`

2. **Grid pro dva fieldy vedle sebe**
   - Používej `FormFieldGrid` pro fieldy, které mají smysl vedle sebe (např. Od-Do, Šířka-Výška)

3. **Margin mezi skupinami**
   - Mezi logickými skupinami polí použij větší spacing

4. **Custom styly**
   - Všechny komponenty podporují `style` prop pro custom úpravy

5. **Ikony**
   - Používej lucide-react ikony konzistentně
   - Barva ikony: `var(--color-secondary)`

---

## 🔗 Kde komponenty najdu

\`\`\`
src/components/ui/
  ├── EditFormContainer.jsx  # Hlavní kontejner
  ├── FormField.jsx          # Field wrappery
  ├── FormComponents.jsx     # Input/Select/Textarea komponenty
  └── ButtonComponents.jsx   # SaveButton, CancelButton
\`\`\`

---

## ✅ Checklist pro nový formulář

- [ ] Importuj `EditFormContainer` a `FormField`
- [ ] Nastav správné `isOpen` prop
- [ ] Použij konzistentní spacing (`compact` nebo `tight`)
- [ ] Pro dva fieldy vedle sebe použij `FormFieldGrid`
- [ ] Přidej ikonu a title k `EditFormContainer`
- [ ] Použij `SaveButton` a `CancelButton` ze `ButtonComponents`
- [ ] Otestuj responzivitu na 320px obrazovce

---

Vytvořeno podle optimalizovaného designu z Lekce sekce 🎹
