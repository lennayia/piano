# 📚 Dokumentace - Piano Learning App

## Obsah
1. [Úvod](#úvod)
2. [Přihlášení a role](#přihlášení-a-role)
3. [Notační systém](#notační-systém)
4. [Správa obsahu (Admin)](#správa-obsahu-admin)
5. [Databázová struktura](#databázová-struktura)
6. [Technické informace](#technické-informace)

---

## Úvod

Piano Learning App je webová aplikace pro výuku hry na klavír. Umožňuje:
- Učit se základy hry na klavír
- Procvičovat lidové písně
- Studovat hudební teorii
- Sledovat vlastní pokrok

---

## Přihlášení a role

### Běžný uživatel
- Registrace přes formulář na stránce `/register`
- Přístup k lekcím, písničkám, slovníčku a harmonizačním šablonám
- Sledování vlastního pokroku

### Administrátor
- Speciální přihlášení na `/piano-login`
- Email: `lenkaroubalka@seznam.cz`
- Heslo: `Lenna69++`
- Možnost upravovat veškerý obsah aplikace
- Přesouvání materiálů pomocí drag and drop (určování pořadí náročnosti)

---

## Notační systém

Aplikace používá vlastní textový notační systém pro snadné zadávání melodií.

### Základní notace

#### Délky not
- `dd` = šestnáctinová nota
- `d` = osminová nota
- `D` = čtvrťová nota
- `Dd` = čtvrťová nota s tečkou
- `DD` = půlová nota
- `DDD` = půlová nota s tečkou
- `DDDD` = celá nota

**Příklady:**
- `D` - čtvrťová nota C
- `DD` - půlová nota C
- `d` - osminová nota C
- `Dd` - čtvrťová nota s tečkou C

#### Tóny
Používáme standardní notaci: `C, D, E, F, G, A, H`

#### Oktávy
- `C.` = basová/nižší oktáva (C3)
- `C` = střední oktáva (C4)
- `C'` = vyšší oktáva (C5) - apostrof

**Příklady:**
- `D.` - nota D v basové oktávě
- `D` - nota D ve střední oktávě
- `D'` - nota D ve vyšší oktávě

#### Křížky a béčka
Přidávají se jako suffix:
- **Křížky**: `is` (např. `Cis`, `DDis`, `ddis`)
- **Béčka**: `es` (např. `Des`, `DDes`, `ddes`)

**Příklady:**
- `Dis` - čtvrťová nota D# (D křížek)
- `DDes` - půlová nota Db (D béčko)
- `ddis` - šestnáctinová nota D#

#### Kombinace
Pořadí: **[délka] + [tón] + [is/es] + [oktáva]**

**Příklady:**
- `DDis'` - půlová nota D# ve vyšší oktávě
- `ddes.` - osminová nota Db v basové oktávě
- `Ddis` - čtvrťová nota s tečkou D#

### Oddělovače a formátování

#### Oddělovač not
- `_` (podtržítko) = odděluje jednotlivé noty

**Příklad:**
```
D_D_E_F_G
```

#### Nové řádky
- **Enter** (nový řádek v textarea) = začátek nového řádku/verše
- `|` (roura, AltGr+W) = alternativní oddělovač řádků

**Příklad s Enter:**
```
D_D_E_F
G_A_H_C'
```

**Příklad s rourou:**
```
D_D_E_F | G_A_H_C'
```

#### Pauzy
- `-` = krátká pauza (200ms)
- `--` = střední pauza (400ms)
- `---` = dlouhá pauza (800ms)
- `----` = extra dlouhá pauza (1200ms)

**Příklad:**
```
D_D_-_E_E_--_F
```
(Hraje: D, D, krátká pauza, E, E, střední pauza, F)

#### Text mezi notami
Můžete přidat text/slova, která se při přehrávání přeskočí:

**Příklad:**
```
D_D_(refrén)_E_E_text_F_F
```

Text se automaticky rozpozná (slova s 3+ písmeny) a při přehrávání se ignoruje.

### Kompletní příklady

#### Jednoduchá melodie
```
D_D_E_-_F_F_G
```

#### Melodie s různými délkami
```
DD_DD_d_d_Dd_-_DDDD
```

#### S křížky a oktávami
```
D._D_DDis_--_E'_Fis'_---_DDDD.
```

#### Víceřádková melodie
```
D_D_E_F_G_A_H
C'_H_A_G_F_E_D
D._D_DD_---_DDDD
```

---

## Správa obsahu (Admin)

### Přístup k administraci
1. Přihlaste se na `/piano-login`
2. V navigaci se objeví tlačítko **"Admin"**
3. Můžete upravovat veškerý obsah

### Přidávání a úprava písní

#### Formulářová pole

**Název písně**
- Povinné pole
- Název, který uvidí uživatelé

**Noty a text (oddělené podtržítky _)**
- Textarea s 4 řádky
- Použijte notační systém popsaný výše
- Každý řádek = nový řádek melodie
- Příklad: `D_D_E_-_F | G_text_A_H`

**Text písničky (lyrics)**
- Textarea s 6 řádky
- Zde napište text/slova písničky
- Každý verš na nový řádek
- Zobrazí se uživatelům pod notami
- **Není povinné** (můžete nechat prázdné)

**Příklad textu:**
```
Holka modrooká
nesedávej u potoka
voda z něho vyschne
a ty na mě zaschneš
```

**Obtížnost**
- Začátečník
- Mírně pokročilý
- Pokročilý

**Tempo**
- Např: Allegro, Moderato, Andante, Adagio

**Tónina**
- Např: C dur, G dur, D moll, A moll

**Tip pro harmonizaci**
- Textarea pro tipy a rady
- Zobrazí se uživatelům během přehrávání
- Příklad: "Doprovod: C dur - F dur - G dur - C dur"

### Drag and Drop (Změna pořadí)

Jako admin vidíte u každé položky **ikonu se třemi vodorovnými čárami** (⋮⋮⋮).

**Jak změnit pořadí:**
1. Najeďte myší na ikonu (zprůhlední se)
2. Klikněte a držte levé tlačítko myši
3. Přetáhněte položku na nové místo
4. Pusťte tlačítko myši
5. Pořadí se automaticky uloží

**Kde funguje drag and drop:**
- ✅ Playlist lidových písní
- ✅ Dostupné lekce
- ⏳ Slovníček pojmů (připraveno)
- ⏳ Harmonizační šablony (připraveno)

**Důležité:**
- Pořadí určuje náročnost pro uživatele
- Uživatelé uvidí materiály v pořadí, které jste nastavili
- Změny jsou okamžitě viditelné pro všechny uživatele

### Editace existujícího obsahu

1. Klikněte na tlačítko **"Upravit"** (ikona tužky)
2. Otevře se formulář s předvyplněnými daty
3. Proveďte změny
4. Klikněte **"Uložit změny"**

### Mazání obsahu

1. Klikněte na tlačítko **"Smazat"** (ikona koše)
2. Potvrďte smazání v dialogu
3. Obsah se trvale smaže

---

## Databázová struktura

### Schéma: `piano`

#### Tabulka: `piano_songs`
```sql
id              SERIAL PRIMARY KEY
title           TEXT NOT NULL
notes           TEXT NOT NULL          -- Noty (string formát)
lyrics          TEXT                   -- Text písničky (nové!)
difficulty      TEXT
tempo           TEXT
key             TEXT                   -- Tónina
tips            TEXT                   -- Tipy pro harmonizaci
order_index     INTEGER               -- Pořadí (drag and drop)
created_at      TIMESTAMP
```

#### Tabulka: `piano_lessons`
```sql
id              SERIAL PRIMARY KEY
title           TEXT NOT NULL
description     TEXT
difficulty      TEXT
duration        TEXT
content         JSONB                 -- Obsahuje notes a instructions
order_index     INTEGER               -- Pořadí (drag and drop)
created_at      TIMESTAMP
```

#### Tabulka: `piano_glossary`
```sql
id              SERIAL PRIMARY KEY
term            TEXT NOT NULL
definition      TEXT
category        TEXT
order_index     INTEGER               -- Pořadí (drag and drop)
created_at      TIMESTAMP
```

#### Tabulka: `piano_harmonization_templates`
```sql
id              SERIAL PRIMARY KEY
name            TEXT NOT NULL
description     TEXT
pattern         TEXT
example         TEXT
order_index     INTEGER               -- Pořadí (drag and drop)
created_at      TIMESTAMP
```

#### Tabulka: `piano_users`
```sql
id              UUID PRIMARY KEY      -- Z auth.users
email           TEXT UNIQUE
first_name      TEXT
last_name       TEXT
is_admin        BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP
```

#### Tabulka: `piano_user_progress`
```sql
id              SERIAL PRIMARY KEY
user_id         UUID REFERENCES piano_users(id)
lesson_id       INTEGER REFERENCES piano_lessons(id)
completed       BOOLEAN
completed_at    TIMESTAMP
score           INTEGER
notes           TEXT
```

#### Tabulka: `piano_user_stats`
```sql
id                      SERIAL PRIMARY KEY
user_id                 UUID UNIQUE
total_lessons_completed INTEGER DEFAULT 0
total_practice_time     INTEGER DEFAULT 0
current_streak          INTEGER DEFAULT 0
last_practice_date      DATE
```

### SQL Migrace

Soubor pro přidání `lyrics` a `order_index`:
```bash
/Users/lenkaroubalova/Documents/Projekty/piano/add_order_index.sql
```

**Spuštění:**
1. Otevřete Supabase Dashboard
2. SQL Editor
3. Zkopírujte a vložte obsah souboru
4. Klikněte "Run"

---

## Technické informace

### Technologie
- **Frontend**: React 18 + Vite
- **Styling**: CSS (vlastní, bez frameworku)
- **State Management**: Zustand (s persistence)
- **Databáze**: Supabase (PostgreSQL)
- **Autentizace**: Supabase Auth
- **Animace**: Framer Motion
- **Audio**: Web Audio API
- **Drag and Drop**: @dnd-kit

### Struktura projektu

```
piano/
├── public/
│   └── audio/                    # Audio soubory (vltava.mp3)
├── src/
│   ├── components/
│   │   ├── auth/                 # Přihlášení, registrace
│   │   ├── dashboard/            # Dashboard komponenty
│   │   ├── lessons/              # Lekce, klaviatura
│   │   └── resources/            # Písničky, slovníček, šablony
│   ├── lib/
│   │   └── supabase.js          # Supabase klient
│   ├── pages/
│   │   ├── Dashboard.jsx        # Hlavní stránka
│   │   ├── Login.jsx            # Přihlášení
│   │   ├── PianoLogin.jsx       # Admin přihlášení
│   │   ├── Registration.jsx     # Registrace
│   │   └── Admin.jsx            # Admin panel
│   ├── store/
│   │   ├── useLessonStore.js    # State pro lekce
│   │   ├── useSongStore.js      # State pro písničky
│   │   ├── useGlossaryStore.js  # State pro slovníček
│   │   └── useUserStore.js      # State pro uživatele
│   ├── utils/
│   │   └── audio.js             # Audio engine (Web Audio API)
│   ├── App.jsx                  # Hlavní komponenta
│   ├── main.jsx                 # Entry point
│   └── index.css                # Globální styly
├── add_order_index.sql          # SQL migrace
└── package.json
```

### Spuštění projektu

**Development:**
```bash
npm install
npm run dev
```

**Production build:**
```bash
npm run build
npm run preview
```

### Audio Engine

**Funkce:**
- `playNote(note, duration)` - přehraje notu
- `playClick()` - zvuk pro kliknutí
- `playSuccess()` - zvuk pro úspěch
- `playError()` - zvuk pro chybu
- `playApplause()` - potlesk
- `playFanfare()` - fanfára
- `playVltava()` - melodie Vltavy
- `startVltavaLoop()` - smyčka Vltavy
- `stopVltavaLoop()` - zastavení smyčky
- `fadeOut(duration)` - fade out
- `setVolume(volume)` - nastavení hlasitosti (0-1)

**Frekvenční tabulka:**
- Basová oktáva (C3): `C.`, `D.`, `E.`, atd.
- Střední oktáva (C4): `C`, `D`, `E`, atd.
- Vyšší oktáva (C5): `C'`, `D'`, `E'`, atd.

### Zustand Stores

#### useSongStore
```javascript
songs                    // Pole písní
loading                  // Boolean
error                    // String | null
fetchSongs()            // Načíst z databáze
updateSong(id, data)    // Aktualizovat
addSong(data)           // Přidat novou
deleteSong(id)          // Smazat
reorderSongs(newOrder)  // Změnit pořadí (drag and drop)
resetSongs()            // Reset na výchozí
```

#### useLessonStore
```javascript
lessons                    // Pole lekcí
currentLesson             // Aktuální lekce
setCurrentLesson(id)      // Nastavit aktuální
getLessonById(id)         // Získat podle ID
addLesson(data)           // Přidat novou
updateLesson(id, data)    // Aktualizovat
deleteLesson(id)          // Smazat
reorderLessons(newOrder)  // Změnit pořadí
resetLessons()            // Reset
```

#### useUserStore
```javascript
currentUser               // Aktuální uživatel
loading                   // Boolean
login(credentials)        // Přihlášení
adminLogin(credentials)   // Admin přihlášení
register(userData)        // Registrace
logout()                  // Odhlášení
updateProfile(data)       // Aktualizovat profil
checkAuth()              // Kontrola autentizace
```

### Supabase konfigurace

**Soubor**: `src/lib/supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Environment variables (.env):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Row Level Security (RLS)

**Pravidla pro piano_songs:**
```sql
-- SELECT: Všichni vidí
CREATE POLICY "Anyone can read songs"
ON piano.piano_songs FOR SELECT
USING (true);

-- INSERT/UPDATE/DELETE: Pouze admini
CREATE POLICY "Only admins can modify songs"
ON piano.piano_songs FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM piano.piano_users
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

Podobná pravidla platí pro všechny ostatní tabulky.

---

## FAQ

### Jak přidat administrátora?
```sql
-- V Supabase SQL Editor
UPDATE piano.piano_users
SET is_admin = true
WHERE email = 'email@example.com';
```

### Jak resetovat pořadí materiálů?
```sql
-- Seřadit podle ID
UPDATE piano.piano_songs
SET order_index = id;
```

### Jak změnit heslo admina?
Přes Supabase Dashboard:
1. Authentication → Users
2. Najděte uživatele
3. Send password reset email

### Jak zálohovat data?
```bash
# Supabase CLI
supabase db dump -f backup.sql
```

---

## Kontakt a podpora

**Admin email**: lenkaroubalka@seznam.cz

**Technická podpora**: Pro technické dotazy kontaktujte vývojáře.

---

*Poslední aktualizace: 19. 11. 2025*
*Verze: 1.0.0*
