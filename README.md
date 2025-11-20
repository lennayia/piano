# PianoPro

**Copyright (c) 2025 Lenka Roubalová. All rights reserved.**

> ⚠️ **PROPRIETARY SOFTWARE** - This is closed-source, proprietary software. Unauthorized copying, distribution, or use is strictly prohibited. See [LICENSE](LICENSE) for details.

Interaktivní webová aplikace pro výuku hry na klavír s gamifikací, lekcemi, kvízy a skladatelem not.

## Obsah

- [O projektu](#o-projektu)
- [Funkce](#funkce)
- [Technologie](#technologie)
- [Instalace](#instalace)
- [Konfigurace](#konfigurace)
- [Databázová struktura](#databázová-struktura)
- [Architektura aplikace](#architektura-aplikace)
- [Notový systém](#notový-systém)
- [Deployment](#deployment)

## O projektu

Piano Learning App je komplexní vzdělávací platforma zaměřená na výuku hry na klavír. Aplikace kombinuje:
- **Strukturované lekce** s interaktivní klaviaturou
- **Knihovnu písní** s možností procvičování a detekcí chyb
- **Kvízy** pro testování znalostí akordů
- **Skladatel not** pro vytváření vlastních melodií
- **Gamifikaci** s body, achievementy a statistikami
- **Admin rozhraní** pro správu obsahu

## Funkce

### Pro studenty

#### 🎹 Interaktivní lekce
- Strukturované lekce podle obtížnosti (začátečník, mírně pokročilý, pokročilý)
- Interaktivní klaviatura s vizuálním zvýrazněním not
- Pokrokové sledování dokončených lekcí
- Audio přehrávání jednotlivých not

#### 🎵 Knihovna písní
- Katalog písní s různou obtížností
- **Practice Mode** - procvičování s detekcí správně zahraných not
- Sledování chyb a perfektních provedení
- Zobrazení notového zápisu

#### 🎮 Kvízy a hry
- **Poznáte akord?** - interaktivní kvíz pro rozpoznávání akordů
- Audio přehrávání akordů
- Sledování skóre a úspěšnosti

#### 📚 Vzdělávací materiály
- **Glosář** - slovník hudebních pojmů
- **Harmonizační šablony** - návody na harmonizaci
- **Skladatel not** - nástroj pro skládání vlastních melodií
- Drag & drop pro uspořádání not

#### 📊 Statistiky a gamifikace
- **Dashboard** s přehledem pokroku
- **XP systém** - body za dokončené aktivity
- **Achievement systém** - odměny za milníky
- **Streak tracking** - sledování série dnů cvičení
- **Historie aktivit** - kompletní přehled všech dokončených aktivit
- Filtrování podle typu aktivity (lekce, písničky, kvízy)

### Pro administrátory

#### ⚙️ Admin panel
- **Správa uživatelů** - přehled všech registrovaných uživatelů
- **Správa akordů** - CRUD operace pro kvízové akordy
- **Správa achievementů** - vytváření a úprava odměn
- Dashboard s přehledem systému

## Technologie

### Frontend
- **React 19** - UI framework
- **Vite** - build tool a dev server
- **React Router v7** - routing
- **Framer Motion** - animace a přechody
- **Lucide React** - ikony
- **Zustand** - state management

### Backend & Database
- **Supabase** - BaaS (Backend as a Service)
  - PostgreSQL databáze
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Custom schéma `piano`

### Styling
- **Vlastní CSS** s CSS variables
- Glassmorphism design
- Responsivní design
- Dark/Light režim připravený

### Audio
- **Web Audio API** - přehrávání not a akordů
- Vlastní `audioEngine` utilita

### Další knihovny
- **@dnd-kit** - drag and drop funkcionalita
- **@supabase/supabase-js** - Supabase client

## Instalace

### Prerekvizity
- Node.js 18+ a npm
- Supabase účet a projekt

### Kroky instalace

1. **Klonování repozitáře**
```bash
git clone <repository-url>
cd piano
```

2. **Instalace závislostí**
```bash
npm install
```

3. **Konfigurace prostředí**
```bash
cp .env.example .env
```

Upravte `.env` soubor:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. **Vytvoření databázové struktury**

Spusťte následující SQL skripty v Supabase SQL Editoru v tomto pořadí:

```bash
# 1. Základní struktura
supabase_migration.sql

# 2. Achievement systém
supabase_migration_achievements_system.sql
supabase_migration_achievements_customization.sql

# 3. Tracking aktivit
supabase_migration_quiz_and_songs_tracking.sql
supabase_migration_lesson_completions.sql

# 4. Akordy pro kvízy
supabase_migration_quiz_chords.sql

# 5. Opravy RLS politik
supabase_fix_song_completions_rls.sql
```

5. **Vytvoření admin účtu**
```bash
# Spusťte v Supabase SQL Editoru
create_admin_account.sql
```

Výchozí přihlašovací údaje:
- Email: `admin@piano.cz`
- Heslo: `SecureAdminPass2024`

6. **Spuštění aplikace**
```bash
npm run dev
```

Aplikace poběží na `http://localhost:5173`

## Konfigurace

### Environment proměnné

```env
# Supabase - povinné
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Email marketing - volitelné
VITE_ECOMAIL_ENABLED=false
VITE_ECOMAIL_API_KEY=
VITE_ECOMAIL_LIST_ID=

VITE_MAILERLITE_ENABLED=false
VITE_MAILERLITE_API_KEY=
VITE_MAILERLITE_GROUP_ID=

VITE_SMARTEMAILING_ENABLED=false
VITE_SMARTEMAILING_USERNAME=
VITE_SMARTEMAILING_API_KEY=
VITE_SMARTEMAILING_LIST_ID=
```

### Supabase konfigurace

Databáze používá **custom schéma `piano`** (ne `public`). Všechny tabulky jsou v `piano` schématu:
- `piano.piano_users`
- `piano.piano_user_stats`
- `piano.piano_song_completions`
- atd.

RLS politiky jsou nakonfigurovány pro **anonymní i autentizované přístupy** bez potřeby Supabase Auth.

## Databázová struktura

### Schéma `piano`

#### Tabulky uživatelů
```sql
piano.piano_users
- id (UUID, PK)
- username (VARCHAR)
- email (VARCHAR, unique)
- password_hash (TEXT)
- is_admin (BOOLEAN)
- created_at (TIMESTAMPTZ)

piano.piano_user_stats
- user_id (UUID, FK)
- lessons_completed (INTEGER)
- songs_completed (INTEGER)
- quizzes_completed (INTEGER)
- total_xp (INTEGER)
- current_streak (INTEGER)
- longest_streak (INTEGER)
- last_activity_date (DATE)
```

#### Tabulky aktivit
```sql
piano.piano_lesson_completions
- id (UUID, PK)
- user_id (UUID)
- lesson_id (VARCHAR)
- lesson_title (TEXT)
- xp_earned (INTEGER)
- completed_at (TIMESTAMPTZ)

piano.piano_song_completions
- id (UUID, PK)
- user_id (UUID)
- song_id (VARCHAR)
- song_title (TEXT)
- is_perfect (BOOLEAN)
- mistakes_count (INTEGER)
- completed_at (TIMESTAMPTZ)

piano.piano_quiz_completions
- id (UUID, PK)
- user_id (UUID)
- quiz_name (VARCHAR)
- score (INTEGER)
- total_questions (INTEGER)
- is_perfect (BOOLEAN)
- xp_earned (INTEGER)
- completed_at (TIMESTAMPTZ)
```

#### Achievement systém
```sql
piano.piano_achievements
- id (UUID, PK)
- achievement_id (VARCHAR, unique)
- title (TEXT)
- description (TEXT)
- icon (VARCHAR)
- requirement_type (VARCHAR)
- requirement_value (INTEGER)
- xp_reward (INTEGER)
- is_active (BOOLEAN)

piano.piano_user_achievements
- id (UUID, PK)
- user_id (UUID)
- achievement_id (VARCHAR)
- earned_at (TIMESTAMPTZ)
```

#### Kvízové akordy
```sql
piano.piano_quiz_chords
- id (UUID, PK)
- name (VARCHAR)
- notes (TEXT[])
- difficulty (VARCHAR)
- category (VARCHAR)
- is_active (BOOLEAN)
```

#### Content tabulky
```sql
piano.piano_songs
- id (UUID, PK)
- title (VARCHAR)
- artist (VARCHAR)
- notes (TEXT)
- difficulty (VARCHAR)
- created_at (TIMESTAMPTZ)

piano.piano_glossary_terms
- id (UUID, PK)
- term (VARCHAR)
- definition (TEXT)
- category (VARCHAR)

piano.piano_harmonization_templates
- id (UUID, PK)
- name (VARCHAR)
- description (TEXT)
- template_data (JSONB)
```

### Indexy

Všechny tabulky mají optimalizované indexy pro:
- User lookups (`user_id`)
- Časové řazení (`completed_at DESC`)
- Unikátní kombinace (composite keys)

## Architektura aplikace

### Struktura projektu

```
piano/
├── src/
│   ├── components/
│   │   ├── admin/              # Admin komponenty
│   │   │   ├── AchievementManager.jsx
│   │   │   ├── ChordManager.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── UserList.jsx
│   │   ├── auth/               # Autentizace
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegistrationForm.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── common/             # Společné komponenty
│   │   │   └── Confetti.jsx
│   │   ├── games/              # Herní komponenty
│   │   │   └── ChordQuiz.jsx
│   │   ├── layout/             # Layout
│   │   │   ├── Header.jsx
│   │   │   └── Layout.jsx
│   │   ├── lessons/            # Lekce
│   │   │   ├── LessonCard.jsx
│   │   │   ├── LessonList.jsx
│   │   │   ├── LessonModal.jsx
│   │   │   └── PianoKeyboard.jsx
│   │   ├── resources/          # Vzdělávací materiály
│   │   │   ├── Glossary.jsx
│   │   │   ├── HarmonizationTemplates.jsx
│   │   │   ├── NoteComposer.jsx
│   │   │   └── SongLibrary.jsx
│   │   └── ui/                 # UI komponenty
│   │       └── Modal.jsx
│   ├── pages/                  # Stránky
│   │   ├── Admin.jsx
│   │   ├── History.jsx
│   │   ├── Home.jsx
│   │   ├── Lesson.jsx
│   │   ├── PianoLogin.jsx
│   │   ├── Registration.jsx
│   │   ├── Resources.jsx
│   │   └── UserDashboard.jsx
│   ├── store/                  # Zustand stores
│   │   ├── useGlossaryStore.js
│   │   ├── useHarmonizationTemplatesStore.js
│   │   ├── useLessonStore.js
│   │   ├── useSongStore.js
│   │   └── useUserStore.js
│   ├── utils/                  # Utility funkce
│   │   └── audio.js            # Audio engine
│   ├── lib/                    # Knihovny
│   │   └── supabase.js         # Supabase client
│   ├── App.jsx                 # Hlavní komponenta
│   ├── main.jsx               # Entry point
│   └── index.css              # Globální styly
├── public/                     # Statické soubory
├── supabase*.sql              # Databázové migrace
├── .env.example               # Příklad konfigurace
├── package.json
├── vite.config.js
└── README.md
```

### State Management (Zustand)

#### useUserStore
```javascript
// Správa uživatelů a autentizace
- currentUser
- users
- login()
- logout()
- register()
- updateUserStats()
- checkAndUpdateStreak()
```

#### useLessonStore
```javascript
// Správa lekcí
- lessons
- fetchLessons()
```

#### useSongStore
```javascript
// Správa písní
- songs
- fetchSongs()
```

#### useGlossaryStore
```javascript
// Správa glosáře
- terms
- fetchTerms()
- addTerm()
- updateTerm()
- deleteTerm()
```

#### useHarmonizationTemplatesStore
```javascript
// Správa harmonizačních šablon
- templates
- fetchTemplates()
```

### Routing

```javascript
/                    # Domovská stránka
/login              # Přihlášení
/registration       # Registrace
/dashboard          # Dashboard uživatele (protected)
/lessons/:id        # Detail lekce (protected)
/resources          # Vzdělávací materiály (protected)
/history            # Historie aktivit (protected)
/admin              # Admin panel (admin only)
```

### Audio Engine

`src/utils/audio.js` obsahuje:

```javascript
class AudioEngine {
  // Přehrávání jednotlivých not
  playNote(note, duration)

  // Přehrávání akordů
  playChord(notes, duration)

  // Zvukové efekty
  playSuccess()
  playError()
  playFanfare()
  playApplause()
}
```

Využívá Web Audio API s OscillatorNode pro generování zvuků.

## Notový systém

Aplikace používá **textový notový zápis** inspirovaný tradičním notovým systémem.

### Základní noty
```
C, D, E, F, G, A, H (B)
```

### Oktávy
- `c` - malá oktáva
- `C` - jednočárkovaná oktáva (default)
- `C'` - dvoučárkovaná oktáva (vyšší)
- `C.` - velká oktáva (nižší)

### Délky not (duration)
- `d` - osminová nota (eighth)
- `dd` - šestnáctinová nota (sixteenth)
- `D` - čtvrťová nota (quarter)
- `DD` - půlová nota (half)
- `DDD` - tečkovaná půlová
- `DDDD` - celá nota (whole)

### Akcidenty
- `Cis` nebo `C#` - křížek (sharp)
- `Des` nebo `Db` - béčko (flat)

### Pauzy
```
-     # krátká pauza
--    # střední pauza
---   # dlouhá pauza
----  # velmi dlouhá pauza
```

### Příklad zápisu písně
```javascript
notes: "C D E F G G A G F E D C C C"
```

### Normalizace not

Pro porovnání zahraných not se používá `normalizeNote()` funkce:
- Ignoruje pauzy (`-`, `--`, atd.)
- Ignoruje textové prvky
- Extrahuje pouze základní notu (první písmeno)
- Zachovává oktávu (apostrofy)
- Konvertuje akcidenty na # formát

```javascript
normalizeNote("CDD")    // → "C"      (ignoruje délku)
normalizeNote("C'")     // → "C'"     (zachovává oktávu)
normalizeNote("Cis")    // → "C#"     (konvertuje akcident)
normalizeNote("---")    // → null     (ignoruje pauzy)
```

## Deployment

### Production build

```bash
npm run build
```

Build vytvoří optimalizovanou verzi v `dist/` složce.

### Deployment na Vercel/Netlify

1. **Připojte repository** na Vercel/Netlify
2. **Nastavte environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **Build command**: `npm run build`
4. **Output directory**: `dist`

### Deployment na vlastní server

```bash
# Build
npm run build

# Upload dist/ folder na server
scp -r dist/* user@server:/var/www/piano

# Konfigurace nginx
server {
    listen 80;
    server_name piano.example.com;
    root /var/www/piano;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Environment variables v produkci

Ujistěte se, že máte nastavené:
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- 🔒 Nikdy necommitujte `.env` soubor

## Zabezpečení

### Autentizace
- Vlastní autentizační systém (ne Supabase Auth)
- Bcrypt hashování hesel
- Session management přes localStorage
- Protected routes pomocí `<ProtectedRoute>`

### Row Level Security (RLS)

Všechny tabulky mají RLS politiky:

```sql
-- Příklad: Uživatelé mohou vkládat své aktivity
CREATE POLICY "Uživatelé mohou vkládat své lekce"
    ON piano.piano_lesson_completions FOR INSERT
    TO authenticated, anon
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM piano.piano_users
            WHERE id = user_id
        )
    );

-- Každý může číst data
CREATE POLICY "Každý může číst lekce"
    ON piano.piano_lesson_completions FOR SELECT
    TO anon, authenticated
    USING (true);
```

### Best practices
- ✅ Hesla jsou hashovaná
- ✅ RLS politiky na všech tabulkách
- ✅ Environment variables pro citlivé údaje
- ✅ Input validace na frontendu i backendu
- ✅ Admin routes chráněné role checkem

## Vývoj

### Coding style
- **React Hooks** pro state management
- **Functional komponenty** (ne class)
- **Inline styles** pro specifické komponenty
- **CSS variables** pro konzistentní theming
- **Framer Motion** pro všechny animace

### Konvence pojmenování
- **Komponenty**: PascalCase (`UserDashboard.jsx`)
- **Soubory**: camelCase pro utilities (`audio.js`)
- **Stores**: prefix `use` (`useUserStore.js`)
- **Tabulky**: prefix `piano_` (`piano_users`)

### Přidání nové lekce

```javascript
// V useLessonStore.js
{
  id: 4,
  title: "Nová lekce",
  description: "Popis lekce",
  difficulty: "začátečník",
  duration: "15 min",
  content: {
    notes: ["C", "D", "E", "F"],
    instructions: [
      "Krok 1",
      "Krok 2"
    ]
  }
}
```

### Přidání nové písně

```javascript
// Přes Admin panel nebo přímo v DB
INSERT INTO piano.piano_songs (title, artist, notes, difficulty)
VALUES ('Nová píseň', 'Autor', 'C D E F G', 'začátečník');
```

### Přidání nového achievementu

```javascript
// Přes Admin panel nebo SQL
INSERT INTO piano.piano_achievements
(achievement_id, title, description, icon, requirement_type, requirement_value, xp_reward)
VALUES
('new-achievement', 'Titul', 'Popis', 'Trophy', 'lessons_completed', 10, 100);
```

## Troubleshooting

### Problém: 401 Unauthorized při ukládání dat

**Řešení**: Zkontrolujte RLS politiky v Supabase. Ujistěte se, že:
1. Politiky existují pro INSERT i SELECT
2. Politiky používají správnou logiku (ne JWT claims pokud nepoužíváte Supabase Auth)
3. `user_id` existuje v `piano_users` tabulce

### Problém: Aplikace se nezobrazuje správně

**Řešení**:
```bash
# Vyčistit cache
rm -rf node_modules dist .vite
npm install
npm run dev
```

### Problém: Lekce se neuloží jako dokončené

**Řešení**: Zkontrolujte:
1. Console v DevTools pro error zprávy
2. Network tab pro 400/401 chyby
3. Že `piano_lesson_completions` tabulka existuje
4. Že máte SELECT policy na tabulce

### Problém: Audio nefunguje

**Řešení**:
- Web Audio API vyžaduje user interaction před prvním přehráním
- Zkontrolujte console pro chyby
- Vyzkoušejte jiný prohlížeč

## Licence

Tento projekt je proprietární software vlastněný Lenkou Roubalovou.

## Kontakt

Pro otázky a podporu kontaktujte:
- Email: lenkaroubalova@example.com
- GitHub: [lennayia](https://github.com/lennayia)

---

**Vytvořeno s pomocí Claude Code** 🎹
