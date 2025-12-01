-- Aktualizace CHECK constraint pro nové typy requirement_type
-- Created: 2025-11-30
-- Schema: piano
-- Přidává: 'daily_goals_completed', 'daily_goal_streak'

-- 1. Odstranit starý constraint (pokud existuje)
ALTER TABLE piano.piano_achievements
DROP CONSTRAINT IF EXISTS piano_achievements_requirement_type_check;

-- 2. Přidat nový constraint s rozšířenými hodnotami
ALTER TABLE piano.piano_achievements
ADD CONSTRAINT piano_achievements_requirement_type_check
CHECK (requirement_type IN (
  'lessons_completed',
  'streak',
  'xp',
  'custom',
  'daily_goals_completed',  -- Nový: Počet splněných denních cílů celkem
  'daily_goal_streak',      -- Nový: Počet dní v řadě se splněným denním cílem
  'global'                  -- Pro achievements, které se mají odemknout okamžitě
));

-- 3. Komentář
COMMENT ON CONSTRAINT piano_achievements_requirement_type_check ON piano.piano_achievements
IS 'Povolené typy požadavků pro achievements, včetně denních cílů';
