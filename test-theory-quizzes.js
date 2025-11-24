// Test script to query theory quizzes from Supabase
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

console.log('🔧 Supabase URL:', supabaseUrl);
console.log('🔑 Anon Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...');

// Create Supabase client with piano schema
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'piano'
  }
});

async function testTheoryQuizzes() {
  console.log('\n🔍 Testing theory quiz query...\n');

  try {
    // Test 1: Query all quiz_types
    console.log('📊 Test 1: Checking all quiz types in database');
    const { data: allTypes, error: allTypesError } = await supabase
      .from('piano_quiz_chords')
      .select('quiz_type')
      .limit(100);

    if (allTypesError) {
      console.error('❌ Error fetching all quiz types:', allTypesError);
    } else {
      const uniqueTypes = [...new Set(allTypes.map(item => item.quiz_type))];
      console.log('✅ Unique quiz types found:', uniqueTypes);
      console.log('   Total records:', allTypes.length);
    }

    // Test 2: Query specifically for theory type
    console.log('\n📊 Test 2: Querying theory quizzes specifically');
    const { data: theoryData, error: theoryError } = await supabase
      .from('piano_quiz_chords')
      .select(`
        id,
        name,
        quiz_type,
        difficulty,
        is_active,
        display_order,
        piano_quiz_chord_options (
          id,
          chord_id,
          option_name,
          is_correct,
          display_order
        )
      `)
      .eq('quiz_type', 'theory')
      .order('display_order');

    if (theoryError) {
      console.error('❌ Error fetching theory quizzes:', theoryError);
      console.error('   Error details:', JSON.stringify(theoryError, null, 2));
    } else {
      console.log('✅ Theory quizzes found:', theoryData?.length || 0);

      if (theoryData && theoryData.length > 0) {
        console.log('\n📝 First theory quiz:');
        console.log(JSON.stringify(theoryData[0], null, 2));
      } else {
        console.log('⚠️  No theory quizzes found in the database!');
      }
    }

    // Test 3: Check RLS policies (this might fail if RLS is restrictive)
    console.log('\n📊 Test 3: Checking if we can SELECT from the table at all');
    const { count, error: countError } = await supabase
      .from('piano_quiz_chords')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting records (possible RLS issue):', countError);
    } else {
      console.log('✅ Total records accessible:', count);
    }

  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }

  console.log('\n✨ Test complete!\n');
}

// Run the test
testTheoryQuizzes();
