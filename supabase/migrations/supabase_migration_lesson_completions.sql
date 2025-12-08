-- =====================================================
-- Migration: Tabulka pro dokončené lekce
-- Datum: 2025-11-20
-- Popis: Tracking dokončených lekcí uživateli
-- =====================================================

-- 1. Vytvoření tabulky pro dokončené lekce
CREATE TABLE IF NOT EXISTS piano.piano_lesson_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    lesson_id VARCHAR(50) NOT NULL,
    lesson_title TEXT,
    xp_earned INTEGER DEFAULT 50,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexy
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user_id
    ON piano.piano_lesson_completions(user_id);

CREATE INDEX IF NOT EXISTS idx_lesson_completions_completed_at
    ON piano.piano_lesson_completions(completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_lesson_completions_lesson_id
    ON piano.piano_lesson_completions(lesson_id);

-- 3. Komentáře
COMMENT ON TABLE piano.piano_lesson_completions IS 'Záznamy o dokončených lekcích uživateli';
COMMENT ON COLUMN piano.piano_lesson_completions.user_id IS 'ID uživatele z piano_users';
COMMENT ON COLUMN piano.piano_lesson_completions.lesson_id IS 'ID lekce';
COMMENT ON COLUMN piano.piano_lesson_completions.lesson_title IS 'Název lekce v době dokončení';
COMMENT ON COLUMN piano.piano_lesson_completions.xp_earned IS 'Počet získaných XP za dokončení lekce';

-- 4. RLS policies
ALTER TABLE piano.piano_lesson_completions ENABLE ROW LEVEL SECURITY;

-- Každý může vkládat své lekce (kontrola že user_id existuje v piano_users)
CREATE POLICY "Uživatelé mohou vkládat své lekce"
    ON piano.piano_lesson_completions FOR INSERT
    TO authenticated, anon
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM piano.piano_users
            WHERE id = user_id
        )
    );

-- Každý může číst lekce
CREATE POLICY "Každý může číst lekce"
    ON piano.piano_lesson_completions FOR SELECT
    TO anon, authenticated
    USING (true);

-- 5. Oprávnění
GRANT SELECT ON piano.piano_lesson_completions TO anon, authenticated;
GRANT INSERT ON piano.piano_lesson_completions TO anon, authenticated;
GRANT ALL ON piano.piano_lesson_completions TO authenticated;

-- Hotovo!
-- Nyní můžeme trackovat dokončené lekce
