-- ============================================
-- RLS POLICIES PRO TEORETICKÉ KVÍZY
-- ============================================
-- Pro spuštění v Supabase SQL Editoru
-- Datum: 2024-11-24
-- ============================================

-- ============================================
-- 1. PIANO_QUIZ_CHORDS - Povolit INSERT/UPDATE/DELETE pro authenticated
-- ============================================

-- INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert quiz chords" ON piano.piano_quiz_chords;
CREATE POLICY "Authenticated users can insert quiz chords"
  ON piano.piano_quiz_chords
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update quiz chords" ON piano.piano_quiz_chords;
CREATE POLICY "Authenticated users can update quiz chords"
  ON piano.piano_quiz_chords
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE policy
DROP POLICY IF EXISTS "Authenticated users can delete quiz chords" ON piano.piano_quiz_chords;
CREATE POLICY "Authenticated users can delete quiz chords"
  ON piano.piano_quiz_chords
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 2. PIANO_QUIZ_CHORD_OPTIONS - Povolit INSERT/UPDATE/DELETE pro authenticated
-- ============================================

-- INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert chord options" ON piano.piano_quiz_chord_options;
CREATE POLICY "Authenticated users can insert chord options"
  ON piano.piano_quiz_chord_options
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update chord options" ON piano.piano_quiz_chord_options;
CREATE POLICY "Authenticated users can update chord options"
  ON piano.piano_quiz_chord_options
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE policy
DROP POLICY IF EXISTS "Authenticated users can delete chord options" ON piano.piano_quiz_chord_options;
CREATE POLICY "Authenticated users can delete chord options"
  ON piano.piano_quiz_chord_options
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 3. PIANO_QUIZ_THEORY - Povolit INSERT/UPDATE/DELETE pro authenticated
-- ============================================

-- INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert theory questions" ON piano.piano_quiz_theory;
CREATE POLICY "Authenticated users can insert theory questions"
  ON piano.piano_quiz_theory
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update theory questions" ON piano.piano_quiz_theory;
CREATE POLICY "Authenticated users can update theory questions"
  ON piano.piano_quiz_theory
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE policy
DROP POLICY IF EXISTS "Authenticated users can delete theory questions" ON piano.piano_quiz_theory;
CREATE POLICY "Authenticated users can delete theory questions"
  ON piano.piano_quiz_theory
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 4. PIANO_QUIZ_THEORY_OPTIONS - Povolit INSERT/UPDATE/DELETE pro authenticated
-- ============================================

-- INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert theory options" ON piano.piano_quiz_theory_options;
CREATE POLICY "Authenticated users can insert theory options"
  ON piano.piano_quiz_theory_options
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update theory options" ON piano.piano_quiz_theory_options;
CREATE POLICY "Authenticated users can update theory options"
  ON piano.piano_quiz_theory_options
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE policy
DROP POLICY IF EXISTS "Authenticated users can delete theory options" ON piano.piano_quiz_theory_options;
CREATE POLICY "Authenticated users can delete theory options"
  ON piano.piano_quiz_theory_options
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- HOTOVO!
-- ============================================
SELECT 'RLS policies úspěšně nastaveny!' AS result;

-- Ověření policies
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'piano'
  AND tablename IN ('piano_quiz_chords', 'piano_quiz_chord_options', 'piano_quiz_theory', 'piano_quiz_theory_options')
ORDER BY tablename, cmd;
