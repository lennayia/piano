# 📋 MASTER TODO - Piano Learning App

Datum poslední aktualizace: 22. listopadu 2025

## 🔥 Aktuální prioritní úkoly

### 1. ⏳ Přidat správu gamifikace do admin panelu
**Status:** Pending
**Popis:**
- Správa bodů (XP) a levelů uživatelů
- Správa achievementů/odměn
- Nastavení pravidel gamifikace (kolik XP za co)
- Leaderboard/žebříčky

**Soubory k úpravě:**
- `src/pages/Admin.jsx` - přidat záložku Gamifikace
- `src/components/admin/GamificationManager.jsx` - nová komponenta
- Databáze: tabulky `piano_user_stats`, `piano_achievements`

---

### 2. ⏳ Vytvořit front-end komponentu pro teoretický kvíz
**Status:** Pending
**Popis:**
- Kvíz pro hraní teoretických otázek (bez klaviatury)
- Podobný ChordQuiz, ale textové otázky
- Multiple choice s 4 možnostmi

**Soubory k vytvoření:**
- `src/components/games/TheoryQuiz.jsx` - nová komponenta
- Přidat do `src/pages/Cviceni.jsx` jako nový typ cvičení

**Závislosti:**
- Vyžaduje databázovou migraci `supabase_migration_universal_quiz.sql`

---

### 3. ⏳ Opravit duplikaci lekcí - chybějící duration column
**Status:** Pending
**Popis:**
- Při duplikaci lekcí chybí sloupec `duration`
- Přidat sloupec do databáze
- Opravit funkci duplikace v admin panelu

**Soubory k úpravě:**
- Databázová migrace pro přidání `duration` sloupce
- `src/components/lessons/LessonModal.jsx` - opravit duplikaci

---

### 4. ⏳ Vytvořit RLS policy pro piano_song_completions INSERT
**Status:** Pending
**Popis:**
- Uživatelé nemůžou ukládat dokončení písní
- Chybí RLS policy pro INSERT operaci

**Soubory k úpravě:**
- SQL migrace v Supabase pro přidání policy

---

## ✅ Nedávno dokončené úkoly

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

## 🐛 Známé problémy (Backlog)

1. **Historie aktivit** - chybějící sloupec user_id
2. **Song completions RLS** - chybějící policy pro INSERT
3. **Lesson duplication** - chybějící duration column

---

## 🎯 Budoucí vylepšení (Icebox)

1. **MIDI podpora** - přehrávání pomocí MIDI klávesnice
2. **Audio nahrávání** - nahrávání vlastního hraní
3. **Multiplayer režim** - hraní s přáteli
4. **Progressive Web App** - offline funkcionalita
5. **Export/Import** - zálohování pokroku uživatele

---

## 📊 Statistiky projektu

- **Počet komponent:** ~40+
- **Počet DB tabulek:** ~15+
- **Počet migrací:** 5+
- **Řádků kódu:** ~15,000+

---

## 🔗 Užitečné odkazy

- [Supabase Dashboard](https://supabase.com)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Documentation](https://react.dev)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

**Poznámky:**
- Tento soubor by měl být aktualizován při každé větší změně
- Udržujte ho synchronizovaný s aktuálním stavem projektu
- Pro detailní changelog viz `CHANGELOG.md`
