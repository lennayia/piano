-- ============================================
-- TEORETICKÉ KVÍZY - VLOŽENÍ DAT
-- ============================================
-- Pro spuštění v Supabase SQL Editoru
-- Datum: 2024-11-24
-- ============================================

-- ============================================
-- 1. INTERVALY (5 otázek)
-- ============================================

DO $$
DECLARE
  quiz_id INTEGER;
BEGIN
  -- Otázka 1
  INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
  VALUES ('Kolik půltónů má velká tercie?', 'interval', NULL, 'Intervaly', 'easy', true, 1)
  RETURNING id INTO quiz_id;

  INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
    (quiz_id, '4', true, 1),
    (quiz_id, '3', false, 2),
    (quiz_id, '5', false, 3),
    (quiz_id, '2', false, 4);

  -- Otázka 2
  INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
  VALUES ('Kolik půltónů má čistá kvinta?', 'interval', NULL, 'Intervaly', 'easy', true, 2)
  RETURNING id INTO quiz_id;

  INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
    (quiz_id, '7', true, 1),
    (quiz_id, '6', false, 2),
    (quiz_id, '8', false, 3),
    (quiz_id, '5', false, 4);

  -- Otázka 3
  INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
  VALUES ('Jaký interval obsahuje 6 půltónů?', 'interval', NULL, 'Intervaly', 'medium', true, 3)
  RETURNING id INTO quiz_id;

  INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
    (quiz_id, 'Tritonus', true, 1),
    (quiz_id, 'Kvarta', false, 2),
    (quiz_id, 'Kvinta', false, 3),
    (quiz_id, 'Sexta', false, 4);

  -- Otázka 4
  INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
  VALUES ('Kolik půltónů má malá septima?', 'interval', NULL, 'Intervaly', 'medium', true, 4)
  RETURNING id INTO quiz_id;

  INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
    (quiz_id, '10', true, 1),
    (quiz_id, '9', false, 2),
    (quiz_id, '11', false, 3),
    (quiz_id, '8', false, 4);

  -- Otázka 5
  INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
  VALUES ('Který interval má 12 půltónů?', 'interval', NULL, 'Intervaly', 'easy', true, 5)
  RETURNING id INTO quiz_id;

  INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
    (quiz_id, 'Oktáva', true, 1),
    (quiz_id, 'Nóna', false, 2),
    (quiz_id, 'Septima', false, 3),
    (quiz_id, 'Decima', false, 4);
END $$;

-- ============================================
-- 2. STUPNICE (5 otázek)
-- ============================================

DO $$
DECLARE
  quiz_id INTEGER;
BEGIN
  -- Otázka 1
  INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
  VALUES ('Kolik křížků má G dur?', 'scale', NULL, 'Stupnice', 'easy', true, 1)
  RETURNING id INTO quiz_id;

  INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
    (quiz_id, '1 křížek (Fis)', true, 1),
    (quiz_id, '2 křížky', false, 2),
    (quiz_id, 'Žádný', false, 3),
    (quiz_id, '3 křížky', false, 4);

  -- Otázka 2
  INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
  VALUES ('Kolik béček má F dur?', 'scale', NULL, 'Stupnice', 'easy', true, 2)
  RETURNING id INTO quiz_id;

  INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
    (quiz_id, '1 béčko (B)', true, 1),
    (quiz_id, '2 béčka', false, 2),
    (quiz_id, 'Žádné', false, 3),
    (quiz_id, '3 béčka', false, 4);

  -- Otázka 3
  INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
  VALUES ('Jaká je paralelní mollová stupnice k C dur?', 'scale', NULL, 'Stupnice', 'easy', true, 3)
  RETURNING id INTO quiz_id;

  INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
    (quiz_id, 'A moll', true, 1),
    (quiz_id, 'E moll', false, 2),
    (quiz_id, 'D moll', false, 3),
    (quiz_id, 'G moll', false, 4);

  -- Otázka 4
  INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
  VALUES ('Kolik křížků má D dur?', 'scale', NULL, 'Stupnice', 'medium', true, 4)
  RETURNING id INTO quiz_id;

  INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
    (quiz_id, '2 křížky (Fis, Cis)', true, 1),
    (quiz_id, '1 křížek', false, 2),
    (quiz_id, '3 křížky', false, 3),
    (quiz_id, '4 křížky', false, 4);

  -- Otázka 5
  INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
  VALUES ('Která stupnice má 4 křížky?', 'scale', NULL, 'Stupnice', 'medium', true, 5)
  RETURNING id INTO quiz_id;

  INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
    (quiz_id, 'E dur', true, 1),
    (quiz_id, 'D dur', false, 2),
    (quiz_id, 'A dur', false, 3),
    (quiz_id, 'H dur', false, 4);
END $$;

-- ============================================
-- 3. RYTMUS (5 otázek)
-- ============================================

DO $$
DECLARE
  quiz_id INTEGER;
BEGIN
  -- Otázka 1
  INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
  VALUES ('Kolik čtvrťových not se vejde do 4/4 taktu?', 'rhythm', NULL, 'Rytmus', 'easy', true, 1)
  RETURNING id INTO quiz_id;

  INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
    (quiz_id, '4', true, 1),
    (quiz_id, '3', false, 2),
    (quiz_id, '5', false, 3),
    (quiz_id, '2', false, 4);

  -- Otázka 2
  INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
  VALUES ('Jaká je hodnota půlové noty?', 'rhythm', NULL, 'Rytmus', 'easy', true, 2)
  RETURNING id INTO quiz_id;

  INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
    (quiz_id, '2 doby', true, 1),
    (quiz_id, '1 doba', false, 2),
    (quiz_id, '3 doby', false, 3),
    (quiz_id, '4 doby', false, 4);

  -- Otázka 3
  INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
  VALUES ('Kolik osminových not se vejde do 3/4 taktu?', 'rhythm', NULL, 'Rytmus', 'medium', true, 3)
  RETURNING id INTO quiz_id;

  INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
    (quiz_id, '6', true, 1),
    (quiz_id, '8', false, 2),
    (quiz_id, '4', false, 3),
    (quiz_id, '12', false, 4);

  -- Otázka 4
  INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
  VALUES ('Co znamená tečka za notou?', 'rhythm', NULL, 'Rytmus', 'easy', true, 4)
  RETURNING id INTO quiz_id;

  INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
    (quiz_id, 'Prodlužuje o polovinu', true, 1),
    (quiz_id, 'Zkracuje o polovinu', false, 2),
    (quiz_id, 'Zdvojnásobí', false, 3),
    (quiz_id, 'Nic', false, 4);

  -- Otázka 5
  INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
  VALUES ('Kolik celých not se vejde do 4/4 taktu?', 'rhythm', NULL, 'Rytmus', 'easy', true, 5)
  RETURNING id INTO quiz_id;

  INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
    (quiz_id, '1', true, 1),
    (quiz_id, '2', false, 2),
    (quiz_id, '4', false, 3),
    (quiz_id, '0', false, 4);
END $$;

-- ============================================
-- 4. MIX (5 otázek)
-- ============================================

DO $$
DECLARE
  quiz_id INTEGER;
BEGIN
  -- Otázka 1
  INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
  VALUES ('Jaký akord vznikne spojením tónů C-E-G?', 'mixed', NULL, 'Mix', 'easy', true, 1)
  RETURNING id INTO quiz_id;

  INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
    (quiz_id, 'C dur', true, 1),
    (quiz_id, 'C moll', false, 2),
    (quiz_id, 'G dur', false, 3),
    (quiz_id, 'F dur', false, 4);

  -- Otázka 2
  INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
  VALUES ('Kolik linek má notová osnova?', 'mixed', NULL, 'Mix', 'easy', true, 2)
  RETURNING id INTO quiz_id;

  INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
    (quiz_id, '5', true, 1),
    (quiz_id, '4', false, 2),
    (quiz_id, '6', false, 3),
    (quiz_id, '7', false, 4);

  -- Otázka 3
  INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
  VALUES ('Co je to enharmonická záměna?', 'mixed', NULL, 'Mix', 'hard', true, 3)
  RETURNING id INTO quiz_id;

  INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
    (quiz_id, 'Různý zápis stejného tónu', true, 1),
    (quiz_id, 'Změna tempa', false, 2),
    (quiz_id, 'Modulace', false, 3),
    (quiz_id, 'Transpozice', false, 4);

  -- Otázka 4
  INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
  VALUES ('Jaký je rozdíl mezi durem a mollem?', 'mixed', NULL, 'Mix', 'medium', true, 4)
  RETURNING id INTO quiz_id;

  INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
    (quiz_id, 'Tercie (velká vs malá)', true, 1),
    (quiz_id, 'Kvinta', false, 2),
    (quiz_id, 'Tónika', false, 3),
    (quiz_id, 'Prima', false, 4);

  -- Otázka 5
  INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
  VALUES ('Co znamená legato?', 'mixed', NULL, 'Mix', 'medium', true, 5)
  RETURNING id INTO quiz_id;

  INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
    (quiz_id, 'Vázaná hra', true, 1),
    (quiz_id, 'Odtržená hra', false, 2),
    (quiz_id, 'Hlasitá hra', false, 3),
    (quiz_id, 'Tichá hra', false, 4);
END $$;

-- ============================================
-- HOTOVO!
-- ============================================
SELECT 'Vloženo 20 teoretických kvízů!' AS result;
