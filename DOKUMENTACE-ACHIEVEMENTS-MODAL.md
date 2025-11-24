# Dokumentace: Proklikávací Achievement Karty s Detailním Modalem

**Datum:** 24.11.2025
**Verze:** 1.0
**Autor:** Claude Code

---

## 📋 Přehled

Implementace proklikávacích achievement kart, které při kliknutí zobrazují detailní modal s informacemi o aktivitách, které vedly ke splnění achievementu, včetně přesného data dokončení.

---

## ✨ Hlavní Funkce

### 1. Proklikávací Achievement Karty
- Každá achievement karta je nyní klikatelná
- Kliknutí otevře animovaný modal s detailními informacemi
- Modal zobrazuje pozadí s blur efektem

### 2. Detailní Modal
Modal obsahuje:
- **Název a popis achievementu**
- **Ikonu achievementu** (animovaná při otevření)
- **Progress bar** pro nesplněné achievementy
- **Datum splnění** (poslední aktivita, která vedla k dokončení)
- **Seznam aktivit** s názvy, daty a získanými XP
- **Tlačítko "Jít splnit"** pro navigaci do příslušné sekce

### 3. Správné Datum Achievementu
- **Datum = datum POSLEDNÍ aktivity, která vedla ke splnění**
- Ne datum, kdy systém achievement udělil
- Pro XP achievementy: datum aktivity, při které byl dosažen požadovaný XP threshold
- Pro lesson achievementy: datum X-té dokončené lekce

---

## 🔧 Technická Implementace

### Soubory Změněny

#### 1. **src/pages/UserDashboard.jsx**
Hlavní soubor s implementací modalu.

**Nové state proměnné:**
```javascript
const [selectedAchievement, setSelectedAchievement] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);
const [achievementActivities, setAchievementActivities] = useState([]);
const [loadingModalActivities, setLoadingModalActivities] = useState(false);
```

**Klíčové funkce:**

##### `handleAchievementClick(achievement)`
- Otevírá modal
- Spouští načítání aktivit
- Řádky: 446-453

##### `fetchAchievementActivities(achievement)`
- Načítá aktivity pro daný achievement z databáze
- Podporuje různé typy achievementů:
  - `lessons_completed` - načte první X lekcí chronologicky
  - `quizzes_completed` - načte kvízy z 5 různých tabulek
  - `songs_completed` - načte první X písní
  - `xp` / `total_xp` - vypočítá kumulativní XP a vybere aktivity do dosažení limitu
  - `streak` / `current_streak` - podobně jako XP
- **Důležité**: Pro každý level achievementu se počítají aktivity od začátku (ne inkrementálně)
- Řádky: 293-473

##### `navigateToAchievementSection(requirementType)`
- Naviguje uživatele do správné sekce aplikace
- Mapping:
  - `lessons_completed`, `xp`, `total_xp`, `streak` → `/lekce`
  - `quizzes_completed` → `/teorie`
  - `songs_completed` → `/cviceni`
- Řádky: 474-495

**Modal UI:**
- Framer Motion animace (scale, opacity)
- Backdrop s blur efektem
- Responsive design
- Ikona achievementu s bounce animací
- Progress bar pro nesplněné achievementy
- Seznam aktivit se scrollem
- Řádky: 1312-1503

#### 2. **src/store/useUserStore.js**

**Oprava ukládání `earned_at` timestamp:**

Přidáno `earned_at: new Date().toISOString()` při uděleníachievement:

```javascript
// V updateUserProgress (řádek ~424)
await supabase
  .from('piano_user_achievements')
  .insert({
    user_id: userId,
    achievement_id: achievement.id,
    earned_at: new Date().toISOString()  // PŘIDÁNO
  });

// V updateUserStats (řádek ~690)
await supabase
  .from('piano_user_achievements')
  .insert({
    user_id: state.currentUser.id,
    achievement_id: achievement.id,
    earned_at: new Date().toISOString()  // PŘIDÁNO
  });
```

**Důležitost:** Zajišťuje, že nové achievementy budou mít správný `earned_at` timestamp při prvním udělení.

#### 3. Ostatní Komponenty
- **TheoryQuizHub.jsx** - drobné úpravy
- **UniversalTheoryQuiz.jsx** - drobné úpravy
- **TabButtons.jsx** - drobné úpravy
- **Cviceni.jsx** - drobné úpravy

---

## 🗄️ Databázová Struktura

### Tabulky Používané

#### `piano_user_achievements`
- `id` - UUID záznamu
- `user_id` - UUID uživatele
- `achievement_id` - UUID achievementu z `piano_achievements`
- `earned_at` - Timestamp kdy byl achievement splněn (ISO 8601)

#### `piano_achievements`
- `id` - UUID achievementu
- `title` - Název (např. "První kroky", "100 XP")
- `description` - Popis
- `requirement_type` - Typ požadavku (`lessons_completed`, `xp`, `quizzes_completed`, atd.)
- `requirement_value` - Hodnota požadavku (např. 1, 100, 500)

#### Activity Tabulky
- `piano_lesson_completions` - dokončené lekce
- `piano_song_completions` - dokončené písně
- `piano_quiz_theory_completions` - teoretické kvízy
- `piano_quiz_interval_completions` - intervalové kvízy
- `piano_quiz_scale_completions` - stupnicové kvízy
- `piano_quiz_rhythm_completions` - rytmické kvízy
- `piano_quiz_mixed_completions` - smíšené kvízy

---

## 📊 Logika Výpočtu Data Achievementu

### Princip
Pro každý achievement se načtou **první X aktivit chronologicky**, kde X = `requirement_value`.

### Příklady

#### Achievement "První kroky" (1 lekce)
```sql
SELECT completed_at FROM piano_lesson_completions
WHERE user_id = '...'
ORDER BY completed_at ASC
LIMIT 1;  -- První lekce
```
→ Datum achievementu = datum první lekce

#### Achievement "100 XP"
```javascript
// 1. Načti všechny aktivity (lekce + písně)
// 2. Seřaď chronologicky
// 3. Počítej kumulativní XP:
//    - Lekce: xp_earned (default 50)
//    - Písně: 100 XP
// 4. Najdi aktivitu, při které XP >= 100
```

Příklad:
- Aktivita 1: Lekce (50 XP) → Celkem 50 XP
- Aktivita 2: Píseň (100 XP) → Celkem 150 XP ✓ **Toto je datum achievementu**

#### Achievement "Piano mistr" (10 lekcí)
```sql
SELECT completed_at FROM piano_lesson_completions
WHERE user_id = '...'
ORDER BY completed_at ASC
LIMIT 10;  -- Prvních 10 lekcí
```
→ Datum achievementu = datum 10. lekce (poslední z výsledku)

---

## 🔄 Proces Opravy Existujících Dat

Pokud achievementy v databázi mají špatná data (např. datum udělení místo datum aktivity), je potřeba je opravit:

### 1. Zjistit Správná Data
Pro každý achievement spočítat správné datum z aktivit (viz výše).

### 2. Spustit UPDATE v Supabase
```sql
-- Najít achievement podle title a user_id
UPDATE piano.piano_user_achievements ua
SET earned_at = 'SPRÁVNÉ_DATUM'
FROM piano.piano_achievements a
WHERE ua.achievement_id = a.id
  AND ua.user_id = 'USER_ID'
  AND a.title = 'NÁZEV_ACHIEVEMENTU';
```

### 3. Ověřit Změny
```sql
SELECT
  a.title,
  ua.earned_at,
  TO_CHAR(ua.earned_at, 'DD.MM.YYYY HH24:MI') as datum
FROM piano.piano_user_achievements ua
JOIN piano.piano_achievements a ON a.id = ua.achievement_id
WHERE ua.user_id = 'USER_ID'
ORDER BY ua.earned_at;
```

---

## 🎨 UX Design

### Animace
- **Modal otevření**: Scale 0.9 → 1.0, Opacity 0 → 1
- **Backdrop**: Opacity 0 → 1
- **Ikona**: Bounce animace při otevření
- **Zavření**: Reverse animace

### Interakce
- **Kliknutí na kartu**: Otevře modal
- **Kliknutí na backdrop**: Zavře modal
- **ESC klávesa**: Zavře modal (nativní behavior)
- **Tlačítko Zavřít**: Zavře modal
- **Tlačítko "Jít splnit"**: Naviguje + zavře modal

### Responsive Design
- Modal je vertikálně scrollovatelný
- Seznam aktivit má max-height a scroll
- Funguje na všech velikostech obrazovek

---

## 🐛 Známé Problémy a Řešení

### Problem 1: Type Aliases
**Problém:** Database používá `xp` a `streak`, ale původní kód očekával `total_xp` a `current_streak`.

**Řešení:** Switch statement podporuje oba varianty:
```javascript
case 'xp':
case 'total_xp': {
  // Společná logika
}
```

### Problem 2: Quiz Completions
**Problém:** Kvízy jsou rozděleny do 5 různých tabulek.

**Řešení:** Iterace přes všechny tabulky a spojení výsledků:
```javascript
const quizTables = [
  { table: 'piano_quiz_theory_completions', title: 'Kvíz: Hudební teorie' },
  // ... další tabulky
];

for (const quizTable of quizTables) {
  const { data } = await supabase.from(quizTable.table).select(...);
  // Přidání do allQuizzes
}
```

### Problem 3: Nesplněné Achievementy
**Problém:** Jak zobrazit progress pro nesplněné achievementy?

**Řešení:** Fetch pouze existující aktivity (bez limitu na requirement_value) a vypočítej poměr:
```javascript
const progress = (currentValue / requirementValue) * 100;
```

---

## 🚀 Budoucí Vylepšení

### Možná Rozšíření
1. **Filtrování achievementů** - zobrazit jen splněné/nesplněné
2. **Řazení** - podle data, XP, názvu
3. **Achievement detail page** - samostatná stránka pro každý achievement
4. **Sdílení achievementů** - možnost sdílet na sociální sítě
5. **Notifikace** - push notifikace při získání achievementu
6. **Statistiky** - graf průběhu získávání achievementů v čase

### Optimalizace
1. **Caching aktivit** - ukládat načtené aktivity do paměti
2. **Lazy loading** - načítat aktivity až při otevření modalu (už implementováno)
3. **Pagination aktivit** - pro achievementy s mnoha aktivitami

---

## 📝 Commit Historie

**Commit:** `3d1c853`
**Branch:** `fix/achievement-dates-modal`
**Merged to:** `main`
**Datum:** 24.11.2025

**Změny:**
- 6 souborů změněno
- +1195 řádků přidáno
- -118 řádků odstraněno

**Message:**
```
Fix: Proklikávací achievement karty s detailním modalem a opravou dat

Hlavní změny:
- Proklikávací achievement karty zobrazují detailní modal s aktivitami
- Modal zobrazuje všechny aktivity, které vedly ke splnění achievementu
- Datum achievementu = datum poslední přispívající aktivity
- Tlačítko "Jít splnit" naviguje do příslušné sekce
- Oprava ukládání earned_at při získání achievementu
- Fix podpory type aliases (xp/total_xp, streak/current_streak)
```

---

## 🔗 Související Dokumentace

- **UserDashboard.jsx**: src/pages/UserDashboard.jsx
- **useUserStore.js**: src/store/useUserStore.js
- **Supabase Schema**: piano schema v Supabase dashboardu
- **Framer Motion Docs**: https://www.framer.com/motion/

---

## 👥 Autoři

- **Implementace:** Claude Code
- **Zadání a testování:** Lenka Roubalová
- **Oprava databázových dat:** Provedeno manuálně v Supabase SQL Editoru

---

*Vygenerováno 24.11.2025*
