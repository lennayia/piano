# Supabase Migrace - Návod

Tento soubor obsahuje instrukce pro spuštění SQL migrací v Supabase.

## 📋 Seznam migrací

### 1. `supabase_migration_all_completions_rls.sql` ⭐ DOPORUČENO
**Popis**: Kompletní RLS policies pro všechny completion tabulky (song, lesson, quiz)

**Co dělá**:
- Zapne Row Level Security (RLS) na všech completion tabulkách
- Umožní uživatelům vkládat a číst pouze své vlastní dokončené aktivity
- Dá adminům plný přístup ke všem záznamům

**Tabulky**:
- `piano_song_completions`
- `piano_lesson_completions`
- `piano_quiz_completions`

**Kdy spustit**: HNED - to je klíčové pro bezpečnost aplikace!

---

### 2. `supabase_migration_song_completions_rls.sql`
**Popis**: RLS policies pouze pro piano_song_completions

**Co dělá**:
- Zapne RLS na `piano_song_completions`
- Umožní uživatelům vkládat a číst pouze své vlastní dokončené písně

**Poznámka**: Toto je podmnožina migrace #1. Pokud spustíte migraci #1, tuto nepotřebujete.

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

## 🚀 Jak spustit migrace

### Metoda 1: Supabase Dashboard (Doporučeno)

1. Přihlaste se do Supabase Dashboard: https://supabase.com/dashboard
2. Vyberte svůj projekt "PianoPro"
3. V levém menu klikněte na **SQL Editor**
4. Klikněte na **New Query**
5. Zkopírujte obsah SQL souboru (např. `supabase_migration_all_completions_rls.sql`)
6. Vložte do editoru
7. Klikněte na **Run** (nebo Ctrl/Cmd + Enter)
8. Zkontrolujte výsledek ve spodní části - měli byste vidět úspěšný výsledek

### Metoda 2: Supabase CLI

```bash
# Přihlášení
supabase login

# Link projekt
supabase link --project-ref YOUR_PROJECT_REF

# Spuštění migrace
supabase db execute --file supabase_migration_all_completions_rls.sql
```

---

## ✅ Doporučené pořadí spuštění

1. **NYNÍ**: `supabase_migration_all_completions_rls.sql`
   - Kritické pro bezpečnost - uživatelé mohou vkládat completion záznamy

2. **Zkontrolovat**: `supabase_migration_user_stats_rls.sql`
   - Pokud žebříček nefunguje, spusťte tuto migraci

3. **Budoucnost**: `supabase_migration_theory_quiz.sql`
   - Až budete implementovat teoretický kvíz

---

## 🔍 Verifikace

Po spuštění migrace zkontrolujte, že policies existují:

```sql
-- Spusťte v SQL Editoru
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

Měli byste vidět 3 policies pro každou completion tabulku:
- `Users can view own X completions` (SELECT)
- `Users can insert own X completions` (INSERT)
- `Admins can do anything with X completions` (ALL)

---

## ⚠️ Důležité poznámky

1. **Bezpečnost**: RLS policies chrání data uživatelů - nikdy je nesmažte!
2. **Admin přístup**: Admin účet (lenkaroubalka@seznam.cz) má vždy plný přístup
3. **Backup**: Před spuštěním migrace si můžete udělat snapshot v Supabase Dashboard
4. **Testing**: Po migraci otestujte:
   - Dokončení písně v režimu Výzva
   - Dokončení lekce
   - Dokončení kvízu
   - Žebříček (leaderboard)

---

## 🆘 Řešení problémů

### Problém: "permission denied for table piano_song_completions"
**Řešení**: Spusťte RLS migration pro completion tabulky

### Problém: "new row violates row-level security policy"
**Řešení**:
1. Zkontrolujte, že uživatel je přihlášen (auth.uid() není null)
2. Zkontrolujte, že user_id v záznamu odpovídá auth.uid()
3. Pro admin: Zkontrolujte is_admin flag v piano_users tabulce

### Problém: Žebříček se nezobrazuje
**Řešení**: Spusťte `supabase_migration_user_stats_rls.sql`

---

**Poslední aktualizace**: 22. 11. 2025
**Verze**: 1.0
