-- ============================================
-- MIGRACE: Celebration System
-- Datum: 2025-11-30
-- Popis: Přidání confetti_type + doplnění chybějících XP pravidel + RLS policies
-- Schéma: piano
-- ============================================

-- Nastavit search_path pro schéma piano
SET search_path TO piano, public;

-- 1. PŘIDÁNÍ SLOUPCE confetti_type DO piano_achievements
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'piano'
      AND table_name = 'piano_achievements'
      AND column_name = 'confetti_type'
  ) THEN
    ALTER TABLE piano.piano_achievements
    ADD COLUMN confetti_type VARCHAR(20) DEFAULT 'metallic';

    RAISE NOTICE 'Sloupec confetti_type přidán do piano.piano_achievements';
  ELSE
    RAISE NOTICE 'Sloupec confetti_type už existuje v piano.piano_achievements';
  END IF;
END $$;

-- 2. PŘIDÁNÍ CHYBĚJÍCÍCH XP PRAVIDEL
-- ============================================
-- POZNÁMKA: Používá INSERT ... ON CONFLICT DO NOTHING
-- = přidá jen nová pravidla, NEPŘEPÍŠE existující!

INSERT INTO piano.piano_rewards_config (action_type, xp_value, description, is_active, created_at, updated_at)
VALUES
  -- XP za jednotlivou správnou odpověď v kvízu (používá se: score × quiz_correct + bonus)
  ('quiz_correct', 5, 'XP za jednu správnou odpověď v kvízu', true, NOW(), NOW()),

  -- XP za zahranou píseň
  ('song_completion', 15, 'XP za dokončení písně', true, NOW(), NOW()),

  -- XP za odemčený achievement
  ('achievement_unlock', 20, 'XP za odemčený achievement', true, NOW(), NOW())
ON CONFLICT (action_type) DO NOTHING;

-- 3. PŘIDÁNÍ RLS POLICY PRO ADMIN ZÁPIS DO piano_rewards_config
-- ============================================

-- Odstranit starou policy, pokud existuje
DROP POLICY IF EXISTS "Admin může upravovat rewards config" ON piano.piano_rewards_config;

-- Vytvořit novou policy pro admin zápis (INSERT, UPDATE, DELETE)
CREATE POLICY "Admin může upravovat rewards config"
ON piano.piano_rewards_config
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM piano.piano_users
    WHERE piano.piano_users.id = auth.uid()
      AND piano.piano_users.email = ((current_setting('request.jwt.claims'::text))::json->>'email')
  )
);

-- 4. KONTROLA VÝSLEDKŮ
-- ============================================

-- Zobraz VŠECHNA XP pravidla (včetně nově přidaných)
SELECT
  action_type,
  xp_value,
  description,
  is_active,
  created_at
FROM piano.piano_rewards_config
ORDER BY
  CASE action_type
    WHEN 'lesson_completion' THEN 1
    WHEN 'quiz_correct' THEN 2
    WHEN 'quiz_completion' THEN 3
    WHEN 'quiz_perfect' THEN 4
    WHEN 'quiz_excellent' THEN 5
    WHEN 'quiz_good' THEN 6
    WHEN 'quiz_decent' THEN 7
    WHEN 'song_completion' THEN 8
    WHEN 'achievement_unlock' THEN 9
    WHEN 'daily_login' THEN 10
    ELSE 99
  END;

-- Zkontroluj, že confetti_type byl přidán
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'piano'
  AND table_name = 'piano_achievements'
  AND column_name = 'confetti_type';

-- Zobraz všechny celebration sloupce v achievements
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'piano'
  AND table_name = 'piano_achievements'
  AND column_name IN ('confetti_type', 'icon_type', 'icon_color', 'celebration_sound')
ORDER BY column_name;

-- Zobraz RLS policies pro piano_rewards_config
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'piano'
  AND tablename = 'piano_rewards_config'
ORDER BY policyname;

-- Hotovo!
SELECT
  'Migrace dokončena!' AS status,
  'Přidán sloupec confetti_type, 3 nová XP pravidla a admin policy' AS detail;
