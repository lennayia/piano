# Session Context - 23. listopadu 2025

## Cíl session
Vytvoření modulárního HelpPanel komponentu a jeho implementace do všech admin sekcí s konzistentním designem.

## Co bylo hotovo

### 1. Vytvoření modulárního HelpButton komponentu
- Kompaktní design (36×36px)
- Secondary barva při hoveru (modrá)
- Backdrop blur efekt
- Border-radius 14px
- Unified design napříč aplikací

### 2. Vytvoření modulárního HelpPanel komponentu
**Základní vlastnosti:**
- Jemná secondary barva (rgba(45, 91, 120, 0.04))
- Border-radius 16px
- Border 1px (rgba(45, 91, 120, 0.15))
- Bez velké HelpCircle ikony uvnitř
- Bez emoji ikon v sekcích

**Dva režimy použití:**
1. **Standardní** - s `content` prop (steps + tips)
   - Responzivní dvousloupcový layout
   - `gridTemplateColumns: repeat(auto-fit, minmax(250px, 1fr))`
   - Automatické zalamování na menších obrazovkách

2. **Custom** - s `children` prop
   - Pro komplexnější obsah (ikony, interaktivní elementy)
   - Používá se v AchievementManager

### 3. Implementace do všech admin komponent

#### TheoryQuizManager
- Import HelpButton a HelpPanel
- Nahrazen hardcoded help panel
- Obsah: 6 kroků + 4 tipy
- Jednoduché textové seznamy

#### ChordManager
- Import HelpButton a HelpPanel
- Nahrazen starý motion.button
- Obsah: 6 kroků + 5 tipů (včetně rozsahu klaviatury)
- Tip o rozsahu klaviatury zjednodušen do jednoho řádku

#### GamificationManager
- Import HelpButton a HelpPanel
- Nahrazen hardcoded help panel
- Obsah: pouze 4 tipy (bez kroků)
- Popis jednotlivých funkcí gamifikace

#### AchievementManager
- Import HelpButton a HelpPanel
- Custom children obsah s vizuálními prvky
- **Vizuální zobrazení ikon:**
  - 18 dostupných ikon v gridu
  - Ikony v secondary barvě
  - Border v secondary barvě
- **Interaktivní zvuky:**
  - 5 zvuků v responzivním gridu (2-3 sloupce)
  - Tlačítko ▶ pro přehrání
  - Hover efekt se secondary barvou

### 4. Gradient pozadí pro QuizManager
- Animovaný gradient na hlavním card
- Stejný gradient jako na body elementu
- `background-size: 400% 400%`
- `animation: gradient-shift 45s ease-in-out infinite`
- Upravený gradient s méně růžové barvy
- Jemný outer glow v secondary barvě

### 5. Sound Generator utility
**Soubor:** `src/utils/soundGenerator.js`

**Funkce:** Generuje syntetické zvuky pomocí Web Audio API

**Zvuky:**
- `achievement` - C-E-G (pozitivní akord), 0.5s
- `fanfare` - C-E-G-C (slavnostní fanfára), 0.7s
- `success` - C-E-G (úspěšný zvuk), 0.4s
- `applause` - Stereo white noise s burst pattern, 0.6s
- `cheer` - G-C-E-G (dramatický vzestup), 0.4s

**Vlastnosti:**
- Triangle wave pro výraznější tón
- Individuální hlasitost pro každý tón (0.5-0.8)
- Rychlý attack (0.02s) pro živější zvuk
- Exponenciální fade-out

**Fallback systém:**
1. Zkusí načíst MP3 z `/sounds/`
2. Pokud selže, použije syntetický zvuk
3. Žádné chybové hlášky pro uživatele

## Soubory změněny

### TabButtons.jsx (+77 řádků upraveno)
**Nové exporty:**
- `HelpButton` - Modulární tlačítko nápovědy
- `HelpPanel` - Modulární panel s dvěma režimy

**Vlastnosti HelpPanel:**
- Podporuje `content` prop (steps + tips)
- Podporuje `children` prop (custom obsah)
- AnimatePresence pro animace
- Responzivní layout

### TheoryQuizManager.jsx (-60 řádků, +18 nových)
- Import HelpButton, HelpPanel
- Nahrazen hardcoded help button
- Nahrazen hardcoded help panel (60+ řádků → 18 řádků)
- Gradient background na card

### ChordManager.jsx (-82 řádků, +19 nových)
- Import HelpButton, HelpPanel
- Nahrazen starý help button
- Nahrazen hardcoded help panel

### GamificationManager.jsx (-30 řádků, +12 nových)
- Import HelpButton, HelpPanel
- Nahrazen help button
- Nahrazen help panel (jednodušší struktura)

### AchievementManager.jsx (-93 řádků, +90 nových)
- Import HelpButton, HelpPanel, soundGenerator
- Nahrazen help button
- Custom HelpPanel s vizuálními prvky:
  - Grid ikon (18 ikon)
  - Grid zvuků (5 zvuků) s přehráváním
  - Tip box

### QuizManager.jsx (+5 řádků)
- Přidán animovaný gradient na card
- Outer glow v secondary barvě

### soundGenerator.js (NOVÝ, 104 řádků)
- Web Audio API generátor zvuků
- 5 různých zvuků
- Triangle wave oscilátory
- Stereo white noise pro applause

### generate-sounds.js (NOVÝ, dokumentační)
- Dokumentace pro generování vlastních zvuků
- Tipy na zdroje zvuků
- Frekvence jednotlivých zvuků

## Design systém

### HelpButton
```
Velikost: 36×36px
Border-radius: 14px
Border: 1px solid rgba(0, 0, 0, 0.08)
Background (default): rgba(45, 91, 120, 0.08)
Background (hover): linear-gradient(135deg, rgba(45, 91, 120, 0.12), rgba(45, 91, 120, 0.18))
Background (active): linear-gradient(135deg, rgba(45, 91, 120, 0.15), rgba(45, 91, 120, 0.2))
Icon color: var(--color-secondary)
```

### HelpPanel
```
Border-radius: 16px
Border: 1px solid rgba(45, 91, 120, 0.15)
Background: rgba(45, 91, 120, 0.04)
Padding: 1.5rem
Grid gap: 1.5rem
Title color: var(--color-secondary)
Title font-size: 0.95rem
Content font-size: 0.875rem
Content color: #64748b
```

### Sound Buttons (AchievementManager)
```
Grid: repeat(auto-fit, minmax(200px, 1fr))
Border-radius: 10px
Border: 1px solid rgba(45, 91, 120, 0.15)
Background: rgba(255, 255, 255, 0.8)
Hover background: rgba(45, 91, 120, 0.1)
Hover border: var(--color-secondary)
Icon size: 16px
Icon color: var(--color-secondary)
```

### Icon Grid (AchievementManager)
```
Border-radius: 10px (jednotlivé ikony)
Border-radius: 12px (kontejner)
Border: 1px solid rgba(45, 91, 120, 0.15)
Icon size: 20px
Icon color: var(--color-secondary) (změněno z primary)
```

## Klíčové technologie

### Framer Motion
- AnimatePresence pro smooth vstup/výstup
- initial/animate/exit transitions
- whileHover a whileTap animace

### Web Audio API
- AudioContext pro zvuky
- OscillatorNode (triangle wave)
- GainNode pro envelope
- BufferSourceNode pro noise

### CSS Grid
- Responzivní layout pro zvuky a ikony
- auto-fit + minmax pro automatické zalamování

### React Patterns
- Flexible children prop
- Conditional rendering (children vs content)
- Hover state management s inline styles

## Performance optimalizace

### Gradient animace
- GPU-accelerated (background-position)
- Dlouhá délka (45s) → nízká zátěž
- Pouze 1-2 aktivní gradienty současně

### Sound Generator
- Lazy loading (generuje až při kliknutí)
- Krátké zvuky (0.3-0.7s)
- Automatické zastavení po dohrání

### Component re-renders
- useState pro lokální stavy
- Žádné zbytečné re-rendery
- AnimatePresence optimalizuje mount/unmount

## Accessibility

### Připraveno
- Semantic HTML (button elementy)
- Title attributy na buttonech
- Cursor: pointer
- Keyboard navigace (native button)

### K doplnění
- ARIA labels pro help buttons
- ARIA-expanded pro collapse panels
- Focus management

## Použití komponent

### Příklad HelpButton
```jsx
<HelpButton
  onClick={() => setShowHelp(!showHelp)}
  isActive={showHelp}
/>
```

### Příklad HelpPanel - Standardní
```jsx
<HelpPanel
  isOpen={showHelp}
  title="Nápověda - Název sekce"
  content={{
    steps: [
      'Krok 1',
      'Krok 2',
      { title: 'Speciální krok:', text: 'Text kroku' }
    ],
    tips: [
      'Tip 1',
      'Tip 2'
    ]
  }}
/>
```

### Příklad HelpPanel - Custom
```jsx
<HelpPanel
  isOpen={showHelp}
  title="Nápověda - Custom"
>
  <div>
    {/* Vlastní obsah */}
  </div>
</HelpPanel>
```

## Iterace během session

1. **První verze HelpPanel** - S velkou HelpCircle ikonou → odstraněna
2. **Emoji ikony** - 📝 a 💡 → odstraněny pro čistší design
3. **Border thickness** - 2px → 1px (jemnější)
4. **Gradient background** - Dvoubarevný → Jednobarevný s nízkou opacity
5. **Icon color** - Primary (růžová) → Secondary (modrá)
6. **Zvuky** - Sine wave → Triangle wave (výraznější)
7. **Volume** - 0.3 → 0.5-0.8 (hlasitější)
8. **Sound layout** - Vertikální → Grid 2-3 sloupce

## Naučené lekce

1. **Modularita** - Jeden komponent, více použití
2. **Flexible API** - content vs children pattern
3. **Consistent design** - Všechny help panely vypadají stejně
4. **Fallback systém** - MP3 → syntetický zvuk
5. **Inline styles** - Pro dynamické hover stavy
6. **Grid layout** - Automatické zalamování bez media queries
7. **Web Audio API** - Generování zvuků bez externích souborů

## Následující kroky

### Bezprostřední
- [ ] Přidat vlastní MP3 zvuky do public/sounds/
- [ ] Test všech help panelů v aplikaci
- [ ] Push do nové větve a main

### Krátkodobé
- [ ] Přidat ARIA labels
- [ ] Test na mobilních zařízeních
- [ ] Aplikovat gradient i na další cards

### Dlouhodobé
- [ ] Theme system pro barvy
- [ ] Dark mode podpora
- [ ] Component library dokumentace
- [ ] Storybook pro UI komponenty

## Poznámky pro budoucí session

### Důležité soubory
- `src/components/ui/TabButtons.jsx` - HelpButton a HelpPanel
- `src/utils/soundGenerator.js` - Sound generátor
- `public/sounds/` - Složka pro MP3 soubory (zatím prázdná)

### Design konvence
- Border-radius: 10-16px škála
- Border: vždy 1px s nízkou opacity
- Secondary barva pro help systém
- Primary barva pro akční tlačítka

### Sound files
```
/public/sounds/
  ├── achievement.mp3
  ├── fanfare.mp3
  ├── success.mp3
  ├── applause.mp3
  └── cheer.mp3
```

## Statistiky

**Session délka:** ~3 hodiny
**Řádků přidáno:** ~350
**Řádků odstraněno:** ~265
**Netto přírůstek:** +85 řádků
**Soubory změněny:** 8
**Nové soubory:** 2
**Komponenty vytvořeny:** 2 (HelpButton, HelpPanel)
**Komponenty upraveny:** 5 admin komponent
**Status:** Připraveno k commit a push
