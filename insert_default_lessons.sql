-- Vložení výchozích lekcí do databáze
-- Spusťte tento skript v Supabase SQL Editoru

-- Nejprve zkontrolujeme a nastavíme auto-increment pro ID (pokud ještě není)
DO $$
BEGIN
  -- Pokud sloupec id existuje jako integer bez default, přidáme sekvenci
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'piano'
    AND table_name = 'piano_lessons'
    AND column_name = 'id'
    AND data_type = 'integer'
    AND column_default IS NULL
  ) THEN
    -- Vytvoříme sekvenci pokud neexistuje
    CREATE SEQUENCE IF NOT EXISTS piano.piano_lessons_id_seq;

    -- Nastavíme default pro sloupec id
    ALTER TABLE piano.piano_lessons
    ALTER COLUMN id SET DEFAULT nextval('piano.piano_lessons_id_seq');

    -- Nastavíme vlastníka sekvence
    ALTER SEQUENCE piano.piano_lessons_id_seq OWNED BY piano.piano_lessons.id;

    -- Nastavíme aktuální hodnotu sekvence na maximum + 1
    PERFORM setval('piano.piano_lessons_id_seq', COALESCE((SELECT MAX(id) FROM piano.piano_lessons), 0) + 1, false);
  END IF;
END $$;

-- Nyní vložíme lekce (ID se vygeneruje automaticky)
INSERT INTO piano.piano_lessons (title, description, difficulty, duration, content, xp_reward, is_published, order_index)
VALUES
  (
    'První tóny',
    'Naučte se základní pozici rukou a zahrajte první tóny C, D, E',
    'začátečník',
    5,
    '{
      "notes": ["C", "D", "E"],
      "instructions": [
        "Posaďte se pohodlně před klavír",
        "Položte pravou ruku na klávesy - palec na C",
        "Postupně zahrajte C, D, E"
      ]
    }'::jsonb,
    50,
    true,
    1
  ),
  (
    'Celá stupnice C dur',
    'Zvládněte celou stupnici C dur oběma rukama',
    'začátečník',
    10,
    '{
      "notes": ["C", "D", "E", "F", "G", "A", "H", "C"],
      "instructions": [
        "Začněte na C",
        "Postupujte po bílých klávesách vzhůru",
        "Použijte správné prstoklady: 1-2-3-1-2-3-4-5"
      ]
    }'::jsonb,
    50,
    true,
    2
  ),
  (
    'Twinkle Twinkle Little Star',
    'Zahrajte svoji první písničku!',
    'začátečník',
    15,
    '{
      "notes": ["C", "C", "G", "G", "A", "A", "G"],
      "instructions": [
        "Použijte pouze pravou ruku",
        "Hraje se pomalu, s důrazem na rytmus",
        "Opakujte, dokud nezazní plynule"
      ]
    }'::jsonb,
    50,
    true,
    3
  ),
  (
    'Akordy - C dur',
    'Naučte se zahrát svůj první akord',
    'mírně pokročilý',
    10,
    '{
      "notes": ["C", "E", "G"],
      "instructions": [
        "Položte palec na C, prostředníček na E, malíček na G",
        "Stiskněte všechny tři klávesy současně",
        "Poslouchejte, jak znějí dohromady"
      ]
    }'::jsonb,
    50,
    true,
    4
  );
