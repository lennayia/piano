-- Jednoduchá RLS politika pro denní cíle
-- Created: 2025-11-30
-- Schema: piano
-- Řešení: Vypnutí RLS, protože používáme vlastní autentizaci (piano_users)

-- 1. Odstranit všechny existující politiky
DROP POLICY IF EXISTS "Users can view own goal completions" ON piano.piano_daily_goal_completions;
DROP POLICY IF EXISTS "Users can insert own goal completions" ON piano.piano_daily_goal_completions;

-- 2. Vypnout RLS pro tuto tabulku (jednodušší řešení pro vlastní auth systém)
ALTER TABLE piano.piano_daily_goal_completions DISABLE ROW LEVEL SECURITY;

-- POZNÁMKA:
-- RLS je vypnuté, protože aplikace používá vlastní autentizaci přes piano_users tabulku.
-- Pokud později budeš potřebovat RLS, můžeš vytvořit custom function pro validaci.
