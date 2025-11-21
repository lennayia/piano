# 🏗️ Systémová architektura - Piano Learning App

## Přehled

Piano Learning App je moderní webová aplikace pro výuku hraní na piano, postavená na React frameworku s Supabase backendem.

---

## 🎯 Technologický stack

### Frontend
- **React 18** - UI framework
- **Vite** - build tool & dev server
- **Framer Motion** - animace
- **Zustand** - state management
- **Lucide React** - ikony

### Backend
- **Supabase** - BaaS (Backend as a Service)
  - PostgreSQL databáze
  - Authentication
  - Row Level Security (RLS)
  - Real-time subscriptions

### Audio
- **Tone.js** - audio syntéza a přehrávání

---

## 📐 Architektura aplikace

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  ┌──────────┬──────────┬──────────┬─────────────────┐  │
│  │  Pages   │Components│  Games   │     Utils       │  │
│  │          │          │          │                 │  │
│  │ Home     │ Piano    │ Chord    │ Audio Engine    │  │
│  │ Lessons  │ Keyboard │ Quiz     │ Note Utils      │  │
│  │ Cviceni  │ Lesson   │ Practice │                 │  │
│  │ Resources│ Modal    │          │                 │  │
│  │ Admin    │ Cards    │          │                 │  │
│  └──────────┴──────────┴──────────┴─────────────────┘  │
│                        ▲                                 │
│                        │                                 │
│                 Zustand Store                            │
│          (Global State Management)                       │
│                        │                                 │
└────────────────────────┼─────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase Backend                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │            PostgreSQL Database                    │  │
│  │                                                    │  │
│  │  • piano_users          • piano_lessons          │  │
│  │  • piano_user_stats     • piano_quiz_chords      │  │
│  │  • piano_achievements   • piano_songs            │  │
│  │  • piano_completions    • piano_progress         │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Authentication & RLS                    │  │
│  │  • User authentication                            │  │
│  │  • Row Level Security policies                    │  │
│  │  • Admin permissions                              │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 📂 Struktura projektu

```
piano/
├── src/
│   ├── components/          # React komponenty
│   │   ├── admin/          # Admin panel komponenty
│   │   │   ├── ChordManager.jsx      # Správa kvízů (univerzální)
│   │   │   ├── UserList.jsx          # Seznam uživatelů
│   │   │   ├── AchievementManager.jsx # Správa achievementů
│   │   │   └── Dashboard.jsx         # Admin dashboard
│   │   │
│   │   ├── auth/           # Autentizace
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   │
│   │   ├── dashboard/      # Dashboard komponenty
│   │   │   ├── Stats.jsx
│   │   │   ├── Progress.jsx
│   │   │   └── ActivityHistory.jsx
│   │   │
│   │   ├── games/          # Herní komponenty
│   │   │   ├── ChordQuiz.jsx         # Kvíz "Poznáte akord?"
│   │   │   └── (TheoryQuiz.jsx)      # TODO: Teoretický kvíz
│   │   │
│   │   ├── layout/         # Layout komponenty
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Sidebar.jsx
│   │   │
│   │   ├── lessons/        # Lekce komponenty
│   │   │   ├── PianoKeyboard.jsx     # Klaviatura s notami
│   │   │   ├── LessonCard.jsx        # Karta lekce
│   │   │   └── LessonModal.jsx       # Detail lekce
│   │   │
│   │   ├── resources/      # Zdroje a materiály
│   │   │   ├── SongLibrary.jsx       # Knihovna písní
│   │   │   ├── Glossary.jsx          # Slovník pojmů
│   │   │   └── HarmonizationTemplates.jsx
│   │   │
│   │   └── ui/             # UI komponenty
│   │       ├── TabButtons.jsx
│   │       ├── Modal.jsx
│   │       └── FloatingHelp.jsx
│   │
│   ├── pages/              # Stránky aplikace
│   │   ├── Home.jsx        # Domovská stránka
│   │   ├── Lesson.jsx      # Stránka lekcí
│   │   ├── Cviceni.jsx     # Stránka cvičení
│   │   ├── Resources.jsx   # Stránka zdrojů
│   │   ├── Admin.jsx       # Admin panel
│   │   └── Profile.jsx     # Profil uživatele
│   │
│   ├── store/              # Zustand state management
│   │   └── useUserStore.js # User state (auth, progress, stats)
│   │
│   ├── utils/              # Utility funkce
│   │   ├── audio.js        # Audio engine (Tone.js)
│   │   └── noteUtils.js    # Práce s notami
│   │
│   ├── lib/                # Knihovny a konfigurace
│   │   └── supabase.js     # Supabase client
│   │
│   ├── styles/             # CSS styly
│   │   └── index.css       # Globální styly
│   │
│   ├── App.jsx             # Hlavní App komponenta
│   └── main.jsx            # Entry point
│
├── public/                 # Statické soubory
│   └── sounds/            # Audio soubory (piano tóny)
│
├── docs/                  # Dokumentace
│   ├── SYSTEM_ARCHITECTURE.md  (tento soubor)
│   ├── DATABASE_SCHEMA.md
│   └── DEVELOPMENT_GUIDE.md
│
├── supabase/              # Supabase migrace
│   └── migrations/        # SQL migrace
│
├── MASTER_TODO.md         # Master TODO seznam
├── CHANGELOG.md           # Změny v projektu
└── package.json           # NPM dependencies
```

---

## 🔄 Data Flow

### 1. User Authentication Flow

```
User Login
    ↓
LoginForm.jsx
    ↓
Supabase Auth
    ↓
useUserStore.loginUser()
    ↓
Fetch user data from piano_users
    ↓
Update Zustand store
    ↓
Redirect to Dashboard
```

### 2. Lesson Completion Flow

```
User completes lesson
    ↓
LessonModal.jsx - handleComplete()
    ↓
Supabase INSERT into piano_lesson_completions
    ↓
Supabase TRIGGER updates piano_user_stats (XP +10)
    ↓
useUserStore.refreshStats()
    ↓
UI updates (XP bar, level)
```

### 3. Quiz Flow

```
User starts quiz
    ↓
ChordQuiz.jsx - fetchChords()
    ↓
Supabase SELECT from piano_quiz_chords
    ↓
Display random chord
    ↓
User selects answer
    ↓
Check if correct
    ↓
Show result + play sound
    ↓
Save to piano_quiz_completions
    ↓
Update stats
```

---

## 🔐 Bezpečnost

### Row Level Security (RLS) Policies

**Princip:** Každý uživatel vidí pouze svá data, admini vidí vše.

#### piano_users
```sql
-- SELECT: Uživatel vidí pouze sebe, admin vidí všechny
SELECT: auth.uid() = id OR is_admin = true

-- UPDATE: Uživatel může upravit pouze sebe
UPDATE: auth.uid() = id

-- INSERT: Pouze při registraci
INSERT: true
```

#### piano_lesson_completions
```sql
-- SELECT: Uživatel vidí pouze své completions
SELECT: auth.uid() = user_id OR
        auth.uid() IN (SELECT id FROM piano_users WHERE is_admin = true)

-- INSERT: Uživatel může přidat pouze své completions
INSERT: auth.uid() = user_id
```

#### piano_quiz_chords
```sql
-- SELECT: Všichni mohou číst aktivní kvízy
SELECT: is_active = true OR
        auth.uid() IN (SELECT id FROM piano_users WHERE is_admin = true)

-- INSERT/UPDATE/DELETE: Pouze admini
INSERT/UPDATE/DELETE: auth.uid() IN (
  SELECT id FROM piano_users WHERE is_admin = true
)
```

---

## 🎮 Gamifikace systém

### XP (Experience Points)
- **Dokončení lekce:** +10 XP
- **Správná odpověď v kvízu:** +5 XP
- **Dokončení písně:** +15 XP
- **Denní login:** +2 XP

### Levely
```javascript
Level 1: 0-99 XP
Level 2: 100-249 XP
Level 3: 250-499 XP
Level 4: 500-999 XP
Level 5: 1000+ XP
```

### Achievementy
- **První kroky:** Dokonči první lekci
- **Akordový mistr:** Dokonči 10 akordů
- **Písnička:** Dokonči první píseň
- **Týdenní bojovník:** 7 dní v řadě login

---

## 🎹 Audio Engine

### Tone.js Implementace

```javascript
// src/utils/audio.js

class AudioEngine {
  constructor() {
    this.sampler = new Tone.Sampler({
      urls: {
        "C4": "c1.mp3",
        "D4": "d1.mp3",
        "E4": "e1.mp3",
        // ... další noty
      },
      baseUrl: "/sounds/",
    }).toDestination();
  }

  playNote(note, duration = 1.0) {
    this.sampler.triggerAttackRelease(note, duration);
  }
}
```

### Mapování not

```javascript
// Notace aplikace → Tone.js
"C"   → "C4"
"C#"  → "C#4"
"D"   → "D4"
"C''" → "C5"
"A."  → "A3"
```

---

## 🔌 Supabase Integrace

### Client Setup

```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### Typické použití

```javascript
// SELECT
const { data, error } = await supabase
  .from('piano_lessons')
  .select('*')
  .eq('is_active', true)
  .order('display_order')

// INSERT
const { data, error } = await supabase
  .from('piano_lesson_completions')
  .insert([{ user_id, lesson_id }])

// UPDATE
const { data, error } = await supabase
  .from('piano_users')
  .update({ xp: newXP })
  .eq('id', userId)
```

---

## 📱 Responsivní design

### Breakpointy

```css
/* Mobile first approach */
< 360px   - velmi malé mobily
360-480px - malé mobily
480-768px - velké mobily
768-1024px - tablety
> 1024px  - desktopy
```

### PianoKeyboard responsivita

```javascript
// Šířka klávesy se počítá dynamicky
const getKeyWidth = () => {
  const availableWidth = windowWidth - padding;
  const maxKeyWidth = availableWidth / whiteKeyCount;

  if (windowWidth >= 1024) return Math.min(60, maxKeyWidth);
  if (windowWidth >= 768) return Math.min(50, maxKeyWidth);
  return Math.max(20, Math.min(45, maxKeyWidth));
}
```

---

## 🚀 Performance optimalizace

### 1. Lazy Loading
```javascript
const Admin = lazy(() => import('./pages/Admin'))
```

### 2. Memoizace
```javascript
const sortedNotes = useMemo(
  () => sortNotesByKeyboard(notes),
  [notes]
)
```

### 3. Virtual Scrolling
- Pro dlouhé seznamy písní a lekcí

### 4. Debouncing
- Pro vyhledávání v admin panelu

---

## 🧪 Testing strategie

### Unit testy
- Utility funkce (noteUtils.js)
- Audio engine

### Integration testy
- Komponenty s Supabase
- User flow (login, lesson completion)

### E2E testy
- Kritické user flows
- Admin operace

---

## 📊 Monitoring & Analytics

### Metriky k sledování
- Počet aktivních uživatelů
- Dokončené lekce (completion rate)
- Úspěšnost v kvízech
- Průměrný čas na lekci
- Denní/týdenní retence

---

## 🔄 Deployment

### Build proces
```bash
npm run build  # Vite build
# Output: dist/ folder
```

### Hosting
- **Frontend:** Vercel / Netlify
- **Backend:** Supabase (hosted)
- **Assets:** CDN pro audio soubory

---

## 🔮 Budoucí vylepšení

1. **MIDI Integration** - podpora MIDI klaviatur
2. **PWA** - offline funkcionalita
3. **WebSocket** - real-time multiplayer
4. **AI Assistant** - personalizované doporučení lekcí
5. **Video tutoriály** - integrace video výuky

---

**Datum vytvoření:** 22. listopadu 2025
**Verze dokumentu:** 1.0
**Autor:** Claude + Lenka Roubalová
