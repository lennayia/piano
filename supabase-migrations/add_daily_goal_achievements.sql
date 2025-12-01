-- Přidat výchozí achievements pro denní cíle
-- Created: 2025-11-30
-- Schema: piano
-- POZOR: Tyto achievements jsou EDITOVATELNÉ přes admin panel!

-- 1. První denní cíl
INSERT INTO piano.piano_achievements (
  title,
  description,
  icon_type,
  icon_color,
  xp_reward,
  requirement_type,
  requirement_value,
  confetti_type,
  celebration_sound,
  is_active
) VALUES (
  'První denní cíl',
  'Splň svůj první denní cíl a získej bonus!',
  'Target',
  'primary',
  100,
  'daily_goals_completed',
  1,
  'golden',
  'achievement',
  true
) ON CONFLICT DO NOTHING;

-- 2. Týdenní warrior (7 dní v řadě)
INSERT INTO piano.piano_achievements (
  title,
  description,
  icon_type,
  icon_color,
  xp_reward,
  requirement_type,
  requirement_value,
  confetti_type,
  celebration_sound,
  is_active
) VALUES (
  'Týdenní warrior 🔥',
  'Splň denní cíl 7 dní v řadě!',
  'Flame',
  'danger',
  500,
  'daily_goal_streak',
  7,
  'rainbow',
  'fanfare',
  true
) ON CONFLICT DO NOTHING;

-- 3. Měsíční legenda (30 dní v řadě)
INSERT INTO piano.piano_achievements (
  title,
  description,
  icon_type,
  icon_color,
  xp_reward,
  requirement_type,
  requirement_value,
  confetti_type,
  celebration_sound,
  is_active
) VALUES (
  'Měsíční legenda 💎',
  'Splň denní cíl 30 dní v řadě - absolutní mistr!',
  'Crown',
  'accent',
  2000,
  'daily_goal_streak',
  30,
  'rainbow',
  'fanfare',
  true
) ON CONFLICT DO NOTHING;

-- 4. Denní cíl - veterán (splnit 10x)
INSERT INTO piano.piano_achievements (
  title,
  description,
  icon_type,
  icon_color,
  xp_reward,
  requirement_type,
  requirement_value,
  confetti_type,
  celebration_sound,
  is_active
) VALUES (
  'Veterán denních cílů',
  'Splň celkem 10 denních cílů',
  'Star',
  'secondary',
  300,
  'daily_goals_completed',
  10,
  'stars',
  'achievement',
  true
) ON CONFLICT DO NOTHING;

-- 5. Denní cíl - mistr (splnit 50x)
INSERT INTO piano.piano_achievements (
  title,
  description,
  icon_type,
  icon_color,
  xp_reward,
  requirement_type,
  requirement_value,
  confetti_type,
  celebration_sound,
  is_active
) VALUES (
  'Mistr denních cílů 🏆',
  'Splň celkem 50 denních cílů!',
  'Trophy',
  'primary',
  1000,
  'daily_goals_completed',
  50,
  'golden',
  'fanfare',
  true
) ON CONFLICT DO NOTHING;

-- POZNÁMKA: Tyto achievements můžeš upravovat v admin panelu:
-- - Změnit název, popis
-- - Změnit ikonu, barvu
-- - Změnit XP odměnu
-- - Změnit typ konfet, zvuku
-- - Deaktivovat/aktivovat
-- - Změnit požadavky (hodnoty)
