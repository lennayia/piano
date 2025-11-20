-- ============================================================
-- Přidat sloupce pro sledování přihlášení
-- ============================================================

-- Přidat login_count a last_login do piano_users
ALTER TABLE piano.piano_users
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Nastavit výchozí hodnoty pro existující uživatele
UPDATE piano.piano_users
SET login_count = 0
WHERE login_count IS NULL;

-- Přidat komentář ke sloupcům
COMMENT ON COLUMN piano.piano_users.login_count IS 'Celkový počet přihlášení uživatele';
COMMENT ON COLUMN piano.piano_users.last_login IS 'Čas posledního přihlášení uživatele';
