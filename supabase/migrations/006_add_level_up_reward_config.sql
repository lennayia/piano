-- Migration: Add level-up reward config
-- Date: 2025-01-25
-- Description: Přidání výchozího level-up configu do rewards_config

-- Nastavit search_path pro schéma piano
SET search_path TO piano, public;

-- Přidat sloupec icon_color, pokud neexistuje
ALTER TABLE piano.piano_rewards_config
ADD COLUMN IF NOT EXISTS icon_color VARCHAR(50) DEFAULT 'primary';

COMMENT ON COLUMN piano.piano_rewards_config.icon_color IS 'Barva ikony (primary, secondary, success, warning, error)';

-- Přidat výchozí level-up konfiguraci
INSERT INTO piano.piano_rewards_config (
  action_type,
  category,
  label,
  description,
  xp_value,
  icon_type,
  icon_color,
  celebration_sound,
  confetti_type,
  display_order,
  is_active
) VALUES (
  'level_up',
  'milestone',
  'Level Up!',
  'Výchozí oslava při dosažení nového levelu',
  0,
  'Star',
  'primary',
  'achievement',
  'rainbow',
  1000,
  true
)
ON CONFLICT (action_type) DO NOTHING;

-- Přidat komentář
COMMENT ON COLUMN piano.piano_rewards_config.category IS 'Kategorie odměny (xp_rule, quiz_bonus, milestone)';
