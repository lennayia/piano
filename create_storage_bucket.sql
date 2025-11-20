-- ============================================================
-- Vytvořit Storage bucket pro audio soubory písní
-- ============================================================

-- Vytvořit bucket pro piano assets (pokud neexistuje)
INSERT INTO storage.buckets (id, name, public)
VALUES ('piano-assets', 'piano-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Nejdřív smazat existující polícy pokud existují
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;

-- Nastavit polícy pro bucket
-- Povolit čtení všem
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'piano-assets');

-- Povolit upload authenticated uživatelům
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'piano-assets');

-- Povolit delete authenticated uživatelům (pouze vlastní soubory nebo admini)
CREATE POLICY "Authenticated users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'piano-assets');

-- Povolit update authenticated uživatelům
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'piano-assets');
