-- Přidat sloupec chords_completed do piano_user_stats
-- Created: 2025-11-30
-- Schema: piano

ALTER TABLE piano.piano_user_stats
ADD COLUMN IF NOT EXISTS chords_completed INTEGER DEFAULT 0;

COMMENT ON COLUMN piano.piano_user_stats.chords_completed
IS 'Počet úspěšně dokončených akordových cvičení';
