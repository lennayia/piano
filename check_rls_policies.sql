-- =====================================================
-- Kontrola aktuálních RLS policies
-- =====================================================

-- 1. Zjistit, jaké tabulky existují ve schématu piano
SELECT tablename
FROM pg_tables
WHERE schemaname = 'piano'
ORDER BY tablename;

-- 2. Zjistit, které tabulky mají RLS zapnuté
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'piano'
ORDER BY tablename;

-- 3. Zobrazit všechny RLS policies pro piano schéma
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'piano'
ORDER BY tablename, policyname;

-- 4. Konkrétně pro song_completions a quiz_completions
SELECT
    tablename,
    policyname,
    cmd as operation,
    roles,
    qual as using_clause,
    with_check as check_clause
FROM pg_policies
WHERE schemaname = 'piano'
  AND tablename IN ('piano_song_completions', 'piano_quiz_completions')
ORDER BY tablename, policyname;
