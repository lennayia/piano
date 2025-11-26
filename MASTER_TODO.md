# 📋 MASTER TODO - Piano Learning App

Datum poslední aktualizace: 26. listopadu 2025

---

## 🔥 Priorita 1 - Kritické (Nutné pro správné fungování)

### 1. ⏳ Fix: Statistiky kvízů nefungují správně
**Status:** Pending
**Priorita:** 🔴 Kritická

**Problém:**
- Ne všechny kvízy správně ukládají statistiky
- Dashboard nezobrazuje kompletní data
- Odměny se nepřidělují správně
- Historie kvízů je neúplná

**Co opravit:**
- ChordQuiz ✅ (ukládá správně)
- UniversalTheoryQuiz ❓ (zkontrolovat)
- Další typy kvízů ❓

**Soubory k ověření:**
- `src/components/games/ChordQuiz.jsx` - `saveQuizCompletion()`
- `src/components/games/UniversalTheoryQuiz.jsx` - ukládání statistik
- `src/store/useUserStore.js` - `updateUserStats()`
- Databázové tabulky: `piano_quiz_completions`, `piano_user_stats`

**Akční kroky:**
1. Projít všechny typy kvízů a ověřit ukládání statistik
2. Zkontrolovat RLS policies pro INSERT operace
3. Ověřit správné přidělování XP a achievementů
4. Testovat zobrazení na dashboardu

---

### 2. ⏳ Vlastní systém notifikací
**Status:** Pending
**Priorita:** 🔴 Kritická

**Popis:**
- Nahradit ošklivé browser notifikace a `alert()` moderním notifikačním systémem
- Design v souladu s aplikací
- Notifikace zmizí automaticky po X sekundách
- Alerty zůstanou pro důležité zprávy (error, warning)

**Typy notifikací:**
- **Toast (notifikace)** - automaticky zmizí (success, info, warning)
  - Pozice: top-right nebo bottom-right
  - Animace: slide-in + fade-out
  - Automatické zavření po 3-5 sekundách

- **Alert (modální dialog)** - musí být potvrzeno uživatelem (error, confirm)
  - Backdrop overlay
  - Tlačítka: OK, Cancel, Confirm
  - Zůstává dokud není zavřeno

**Soubory k vytvoření:**
- `src/components/ui/Toast.jsx` - toast notifikace
- `src/components/ui/AlertDialog.jsx` - modální alerty
- `src/context/NotificationContext.jsx` - context pro správu notifikací
- `src/hooks/useNotification.js` - hook pro jednoduché použití

**Použití:**
```jsx
const { showToast, showAlert } = useNotification();

// Toast notifikace (zmizí automaticky)
showToast('Kvíz dokončen!', 'success');
showToast('Chyba při ukládání', 'error');

// Alert dialog (musí být potvrzen)
const confirmed = await showAlert('Opravdu smazat?', 'warning', {
  confirmText: 'Smazat',
  cancelText: 'Zrušit'
});
```

**Design:**
- Použít RADIUS, SHADOW, BORDER konstanty
- Ikony z lucide-react
- Barvy podle typu (success: zelená, error: červená, warning: žlutá, info: modrá)
- Framer Motion animace

---

## 🔥 Priorita 2 - Vysoká (Důležité pro UX)

### 3. ⏳ Dokončit refaktoring TabButtons
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- Zkontrolovat re-exporty v TabButtons.jsx
- Ověřit, že všechny komponenty používají správné importy
- Zajistit konzistenci napříč celou aplikací

**Soubory k ověření:**
- `src/components/ui/TabButtons.jsx` - centrální export hub
- `src/components/ui/ButtonComponents.jsx`
- `src/components/ui/CardComponents.jsx`
- `src/components/ui/FormComponents.jsx`
- `src/components/ui/PageSection.jsx`

---

### 4. ⏳ Paginace pro dlouhé seznamy
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- Využít modularitu UI komponent
- Vytvořit univerzální Pagination komponentu
- Přidat do všech admin seznamů (kvízy, písničky, lekce, achievementy)
- Server-side pagination (limit/offset) pro velké datasety

**Kde implementovat:**
- QuizManager - seznam kvízů
- SongLibrary - seznam písní
- LessonList - seznam lekcí
- AchievementManager - seznam achievementů
- UserList - seznam uživatelů

**Soubory k vytvoření:**
- `src/components/ui/Pagination.jsx` - univerzální komponenta
- Props: `currentPage`, `totalPages`, `onPageChange`, `pageSize`

**Design:**
- Použít RADIUS, SHADOW konstanty
- Tlačítka: Previous, 1, 2, 3, ..., Next
- Zobrazit "Showing X-Y of Z items"
- Responsive (mobile: jen Previous/Next)

---

### 5. ⏳ Free/Premium obsah v admin panelu
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- Možnost označit lekce, cvičení, kvízy, materiály jako:
  - **Free** - dostupné pro všechny
  - **Premium** - dostupné po zaplacení a registraci
- Filtrování v uživatelském rozhraní podle subscription statusu

**Databázové změny:**
- Přidat sloupec `access_level` do tabulek:
  - `piano_lessons` - ENUM('free', 'premium')
  - `piano_quiz_chords` - ENUM('free', 'premium')
  - `piano_songs` - ENUM('free', 'premium')
  - `piano_theory_materials` - ENUM('free', 'premium')

**Admin UI:**
- Přidat checkbox nebo select "Přístup" v každém formuláři
- Ikona 🔓 Free / 🔒 Premium v seznamech

**User tabulka:**
- `piano_users.subscription_status` - ENUM('free', 'premium')
- `piano_users.subscription_expires_at` - TIMESTAMP

**Frontend filtrace:**
- Zobrazit pouze free obsah pro free uživatele
- Zobrazit vše pro premium uživatele
- Tlačítko "Upgrade na Premium" pro locked obsah

---

### 6. ⏳ Drag & Drop pro pořadí otázek v admin panelu
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- Nahradit manuální pole `display_order` drag & drop funkcionalitou
- Uživatel může přetahovat otázky/písničky/lekce pro změnu pořadí
- Automatické přečíslování `display_order` po přetažení

**Knihovna:**
- `@dnd-kit/core` + `@dnd-kit/sortable` (moderní, lightweight)
- Nebo `react-beautiful-dnd` (starší, ale stabilní)

**Kde implementovat:**
- QuizManager - přetahování kvízů
- SongLibrary - přetahování písní
- LessonList - přetahování lekcí
- AchievementManager - přetahování achievementů

**Soubory:**
- `src/components/ui/DraggableList.jsx` - univerzální komponenta
- `src/components/ui/DraggableItem.jsx` - jednotlivá položka

**Design:**
- Ikona ⋮⋮⋮ (grip-vertical z lucide-react) pro uchopení
- Hover efekt při přetahování
- Placeholder při přesunu
- Smooth animace

---

### 7. ⏳ Zobrazit teoretické otázky pro akordy v UI
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- V sekci Teorie → Kvízy → Akordy zobrazit teoretické otázky pro akordy
- Filtrace teoretických otázek podle `quiz_type = 'chord'` a `questionText IS NOT NULL`
- Zobrazení v TheoryQuizHub nebo samostatné komponentě
- Oddělení od poslechového kvízu (ChordQuiz) a obecných teoretických otázek

**Soubory k úpravě:**
- `src/pages/Teorie.jsx` nebo `src/components/theory/TheoryQuizHub.jsx`
- Přidat filtraci pro teoretické otázky typu "chord"
- UI pro zobrazení a hraní těchto otázek

**Poznámka:** Teoretické otázky pro akordy jsou uložené v `piano_quiz_chords` s vyplněným `questionText` a možnostmi v `piano_quiz_chord_options`.

---

## 🔥 Priorita 3 - Střední (Nice to have)

### 8. ⏳ Breadcrumb navigace
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Drobečková navigace pro lepší orientaci v aplikaci
- Moderní design v souladu s aplikací
- Zobrazit aktuální cestu: Home → Teorie → Kvízy → Akordy

**Soubory k vytvoření:**
- `src/components/ui/Breadcrumb.jsx` - komponenta
- `src/hooks/useBreadcrumbs.js` - hook pro automatické generování

**Design:**
- Použít RADIUS konstanty
- Separator: `/` nebo `>` nebo ikona (ChevronRight)
- Poslední položka: bold, neaktivní
- Předchozí: klikací, navigace zpět

**Použití:**
```jsx
<Breadcrumb
  items={[
    { label: 'Home', to: '/' },
    { label: 'Teorie', to: '/teorie' },
    { label: 'Kvízy', to: '/teorie/kvízy' },
    { label: 'Akordy' } // aktivní, bez "to"
  ]}
/>
```

---

### 9. ⏳ Nácvik stupnic
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Přidat možnost procvičovat stupnice (C dur, A moll, atd.)
- Podobné jako nácvik akordů, ale s postupným zahráním not
- Vizuální zvýraznění not na klaviatuře
- Tempo control (pomalé/rychlé)

**Typy stupnic:**
- Durové stupnice (C, D, E, F, G, A, H)
- Mollové stupnice (a, d, e, g, h)
- Chromatická stupnice

**Soubory k vytvoření:**
- `src/components/games/ScalePractice.jsx` - komponenta
- `src/data/scales.js` - definice stupnic
- Přidat do `src/pages/Cviceni.jsx`

**Databáze:**
- `piano_scales` - tabulka s definicemi stupnic
- `piano_scale_completions` - historie procvičování

---

### 10. ⏳ Přidat správu gamifikace do admin panelu
**Status:** Pending (částečně hotovo)
**Priorita:** 🟡 Střední

**Popis:**
- Správa bodů (XP) a levelů uživatelů
- Správa achievementů/odměn
- Nastavení pravidel gamifikace (kolik XP za co)
- Leaderboard/žebříčky

**Soubory k úpravě:**
- `src/pages/Admin.jsx` - záložka Gamifikace už existuje (řádek 195)
- `src/components/admin/GamificationManager.jsx` - ověřit funkčnost
- Databáze: tabulky `piano_user_stats`, `piano_achievements`

**Note:** GamificationManager už existuje, potřeba otestovat a případně vylepšit.

---

## 🔥 Priorita 4 - Nízká (Budoucí features)

### 11. ⏳ Skladatel - skládání melodií
**Status:** Pending
**Priorita:** 🔵 Nízká

**Popis:**
- Možnost skládat jednoduché melodie (note by note)
- Přidávat akordy, které se k melodii hodí
- Uložit a sdílet kompozice
- Přehrát s metronomen

**Soubory k vytvoření:**
- `src/components/composer/Composer.jsx` - hlavní komponenta
- `src/components/composer/MelodyEditor.jsx` - editace melodie
- `src/components/composer/ChordSuggestions.jsx` - návrhy akordů
- `src/components/composer/Playback.jsx` - přehrávání

**Databáze:**
- `piano_compositions` - uložené skladby
- Sloupce: user_id, title, melody (JSON), chords (JSON), tempo, created_at

**Features:**
- Piano roll editor (vizuální editor not)
- Chord suggestions based on melody (AI?)
- Export to MIDI
- Share link

---

### 12. ⏳ Offline režim (PWA)
**Status:** Pending
**Priorita:** 🔵 Nízká

**Popis:**
- Možnost používat apku offline
- Service Worker pro caching
- Progressive Web App (PWA) manifest
- Sync při obnovení připojení

**Implementace:**
- `public/manifest.json` - PWA manifest
- `public/sw.js` - Service Worker
- `src/utils/offline.js` - offline strategie

**Co cache-ovat:**
- Static assets (CSS, JS, fonts, images)
- API responses (kvízy, písničky, lekce)
- User progress (sync při online)

**Knihovny:**
- Workbox (Google) - pro snadnou konfiguraci SW
- localForage - IndexedDB storage

**Poznámka:** Vyžaduje HTTPS a Vite PWA plugin

---

### 13. ⏳ Vytvořit front-end komponentu pro teoretický kvíz
**Status:** Pending
**Priorita:** 🔵 Nízká (UniversalTheoryQuiz už existuje?)

**Popis:**
- Kvíz pro hraní teoretických otázek (bez klaviatury)
- Podobný ChordQuiz, ale textové otázky
- Multiple choice s 4 možnostmi

**Soubory:**
- `src/components/games/UniversalTheoryQuiz.jsx` - už existuje, ověřit funkčnost
- Přidat do `src/pages/Cviceni.jsx` jako nový typ cvičení (pokud není)

---

### 14. ⏳ Opravit duplikaci lekcí - chybějící duration column
**Status:** Pending
**Priorita:** 🔵 Nízká

**Popis:**
- Při duplikaci lekcí chybí sloupec `duration`
- Přidat sloupec do databáze
- Opravit funkci duplikace v admin panelu

**Soubory k úpravě:**
- Databázová migrace pro přidání `duration` sloupce
- `src/components/lessons/LessonModal.jsx` - opravit duplikaci

---

### 15. ⏳ Vytvořit RLS policy pro piano_song_completions INSERT
**Status:** Pending
**Priorita:** 🔵 Nízká

**Popis:**
- Uživatelé nemůžou ukládat dokončení písní
- Chybí RLS policy pro INSERT operaci

**Soubory k úpravě:**
- SQL migrace v Supabase pro přidání policy

---

## 📚 Dokumentace k vytvoření

### Priorita 1: Systémová dokumentace
- [ ] `SYSTEM_ARCHITECTURE.md` - celková architektura aplikace
- [ ] `DATABASE_SCHEMA.md` - popis databázových tabulek a vztahů
- [ ] `API_ENDPOINTS.md` - popis všech Supabase dotazů a RLS policies

### Priorita 2: Vývojářská dokumentace
- [ ] `DEVELOPMENT_GUIDE.md` - návod pro vývojáře
- [ ] `COMPONENT_STRUCTURE.md` - struktura React komponent
- [ ] `STATE_MANAGEMENT.md` - popis Zustand store

### Priorita 3: Uživatelská dokumentace
- [ ] `USER_MANUAL.md` - manuál pro uživatele
- [ ] `ADMIN_MANUAL.md` - manuál pro administrátory

---

## 🎯 Best Practices & Code Quality

### Každá nová feature musí projít quality check:

**1. Funkčnost**
- ✅ Všechny features fungují podle specifikace
- ✅ Testováno na desktop i mobile
- ✅ Cross-browser kompatibilita (Chrome, Firefox, Safari)

**2. Duplicita v kódu**
- ✅ DRY princip (Don't Repeat Yourself)
- ✅ Znovupoužitelné komponenty
- ✅ Sdílené utility funkce

**3. Logy a debugy**
- ✅ Odstranit všechny `console.log()` debug zprávy
- ✅ Použít `console.error()` pouze pro kritické chyby
- ✅ Implementovat proper error handling

**4. Komentáře**
- ✅ Odstranit zakomentovaný kód
- ✅ Odstranit TODO komentáře (přesunout do MASTER_TODO)
- ✅ Ponechat jen JSDoc dokumentaci a vysvětlující komentáře

**5. Modularita**
- ✅ Každá nová komponenta musí být modulární
- ✅ Props dokumentace v JSDoc
- ✅ Použití centralizovaných konstant (RADIUS, SHADOW, BORDER)
- ✅ Konzistentní import struktura

**6. Performance**
- ✅ Lazy loading pro velké komponenty
- ✅ Memoizace pro expensive operace
- ✅ Optimalizované obrázky
- ✅ Code splitting

**7. Accessibility**
- ✅ ARIA labels pro interaktivní prvky
- ✅ Keyboard navigation
- ✅ Correct semantic HTML
- ✅ Contrast ratio (WCAG AA)

**8. Security**
- ✅ RLS policies v Supabase
- ✅ Input validation
- ✅ XSS protection
- ✅ CSRF tokens (pokud potřeba)

---

## 🐛 Známé problémy (Backlog)

1. **Historie aktivit** - chybějící sloupec user_id
2. **Song completions RLS** - chybějící policy pro INSERT
3. **Lesson duplication** - chybějící duration column

---

## 🎯 Budoucí vylepšení (Icebox)

1. **MIDI podpora** - přehrávání pomocí MIDI klávesnice
2. **Audio nahrávání** - nahrávání vlastního hraní
3. **Multiplayer režim** - hraní s přáteli
4. **Export/Import** - zálohování pokroku uživatele
5. **Responsivita audit** - kompletní audit mobile UX
6. **Unit testy** - Jest + React Testing Library
7. **E2E testy** - Playwright nebo Cypress
8. **SEO optimalizace** - meta tags, sitemap, robots.txt
9. **Analytics** - Google Analytics nebo Plausible
10. **Performance monitoring** - Sentry nebo LogRocket

---

## ✅ Nedávno dokončené úkoly

### Modularizace UI + Unifikace fontů + Migrace not na mezery (26.11.2025)
**Dokončeno:** ✅
**Popis:** Kompletní modularizace UI komponent v SongLibrary, unifikace fontů (Google Fonts), změna separátoru not z podtržítek na mezery

**Změny:**
- ✅ **Modularizace SongLibrary:**
  - Import a použití Chip, ActionButtonGroup, SaveButton, CancelButton z ButtonComponents
  - Nový Chip variant "info" pro metadata (tónina, tempo)
  - Odstranění hardcoded komponent a duplikátního kódu

- ✅ **Odstranění sekce Písničky z Admin panelu:**
  - Admin rozhraní pro písničky je nyní pouze v sekci Písničky
  - Cleanup Admin.jsx - odstranění SongLibrary, songCategories, activeCategory
  - Admin menu nyní: Přehled, Uživatelé, Gamifikace, Odměny, Kvízy

- ✅ **Unifikace fontů - Google Fonts (Lato + Roboto):**
  - Import Lato (300, 400, 700) a Roboto (400, 500, 700) do index.css
  - Body: 'Lato', sans-serif
  - Nadpisy: 'Roboto', sans-serif
  - Override browser defaults: input, textarea, select, button, code, pre → font-family: inherit
  - Odstranění všech inline fontFamily deklarací z celé aplikace
  - Soubory: SongLibrary.jsx, NoteComposer.jsx, AchievementManager.jsx, FormComponents.jsx

- ✅ **Migrace notového zápisu: Podtržítka → Mezery:**

  **Kód:**
  - SongLibrary.jsx: `split('_')` → `split(/\s+/)`, placeholders s mezerami
  - NoteComposer.jsx: `_` → mezera v přidávání not, pauz, nových řádků
  - LessonList.jsx + LessonCard.jsx: `join(', ')` → `join(' ')`, čárky → mezery
  - Aktualizace help tabulky v NoteComposer (oddělovač: _ → mezera)

  **Databáze:**
  - Piano songs: SQL UPDATE `REPLACE(notes, '_', ' ')` - migrace proběhla ✅
  - Piano lessons: Migrace nebyla potřeba (JSON pole zůstává stejné)

  **Výsledek:**
  - Písničky: `"D D E - F | G A H"` (string s mezerami)
  - Lekce: `["C", "D", "E"]` (JSON pole, UI s mezerami)

**Soubory:**
- `src/components/resources/SongLibrary.jsx`
- `src/components/resources/NoteComposer.jsx`
- `src/components/lessons/LessonList.jsx`
- `src/components/lessons/LessonCard.jsx`
- `src/pages/Admin.jsx`
- `src/components/admin/AchievementManager.jsx`
- `src/components/ui/FormComponents.jsx`
- `src/components/ui/ButtonComponents.jsx` (nový variant: info)
- `src/styles/index.css`
- `migrate-notes-to-spaces.js` (nový skript)
- Dokumentace: `DOKUMENTACE-20251126.md`

**Benefity:**
- Konzistentní UI napříč aplikací (modularizace)
- Jednotný font systém (Lato + Roboto) - žádný monospace
- Intuitivnější notový zápis (mezery místo podtržítek)
- Snadnější údržba díky modularizaci

---

### Optimalizace Cvičení + PianoKeyboard vylepšení (25.11.2025 večer)
**Dokončeno:** ✅
**Popis:** Optimalizace stránky Cvičení pro mobil, vylepšení klaviatury a aplikace modulárního designu

**Změny:**
- ✅ **Optimalizace stránky Cvičení:**
  - Nahrazeny velké navigační tlačítka IconButtons (ChevronLeft, ChevronRight)
  - Odstraněn text "Zahrajte postupně tyto tóny:"
  - Přidán filtr `quiz_type = 'chord'` pro správné zobrazení cvičení
  - Aplikovány modulární konstanty (RADIUS.md, RADIUS.lg, RADIUS.sm, SHADOW.lg)

- ✅ **PianoKeyboard vylepšení:**
  - Puntíky přesunuty dolů (bottom: 10px/15px)
  - Text not umístěn 15px nad puntíky
  - Sjednoceny barvy na `var(--color-secondary)` (#2d5b78)
  - Konzistentní glow efekty (opacity 0.7 pro klávesy, 0.8 pro puntíky)
  - Border na klávesách zmenšen z 3px na 2px
  - Vnitřní stíny na puntících (bílé: světlý, černé: tmavší)
  - Svislá čára 1px místo 3px, zIndex 10

- ✅ **CSS optimalizace:**
  - Přidáno `overflow-y: scroll` na html pro konzistentní scrollbar

- ✅ **Modulární design aplikace:**
  - Klaviatura: `var(--radius-xl)`, `var(--shadow-lg)`
  - Nahrazeny deprecated `var(--radius)` za specifické hodnoty
  - Použity konstanty z `styleConstants.js`

**Soubory:**
- `src/pages/Cviceni.jsx`
- `src/components/lessons/PianoKeyboard.jsx`
- `src/styles/index.css`
- Dokumentace: `SESSION_CONTEXT-20251125.md`

**Výsledek:**
- Stránka Cvičení se vejde na jednu obrazovku i na mobilech
- Vizuálně konzistentnější a elegantnější vzhled
- Lepší viditelnost zvýraznění díky vnitřním stínům

---

### Modularizace UI komponent + Fix ChordQuiz (25.11.2025)
**Dokončeno:** ✅
**Popis:** Rozdělení TabButtons do modulárních souborů a oprava automatického generování možností v ChordQuiz

**Změny:**
- ✅ **Modularizace UI komponent:**
  - `ButtonComponents.jsx` - Chip, ActionButton, AddButton, IconButton atd.
  - `CardComponents.jsx` - PageCard, QuestionCard
  - `FormComponents.jsx` - FormInput, FormSelect, FormSection atd.
  - `PageSection.jsx` - Komplexní layout komponenta s menu strukturou
  - `TabButtons.jsx` - Centrální export hub pro všechny UI komponenty

- ✅ **Fix ChordQuiz - Automatické generování možností:**
  - Odstranění JOIN na `piano_quiz_chord_options`
  - Možnosti se generují automaticky z názvů akordů (1 správná + 3 náhodné)
  - Přidána `shuffleArray()` helper funkce
  - Teoretické možnosti se již nezobrazují v poslechovém kvízu

- ✅ **QuizManager refactoring:**
  - Oddělení chord/theory options
  - Odstranění manuálních input fieldů pro chord možnosti
  - Informační text o automatickém generování
  - Save logika rozlišuje mezi chord a theory záznamy

- ✅ **Archivace:**
  - `ChordManager.jsx` → `ChordManager.jsx.backup`
  - QuizManager je nyní jediný univerzální správce všech kvízů

**Soubory:**
- Branch: `refactor/split-tabbuttons-module`
- Commit: `e6195e7`
- Dokumentace: `DOKUMENTACE-20251125.md`
- 19 souborů změněno (+1962, -1294 řádků)

---

### Univerzální struktura kvízů (22.11.2025)
**Dokončeno:** ✅
**Popis:** Rozšíření kvízové struktury pro podporu více typů kvízů

**Změny:**
- ✅ SQL migrace: `supabase_migration_universal_quiz.sql`
  - Přidán sloupec `quiz_type` (chord, theory, rhythm, interval, scale, mixed)
  - Přidán sloupec `category` pro kategorizaci
  - Sloupec `notes` je nyní volitelný (NULL pro ne-akordové kvízy)
  - Vytvořeny VIEW pohledy pro každý typ kvízu

- ✅ `src/components/admin/ChordManager.jsx` - rozšířeno na univerzální správu
  - Záložky pro 6 typů kvízů: Akordy, Teorie, Intervaly, Stupnice, Rytmus, Mix
  - Filtrování podle typu kvízu
  - Dynamický formulář (input pro akordy, textarea pro teorii)
  - Pole kategorie pro teoretické otázky

**Soubory:**
- `supabase_migration_universal_quiz.sql`
- `src/components/admin/ChordManager.jsx`

---

### Oprava pořadí not v akordu (21.11.2025)
**Dokončeno:** ✅
**Popis:** Noty v akordu se nyní zobrazují a přehrávají podle pořadí na klaviatuře (zleva doprava)

**Změny:**
- ✅ `src/utils/noteUtils.js` - přidána funkce `sortNotesByKeyboard()`
  - KEYBOARD_ORDER pole s notami od A. po E''
  - Seřazení podle pozice na klaviatuře

- ✅ `src/components/games/ChordQuiz.jsx` - seřazení před přehráním
- ✅ `src/pages/Cviceni.jsx` - odstranění špatné transformace
- ✅ `src/components/admin/ChordManager.jsx` - seřazení při zobrazení i ukládání

**Soubory:**
- `src/utils/noteUtils.js`
- `src/components/games/ChordQuiz.jsx`
- `src/pages/Cviceni.jsx`
- `src/components/admin/ChordManager.jsx`

---

### Vizuální zvýraznění černých kláves (21.11.2025)
**Dokončeno:** ✅
**Popis:** Přidána svislá čára od indikátoru dolů pro lepší orientaci

**Změny:**
- ✅ `src/components/lessons/PianoKeyboard.jsx`
  - Přidán motion.div s čarou pod kolečkem
  - Responsivní výška čáry (34/56/78px)
  - Animace s delay 0.15s

**Soubory:**
- `src/components/lessons/PianoKeyboard.jsx`

---

### Migrace User ID (20.11.2025)
**Dokončeno:** ✅
**Popis:** Synchronizace User ID mezi Supabase Auth a piano_users tabulkou

**Problém:**
- User měl rozdílné ID v auth.users a piano_users
- RLS policies blokovaly operace kvůli neshode ID

**Řešení:**
- SQL migrace s kaskádovým přepsáním všech FK
- Zachování všech dat (stats, progress, achievements)

**Soubory:**
- SQL migrace v Supabase

---

## 📊 Statistiky projektu

- **Počet komponent:** ~50+
- **Počet DB tabulek:** ~20+
- **Počet migrací:** 6+
- **Řádků kódu:** ~18,000+
- **UI modulárních komponent:** 4 (ButtonComponents, CardComponents, FormComponents, PageSection)

---

## 🔗 Užitečné odkazy

- [Supabase Dashboard](https://supabase.com)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Documentation](https://react.dev)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Lucide Icons](https://lucide.dev)
- [DnD Kit](https://dndkit.com) - Drag & Drop
- [Workbox](https://developers.google.com/web/tools/workbox) - PWA

---

**Poznámky:**
- Tento soubor by měl být aktualizován při každé větší změně
- Udržujte ho synchronizovaný s aktuálním stavem projektu
- Pro detailní changelog viz `CHANGELOG.md`
- Každá nová feature musí projít quality check (funkčnost, duplicita, logy, komentáře)
- Vše dělat modulárně a znovupoužitelně
