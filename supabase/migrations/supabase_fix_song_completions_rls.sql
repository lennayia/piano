-- =====================================================
-- Fix: RLS Policy pro piano_song_completions
-- Datum: 2025-11-20
-- Popis: Oprava RLS policy aby fungovala s auth.uid()
-- =====================================================

-- 1. Nejdřív smažeme staré policies
DROP POLICY IF EXISTS "Uživatelé mohou vkládat své písničky" ON piano.piano_song_completions;
DROP POLICY IF EXISTS "Uživatelé mohou číst své písničky" ON piano.piano_song_completions;
DROP POLICY IF EXISTS "Admin může číst všechny písničky" ON piano.piano_song_completions;

-- 2. Vytvoříme nové policies s auth.uid()
-- Každý autentizovaný uživatel může vkládat své vlastní záznamy
CREATE POLICY "Uživatelé mohou vkládat své písničky"
    ON piano.piano_song_completions FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Každý autentizovaný uživatel může číst své vlastní záznamy
CREATE POLICY "Uživatelé mohou číst své písničky"
    ON piano.piano_song_completions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Admin může číst všechno
CREATE POLICY "Admin může číst všechny písničky"
    ON piano.piano_song_completions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM piano.piano_users
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- 3. To samé pro quiz_completions
DROP POLICY IF EXISTS "Uživatelé mohou vkládat své kvízy" ON piano.piano_quiz_completions;
DROP POLICY IF EXISTS "Uživatelé mohou číst své kvízy" ON piano.piano_quiz_completions;
DROP POLICY IF EXISTS "Admin může číst všechny kvízy" ON piano.piano_quiz_completions;

CREATE POLICY "Uživatelé mohou vkládat své kvízy"
    ON piano.piano_quiz_completions FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Uživatelé mohou číst své kvízy"
    ON piano.piano_quiz_completions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admin může číst všechny kvízy"
    ON piano.piano_quiz_completions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM piano.piano_users
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- Hotovo! RLS policies by měly nyní fungovat správně
