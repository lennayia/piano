-- ============================================================================
-- Migration: Gamification CRUD System
-- Datum: 2025-12-01
-- Autor: Claude Code
-- Popis: Rozšíření piano_rewards_config o metadata pro plný CRUD + vytvoření piano_level_thresholds
-- ============================================================================

-- Nastavit search_path pro schéma piano
SET search_path TO piano, public;

-- ============================================================================
-- 1. ROZŠÍŘENÍ piano_rewards_config O METADATA PRO CRUD
-- ============================================================================

-- Přidání nových sloupců
DO $$
BEGIN
  -- category - kategorizace pravidel (xp_rule, quiz_bonus, atd.)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'piano'
      AND table_name = 'piano_rewards_config'
      AND column_name = 'category'
  ) THEN
    ALTER TABLE piano.piano_rewards_config
    ADD COLUMN category VARCHAR(50);
    RAISE NOTICE 'Sloupec category přidán';
  END IF;

  -- label - lidsky čitelný název pro UI
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'piano'
      AND table_name = 'piano_rewards_config'
      AND column_name = 'label'
  ) THEN
    ALTER TABLE piano.piano_rewards_config
    ADD COLUMN label VARCHAR(100);
    RAISE NOTICE 'Sloupec label přidán';
  END IF;

  -- icon_type - ikona z Lucide Icons
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'piano'
      AND table_name = 'piano_rewards_config'
      AND column_name = 'icon_type'
  ) THEN
    ALTER TABLE piano.piano_rewards_config
    ADD COLUMN icon_type VARCHAR(50);
    RAISE NOTICE 'Sloupec icon_type přidán';
  END IF;

  -- display_order - pořadí zobrazení
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'piano'
      AND table_name = 'piano_rewards_config'
      AND column_name = 'display_order'
  ) THEN
    ALTER TABLE piano.piano_rewards_config
    ADD COLUMN display_order INTEGER DEFAULT 0;
    RAISE NOTICE 'Sloupec display_order přidán';
  END IF;
END $$;

-- ============================================================================
-- 2. UPDATE EXISTUJÍCÍCH ZÁZNAMŮ - XP PRAVIDLA
-- ============================================================================

UPDATE piano.piano_rewards_config
SET
  category = 'xp_rule',
  label = 'Dokončení lekce',
  icon_type = 'BookOpen',
  display_order = 1
WHERE action_type = 'lesson_completion';

UPDATE piano.piano_rewards_config
SET
  category = 'xp_rule',
  label = 'Správná odpověď v kvízu',
  icon_type = 'Target',
  display_order = 2
WHERE action_type = 'quiz_correct';

UPDATE piano.piano_rewards_config
SET
  category = 'xp_rule',
  label = 'Dokončení písně',
  icon_type = 'Music',
  display_order = 3
WHERE action_type = 'song_completion';

UPDATE piano.piano_rewards_config
SET
  category = 'xp_rule',
  label = 'Dokončení akordové výzvy',
  icon_type = 'Target',
  display_order = 4
WHERE action_type = 'chord_challenge_completion';

UPDATE piano.piano_rewards_config
SET
  category = 'xp_rule',
  label = 'Dokončení denního cíle',
  icon_type = 'Star',
  display_order = 5
WHERE action_type = 'daily_goal_completion';

UPDATE piano.piano_rewards_config
SET
  category = 'xp_rule',
  label = 'Denní přihlášení',
  icon_type = 'Award',
  display_order = 6
WHERE action_type = 'daily_login';

UPDATE piano.piano_rewards_config
SET
  category = 'xp_rule',
  label = 'Odemčení achievementu',
  icon_type = 'Trophy',
  display_order = 7
WHERE action_type = 'achievement_unlock';

-- ============================================================================
-- 3. UPDATE EXISTUJÍCÍCH ZÁZNAMŮ - KVÍZ BONUSY
-- ============================================================================

UPDATE piano.piano_rewards_config
SET
  category = 'quiz_bonus',
  label = 'Perfektní výkon (100%)',
  icon_type = 'Trophy',
  display_order = 1
WHERE action_type = 'quiz_perfect';

UPDATE piano.piano_rewards_config
SET
  category = 'quiz_bonus',
  label = 'Vynikající (80%+)',
  icon_type = 'Star',
  display_order = 2
WHERE action_type = 'quiz_excellent';

UPDATE piano.piano_rewards_config
SET
  category = 'quiz_bonus',
  label = 'Velmi dobře (70%+)',
  icon_type = 'TrendingUp',
  display_order = 3
WHERE action_type = 'quiz_good';

UPDATE piano.piano_rewards_config
SET
  category = 'quiz_bonus',
  label = 'Dobrý začátek (50%+)',
  icon_type = 'Target',
  display_order = 4
WHERE action_type = 'quiz_decent';

-- ============================================================================
-- 4. VYTVOŘENÍ TABULKY piano_level_thresholds
-- ============================================================================

CREATE TABLE IF NOT EXISTS piano.piano_level_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level INTEGER NOT NULL UNIQUE,
  label VARCHAR(50) NOT NULL,
  min_xp INTEGER NOT NULL,
  max_xp INTEGER, -- NULL = neomezené (nejvyšší level)
  icon_type VARCHAR(50),
  icon_color VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pro rychlé vyhledávání podle XP
CREATE INDEX IF NOT EXISTS idx_level_thresholds_xp ON piano.piano_level_thresholds(min_xp, max_xp);

-- ============================================================================
-- 5. RLS POLICIES PRO piano_level_thresholds
-- ============================================================================

ALTER TABLE piano.piano_level_thresholds ENABLE ROW LEVEL SECURITY;

-- Všichni mohou číst aktivní levely
CREATE POLICY "Každý může číst aktivní levely"
ON piano.piano_level_thresholds FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Admini mohou upravovat
CREATE POLICY "Admin může upravovat levely"
ON piano.piano_level_thresholds FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM piano.piano_users
    WHERE piano.piano_users.id = auth.uid()
      AND piano.piano_users.is_admin = true
  )
);

-- Oprávnění
GRANT SELECT, INSERT, UPDATE, DELETE ON piano.piano_level_thresholds TO anon, authenticated;

-- ============================================================================
-- 6. SEED DATA - VÝCHOZÍ LEVELY
-- ============================================================================

INSERT INTO piano.piano_level_thresholds (level, label, min_xp, max_xp, icon_type, icon_color, display_order) VALUES
  (1, 'Začátečník', 0, 99, 'Music', 'secondary', 1),
  (2, 'Učedník', 100, 249, 'BookOpen', 'secondary', 2),
  (3, 'Pokročilý', 250, 499, 'Star', 'secondary', 3),
  (4, 'Expert', 500, 999, 'Award', 'primary', 4),
  (5, 'Mistr', 1000, NULL, 'Crown', 'primary', 5)
ON CONFLICT (level) DO UPDATE SET
  label = EXCLUDED.label,
  min_xp = EXCLUDED.min_xp,
  max_xp = EXCLUDED.max_xp,
  icon_type = EXCLUDED.icon_type,
  icon_color = EXCLUDED.icon_color,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- ============================================================================
-- 7. TRIGGER PRO updated_at
-- ============================================================================

CREATE TRIGGER update_piano_level_thresholds_updated_at
  BEFORE UPDATE ON piano.piano_level_thresholds
  FOR EACH ROW
  EXECUTE FUNCTION piano.update_updated_at_column();

-- ============================================================================
-- 8. OVĚŘENÍ VÝSLEDKŮ
-- ============================================================================

-- Zobraz všechny XP pravidla s novými metadaty
SELECT
  action_type,
  category,
  label,
  xp_value,
  icon_type,
  display_order,
  is_active
FROM piano.piano_rewards_config
WHERE category = 'xp_rule'
ORDER BY display_order;

-- Zobraz všechny bonusy s novými metadaty
SELECT
  action_type,
  category,
  label,
  xp_value,
  icon_type,
  display_order,
  is_active
FROM piano.piano_rewards_config
WHERE category = 'quiz_bonus'
ORDER BY display_order;

-- Zobraz všechny levely
SELECT
  level,
  label,
  min_xp,
  max_xp,
  icon_type,
  icon_color,
  is_active
FROM piano.piano_level_thresholds
ORDER BY level;

-- ============================================================================
-- HOTOVO! ✅
-- ============================================================================

SELECT
  'Migrace 003 dokončena!' AS status,
  'Přidány sloupce do piano_rewards_config + vytvořena tabulka piano_level_thresholds' AS detail;
