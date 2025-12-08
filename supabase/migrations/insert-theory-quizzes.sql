-- ============================================
-- TEORETICKÉ KVÍZY - INTERVALY, STUPNICE, RYTMUS, MIX
-- ============================================
-- Datum: 2024-11-24
-- Použití: Spustit v Supabase SQL Editoru
-- ============================================

-- ============================================
-- 1. INTERVALY (5 otázek)
-- ============================================

-- Otázka 1: Kolik půltónů má velká tercie?
INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
VALUES ('Kolik půltónů má velká tercie?', 'interval', NULL, 'Intervaly', 'easy', true, 1)
RETURNING id;

-- Možnosti pro otázku 1 (nahraď <ID> skutečným ID z předchozího INSERT)
INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
VALUES
  (<ID>, '4', true, 1),
  (<ID>, '3', false, 2),
  (<ID>, '5', false, 3),
  (<ID>, '2', false, 4);

-- Otázka 2: Kolik půltónů má čistá kvinta?
INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
VALUES ('Kolik půltónů má čistá kvinta?', 'interval', NULL, 'Intervaly', 'easy', true, 2)
RETURNING id;

INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
VALUES
  (<ID>, '7', true, 1),
  (<ID>, '6', false, 2),
  (<ID>, '8', false, 3),
  (<ID>, '5', false, 4);

-- Otázka 3: Jaký interval obsahuje 6 půltónů?
INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
VALUES ('Jaký interval obsahuje 6 půltónů?', 'interval', NULL, 'Intervaly', 'medium', true, 3)
RETURNING id;

INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
VALUES
  (<ID>, 'Tritonus', true, 1),
  (<ID>, 'Kvarta', false, 2),
  (<ID>, 'Kvinta', false, 3),
  (<ID>, 'Sexta', false, 4);

-- Otázka 4: Kolik půltónů má malá septima?
INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
VALUES ('Kolik půltónů má malá septima?', 'interval', NULL, 'Intervaly', 'medium', true, 4)
RETURNING id;

INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
VALUES
  (<ID>, '10', true, 1),
  (<ID>, '9', false, 2),
  (<ID>, '11', false, 3),
  (<ID>, '8', false, 4);

-- Otázka 5: Který interval má 12 půltónů?
INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
VALUES ('Který interval má 12 půltónů?', 'interval', NULL, 'Intervaly', 'easy', true, 5)
RETURNING id;

INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
VALUES
  (<ID>, 'Oktáva', true, 1),
  (<ID>, 'Nóna', false, 2),
  (<ID>, 'Septima', false, 3),
  (<ID>, 'Decima', false, 4);

-- ============================================
-- 2. STUPNICE (5 otázek)
-- ============================================

-- Otázka 1: Kolik křížků má G dur?
INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
VALUES ('Kolik křížků má G dur?', 'scale', NULL, 'Stupnice', 'easy', true, 1)
RETURNING id;

INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
VALUES
  (<ID>, '1 křížek (Fis)', true, 1),
  (<ID>, '2 křížky', false, 2),
  (<ID>, 'Žádný', false, 3),
  (<ID>, '3 křížky', false, 4);

-- Otázka 2: Kolik béček má F dur?
INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
VALUES ('Kolik béček má F dur?', 'scale', NULL, 'Stupnice', 'easy', true, 2)
RETURNING id;

INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
VALUES
  (<ID>, '1 béčko (B)', true, 1),
  (<ID>, '2 béčka', false, 2),
  (<ID>, 'Žádné', false, 3),
  (<ID>, '3 béčka', false, 4);

-- Otázka 3: Jaká je paralelní mollová stupnice k C dur?
INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
VALUES ('Jaká je paralelní mollová stupnice k C dur?', 'scale', NULL, 'Stupnice', 'easy', true, 3)
RETURNING id;

INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
VALUES
  (<ID>, 'A moll', true, 1),
  (<ID>, 'E moll', false, 2),
  (<ID>, 'D moll', false, 3),
  (<ID>, 'G moll', false, 4);

-- Otázka 4: Kolik křížků má D dur?
INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
VALUES ('Kolik křížků má D dur?', 'scale', NULL, 'Stupnice', 'medium', true, 4)
RETURNING id;

INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
VALUES
  (<ID>, '2 křížky (Fis, Cis)', true, 1),
  (<ID>, '1 křížek', false, 2),
  (<ID>, '3 křížky', false, 3),
  (<ID>, '4 křížky', false, 4);

-- Otázka 5: Která stupnice má 4 křížky?
INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
VALUES ('Která stupnice má 4 křížky?', 'scale', NULL, 'Stupnice', 'medium', true, 5)
RETURNING id;

INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
VALUES
  (<ID>, 'E dur', true, 1),
  (<ID>, 'D dur', false, 2),
  (<ID>, 'A dur', false, 3),
  (<ID>, 'H dur', false, 4);

-- ============================================
-- 3. RYTMUS (5 otázek)
-- ============================================

-- Otázka 1: Kolik čtvrťových not se vejde do 4/4 taktu?
INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
VALUES ('Kolik čtvrťových not se vejde do 4/4 taktu?', 'rhythm', NULL, 'Rytmus', 'easy', true, 1)
RETURNING id;

INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
VALUES
  (<ID>, '4', true, 1),
  (<ID>, '3', false, 2),
  (<ID>, '5', false, 3),
  (<ID>, '2', false, 4);

-- Otázka 2: Jaká je hodnota půlové noty?
INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
VALUES ('Jaká je hodnota půlové noty?', 'rhythm', NULL, 'Rytmus', 'easy', true, 2)
RETURNING id;

INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
VALUES
  (<ID>, '2 doby', true, 1),
  (<ID>, '1 doba', false, 2),
  (<ID>, '3 doby', false, 3),
  (<ID>, '4 doby', false, 4);

-- Otázka 3: Kolik osminových not se vejde do 3/4 taktu?
INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
VALUES ('Kolik osminových not se vejde do 3/4 taktu?', 'rhythm', NULL, 'Rytmus', 'medium', true, 3)
RETURNING id;

INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
VALUES
  (<ID>, '6', true, 1),
  (<ID>, '8', false, 2),
  (<ID>, '4', false, 3),
  (<ID>, '12', false, 4);

-- Otázka 4: Co znamená tečka za notou?
INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
VALUES ('Co znamená tečka za notou?', 'rhythm', NULL, 'Rytmus', 'easy', true, 4)
RETURNING id;

INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
VALUES
  (<ID>, 'Prodlužuje o polovinu', true, 1),
  (<ID>, 'Zkracuje o polovinu', false, 2),
  (<ID>, 'Zdvojnásobí', false, 3),
  (<ID>, 'Nic', false, 4);

-- Otázka 5: Kolik celých not se vejde do 4/4 taktu?
INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
VALUES ('Kolik celých not se vejde do 4/4 taktu?', 'rhythm', NULL, 'Rytmus', 'easy', true, 5)
RETURNING id;

INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
VALUES
  (<ID>, '1', true, 1),
  (<ID>, '2', false, 2),
  (<ID>, '4', false, 3),
  (<ID>, '0', false, 4);

-- ============================================
-- 4. MIX (5 otázek)
-- ============================================

-- Otázka 1: Jaký akord vznikne spojením tónů C-E-G?
INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
VALUES ('Jaký akord vznikne spojením tónů C-E-G?', 'mixed', NULL, 'Mix', 'easy', true, 1)
RETURNING id;

INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
VALUES
  (<ID>, 'C dur', true, 1),
  (<ID>, 'C moll', false, 2),
  (<ID>, 'G dur', false, 3),
  (<ID>, 'F dur', false, 4);

-- Otázka 2: Kolik linek má notová osnova?
INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
VALUES ('Kolik linek má notová osnova?', 'mixed', NULL, 'Mix', 'easy', true, 2)
RETURNING id;

INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
VALUES
  (<ID>, '5', true, 1),
  (<ID>, '4', false, 2),
  (<ID>, '6', false, 3),
  (<ID>, '7', false, 4);

-- Otázka 3: Co je to enharmonická záměna?
INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
VALUES ('Co je to enharmonická záměna?', 'mixed', NULL, 'Mix', 'hard', true, 3)
RETURNING id;

INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
VALUES
  (<ID>, 'Různý zápis stejného tónu', true, 1),
  (<ID>, 'Změna tempa', false, 2),
  (<ID>, 'Modulace', false, 3),
  (<ID>, 'Transpozice', false, 4);

-- Otázka 4: Jaký je rozdíl mezi durem a mollem?
INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
VALUES ('Jaký je rozdíl mezi durem a mollem?', 'mixed', NULL, 'Mix', 'medium', true, 4)
RETURNING id;

INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
VALUES
  (<ID>, 'Tercie (velká vs malá)', true, 1),
  (<ID>, 'Kvinta', false, 2),
  (<ID>, 'Tónika', false, 3),
  (<ID>, 'Prima', false, 4);

-- Otázka 5: Co znamená legato?
INSERT INTO piano.piano_quiz_chords (name, quiz_type, notes, category, difficulty, is_active, display_order)
VALUES ('Co znamená legato?', 'mixed', NULL, 'Mix', 'medium', true, 5)
RETURNING id;

INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
VALUES
  (<ID>, 'Vázaná hra', true, 1),
  (<ID>, 'Odtržená hra', false, 2),
  (<ID>, 'Hlasitá hra', false, 3),
  (<ID>, 'Tichá hra', false, 4);

-- ============================================
-- HOTOVO!
-- ============================================
-- Celkem: 20 otázek (5 × 4 kategorie)
-- Intervaly: 5 otázek
-- Stupnice: 5 otázek
-- Rytmus: 5 otázek
-- Mix: 5 otázek
-- ============================================
