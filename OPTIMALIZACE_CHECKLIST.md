# OPTIMALIZACE & MODULARIZACE CHECKLIST
**Datum zahájení:** 2. prosince 2025
**Branch:** feature/unified-celebration-system

---

## ✅ DOKONČENO v této session

### 1. Performance - Lazy Loading & Code Splitting
- [x] Implementovat lazy loading pro všechny route komponenty v App.jsx
- [x] Přidat Suspense fallback s loading indikátorem
- [x] Smazat demo stránky (NavigationVariantsDemo, TextDemo, CelebrationDemo)
  - Ušetřeno: ~994 řádků kódu

### 2. Modularizace - Achievement System
- [x] Opravit fetchAllAchievements v UserDashboard - použít achievement cache
- [x] Odstranit přímé DB dotazy na piano_achievements

### 3. Modularizace - History & Activities
- [x] Vytvořit helper funkce v celebrationService:
  - `getRecentActivities(userId, limit)` - pro nedávné aktivity
  - `getAllUserActivities(userId)` - pro kompletní historii
  - `getActivitiesForAchievement(userId, type, value)` - pro achievement detail
- [x] Přidat Chord Practice a nové kvízy do Historie
  - Opraveno načítání z `piano_quiz_scores`
  - Historie nyní zobrazuje všechny typy aktivit

### 4. Odstranění duplicit
- [x] Zjednodušit fetchRecentActivities v UserDashboard (z 90 na 23 řádků)
- [x] Zjednodušit fetchAchievementActivities v UserDashboard (z 170 na 40 řádků)
- [x] Zjednodušit fetchUserHistory v History.jsx (z 150 na 23 řádků)
  - **Celková redukce:** ~340 řádků duplicitního kódu eliminováno

---

### 5. Modularizace - Rozdělení celebrationService
- [x] Vytvořit `activityService.js` (419 řádků)
  - Přesunuto: getRecentActivities, getAllUserActivities, getActivitiesForAchievement
- [x] Upravit importy v UserDashboard.jsx
- [x] Upravit importy v History.jsx
- [x] celebrationService zredukován z 1020 na 598 řádků (42% redukce)

### 6. Modularizace - StatCard extrakce z UserDashboard
- [x] Vytvořit `StatCard` komponentu v CardComponents.jsx
  - ✅ Používá CSS variables (--radius, --color-text, --color-text-secondary)
  - ✅ Border: none + SHADOW.default místo hardcoded borders
  - ✅ Animace (framer-motion) pro hodnoty a ikony
  - ✅ Podporuje klikací i neklikací varianty
- [x] Nahradit 6 inline stat karet v UserDashboard.jsx StatCard komponentou
  - Dokončené lekce (Award) - klikací
  - Dostupné lekce (BookOpen) - neklikací
  - Body (Zap) - klikací
  - Streak (Flame) - klikací
  - Dokončené kvízy (Gamepad2) - klikací
  - Zahrané písně (Music) - klikací
- [x] **Redukce:** UserDashboard.jsx: 1362 → 1138 řádků (224 řádků eliminováno)
- [x] **Celková úspora:** 142 řádků kódu (StatCard je reusable!)

### 7. Modularizace - Drawer komponenta (slideout panel)
- [x] Vytvořit modulární `Drawer.jsx` v src/components/ui/
  - ✅ Slideout panel zprava (moderní UX pattern místo modal)
  - ✅ Responzivní padding (mobile/desktop)
  - ✅ Built-in CloseButton s očičkem
  - ✅ Escape key support + body scroll locking
  - ✅ Props: isOpen, onClose, title, width, showCloseButton
- [x] Nahradit achievement modal v UserDashboard.jsx Drawer komponentou
  - ✅ Zachován všechen obsah (icon, progress, activities, XP)
  - ✅ Title v sticky headeru místo v obsahu
  - ✅ Modernější UX - zachování kontextu

### 8. Responzivní systém - useResponsive hook & DRAWER_SPACING
- [x] Vytvořit `useResponsive` hook v src/hooks/
  - ✅ Reusable hook pro detekci mobile/tablet/desktop
  - ✅ Automatické resize listening
  - ✅ Vrací: { isMobile, isTablet, isDesktop, width }
- [x] Vytvořit `DRAWER_SPACING` konstanty v styleConstants.js
  - ✅ Centralizované spacing hodnoty (mobile vs desktop)
  - ✅ contentPadding, margin, cardPadding, sectionGap
- [x] Aplikovat responzivní spacing v Drawer.jsx
  - ✅ Content padding, width, header padding, title fontSize
- [x] Aplikovat responzivní spacing v UserDashboard.jsx
  - ✅ Drawer obsah: všechny marginBottom hodnoty
  - ✅ Activity cards: gap, padding, borderRadius
  - ✅ Achievement container: background opacity
- [x] **Eliminace duplicity:** Žádné opakování `window.innerWidth <= 640`
- [x] **Benefit:** Změna breakpointu = úprava na 1 místě (v hooku)

---

## 🏁 HOTOVÉ SOUBORY (kompletně zoptimalizováno)

### Services
- [x] **activityService.js** - Nový soubor (419 řádků)
  - ✅ Centralizované funkce pro aktivity
  - ✅ Použito v UserDashboard.jsx a History.jsx
  - ✅ Eliminuje duplicitu mezi stránkami

### Components
- [x] **CardComponents.jsx** - Rozšířeno (463 → 545 řádků)
  - ✅ Přidána StatCard komponenta (82 řádků)
  - ✅ Používá CSS variables a SHADOW constants
  - ✅ Reusable pro jiné stránky

### Pages - částečně optimalizováno
- [x] **History.jsx** - Zredukováno z 599 na ~450 řádků
  - ✅ Používá activityService
  - ✅ Zobrazuje všechny typy aktivit (včetně Chord Practice)
  - ✅ Eliminována duplicita s UserDashboard

- [ ] **UserDashboard.jsx** - Částečně optimalizováno (1362 → 1138 řádků)
  - ✅ Používá activityService (fetchRecentActivities, fetchAchievementActivities)
  - ✅ Používá achievement cache (fetchAllAchievements)
  - ✅ Žádné hardcoded XP hodnoty
  - ✅ Žádné přímé DB queries pro aktivity
  - ✅ **StatCard extrakce dokončena** (6 inline karet → StatCard komponenta)
  - ⏳ Čeká na: AchievementModalContent, React.memo, useCallback

### Core Files
- [x] **App.jsx** - Optimalizováno
  - ✅ Lazy loading pro všechny routes
  - ✅ Suspense fallback
  - ✅ Smazány demo stránky

---

## ⏳ PLÁNOVANÉ ÚKOLY (Template pro další stránky)

### 6. Optimalizace velkých komponent

#### SongLibrary.jsx (1817 řádků) 🔴 PRIORITA VYSOKÁ
- [ ] Analyzovat strukturu komponenty
- [ ] Vyextrahovat sub-komponenty:
  - [ ] `NoteFormatHelpContent` → samostatný soubor
  - [ ] `SortableSongCard` → samostatný soubor
  - [ ] `SongForm` - formulář pro add/edit
  - [ ] `SongPlayer` - přehrávač
- [ ] Přidat React.memo kde je potřeba
- [ ] Přidat useCallback pro event handlery
- [ ] Cíl: Zredukovat na ~500 řádků

#### UserDashboard.jsx (aktuálně 1138 řádků po StatCard extrakci)
- [ ] Vyextrahovat sub-komponenty:
  - [ ] `WelcomeSection` - welcome card
  - [x] `StatCard` - statistika card (reusable) ✅ **HOTOVO**
  - [ ] `AchievementCard` - achievement card (použít ItemCard?)
  - [ ] `AchievementModalContent` - modal content (použít existující Modal wrapper)
  - [ ] `ActivityItem` - položka aktivity
- [ ] Přidat React.memo pro StatCard
- [ ] Přidat useCallback pro event handlery
- [ ] Cíl: Zredukovat na ~800 řádků (již 224 řádků eliminováno)

#### Cviceni.jsx (767 řádků)
- [ ] Vyextrahovat chord practice logiku
- [ ] Přidat memoization
- [ ] Cíl: Zredukovat na ~400 řádků

#### UniversalTheoryQuiz.jsx (727 řádků)
- [ ] Vyextrahovat quiz logiku do hooks
- [ ] Vyextrahovat UI komponenty
- [ ] Cíl: Zredukovat na ~400 řádků

#### ChordQuiz.jsx (676 řádků)
- [ ] Vyextrahovat quiz logiku do hooks
- [ ] Sdílet logiku s UniversalTheoryQuiz
- [ ] Cíl: Zredukovat na ~400 řádků

#### GamificationManager.jsx (719 řádků)
- [ ] Rozdělit na menší manager komponenty
- [ ] Cíl: Zredukovat na ~400 řádků

### 7. React Performance Optimalizace
- [ ] Audit použití React.memo
- [ ] Audit použití useCallback
- [ ] Audit použití useMemo
- [ ] Implementovat virtualizaci pro dlouhé seznamy (react-window)
- [ ] Code splitting pro velké komponenty

### 8. Bundle Size Optimalizace
- [ ] Spustit bundle analyzer
- [ ] Identifikovat největší dependencies
- [ ] Zvážit lighter alternativy:
  - [ ] framer-motion → react-spring? (menší bundle)
  - [ ] @dnd-kit → lite verze?
- [ ] Tree-shaking audit
- [ ] Odstranit nepoužívané dependencies

### 9. Database Query Optimalizace
- [ ] Audit všech DB queries v komponentách
- [ ] Zkontrolovat, jestli všechny používají indexy
- [ ] Implementovat pagination tam, kde chybí
- [ ] Přidat loading states všude

### 10. Store Optimalizace
- [ ] Audit všech Zustand stores
- [ ] Zkontrolovat, jestli nejsou zbytečné re-renders
- [ ] Implementovat selektory správně

### 11. Code Quality
- [ ] Odstranit console.log z produkčního kódu
- [ ] Přidat PropTypes nebo TypeScript types
- [ ] Code review všech změn
- [ ] Aktualizovat dokumentaci

---

## 📊 METRIKY

### Velikost souborů (před optimalizací)
- SongLibrary.jsx: 1817 řádků 🔴
- UserDashboard.jsx: 1558 řádků 🔴
- Cviceni.jsx: 767 řádků 🟡
- UniversalTheoryQuiz.jsx: 727 řádků 🟡
- GamificationManager.jsx: 719 řádků 🟡
- ChordQuiz.jsx: 676 řádků 🟡
- History.jsx: 599 řádků 🟡

### Duplicita kódu (eliminováno)
- fetchRecentActivities: ~90 řádků → ✅ centralizováno do activityService
- fetchUserHistory: ~150 řádků → ✅ centralizováno do activityService
- fetchAchievementActivities: ~170 řádků → ✅ centralizováno do activityService
- **Celkem eliminováno:** ~340 řádků duplicity ✅

### Modularizace services (dokončeno)
- celebrationService.js: 1020 → 598 řádků (42% redukce) ✅
- activityService.js: nový soubor 419 řádků ✅
- **Benefit:** Lepší separation of concerns, snadnější údržba

### Cílové velikosti souborů (po optimalizaci)
- celebrationService.js: 1020 → 598 řádků ✅
- activityService.js: nový soubor 419 řádků ✅
- CardComponents.jsx: 463 → 545 řádků (StatCard přidána) ✅
- History.jsx: 599 → ~450 řádků ✅
- UserDashboard.jsx: 1362 → 1138 řádků ✅ (StatCard extrakce dokončena)
  - Cíl: ~800 řádků (po extrakci AchievementModalContent)
- SongLibrary.jsx: 1817 → 500 řádků (⏳ další priorita)
- Ostatní komponenty: <500 řádků každá

---

## 🎯 PRIORITY

### Vysoká priorita (tento týden)
1. ✅ Lazy loading & demo stránky
2. ✅ Odstranění duplicit v history/activities
3. ✅ Rozdělení celebrationService → activityService
4. ✅ StatCard extrakce z UserDashboard (224 řádků eliminováno)
5. ⏳ AchievementModalContent extrakce z UserDashboard - **DALŠÍ KROK**
6. ⏳ Optimalizace SongLibrary.jsx (největší soubor)

### Střední priorita (příští týden)
5. Optimalizace UserDashboard.jsx
6. Optimalizace quiz komponent
7. React performance optimalizace

### Nízká priorita (podle potřeby)
8. Bundle size optimalizace
9. Code quality improvements
10. TypeScript migrace (volitelné)

---

## ✅ CHECKLIST PŘED COMMITEM

Po každé větší změně zkontrolovat:
- [ ] Aplikace se spustí bez chyb
- [ ] Všechny stránky fungují
- [ ] Console je bez errorů
- [ ] Achievement system funguje
- [ ] Historie zobrazuje všechny aktivity
- [ ] Celebration system funguje
- [ ] Level-upy fungují
- [ ] Import cesty jsou správné

---

## 📝 POZNÁMKY

### Design Decisions
- Používáme centralizované services místo přímých DB dotazů v komponentách
- Achievement cache pro performance (5min TTL)
- Lazy loading pro všechny route komponenty
- Helper funkce v services pro sdílenou logiku

### Best Practices
- DRY (Don't Repeat Yourself)
- Single Responsibility Principle
- Komponenty < 500 řádků ideálně
- Services pro business logiku
- Komponenty jen pro UI

### Technické dluhy
- TypeScript by pomohl s type safety
- Více unit testů by pomohlo s refactoringem
- Storybook by pomohl s komponentovou dokumentací

---

## 📋 TEMPLATE PRO OPTIMALIZACI STRÁNKY

Při optimalizaci každé stránky postupujeme systematicky:

### 1. Analýza
- [ ] Spočítat řádky kódu
- [ ] Identifikovat sub-komponenty k extrakci
- [ ] Najít duplicitní kód
- [ ] **Zkontrolovat DB queries** - měly by být v services, ne v komponentách
- [ ] Identifikovat příležitosti pro memoization

### 1a. Kontrola modularizace (DŮLEŽITÉ!)
- [ ] **Achievement queries** - Používá `useAchievementsStore` cache místo přímých DB dotazů?
- [ ] **Activity queries** - Používá `activityService` místo vlastních DB queries?
- [ ] **Completion logika** - Používá `celebrationService.celebrate()` místo vlastní logiky?
- [ ] **XP hodnoty** - Žádné hardcoded XP hodnoty? (měly by být v XP rules nebo celebration service)
- [ ] **Přímé DB queries** - Všechny supabase dotazy přesunuty do services?

### 2. Modularizace
- [ ] Vyextrahovat sub-komponenty
- [ ] Přesunout business logiku do services/hooks
- [ ] Odstranit duplicity

### 3. Performance
- [ ] Přidat React.memo kde je potřeba
- [ ] Přidat useCallback pro event handlery
- [ ] Přidat useMemo pro expensive computations

### 4. Cleanup
- [ ] Odstranit console.log
- [ ] Zkontrolovat a vyčistit komentáře
- [ ] Aktualizovat dokumentaci

### 5. Testování
- [ ] Zkontrolovat, že stránka funguje
- [ ] Zkontrolovat console (žádné errors)
- [ ] Otestovat všechny featury na stránce

### 6. Checklist update
- [ ] Přidat soubor do "HOTOVÉ SOUBORY"
- [ ] Aktualizovat metriky

---

**Poslední update:** 2. prosince 2025 (Session 2)
**Status:** ✅ StatCard extrakce dokončena - UserDashboard.jsx: 1362 → 1138 řádků
**Další krok:** AchievementModalContent extrakce z UserDashboard.jsx (cca ~250 řádků)
