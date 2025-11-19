-- Piano Learning App - Initial Database Schema
-- Schema: piano
-- Table prefix: piano_

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE piano.piano_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_piano_users_email ON piano.piano_users(email);
CREATE INDEX idx_piano_users_admin ON piano.piano_users(is_admin);

-- ============================================================================
-- LESSONS TABLE
-- ============================================================================
CREATE TABLE piano.piano_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration INTEGER NOT NULL, -- in minutes
  xp_reward INTEGER DEFAULT 50,
  order_index INTEGER NOT NULL,
  content JSONB NOT NULL, -- stores lesson content structure
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_piano_lessons_level ON piano.piano_lessons(level);
CREATE INDEX idx_piano_lessons_order ON piano.piano_lessons(order_index);

-- ============================================================================
-- SONGS TABLE
-- ============================================================================
CREATE TABLE piano.piano_songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  composer TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  key TEXT NOT NULL,
  time_signature TEXT NOT NULL,
  tempo INTEGER,
  melody JSONB NOT NULL, -- array of note objects {note, duration, octave}
  chords JSONB, -- array of chord progressions
  lyrics TEXT,
  category TEXT DEFAULT 'folk', -- folk, classical, popular
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_piano_songs_difficulty ON piano.piano_songs(difficulty);
CREATE INDEX idx_piano_songs_category ON piano.piano_songs(category);

-- ============================================================================
-- GLOSSARY TABLE
-- ============================================================================
CREATE TABLE piano.piano_glossary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  term TEXT UNIQUE NOT NULL,
  definition TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., 'theory', 'notation', 'harmony', 'rhythm'
  example TEXT,
  audio_example TEXT, -- URL or reference to audio example
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_piano_glossary_category ON piano.piano_glossary(category);
CREATE INDEX idx_piano_glossary_term ON piano.piano_glossary(term);

-- ============================================================================
-- HARMONIZATION TEMPLATES TABLE
-- ============================================================================
CREATE TABLE piano.piano_harmonization_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  key TEXT NOT NULL,
  progression JSONB NOT NULL, -- chord progression pattern
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category TEXT, -- e.g., 'classical', 'jazz', 'pop'
  example_song_id UUID REFERENCES piano.piano_songs(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_piano_harmonization_difficulty ON piano.piano_harmonization_templates(difficulty);

-- ============================================================================
-- USER PROGRESS TABLE
-- ============================================================================
CREATE TABLE piano.piano_user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES piano.piano_users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES piano.piano_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in seconds
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_piano_progress_user ON piano.piano_user_progress(user_id);
CREATE INDEX idx_piano_progress_lesson ON piano.piano_user_progress(lesson_id);
CREATE INDEX idx_piano_progress_completed ON piano.piano_user_progress(completed);

-- ============================================================================
-- USER STATS TABLE
-- ============================================================================
CREATE TABLE piano.piano_user_stats (
  user_id UUID PRIMARY KEY REFERENCES piano.piano_users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  lessons_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_practice_time INTEGER DEFAULT 0, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ACHIEVEMENTS TABLE
-- ============================================================================
CREATE TABLE piano.piano_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- icon identifier
  requirement_type TEXT NOT NULL, -- 'lessons_completed', 'streak', 'xp', 'perfect_score'
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER ACHIEVEMENTS TABLE
-- ============================================================================
CREATE TABLE piano.piano_user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES piano.piano_users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES piano.piano_achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_piano_user_achievements_user ON piano.piano_user_achievements(user_id);

-- ============================================================================
-- REWARDS CONFIGURATION TABLE (Admin configurable)
-- ============================================================================
CREATE TABLE piano.piano_rewards_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type TEXT UNIQUE NOT NULL, -- 'lesson_completion', 'perfect_score', 'daily_login', etc.
  xp_value INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- QUIZ SCORES TABLE
-- ============================================================================
CREATE TABLE piano.piano_quiz_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES piano.piano_users(id) ON DELETE CASCADE,
  quiz_type TEXT NOT NULL, -- 'chord_quiz', 'interval_quiz', etc.
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  streak INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_piano_quiz_user ON piano.piano_quiz_scores(user_id);
CREATE INDEX idx_piano_quiz_type ON piano.piano_quiz_scores(quiz_type);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE piano.piano_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE piano.piano_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE piano.piano_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE piano.piano_glossary ENABLE ROW LEVEL SECURITY;
ALTER TABLE piano.piano_harmonization_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE piano.piano_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE piano.piano_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE piano.piano_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE piano.piano_user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE piano.piano_rewards_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE piano.piano_quiz_scores ENABLE ROW LEVEL SECURITY;

-- Users: Can read own profile, admins can read all
CREATE POLICY "Users can view own profile"
  ON piano.piano_users FOR SELECT
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = TRUE
  ));

CREATE POLICY "Users can update own profile"
  ON piano.piano_users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Lessons: Everyone can read, only admins can modify
CREATE POLICY "Everyone can view active lessons"
  ON piano.piano_lessons FOR SELECT
  USING (is_active = TRUE OR EXISTS (
    SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = TRUE
  ));

CREATE POLICY "Only admins can modify lessons"
  ON piano.piano_lessons FOR ALL
  USING (EXISTS (
    SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = TRUE
  ));

-- Songs: Everyone can read active songs, only admins can modify
CREATE POLICY "Everyone can view active songs"
  ON piano.piano_songs FOR SELECT
  USING (is_active = TRUE OR EXISTS (
    SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = TRUE
  ));

CREATE POLICY "Only admins can modify songs"
  ON piano.piano_songs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = TRUE
  ));

-- Glossary: Everyone can read, only admins can modify
CREATE POLICY "Everyone can view glossary"
  ON piano.piano_glossary FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admins can modify glossary"
  ON piano.piano_glossary FOR ALL
  USING (EXISTS (
    SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = TRUE
  ));

-- Harmonization Templates: Everyone can read active, only admins can modify
CREATE POLICY "Everyone can view active templates"
  ON piano.piano_harmonization_templates FOR SELECT
  USING (is_active = TRUE OR EXISTS (
    SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = TRUE
  ));

CREATE POLICY "Only admins can modify templates"
  ON piano.piano_harmonization_templates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = TRUE
  ));

-- User Progress: Users can read/write own progress, admins can read all
CREATE POLICY "Users can view own progress"
  ON piano.piano_user_progress FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = TRUE
  ));

CREATE POLICY "Users can update own progress"
  ON piano.piano_user_progress FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- User Stats: Users can read/write own stats, admins can read all
CREATE POLICY "Users can view own stats"
  ON piano.piano_user_stats FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = TRUE
  ));

CREATE POLICY "Users can update own stats"
  ON piano.piano_user_stats FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Achievements: Everyone can read
CREATE POLICY "Everyone can view achievements"
  ON piano.piano_achievements FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Only admins can modify achievements"
  ON piano.piano_achievements FOR ALL
  USING (EXISTS (
    SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = TRUE
  ));

-- User Achievements: Users can read own, system can write
CREATE POLICY "Users can view own achievements"
  ON piano.piano_user_achievements FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = TRUE
  ));

CREATE POLICY "Users can earn achievements"
  ON piano.piano_user_achievements FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Rewards Config: Everyone can read, only admins can modify
CREATE POLICY "Everyone can view rewards config"
  ON piano.piano_rewards_config FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Only admins can modify rewards config"
  ON piano.piano_rewards_config FOR ALL
  USING (EXISTS (
    SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = TRUE
  ));

-- Quiz Scores: Users can read/write own scores, admins can read all
CREATE POLICY "Users can view own quiz scores"
  ON piano.piano_quiz_scores FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = TRUE
  ));

CREATE POLICY "Users can record own quiz scores"
  ON piano.piano_quiz_scores FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION piano.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_piano_users_updated_at BEFORE UPDATE ON piano.piano_users
  FOR EACH ROW EXECUTE FUNCTION piano.update_updated_at_column();

CREATE TRIGGER update_piano_lessons_updated_at BEFORE UPDATE ON piano.piano_lessons
  FOR EACH ROW EXECUTE FUNCTION piano.update_updated_at_column();

CREATE TRIGGER update_piano_songs_updated_at BEFORE UPDATE ON piano.piano_songs
  FOR EACH ROW EXECUTE FUNCTION piano.update_updated_at_column();

CREATE TRIGGER update_piano_glossary_updated_at BEFORE UPDATE ON piano.piano_glossary
  FOR EACH ROW EXECUTE FUNCTION piano.update_updated_at_column();

CREATE TRIGGER update_piano_harmonization_updated_at BEFORE UPDATE ON piano.piano_harmonization_templates
  FOR EACH ROW EXECUTE FUNCTION piano.update_updated_at_column();

CREATE TRIGGER update_piano_progress_updated_at BEFORE UPDATE ON piano.piano_user_progress
  FOR EACH ROW EXECUTE FUNCTION piano.update_updated_at_column();

CREATE TRIGGER update_piano_stats_updated_at BEFORE UPDATE ON piano.piano_user_stats
  FOR EACH ROW EXECUTE FUNCTION piano.update_updated_at_column();

CREATE TRIGGER update_piano_rewards_config_updated_at BEFORE UPDATE ON piano.piano_rewards_config
  FOR EACH ROW EXECUTE FUNCTION piano.update_updated_at_column();

-- ============================================================================
-- INITIAL SEED DATA
-- ============================================================================

-- Default achievements
INSERT INTO piano.piano_achievements (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
  ('První kroky', 'Dokončete první lekci', 'Trophy', 'lessons_completed', 1, 50),
  ('Začátečník', 'Dokončete 5 lekcí', 'Award', 'lessons_completed', 5, 100),
  ('Pokročilý', 'Dokončete 10 lekcí', 'Medal', 'lessons_completed', 10, 200),
  ('Mistr harmonie', 'Dokončete všechny lekce', 'Crown', 'lessons_completed', 20, 500),
  ('Neúnavný', 'Dosáhněte série 7 dní', 'Flame', 'streak', 7, 150),
  ('Dedikace', 'Dosáhněte série 30 dní', 'Zap', 'streak', 30, 500),
  ('Perfekcionista', 'Získejte perfektní skóre v lekci', 'Star', 'perfect_score', 1, 100);

-- Default rewards configuration
INSERT INTO piano.piano_rewards_config (action_type, xp_value, description) VALUES
  ('lesson_completion', 50, 'XP za dokončení lekce'),
  ('perfect_score', 100, 'Bonus za perfektní výsledek'),
  ('daily_login', 10, 'XP za denní přihlášení'),
  ('first_lesson', 25, 'Bonus za první dokončenou lekci'),
  ('quiz_completion', 30, 'XP za dokončení kvízu'),
  ('streak_bonus', 20, 'Bonus za udržení série');

COMMENT ON SCHEMA piano IS 'Piano Learning App database schema';
COMMENT ON TABLE piano.piano_users IS 'User accounts and authentication';
COMMENT ON TABLE piano.piano_lessons IS 'Learning lessons and content';
COMMENT ON TABLE piano.piano_songs IS 'Song library for practice';
COMMENT ON TABLE piano.piano_glossary IS 'Music theory glossary';
COMMENT ON TABLE piano.piano_harmonization_templates IS 'Harmonization patterns and templates';
COMMENT ON TABLE piano.piano_user_progress IS 'User progress tracking for lessons';
COMMENT ON TABLE piano.piano_user_stats IS 'User statistics and gamification';
COMMENT ON TABLE piano.piano_achievements IS 'Available achievements and badges';
COMMENT ON TABLE piano.piano_user_achievements IS 'Earned user achievements';
COMMENT ON TABLE piano.piano_rewards_config IS 'Admin-configurable reward system';
COMMENT ON TABLE piano.piano_quiz_scores IS 'Quiz results and scores';
