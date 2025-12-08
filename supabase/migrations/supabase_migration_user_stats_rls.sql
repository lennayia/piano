-- ============================================================
-- RLS POLICIES pro piano_user_stats
-- Umožní všem přihlášeným uživatelům číst žebříček
-- ============================================================

-- Zapnout RLS na piano_user_stats
ALTER TABLE piano.piano_user_stats ENABLE ROW LEVEL SECURITY;

-- DROP existující policies pokud existují
DROP POLICY IF EXISTS "Users can view all stats for leaderboard" ON piano.piano_user_stats;
DROP POLICY IF EXISTS "Users can view own stats" ON piano.piano_user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON piano.piano_user_stats;
DROP POLICY IF EXISTS "Admins can view all stats" ON piano.piano_user_stats;
DROP POLICY IF EXISTS "Admins can update all stats" ON piano.piano_user_stats;

-- ============================================================
-- SELECT policies
-- ============================================================

-- Policy 1: Všichni přihlášení uživatelé mohou číst všechny statistiky (pro žebříček)
CREATE POLICY "Users can view all stats for leaderboard"
ON piano.piano_user_stats
FOR SELECT
TO authenticated
USING (true);

-- ============================================================
-- UPDATE policies
-- ============================================================

-- Policy 2: Uživatelé mohou upravovat pouze své vlastní statistiky
CREATE POLICY "Users can update own stats"
ON piano.piano_user_stats
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- INSERT policies
-- ============================================================

-- Policy 3: Uživatelé mohou vytvářet pouze své vlastní statistiky
CREATE POLICY "Users can insert own stats"
ON piano.piano_user_stats
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Admin override policies
-- ============================================================

-- Policy 4: Admini mohou dělat cokoliv
CREATE POLICY "Admins can do anything with stats"
ON piano.piano_user_stats
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
-- RLS POLICIES pro piano_users (aby fungoval JOIN v žebříčku)
-- ============================================================

-- Zapnout RLS na piano_users pokud není
ALTER TABLE piano.piano_users ENABLE ROW LEVEL SECURITY;

-- DROP existující policies pokud existují
DROP POLICY IF EXISTS "Users can view all users for leaderboard" ON piano.piano_users;

-- Policy: Všichni přihlášení uživatelé mohou číst jména ostatních (pro žebříček)
CREATE POLICY "Users can view all users for leaderboard"
ON piano.piano_users
FOR SELECT
TO authenticated
USING (true);

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
  AND tablename IN ('piano_user_stats', 'piano_users')
ORDER BY tablename, policyname;
