# 📚 Dokumentace - PianoPro App

## Obsah
1. [Úvod](#úvod)
2. [Přihlášení a role](#přihlášení-a-role)
3. [Notační systém](#notační-systém)
4. [Správa obsahu (Admin)](#správa-obsahu-admin)
5. [Cvičení akordů](#cvičení-akordů)
6. [Databázová struktura](#databázová-struktura)
7. [UI Komponenty](#ui-komponenty)
8. [Technické informace](#technické-informace)

---

## Úvod

PianoPro App je webová aplikace pro výuku hry na klavír. Umožňuje:
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

## Cvičení akordů

Stránka `/cviceni` nabízí interaktivní procvičování akordů na klaviatuře.

### Funkce

- **Kvíz "Poznáte akord?"** - aplikace zobrazí název akordu a uživatel musí zahrát správné tóny
- **Vizuální zpětná vazba** - zvýrazněné klávesy na klaviatuře
- **Šipky u černých kláves** - vizuální indikátor pod černými klávesami pro snadnější orientaci

### Filtrování obtížnosti

Tlačítka pro výběr akordů:
- **Základní akordy** - akordy bez křížků (C dur, F dur, G dur, D moll, E moll, A moll)
- **Pokročilé akordy** - akordy s křížky (D dur, E dur, A dur, H dur, C moll, F moll, G moll, H moll)
- **Všechny** - kombinace obou kategorií

### Míchání akordů

Tlačítko **"Míchat"** (ikona shuffle) náhodně zamíchá pořadí akordů pro pestřejší procvičování.

### Seznam akordů

**Základní (easy):**
| Akord | Tóny |
|-------|------|
| C dur | C, E, G |
| F dur | F, A, C' |
| G dur | G, H, D' |
| D moll | D, F, A |
| E moll | E, G, H |
| A moll | A, C', E' |

**Pokročilé (medium):**
| Akord | Tóny |
|-------|------|
| D dur | D, F#, A |
| E dur | E, G#, H |
| A dur | A, C#', E' |
| H dur | H, D#', F#' |
| C moll | C, D#, G |
| F moll | F, G#, C' |
| G moll | G, A#, D' |
| H moll | H, D', F#' |

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

#### Tabulka: `piano_quiz_chords`
```sql
id              SERIAL PRIMARY KEY
name            TEXT NOT NULL          -- Název akordu (C dur, D moll, ...)
notes           TEXT[] NOT NULL        -- Pole tónů (ARRAY['C', 'E', 'G'])
difficulty      TEXT DEFAULT 'easy'    -- 'easy' nebo 'medium'
is_active       BOOLEAN DEFAULT TRUE   -- Aktivní pro zobrazení
display_order   INTEGER               -- Pořadí zobrazení
created_at      TIMESTAMP
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
│   │   ├── admin/                # Admin komponenty (ChordManager, ...)
│   │   ├── auth/                 # Přihlášení, registrace
│   │   ├── dashboard/            # Dashboard komponenty
│   │   ├── lessons/              # Lekce, klaviatura (PianoKeyboard)
│   │   ├── resources/            # Písničky, slovníček, šablony
│   │   └── ui/                   # Znovupoužitelné UI komponenty (TabButtons)
│   ├── lib/
│   │   └── supabase.js          # Supabase klient
│   ├── pages/
│   │   ├── Dashboard.jsx        # Hlavní stránka
│   │   ├── Login.jsx            # Přihlášení
│   │   ├── PianoLogin.jsx       # Admin přihlášení
│   │   ├── Registration.jsx     # Registrace
│   │   ├── Admin.jsx            # Admin panel
│   │   └── Cviceni.jsx          # Cvičení akordů
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

## UI Komponenty

### TabButtons

Znovupoužitelná komponenta pro moderní tab navigaci s animacemi.

**Soubor**: `src/components/ui/TabButtons.jsx`

**Použití - výchozí layout:**
```jsx
import TabButtons from '../components/ui/TabButtons';
import { Music, Users } from 'lucide-react';

const tabs = [
  { id: 'songs', label: 'Písně', icon: Music },
  { id: 'users', label: 'Uživatelé', icon: Users }
];

<TabButtons
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  options={{
    size: 'md',           // 'sm' | 'md' | 'lg'
    variant: 'secondary', // 'primary' | 'secondary' (default: 'secondary')
    showShine: true,      // Animovaný shine efekt
    gap: '0.5rem',        // Mezera mezi tlačítky
    style: {}             // Dodatečné CSS styly
  }}
/>
```

**Použití - pill layout (pro druhou úroveň navigace):**
```jsx
const categories = [
  { id: 'lidovky', label: 'Lidovky', icon: Music },
  { id: 'detske', label: 'Dětské', icon: Music }
];

<TabButtons
  tabs={categories}
  activeTab={activeCategory}
  onTabChange={setActiveCategory}
  options={{ layout: 'pill' }}
/>
```

**Vlastnosti:**
- Framer Motion animace (hover, tap, vstup)
- Shine efekt na aktivním tabu
- Podpora ikon (Lucide React)
- Dvě barevné varianty (primary/secondary)
- Tři velikostní varianty (sm/md/lg)
- Responzivní design s flex-wrap
- **Pill layout** - kompaktní horizontální lišta pro sub-navigaci
  - Menší tlačítka s kulatými rohy
  - Poloprůhledné pozadí s blur efektem
  - Vhodné pro kategorie a filtry

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

## 📝 Historie změn - 22. 11. 2025

### Vylepšení písniček a notace

#### 1. Oprava podpory křížků a béček v notaci
- **Problém**: Noty s křížky (is) a béčky (es) jako `Ais`, `Des`, `Fis` byly filtrovány jako text
- **Řešení**: Aktualizace regex patternu na `/^[a-h]+(is|es)?\.?'?$/` pro rozpoznání těchto not
- **Dopad**: Všechny písně s modifikovanými tóny (A#, Db, F#, atd.) se nyní přehrávají správně

#### 2. Optimalizace vizuálního zvýraznění
- **Změna**: Při přehrávání písně se zvýrazňuje pouze aktuálně hraná nota
- **Před**: Zvýrazňovala se aktuální nota + následující nota (matoucí)
- **Nyní**: Pouze aktuální nota v textu i na klaviatuře
- **Benefit**: Čistější vizuální feedback, méně rozptylování

#### 3. Dva režimy hraní písní

##### 🎯 Režim "Procvičovat" (S nápovědou)
- Zobrazené noty písně
- Zvýraznění aktuální klávesy na klaviatuře
- Ideální pro učení nových písní
- **Bez ukládání do databáze a odměn**
- Fialový border s ikonou Target

##### 🏆 Režim "Výzva" (Bez nápovědy)
- Skryté noty písně
- Žádné zvýraznění kláves
- Hraní pouze podle paměti
- **S ukládáním do databáze a odměnami** (XP, statistiky)
- Zlatý border s ikonou Trophy

**Motivace**: Odměny se nyní získávají pouze za skutečné zvládnutí písně bez pomoci, ne za procvičování s nápovědou.

#### 4. UI vylepšení
- Přidáno tlačítko "Výzva" vedle "Procvičovat"
- Barevné rozlišení režimů (fialová vs zlatá)
- Jasné informační zprávy o tom, ve kterém režimu uživatel hraje
- Upravený text po dokončení: v režimu procvičování nabídka zkusit výzvu

### Technické detaily

**Soubory změněny**:
- `src/components/resources/SongLibrary.jsx`
  - Přidán state `challengeMode` vedle `practicingMode`
  - Funkce `startChallenge()` pro zahájení výzvy
  - Aktualizace `checkSongCompletion()` - ukládání pouze při challenge mode
  - Úprava zvýraznění not na klaviatuře podle režimu
  - Fix regex patternu pro rozpoznání is/es suffixů

**Databáze**: Beze změn, využívá existující `piano_song_completions` tabulku

---

*Poslední aktualizace: 22. 11. 2025*
*Verze: 1.3.0*
