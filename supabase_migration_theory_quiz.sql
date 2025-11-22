-- Migration: Theory Quiz Tables
-- Vytvoření tabulek pro teoretický kvíz
-- Spustit v Supabase SQL editoru

-- 1. Tabulka teoretických otázek
CREATE TABLE IF NOT EXISTS piano.piano_quiz_theory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,                        -- Text otázky
  difficulty VARCHAR(20) NOT NULL DEFAULT 'easy', -- Obtížnost: easy, medium, hard
  is_active BOOLEAN NOT NULL DEFAULT true,       -- Zda je otázka aktivní
  display_order INTEGER NOT NULL DEFAULT 0,      -- Pořadí zobrazení
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES piano.piano_users(id),

  CONSTRAINT valid_difficulty CHECK (difficulty IN ('easy', 'medium', 'hard'))
);

-- 2. Tabulka možností odpovědí pro teoretické otázky
CREATE TABLE IF NOT EXISTS piano.piano_quiz_theory_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES piano.piano_quiz_theory(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,                     -- Text možnosti
  is_correct BOOLEAN NOT NULL DEFAULT false,     -- Zda je toto správná odpověď
  display_order INTEGER NOT NULL DEFAULT 1,      -- Pořadí zobrazení (1-4)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_display_order CHECK (display_order >= 1 AND display_order <= 4)
);

-- 3. Tabulka pro sledování dokončení teoretických kvízů
CREATE TABLE IF NOT EXISTS piano.piano_quiz_theory_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES piano.piano_users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES piano.piano_quiz_theory(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES piano.piano_quiz_theory_options(id) ON DELETE SET NULL,
  is_correct BOOLEAN NOT NULL,                   -- Zda uživatel odpověděl správně
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Index pro rychlé vyhledávání
  CONSTRAINT unique_user_question_completion UNIQUE (user_id, question_id, completed_at)
);

-- Indexy pro optimalizaci
CREATE INDEX IF NOT EXISTS idx_theory_quiz_difficulty ON piano.piano_quiz_theory(difficulty);
CREATE INDEX IF NOT EXISTS idx_theory_quiz_active ON piano.piano_quiz_theory(is_active);
CREATE INDEX IF NOT EXISTS idx_theory_quiz_order ON piano.piano_quiz_theory(display_order);
CREATE INDEX IF NOT EXISTS idx_theory_options_question ON piano.piano_quiz_theory_options(question_id);
CREATE INDEX IF NOT EXISTS idx_theory_completions_user ON piano.piano_quiz_theory_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_theory_completions_question ON piano.piano_quiz_theory_completions(question_id);

-- RLS (Row Level Security) policies
ALTER TABLE piano.piano_quiz_theory ENABLE ROW LEVEL SECURITY;
ALTER TABLE piano.piano_quiz_theory_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE piano.piano_quiz_theory_completions ENABLE ROW LEVEL SECURITY;

-- Policy pro čtení otázek - všichni mohou číst aktivní otázky
CREATE POLICY "Anyone can read active theory questions" ON piano.piano_quiz_theory
  FOR SELECT USING (is_active = true OR auth.uid() IN (
    SELECT id FROM piano.piano_users WHERE is_admin = true
  ));

-- Policy pro vytváření otázek - pouze admini
CREATE POLICY "Only admins can insert theory questions" ON piano.piano_quiz_theory
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM piano.piano_users WHERE is_admin = true)
  );

-- Policy pro úpravu otázek - pouze admini
CREATE POLICY "Only admins can update theory questions" ON piano.piano_quiz_theory
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM piano.piano_users WHERE is_admin = true)
  );

-- Policy pro mazání otázek - pouze admini
CREATE POLICY "Only admins can delete theory questions" ON piano.piano_quiz_theory
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM piano.piano_users WHERE is_admin = true)
  );

-- Policy pro čtení možností - všichni mohou číst
CREATE POLICY "Anyone can read theory options" ON piano.piano_quiz_theory_options
  FOR SELECT USING (true);

-- Policy pro vytváření možností - pouze admini
CREATE POLICY "Only admins can insert theory options" ON piano.piano_quiz_theory_options
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM piano.piano_users WHERE is_admin = true)
  );

-- Policy pro úpravu možností - pouze admini
CREATE POLICY "Only admins can update theory options" ON piano.piano_quiz_theory_options
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM piano.piano_users WHERE is_admin = true)
  );

-- Policy pro mazání možností - pouze admini
CREATE POLICY "Only admins can delete theory options" ON piano.piano_quiz_theory_options
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM piano.piano_users WHERE is_admin = true)
  );

-- Policy pro čtení dokončení - každý vidí pouze své
CREATE POLICY "Users can read own theory completions" ON piano.piano_quiz_theory_completions
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM piano.piano_users WHERE is_admin = true
  ));

-- Policy pro vytváření dokončení - každý může vytvářet své vlastní
CREATE POLICY "Users can insert own theory completions" ON piano.piano_quiz_theory_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy pro úpravu dokončení - nikdo nemůže upravovat
-- (dokončení jsou immutable)

-- Policy pro mazání dokončení - pouze admini
CREATE POLICY "Only admins can delete theory completions" ON piano.piano_quiz_theory_completions
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM piano.piano_users WHERE is_admin = true)
  );

-- Trigger pro aktualizaci updated_at
CREATE OR REPLACE FUNCTION piano.update_theory_quiz_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER theory_quiz_updated_at
  BEFORE UPDATE ON piano.piano_quiz_theory
  FOR EACH ROW
  EXECUTE FUNCTION piano.update_theory_quiz_updated_at();

-- Testovací data (příklady teoretických otázek)
INSERT INTO piano.piano_quiz_theory (question, difficulty, is_active, display_order)
VALUES
  ('Kolik čar má notová osnova?', 'easy', true, 1),
  ('Který akord obsahuje tóny C, E, G?', 'easy', true, 2),
  ('Co znamená tempo "Allegro"?', 'medium', true, 3),
  ('Jaký je rozdíl mezi durovou a mollovou stupnicí?', 'hard', true, 4);

-- Možnosti odpovědí pro první otázku "Kolik čar má notová osnova?"
INSERT INTO piano.piano_quiz_theory_options (question_id, option_text, is_correct, display_order)
SELECT
  id,
  unnest(ARRAY['4 čáry', '5 čar', '6 čar', '7 čar']),
  unnest(ARRAY[false, true, false, false]),
  unnest(ARRAY[1, 2, 3, 4])
FROM piano.piano_quiz_theory
WHERE question = 'Kolik čar má notová osnova?';

-- Možnosti odpovědí pro druhou otázku "Který akord obsahuje tóny C, E, G?"
INSERT INTO piano.piano_quiz_theory_options (question_id, option_text, is_correct, display_order)
SELECT
  id,
  unnest(ARRAY['C dur', 'C moll', 'G dur', 'F dur']),
  unnest(ARRAY[true, false, false, false]),
  unnest(ARRAY[1, 2, 3, 4])
FROM piano.piano_quiz_theory
WHERE question = 'Který akord obsahuje tóny C, E, G?';

-- Možnosti odpovědí pro třetí otázku "Co znamená tempo 'Allegro'?"
INSERT INTO piano.piano_quiz_theory_options (question_id, option_text, is_correct, display_order)
SELECT
  id,
  unnest(ARRAY['Velmi pomalu', 'Pomalu', 'Rychle', 'Velmi rychle']),
  unnest(ARRAY[false, false, true, false]),
  unnest(ARRAY[1, 2, 3, 4])
FROM piano.piano_quiz_theory
WHERE question = 'Co znamená tempo "Allegro"?';

-- Možnosti odpovědí pro čtvrtou otázku "Jaký je rozdíl mezi durovou a mollovou stupnicí?"
INSERT INTO piano.piano_quiz_theory_options (question_id, option_text, is_correct, display_order)
SELECT
  id,
  unnest(ARRAY['První stupeň', 'Druhý stupeň', 'Třetí stupeň', 'Čtvrtý stupeň']),
  unnest(ARRAY[false, false, true, false]),
  unnest(ARRAY[1, 2, 3, 4])
FROM piano.piano_quiz_theory
WHERE question = 'Jaký je rozdíl mezi durovou a mollovou stupnicí?';
