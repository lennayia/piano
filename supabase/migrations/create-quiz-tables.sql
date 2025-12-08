-- ============================================
-- VYTVOŘENÍ TABULEK PRO TEORETICKÉ KVÍZY
-- ============================================
-- Pro spuštění v Supabase SQL Editoru
-- Datum: 2024-11-24
-- ============================================

-- ============================================
-- 1. TABULKA PRO INTERVALOVÉ KVÍZY
-- ============================================

CREATE TABLE IF NOT EXISTS piano.piano_quiz_interval (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  question_text TEXT NOT NULL,
  category TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS piano.piano_quiz_interval_options (
  id SERIAL PRIMARY KEY,
  interval_question_id INTEGER NOT NULL REFERENCES piano.piano_quiz_interval(id) ON DELETE CASCADE,
  option_name TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_interval_display_order ON piano.piano_quiz_interval(display_order);
CREATE INDEX IF NOT EXISTS idx_interval_options_question_id ON piano.piano_quiz_interval_options(interval_question_id);

-- ============================================
-- 2. TABULKA PRO STUPNICOVÉ KVÍZY
-- ============================================

CREATE TABLE IF NOT EXISTS piano.piano_quiz_scale (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  question_text TEXT NOT NULL,
  category TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS piano.piano_quiz_scale_options (
  id SERIAL PRIMARY KEY,
  scale_question_id INTEGER NOT NULL REFERENCES piano.piano_quiz_scale(id) ON DELETE CASCADE,
  option_name TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_scale_display_order ON piano.piano_quiz_scale(display_order);
CREATE INDEX IF NOT EXISTS idx_scale_options_question_id ON piano.piano_quiz_scale_options(scale_question_id);

-- ============================================
-- 3. TABULKA PRO RYTMICKÉ KVÍZY
-- ============================================

CREATE TABLE IF NOT EXISTS piano.piano_quiz_rhythm (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  question_text TEXT NOT NULL,
  category TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS piano.piano_quiz_rhythm_options (
  id SERIAL PRIMARY KEY,
  rhythm_question_id INTEGER NOT NULL REFERENCES piano.piano_quiz_rhythm(id) ON DELETE CASCADE,
  option_name TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_rhythm_display_order ON piano.piano_quiz_rhythm(display_order);
CREATE INDEX IF NOT EXISTS idx_rhythm_options_question_id ON piano.piano_quiz_rhythm_options(rhythm_question_id);

-- ============================================
-- 4. TABULKA PRO MIXOVANÉ KVÍZY
-- ============================================

CREATE TABLE IF NOT EXISTS piano.piano_quiz_mixed (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  question_text TEXT NOT NULL,
  category TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS piano.piano_quiz_mixed_options (
  id SERIAL PRIMARY KEY,
  mixed_question_id INTEGER NOT NULL REFERENCES piano.piano_quiz_mixed(id) ON DELETE CASCADE,
  option_name TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_mixed_display_order ON piano.piano_quiz_mixed(display_order);
CREATE INDEX IF NOT EXISTS idx_mixed_options_question_id ON piano.piano_quiz_mixed_options(mixed_question_id);

-- ============================================
-- RLS POLICIES - Povolit čtení pro anon a authenticated
-- ============================================

-- INTERVAL
ALTER TABLE piano.piano_quiz_interval ENABLE ROW LEVEL SECURITY;
ALTER TABLE piano.piano_quiz_interval_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read interval questions" ON piano.piano_quiz_interval
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can read interval options" ON piano.piano_quiz_interval_options
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated users can insert interval questions" ON piano.piano_quiz_interval
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update interval questions" ON piano.piano_quiz_interval
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete interval questions" ON piano.piano_quiz_interval
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert interval options" ON piano.piano_quiz_interval_options
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update interval options" ON piano.piano_quiz_interval_options
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete interval options" ON piano.piano_quiz_interval_options
  FOR DELETE TO authenticated USING (true);

-- SCALE
ALTER TABLE piano.piano_quiz_scale ENABLE ROW LEVEL SECURITY;
ALTER TABLE piano.piano_quiz_scale_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read scale questions" ON piano.piano_quiz_scale
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can read scale options" ON piano.piano_quiz_scale_options
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated users can insert scale questions" ON piano.piano_quiz_scale
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update scale questions" ON piano.piano_quiz_scale
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete scale questions" ON piano.piano_quiz_scale
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert scale options" ON piano.piano_quiz_scale_options
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update scale options" ON piano.piano_quiz_scale_options
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete scale options" ON piano.piano_quiz_scale_options
  FOR DELETE TO authenticated USING (true);

-- RHYTHM
ALTER TABLE piano.piano_quiz_rhythm ENABLE ROW LEVEL SECURITY;
ALTER TABLE piano.piano_quiz_rhythm_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read rhythm questions" ON piano.piano_quiz_rhythm
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can read rhythm options" ON piano.piano_quiz_rhythm_options
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated users can insert rhythm questions" ON piano.piano_quiz_rhythm
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update rhythm questions" ON piano.piano_quiz_rhythm
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete rhythm questions" ON piano.piano_quiz_rhythm
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert rhythm options" ON piano.piano_quiz_rhythm_options
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update rhythm options" ON piano.piano_quiz_rhythm_options
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete rhythm options" ON piano.piano_quiz_rhythm_options
  FOR DELETE TO authenticated USING (true);

-- MIXED
ALTER TABLE piano.piano_quiz_mixed ENABLE ROW LEVEL SECURITY;
ALTER TABLE piano.piano_quiz_mixed_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read mixed questions" ON piano.piano_quiz_mixed
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can read mixed options" ON piano.piano_quiz_mixed_options
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated users can insert mixed questions" ON piano.piano_quiz_mixed
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update mixed questions" ON piano.piano_quiz_mixed
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete mixed questions" ON piano.piano_quiz_mixed
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert mixed options" ON piano.piano_quiz_mixed_options
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update mixed options" ON piano.piano_quiz_mixed_options
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete mixed options" ON piano.piano_quiz_mixed_options
  FOR DELETE TO authenticated USING (true);

-- ============================================
-- HOTOVO!
-- ============================================
SELECT 'Tabulky pro teoretické kvízy vytvořeny!' AS result;
