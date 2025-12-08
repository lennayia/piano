-- Migration: Universal Quiz Structure
-- Rozšíření stávající struktury kvízu pro podporu různých typů kvízů
-- Spustit v Supabase SQL editoru

-- 1. Přidání sloupce quiz_type do piano_quiz_chords
-- Přejmenování není potřeba, ponecháme název "chords" pro zpětnou kompatibilitu
ALTER TABLE piano.piano_quiz_chords
ADD COLUMN IF NOT EXISTS quiz_type VARCHAR(50) NOT NULL DEFAULT 'chord';

-- Přidání constraint pro validaci typu kvízu
ALTER TABLE piano.piano_quiz_chords
ADD CONSTRAINT valid_quiz_type CHECK (quiz_type IN ('chord', 'theory', 'rhythm', 'interval', 'scale', 'mixed'));

-- 2. Upravíme sloupec notes - může být NULL pro teoretické otázky
ALTER TABLE piano.piano_quiz_chords
ALTER COLUMN notes DROP NOT NULL;

-- 3. Přidání indexu pro rychlé filtrování podle typu
CREATE INDEX IF NOT EXISTS idx_quiz_type ON piano.piano_quiz_chords(quiz_type);

-- 4. Přidání sloupce category pro budoucí kategorizaci (volitelné)
ALTER TABLE piano.piano_quiz_chords
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Index pro kategorie
CREATE INDEX IF NOT EXISTS idx_quiz_category ON piano.piano_quiz_chords(category);

-- 5. Komentáře k tabulkám pro dokumentaci
COMMENT ON TABLE piano.piano_quiz_chords IS 'Univerzální tabulka pro všechny typy kvízů (akordy, teorie, rytmus, intervaly, stupnice, mix)';
COMMENT ON COLUMN piano.piano_quiz_chords.quiz_type IS 'Typ kvízu: chord (akordy), theory (teorie), rhythm (rytmus), interval (intervaly), scale (stupnice), mixed (mix témat)';
COMMENT ON COLUMN piano.piano_quiz_chords.name IS 'Pro chord: název akordu (např. C dur). Pro theory: text otázky';
COMMENT ON COLUMN piano.piano_quiz_chords.notes IS 'Pro chord: pole not akordu. Pro theory: NULL';
COMMENT ON COLUMN piano.piano_quiz_chords.category IS 'Volitelná kategorie pro lepší organizaci (např. "Notová soustava", "Hudební teorie", "Akordy dur")';

-- 6. Aktualizace všech existujících záznamů na typ 'chord'
UPDATE piano.piano_quiz_chords
SET quiz_type = 'chord'
WHERE quiz_type IS NULL OR quiz_type = 'chord';

-- 7. Přidání příkladových teoretických otázek
INSERT INTO piano.piano_quiz_chords (name, quiz_type, difficulty, is_active, display_order, category, notes)
VALUES
  ('Kolik čar má notová osnova?', 'theory', 'easy', true, 100, 'Notová soustava', NULL),
  ('Který akord obsahuje tóny C, E, G?', 'theory', 'easy', true, 101, 'Akordy', NULL),
  ('Co znamená tempo "Allegro"?', 'theory', 'medium', true, 102, 'Hudební terminologie', NULL),
  ('Jaký je rozdíl mezi durovou a mollovou stupnicí?', 'theory', 'hard', true, 103, 'Stupnice', NULL),
  ('Kolik půltonů má celý tón?', 'theory', 'easy', true, 104, 'Intervaly', NULL);

-- 8. Přidání možností odpovědí pro teoretické otázky

-- Otázka: Kolik čar má notová osnova?
INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
SELECT
  id,
  unnest(ARRAY['4 čáry', '5 čar', '6 čar', '7 čar']),
  unnest(ARRAY[false, true, false, false]),
  unnest(ARRAY[1, 2, 3, 4])
FROM piano.piano_quiz_chords
WHERE name = 'Kolik čar má notová osnova?' AND quiz_type = 'theory';

-- Otázka: Který akord obsahuje tóny C, E, G?
INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
SELECT
  id,
  unnest(ARRAY['C dur', 'C moll', 'G dur', 'F dur']),
  unnest(ARRAY[true, false, false, false]),
  unnest(ARRAY[1, 2, 3, 4])
FROM piano.piano_quiz_chords
WHERE name = 'Který akord obsahuje tóny C, E, G?' AND quiz_type = 'theory';

-- Otázka: Co znamená tempo "Allegro"?
INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
SELECT
  id,
  unnest(ARRAY['Velmi pomalu', 'Pomalu', 'Rychle', 'Velmi rychle']),
  unnest(ARRAY[false, false, true, false]),
  unnest(ARRAY[1, 2, 3, 4])
FROM piano.piano_quiz_chords
WHERE name = 'Co znamená tempo "Allegro"?' AND quiz_type = 'theory';

-- Otázka: Jaký je rozdíl mezi durovou a mollovou stupnicí?
INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
SELECT
  id,
  unnest(ARRAY['První stupeň', 'Druhý stupeň', 'Třetí stupeň', 'Čtvrtý stupeň']),
  unnest(ARRAY[false, false, true, false]),
  unnest(ARRAY[1, 2, 3, 4])
FROM piano.piano_quiz_chords
WHERE name = 'Jaký je rozdíl mezi durovou a mollovou stupnicí?' AND quiz_type = 'theory';

-- Otázka: Kolik půltonů má celý tón?
INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order)
SELECT
  id,
  unnest(ARRAY['1 půltón', '2 půltóny', '3 půltóny', '4 půltóny']),
  unnest(ARRAY[false, true, false, false]),
  unnest(ARRAY[1, 2, 3, 4])
FROM piano.piano_quiz_chords
WHERE name = 'Kolik půltonů má celý tón?' AND quiz_type = 'theory';

-- 9. Vytvoření VIEW pro snadnější přístup k jednotlivým typům kvízů
CREATE OR REPLACE VIEW piano.quiz_chords AS
SELECT * FROM piano.piano_quiz_chords WHERE quiz_type = 'chord';

CREATE OR REPLACE VIEW piano.quiz_theory AS
SELECT * FROM piano.piano_quiz_chords WHERE quiz_type = 'theory';

CREATE OR REPLACE VIEW piano.quiz_rhythm AS
SELECT * FROM piano.piano_quiz_chords WHERE quiz_type = 'rhythm';

CREATE OR REPLACE VIEW piano.quiz_interval AS
SELECT * FROM piano.piano_quiz_chords WHERE quiz_type = 'interval';

CREATE OR REPLACE VIEW piano.quiz_scale AS
SELECT * FROM piano.piano_quiz_chords WHERE quiz_type = 'scale';

CREATE OR REPLACE VIEW piano.quiz_mixed AS
SELECT * FROM piano.piano_quiz_chords WHERE quiz_type = 'mixed';

-- 10. Komentáře k pohledům
COMMENT ON VIEW piano.quiz_chords IS 'Pohled na akordové kvízy';
COMMENT ON VIEW piano.quiz_theory IS 'Pohled na teoretické kvízy';
COMMENT ON VIEW piano.quiz_rhythm IS 'Pohled na rytmické kvízy';
COMMENT ON VIEW piano.quiz_interval IS 'Pohled na intervalové kvízy';
COMMENT ON VIEW piano.quiz_scale IS 'Pohled na stupnicové kvízy';
COMMENT ON VIEW piano.quiz_mixed IS 'Pohled na mix různých témat';

-- Dokončeno! Nyní máte univerzální strukturu pro všechny typy kvízů.
-- Můžete přidávat nové typy kvízů jednoduchým přidáním hodnoty do CHECK constraintu.
