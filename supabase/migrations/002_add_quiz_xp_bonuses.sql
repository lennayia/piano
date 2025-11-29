-- Migration: Přidat XP bonusy za dokončení kvízu podle výkonu
-- Datum: 2025-01-29
-- Autor: Claude Code
-- Popis: Přidává konfigurovatelná XP pravidla pro různé úrovně výkonu v kvízech

-- Přidat XP pravidla pro bonusy za dokončení kvízu
INSERT INTO piano.piano_rewards_config (action_type, xp_value, description, is_active) VALUES
  ('quiz_perfect', 100, 'XP bonus za perfektní výkon v kvízu (100%)', true),
  ('quiz_excellent', 75, 'XP bonus za vynikající výkon v kvízu (80%+)', true),
  ('quiz_good', 50, 'XP bonus za velmi dobrý výkon v kvízu (70%+)', true),
  ('quiz_decent', 25, 'XP bonus za dobrý začátek v kvízu (50%+)', true)
ON CONFLICT (action_type) DO UPDATE SET
  xp_value = EXCLUDED.xp_value,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Ověření, že záznamy byly přidány
SELECT action_type, xp_value, description
FROM piano.piano_rewards_config
WHERE action_type LIKE 'quiz_%'
ORDER BY xp_value DESC;
