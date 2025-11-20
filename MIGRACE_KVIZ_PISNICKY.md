# Migrace: Sledování kvízů a písní

## Přehled
Tato migrace přidává sledování dokončených kvízů a dokonale zahraných písní do uživatelských statistik.

## Co bylo implementováno

### 1. Databázové změny
- ✅ Nové sloupce v tabulce `piano_user_stats`:
  - `quizzes_completed` - celkový počet dokončených kvízů
  - `quizzes_perfect_score` - počet kvízů s perfektním skóre (100%)
  - `songs_completed` - celkový počet zahraných písní
  - `songs_perfect_score` - počet písní zahraných bez chyby

- ✅ Nová tabulka `piano_quiz_completions`:
  - Historie všech dokončených kvízů
  - Ukládá skóre, počet otázek, zda bylo perfektní

- ✅ Nová tabulka `piano_song_completions`:
  - Historie všech zahraných písní
  - Ukládá počet chyb, zda bylo zahráno perfektně

### 2. Kvíz "Poznáš akord?"
- ✅ Ukládání dokončení do databáze
- ✅ XP odměny:
  - **50 XP** za perfektní skóre (5/5)
  - **20 XP** za dokončení (i když ne perfektní)
- ✅ Aktualizace statistik uživatele
- ✅ Confetti a potlesk POUZE při 100%

### 3. Připraveno pro písničky
- ✅ Databázová struktura připravena
- ⏳ Implementace do SongLibrary komponenty (příště)

## Jak spustit migraci

### Krok 1: Spustit SQL migraci
Otevřete Supabase SQL Editor a spusťte soubor:
```
supabase_migration_quiz_and_songs_tracking.sql
```

### Krok 2: Ověření migrace
```sql
-- Zkontrolujte nové sloupce
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'piano'
  AND table_name = 'piano_user_stats'
  AND column_name LIKE 'quizzes%' OR column_name LIKE 'songs%';

-- Zkontrolujte nové tabulky
SELECT * FROM piano.piano_quiz_completions LIMIT 5;
SELECT * FROM piano.piano_song_completions LIMIT 5;
```

## Jak to funguje

### Kvíz "Poznáš akord?"
1. Uživatel dokončí kvíz
2. Systém uloží:
   - Záznam do `piano_quiz_completions` (historie)
   - Aktualizuje `piano_user_stats`:
     - `quizzes_completed` +1
     - `quizzes_perfect_score` +1 (pokud 100%)
     - `total_xp` +50 (perfektní) nebo +20 (dokončení)
3. Confetti a potlesk pouze při perfektním skóre

### Písničky (připraveno)
Až bude implementováno:
1. Uživatel zahraje píseň
2. Pokud bez chyby:
   - Záznam do `piano_song_completions`
   - Aktualizace statistik
   - Velká odměna + celebrace

## Statistiky v Admin Dashboardu
Admin může vidět:
- Kolik kvízů bylo dokončeno celkem
- Kolik bylo s perfektním skóre
- Historie jednotlivých dokončení
- Kolik písní bylo zahráno
- Kolik bez chyby

## Odměny
Můžete vytvořit odměny za:
- První dokončení kvízu
- První perfektní kvíz
- 10 perfektních kvízů
- První píseň bez chyby
- 5 písní bez chyby

## Příklady dotazů

```sql
-- Top 10 uživatelů s nejvíce perfektními kvízy
SELECT
  u.first_name,
  u.last_name,
  s.quizzes_perfect_score
FROM piano.piano_users u
JOIN piano.piano_user_stats s ON u.id = s.user_id
ORDER BY s.quizzes_perfect_score DESC
LIMIT 10;

-- Historie kvízů uživatele
SELECT
  quiz_name,
  score,
  total_questions,
  is_perfect,
  completed_at
FROM piano.piano_quiz_completions
WHERE user_id = 'USER_ID'
ORDER BY completed_at DESC;

-- Úspěšnost kvízů
SELECT
  quiz_name,
  COUNT(*) as total_attempts,
  SUM(CASE WHEN is_perfect THEN 1 ELSE 0 END) as perfect_scores,
  ROUND(AVG(score::numeric / total_questions::numeric * 100), 2) as avg_percentage
FROM piano.piano_quiz_completions
GROUP BY quiz_name;
```

## Co bude dál
- Implementace sledování písní v SongLibrary
- Zobrazení statistik v user dashboardu
- Žebříčky nejlepších hráčů
- Odměny za milníky v kvízech a písničkách
