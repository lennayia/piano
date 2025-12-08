-- ============================================================
-- RLS POLICIES pro piano_song_completions
-- Umožní uživatelům vkládat a číst své vlastní dokončené písně
-- ============================================================

-- Zapnout RLS na piano_song_completions
ALTER TABLE piano.piano_song_completions ENABLE ROW LEVEL SECURITY;

-- DROP existující policies pokud existují
DROP POLICY IF EXISTS "Users can view own song completions" ON piano.piano_song_completions;
DROP POLICY IF EXISTS "Users can insert own song completions" ON piano.piano_song_completions;
DROP POLICY IF EXISTS "Admins can do anything with song completions" ON piano.piano_song_completions;

-- ============================================================
-- SELECT policies
-- ============================================================

-- Policy 1: Uživatelé mohou číst pouze své vlastní dokončené písně
CREATE POLICY "Users can view own song completions"
ON piano.piano_song_completions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================
-- INSERT policies
-- ============================================================

-- Policy 2: Uživatelé mohou vkládat pouze své vlastní dokončené písně
CREATE POLICY "Users can insert own song completions"
ON piano.piano_song_completions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Admin override policies
-- ============================================================

-- Policy 3: Admini mohou dělat cokoliv
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
-- Verification
-- ============================================================
-- Zkontrolujeme, že policies existují
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
  AND tablename = 'piano_song_completions'
ORDER BY policyname;
