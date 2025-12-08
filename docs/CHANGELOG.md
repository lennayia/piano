# 📝 Changelog - Piano Learning App

Všechny významné změny v projektu budou dokumentovány v tomto souboru.

---

## [Unreleased]

### Pending
- Správa gamifikace v admin panelu
- Front-end komponenta pro teoretický kvíz
- Oprava duplikace lekcí (duration column)
- RLS policy pro piano_song_completions INSERT

---

## [2025-11-22] - Univerzální kvízová struktura

### ✨ Přidáno
- **Univerzální správa kvízů** - rozšíření na 6 typů kvízů
  - `supabase_migration_universal_quiz.sql` - databázová migrace
  - Typy kvízů: chord, theory, rhythm, interval, scale, mixed
  - Sloupec `quiz_type` v tabulce `piano_quiz_chords`
  - Sloupec `category` pro kategorizaci otázek
  - VIEW pohledy pro každý typ kvízu

- **ChordManager - rozšíření na univerzální správu**
  - Záložky TabButtons s 6 typy kvízů
  - Filtrování podle `activeQuizType`
  - Dynamický formulář:
    - Input pro akordové kvízy
    - Textarea pro teoretické otázky
  - Pole kategorie pro ne-akordové kvízy
  - Ikony pro každý typ kvízu (Music, BookOpen)

- **Testovací data**
  - 5 ukázkových teoretických otázek
  - Kategorie: Notová soustava, Akordy, Hudební terminologie, Stupnice, Intervaly

### 🔧 Změněno
- `piano_quiz_chords.notes` - nyní volitelné (NULL pro ne-akordové kvízy)
- Validace ve formuláři podle typu kvízu
- Dynamické texty ("Přidat akord" vs "Přidat otázku")

### 📁 Soubory
- `supabase_migration_universal_quiz.sql`
- `src/components/admin/ChordManager.jsx`

---

## [2025-11-21] - Oprava pořadí not a vizualizace

### ✨ Přidáno
- **Funkce sortNotesByKeyboard** - řazení not podle klaviatury
  - `src/utils/noteUtils.js` - nová utility funkce
  - KEYBOARD_ORDER pole s notami od A. (malá oktáva) po E'' (oktáva 2)
  - Seřazení podle pozice na klaviatuře zleva doprava

- **Vizuální indikátor pro černé klávesy**
  - Svislá čára od kolečka dolů mezi bílé klávesy
  - Responsivní výška (34/56/78px podle šířky klávesy)
  - Animace s delay 0.15s (scaleY od 0 do 1)
  - Barva #2d5b78 (stejná jako kolečko)

### 🔧 Změněno
- **ChordQuiz.jsx** - přehrávání akordů v pořadí podle klaviatury
  - Import `sortNotesByKeyboard`
  - Seřazení not před přehráním v `playChord()`

- **Cviceni.jsx** - odstranění špatné transformace
  - Použití not přímo z databáze
  - Odebrání `getChordNotesWithOctaves()` transformace

- **ChordManager.jsx** - seřazení při zobrazení a ukládání
  - Zobrazení not v seznamu akordů
  - Zobrazení vybraných not ve formuláři
  - Inline editace
  - Načtení akordu do formuláře
  - UPDATE a INSERT do databáze

- **PianoKeyboard.jsx** - přidání vizuální čáry
  - Motion.div s absolutním pozicováním
  - Responsivní top a height hodnoty
  - transformOrigin: 'top' pro správnou animaci

### 🐛 Opraveno
- Pořadí not v akordu - nyní vždy podle klaviatury (ne podle zadání)
- Vizuální orientace na klaviatuře pro černé klávesy

### 📁 Soubory
- `src/utils/noteUtils.js` (nový)
- `src/components/games/ChordQuiz.jsx`
- `src/pages/Cviceni.jsx`
- `src/components/admin/ChordManager.jsx`
- `src/components/lessons/PianoKeyboard.jsx`

---

## [2025-11-20] - User ID migrace a RLS opravy

### 🔧 Změněno
- **User ID synchronizace** mezi Supabase Auth a piano_users
  - Změna User ID z `52916d44-3941-4895-a7dd-0560225e3a8e` na `ec3f50f3-693a-4fb6-ab0e-83cbc28f060b`
  - Kaskádové přepsání všech foreign keys
  - Zachování všech dat (stats, progress, achievements)

### 🐛 Opraveno
- **RLS policies** - nyní fungují správně s autentizovaným uživatelem
- **Chord editing** - admini mohou upravovat akordy
- **Session problém** - uživatel nyní správně autentizován v Supabase Auth

### 📁 Soubory
- SQL migrace v Supabase (manuální spuštění)
- `src/components/admin/ChordManager.jsx` - přidáno session logování

---

## [2025-11-19] - Session context a dokumentace

### ✨ Přidáno
- **SESSION_CONTEXT.md** - kompletní kontext pro novou session
  - Přehled projektu
  - Klíčové komponenty
  - Databázová struktura
  - Aktuální problémy

- **DOKUMENTACE.md** - kompletní dokumentace projektu
  - Architektura aplikace
  - Struktura souborů
  - Technologie a knihovny
  - Datové modely

### 🔧 Změněno
- Změna textu kvízu z "Poznáš akord?" na "Poznáte akord?"
  - `src/components/games/ChordQuiz.jsx`
  - `src/pages/Cviceni.jsx`

### 📁 Soubory
- `SESSION_CONTEXT.md` (nový)
- `DOKUMENTACE.md` (nový)
- `src/components/games/ChordQuiz.jsx`
- `src/pages/Cviceni.jsx`

---

## [2025-11-18] - Historie aktivit a song practice

### ✨ Přidáno
- **Historie aktivit** - zobrazení posledních aktivit uživatele
  - `src/components/dashboard/ActivityHistory.jsx`
  - Zobrazení dokončených lekcí a písní
  - Formátování času (před X minutami/hodinami/dny)

- **Song Practice Mode** - vylepšení režimu cvičení písní
  - Zobrazení not písně
  - Přehrávání melodie
  - Tracking dokončení

### 🐛 Opraveno
- Načítání stavu dokončených lekcí z databáze
  - `src/store/useUserStore.js`
  - Správné mapování lesson_id

### 📁 Soubory
- `src/components/dashboard/ActivityHistory.jsx` (nový)
- `src/store/useUserStore.js`
- `src/components/resources/SongLibrary.jsx`

---

## Legenda

- ✨ **Přidáno** - nové funkce
- 🔧 **Změněno** - změny stávající funkcionality
- 🐛 **Opraveno** - opravy chyb
- 🗑️ **Odstraněno** - odstraněné funkce
- 🔒 **Bezpečnost** - bezpečnostní opravy
- 📁 **Soubory** - seznam změněných souborů
