-- ============================================================
-- PIANO LEARNING APP - SUPABASE DATABASE MIGRATION
-- Schéma: piano
-- ============================================================

-- Vytvořit schéma piano (pokud neexistuje)
CREATE SCHEMA IF NOT EXISTS piano;

-- Povolit přístup ke schématu pro anon a authenticated role
GRANT USAGE ON SCHEMA piano TO anon, authenticated;

-- ============================================================
-- TABULKA: piano_users
-- ============================================================

CREATE TABLE IF NOT EXISTS piano.piano_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE piano.piano_users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Každý může číst uživatele"
    ON piano.piano_users FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Každý může vytvořit uživatele"
    ON piano.piano_users FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Každý může aktualizovat uživatele"
    ON piano.piano_users FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Pouze admini mohou mazat uživatele"
    ON piano.piano_users FOR DELETE
    TO anon, authenticated
    USING (is_admin = true);

-- Oprávnění na tabulku
GRANT SELECT, INSERT, UPDATE, DELETE ON piano.piano_users TO anon, authenticated;

-- ============================================================
-- TABULKA: piano_user_stats
-- ============================================================

CREATE TABLE IF NOT EXISTS piano.piano_user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES piano.piano_users(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    lessons_completed INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    total_practice_time INTEGER DEFAULT 0, -- v minutách
    last_activity_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- RLS
ALTER TABLE piano.piano_user_stats ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Každý může číst stats"
    ON piano.piano_user_stats FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Každý může vytvořit stats"
    ON piano.piano_user_stats FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Každý může aktualizovat stats"
    ON piano.piano_user_stats FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Oprávnění
GRANT SELECT, INSERT, UPDATE, DELETE ON piano.piano_user_stats TO anon, authenticated;

-- ============================================================
-- TABULKA: piano_lessons
-- ============================================================

CREATE TABLE IF NOT EXISTS piano.piano_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    order_index INTEGER,
    content JSONB, -- Obsahuje strukturu lekce
    xp_reward INTEGER DEFAULT 50,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE piano.piano_lessons ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Každý může číst publikované lekce"
    ON piano.piano_lessons FOR SELECT
    TO anon, authenticated
    USING (is_published = true);

CREATE POLICY "Pouze admini mohou vytvářet lekce"
    ON piano.piano_lessons FOR INSERT
    TO anon, authenticated
    WITH CHECK ((SELECT is_admin FROM piano.piano_users WHERE id = auth.uid()));

CREATE POLICY "Pouze admini mohou upravovat lekce"
    ON piano.piano_lessons FOR UPDATE
    TO anon, authenticated
    USING ((SELECT is_admin FROM piano.piano_users WHERE id = auth.uid()))
    WITH CHECK ((SELECT is_admin FROM piano.piano_users WHERE id = auth.uid()));

-- Oprávnění
GRANT SELECT, INSERT, UPDATE, DELETE ON piano.piano_lessons TO anon, authenticated;

-- ============================================================
-- TABULKA: piano_user_progress
-- ============================================================

CREATE TABLE IF NOT EXISTS piano.piano_user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES piano.piano_users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES piano.piano_lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    score INTEGER, -- 0-100
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- RLS
ALTER TABLE piano.piano_user_progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Každý může číst progress"
    ON piano.piano_user_progress FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Každý může vytvořit progress"
    ON piano.piano_user_progress FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Každý může aktualizovat progress"
    ON piano.piano_user_progress FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Oprávnění
GRANT SELECT, INSERT, UPDATE, DELETE ON piano.piano_user_progress TO anon, authenticated;

-- ============================================================
-- TABULKA: piano_achievements
-- ============================================================

CREATE TABLE IF NOT EXISTS piano.piano_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT, -- Název ikony nebo emoji
    requirement_type TEXT CHECK (requirement_type IN ('lessons_completed', 'streak', 'xp', 'custom')),
    requirement_value INTEGER,
    xp_reward INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE piano.piano_achievements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Každý může číst aktivní achievementy"
    ON piano.piano_achievements FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- Oprávnění
GRANT SELECT, INSERT, UPDATE, DELETE ON piano.piano_achievements TO anon, authenticated;

-- ============================================================
-- TABULKA: piano_user_achievements
-- ============================================================

CREATE TABLE IF NOT EXISTS piano.piano_user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES piano.piano_users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES piano.piano_achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- RLS
ALTER TABLE piano.piano_user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Každý může číst user achievementy"
    ON piano.piano_user_achievements FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Každý může vytvořit user achievement"
    ON piano.piano_user_achievements FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Oprávnění
GRANT SELECT, INSERT, UPDATE, DELETE ON piano.piano_user_achievements TO anon, authenticated;

-- ============================================================
-- INDEXY pro výkon
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON piano.piano_user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON piano.piano_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON piano.piano_user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON piano.piano_user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON piano.piano_lessons(is_published);

-- ============================================================
-- TRIGGERY pro updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION piano.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_piano_users_updated_at
    BEFORE UPDATE ON piano.piano_users
    FOR EACH ROW
    EXECUTE FUNCTION piano.update_updated_at_column();

CREATE TRIGGER update_piano_user_stats_updated_at
    BEFORE UPDATE ON piano.piano_user_stats
    FOR EACH ROW
    EXECUTE FUNCTION piano.update_updated_at_column();

CREATE TRIGGER update_piano_lessons_updated_at
    BEFORE UPDATE ON piano.piano_lessons
    FOR EACH ROW
    EXECUTE FUNCTION piano.update_updated_at_column();

CREATE TRIGGER update_piano_user_progress_updated_at
    BEFORE UPDATE ON piano.piano_user_progress
    FOR EACH ROW
    EXECUTE FUNCTION piano.update_updated_at_column();

-- ============================================================
-- SEED DATA - Základní achievementy
-- ============================================================

INSERT INTO piano.piano_achievements (title, description, icon, requirement_type, requirement_value, xp_reward)
VALUES
    ('První kroky', 'Dokončili jste svoji první lekci!', '🎹', 'lessons_completed', 1, 10),
    ('Aktivní student', 'Dokončili jste 5 lekcí!', '📚', 'lessons_completed', 5, 25),
    ('Piano mistr', 'Dokončili jste 10 lekcí!', '🎓', 'lessons_completed', 10, 50),
    ('Týdenní série', 'Udrželi jste 7denní sérii!', '🔥', 'streak', 7, 30),
    ('Měsíční série', 'Udrželi jste 30denní sérii!', '⭐', 'streak', 30, 100),
    ('100 XP', 'Získali jste 100 XP!', '💯', 'xp', 100, 20),
    ('500 XP', 'Získali jste 500 XP!', '🏆', 'xp', 500, 50)
ON CONFLICT DO NOTHING;

-- ============================================================
-- HOTOVO!
-- ============================================================
-- Nyní máte plně funkční databázi s RLS policies
-- Můžete se připojit z aplikace pomocí anon key
