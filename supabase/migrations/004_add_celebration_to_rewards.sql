-- Migration: Add celebration fields to rewards_config
-- Date: 2025-01-25
-- Description: Přidání sloupců pro oslavy do piano_rewards_config

-- Nastavit search_path pro schéma piano
SET search_path TO piano, public;

-- Přidat sloupce celebration_sound a confetti_type
ALTER TABLE piano.piano_rewards_config
ADD COLUMN IF NOT EXISTS celebration_sound VARCHAR(50) DEFAULT 'success',
ADD COLUMN IF NOT EXISTS confetti_type VARCHAR(50) DEFAULT 'metallic';

-- Přidat komentáře
COMMENT ON COLUMN piano.piano_rewards_config.celebration_sound IS 'Zvuk oslavy (achievement, fanfare, success, applause, cheer)';
COMMENT ON COLUMN piano.piano_rewards_config.confetti_type IS 'Typ konfet (golden, rainbow, pink, blue, metallic, stars, minimal)';

-- Nastavit výchozí hodnoty pro existující záznamy podle kategorie
UPDATE piano.piano_rewards_config
SET
  celebration_sound = CASE
    WHEN category = 'xp_rule' AND action_type LIKE '%lesson%' THEN 'success'
    WHEN category = 'xp_rule' AND action_type LIKE '%song%' THEN 'fanfare'
    WHEN category = 'xp_rule' AND action_type LIKE '%quiz%' THEN 'achievement'
    WHEN category = 'quiz_bonus' AND action_type = 'quiz_perfect' THEN 'fanfare'
    WHEN category = 'quiz_bonus' AND action_type = 'quiz_excellent' THEN 'achievement'
    WHEN category = 'quiz_bonus' THEN 'success'
    ELSE 'success'
  END,
  confetti_type = CASE
    WHEN category = 'xp_rule' AND action_type LIKE '%lesson%' THEN 'blue'
    WHEN category = 'xp_rule' AND action_type LIKE '%song%' THEN 'rainbow'
    WHEN category = 'xp_rule' AND action_type LIKE '%quiz%' THEN 'golden'
    WHEN category = 'quiz_bonus' AND action_type = 'quiz_perfect' THEN 'golden'
    WHEN category = 'quiz_bonus' AND action_type = 'quiz_excellent' THEN 'rainbow'
    WHEN category = 'quiz_bonus' THEN 'blue'
    ELSE 'metallic'
  END
WHERE celebration_sound IS NULL OR confetti_type IS NULL;
