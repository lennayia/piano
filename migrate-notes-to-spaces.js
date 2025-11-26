/**
 * Migrace: Změna oddělovače not z podtržítek na mezery
 *
 * Tento skript projde všechny písničky v databázi a nahradí
 * podtržítka (_) mezerami v poli 'notes'.
 *
 * Spuštění: node migrate-notes-to-spaces.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Načíst environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Chyba: VITE_SUPABASE_URL nebo VITE_SUPABASE_SERVICE_ROLE_KEY nejsou nastaveny v .env souboru');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateSongs() {
  console.log('🚀 Spouštím migraci not z podtržítek na mezery...\n');

  try {
    // 1. Načíst všechny písničky
    console.log('📖 Načítám písničky z databáze...');
    const { data: songs, error: fetchError } = await supabase
      .from('piano_songs')
      .select('*');

    if (fetchError) {
      throw new Error(`Chyba při načítání písniček: ${fetchError.message}`);
    }

    if (!songs || songs.length === 0) {
      console.log('ℹ️  Žádné písničky k migraci.');
      return;
    }

    console.log(`✅ Načteno ${songs.length} písniček\n`);

    // 2. Projít všechny písničky a nahradit podtržítka mezerami
    let updatedCount = 0;
    let skippedCount = 0;

    for (const song of songs) {
      const originalNotes = song.notes;

      // Pokud notes je null nebo prázdné, přeskočit
      if (!originalNotes) {
        console.log(`⏭️  Přeskakuji: "${song.title}" - žádné noty`);
        skippedCount++;
        continue;
      }

      // Nahradit podtržítka mezerami
      const updatedNotes = originalNotes.replace(/_/g, ' ');

      // Pokud se nic nezměnilo, přeskočit
      if (originalNotes === updatedNotes) {
        console.log(`⏭️  Přeskakuji: "${song.title}" - už používá mezery`);
        skippedCount++;
        continue;
      }

      // Aktualizovat v databázi
      const { error: updateError } = await supabase
        .from('piano_songs')
        .update({ notes: updatedNotes })
        .eq('id', song.id);

      if (updateError) {
        console.error(`❌ Chyba při aktualizaci: "${song.title}" - ${updateError.message}`);
      } else {
        console.log(`✅ Aktualizováno: "${song.title}"`);
        console.log(`   Před: ${originalNotes.substring(0, 50)}${originalNotes.length > 50 ? '...' : ''}`);
        console.log(`   Po:   ${updatedNotes.substring(0, 50)}${updatedNotes.length > 50 ? '...' : ''}`);
        updatedCount++;
      }
    }

    // 3. Výsledek
    console.log('\n' + '='.repeat(50));
    console.log(`🎉 Migrace dokončena!`);
    console.log(`   Aktualizováno: ${updatedCount} písniček`);
    console.log(`   Přeskočeno: ${skippedCount} písniček`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Chyba při migraci:', error.message);
    process.exit(1);
  }
}

// Spustit migraci
migrateSongs();
