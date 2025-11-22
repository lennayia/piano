-- ============================================================
-- Nastavení výchozího quiz_type pro existující akordy
-- ============================================================
-- Všechny stávající akordy v piano_quiz_chords, které nemají
-- quiz_type nastavený, dostanou hodnotu 'chord'
-- ============================================================

-- Aktualizujeme záznamy S notami (poslechový kvíz) → quiz_type = 'chord'
UPDATE piano.piano_quiz_chords
SET quiz_type = 'chord'
WHERE quiz_type IS NULL
  AND notes IS NOT NULL
  AND notes::text != '[]';

-- Aktualizujeme záznamy BEZ not (teoretický kvíz) → quiz_type = 'theory'
UPDATE piano.piano_quiz_chords
SET quiz_type = 'theory'
WHERE quiz_type IS NULL
  AND (notes IS NULL OR notes::text = '[]');

-- Nastavíme výchozí hodnotu pro budoucí záznamy
ALTER TABLE piano.piano_quiz_chords
ALTER COLUMN quiz_type SET DEFAULT 'chord';

-- Ověření - ukážeme všechny akordy a jejich quiz_type
SELECT id, name, quiz_type, category
FROM piano.piano_quiz_chords
ORDER BY name;
