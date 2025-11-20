-- =====================================================
-- Migration: Kompletní systém správy odměn s customizací
-- Datum: 2025-11-20
-- Popis: Přidání možnosti admin customizace ikon, barev, zvuků
--        a přiřazování odměn k lekcím, materiálům a kvízům
-- =====================================================

-- 1. Rozšíření tabulky piano_achievements o customizaci
ALTER TABLE piano.piano_achievements
ADD COLUMN IF NOT EXISTS icon_type VARCHAR(50) DEFAULT 'Trophy',
ADD COLUMN IF NOT EXISTS icon_color VARCHAR(20) DEFAULT 'primary',
ADD COLUMN IF NOT EXISTS celebration_sound VARCHAR(50) DEFAULT 'achievement';

-- 2. Vytvoření tabulky pro triggery/podmínky odměn
CREATE TABLE IF NOT EXISTS piano.piano_achievement_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    achievement_id UUID NOT NULL REFERENCES piano.piano_achievements(id) ON DELETE CASCADE,
    trigger_type VARCHAR(50) NOT NULL, -- 'lesson', 'material', 'quiz', 'global'
    trigger_id INTEGER, -- ID lekce/materiálu/kvízu (NULL pro globální)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(achievement_id, trigger_type, trigger_id)
);

-- 3. Přidání komentářů pro dokumentaci
COMMENT ON TABLE piano.piano_achievement_triggers IS 'Definuje, kdy se odměna přidělí (po dokončení lekce, materiálu, kvízu nebo globálně)';
COMMENT ON COLUMN piano.piano_achievements.icon_type IS 'Název Lucide ikony (Star, Trophy, Cake, Medal, Award, GraduationCap, Piano, BookOpen, Flame, Target, Gift, Crown, Zap, Heart, Sparkles, etc.)';
COMMENT ON COLUMN piano.piano_achievements.icon_color IS 'Barva ikony: primary (růžová) nebo secondary (modrá)';
COMMENT ON COLUMN piano.piano_achievements.celebration_sound IS 'Název zvuku pro oslavu (achievement, fanfare, success, applause, cheer, etc.)';

-- 4. Aktualizace existujících odměn s ikonami a barvami
UPDATE piano.piano_achievements SET
    icon_type = 'Piano',
    icon_color = 'primary',
    celebration_sound = 'achievement'
WHERE title = 'První kroky';

UPDATE piano.piano_achievements SET
    icon_type = 'BookOpen',
    icon_color = 'secondary',
    celebration_sound = 'success'
WHERE title = 'Aktivní student';

UPDATE piano.piano_achievements SET
    icon_type = 'GraduationCap',
    icon_color = 'primary',
    celebration_sound = 'fanfare'
WHERE title = 'Piano mistr';

UPDATE piano.piano_achievements SET
    icon_type = 'Flame',
    icon_color = 'secondary',
    celebration_sound = 'achievement'
WHERE title = 'Týdenní série';

UPDATE piano.piano_achievements SET
    icon_type = 'Star',
    icon_color = 'primary',
    celebration_sound = 'fanfare'
WHERE title = 'Měsíční série';

UPDATE piano.piano_achievements SET
    icon_type = 'Target',
    icon_color = 'secondary',
    celebration_sound = 'success'
WHERE title = '100 XP';

UPDATE piano.piano_achievements SET
    icon_type = 'Trophy',
    icon_color = 'primary',
    celebration_sound = 'fanfare'
WHERE title = '500 XP';

-- 5. Vytvoření globálních triggerů pro existující odměny
-- (zachováme původní chování - globální podmínky)
INSERT INTO piano.piano_achievement_triggers (achievement_id, trigger_type, trigger_id)
SELECT id, 'global', NULL
FROM piano.piano_achievements
WHERE NOT EXISTS (
    SELECT 1 FROM piano.piano_achievement_triggers t
    WHERE t.achievement_id = piano.piano_achievements.id
);

-- 6. RLS politiky pro novou tabulku
ALTER TABLE piano.piano_achievement_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Každý může číst triggery odměn"
    ON piano.piano_achievement_triggers FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Pouze admin může upravovat triggery"
    ON piano.piano_achievement_triggers FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM piano.piano_users
            WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
            AND is_admin = true
        )
    );

-- 7. Funkce pro automatickou aktualizaci updated_at
CREATE OR REPLACE FUNCTION piano.update_achievement_trigger_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_achievement_trigger_timestamp
    BEFORE UPDATE ON piano.piano_achievement_triggers
    FOR EACH ROW
    EXECUTE FUNCTION piano.update_achievement_trigger_updated_at();

-- 8. Index pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_achievement_triggers_type_id
    ON piano.piano_achievement_triggers(trigger_type, trigger_id);

CREATE INDEX IF NOT EXISTS idx_achievement_triggers_achievement_id
    ON piano.piano_achievement_triggers(achievement_id);

-- 9. Oprávnění
GRANT SELECT, INSERT, UPDATE, DELETE ON piano.piano_achievement_triggers TO anon, authenticated;

-- Hotovo!
-- Po spuštění této migrace budete moci v admin rozhraní:
-- 1. Vytvářet/editovat odměny s vlastními ikonami, barvami a zvuky
-- 2. Přiřazovat odměny k lekcím, materiálům nebo kvízům
-- 3. Nebo ponechat globální podmínky (XP, streak, počet lekcí)
