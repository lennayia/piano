-- ============================================================
-- Obnovení původních teoretických otázek
-- ============================================================
-- Tento SQL obnoví teoretické otázky, které byly omylem smazány
-- Spustit v Supabase SQL editoru
-- ============================================================

-- 1. Vytvoření tabulky pro teoretické otázky (pokud neexistuje)
CREATE TABLE IF NOT EXISTS piano.piano_quiz_theory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'easy',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES piano.piano_users(id),

  CONSTRAINT valid_difficulty CHECK (difficulty IN ('easy', 'medium', 'hard'))
);

-- 2. Vytvoření tabulky pro odpovědi (pokud neexistuje)
CREATE TABLE IF NOT EXISTS piano.piano_quiz_theory_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theory_question_id UUID NOT NULL REFERENCES piano.piano_quiz_theory(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_display_order CHECK (display_order >= 1 AND display_order <= 4)
);

-- 3. Vytvoření tabulky pro completions (pokud neexistuje)
CREATE TABLE IF NOT EXISTS piano.piano_quiz_theory_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES piano.piano_users(id) ON DELETE CASCADE,
  theory_question_id UUID NOT NULL REFERENCES piano.piano_quiz_theory(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES piano.piano_quiz_theory_options(id) ON DELETE SET NULL,
  is_correct BOOLEAN NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_user_question_completion UNIQUE (user_id, theory_question_id, completed_at)
);

-- 4. Indexy
CREATE INDEX IF NOT EXISTS idx_theory_quiz_difficulty ON piano.piano_quiz_theory(difficulty);
CREATE INDEX IF NOT EXISTS idx_theory_quiz_active ON piano.piano_quiz_theory(is_active);
CREATE INDEX IF NOT EXISTS idx_theory_quiz_order ON piano.piano_quiz_theory(display_order);
CREATE INDEX IF NOT EXISTS idx_theory_options_question ON piano.piano_quiz_theory_options(theory_question_id);
CREATE INDEX IF NOT EXISTS idx_theory_completions_user ON piano.piano_quiz_theory_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_theory_completions_question ON piano.piano_quiz_theory_completions(theory_question_id);

-- 5. RLS policies
ALTER TABLE piano.piano_quiz_theory ENABLE ROW LEVEL SECURITY;
ALTER TABLE piano.piano_quiz_theory_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE piano.piano_quiz_theory_completions ENABLE ROW LEVEL SECURITY;

-- Smazat staré policies (pokud existují)
DROP POLICY IF EXISTS "Anyone can read active theory questions" ON piano.piano_quiz_theory;
DROP POLICY IF EXISTS "Only admins can insert theory questions" ON piano.piano_quiz_theory;
DROP POLICY IF EXISTS "Only admins can update theory questions" ON piano.piano_quiz_theory;
DROP POLICY IF EXISTS "Only admins can delete theory questions" ON piano.piano_quiz_theory;
DROP POLICY IF EXISTS "Anyone can read theory options" ON piano.piano_quiz_theory_options;
DROP POLICY IF EXISTS "Only admins can insert theory options" ON piano.piano_quiz_theory_options;
DROP POLICY IF EXISTS "Only admins can update theory options" ON piano.piano_quiz_theory_options;
DROP POLICY IF EXISTS "Only admins can delete theory options" ON piano.piano_quiz_theory_options;
DROP POLICY IF EXISTS "Users can read own theory completions" ON piano.piano_quiz_theory_completions;
DROP POLICY IF EXISTS "Users can insert own theory completions" ON piano.piano_quiz_theory_completions;
DROP POLICY IF EXISTS "Only admins can delete theory completions" ON piano.piano_quiz_theory_completions;

-- PUBLIC políčky pro čtení (normální uživatelé nejsou authenticated)
CREATE POLICY "Anyone can read active theory questions" ON piano.piano_quiz_theory
  FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Anyone can read theory options" ON piano.piano_quiz_theory_options
  FOR SELECT TO public USING (true);

-- AUTHENTICATED políčky pro adminy
CREATE POLICY "Only admins can insert theory questions" ON piano.piano_quiz_theory
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Only admins can update theory questions" ON piano.piano_quiz_theory
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Only admins can delete theory questions" ON piano.piano_quiz_theory
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Only admins can insert theory options" ON piano.piano_quiz_theory_options
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Only admins can update theory options" ON piano.piano_quiz_theory_options
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Only admins can delete theory options" ON piano.piano_quiz_theory_options
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = true)
  );

-- Completions policies (až budou potřeba)
CREATE POLICY "Users can read own theory completions" ON piano.piano_quiz_theory_completions
  FOR SELECT TO authenticated USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Users can insert own theory completions" ON piano.piano_quiz_theory_completions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can delete theory completions" ON piano.piano_quiz_theory_completions
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM piano.piano_users WHERE id = auth.uid() AND is_admin = true)
  );

-- 6. Trigger pro updated_at
CREATE OR REPLACE FUNCTION piano.update_theory_quiz_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS theory_quiz_updated_at ON piano.piano_quiz_theory;
CREATE TRIGGER theory_quiz_updated_at
  BEFORE UPDATE ON piano.piano_quiz_theory
  FOR EACH ROW
  EXECUTE FUNCTION piano.update_theory_quiz_updated_at();

-- 7. OBNOVENÍ PŮVODNÍCH TEORETICKÝCH OTÁZEK
-- Nejprve smažeme případné testovací záznamy
DELETE FROM piano.piano_quiz_theory;

-- Vložíme 4 původní otázky
INSERT INTO piano.piano_quiz_theory (question, difficulty, is_active, display_order)
VALUES
  ('Kolik čar má notová osnova?', 'easy', true, 1),
  ('Který akord obsahuje tóny C, E, G?', 'easy', true, 2),
  ('Co znamená tempo "Allegro"?', 'medium', true, 3),
  ('Jaký je rozdíl mezi durovou a mollovou stupnicí?', 'hard', true, 4);

-- Možnosti odpovědí pro první otázku "Kolik čar má notová osnova?"
INSERT INTO piano.piano_quiz_theory_options (theory_question_id, option_text, is_correct, display_order)
SELECT
  id,
  unnest(ARRAY['4 čáry', '5 čar', '6 čar', '7 čar']),
  unnest(ARRAY[false, true, false, false]),
  unnest(ARRAY[1, 2, 3, 4])
FROM piano.piano_quiz_theory
WHERE question = 'Kolik čar má notová osnova?';

-- Možnosti odpovědí pro druhou otázku "Který akord obsahuje tóny C, E, G?"
INSERT INTO piano.piano_quiz_theory_options (theory_question_id, option_text, is_correct, display_order)
SELECT
  id,
  unnest(ARRAY['C dur', 'C moll', 'G dur', 'F dur']),
  unnest(ARRAY[true, false, false, false]),
  unnest(ARRAY[1, 2, 3, 4])
FROM piano.piano_quiz_theory
WHERE question = 'Který akord obsahuje tóny C, E, G?';

-- Možnosti odpovědí pro třetí otázku "Co znamená tempo 'Allegro'?"
INSERT INTO piano.piano_quiz_theory_options (theory_question_id, option_text, is_correct, display_order)
SELECT
  id,
  unnest(ARRAY['Velmi pomalu', 'Pomalu', 'Rychle', 'Velmi rychle']),
  unnest(ARRAY[false, false, true, false]),
  unnest(ARRAY[1, 2, 3, 4])
FROM piano.piano_quiz_theory
WHERE question = 'Co znamená tempo "Allegro"?';

-- Možnosti odpovědí pro čtvrtou otázku "Jaký je rozdíl mezi durovou a mollovou stupnicí?"
INSERT INTO piano.piano_quiz_theory_options (theory_question_id, option_text, is_correct, display_order)
SELECT
  id,
  unnest(ARRAY['První stupeň', 'Druhý stupeň', 'Třetí stupeň', 'Čtvrtý stupeň']),
  unnest(ARRAY[false, false, true, false]),
  unnest(ARRAY[1, 2, 3, 4])
FROM piano.piano_quiz_theory
WHERE question = 'Jaký je rozdíl mezi durovou a mollovou stupnicí?';

-- 8. Ověření - zobrazení všech otázek a odpovědí
SELECT
  q.id,
  q.question,
  q.difficulty,
  q.display_order,
  COUNT(o.id) as num_options
FROM piano.piano_quiz_theory q
LEFT JOIN piano.piano_quiz_theory_options o ON q.id = o.theory_question_id
GROUP BY q.id, q.question, q.difficulty, q.display_order
ORDER BY q.display_order;
