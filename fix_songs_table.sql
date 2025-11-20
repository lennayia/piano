-- ============================================================
-- FIX piano_songs TABLE - Upravit strukturu pro aplikaci
-- ============================================================

-- Smazat starou tabulku pokud existuje
DROP TABLE IF EXISTS piano.piano_songs CASCADE;

-- Vytvořit novou tabulku s správnou strukturou
CREATE TABLE piano.piano_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  notes TEXT NOT NULL, -- Formát: D_D_E_-_F nebo pole oddělené podtržítky
  lyrics TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('začátečník', 'mírně pokročilý', 'pokročilý')),
  tempo TEXT, -- Např. "Allegro", "Moderato"
  key TEXT, -- Např. "C dur", "G dur"
  tips TEXT, -- Tipy pro harmonizaci
  audio_url TEXT, -- URL na audio soubor v Supabase Storage
  order_index INTEGER, -- Pořadí zobrazení
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pro pořadí
CREATE INDEX IF NOT EXISTS idx_piano_songs_order ON piano.piano_songs(order_index);
CREATE INDEX IF NOT EXISTS idx_piano_songs_difficulty ON piano.piano_songs(difficulty);

-- RLS Policies
ALTER TABLE piano.piano_songs ENABLE ROW LEVEL SECURITY;

-- Každý může číst aktivní písničky
CREATE POLICY "Každý může číst písničky"
  ON piano.piano_songs FOR SELECT
  TO anon, authenticated
  USING (true);

-- Každý může vytvářet/upravovat písničky (pro jednoduchý vývoj, později omezit na adminy)
CREATE POLICY "Každý může upravovat písničky"
  ON piano.piano_songs FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Oprávnění
GRANT SELECT, INSERT, UPDATE, DELETE ON piano.piano_songs TO anon, authenticated;

-- Trigger pro updated_at
CREATE TRIGGER update_piano_songs_updated_at
  BEFORE UPDATE ON piano.piano_songs
  FOR EACH ROW
  EXECUTE FUNCTION piano.update_updated_at_column();

-- ============================================================
-- SEED DATA - Základní písničky
-- ============================================================

INSERT INTO piano.piano_songs (title, notes, lyrics, difficulty, tempo, key, tips, order_index) VALUES
(
  'Ovčáci, čtveráci',
  'C_C_D_E_|_F_F_E_D_|_C_E_G_G_|_C''',
  'Ovčáci, čtveráci
Sedláčci, čtveráci
Vstávajte
Beránky pasejte
Čtyřikrát psička štěká,
Čtyřikrát do dlaní tleská',
  'začátečník',
  'Moderato',
  'C dur',
  'Jednoduchá melodie v C dur. Akordová doprovod: C - F - C - G - C',
  1
),
(
  'Pec nám spadla',
  'G_G_A_G_F_E_|_D_D_E_F_E_D_|_C_C_D_E_D_C_|_G_G_A_G_F_E',
  'Pec nám spadla, pec,
spadla nám na zem celá pec,
a my nemáme peníze,
aby sme postavili novú pec',
  'začátečník',
  'Allegro',
  'C dur',
  'Rytmická lidová píseň. Zkuste harmonizovat s akordy C, G7, F',
  2
),
(
  'Ach synku, synku',
  'E_E_F_G_|_G_F_E_D_|_C_C_D_E_|_E._D_D',
  'Ach synku, synku,
synu milý můj,
Tatíček umírá,
žehná rodině',
  'mírně pokročilý',
  'Andante',
  'C dur',
  'Pomalá, nostalgická melodie. Použijte jemnou harmonii: C - Am - F - G',
  3
);

-- ============================================================
-- HOTOVO!
-- ============================================================
