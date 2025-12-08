-- ============================================
-- MIGRACE: Aktivní/neaktivní odměny + období platnosti
-- Datum: 2025-11-30
-- Schéma: piano
-- ============================================

SET search_path TO piano, public;

-- Přidat sloupce pro aktivaci a období platnosti
DO $$
BEGIN
  -- is_active sloupec už pravděpodobně existuje, ale pokud ne:
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'piano'
      AND table_name = 'piano_achievements'
      AND column_name = 'is_active'
  ) THEN
    ALTER TABLE piano.piano_achievements
    ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;

  -- Přidat valid_from
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'piano'
      AND table_name = 'piano_achievements'
      AND column_name = 'valid_from'
  ) THEN
    ALTER TABLE piano.piano_achievements
    ADD COLUMN valid_from TIMESTAMP WITH TIME ZONE DEFAULT NULL;
  END IF;

  -- Přidat valid_until
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'piano'
      AND table_name = 'piano_achievements'
      AND column_name = 'valid_until'
  ) THEN
    ALTER TABLE piano.piano_achievements
    ADD COLUMN valid_until TIMESTAMP WITH TIME ZONE DEFAULT NULL;
  END IF;
END $$;

-- Zobraz výsledek
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'piano'
  AND table_name = 'piano_achievements'
  AND column_name IN ('is_active', 'valid_from', 'valid_until')
ORDER BY column_name;

SELECT 'Migrace aktivních odměn dokončena!' AS status;
