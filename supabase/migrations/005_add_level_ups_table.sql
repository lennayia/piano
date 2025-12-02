-- Migration: Add level ups history table
-- Date: 2025-01-25
-- Description: Tabulka pro ukládání level-up událostí

-- Nastavit search_path pro schéma piano
SET search_path TO piano, public;

-- Vytvořit tabulku pro level-up události
CREATE TABLE IF NOT EXISTS piano.piano_level_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES piano.piano_users(id) ON DELETE CASCADE,
  old_level INTEGER NOT NULL,
  new_level INTEGER NOT NULL,
  total_xp INTEGER NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Přidat komentáře
COMMENT ON TABLE piano.piano_level_ups IS 'Historie level-up událostí uživatelů';
COMMENT ON COLUMN piano.piano_level_ups.old_level IS 'Předchozí level';
COMMENT ON COLUMN piano.piano_level_ups.new_level IS 'Nový level';
COMMENT ON COLUMN piano.piano_level_ups.total_xp IS 'Celkové XP v době level-upu';

-- Vytvořit indexy pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_level_ups_user_id ON piano.piano_level_ups(user_id);
CREATE INDEX IF NOT EXISTS idx_level_ups_achieved_at ON piano.piano_level_ups(achieved_at DESC);

-- RLS policies
ALTER TABLE piano.piano_level_ups ENABLE ROW LEVEL SECURITY;

-- Policy: Uživatelé mohou vidět své level-upy
CREATE POLICY "Users can view their own level ups"
  ON piano.piano_level_ups
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Systém může vkládat level-upy (přes service_role)
CREATE POLICY "Service can insert level ups"
  ON piano.piano_level_ups
  FOR INSERT
  WITH CHECK (true);
