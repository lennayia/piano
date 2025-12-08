-- Migration: Přidání možnosti customizace ikon a zvuků pro odměny
-- Datum: 2025-11-20

-- Přidání nových sloupců do tabulky piano_achievements
ALTER TABLE piano.piano_achievements
ADD COLUMN IF NOT EXISTS icon_type VARCHAR(50) DEFAULT 'Trophy',
ADD COLUMN IF NOT EXISTS icon_color VARCHAR(20) DEFAULT 'primary',
ADD COLUMN IF NOT EXISTS celebration_sound VARCHAR(50) DEFAULT 'achievement';

-- Aktualizace existujících záznamů s novými ikonami
UPDATE piano.piano_achievements SET
    icon_type = 'Piano',
    icon_color = 'primary'
WHERE title = 'První kroky';

UPDATE piano.piano_achievements SET
    icon_type = 'BookOpen',
    icon_color = 'secondary'
WHERE title = 'Aktivní student';

UPDATE piano.piano_achievements SET
    icon_type = 'GraduationCap',
    icon_color = 'primary'
WHERE title = 'Piano mistr';

UPDATE piano.piano_achievements SET
    icon_type = 'Flame',
    icon_color = 'secondary'
WHERE title = 'Týdenní série';

UPDATE piano.piano_achievements SET
    icon_type = 'Star',
    icon_color = 'primary'
WHERE title = 'Měsíční série';

UPDATE piano.piano_achievements SET
    icon_type = 'Target',
    icon_color = 'secondary'
WHERE title = '100 XP';

UPDATE piano.piano_achievements SET
    icon_type = 'Trophy',
    icon_color = 'primary'
WHERE title = '500 XP';

-- Přidání komentářů pro dokumentaci
COMMENT ON COLUMN piano.piano_achievements.icon_type IS 'Název Lucide ikony (např. Star, Trophy, Cake, Medal, Award, GraduationCap, etc.)';
COMMENT ON COLUMN piano.piano_achievements.icon_color IS 'Barva ikony: primary (růžová) nebo secondary (modrá)';
COMMENT ON COLUMN piano.piano_achievements.celebration_sound IS 'Název zvuku pro oslavu (achievement, fanfare, success, etc.)';
