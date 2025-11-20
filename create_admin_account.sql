-- ============================================================
-- VYTVOŘENÍ ADMIN ÚČTU - DATABÁZOVÝ ZÁZNAM
-- ============================================================
-- Tento skript vytvoří admin databázový záznam pro existující Auth účet
-- Email: lenkaroubalka@seznam.cz
-- ============================================================

-- DŮLEŽITÉ: Před spuštěním tohoto skriptu resetujte heslo v Supabase Dashboard:
-- 1. Přejděte do Supabase Dashboard -> Authentication -> Users
-- 2. Najděte uživatele lenkaroubalka@seznam.cz
-- 3. Klikněte na uživatele -> 3 tečky -> "Send password reset"
-- 4. NEBO použijte SQL Editoru příkaz níže pro nastavení hesla

-- ALTERNATIVA: Nastavit heslo přímo přes SQL (vyžaduje service_role klíč):
-- UPDATE auth.users
-- SET encrypted_password = crypt('Lenna69++', gen_salt('bf'))
-- WHERE email = 'lenkaroubalka@seznam.cz';

-- ============================================================
-- VYTVOŘENÍ ADMIN DATABÁZOVÉHO ZÁZNAMU
-- ============================================================
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- MOŽNOST A: Pokud znáte UUID z Auth, použijte ho přímo
    -- admin_user_id := 'ZKOPIRUJ_SEM_UUID'::UUID;

    -- MOŽNOST B: Pokud už uživatel existuje v auth.users, najdeme ho
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'lenkaroubalka@seznam.cz'
    LIMIT 1;

    -- Pokud uživatel neexistuje, vypíšeme chybu
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Uživatel s emailem lenkaroubalka@seznam.cz nebyl nalezen v auth.users. Nejdříve vytvořte uživatele v Authentication -> Users!';
    END IF;

    -- Smazat existující záznamy pro tohoto uživatele (pokud existují)
    DELETE FROM piano.piano_user_achievements WHERE user_id = admin_user_id;
    DELETE FROM piano.piano_user_progress WHERE user_id = admin_user_id;
    DELETE FROM piano.piano_user_stats WHERE user_id = admin_user_id;
    DELETE FROM piano.piano_users WHERE id = admin_user_id;

    -- Vytvořit admin záznam v piano_users
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

    -- Vytvořit základní statistiky pro admina
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
    );

    RAISE NOTICE 'Admin účet byl úspěšně vytvořen! UUID: %', admin_user_id;
END $$;

-- ============================================================
-- OVĚŘENÍ
-- ============================================================

-- Zkontrolovat, že admin účet byl vytvořen
SELECT
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.is_admin,
    u.created_at,
    s.total_xp,
    s.level
FROM piano.piano_users u
LEFT JOIN piano.piano_user_stats s ON u.id = s.user_id
WHERE u.email = 'lenkaroubalka@seznam.cz';

-- ============================================================
-- HOTOVO! ✅
-- ============================================================
-- Nyní se můžete přihlásit s:
-- Email: lenkaroubalka@seznam.cz
-- Heslo: Lenna69++
-- ============================================================
