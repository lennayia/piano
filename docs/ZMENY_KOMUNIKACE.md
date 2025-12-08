# Přehled změn komunikace v aplikaci

**Datum:** 20. listopadu 2025
**Účel:** Kompletní přehled všech změn komunikačního stylu aplikace

## 📋 Obsah změn

1. [Změna z tykání na vykání](#1-změna-z-tykání-na-vykání)
2. [Hovorové výrazy](#2-hovorové-výrazy)
3. [Validační zprávy](#3-validační-zprávy)
4. [Chybové hlášky](#4-chybové-hlášky)
5. [Prázdné stavy](#5-prázdné-stavy)
6. [Button texty](#6-button-texty)
7. [Potvrzovací dialogy](#7-potvrzovací-dialogy)
8. [Alert zprávy](#8-alert-zprávy)

---

## 1. Změna z tykání na vykání

### ChordQuiz.jsx
| Původní | Nový |
|---------|------|
| Zkus to znovu | Zkuste to znovu |
| Zkus to ještě jednou | Zkuste to ještě jednou |

### AchievementManager.jsx
| Původní | Nový |
|---------|------|
| Dokončil jsi svou první lekci! | Dokončili jste svoji první lekci! |

### NoteComposer.jsx
| Původní | Nový |
|---------|------|
| Klikni na klávesu | Klikněte na klávesu |
| Vyber délku noty | Vyberte délku noty |

### SongLibrary.jsx
| Původní | Nový |
|---------|------|
| Zkus to znovu | Zkuste to znovu |
| klikni na klavír nebo zadej ručně | klikněte na klavír nebo zadejte ručně |

### Databáze - SQL soubory
**Soubory:** `supabase_migration.sql`, `supabase_migration_clean.sql`, `supabase_migration_public.sql`

| Původní | Nový |
|---------|------|
| Dokončil jsi svou první lekci! | Dokončili jste svoji první lekci! |
| Dokončil jsi 5 lekcí | Dokončili jste 5 lekcí! |
| Dokončil jsi 10 lekcí | Dokončili jste 10 lekcí! |
| Udržel jsi 7denní sérii | Udrželi jste 7denní sérii! |
| Udržel jsi 30denní sérii | Udrželi jste 30denní sérii! |
| Získal jsi 100 XP | Získali jste 100 XP! |
| Získal jsi 500 XP | Získali jste 500 XP! |

**UPDATE příkaz pro databázi:** `fix_achievements_vykani.sql`

---

## 2. Hovorové výrazy

### "svou" → "svoji"
**Soubory:** Všechny SQL migration soubory + databáze

| Původní | Nový |
|---------|------|
| svou první lekci | svoji první lekci |

### "vše" → "všechno"
**Soubory:** `supabase_fix_song_completions_rls.sql`, `supabase_migration_quiz_and_songs_tracking.sql`, `supabase_migration_quiz_chords.sql`, `MIGRACE_ODMENY.md`, `SUPABASE_CUSTOM_SCHEMA.md`

| Původní | Nový |
|---------|------|
| Admin může číst vše | Admin může číst všechno |
| Admin může vše | Admin může všechno |
| ověřte, že vše proběhlo | ověřte, že všechno proběhlo |

### "více" → "víc"
**Soubory:** `useGlossaryStore.js`, `Confetti.jsx`, `SongLibrary.jsx`, `SUPABASE_CUSTOM_SCHEMA.md`

| Původní | Nový |
|---------|------|
| tří nebo více tónů | tří nebo víc tónů |
| více pro lepší efekt | víc pro lepší efekt |
| více než 2 malá písmena | víc než 2 malá písmena |
| při více projektech | při víc projektech |

---

## 3. Validační zprávy

### LoginForm.jsx + RegistrationForm.jsx

| Původní | Nový |
|---------|------|
| Jméno je povinné | Vyplňte svoje jméno, prosím |
| Příjmení je povinné | Vyplňte svoje příjmení, prosím |
| Email je povinný | Vyplňte svůj e-mail, prosím |
| Zadejte platný email | Zkontrolujte, jestli v e-mailové adrese není chyba |

**Důvod:** Formální "je povinné" → přátelské "vyplňte prosím"

---

## 4. Chybové hlášky

### LoginForm.jsx
| Původní | Nový | Řádek |
|---------|------|-------|
| Nastala chyba při přihlašování. Zkuste to prosím znovu. | Aaa, něco se nepovedlo 😕 Zkuste to znovu, prosím. | 197 |

### RegistrationForm.jsx
| Původní | Nový | Řádek |
|---------|------|-------|
| Nastala chyba. Zkuste to prosím znovu. | Aaa, něco se nepovedlo 😕 Zkuste to znovu, prosím. | 68 |

### ChordQuiz.jsx
| Původní | Nový | Řádek |
|---------|------|-------|
| Žádné aktivní akordy nenalezeny. Kontaktujte administrátora. | Ještě tu nejsou žádné akordy k procvičování 🎹 Ozvěte se nám, prosím. | 48 |
| Nepodařilo se načíst akordy: | Neumíme načíst tyhle akordy: | 79 |
| Chyba při načítání | Tohle se nám nedaří načíst | 228 |

### SongLibrary.jsx
| Původní | Nový | Řádek |
|---------|------|-------|
| Chyba při nahrávání audio souboru: | Tohle se nám nedaří nahrát: | 604 |

**Důvod:** "Nastala chyba" je příliš formální → "Aaa, něco se nepovedlo" je lidštější

---

## 5. Prázdné stavy

### History.jsx
| Původní | Nový | Řádek |
|---------|------|-------|
| Zatím žádná aktivita | Ještě tu nic není | 298 |
| Začněte procvičovat a vaše aktivita se zobrazí zde. | Hned jak začnete cvičit, uvidíte tady všechny svoje úspěchy 🎉 | 301 |
| Zatím jste nedokončili žádné... | Ještě jste to nezkusili. Tak s chutí do toho! 🎵 | 302 |

### Glossary.jsx
| Původní | Nový | Řádek |
|---------|------|-------|
| Žádný výraz nenalezen. Zkuste jiné hledání. | Hm, tohle tady nemáme 🔍 Zkuste hledat znova a jinak. | 700 |

**Důvod:** Prázdné stavy jsou příležitost k motivaci místo suché konstatace

---

## 6. Button texty

### Lesson.jsx
| Původní | Nový | Řádek |
|---------|------|-------|
| Označit jako dokončenou | Fajn, mám hotovo | 421 |

**Důvod:** "Označit jako" zní úředně → "Fajn, mám hotovo" je přirozené

---

## 7. Potvrzovací dialogy

Každý dialog má svůj osobitý tón odpovídající kontextu!

### LessonList.jsx
| Původní | Nový | Řádek |
|---------|------|-------|
| Opravdu chcete smazat tuto lekci? | Když to teď smažete, už to nepůjde nikdy, ale vůbec nikdy vrátit. Vážně chcete tuhle lekci smazat? | 192 |

### SongLibrary.jsx - Písničky
| Původní | Nový | Řádek |
|---------|------|-------|
| Opravdu chcete smazat tuto písničku? | Jestli tu písničku teď smažete, budete ji muset celou typovat znova, když si to pak rozmyslíte. Nepůjde totiž vrátit zpátky. Tak určitě ji chcete smazat? | 543 |

### SongLibrary.jsx - Audio
| Původní | Nový | Řádek |
|---------|------|-------|
| Opravdu chcete smazat audio soubor? | Klidně tohle audio smažte, kdyžtak ho nahrajete znova. Jestli teda máte zálohu. Smazat nebo nechat? | 613 |

### Glossary.jsx
| Původní | Nový | Řádek |
|---------|------|-------|
| Opravdu chcete smazat tento výraz? | Aha, tenhle výraz se vám nelíbí a chcete ho smazat. Ano, ale je to definitivní. Takže vážně smazat? | 149 |

**Důvod:** Různé kontexty = různý tón, ale všechny vysvětlují důsledky přátelsky

---

## 8. Alert zprávy

### LessonList.jsx
| Původní | Nový | Řádek |
|---------|------|-------|
| Vyplňte alespoň název a popis lekce | Vyplňte aspoň něco 😊 Třeba název a popis lekce. | 142 |

### Glossary.jsx
| Původní | Nový | Řádek |
|---------|------|-------|
| Vyplňte alespoň název a definici | Vyplňte aspoň něco 😊 Třeba název a definici. | 106 |

**Důvod:** Přidání emoji a "třeba" činí zprávu méně příkazovou

---

## 📁 Dotčené soubory

### Frontend komponenty:
- `src/components/auth/LoginForm.jsx`
- `src/components/auth/RegistrationForm.jsx`
- `src/components/games/ChordQuiz.jsx`
- `src/components/admin/AchievementManager.jsx`
- `src/components/resources/NoteComposer.jsx`
- `src/components/resources/SongLibrary.jsx`
- `src/components/resources/Glossary.jsx`
- `src/components/common/Confetti.jsx`
- `src/components/lessons/LessonList.jsx`
- `src/pages/Lesson.jsx`
- `src/pages/History.jsx`
- `src/store/useGlossaryStore.js`

### SQL soubory:
- `supabase_migration.sql`
- `supabase_migration_clean.sql`
- `supabase_migration_public.sql`
- `supabase_fix_song_completions_rls.sql`
- `supabase_migration_quiz_and_songs_tracking.sql`
- `supabase_migration_quiz_chords.sql`
- `fix_achievements_vykani.sql` (nový soubor pro UPDATE databáze)

### Dokumentace:
- `MIGRACE_ODMENY.md`
- `SUPABASE_CUSTOM_SCHEMA.md`

---

## 🎯 Charakteristika nového tónu

### Principy:
✅ **Vykání** - důstojné, ale přátelské
✅ **Hovorové výrazy** - "svoji", "víc", "všechno", "aspoň"
✅ **Emoce** - "Aaa", "Hm", "Aha", emoji 😕 🎉 🔍 😊
✅ **Osobitost** - každý dialog má svůj charakter
✅ **Empatie** - vysvětlení důsledků místo příkazů
✅ **Motivace** - pozitivní jazyk v prázdných stavech
✅ **Lidskost** - "nepovedlo se" místo "nastala chyba"

### Co se NEZMĚNILO:
- Technické názvy
- Databázové komentáře
- Console.log zprávy
- Error logging pro vývojáře

---

## 🔄 Jak vrátit zpět

### Databáze:
Spusťte opačné UPDATE příkazy z `fix_achievements_vykani.sql`:

```sql
UPDATE piano.piano_achievements
SET description = 'Dokončil jsi svou první lekci!'
WHERE title = 'První kroky';

-- ... atd. pro všechny achievementy
```

### SQL soubory:
Použijte git revert nebo nahraďte texty ručně podle tohoto dokumentu.

### Frontend:
Použijte git revert nebo Find & Replace podle tabulek výše.

---

## 📊 Statistika změn

- **Změněných souborů:** 19
- **SQL souborů:** 7
- **React komponent:** 10
- **Dokumentačních souborů:** 2
- **Celkový počet textových změn:** 50+

---

**Vytvořeno:** Claude Code
**Poslední aktualizace:** 20. listopadu 2025
**Status:** ✅ Kompletní přehled všech změn
