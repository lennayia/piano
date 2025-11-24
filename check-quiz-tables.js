// Check all quiz-related tables in Supabase
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env file manually
const envFile = readFileSync('.env', 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'piano'
  }
});

async function checkTables() {
  console.log('🔍 Kontroluji kvízové tabulky...\n');

  // Zkusím dotazovat různé tabulky
  const tablesToCheck = [
    'piano_quiz_chords',
    'piano_quiz_theory',
    'piano_quiz_intervals',
    'piano_quiz_scales',
    'piano_quiz_rhythm',
    'piano_quiz_mixed',
    'piano_quiz_chord_options',
    'piano_quiz_theory_options'
  ];

  for (const tableName of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        console.log(`✅ ${tableName}: ${count} záznamů`);
      } else if (error.code === '42P01') {
        console.log(`❌ ${tableName}: Tabulka neexistuje`);
      } else {
        console.log(`⚠️  ${tableName}: Chyba - ${error.message}`);
      }
    } catch (err) {
      console.log(`💥 ${tableName}: ${err.message}`);
    }
  }

  console.log('\n📊 Detailní pohled na piano_quiz_theory:\n');

  // Zkusím načíst strukturu piano_quiz_theory
  const { data: theoryData, error: theoryError } = await supabase
    .from('piano_quiz_theory')
    .select('*')
    .limit(1);

  if (theoryError) {
    console.error('❌ Chyba při načítání piano_quiz_theory:', theoryError);
  } else if (theoryData && theoryData.length > 0) {
    console.log('Sloupce v piano_quiz_theory:');
    console.log(Object.keys(theoryData[0]));
    console.log('\nPrvní záznam:');
    console.log(JSON.stringify(theoryData[0], null, 2));
  }

  console.log('\n✨ Hotovo!\n');
}

checkTables();
