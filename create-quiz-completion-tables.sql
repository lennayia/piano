-- ============================================
-- COMPLETION TABULKY PRO TEORETICKÉ KVÍZY
-- ============================================
-- Pro ukládání statistik a postupu uživatelů
-- Datum: 2024-11-24
-- ============================================

-- ============================================
-- 1. INTERVAL COMPLETIONS
-- ============================================

CREATE TABLE IF NOT EXISTS piano.piano_quiz_interval_completions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interval_question_id INTEGER NOT NULL REFERENCES piano.piano_quiz_interval(id) ON DELETE CASCADE,
  selected_option_id INTEGER NOT NULL REFERENCES piano.piano_quiz_interval_options(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interval_completions_user_id ON piano.piano_quiz_interval_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_interval_completions_question_id ON piano.piano_quiz_interval_completions(interval_question_id);

-- ============================================
-- 2. SCALE COMPLETIONS
-- ============================================

CREATE TABLE IF NOT EXISTS piano.piano_quiz_scale_completions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scale_question_id INTEGER NOT NULL REFERENCES piano.piano_quiz_scale(id) ON DELETE CASCADE,
  selected_option_id INTEGER NOT NULL REFERENCES piano.piano_quiz_scale_options(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scale_completions_user_id ON piano.piano_quiz_scale_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_scale_completions_question_id ON piano.piano_quiz_scale_completions(scale_question_id);

-- ============================================
-- 3. RHYTHM COMPLETIONS
-- ============================================

CREATE TABLE IF NOT EXISTS piano.piano_quiz_rhythm_completions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rhythm_question_id INTEGER NOT NULL REFERENCES piano.piano_quiz_rhythm(id) ON DELETE CASCADE,
  selected_option_id INTEGER NOT NULL REFERENCES piano.piano_quiz_rhythm_options(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rhythm_completions_user_id ON piano.piano_quiz_rhythm_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_rhythm_completions_question_id ON piano.piano_quiz_rhythm_completions(rhythm_question_id);

-- ============================================
-- 4. MIXED COMPLETIONS
-- ============================================

CREATE TABLE IF NOT EXISTS piano.piano_quiz_mixed_completions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mixed_question_id INTEGER NOT NULL REFERENCES piano.piano_quiz_mixed(id) ON DELETE CASCADE,
  selected_option_id INTEGER NOT NULL REFERENCES piano.piano_quiz_mixed_options(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mixed_completions_user_id ON piano.piano_quiz_mixed_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_mixed_completions_question_id ON piano.piano_quiz_mixed_completions(mixed_question_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- INTERVAL
ALTER TABLE piano.piano_quiz_interval_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interval completions" ON piano.piano_quiz_interval_completions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own interval completions" ON piano.piano_quiz_interval_completions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- SCALE
ALTER TABLE piano.piano_quiz_scale_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scale completions" ON piano.piano_quiz_scale_completions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own scale completions" ON piano.piano_quiz_scale_completions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- RHYTHM
ALTER TABLE piano.piano_quiz_rhythm_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rhythm completions" ON piano.piano_quiz_rhythm_completions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own rhythm completions" ON piano.piano_quiz_rhythm_completions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- MIXED
ALTER TABLE piano.piano_quiz_mixed_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mixed completions" ON piano.piano_quiz_mixed_completions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own mixed completions" ON piano.piano_quiz_mixed_completions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================
-- HOTOVO!
-- ============================================
SELECT 'Completion tabulky pro teoretické kvízy vytvořeny!' AS result;
