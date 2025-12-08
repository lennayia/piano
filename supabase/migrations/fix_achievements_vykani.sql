-- Oprava textů achievementů z tykání na vykání
-- Spusťte tento SQL příkaz v Supabase SQL Editoru

UPDATE piano.piano_achievements
SET description = 'Dokončili jste svoji první lekci!'
WHERE title = 'První kroky';

UPDATE piano.piano_achievements
SET description = 'Dokončili jste 5 lekcí!'
WHERE title = 'Aktivní student';

UPDATE piano.piano_achievements
SET description = 'Dokončili jste 10 lekcí!'
WHERE title = 'Piano mistr';

UPDATE piano.piano_achievements
SET description = 'Udrželi jste 7denní sérii!'
WHERE title = 'Týdenní série';

UPDATE piano.piano_achievements
SET description = 'Udrželi jste 30denní sérii!'
WHERE title = 'Měsíční série';

UPDATE piano.piano_achievements
SET description = 'Získali jste 100 XP!'
WHERE title = '100 XP';

UPDATE piano.piano_achievements
SET description = 'Získali jste 500 XP!'
WHERE title = '500 XP';
