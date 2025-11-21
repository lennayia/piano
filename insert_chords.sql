-- Vložení akordů do piano.piano_quiz_chords
-- Nejprve smažeme existující akordy pro čistý start
DELETE FROM piano.piano_quiz_chords;

-- ZÁKLADNÍ AKORDY (easy) - bez křížků
-- Durové
INSERT INTO piano.piano_quiz_chords (name, notes, difficulty, is_active, display_order) VALUES
    ('C dur', ARRAY['C', 'E', 'G'], 'easy', true, 1),
    ('F dur', ARRAY['F', 'A', 'C'], 'easy', true, 2),
    ('G dur', ARRAY['G', 'H', 'D'], 'easy', true, 3);

-- Molové (základní)
INSERT INTO piano.piano_quiz_chords (name, notes, difficulty, is_active, display_order) VALUES
    ('D moll', ARRAY['D', 'F', 'A'], 'easy', true, 4),
    ('E moll', ARRAY['E', 'G', 'H'], 'easy', true, 5),
    ('A moll', ARRAY['A', 'C', 'E'], 'easy', true, 6);

-- POKROČILÉ AKORDY (medium) - s křížky
-- Durové s křížky
INSERT INTO piano.piano_quiz_chords (name, notes, difficulty, is_active, display_order) VALUES
    ('D dur', ARRAY['D', 'F#', 'A'], 'medium', true, 7),
    ('E dur', ARRAY['E', 'G#', 'H'], 'medium', true, 8),
    ('A dur', ARRAY['A', 'C#', 'E'], 'medium', true, 9),
    ('H dur', ARRAY['H', 'D#', 'F#'], 'medium', true, 10);

-- Molové s křížky
INSERT INTO piano.piano_quiz_chords (name, notes, difficulty, is_active, display_order) VALUES
    ('C moll', ARRAY['C', 'D#', 'G'], 'medium', true, 11),
    ('F moll', ARRAY['F', 'G#', 'C'], 'medium', true, 12),
    ('G moll', ARRAY['G', 'A#', 'D'], 'medium', true, 13),
    ('H moll', ARRAY['H', 'D', 'F#'], 'medium', true, 14);
