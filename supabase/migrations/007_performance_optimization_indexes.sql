-- Migration: Performance optimization indexes
-- Date: 2025-01-25
-- Description: Přidání indexů pro optimalizaci výkonu

-- Nastavit search_path pro schéma piano
SET search_path TO piano, public;

-- ============================================================================
-- INDEXY PRO LESSON COMPLETIONS
-- ============================================================================

-- Index pro rychlé vyhledávání dokončení podle user_id a lesson_id (kontrola duplicit)
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user_lesson
ON piano.piano_lesson_completions(user_id, lesson_id);

-- Index pro řazení podle completed_at (historie)
CREATE INDEX IF NOT EXISTS idx_lesson_completions_completed_at
ON piano.piano_lesson_completions(completed_at DESC);

-- Composite index pro user + datum (pro dashboard)
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user_date
ON piano.piano_lesson_completions(user_id, completed_at DESC);

-- ============================================================================
-- INDEXY PRO SONG COMPLETIONS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_song_completions_user_song
ON piano.piano_song_completions(user_id, song_id);

CREATE INDEX IF NOT EXISTS idx_song_completions_completed_at
ON piano.piano_song_completions(completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_song_completions_user_date
ON piano.piano_song_completions(user_id, completed_at DESC);

-- ============================================================================
-- INDEXY PRO QUIZ SCORES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_quiz_scores_user_type
ON piano.piano_quiz_scores(user_id, quiz_type);

CREATE INDEX IF NOT EXISTS idx_quiz_scores_completed_at
ON piano.piano_quiz_scores(completed_at DESC);

-- ============================================================================
-- INDEXY PRO DAILY GOAL COMPLETIONS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_daily_goal_completions_user
ON piano.piano_daily_goal_completions(user_id);

CREATE INDEX IF NOT EXISTS idx_daily_goal_completions_completed_at
ON piano.piano_daily_goal_completions(completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_daily_goal_completions_user_date
ON piano.piano_daily_goal_completions(user_id, completed_at DESC);

-- ============================================================================
-- INDEXY PRO USER ACHIEVEMENTS
-- ============================================================================

-- Index pro rychlé zjištění, které achievements již má user
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_achievement
ON piano.piano_user_achievements(user_id, achievement_id);

CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at
ON piano.piano_user_achievements(earned_at DESC);

-- ============================================================================
-- INDEXY PRO USER STATS
-- ============================================================================

-- Index pro leaderboard (řazení podle total_xp)
CREATE INDEX IF NOT EXISTS idx_user_stats_total_xp
ON piano.piano_user_stats(total_xp DESC);

-- Index pro level
CREATE INDEX IF NOT EXISTS idx_user_stats_level
ON piano.piano_user_stats(level DESC);

-- Index pro streak leaderboard
CREATE INDEX IF NOT EXISTS idx_user_stats_streak
ON piano.piano_user_stats(current_streak DESC);

-- ============================================================================
-- INDEXY PRO REWARDS CONFIG
-- ============================================================================

-- Index pro vyhledávání podle action_type (používá se často)
CREATE INDEX IF NOT EXISTS idx_rewards_config_action_type
ON piano.piano_rewards_config(action_type)
WHERE is_active = true;

-- Index pro category filtering
CREATE INDEX IF NOT EXISTS idx_rewards_config_category
ON piano.piano_rewards_config(category, display_order)
WHERE is_active = true;

-- ============================================================================
-- KOMENTÁŘE
-- ============================================================================

COMMENT ON INDEX piano.idx_lesson_completions_user_lesson IS 'Rychlá kontrola, jestli user už dokončil lekci';
COMMENT ON INDEX piano.idx_user_achievements_user_achievement IS 'Rychlá kontrola odemčených achievements';
COMMENT ON INDEX piano.idx_user_stats_total_xp IS 'Leaderboard podle XP';
