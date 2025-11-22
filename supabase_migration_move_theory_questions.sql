-- ============================================================
-- Přesun obecných teoretických otázek do nové tabulky
-- ============================================================
-- Vytvoříme novou tabulku piano_quiz_theory pro obecné teoretické otázky
-- (které nejsou vázané na konkrétní akordy)
-- a přesuneme tam otázky z piano_quiz_chords, které tam nepatří
-- ============================================================

-- 1. Vytvoříme novou tabulku pro obecné teoretické otázky
CREATE TABLE IF NOT EXISTS piano.piano_quiz_theory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  question_text TEXT NOT NULL,
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Vytvoříme tabulku pro odpovědi k teoretickým otázkám
CREATE TABLE IF NOT EXISTS piano.piano_quiz_theory_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theory_question_id UUID REFERENCES piano.piano_quiz_theory(id) ON DELETE CASCADE,
  option_name TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Přesuneme obecné teoretické otázky z piano_quiz_chords do piano_quiz_theory
-- (otázky, které nemají noty a nejsou o konkrétních akordech)
INSERT INTO piano.piano_quiz_theory (id, name, question_text, category, difficulty, is_active, display_order, created_at, updated_at)
SELECT
  id,
  name,
  COALESCE(name, 'Teoretická otázka') as question_text,
  category,
  difficulty,
  is_active,
  display_order,
  created_at,
  updated_at
FROM piano.piano_quiz_chords
WHERE quiz_type = 'theory'
  AND (notes IS NULL OR notes::text = '[]')
  AND name NOT LIKE '%dur'
  AND name NOT LIKE '%moll'
  AND name NOT LIKE '%dim'
  AND name NOT LIKE '%aug';

-- 4. Přesuneme odpovědi k těmto otázkám
INSERT INTO piano.piano_quiz_theory_options (id, theory_question_id, option_name, is_correct, display_order, created_at)
SELECT
  opt.id,
  opt.chord_id as theory_question_id,
  opt.option_name,
  opt.is_correct,
  opt.display_order,
  opt.created_at
FROM piano.piano_quiz_chord_options opt
WHERE opt.chord_id IN (
  SELECT id FROM piano.piano_quiz_chords
  WHERE quiz_type = 'theory'
    AND (notes IS NULL OR notes::text = '[]')
    AND name NOT LIKE '%dur'
    AND name NOT LIKE '%moll'
    AND name NOT LIKE '%dim'
    AND name NOT LIKE '%aug'
);

-- 5. Smažeme přesunuté otázky z piano_quiz_chords
DELETE FROM piano.piano_quiz_chords
WHERE quiz_type = 'theory'
  AND (notes IS NULL OR notes::text = '[]')
  AND name NOT LIKE '%dur'
  AND name NOT LIKE '%moll'
  AND name NOT LIKE '%dim'
  AND name NOT LIKE '%aug';

-- 6. Nastavíme RLS policies pro nové tabulky
ALTER TABLE piano.piano_quiz_theory ENABLE ROW LEVEL SECURITY;
ALTER TABLE piano.piano_quiz_theory_options ENABLE ROW LEVEL SECURITY;

-- Všichni mohou číst
CREATE POLICY "Anyone can read theory questions"
ON piano.piano_quiz_theory FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can read theory options"
ON piano.piano_quiz_theory_options FOR SELECT
TO authenticated
USING (true);

-- Jen admini mohou upravovat
CREATE POLICY "Admins can manage theory questions"
ON piano.piano_quiz_theory FOR ALL
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

CREATE POLICY "Admins can manage theory options"
ON piano.piano_quiz_theory_options FOR ALL
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

-- 7. Ověření - zobrazíme co zůstalo v piano_quiz_chords (měly by být jen akordy)
SELECT
  id,
  name,
  quiz_type,
  CASE
    WHEN notes IS NULL THEN 'NULL'
    WHEN notes::text = '[]' THEN 'prázdné'
    ELSE 'má noty'
  END as notes_status,
  category,
  difficulty
FROM piano.piano_quiz_chords
ORDER BY name;

-- 8. Zobrazíme co je v nové tabulce piano_quiz_theory
SELECT
  id,
  name,
  question_text,
  category,
  difficulty
FROM piano.piano_quiz_theory
ORDER BY name;
