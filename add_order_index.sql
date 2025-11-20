-- Přidání order_index sloupce do všech tabulek pro drag and drop řazení
-- A přidání lyrics sloupce do piano_songs

-- 1. Songs (piano_songs)
ALTER TABLE piano.piano_songs
ADD COLUMN IF NOT EXISTS order_index INTEGER;

ALTER TABLE piano.piano_songs
ADD COLUMN IF NOT EXISTS lyrics TEXT;

-- Nastavit výchozí pořadí podle pořadového čísla (ROW_NUMBER)
WITH numbered_songs AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) as row_num
  FROM piano.piano_songs
)
UPDATE piano.piano_songs s
SET order_index = n.row_num
FROM numbered_songs n
WHERE s.id = n.id AND s.order_index IS NULL;

-- 2. Lessons (piano_lessons)
ALTER TABLE piano.piano_lessons
ADD COLUMN IF NOT EXISTS order_index INTEGER;

WITH numbered_lessons AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) as row_num
  FROM piano.piano_lessons
)
UPDATE piano.piano_lessons l
SET order_index = n.row_num
FROM numbered_lessons n
WHERE l.id = n.id AND l.order_index IS NULL;

-- 3. Glossary (piano_glossary)
ALTER TABLE piano.piano_glossary
ADD COLUMN IF NOT EXISTS order_index INTEGER;

WITH numbered_glossary AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) as row_num
  FROM piano.piano_glossary
)
UPDATE piano.piano_glossary g
SET order_index = n.row_num
FROM numbered_glossary n
WHERE g.id = n.id AND g.order_index IS NULL;

-- 4. Harmonization Templates (piano_harmonization_templates)
ALTER TABLE piano.piano_harmonization_templates
ADD COLUMN IF NOT EXISTS order_index INTEGER;

WITH numbered_templates AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) as row_num
  FROM piano.piano_harmonization_templates
)
UPDATE piano.piano_harmonization_templates h
SET order_index = n.row_num
FROM numbered_templates n
WHERE h.id = n.id AND h.order_index IS NULL;

-- Přidat indexy pro rychlejší řazení
CREATE INDEX IF NOT EXISTS idx_songs_order ON piano.piano_songs(order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON piano.piano_lessons(order_index);
CREATE INDEX IF NOT EXISTS idx_glossary_order ON piano.piano_glossary(order_index);
CREATE INDEX IF NOT EXISTS idx_harmonization_order ON piano.piano_harmonization_templates(order_index);
