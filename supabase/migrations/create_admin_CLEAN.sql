-- KROK 1: Nastavit heslo pro admin účet
UPDATE auth.users
SET encrypted_password = crypt('Lenna69++', gen_salt('bf'))
WHERE email = 'lenkaroubalka@seznam.cz';

-- KROK 2: Vytvořit admin databázový záznam
DO $$
DECLARE
    admin_user_id UUID;
    auth_user_id UUID;
    piano_user_id UUID;
BEGIN
    SELECT id INTO auth_user_id
    FROM auth.users
    WHERE email = 'lenkaroubalka@seznam.cz'
    LIMIT 1;

    IF auth_user_id IS NULL THEN
        RAISE EXCEPTION 'Uživatel s emailem lenkaroubalka@seznam.cz nebyl nalezen v auth.users';
    END IF;

    SELECT id INTO piano_user_id
    FROM piano.piano_users
    WHERE email = 'lenkaroubalka@seznam.cz'
    LIMIT 1;

    IF piano_user_id IS NOT NULL THEN
        admin_user_id := piano_user_id;
        UPDATE piano.piano_users
        SET
            first_name = 'Lenna',
            last_name = 'Roubalová',
            is_admin = true,
            updated_at = NOW()
        WHERE id = admin_user_id;
    ELSE
        admin_user_id := auth_user_id;
        INSERT INTO piano.piano_users (id, email, first_name, last_name, is_admin, created_at, updated_at)
        VALUES (
            admin_user_id,
            'lenkaroubalka@seznam.cz',
            'Lenna',
            'Roubalová',
            true,
            NOW(),
            NOW()
        );
    END IF;

    INSERT INTO piano.piano_user_stats (user_id, total_xp, level, lessons_completed, current_streak, best_streak, total_practice_time, last_activity_date)
    VALUES (
        admin_user_id,
        0,
        1,
        0,
        0,
        0,
        0,
        CURRENT_DATE
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_xp = EXCLUDED.total_xp,
        level = EXCLUDED.level,
        lessons_completed = EXCLUDED.lessons_completed,
        current_streak = EXCLUDED.current_streak,
        best_streak = EXCLUDED.best_streak,
        total_practice_time = EXCLUDED.total_practice_time,
        last_activity_date = EXCLUDED.last_activity_date;

    RAISE NOTICE 'Admin účet byl úspěšně vytvořen! UUID: %', admin_user_id;
END $$;

-- KROK 3: Ověření
SELECT
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.is_admin,
    u.created_at
FROM piano.piano_users u
WHERE u.email = 'lenkaroubalka@seznam.cz';
