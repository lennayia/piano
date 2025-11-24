// Check piano_quiz_theory in public schema
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

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

console.log('🔍 Zkoušíme načíst z různých schémat...\n');

// 1. Zkusíme public schema (default)
console.log('📊 Schema: PUBLIC');
const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

const { data: publicData, error: publicError } = await supabasePublic
  .from('piano_quiz_theory')
  .select('*')
  .limit(10);

if (publicError) {
  console.log('❌ Public schema error:', publicError.message);
} else {
  console.log('✅ Public schema: našel', publicData?.length || 0, 'záznamů');
  if (publicData && publicData.length > 0) {
    console.log('\nPrvní záznam:');
    console.log(JSON.stringify(publicData[0], null, 2));
  }
}

// 2. Zkusíme piano schema
console.log('\n📊 Schema: PIANO');
const supabasePiano = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'piano' }
});

const { data: pianoData, error: pianoError } = await supabasePiano
  .from('piano_quiz_theory')
  .select('*')
  .limit(10);

if (pianoError) {
  console.log('❌ Piano schema error:', pianoError.message);
} else {
  console.log('✅ Piano schema: našel', pianoData?.length || 0, 'záznamů');
  if (pianoData && pianoData.length > 0) {
    console.log('\nPrvní záznam:');
    console.log(JSON.stringify(pianoData[0], null, 2));
  }
}

console.log('\n✨ Hotovo!\n');
