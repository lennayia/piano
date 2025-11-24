/**
 * Script pro vložení teoretických kvízů do databáze
 * Typy: interval, scale, rhythm, mixed
 * Datum: 2024-11-24
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Načtení env proměnných z .env souboru
const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length) {
    envVars[key.trim()] = value.join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Chyba: VITE_SUPABASE_URL nebo VITE_SUPABASE_ANON_KEY nejsou nastaveny v .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Definice všech otázek
const quizzes = [
  // ============================================
  // INTERVALY (5 otázek)
  // ============================================
  {
    name: 'Kolik půltónů má velká tercie?',
    quiz_type: 'interval',
    category: 'Intervaly',
    difficulty: 'easy',
    display_order: 1,
    options: [
      { option_name: '4', is_correct: true, display_order: 1 },
      { option_name: '3', is_correct: false, display_order: 2 },
      { option_name: '5', is_correct: false, display_order: 3 },
      { option_name: '2', is_correct: false, display_order: 4 }
    ]
  },
  {
    name: 'Kolik půltónů má čistá kvinta?',
    quiz_type: 'interval',
    category: 'Intervaly',
    difficulty: 'easy',
    display_order: 2,
    options: [
      { option_name: '7', is_correct: true, display_order: 1 },
      { option_name: '6', is_correct: false, display_order: 2 },
      { option_name: '8', is_correct: false, display_order: 3 },
      { option_name: '5', is_correct: false, display_order: 4 }
    ]
  },
  {
    name: 'Jaký interval obsahuje 6 půltónů?',
    quiz_type: 'interval',
    category: 'Intervaly',
    difficulty: 'medium',
    display_order: 3,
    options: [
      { option_name: 'Tritonus', is_correct: true, display_order: 1 },
      { option_name: 'Kvarta', is_correct: false, display_order: 2 },
      { option_name: 'Kvinta', is_correct: false, display_order: 3 },
      { option_name: 'Sexta', is_correct: false, display_order: 4 }
    ]
  },
  {
    name: 'Kolik půltónů má malá septima?',
    quiz_type: 'interval',
    category: 'Intervaly',
    difficulty: 'medium',
    display_order: 4,
    options: [
      { option_name: '10', is_correct: true, display_order: 1 },
      { option_name: '9', is_correct: false, display_order: 2 },
      { option_name: '11', is_correct: false, display_order: 3 },
      { option_name: '8', is_correct: false, display_order: 4 }
    ]
  },
  {
    name: 'Který interval má 12 půltónů?',
    quiz_type: 'interval',
    category: 'Intervaly',
    difficulty: 'easy',
    display_order: 5,
    options: [
      { option_name: 'Oktáva', is_correct: true, display_order: 1 },
      { option_name: 'Nóna', is_correct: false, display_order: 2 },
      { option_name: 'Septima', is_correct: false, display_order: 3 },
      { option_name: 'Decima', is_correct: false, display_order: 4 }
    ]
  },

  // ============================================
  // STUPNICE (5 otázek)
  // ============================================
  {
    name: 'Kolik křížků má G dur?',
    quiz_type: 'scale',
    category: 'Stupnice',
    difficulty: 'easy',
    display_order: 1,
    options: [
      { option_name: '1 křížek (Fis)', is_correct: true, display_order: 1 },
      { option_name: '2 křížky', is_correct: false, display_order: 2 },
      { option_name: 'Žádný', is_correct: false, display_order: 3 },
      { option_name: '3 křížky', is_correct: false, display_order: 4 }
    ]
  },
  {
    name: 'Kolik béček má F dur?',
    quiz_type: 'scale',
    category: 'Stupnice',
    difficulty: 'easy',
    display_order: 2,
    options: [
      { option_name: '1 béčko (B)', is_correct: true, display_order: 1 },
      { option_name: '2 béčka', is_correct: false, display_order: 2 },
      { option_name: 'Žádné', is_correct: false, display_order: 3 },
      { option_name: '3 béčka', is_correct: false, display_order: 4 }
    ]
  },
  {
    name: 'Jaká je paralelní mollová stupnice k C dur?',
    quiz_type: 'scale',
    category: 'Stupnice',
    difficulty: 'easy',
    display_order: 3,
    options: [
      { option_name: 'A moll', is_correct: true, display_order: 1 },
      { option_name: 'E moll', is_correct: false, display_order: 2 },
      { option_name: 'D moll', is_correct: false, display_order: 3 },
      { option_name: 'G moll', is_correct: false, display_order: 4 }
    ]
  },
  {
    name: 'Kolik křížků má D dur?',
    quiz_type: 'scale',
    category: 'Stupnice',
    difficulty: 'medium',
    display_order: 4,
    options: [
      { option_name: '2 křížky (Fis, Cis)', is_correct: true, display_order: 1 },
      { option_name: '1 křížek', is_correct: false, display_order: 2 },
      { option_name: '3 křížky', is_correct: false, display_order: 3 },
      { option_name: '4 křížky', is_correct: false, display_order: 4 }
    ]
  },
  {
    name: 'Která stupnice má 4 křížky?',
    quiz_type: 'scale',
    category: 'Stupnice',
    difficulty: 'medium',
    display_order: 5,
    options: [
      { option_name: 'E dur', is_correct: true, display_order: 1 },
      { option_name: 'D dur', is_correct: false, display_order: 2 },
      { option_name: 'A dur', is_correct: false, display_order: 3 },
      { option_name: 'H dur', is_correct: false, display_order: 4 }
    ]
  },

  // ============================================
  // RYTMUS (5 otázek)
  // ============================================
  {
    name: 'Kolik čtvrťových not se vejde do 4/4 taktu?',
    quiz_type: 'rhythm',
    category: 'Rytmus',
    difficulty: 'easy',
    display_order: 1,
    options: [
      { option_name: '4', is_correct: true, display_order: 1 },
      { option_name: '3', is_correct: false, display_order: 2 },
      { option_name: '5', is_correct: false, display_order: 3 },
      { option_name: '2', is_correct: false, display_order: 4 }
    ]
  },
  {
    name: 'Jaká je hodnota půlové noty?',
    quiz_type: 'rhythm',
    category: 'Rytmus',
    difficulty: 'easy',
    display_order: 2,
    options: [
      { option_name: '2 doby', is_correct: true, display_order: 1 },
      { option_name: '1 doba', is_correct: false, display_order: 2 },
      { option_name: '3 doby', is_correct: false, display_order: 3 },
      { option_name: '4 doby', is_correct: false, display_order: 4 }
    ]
  },
  {
    name: 'Kolik osminových not se vejde do 3/4 taktu?',
    quiz_type: 'rhythm',
    category: 'Rytmus',
    difficulty: 'medium',
    display_order: 3,
    options: [
      { option_name: '6', is_correct: true, display_order: 1 },
      { option_name: '8', is_correct: false, display_order: 2 },
      { option_name: '4', is_correct: false, display_order: 3 },
      { option_name: '12', is_correct: false, display_order: 4 }
    ]
  },
  {
    name: 'Co znamená tečka za notou?',
    quiz_type: 'rhythm',
    category: 'Rytmus',
    difficulty: 'easy',
    display_order: 4,
    options: [
      { option_name: 'Prodlužuje o polovinu', is_correct: true, display_order: 1 },
      { option_name: 'Zkracuje o polovinu', is_correct: false, display_order: 2 },
      { option_name: 'Zdvojnásobí', is_correct: false, display_order: 3 },
      { option_name: 'Nic', is_correct: false, display_order: 4 }
    ]
  },
  {
    name: 'Kolik celých not se vejde do 4/4 taktu?',
    quiz_type: 'rhythm',
    category: 'Rytmus',
    difficulty: 'easy',
    display_order: 5,
    options: [
      { option_name: '1', is_correct: true, display_order: 1 },
      { option_name: '2', is_correct: false, display_order: 2 },
      { option_name: '4', is_correct: false, display_order: 3 },
      { option_name: '0', is_correct: false, display_order: 4 }
    ]
  },

  // ============================================
  // MIX (5 otázek)
  // ============================================
  {
    name: 'Jaký akord vznikne spojením tónů C-E-G?',
    quiz_type: 'mixed',
    category: 'Mix',
    difficulty: 'easy',
    display_order: 1,
    options: [
      { option_name: 'C dur', is_correct: true, display_order: 1 },
      { option_name: 'C moll', is_correct: false, display_order: 2 },
      { option_name: 'G dur', is_correct: false, display_order: 3 },
      { option_name: 'F dur', is_correct: false, display_order: 4 }
    ]
  },
  {
    name: 'Kolik linek má notová osnova?',
    quiz_type: 'mixed',
    category: 'Mix',
    difficulty: 'easy',
    display_order: 2,
    options: [
      { option_name: '5', is_correct: true, display_order: 1 },
      { option_name: '4', is_correct: false, display_order: 2 },
      { option_name: '6', is_correct: false, display_order: 3 },
      { option_name: '7', is_correct: false, display_order: 4 }
    ]
  },
  {
    name: 'Co je to enharmonická záměna?',
    quiz_type: 'mixed',
    category: 'Mix',
    difficulty: 'hard',
    display_order: 3,
    options: [
      { option_name: 'Různý zápis stejného tónu', is_correct: true, display_order: 1 },
      { option_name: 'Změna tempa', is_correct: false, display_order: 2 },
      { option_name: 'Modulace', is_correct: false, display_order: 3 },
      { option_name: 'Transpozice', is_correct: false, display_order: 4 }
    ]
  },
  {
    name: 'Jaký je rozdíl mezi durem a mollem?',
    quiz_type: 'mixed',
    category: 'Mix',
    difficulty: 'medium',
    display_order: 4,
    options: [
      { option_name: 'Tercie (velká vs malá)', is_correct: true, display_order: 1 },
      { option_name: 'Kvinta', is_correct: false, display_order: 2 },
      { option_name: 'Tónika', is_correct: false, display_order: 3 },
      { option_name: 'Prima', is_correct: false, display_order: 4 }
    ]
  },
  {
    name: 'Co znamená legato?',
    quiz_type: 'mixed',
    category: 'Mix',
    difficulty: 'medium',
    display_order: 5,
    options: [
      { option_name: 'Vázaná hra', is_correct: true, display_order: 1 },
      { option_name: 'Odtržená hra', is_correct: false, display_order: 2 },
      { option_name: 'Hlasitá hra', is_correct: false, display_order: 3 },
      { option_name: 'Tichá hra', is_correct: false, display_order: 4 }
    ]
  }
];

async function insertQuizzes() {
  console.log('🚀 Začínám vkládat teoretické kvízy...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const quiz of quizzes) {
    try {
      // 1. Vložit otázku
      const { data: question, error: questionError } = await supabase
        .schema('piano')
        .from('piano_quiz_chords')
        .insert([{
          name: quiz.name,
          quiz_type: quiz.quiz_type,
          notes: null,
          category: quiz.category,
          difficulty: quiz.difficulty,
          is_active: true,
          display_order: quiz.display_order
        }])
        .select()
        .single();

      if (questionError) {
        console.error(`❌ Chyba při vkládání otázky "${quiz.name}":`, questionError.message);
        errorCount++;
        continue;
      }

      console.log(`✅ Vložena otázka: ${quiz.name} (ID: ${question.id})`);

      // 2. Vložit možnosti odpovědí
      const optionsToInsert = quiz.options.map(opt => ({
        chord_id: question.id,
        option_name: opt.option_name,
        is_correct: opt.is_correct,
        display_order: opt.display_order
      }));

      const { error: optionsError } = await supabase
        .schema('piano')
        .from('piano_quiz_chord_options')
        .insert(optionsToInsert);

      if (optionsError) {
        console.error(`❌ Chyba při vkládání možností pro "${quiz.name}":`, optionsError.message);
        errorCount++;
        continue;
      }

      console.log(`   └─ Vloženy možnosti: ${quiz.options.map(o => o.option_name).join(', ')}\n`);
      successCount++;

    } catch (err) {
      console.error(`❌ Neočekávaná chyba při zpracování "${quiz.name}":`, err);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 SHRNUTÍ:');
  console.log(`   ✅ Úspěšně vloženo: ${successCount} otázek`);
  console.log(`   ❌ Chyby: ${errorCount}`);
  console.log('='.repeat(50) + '\n');

  if (successCount > 0) {
    console.log('🎉 Teoretické kvízy byly úspěšně přidány do databáze!');
    console.log('💡 Nyní je můžeš vidět v admin panelu v záložkách Intervaly, Stupnice, Rytmus a Mix.');
  }
}

// Spustit skript
insertQuizzes()
  .then(() => {
    console.log('\n✨ Hotovo!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 Fatální chyba:', err);
    process.exit(1);
  });
