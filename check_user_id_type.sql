-- Zkontrolovat typ sloupce id v tabulce piano_users
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'piano'
  AND table_name = 'piano_users'
  AND column_name = 'id';

-- Zobrazit všechny uživatele a jejich ID
SELECT id, email, first_name, last_name
FROM piano.piano_users
LIMIT 5;
