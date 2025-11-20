-- Přidání sloupce category do tabulky piano_songs

ALTER TABLE piano.piano_songs
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'lidovky';

-- Nastavit výchozí hodnotu pro existující písničky
UPDATE piano.piano_songs
SET category = 'lidovky'
WHERE category IS NULL;

-- Přidat comment k sloupci
COMMENT ON COLUMN piano.piano_songs.category IS 'Kategorie písničky: lidovky, uzskorolidovky, detske';
