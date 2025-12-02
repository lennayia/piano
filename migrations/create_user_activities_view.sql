-- Migration: Create user_activities view
-- Účel: Sjednotit všechny aktivity uživatelů z různých tabulek do jednoho view
-- Použití: Admin historie, dashboardy, reporting
-- Poznámka: Tabulky jsou ve schématu 'piano', ne 'public'

CREATE OR REPLACE VIEW piano.user_activities AS

-- Písně (NEMÁ xp_earned - použijeme výchozí hodnotu 100)
SELECT
  CONCAT('song-', psc.id::text) as id,
  'song' as type,
  psc.song_title as title,
  CASE
    WHEN psc.is_perfect THEN '🎯 Perfektní!'
    WHEN psc.mistakes_count > 0 THEN CONCAT(psc.mistakes_count::text, ' chyb')
    ELSE NULL
  END as subtitle,
  psc.completed_at as date,
  100 as xp,
  psc.is_perfect,
  psc.mistakes_count,
  'Music' as icon,
  FALSE as is_special,
  psc.user_id,
  pu.first_name,
  pu.last_name,
  pu.email
FROM piano.piano_song_completions psc
JOIN piano.piano_users pu ON psc.user_id = pu.id

UNION ALL

-- Kvízy - piano_quiz_scores (NEMÁ xp_earned - vypočítáme jako score * 5)
SELECT
  CONCAT('quiz-scores-', pqs.id::text) as id,
  'quiz' as type,
  CASE pqs.quiz_type
    WHEN 'chord_practice' THEN 'Cvičení akordů'
    WHEN 'chord_quiz' THEN 'Poznáte akord?'
    WHEN 'theory' THEN 'Kvíz: Hudební teorie'
    WHEN 'interval' THEN 'Kvíz: Intervaly'
    WHEN 'scale' THEN 'Kvíz: Stupnice'
    WHEN 'rhythm' THEN 'Kvíz: Rytmus'
    WHEN 'mixed' THEN 'Kvíz: Mix'
    ELSE 'Kvíz'
  END as title,
  CONCAT(pqs.score::text, '/', pqs.total_questions::text) as subtitle,
  pqs.completed_at as date,
  pqs.score * 5 as xp,
  NULL as is_perfect,
  NULL as mistakes_count,
  'Gamepad2' as icon,
  FALSE as is_special,
  pqs.user_id,
  pu.first_name,
  pu.last_name,
  pu.email
FROM piano.piano_quiz_scores pqs
JOIN piano.piano_users pu ON pqs.user_id = pu.id

UNION ALL

-- Kvízy - piano_quiz_completions (stará tabulka, MÁ xp_earned)
SELECT
  CONCAT('quiz-old-', pqc.id::text) as id,
  'quiz' as type,
  COALESCE(pqc.quiz_name, 'Poznáte akord?') as title,
  CONCAT(pqc.score::text, '/', pqc.total_questions::text) as subtitle,
  pqc.completed_at as date,
  COALESCE(pqc.xp_earned, 50) as xp,
  pqc.is_perfect,
  NULL as mistakes_count,
  'Gamepad2' as icon,
  FALSE as is_special,
  pqc.user_id,
  pu.first_name,
  pu.last_name,
  pu.email
FROM piano.piano_quiz_completions pqc
JOIN piano.piano_users pu ON pqc.user_id = pu.id

UNION ALL

-- Kvíz: Intervaly
SELECT
  CONCAT('quiz-interval-', pqic.id::text) as id,
  'quiz' as type,
  'Kvíz: Intervaly' as title,
  CASE WHEN pqic.is_correct THEN '✓ Správně' ELSE '✗ Špatně' END as subtitle,
  pqic.completed_at as date,
  CASE WHEN pqic.is_correct THEN 10 ELSE 0 END as xp,
  pqic.is_correct as is_perfect,
  NULL as mistakes_count,
  'Gamepad2' as icon,
  FALSE as is_special,
  pqic.user_id,
  pu.first_name,
  pu.last_name,
  pu.email
FROM piano.piano_quiz_interval_completions pqic
JOIN piano.piano_users pu ON pqic.user_id = pu.id

UNION ALL

-- Kvíz: Mix
SELECT
  CONCAT('quiz-mixed-', pqmc.id::text) as id,
  'quiz' as type,
  'Kvíz: Mix' as title,
  CASE WHEN pqmc.is_correct THEN '✓ Správně' ELSE '✗ Špatně' END as subtitle,
  pqmc.completed_at as date,
  CASE WHEN pqmc.is_correct THEN 10 ELSE 0 END as xp,
  pqmc.is_correct as is_perfect,
  NULL as mistakes_count,
  'Gamepad2' as icon,
  FALSE as is_special,
  pqmc.user_id,
  pu.first_name,
  pu.last_name,
  pu.email
FROM piano.piano_quiz_mixed_completions pqmc
JOIN piano.piano_users pu ON pqmc.user_id = pu.id

UNION ALL

-- Kvíz: Rytmus
SELECT
  CONCAT('quiz-rhythm-', pqrc.id::text) as id,
  'quiz' as type,
  'Kvíz: Rytmus' as title,
  CASE WHEN pqrc.is_correct THEN '✓ Správně' ELSE '✗ Špatně' END as subtitle,
  pqrc.completed_at as date,
  CASE WHEN pqrc.is_correct THEN 10 ELSE 0 END as xp,
  pqrc.is_correct as is_perfect,
  NULL as mistakes_count,
  'Gamepad2' as icon,
  FALSE as is_special,
  pqrc.user_id,
  pu.first_name,
  pu.last_name,
  pu.email
FROM piano.piano_quiz_rhythm_completions pqrc
JOIN piano.piano_users pu ON pqrc.user_id = pu.id

UNION ALL

-- Kvíz: Stupnice
SELECT
  CONCAT('quiz-scale-', pqsc.id::text) as id,
  'quiz' as type,
  'Kvíz: Stupnice' as title,
  CASE WHEN pqsc.is_correct THEN '✓ Správně' ELSE '✗ Špatně' END as subtitle,
  pqsc.completed_at as date,
  CASE WHEN pqsc.is_correct THEN 10 ELSE 0 END as xp,
  pqsc.is_correct as is_perfect,
  NULL as mistakes_count,
  'Gamepad2' as icon,
  FALSE as is_special,
  pqsc.user_id,
  pu.first_name,
  pu.last_name,
  pu.email
FROM piano.piano_quiz_scale_completions pqsc
JOIN piano.piano_users pu ON pqsc.user_id = pu.id

UNION ALL

-- Kvíz: Hudební teorie
SELECT
  CONCAT('quiz-theory-', pqtc.id::text) as id,
  'quiz' as type,
  'Kvíz: Hudební teorie' as title,
  CASE WHEN pqtc.is_correct THEN '✓ Správně' ELSE '✗ Špatně' END as subtitle,
  pqtc.completed_at as date,
  CASE WHEN pqtc.is_correct THEN 10 ELSE 0 END as xp,
  pqtc.is_correct as is_perfect,
  NULL as mistakes_count,
  'Gamepad2' as icon,
  FALSE as is_special,
  pqtc.user_id,
  pu.first_name,
  pu.last_name,
  pu.email
FROM piano.piano_quiz_theory_completions pqtc
JOIN piano.piano_users pu ON pqtc.user_id = pu.id

UNION ALL

-- Lekce (MÁ xp_earned)
SELECT
  CONCAT('lesson-', plc.id::text) as id,
  'lesson' as type,
  COALESCE(plc.lesson_title, 'Lekce') as title,
  NULL as subtitle,
  plc.completed_at as date,
  COALESCE(plc.xp_earned, 50) as xp,
  NULL as is_perfect,
  NULL as mistakes_count,
  'Book' as icon,
  FALSE as is_special,
  plc.user_id,
  pu.first_name,
  pu.last_name,
  pu.email
FROM piano.piano_lesson_completions plc
JOIN piano.piano_users pu ON plc.user_id = pu.id

UNION ALL

-- Denní cíle (MÁ xp_earned)
SELECT
  CONCAT('daily-goal-', pdgc.id::text) as id,
  'daily_goal' as type,
  '🎯 Denní cíl splněn!' as title,
  CONCAT(pdgc.completed_count::text, ' ',
    CASE pdgc.goal_type
      WHEN 'lessons' THEN 'lekcí'
      WHEN 'songs' THEN 'písní'
      WHEN 'quizzes' THEN 'kvízů'
      WHEN 'harmonizations' THEN 'harmonizací'
      ELSE 'aktivit'
    END
  ) as subtitle,
  pdgc.completed_at as date,
  COALESCE(pdgc.xp_earned, 50) as xp,
  NULL as is_perfect,
  NULL as mistakes_count,
  'Trophy' as icon,
  TRUE as is_special,
  pdgc.user_id,
  pu.first_name,
  pu.last_name,
  pu.email
FROM piano.piano_daily_goal_completions pdgc
JOIN piano.piano_users pu ON pdgc.user_id = pu.id;

-- Grant přístup pro authenticated users
GRANT SELECT ON piano.user_activities TO authenticated;

-- Komentář
COMMENT ON VIEW piano.user_activities IS 'Sjednocený pohled na všechny aktivity uživatelů (písně, kvízy všech typů, lekce, denní cíle)';
