-- =====================================================
-- Migration: Správa akordů pro kvíz "Poznáš akord?"
-- Datum: 2025-11-20
-- Popis: Databázová tabulka pro admin správu akordů v kvízu
-- =====================================================

-- 1. Vytvoření tabulky pro akordy kvízu
CREATE TABLE IF NOT EXISTS piano.piano_quiz_chords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL, -- např. "C dur", "Am", "F#m"
    notes TEXT[] NOT NULL, -- pole not, např. ['C', 'E', 'G']
    difficulty VARCHAR(20) DEFAULT 'easy', -- easy, medium, hard
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Vložení existujících akordů z kódu
INSERT INTO piano.piano_quiz_chords (name, notes, difficulty, is_active, display_order) VALUES
    ('C dur', ARRAY['C', 'E', 'G'], 'easy', true, 1),
    ('F dur', ARRAY['F', 'A', 'C'], 'easy', true, 2),
    ('G dur', ARRAY['G', 'H', 'D'], 'easy', true, 3),
    ('Am', ARRAY['A', 'C', 'E'], 'easy', true, 4),
    ('D dur', ARRAY['D', 'F#', 'A'], 'medium', true, 5)
ON CONFLICT DO NOTHING;

-- 3. Vytvoření tabulky pro možnosti odpovědí (options)
CREATE TABLE IF NOT EXISTS piano.piano_quiz_chord_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chord_id UUID NOT NULL REFERENCES piano.piano_quiz_chords(id) ON DELETE CASCADE,
    option_name VARCHAR(50) NOT NULL, -- název možnosti (např. "C dur", "F dur")
    is_correct BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Vložení možností pro existující akordy
DO $$
DECLARE
    c_dur_id UUID;
    f_dur_id UUID;
    g_dur_id UUID;
    am_id UUID;
    d_dur_id UUID;
BEGIN
    -- Získat ID akordů
    SELECT id INTO c_dur_id FROM piano.piano_quiz_chords WHERE name = 'C dur';
    SELECT id INTO f_dur_id FROM piano.piano_quiz_chords WHERE name = 'F dur';
    SELECT id INTO g_dur_id FROM piano.piano_quiz_chords WHERE name = 'G dur';
    SELECT id INTO am_id FROM piano.piano_quiz_chords WHERE name = 'Am';
    SELECT id INTO d_dur_id FROM piano.piano_quiz_chords WHERE name = 'D dur';

    -- C dur options
    IF c_dur_id IS NOT NULL THEN
        INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
            (c_dur_id, 'C dur', true, 1),
            (c_dur_id, 'F dur', false, 2),
            (c_dur_id, 'G dur', false, 3),
            (c_dur_id, 'Am', false, 4)
        ON CONFLICT DO NOTHING;
    END IF;

    -- F dur options
    IF f_dur_id IS NOT NULL THEN
        INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
            (f_dur_id, 'C dur', false, 1),
            (f_dur_id, 'F dur', true, 2),
            (f_dur_id, 'G dur', false, 3),
            (f_dur_id, 'Dm', false, 4)
        ON CONFLICT DO NOTHING;
    END IF;

    -- G dur options
    IF g_dur_id IS NOT NULL THEN
        INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
            (g_dur_id, 'C dur', false, 1),
            (g_dur_id, 'F dur', false, 2),
            (g_dur_id, 'G dur', true, 3),
            (g_dur_id, 'Em', false, 4)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Am options
    IF am_id IS NOT NULL THEN
        INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
            (am_id, 'Am', true, 1),
            (am_id, 'C dur', false, 2),
            (am_id, 'F dur', false, 3),
            (am_id, 'Dm', false, 4)
        ON CONFLICT DO NOTHING;
    END IF;

    -- D dur options
    IF d_dur_id IS NOT NULL THEN
        INSERT INTO piano.piano_quiz_chord_options (chord_id, option_name, is_correct, display_order) VALUES
            (d_dur_id, 'D dur', true, 1),
            (d_dur_id, 'G dur', false, 2),
            (d_dur_id, 'A dur', false, 3),
            (d_dur_id, 'Hm', false, 4)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 5. Komentáře
COMMENT ON TABLE piano.piano_quiz_chords IS 'Akordy pro kvíz "Poznáš akord?"';
COMMENT ON TABLE piano.piano_quiz_chord_options IS 'Možnosti odpovědí pro jednotlivé akordy v kvízu';
COMMENT ON COLUMN piano.piano_quiz_chords.notes IS 'Pole not akordu, např. [C, E, G]';
COMMENT ON COLUMN piano.piano_quiz_chords.difficulty IS 'Obtížnost: easy, medium, hard';

-- 6. RLS politiky
ALTER TABLE piano.piano_quiz_chords ENABLE ROW LEVEL SECURITY;
ALTER TABLE piano.piano_quiz_chord_options ENABLE ROW LEVEL SECURITY;

-- Každý může číst aktivní akordy
CREATE POLICY "Každý může číst aktivní akordy"
    ON piano.piano_quiz_chords FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

CREATE POLICY "Každý může číst možnosti akordů"
    ON piano.piano_quiz_chord_options FOR SELECT
    TO anon, authenticated
    USING (true);

-- Admin může všechno
CREATE POLICY "Admin může upravovat akordy"
    ON piano.piano_quiz_chords FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM piano.piano_users
            WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
            AND is_admin = true
        )
    );

CREATE POLICY "Admin může upravovat možnosti"
    ON piano.piano_quiz_chord_options FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM piano.piano_users
            WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
            AND is_admin = true
        )
    );

-- 7. Indexy
CREATE INDEX IF NOT EXISTS idx_quiz_chords_active
    ON piano.piano_quiz_chords(is_active);

CREATE INDEX IF NOT EXISTS idx_quiz_chords_difficulty
    ON piano.piano_quiz_chords(difficulty);

CREATE INDEX IF NOT EXISTS idx_quiz_chord_options_chord_id
    ON piano.piano_quiz_chord_options(chord_id);

-- 8. Funkce pro automatickou aktualizaci updated_at
CREATE OR REPLACE FUNCTION piano.update_quiz_chord_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_quiz_chord_timestamp
    BEFORE UPDATE ON piano.piano_quiz_chords
    FOR EACH ROW
    EXECUTE FUNCTION piano.update_quiz_chord_updated_at();

-- 9. Oprávnění
GRANT SELECT ON piano.piano_quiz_chords TO anon, authenticated;
GRANT SELECT ON piano.piano_quiz_chord_options TO anon, authenticated;
GRANT ALL ON piano.piano_quiz_chords TO authenticated;
GRANT ALL ON piano.piano_quiz_chord_options TO authenticated;

-- Hotovo!
-- Admin může nyní spravovat akordy v kvízu včetně možností odpovědí
