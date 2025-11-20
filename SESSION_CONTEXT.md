# Piano Learning App - Session Context

**Datum aktualizace**: 20. listopadu 2025
**Branch**: `main`
**Poslední commit**: `9194992` - Změna textu kvízu z 'Poznáš akord?' na 'Poznáte akord?'

## 📋 Aktuální stav projektu

### ✅ Kompletně funkční
- **Frontend aplikace** - React 19 + Vite
- **Databáze** - Supabase PostgreSQL s custom schématem `piano`
- **Autentizace** - Vlastní systém (ne Supabase Auth)
- **Lekce** - Interaktivní lekce s klaviaturou
- **Písničky** - Knihovna s practice mode a detekcí chyb
- **Kvízy** - "Poznáte akord?" kvíz s audio přehráváním
- **Historie** - Tracking všech aktivit (lekce, písničky, kvízy)
- **Gamifikace** - XP, achievementy, streaky
- **Admin panel** - Správa uživatelů, akordů, achievementů
- **Dokumentace** - Kompletní README.md

### 🎯 Hlavní funkce

#### Pro studenty:
1. **Lekce** - Strukturované podle obtížnosti
2. **Knihovna písní** - Practice mode s detekcí správných not
3. **Kvíz akordů** - Interaktivní rozpoznávání akordů
4. **Glosář** - Slovník hudebních pojmů
5. **Harmonizační šablony** - Návody na harmonizaci
6. **Skladatel not** - Drag & drop kompozice
7. **Dashboard** - Přehled pokroku, XP, achievementů
8. **Historie** - Všechny dokončené aktivity s filtry

#### Pro adminy:
1. **Správa uživatelů** - Přehled všech registrovaných
2. **Správa akordů** - CRUD pro kvízové akordy
3. **Správa achievementů** - Vytváření a editace odměn

## 🗄️ Databázová struktura

### Schéma: `piano`

**Uživatelské tabulky:**
- `piano_users` - Základní uživatelské údaje
- `piano_user_stats` - Statistiky (XP, streaky, dokončené aktivity)
- `piano_achievements` - Definice achievementů
- `piano_user_achievements` - Získané achievementy uživatelů

**Tracking tabulky:**
- `piano_lesson_completions` - Dokončené lekce
- `piano_song_completions` - Dokončené písničky (s mistakes_count)
- `piano_quiz_completions` - Dokončené kvízy (se score)

**Content tabulky:**
- `piano_songs` - Katalog písní
- `piano_quiz_chords` - Akordy pro kvíz
- `piano_glossary_terms` - Glosář
- `piano_harmonization_templates` - Šablony harmonizace

### RLS Politiky
- **INSERT** - Validace přes `EXISTS (SELECT 1 FROM piano.piano_users WHERE id = user_id)`
- **SELECT** - Povoleno pro `anon, authenticated` (USING true)
- **Bez Supabase Auth** - Vlastní autentizační systém

## 🎵 Notový systém

### Formát textového zápisu:
```
Základní noty: C, D, E, F, G, A, H
Oktávy: C' (vyšší), C. (nižší)
Délky: d (eighth), dd (sixteenth), D (quarter), DD (half), DDDD (whole)
Akcidenty: Cis (#), Des (b)
Pauzy: -, --, ---, ----
```

### Normalizace not:
- Funkce `normalizeNote()` v `SongLibrary.jsx:366-404`
- Extrahuje pouze základní notu (první písmeno)
- Ignoruje duration markery (DD, dd)
- Zachovává oktávu (apostrofy)
- Konvertuje akcidenty na # formát
- Ignoruje pauzy a textové prvky

## 🏗️ Architektura

### Tech Stack:
```javascript
Frontend:
- React 19
- Vite 7.2
- React Router v7
- Framer Motion (animace)
- Lucide React (ikony)
- Zustand (state management)

Backend & DB:
- Supabase (PostgreSQL)
- Custom schéma 'piano'
- RLS politiky bez Supabase Auth

Audio:
- Web Audio API
- Custom AudioEngine utility

Další:
- @dnd-kit (drag and drop)
- CSS Variables (theming)
- Glassmorphism design
```

### Struktura projektu:
```
src/
├── components/
│   ├── admin/          # Admin komponenty
│   ├── auth/           # Login, Register, ProtectedRoute
│   ├── common/         # Confetti
│   ├── games/          # ChordQuiz
│   ├── layout/         # Header, Layout
│   ├── lessons/        # LessonCard, Modal, Keyboard
│   ├── resources/      # Glossary, Templates, Composer, SongLibrary
│   └── ui/             # Modal
├── pages/              # Admin, History, Home, Lesson, Login, Registration, Resources, UserDashboard
├── store/              # Zustand stores
├── utils/              # audio.js
├── lib/                # supabase.js
└── index.css
```

### Key Files:

**Lesson tracking:**
- `src/pages/Lesson.jsx` - Hlavní stránka lekce, `checkLessonCompletion()` funkce (řádek 36-54)
- `src/components/lessons/LessonModal.jsx` - Modal s lekcí, stejná logika

**Song practice:**
- `src/components/resources/SongLibrary.jsx` - Practice mode s `normalizeNote()` funkcí
- Detekce chyb, perfect score tracking

**Quiz:**
- `src/components/games/ChordQuiz.jsx` - Kvíz "Poznáte akord?"
- Načítání akordů z `piano_quiz_chords` tabulky
- Ukládání výsledků do `piano_quiz_completions`

**History:**
- `src/pages/History.jsx` - Přehled všech aktivit
- Filtrování podle typu (all, lessons, songs, quizzes)
- Načítání z 3 tabulek: lesson_completions, song_completions, quiz_completions

**Dashboard:**
- `src/pages/UserDashboard.jsx` - Statistiky, recent activities, achievementy

**Admin:**
- `src/pages/Admin.jsx` - Navigace mezi admin sekcemi
- `src/components/admin/AchievementManager.jsx` - CRUD achievementů
- `src/components/admin/ChordManager.jsx` - CRUD akordů

**Audio:**
- `src/utils/audio.js` - AudioEngine class
  - `playNote(note, duration)` - Přehrávání jednotlivých not
  - `playChord(notes, duration)` - Přehrávání akordů
  - `playSuccess()`, `playError()`, `playFanfare()`, `playApplause()` - Sound effects

## 🔧 Environment Variables

```env
# Povinné
VITE_SUPABASE_URL=https://qrnsrhrgjzijqphgehra.supabase.co
VITE_SUPABASE_ANON_KEY=<your-key>

# Volitelné (email marketing)
VITE_ECOMAIL_ENABLED=false
VITE_MAILERLITE_ENABLED=false
VITE_SMARTEMAILING_ENABLED=false
```

## 📝 Poslední změny (tato session)

### 1. Oprava lesson completions (commit fc374a7)
**Problém:** Lekce se neuložily jako dokončené
**Řešení:**
- Přidána funkce `checkLessonCompletion()` která načítá stav z databáze
- Odstraněn neexistující `currentUser.progress`
- Opraveno v `Lesson.jsx` i `LessonModal.jsx`

### 2. Kompletní dokumentace (commit b7c1dc4)
**Přidáno:**
- README.md s 700+ řádky
- Instalační návod
- Databázová struktura
- Architektura aplikace
- Notový systém
- Deployment instrukce
- Troubleshooting

### 3. Změna textu kvízu (commit 9194992)
**Změna:** "Poznáš akord?" → "Poznáte akord?" (vykání místo tykání)
**Soubory:**
- ChordQuiz.jsx (4 místa)
- UserDashboard.jsx
- Resources.jsx
- History.jsx

## ⚠️ Známé problémy

### ✅ Vyřešené:
- ~~401 Unauthorized při ukládání aktivit~~ - Opraveno RLS politikami
- ~~False positive chyby v song practice~~ - Opraveno funkcí `normalizeNote()`
- ~~Missing xp_earned column~~ - Přidán sloupec do tabulky
- ~~Empty quiz/lesson arrays~~ - Přidány SELECT RLS politiky
- ~~Lekce se neuloží~~ - Opravena kontrola completion stavu

### 🟢 Žádné známé problémy
Všechny hlavní funkce fungují správně.

## 🚀 Deployment

**Produkce:**
- Build: `npm run build`
- Vhodné pro Vercel/Netlify
- Environment variables musí být nastaveny

**Development:**
```bash
npm install
npm run dev  # localhost:5173
```

## 📊 Statistiky projektu

**Commity:** 15+ commitů
**Soubory:** 40+ komponent/stránek
**Tabulky:** 10 databázových tabulek
**Funkce:** Lekce, Písničky, Kvízy, Historie, Achievementy, Admin panel
**Dokumentace:** README.md (700+ řádků)

## 🔗 Důležité linky

**Repository:** https://github.com/lennayia/piano
**Branch:** `main`
**Supabase URL:** https://qrnsrhrgjzijqphgehra.supabase.co

## 👤 Admin účet

**Email:** admin@piano.cz
**Heslo:** SecureAdminPass2024

(Vytvořen přes `create_admin_account.sql`)

## 📋 Migrace soubory (v pořadí spuštění)

1. `supabase_migration.sql` - Základní struktura
2. `supabase_migration_achievements_system.sql` - Achievement systém
3. `supabase_migration_achievements_customization.sql` - Customizace achievementů
4. `supabase_migration_quiz_and_songs_tracking.sql` - Tracking písní a kvízů
5. `supabase_migration_lesson_completions.sql` - Tracking lekcí
6. `supabase_migration_quiz_chords.sql` - Akordy pro kvízy
7. `supabase_fix_song_completions_rls.sql` - Opravy RLS politik

## 🎯 Co dál?

Aplikace je **plně funkční** a připravená k použití. Možná vylepšení:

### Potenciální budoucí funkce:
- Export statistik do PDF/CSV
- Sdílení pokroku na sociálních sítích
- Více kvízů (intervaly, tonality, atd.)
- Video tutoriály k lekcím
- Multiplayer kvízy
- Mobile app (React Native)
- MIDI keyboard podpora
- Notový editor s vizuální notací

### Optimalizace:
- Server-side rendering (Next.js)
- Image optimization
- Lazy loading komponent
- Service Worker (offline mode)
- Analytics (Google Analytics, Mixpanel)

---

**Status:** ✅ Projekt je kompletní, otestovaný a dokumentovaný.
**Working tree:** Clean
**Last update:** 20. listopadu 2025
