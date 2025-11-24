# PageSection - Dokumentace

## Přehled

PageSection je univerzální layout komponenta pro stránky s hierarchickou navigací (menu + submenu). Nachází se v `src/components/ui/TabButtons.jsx`.

## Použití

```jsx
import { PageSection } from '../components/ui/TabButtons';
import { BookOpen, List, Clock } from 'lucide-react';

<PageSection
  // Layout
  maxWidth="lg"

  // Header
  icon={BookOpen}
  title="Lekce"
  description="Procházejte své lekce a pokračujte v učení"

  // Navigace - 1. úroveň
  mainTabs={[
    { id: 'all', label: 'Všechny', icon: List },
    { id: 'in_progress', label: 'Probíhající', icon: Clock }
  ]}

  // Navigace - 2. úroveň (pills)
  subTabs={{
    'all': [
      { id: 'all', label: 'Vše' },
      { id: 'beginner', label: 'Začátečník' }
    ]
  }}

  activeMainTab={mainTab}
  activeSubTab={subTab}
  onMainTabChange={setMainTab}
  onSubTabChange={setSubTab}

  // Content sekce
  sectionTitle="Všechny lekce"
  sectionDescription="Procházejte kompletní nabídku lekcí"

  // Progress bar
  progressLabel="Váš pokrok"
  progress={42}
>
  <YourContent />
</PageSection>
```

## Props

### Layout Props
- `maxWidth` (string, default: 'lg'): Maximální šířka stránky
  - Předvolby: 'sm' (600px), 'md' (900px), 'lg' (1200px), 'xl' (1400px), 'full' (100%)
  - Nebo vlastní hodnota: '950px', '80%'

### Header Props
- `icon` (React.Component): Ikona z lucide-react pro hlavičku
- `title` (string): H1 nadpis stránky
- `description` (string): Popisný text pod nadpisem

### Navigace Props
- `mainTabs` (array): Pole hlavních tabs [{id, label, icon}]
- `subTabs` (object): Object s submenu pro každý hlavní tab: {mainTabId: [{id, label}]}
- `activeMainTab` (string): ID aktivního hlavního tabu
- `activeSubTab` (string): ID aktivního sub tabu
- `onMainTabChange` (function): Callback při změně hlavního tabu
- `onSubTabChange` (function): Callback při změně sub tabu

### Content Props
- `sectionTitle` (string): H2 nadpis content sekce
- `sectionDescription` (string): Popisný text pod section title
- `sectionAction` (React.Component): Action button/element vedle section title

### Progress Props
- `progressLabel` (string): Label pro progress bar (např. "Váš pokrok")
- `progress` (number): Progress bar hodnota (0-100)

### Children
- `children` (React.Component): Obsah stránky

## Struktura výstupu

```
┌────────────────────────────────────┐
│ [Icon] H1 Title                    │
│ Description                        │
├────────────────────────────────────┤
│ [Main Tab 1] [Main Tab 2]          │ ← 1. úroveň (větší)
│ [Pill 1] [Pill 2] [Pill 3]         │ ← 2. úroveň (menší)
├────────────────────────────────────┤
│ H2 Section Title                   │
│ Section description                │
│                                    │
│ Progress Label  [████████░░░] 80%  │ ← Na stejném řádku
│                                    │
│ Children content...                │
└────────────────────────────────────┘
```

## Všechny props jsou optional

Komponenta zobrazí pouze ty sekce, které mají poskytnutá data:
- Bez `mainTabs` → žádná navigace
- Bez `subTabs` pro aktivní tab → jen hlavní menu
- Bez `sectionTitle` → žádná content header
- Bez `progress` → žádný progress bar

## Příklady použití

### Minimální - jen header a obsah
```jsx
<PageSection
  icon={BookOpen}
  title="Lekce"
  description="Seznam vašich lekcí"
>
  <LessonList />
</PageSection>
```

### S navigací, bez progress
```jsx
<PageSection
  icon={Music}
  title="Cvičení"

  mainTabs={[...]}
  activeMainTab={tab}
  onMainTabChange={setTab}

  sectionTitle="Vybrané cvičení"
  sectionDescription="Procvičujte akordy"
>
  <ExerciseContent />
</PageSection>
```

### Kompletní s progress barem
```jsx
<PageSection
  maxWidth="lg"
  icon={Brain}
  title="Kvízy"

  mainTabs={[...]}
  subTabs={{...}}
  activeMainTab={mainTab}
  activeSubTab={subTab}
  onMainTabChange={setMainTab}
  onSubTabChange={setSubTab}

  sectionTitle="Váš výkon"
  sectionDescription="Statistiky z posledních kvízů"
  progressLabel="Celkový pokrok"
  progress={75}
>
  <QuizStats />
</PageSection>
```

## Design system

PageSection používá centralizované konstanty z TabButtons.jsx:
- `RADIUS` - border radius hodnoty
- `SHADOW` - box shadow hodnoty
- `BORDER` - border hodnoty

Progress bar:
- Výška: 4px
- Barvy: Gradient primary → secondary (50% opacity)
- Animace: 0.8s ease-out

## Modularita

**Aktuální stav:** PageSection je součástí TabButtons.jsx (1404 řádků)

**Plánovaný refactoring:**
```
ui/
├── constants.js       # RADIUS, SHADOW, BORDER
├── TabButtons.jsx     # TabButtons komponenta
├── PageSection.jsx    # PageSection komponenta
├── FormComponents.jsx # Form komponenty
├── Buttons.jsx        # Button komponenty
└── Cards.jsx          # UI komponenty
```

## Changelog

### 2025-11-24
- ✅ Vytvořena PageSection komponenta
- ✅ Přidána podpora pro dvouúrovňovou navigaci (mainTabs + subTabs)
- ✅ Přidána podpora pro progress bar
- ✅ Přidán progressLabel prop
- ✅ Optimalizován progress bar (4px, jemné barvy)
- ✅ Odstraněn divider pod section description
- ✅ Implementováno v Lekce.jsx jako demo

## Další kroky

1. Rozdělení TabButtons.jsx do samostatných modulů
2. Vytvoření unit testů pro PageSection
3. Přidání TypeScript definic
4. Rozšíření o další layout varianty (sidebar, split view, atd.)
