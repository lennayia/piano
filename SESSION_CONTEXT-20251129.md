# Session Context - 29. listopadu 2025

## Datum: 2025-11-29

---

## ✅ DOKONČENO V TÉTO SESSION

### 1. **Database Integration - Quiz Results & Leaderboards**
**Status:** ✅ DOKONČENO A PUSHNUTO

#### **Problém:**
- Kvízy fungovaly, ale výsledky se neukládaly do databáze
- Žebříčky nebyly funkční (žádná data)
- localStorage již nebyl používán, ale chyběla implementace pro Supabase

#### **Řešení:**
Kompletní implementace ukládání výsledků kvízů do databáze s následujícími komponenty:

**A) Vytvořena utility funkce `/src/utils/saveQuizResults.js` (+119 řádků)**
- Centralizovaná logika pro ukládání výsledků kvízů
- **Insert do `piano_quiz_scores`:**
  - `user_id`, `quiz_type`, `score`, `total_questions`, `streak`, `completed_at`
- **Update/Insert do `piano_user_stats`:**
  - `total_xp` - kumulativní XP body
  - `level` - automatický výpočet podle thresholdů (100, 250, 500, 1000)
  - `current_streak` - současná série (daily streak)
  - `best_streak` - nejlepší série
  - `last_activity_date` - datum poslední aktivity
- **Funkce `calculateLevel(totalXP)`:**
  - Level 1: 0-99 XP
  - Level 2: 100-249 XP
  - Level 3: 250-499 XP
  - Level 4: 500-999 XP
  - Level 5: 1000+ XP
- Error handling s graceful degradation

**B) Aktualizován ChordQuiz (~30 řádků změněno)**
- Řádek 13: `import { saveQuizResults } from '../../utils/saveQuizResults';`
- Řádky 129-153: Kompletně přepsána funkce `saveQuizCompletion()`
- Používá: `saveQuizResults('chord_quiz', score, totalQuestions, bestStreak, xpEarned)`
- Odstraněna závislost na `piano_quiz_completions` tabulce

**C) Aktualizován UniversalTheoryQuiz (~60 řádků změněno)**
- Řádek 12: `import { saveQuizResults } from '../../utils/saveQuizResults';`
- Řádky 159-220: Dual-mode ukládání
  - **Detailní tracking:** Ukládání jednotlivých odpovědí do `completionsTable` (zachováno)
  - **Agregované výsledky:** Ukládání celkových výsledků pro žebříčky (nově)
- Quiz type: `theory_${quizType}` (např. `theory_interval`, `theory_scale`)

**D) SQL migrace `/supabase/migrations/002_add_quiz_xp_bonuses.sql` (+23 řádků)**
- Přidáno 4 záznamy do `piano_rewards_config`:
  - `quiz_perfect`: 100 XP (100% správně)
  - `quiz_excellent`: 75 XP (80%+ správně)
  - `quiz_good`: 50 XP (70%+ správně)
  - `quiz_decent`: 25 XP (50%+ správně)
- `ON CONFLICT (action_type) DO UPDATE` - bezpečná opakovaná migrace

**E) Aktualizován GamificationManager (+170 řádků)**
- Řádky 27-31: Import `useQuizXPStore` hooks
- Řádky 34-39: Temporary state pattern (`tempQuizBonuses`)
- Řádky 116-121: `handleSaveQuizBonuses()` - save logika
- Řádky 355-496: Admin UI pro editaci XP bonusů
  - 4 input fields s color-coded borders
  - Zelená (perfect), oranžová (excellent), modrá (good), fialová (decent)
  - Save button s loading state
  - Success/error notifikace

#### **Výsledek:**
✅ Žebříčky napříč uživateli fungují (TOP 50 podle total_xp)
✅ Perzistentní statistiky v Supabase (RLS policies)
✅ Admin kontrola XP bonusů (configurable rewards)
✅ Žádné localStorage pro quiz data
✅ Automatický výpočet levelů a streaks
✅ Konzistentní data flow: Quiz → saveQuizResults → DB

#### **Statistiky:**
- **Nové soubory:** 2 (`saveQuizResults.js`, SQL migrace)
- **Upravené soubory:** 3 (`ChordQuiz.jsx`, `UniversalTheoryQuiz.jsx`, `GamificationManager.jsx`)
- **Net změna:** +402 řádků kódu

#### **Git:**
- **Commit:** `5c59136` - "feat: Database integration - Quiz results & leaderboards"
- **Branch:** `feature/database-quiz-integration-20251129`
- **Pushnuto do:** main + feature branch
- **Dokumentace commit:** `c4b240f` - "docs: Update MASTER_TODO.md"

---

### 2. **Dokumentace - DOKUMENTACE-20251129.md**
**Status:** ✅ DOKONČENO

- Přidána sekce "🎮 Implementace ukládání výsledků kvízů do databáze" (+439 řádků)
- Kompletní popis všech změn (A-E)
- Database schema a RLS policies
- Data flow diagramy
- Testing checklist (všechny položky zaškrtnuty)
- Before/after comparison

---

### 3. **MASTER_TODO.md aktualizace**
**Status:** ✅ DOKONČENO

- Odstraněn dokončený úkol "Fix: Statistiky kvízů nefungují správně" z Priority 1
- Přečíslovány všechny úkoly (2→1, 3→2, atd.)
- Přidán nový záznam do sekce "✅ Nedávno dokončené úkoly"
- Commit: `c4b240f` - "docs: Update MASTER_TODO.md - Add Database Integration task"

---

## 📊 AKTUÁLNÍ STAV PROJEKTU

### **Databázové tabulky (Supabase)**

#### **piano_quiz_scores** (výsledky kvízů)
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- quiz_type (text) - 'chord_quiz', 'theory_interval', 'theory_scale', atd.
- score (integer) - počet správných odpovědí
- total_questions (integer) - celkový počet otázek
- streak (integer) - série správných odpovědí v kvízu
- completed_at (timestamp)
```
**RLS Policies:**
- Users: INSERT vlastní záznamy
- Admins: SELECT všechny záznamy

#### **piano_user_stats** (agregované statistiky)
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users, UNIQUE)
- total_xp (integer, default 0)
- level (integer, default 1)
- current_streak (integer, default 0) - daily streak
- best_streak (integer, default 0)
- last_activity_date (date)
- created_at, updated_at (timestamp)
```
**RLS Policies:**
- Users: INSERT vlastní záznam, UPDATE vlastní záznam, SELECT vlastní záznam
- Admins: SELECT všechny záznamy

#### **piano_rewards_config** (konfigurace odměn)
```sql
- id (uuid, PK)
- action_type (text, UNIQUE) - 'quiz_perfect', 'quiz_excellent', atd.
- xp_value (integer) - počet XP bodů
- description (text)
- is_active (boolean, default true)
- created_at, updated_at (timestamp)
```
**RLS Policies:**
- All users: SELECT active records
- Admins: INSERT, UPDATE, DELETE

---

### **Zustand Stores**

#### **useQuizXPStore** (`/src/store/useQuizXPStore.js`)
- **State:**
  - `quizBonuses` - { perfect, excellent, good, decent }
  - `isLoadingBonuses`, `quizBonusesError`
- **Actions:**
  - `loadQuizBonuses()` - načte z `piano_rewards_config`
  - `saveQuizBonuses(bonuses)` - uloží 4 záznamy
  - `getXPForPercentage(percentage)` - vrátí XP podle %

#### **useUserStore** (`/src/store/useUserStore.js`)
- Auth stav (session/user)
- **Pouze localStorage:** Zustand persist pro auth session
- **ŽÁDNÉ localStorage pro quiz data!**

---

### **Klíčové komponenty**

#### **Quiz komponenty (Frontend)**
1. **ChordQuiz** (`/src/components/games/ChordQuiz.jsx`)
   - Poslechový kvíz pro akordy
   - Ukládá výsledky: `saveQuizResults('chord_quiz', ...)`
   - Automaticky generované možnosti (1 správná + 3 náhodné)

2. **UniversalTheoryQuiz** (`/src/components/games/UniversalTheoryQuiz.jsx`)
   - Teoretické kvízy (interval, scale, chord theory, atd.)
   - Dual-mode: detailní tracking + agregované výsledky
   - Quiz type: `theory_${quizType}`

3. **QuizResultsPanel** (`/src/components/games/QuizResultsPanel.jsx`)
   - Reusable komponenta pro zobrazení výsledků
   - Motivační zprávy, emoji, XP earned
   - Použitá v ChordQuiz i UniversalTheoryQuiz

#### **Admin komponenty**
1. **GamificationManager** (`/src/components/admin/GamificationManager.jsx`)
   - Záložky: Přehled, Odměny, Žebříček
   - **Odměny:** Editace XP bonusů pro kvízy
   - **Žebříček:** TOP 50 uživatelů podle total_xp
   - Temporary state pattern pro editaci

2. **QuizManager** (`/src/components/admin/QuizManager.jsx`)
   - Univerzální správa všech typů kvízů
   - Záložky: Akordy, Teorie, Intervaly, Stupnice, Rytmus, Mix
   - Pro 'chord': vlastní implementace
   - Pro ostatní: `<UniversalQuizManager quizType={...} />`

3. **UniversalQuizManager** (`/src/components/admin/UniversalQuizManager.jsx`)
   - Univerzální správce pro theory, interval, scale, rhythm, mixed
   - Dynamic tables podle quiz type

---

### **Utility funkce**

#### **saveQuizResults** (`/src/utils/saveQuizResults.js`)
```javascript
saveQuizResults(quizType, score, totalQuestions, bestStreak, xpEarned)
// Returns: { success: boolean, error?: string }
```
- Insert do piano_quiz_scores
- Update/Insert piano_user_stats
- Calculate level
- Update streaks

#### **quizUtils** (`/src/utils/quizUtils.js`)
```javascript
getMotivationalMessage(score, total)
// Returns: { emoji, title, message }

calculateXP(score, total)
// Returns: XP podle percentage (uses useQuizXPStore)
```

---

## 🎯 CO FUNGUJE

### ✅ Quiz systém
- Chord Quiz (poslechový) - ukládání do DB ✅
- Theory Quizzes (teoretické) - ukládání do DB ✅
- Automatické generování možností pro Chord Quiz ✅
- XP calculation podle performance ✅
- Motivační zprávy ✅

### ✅ Gamifikace
- XP bodování (configurable v admin) ✅
- Level systém (1-5 podle XP thresholdů) ✅
- Daily streaks (current_streak, best_streak) ✅
- Leaderboard (TOP 50) ✅
- Admin kontrola odměn ✅

### ✅ Databáze
- RLS policies pro všechny tabulky ✅
- Migrations (001_initial_schema.sql, 002_add_quiz_xp_bonuses.sql) ✅
- User stats tracking ✅
- Quiz scores tracking ✅

### ✅ UI/UX
- Modularizace UI komponent (TabButtons, ButtonComponents, CardComponents) ✅
- HelpPanel systém (responzivní nápověda) ✅
- Framer Motion animace ✅
- Responsive design ✅
- Google Fonts (Lato + Roboto) ✅

---

## 🐛 ZNÁMÉ PROBLÉMY

### 1. **Teoretické kvízy zmizely (z předchozí session)**
- **Status:** MOŽNÁ VYŘEŠENO? (UniversalTheoryQuiz používá saveQuizResults)
- **TODO:** Ověřit, že všechny theoretical quizzes se zobrazují
- **Lokace:** Admin → Kvízy → Teorie

### 2. **Song completions RLS policy**
- **Status:** Nevyřešeno
- **Popis:** Uživatelé nemůžou ukládat dokončení písní
- **Potřeba:** RLS policy pro INSERT na `piano_song_completions`
- **Priorita:** 🔵 Nízká (MASTER_TODO #15)

### 3. **Lesson duplication - chybějící duration**
- **Status:** Nevyřešeno
- **Popis:** Při duplikaci lekcí chybí sloupec `duration`
- **Potřeba:** DB migrace + oprava duplikace funkce
- **Priorita:** 🔵 Nízká (MASTER_TODO #14)

### 4. **Historie aktivit - chybějící user_id**
- **Status:** Nevyřešeno
- **Popis:** Tabulka pro historii aktivit nemá sloupec user_id
- **Priorita:** Nízká (Backlog)

---

## 🔜 DALŠÍ KROKY (podle MASTER_TODO.md)

### **Priorita 1 - Kritická**

#### 1. Vlastní systém notifikací ⏳
**Cíl:** Nahradit browser alerts/notifikace vlastním systémem
- `src/components/ui/Toast.jsx` - automatické notifikace (3-5s)
- `src/components/ui/AlertDialog.jsx` - modální dialogy (musí být potvrzeno)
- `src/context/NotificationContext.jsx` - context
- `src/hooks/useNotification.js` - hook
- Design: RADIUS, SHADOW, lucide-react ikony, Framer Motion
- Barvy: success (zelená), error (červená), warning (žlutá), info (modrá)

### **Priorita 2 - Vysoká**

#### 2. Dokončit refaktoring TabButtons ⏳
- Zkontrolovat re-exporty v TabButtons.jsx
- Ověřit správné importy ve všech komponentách
- Zajistit konzistenci

#### 3. Paginace pro dlouhé seznamy ⏳
- `src/components/ui/Pagination.jsx` - univerzální komponenta
- QuizManager, SongLibrary, LessonList, AchievementManager, UserList
- Server-side pagination (limit/offset)
- Responsive: desktop (full), mobile (Previous/Next)

#### 4. Free/Premium obsah ⏳
- DB sloupec `access_level` ENUM('free', 'premium')
- Tabulky: piano_lessons, piano_quiz_chords, piano_songs, piano_theory_materials
- User tabulka: subscription_status, subscription_expires_at
- Admin UI: checkbox/select "Přístup" + ikona 🔓/🔒
- Frontend filtrace

#### 5. Drag & Drop pro pořadí ⏳
- Knihovna: `@dnd-kit/core` + `@dnd-kit/sortable`
- `src/components/ui/DraggableList.jsx`
- Automatické přečíslování `display_order`
- QuizManager, SongLibrary, LessonList, AchievementManager

#### 6. Zobrazit teoretické otázky pro akordy ⏳
- V sekci Teorie → Kvízy → Akordy
- Filtrovat `quiz_type = 'chord'` a `questionText IS NOT NULL`
- Oddělení od poslechového kvízu

---

## 📁 STRUKTURA PROJEKTU

```
/Users/lenkaroubalova/Documents/Projekty/piano/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── GamificationManager.jsx ✅ (aktualizováno - XP bonuses UI)
│   │   │   ├── QuizManager.jsx
│   │   │   └── UniversalQuizManager.jsx ✅ (aktualizováno - saveQuizResults)
│   │   ├── games/
│   │   │   ├── ChordQuiz.jsx ✅ (aktualizováno - saveQuizResults)
│   │   │   ├── UniversalTheoryQuiz.jsx ✅ (aktualizováno - dual-mode)
│   │   │   └── QuizResultsPanel.jsx (reusable)
│   │   ├── ui/
│   │   │   ├── TabButtons.jsx (centrální export hub)
│   │   │   ├── ButtonComponents.jsx (Chip, ActionButton, AddButton...)
│   │   │   ├── CardComponents.jsx (PageCard, QuestionCard)
│   │   │   ├── FormComponents.jsx (FormInput, FormSelect...)
│   │   │   ├── PageSection.jsx (komplexní layout)
│   │   │   └── HelpPanel.jsx (responzivní nápověda)
│   │   └── resources/
│   │       ├── SongLibrary.jsx (HelpButton + HelpPanel)
│   │       └── NoteComposer.jsx (vyčištěno - bez accordion help)
│   ├── store/
│   │   ├── useQuizXPStore.js (XP bonuses management)
│   │   └── useUserStore.js (auth - pouze localStorage zde)
│   ├── utils/
│   │   ├── saveQuizResults.js ✅ (NOVÝ - centralizovaná save logika)
│   │   ├── quizUtils.js (motivational messages, XP calculation)
│   │   └── noteUtils.js (sortNotesByKeyboard)
│   └── pages/
│       ├── Admin.jsx
│       ├── Cviceni.jsx
│       └── Teorie.jsx
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql (hlavní schema)
│       └── 002_add_quiz_xp_bonuses.sql ✅ (NOVÝ - XP bonuses)
├── DOKUMENTACE-20251129.md ✅ (aktualizováno +439 řádků)
├── MASTER_TODO.md ✅ (aktualizováno - přidán dokončený úkol)
└── SESSION_CONTEXT-20251129.md ✅ (TENTO SOUBOR)
```

---

## 🔍 DŮLEŽITÉ POZNÁMKY PRO DALŠÍ SESSION

### **Při práci s kvízy:**
1. ChordQuiz a UniversalTheoryQuiz již používají `saveQuizResults()`
2. ŽÁDNÉ localStorage pro quiz data - vše v Supabase
3. XP bonusy jsou konfigurovatelné v Admin → Gamifikace → Odměny
4. Level se počítá automaticky podle total_xp

### **Při práci s databází:**
1. RLS policies MUSÍ být nastaveny správně
2. Nové tabulky potřebují migraci v `/supabase/migrations/`
3. Všechny FK vztahy na `auth.users` používají `user_id`

### **Při práci s UI:**
1. Používat komponenty z `TabButtons.jsx` (centrální import)
2. RADIUS, SHADOW, BORDER konstanty z `styleConstants.js`
3. Google Fonts: Lato (body) + Roboto (headings)
4. Framer Motion pro animace

### **Při commitování:**
1. Conventional commits: feat:, fix:, docs:, refactor:, style:
2. Vždy přidat do commit message: "Generated with Claude Code"
3. Push do main + feature branch (pokud existuje)
4. Aktualizovat MASTER_TODO.md po dokončení úkolů

### **localStorage - Co se SMÍRNĚ používá:**
- ✅ Auth session (Zustand persist v useUserStore) - JEDINÉ povolené použití
- ❌ Quiz data - VŠE v Supabase!
- ❌ User stats - VŠE v Supabase!
- ❌ Scores - VŠE v Supabase!

---

## 🎯 TESTING CHECKLIST

Před každým pushem ověřit:

### Quiz systém:
- [ ] ChordQuiz ukládá výsledky do DB
- [ ] UniversalTheoryQuiz ukládá výsledky + detaily
- [ ] piano_user_stats se aktualizuje (XP, level, streak)
- [ ] Leaderboard zobrazuje data
- [ ] XP bonusy lze editovat v admin

### UI/UX:
- [ ] Všechny komponenty používají modulární UI z TabButtons
- [ ] HelpPanel funguje responzivně
- [ ] Animace jsou smooth (Framer Motion)
- [ ] Fonty: Lato (body) + Roboto (headings)

### Databáze:
- [ ] RLS policies fungují správně
- [ ] Migrace lze spustit opakovaně (ON CONFLICT)
- [ ] FK constraints jsou správně nastaveny

### Git:
- [ ] Conventional commit messages
- [ ] MASTER_TODO.md aktualizován
- [ ] Dokumentace aktualizována
- [ ] Pushnuto do main (+ feature branch pokud existuje)

---

## 📊 STATISTIKY PROJEKTU

- **Počet komponent:** ~50+
- **Počet DB tabulek:** ~20+
- **Počet migrací:** 2 (001_initial_schema.sql, 002_add_quiz_xp_bonuses.sql)
- **Řádků kódu:** ~18,400+
- **UI modulárních komponent:** 4 (ButtonComponents, CardComponents, FormComponents, PageSection)
- **Zustand stores:** 2 (useQuizXPStore, useUserStore)

---

## 🔗 UŽITEČNÉ ODKAZY

- [Supabase Dashboard](https://supabase.com)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Documentation](https://react.dev)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Lucide Icons](https://lucide.dev)
- [DnD Kit](https://dndkit.com) - pro Drag & Drop (next task)

---

**Poznámka:** Tento kontext byl vytvořen 29. listopadu 2025 po dokončení Database Integration feature. Všechny změny jsou commitnuté a pushnuté do main + feature branch.
