# Supabase Migrace - Návod

Tento soubor obsahuje instrukce pro spuštění SQL migrací v Supabase.

## ⚠️ DŮLEŽITÉ UPOZORNĚNÍ

**Migrace níže NEJSOU POTŘEBA!** ❌

RLS policies pro completion tabulky **již existují** v databázi a byly spuštěny dříve pomocí:
- `supabase_fix_song_completions_rls.sql` (song + quiz completions)
- `supabase_migration_lesson_completions.sql` (lesson completions)

Níže uvedené migrace jsou **duplicitní** a byly vytvořeny omylem. Ponecháváme je pouze pro referenci.

---

## 📋 Seznam migrací (NEPOUŽITÉ)

### 1. `supabase_migration_all_completions_rls.sql` ❌ NEPOUŽITO
**Status**: DUPLICITNÍ - RLS policies již existují v databázi

**Popis**: Kompletní RLS policies pro všechny completion tabulky (song, lesson, quiz)

**Poznámka**: Tato migrace je duplicitní. Použité migrace jsou:
- `supabase_fix_song_completions_rls.sql`
- `supabase_migration_lesson_completions.sql`

---

### 2. `supabase_migration_song_completions_rls.sql` ❌ NEPOUŽITO
**Status**: DUPLICITNÍ - RLS policies již existují v databázi

**Popis**: RLS policies pouze pro piano_song_completions

**Poznámka**: Tato migrace je duplicitní. Použitá migrace: `supabase_fix_song_completions_rls.sql`

---

### 3. `supabase_migration_user_stats_rls.sql` ✅ JIŽ SPUŠTĚNO
**Popis**: RLS policies pro piano_user_stats (žebříček)

**Co dělá**:
- Umožní všem přihlášeným uživatelům číst všechny statistiky (pro žebříček)
- Uživatelé mohou upravovat pouze své vlastní statistiky
- Admini mohou dělat cokoliv

**Status**: ✅ Pravděpodobně již spuštěno (žebříček funguje)

---

### 4. `supabase_migration_theory_quiz.sql`
**Popis**: Databázová struktura pro teoretický kvíz

**Co dělá**:
- Vytvoří tabulku `piano_theory_quiz_questions` pro otázky
- Vytvoří tabulku `piano_theory_quiz_options` pro odpovědi
- Nastaví RLS policies

**Status**: Připraveno pro budoucí implementaci teoretického kvízu

---

## ✅ Skutečně použité migrace

Tyto migrace **JIŽ BYLY SPUŠTĚNY** v databázi a fungují:

1. ✅ `supabase_fix_song_completions_rls.sql` - RLS pro song_completions + quiz_completions
2. ✅ `supabase_migration_lesson_completions.sql` - RLS pro lesson_completions
3. ✅ `supabase_migration_user_stats_rls.sql` - RLS pro user_stats (žebříček)

**Není potřeba spouštět žádné další RLS migrace!**

---

## 🔍 Jak ověřit, že RLS policies fungují

Spusťte v SQL Editoru v Supabase:

```sql
-- Zkontrolujte existující RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'piano'
  AND tablename LIKE '%completion%'
ORDER BY tablename, policyname;
```

Měli byste vidět policies pro:
- `piano_song_completions`
- `piano_lesson_completions`
- `piano_quiz_completions`

---

## 📝 Reference

Ponecháváme duplicitní migrace v repozitáři pouze pro referenci a dokumentaci. Neměly by být spouštěny v databázi.

---

**Poslední aktualizace**: 22. 11. 2025
**Verze**: 1.0
