// Kontrola existence tabulek v Supabase
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Načtení .env souboru
const envFile = readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY
);

async function checkTables() {
  console.log('🔍 Kontroluji existenci tabulek v Supabase...\n');

  const tablesToCheck = [
    'piano_quiz_interval',
    'piano_quiz_scale',
    'piano_quiz_rhythm',
    'piano_quiz_mixed',
    'piano_quiz_interval_options',
    'piano_quiz_scale_options',
    'piano_quiz_rhythm_options',
    'piano_quiz_mixed_options',
    'piano_quiz_interval_completions',
    'piano_quiz_scale_completions',
    'piano_quiz_rhythm_completions',
    'piano_quiz_mixed_completions'
  ];

  const results = {};

  for (const table of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === '42P01') {
          results[table] = '❌ Neexistuje';
        } else {
          results[table] = `⚠️ Chyba: ${error.message}`;
        }
      } else {
        results[table] = `✅ Existuje (${count || 0} záznamů)`;
      }
    } catch (err) {
      results[table] = `⚠️ Chyba: ${err.message}`;
    }
  }

  // Vypiš výsledky
  console.log('📊 HLAVNÍ TABULKY (otázky):');
  console.log('  piano_quiz_interval:', results['piano_quiz_interval']);
  console.log('  piano_quiz_scale:', results['piano_quiz_scale']);
  console.log('  piano_quiz_rhythm:', results['piano_quiz_rhythm']);
  console.log('  piano_quiz_mixed:', results['piano_quiz_mixed']);

  console.log('\n📊 OPTIONS TABULKY (možnosti odpovědí):');
  console.log('  piano_quiz_interval_options:', results['piano_quiz_interval_options']);
  console.log('  piano_quiz_scale_options:', results['piano_quiz_scale_options']);
  console.log('  piano_quiz_rhythm_options:', results['piano_quiz_rhythm_options']);
  console.log('  piano_quiz_mixed_options:', results['piano_quiz_mixed_options']);

  console.log('\n📊 COMPLETIONS TABULKY (statistiky):');
  console.log('  piano_quiz_interval_completions:', results['piano_quiz_interval_completions']);
  console.log('  piano_quiz_scale_completions:', results['piano_quiz_scale_completions']);
  console.log('  piano_quiz_rhythm_completions:', results['piano_quiz_rhythm_completions']);
  console.log('  piano_quiz_mixed_completions:', results['piano_quiz_mixed_completions']);

  console.log('\n');

  // Souhrn
  const existing = Object.values(results).filter(v => v.startsWith('✅')).length;
  const missing = Object.values(results).filter(v => v.startsWith('❌')).length;
  const errors = Object.values(results).filter(v => v.startsWith('⚠️')).length;

  console.log('📈 SOUHRN:');
  console.log(`  ✅ Existuje: ${existing}/${tablesToCheck.length}`);
  console.log(`  ❌ Chybí: ${missing}/${tablesToCheck.length}`);
  console.log(`  ⚠️ Chyby: ${errors}/${tablesToCheck.length}`);

  if (missing > 0) {
    console.log('\n💡 Potřebuješ spustit:');
    if (results['piano_quiz_interval'].startsWith('❌')) {
      console.log('  1. create-quiz-tables.sql');
      console.log('  2. insert-quiz-data.sql');
    }
    if (results['piano_quiz_interval_completions'].startsWith('❌')) {
      console.log('  3. create-quiz-completion-tables.sql');
    }
  } else {
    console.log('\n🎉 Všechny tabulky existují! Můžeš začít používat TheoryQuizHub.');
  }
}

checkTables().catch(console.error);
