-- =====================================================
-- Migration: Tracking kvízů a dokonale zahraných písní
-- Datum: 2025-11-20
-- Popis: Přidání sledování kvízů a písní do statistik
-- =====================================================

-- 1. Rozšíření tabulky piano_user_stats o kvízy a písničky
ALTER TABLE piano.piano_user_stats
ADD COLUMN IF NOT EXISTS quizzes_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quizzes_perfect_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS songs_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS songs_perfect_score INTEGER DEFAULT 0;

-- 2. Vytvoření tabulky pro sledování dokončených kvízů
CREATE TABLE IF NOT EXISTS piano.piano_quiz_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES piano.piano_users(id) ON DELETE CASCADE,
    quiz_name VARCHAR(100) NOT NULL, -- např. "Poznáš akord?"
    score INTEGER NOT NULL, -- Počet správných odpovědí
    total_questions INTEGER NOT NULL, -- Celkový počet otázek
    is_perfect BOOLEAN DEFAULT FALSE, -- TRUE pokud score == total_questions
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Vytvoření tabulky pro sledování zahraných písní
CREATE TABLE IF NOT EXISTS piano.piano_song_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES piano.piano_users(id) ON DELETE CASCADE,
    song_id VARCHAR(100) NOT NULL, -- ID písně z local storage
    song_title VARCHAR(200) NOT NULL,
    mistakes_count INTEGER DEFAULT 0,
    is_perfect BOOLEAN DEFAULT FALSE, -- TRUE pokud mistakes_count == 0
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Přidání komentářů
COMMENT ON COLUMN piano.piano_user_stats.quizzes_completed IS 'Celkový počet dokončených kvízů';
COMMENT ON COLUMN piano.piano_user_stats.quizzes_perfect_score IS 'Počet kvízů s perfektním skóre (100%)';
COMMENT ON COLUMN piano.piano_user_stats.songs_completed IS 'Celkový počet zahraných písní';
COMMENT ON COLUMN piano.piano_user_stats.songs_perfect_score IS 'Počet písní zahraných bez chyby';

COMMENT ON TABLE piano.piano_quiz_completions IS 'Historie dokončených kvízů uživateli';
COMMENT ON TABLE piano.piano_song_completions IS 'Historie zahraných písní uživateli';

-- 5. RLS politiky pro nové tabulky
ALTER TABLE piano.piano_quiz_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE piano.piano_song_completions ENABLE ROW LEVEL SECURITY;

-- Každý může číst své vlastní záznamy
CREATE POLICY "Uživatelé mohou číst své kvízy"
    ON piano.piano_quiz_completions FOR SELECT
    TO authenticated
    USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

CREATE POLICY "Uživatelé mohou číst své písničky"
    ON piano.piano_song_completions FOR SELECT
    TO authenticated
    USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- Každý může vkládat své vlastní záznamy
CREATE POLICY "Uživatelé mohou vkládat své kvízy"
    ON piano.piano_quiz_completions FOR INSERT
    TO authenticated
    WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

CREATE POLICY "Uživatelé mohou vkládat své písničky"
    ON piano.piano_song_completions FOR INSERT
    TO authenticated
    WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- Admin může číst vše
CREATE POLICY "Admin může číst všechny kvízy"
    ON piano.piano_quiz_completions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM piano.piano_users
            WHERE id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
            AND is_admin = true
        )
    );

CREATE POLICY "Admin může číst všechny písničky"
    ON piano.piano_song_completions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM piano.piano_users
            WHERE id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
            AND is_admin = true
        )
    );

-- 6. Indexy pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_quiz_completions_user_id
    ON piano.piano_quiz_completions(user_id);

CREATE INDEX IF NOT EXISTS idx_quiz_completions_quiz_name
    ON piano.piano_quiz_completions(quiz_name);

CREATE INDEX IF NOT EXISTS idx_song_completions_user_id
    ON piano.piano_song_completions(user_id);

CREATE INDEX IF NOT EXISTS idx_song_completions_song_id
    ON piano.piano_song_completions(song_id);

-- 7. Oprávnění
GRANT SELECT, INSERT ON piano.piano_quiz_completions TO authenticated;
GRANT SELECT, INSERT ON piano.piano_song_completions TO authenticated;

-- Hotovo!
-- Po spuštění této migrace:
-- 1. Kvízy budou zaznamenávat dokončení a perfektní skóre
-- 2. Písničky zahrané bez chyby budou zaznamenány
-- 3. Statistiky uživatelů budou obsahovat tyto údaje
