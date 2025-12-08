# Session Context - 26. listopadu 2025

## Přehled změn

### 1. Modularizace UI komponent a tlačítek

**Cíl:** Sjednotit design tlačítek napříč aplikací pomocí modulárních komponent.

**Změněné soubory:**
- `src/components/ui/ButtonComponents.jsx`
- `src/components/lessons/LessonCard.jsx`
- `src/components/lessons/LessonList.jsx`
- `src/components/resources/SongLibrary.jsx`

**Provedené úpravy:**

#### AddButton komponenta
- Změněn default `iconOnly` z `false` na `true` - všechna AddButton tlačítka jsou nyní jen ikona (Plus)
- Použito v LessonList a SongLibrary místo vlastních implementací

#### ActionButtonGroup komponenta
- **Gap mezi tlačítky:** změněno z `0.5rem` na `0.25rem` (menší mezera)
- **Zarovnání:** přidáno `justifyContent: 'flex-end'` (tlačítka vpravo)
- **Šířka:** přidáno `width: '100%'` (zabírá celou šířku kontejneru)
- Použito v LessonCard místo vlastních tlačítek Edit/Duplicate/Delete

#### SaveButton a CancelButton
- Nahrazeny vlastní implementace ve formulářích
- Použito v LessonList a LessonCard pro konzistentní UI

**Výsledek:**
- Odstraněno ~200 řádků duplicitního kódu
- Jednotný design akčních tlačítek v celé aplikaci
- Všechna tlačítka mají stejnou velikost ikon (18px default)

---

### 2. Unifikace typografie

**Cíl:** Sjednotit barvy textů, velikosti fontů a řádkování napříč celou aplikací.

**Změněný soubor:**
- `src/styles/index.css`
- `src/components/ui/PageSection.jsx`
- `src/components/lessons/LessonCard.jsx`
- `src/components/lessons/PianoKeyboard.jsx`
- `src/pages/NavigationVariantsDemo.jsx`
- `src/pages/TextDemo.jsx` (nový - demo stránka)

**Nastavení typografie:**

```css
/* Body text */
font-size: 0.95rem;
color: #475569;
line-height: 1.4;

/* Nadpisy */
h1, h2, h3, h4, h5, h6 {
  line-height: 1.15;
  color: inherit; /* stejná barva jako text */
}

h1 { font-size: 2rem; }
h2 { font-size: 1.5rem; }
h3 { font-size: 1.25rem; }

/* Tlačítka a formuláře */
.btn, .form-label, .form-input {
  font-size: 0.95rem;
}
```

**Demo stránky:**
- **TextDemo.jsx** - porovnání barev a line-height variant
- Použito pro výběr finálního nastavení typografie

**Výsledek:**
- Odstraněno 194+ inline `fontSize` specifikací
- Konzistentní čitelnost napříč aplikací
- Jednotná barva textů (`#475569`) a nadpisů

---

### 3. Refinement navigace (TabButtons)

**Cíl:** Vylepšit vizuální design dvouúrovňové navigace (main tabs + sub tabs).

**Změněný soubor:**
- `src/components/ui/TabButtons.jsx`
- `src/pages/NavigationVariantsDemo.jsx` (nový - demo stránka)

**Finální design (Varianta 7):**

**Main tabs (default layout):**
```javascript
// Wrapper
background: 'transparent',
backdropFilter: 'blur(12px)',
borderRadius: '14px',
boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
gap: '0.5rem',
padding: '0.3rem'

// Tlačítka
background: isActive
  ? gradient (primary/secondary)
  : isHovered
    ? 'rgba(45, 91, 120, 0.08)'
    : 'rgba(255, 255, 255, 0.9)',
boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none'
```

**Sub tabs (pill layout):**
- Stejný design jako main tabs
- Menší rozměry (padding: '0.4rem 1rem')
- Neaktivní pills: bílé, bez stínu (blend in)
- Aktivní pill: barevná se stínem (stands out)

**Demo stránka:**
- **NavigationVariantsDemo.jsx** - 7 variant navigace pro porovnání
- Použito pro výběr finálního designu

**Výsledek:**
- Moderní glassmorphism efekt (průhlednost + blur)
- Konzistentní design mezi hlavním menu a submenu
- Jemné vizuální rozdíly mezi aktivním a neaktivním stavem

---

### 4. ItemCard - modulární komponenta pro karty

**Cíl:** Vytvořit univerzální komponentu pro karty lekcí, písniček a dalších položek s chevron ikonou vpravo dolů.

**Nový soubor:**
- `src/components/ui/CardComponents.jsx` - přidána komponenta `ItemCard`

**Změněný soubor:**
- `src/components/lessons/LessonCard.jsx` - refaktorováno na použití ItemCard

**Struktura ItemCard:**
```javascript
<ItemCard
  title="Název položky"
  description="Popis položky"
  headerActions={<ActionButtonGroup />}
  footer={<>Obtížnost, délka atd.</>}
  dragHandle={<DragHandle />}
  isExpanded={boolean}
  onClick={handleClick}
>
  {/* Rozbalovací obsah (např. editační formulář) */}
</ItemCard>
```

**Vlastnosti:**
- **Chevron vpravo dolů** v footer sekci (automaticky)
- Animace chevron rotace při rozbalení (0° → 90°)
- Podpora drag & drop (dragHandle prop)
- Flexbox layout (výška se správně propaguje)
- Hover efekty (scale, boxShadow)
- Jednotný design s ostatními kartami

**Výsledek:**
- LessonCard zkrácen z 225 na 198 řádků
- Chevron automaticky vpravo dolů podle požadavku
- Připraveno pro použití v SongLibrary a dalších místech

---

### 5. Stejná výška karet v gridu

**Cíl:** Všechny karty lekcí v gridu mají stejnou výšku v každém řádku.

**Změněné soubory:**
- `src/components/lessons/LessonList.jsx` - grid layout
- `src/components/ui/CardComponents.jsx` - ItemCard flexbox

**Implementace:**

**1. Grid nastavení:**
```javascript
<motion.div
  className="grid grid-cols-2"
  style={{ gridAutoRows: '1fr' }}
>
```

**2. Propagace výšky přes všechny wrappery:**
```javascript
// Grid item
<div style={{ height: '100%' }}>
  // SortableCard wrapper
  <div style={{ height: '100%' }}>
    // Motion wrapper
    <motion.div style={{ height: '100%' }}>
      // ItemCard
      <ItemCard style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
```

**Klíčové změny:**
- `gridAutoRows: '1fr'` - každý řádek má stejnou výšku
- `height: '100%'` přidáno do všech wrapper divů
- ItemCard s flexbox (`display: 'flex', flexDirection: 'column'`) - obsah se roztáhne

**Výsledek:**
- Všechny karty v řádku mají stejnou výšku podle nejvyšší karty
- Vizuálně příjemnější a profesionálnější vzhled

---

## Nové soubory

### 1. NavigationVariantsDemo.jsx
**Účel:** Demo stránka pro porovnání 7 různých variant navigačního designu
**Cesta:** `/navigation-demo`
**Status:** Testovací stránka, lze smazat po dokončení

### 2. TextDemo.jsx
**Účel:** Demo stránka pro porovnání barev textů a line-height variant
**Cesta:** `/text-demo`
**Status:** Testovací stránka, lze smazat po dokončení

### 3. useProgressTracking.js
**Účel:** Hook pro sledování pokroku (pravděpodobně z předchozí session)
**Status:** Nepřidáno do commitu v této session

### 4. MODULARNI-FEEDBACK-SYSTEM.md
**Účel:** Dokumentace modulárního feedback systému
**Status:** Nepřidáno do commitu v této session

---

## Statistiky změn

**Celkem změněných souborů:** 16
**Přidáno řádků:** +1151
**Odstraněno řádků:** -765
**Čistý přírůstek:** +386 řádků

**Hlavní změny:**
- ButtonComponents: +62 řádků (nové komponenty)
- CardComponents: +235 řádků (ItemCard komponenta)
- LessonCard: -32 řádků (refaktoring na ItemCard)
- LessonList: -31 řádků (modularizace tlačítek)
- SongLibrary: -166 řádků (modularizace tlačítek)
- PracticeModeControls: +118 řádků (vylepšení)

---

## Klíčové design rozhodnutí

### Typografie
- **Jednotná velikost:** 0.95rem pro všechny texty
- **Jednotná barva:** #475569 pro texty i nadpisy
- **Line-height:** 1.4 pro text, 1.15 pro nadpisy

### Navigace
- **Transparentní pozadí** s blur efektem
- **Bez stínu** u neaktivních pills (blend in)
- **Se stínem** u aktivních pills (stands out)
- **Menší gap:** 0.5rem mezi hlavními tabs

### Tlačítka
- **Jednotná velikost ikon:** 18px default
- **Zarovnání vpravo:** ActionButtonGroup
- **Menší mezery:** 0.25rem gap
- **Ikony bez textu:** AddButton default

### Karty
- **Chevron vpravo dolů** v footer sekci
- **Stejná výška** v grid řádku
- **Flexbox layout** pro správnou propagaci výšky

---

## Technické detaily

### CSS Grid pro stejnou výšku
```css
.grid {
  grid-auto-rows: 1fr; /* Všechny řádky stejné výšky */
}
```

### Flexbox v ItemCard
```javascript
style={{
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
}}
```

### Propagace výšky
Každý wrapper v hierarchii musí mít `height: '100%'`:
1. Grid item wrapper
2. SortableCard wrapper
3. Motion wrapper
4. ItemCard

---

## Poznámky pro budoucnost

1. **Demo stránky** (`NavigationVariantsDemo`, `TextDemo`) lze odstranit po potvrzení finálního designu
2. **ItemCard** je připravena pro použití v SongLibrary a dalších místech
3. **Modularizace** pokračuje - všechny custom tlačítka postupně nahradit modulárními komponentami
4. **Typografie** je finální - neměnit bez konzultace

---

## Testování

**Před commitem otestovat:**
- ✅ Lekce - karty stejné výšky
- ✅ Lekce - ActionButtonGroup vpravo
- ✅ Navigace - transparentní pozadí s blur
- ✅ Formuláře - SaveButton a CancelButton
- ✅ AddButton - ikona bez textu
- ✅ Typografie - konzistentní napříč aplikací

**Známé problémy:**
- Žádné

---

## Autor
Lenka Roubalová + Claude (Anthropic)

## Datum
26. listopadu 2025
