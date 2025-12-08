# Session Context: Card Component Modularization
**Datum:** 3. prosince 2025
**Branch:** feature/card-component-modularization
**Status:** Dokončeno ✅

---

## 📋 Přehled Session

### Hlavní Cíle
1. Opravit viditelné rohy glass efektu v EditFormContainer
2. Zajistit plnou modularitu všech card komponent
3. Eliminovat duplicitní kód v CardComponents.jsx
4. Standardizovat glassmorphism hodnoty napříč aplikací
5. Odstranit duplicitní GlassCard.jsx komponentu

### Dosažené Výsledky
- ✅ Opraveny corner artifacts v EditFormContainer
- ✅ EditFormContainer refaktorován na použití Card komponenty
- ✅ Přidán `as` prop do Card pro polymorfní použití
- ✅ PageCard, QuestionCard, ItemCard, StatCard refaktorovány na Card wrapper
- ✅ Standardizace: blur="30px", opacity={0.8} všude
- ✅ GlassCard.jsx odstraněn, nahrazen Card komponentou
- ✅ Úplná modularita pro všechny glassmorphism efekty

---

## 🔧 Technické Změny

### 1. EditFormContainer.jsx - Fix Corner Artifacts

**Problém:** Viditelné rohy glass efektu, nedostatečný stín.

**Pokusů o opravu:**
1. ❌ Zvýšení stínu (6px → 10px → 40px) - nefungovalo
2. ❌ Přidání border - uživatel odmítl
3. ❌ `overflow: 'hidden'` na inner div - nefungovalo
4. ❌ `isolation: 'isolate'` - uživatel požádal vrátit
5. ✅ **Finální řešení:** Odstranění `overflow: 'hidden'` z motion.div wrapperu

**Root Cause:** Dvojité `overflow: 'hidden'` (na motion.div a inner div) způsobovalo artifacts.

**Před:**
```jsx
<motion.div
  style={{ marginTop: '1rem', overflow: 'hidden' }} // ❌ Způsobuje artifacts
>
  <div
    style={{
      background: 'rgba(255, 255, 255, 0.4)',
      backdropFilter: 'blur(30px)',
      overflow: 'hidden', // ❌ Dvojité overflow
      // ...
    }}
  >
    {children}
  </div>
</motion.div>
```

**Po:**
```jsx
<motion.div
  style={{ marginTop: '1rem' }} // ✅ Bez overflow
>
  <Card
    shadow="primary"
    radius="xl"
    opacity={0.4}
    blur="30px"
    style={{
      padding: '1rem 0.75rem',
      overflow: 'hidden', // ✅ Jen jeden overflow na Card
      ...style
    }}
  >
    {children}
  </Card>
</motion.div>
```

### 2. Card Component - Přidán `as` Prop

**Důvod:** Podpora motion.div a dalších custom elementů.

**Implementace:**
```jsx
export function Card({
  children,
  as: Component = 'div', // ✅ Polymorfní komponenta
  shadow = 'default',
  radius = 'lg',
  blur = '30px',
  opacity = 0.8,
  className = '',
  style = {},
  ...props // ✅ Předání všech props (včetně motion props)
}) {
  const shadows = {
    none: 'none',
    default: SHADOW.default,
    primary: '0 8px 32px rgba(181, 31, 101, 0.15)',
    secondary: '0 8px 32px rgba(45, 91, 120, 0.15)',
    gold: '0 4px 15px rgba(255, 215, 0, 0.3)'
  };

  const radiusMap = {
    sm: RADIUS.sm,
    md: RADIUS.md,
    lg: RADIUS.lg,
    xl: RADIUS.xl
  };

  const blurValue = typeof blur === 'number' ? `${blur}px` : blur;

  return (
    <Component
      className={className}
      style={{
        background: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blurValue})`,
        WebkitBackdropFilter: `blur(${blurValue})`,
        border: 'none',
        borderRadius: radiusMap[radius] || RADIUS.lg,
        boxShadow: shadows[shadow] || shadows.default,
        ...style
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
```

**Použití s motion.div:**
```jsx
<Card
  as={motion.div}
  opacity={0.8}
  blur="30px"
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ scale: 1.02 }}
>
  {children}
</Card>
```

### 3. PageCard Refactoring

**Před:**
```jsx
export function PageCard({ children, style = {}, ...props }) {
  return (
    <div
      className="glass-card"
      style={{
        background: 'rgba(255, 255, 255, 0.7)', // ❌ Duplicitní glassmorphism
        backdropFilter: 'blur(20px)',           // ❌ Různé hodnoty
        WebkitBackdropFilter: 'blur(20px)',
        border: 'none',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}
```

**Po:**
```jsx
export function PageCard({ children, style = {}, ...props }) {
  return (
    <Card
      opacity={0.8}        // ✅ Standardizováno
      blur="30px"          // ✅ Standardizováno
      radius="xl"
      shadow="default"
      style={{
        padding: '1.25rem',
        marginBottom: '1.5rem',
        ...style
      }}
      {...props}
    >
      {children}
    </Card>
  );
}
```

**Benefit:** Z 16 řádků na 14 řádků + eliminace duplicitního kódu.

### 4. QuestionCard Refactoring

**Před:**
```jsx
export function QuestionCard({ children, onClick, isSelected, style = {}, ...props }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected
          ? 'rgba(181, 31, 101, 0.15)'
          : 'rgba(255, 255, 255, 0.8)', // ❌ Duplicitní glassmorphism
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: isSelected
          ? '2px solid var(--color-primary)'
          : 'none',
        borderRadius: 'var(--radius-lg)',
        // ...
      }}
      {...props}
    >
      {children}
    </div>
  );
}
```

**Po:**
```jsx
export function QuestionCard({ children, onClick, isSelected, style = {}, ...props }) {
  return (
    <Card
      onClick={onClick}
      opacity={0.8}        // ✅ Standardizováno
      blur="30px"          // ✅ Standardizováno
      radius="lg"
      shadow="default"
      style={{
        background: isSelected
          ? 'rgba(181, 31, 101, 0.15)'
          : 'rgba(255, 255, 255, 0.8)',
        border: isSelected
          ? '2px solid var(--color-primary)'
          : 'none',
        // ...
      }}
      {...props}
    >
      {children}
    </Card>
  );
}
```

### 5. ItemCard Refactoring s Motion

**Před:**
```jsx
return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{
      y: -8,
      scale: 1.02,
      boxShadow: '0 12px 48px rgba(45, 91, 120, 0.25)',
      transition: { duration: 0.2 }
    }}
    style={{
      background: 'rgba(255, 255, 255, 0.8)', // ❌ Duplicitní glassmorphism
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: 'none',
      borderRadius: 'var(--radius-xl)',
      boxShadow: '0 8px 32px rgba(45, 91, 120, 0.15)',
      // ...
    }}
  >
    {children}
  </motion.div>
);
```

**Po:**
```jsx
return (
  <Card
    as={motion.div}      // ✅ Polymorfní použití
    opacity={0.8}        // ✅ Standardizováno
    blur="30px"          // ✅ Standardizováno
    radius="xl"
    shadow="secondary"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{
      y: -8,
      scale: 1.02,
      boxShadow: '0 12px 48px rgba(45, 91, 120, 0.25)',
      transition: { duration: 0.2 }
    }}
    style={{
      display: 'flex',
      flexDirection: 'column',
      // ...
    }}
  >
    {children}
  </Card>
);
```

### 6. StatCard Icon Container Refactoring

**Před:**
```jsx
<motion.div
  whileHover={isClickable ? { rotate: 360, scale: 1.1 } : {}}
  transition={{ duration: 0.5 }}
  style={{
    background: 'rgba(255, 255, 255, 0.95)', // ❌ Duplicitní glassmorphism
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: 'var(--radius-lg)',
    // ...
  }}
>
  {Icon && <Icon size={24} color="var(--color-primary)" />}
</motion.div>
```

**Po:**
```jsx
<Card
  as={motion.div}      // ✅ Polymorfní použití
  opacity={0.95}       // ✅ Vyšší opacity pro ikonu (záměrně)
  blur="10px"          // ✅ Menší blur pro malý element (záměrně)
  radius="lg"
  shadow="default"
  whileHover={isClickable ? { rotate: 360, scale: 1.1 } : {}}
  transition={{ duration: 0.5 }}
  style={{
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  {Icon && <Icon size={24} color="var(--color-primary)" />}
</Card>
```

### 7. GlassCard.jsx Odstranění

**Problém:** GlassCard byl duplicitní komponentou - stejná funkcionalita jako Card, ale méně flexibilní.

**Použití:** Pouze v LessonList.jsx (1 místo).

**LessonList.jsx - Před:**
```jsx
import GlassCard from '../ui/GlassCard';

<AnimatePresence>
  {isAddingNew && (
    <GlassCard
      animate
      animationProps={{
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
      }}
      style={{ marginBottom: '1.5rem' }}
    >
      <SectionHeader icon={Plus} title="Nová lekce" variant="h3" />
      <LessonForm ... />
    </GlassCard>
  )}
</AnimatePresence>
```

**LessonList.jsx - Po:**
```jsx
import { Card } from '../ui/CardComponents';

<AnimatePresence>
  {isAddingNew && (
    <Card
      as={motion.div}
      opacity={0.8}
      blur="30px"
      radius="lg"
      shadow="primary"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ marginBottom: '1.5rem', padding: '1.5rem' }}
    >
      <SectionHeader icon={Plus} title="Nová lekce" variant="h3" />
      <LessonForm ... />
    </Card>
  )}
</AnimatePresence>
```

**GlassCard.jsx - SMAZÁN** ✅

---

## 📊 Standardizace Hodnot

### Před Refaktoringem:
- blur: 10px, 20px, 30px, 40px (nekonzistentní)
- opacity: 0.4, 0.7, 0.8, 0.95 (nekonzistentní)
- různé stíny hardcodované inline

### Po Refaktoringu:
- **blur: 30px** (standard pro všechny card komponenty)
- **opacity: 0.8** (standard pro všechny card komponenty)
- **Výjimky (záměrné):**
  - StatCard icon: blur="10px", opacity={0.95} (menší element)
  - EditFormContainer: opacity={0.4} (subtilnější background)

### Shadow Standardizace:
```jsx
const shadows = {
  none: 'none',
  default: SHADOW.default,
  primary: '0 8px 32px rgba(181, 31, 101, 0.15)',
  secondary: '0 8px 32px rgba(45, 91, 120, 0.15)',
  gold: '0 4px 15px rgba(255, 215, 0, 0.3)'
};
```

---

## 🎯 Architektonická Vylepšení

### 1. Single Source of Truth
- **Před:** Glassmorphism kód duplicitně v každé komponentě
- **Po:** Jediná Card komponenta pro všechny glassmorphism efekty

### 2. Modularita
- **Před:** Inline styly v každé komponentě
- **Po:** Všechny komponenty používají Card jako wrapper

### 3. Flexibilita
- Card podporuje `as` prop pro custom elementy
- Props lze přepisovat per usage
- Balance mezi standardizací a flexibilitou

### 4. Konzistence
- Standardizované blur a opacity hodnoty
- Jednotný glassmorphism napříč aplikací
- Snadnější maintenance a update

---

## 📁 Soubory Změněny

### Upravené Soubory:
1. **src/components/ui/EditFormContainer.jsx**
   - Fix corner artifacts
   - Refaktorováno na Card komponentu
   - Aktualizovaná dokumentace

2. **src/components/ui/CardComponents.jsx**
   - Přidán `as` prop
   - Refaktorovány PageCard, QuestionCard, ItemCard, StatCard
   - Standardizace blur/opacity hodnot

3. **src/components/lessons/LessonList.jsx**
   - Nahrazeno GlassCard za Card
   - Odstraněn import GlassCard

### Smazané Soubory:
1. **src/components/ui/GlassCard.jsx** ❌ (duplicitní)

---

## ✅ Checklist Dokončených Úkolů

- [x] Fix glass effect corner artifacts v EditFormContainer
- [x] Zvětšit stín kolem EditFormContainer karty
- [x] Refaktorovat EditFormContainer na použití Card komponenty
- [x] Přidat `as` prop do Card pro motion.div support
- [x] Refaktorovat PageCard na Card wrapper
- [x] Refaktorovat QuestionCard na Card wrapper
- [x] Refaktorovat ItemCard na Card wrapper
- [x] Refaktorovat StatCard icon container na Card wrapper
- [x] Standardizovat blur="30px" a opacity={0.8}
- [x] Odstranit GlassCard.jsx
- [x] Nahradit GlassCard v LessonList.jsx za Card
- [x] Aktualizovat dokumentaci v EditFormContainer.jsx
- [x] Testovat všechny změny

---

## 🚀 Přínosy

### Performance:
- Eliminace duplicitního kódu
- Menší bundle size (odstranění GlassCard)
- Konzistentnější rendering

### Maintainability:
- Single source of truth pro glassmorphism
- Snadné globální změny (změna v Card = změna všude)
- Čitelnější kód

### Developer Experience:
- Jasná API pro Card komponentu
- Konzistentní použití napříč aplikací
- Snadné přidávání nových card komponent

---

## 📝 Lessons Learned

1. **Dvojité overflow způsobuje artifacts** - Pouze jeden overflow na glassmorphism elementu
2. **Polymorfní komponenty jsou flexibilní** - `as` prop umožňuje Card podporovat motion.div
3. **Standardizace zlepšuje konzistenci** - Jednotné blur/opacity hodnoty napříč aplikací
4. **DRY principle v praxi** - Eliminace všech duplikátů glassmorphism kódu

---

## 🔮 Budoucí Vylepšení

1. **Theme Support** - Přidat dark/light mode varianty
2. **Animation Presets** - Společné animation props jako presets
3. **Accessibility** - ARIA labels a keyboard navigation
4. **Documentation** - Storybook pro Card varianty

---

**Konec dokumentace** 🎉
