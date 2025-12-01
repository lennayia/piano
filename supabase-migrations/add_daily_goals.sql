-- Migration: Přidat systém denních cílů
-- Created: 2025-11-30
-- Schema: piano

-- 1. Přidat sloupce do piano.piano_user_stats pro tracking denních cílů
ALTER TABLE piano.piano_user_stats
ADD COLUMN IF NOT EXISTS daily_goals_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_goal_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS best_daily_goal_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_goal_completed_date DATE;

-- 2. Vytvořit tabulku pro historii denních cílů
CREATE TABLE IF NOT EXISTS piano.piano_daily_goal_completions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES piano.piano_users(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL, -- 'lessons', 'songs', 'quizzes', 'harmonizations'
  goal_count INTEGER NOT NULL,    -- kolik si uživatel dal za cíl
  completed_count INTEGER NOT NULL, -- kolik skutečně dokončil
  xp_earned INTEGER DEFAULT 50,   -- XP odměna za splnění cíle
  completed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Index pro rychlé dotazy
CREATE INDEX IF NOT EXISTS idx_daily_goal_completions_user_id
ON piano.piano_daily_goal_completions(user_id);

CREATE INDEX IF NOT EXISTS idx_daily_goal_completions_date
ON piano.piano_daily_goal_completions(completed_at);

-- 4. Komentáře
COMMENT ON TABLE piano.piano_daily_goal_completions IS 'Historie splněných denních cílů uživatelů';
COMMENT ON COLUMN piano.piano_user_stats.daily_goals_completed IS 'Celkový počet splněných denních cílů';
COMMENT ON COLUMN piano.piano_user_stats.daily_goal_streak IS 'Aktuální série dnů se splněným cílem';
COMMENT ON COLUMN piano.piano_user_stats.best_daily_goal_streak IS 'Nejdelší série dnů se splněným cílem';
COMMENT ON COLUMN piano.piano_user_stats.last_goal_completed_date IS 'Datum posledního splněného cíle (pro výpočet série)';
