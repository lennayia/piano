-- RLS Politiky pro denní cíle
-- Created: 2025-11-30
-- Schema: piano

-- 1. Povolit RLS na tabulce piano_daily_goal_completions
ALTER TABLE piano.piano_daily_goal_completions ENABLE ROW LEVEL SECURITY;

-- 2. Politika pro SELECT - uživatelé vidí pouze své vlastní záznamy
CREATE POLICY "Users can view own goal completions"
ON piano.piano_daily_goal_completions
FOR SELECT
USING (auth.uid() = user_id);

-- 3. Politika pro INSERT - uživatelé mohou vkládat pouze své vlastní záznamy
CREATE POLICY "Users can insert own goal completions"
ON piano.piano_daily_goal_completions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. (Volitelně) Admini vidí všechny záznamy
-- Odkomentuj, pokud chceš, aby admini viděli všechny cíle
/*
CREATE POLICY "Admins can view all goal completions"
ON piano.piano_daily_goal_completions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM piano.piano_users
    WHERE id = auth.uid() AND is_admin = true
  )
);
*/

-- 5. Komentáře
COMMENT ON POLICY "Users can view own goal completions" ON piano.piano_daily_goal_completions
IS 'Uživatelé mohou vidět pouze své vlastní splněné denní cíle';

COMMENT ON POLICY "Users can insert own goal completions" ON piano.piano_daily_goal_completions
IS 'Uživatelé mohou vkládat pouze své vlastní splněné denní cíle';
