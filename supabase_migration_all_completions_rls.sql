-- ============================================================
-- RLS POLICIES pro všechny completion tabulky
-- Umožní uživatelům vkládat a číst své vlastní dokončené aktivity
-- ============================================================

-- ============================================================
-- piano_song_completions
-- ============================================================

ALTER TABLE piano.piano_song_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own song completions" ON piano.piano_song_completions;
DROP POLICY IF EXISTS "Users can insert own song completions" ON piano.piano_song_completions;
DROP POLICY IF EXISTS "Admins can do anything with song completions" ON piano.piano_song_completions;

CREATE POLICY "Users can view own song completions"
ON piano.piano_song_completions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own song completions"
ON piano.piano_song_completions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can do anything with song completions"
ON piano.piano_song_completions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM piano.piano_users
    WHERE id = auth.uid() AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM piano.piano_users
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- ============================================================
-- piano_lesson_completions
-- ============================================================

ALTER TABLE piano.piano_lesson_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own lesson completions" ON piano.piano_lesson_completions;
DROP POLICY IF EXISTS "Users can insert own lesson completions" ON piano.piano_lesson_completions;
DROP POLICY IF EXISTS "Admins can do anything with lesson completions" ON piano.piano_lesson_completions;

CREATE POLICY "Users can view own lesson completions"
ON piano.piano_lesson_completions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lesson completions"
ON piano.piano_lesson_completions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can do anything with lesson completions"
ON piano.piano_lesson_completions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM piano.piano_users
    WHERE id = auth.uid() AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM piano.piano_users
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- ============================================================
-- piano_quiz_completions
-- ============================================================

ALTER TABLE piano.piano_quiz_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own quiz completions" ON piano.piano_quiz_completions;
DROP POLICY IF EXISTS "Users can insert own quiz completions" ON piano.piano_quiz_completions;
DROP POLICY IF EXISTS "Admins can do anything with quiz completions" ON piano.piano_quiz_completions;

CREATE POLICY "Users can view own quiz completions"
ON piano.piano_quiz_completions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz completions"
ON piano.piano_quiz_completions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can do anything with quiz completions"
ON piano.piano_quiz_completions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM piano.piano_users
    WHERE id = auth.uid() AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM piano.piano_users
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- ============================================================
-- Verification
-- ============================================================
-- Zkontrolujeme, že policies existují
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'piano'
  AND tablename IN ('piano_song_completions', 'piano_lesson_completions', 'piano_quiz_completions')
ORDER BY tablename, policyname;
