import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Music, BookOpen, HelpCircle, CheckCircle, AlertCircle, X } from 'lucide-react';
import { sortNotesByKeyboard } from '../../utils/noteUtils';
import TabButtons, { HelpPanel } from '../ui/TabButtons';
import { RADIUS, SHADOW, BORDER } from '../../utils/styleConstants';
import { HelpButton, ActionButton, AddButton, Chip, CancelButton, SaveButton, NoteButton } from '../ui/ButtonComponents';
import { RadioLabel, FormLabel, FormTextarea, FormSelect, FormInput, CheckboxLabel, FormSection, FormContainer } from '../ui/FormComponents';
import { PageCard, QuestionCard } from '../ui/CardComponents';
import UniversalQuizManager from './UniversalQuizManager';

// Normalizace názvu akordu
const normalizeChordName = (name) => {
  if (!name) return '';

  // Převedeme na string a trimujeme
  let normalized = name.toString().trim();

  // Nahradíme pomlčky a podtržítka mezerou
  normalized = normalized.replace(/[-_]/g, ' ');

  // Převedeme na správný formát: první písmeno velké
  normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();

  // Opravy pro běžné varianty
  normalized = normalized
    .replace(/\bmoll\b/gi, 'moll')
    .replace(/\bdur\b/gi, 'dur')
    .replace(/\bm\b/gi, 'moll') // "Am" -> "A moll"
    .replace(/([A-H])(is|es)?\s*(moll|dur)/gi, (match, note, accidental, type) => {
      // Formátujeme: "C dur", "Fis moll", "Des dur"
      const acc = accidental ? accidental.toLowerCase() : '';
      return `${note.toUpperCase()}${acc} ${type.toLowerCase()}`;
    });

  // Ošetříme mezery (max 1 mezera mezi slovy)
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
};

// Normalizace tónů (přidání mezer mezi tóny)
const normalizeNotes = (notesString) => {
  if (!notesString) return '';

  // Odstraníme čárky, pomlčky, dvojité mezery
  let normalized = notesString.toString().trim()
    .replace(/[,\-_]/g, ' ')
    .replace(/\s+/g, ' ');

  // Rozdělíme na jednotlivé tóny a normalizujeme
  const notes = normalized.split(' ')
    .map(note => note.trim())
    .filter(note => note.length > 0)
    .map(note => {
      // Převedeme první písmeno na velké
      return note.charAt(0).toUpperCase() + note.slice(1);
    });

  // Spojíme zpět s mezerou
  return notes.join(' ');
};

const QuizManager = () => {
  const [chords, setChords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [editingChord, setEditingChord] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeQuizType, setActiveQuizType] = useState('chord');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    quiz_type: 'chord',
    questionText: '', // NOVÉ: volitelný text otázky pro vytvoření teoretického kvízu
    notes: [],
    category: '',
    difficulty: 'easy',
    is_active: true,
    display_order: 0,
    options: [
      { option_name: '', is_correct: true, display_order: 1 },
      { option_name: '', is_correct: false, display_order: 2 },
      { option_name: '', is_correct: false, display_order: 3 },
      { option_name: '', is_correct: false, display_order: 4 }
    ],
    theoryOptions: [ // NOVÉ: separátní možnosti pro teoretický kvíz
      { option_name: '', is_correct: true, display_order: 1 },
      { option_name: '', is_correct: false, display_order: 2 },
      { option_name: '', is_correct: false, display_order: 3 },
      { option_name: '', is_correct: false, display_order: 4 }
    ]
  });

  // Typy kvízů
  const QUIZ_TYPES = [
    { id: 'chord', label: 'Akordy', icon: Music },
    { id: 'theory', label: 'Teorie', icon: BookOpen },
    { id: 'interval', label: 'Intervaly', icon: Music },
    { id: 'scale', label: 'Stupnice', icon: Music },
    { id: 'rhythm', label: 'Rytmus', icon: Music },
    { id: 'mixed', label: 'Mix', icon: Music }
  ];

  // Rozsah klaviatury podle PianoKeyboard komponenty
  const NOTES_MALA_OKTAVA = ['A.', 'A#.', 'H.'];  // malá oktáva (a, ais, h)
  const NOTES_OKTAVA_1 = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'H'];  // oktáva 1
  const NOTES_OKTAVA_2 = ["C''", "C#''", "D''", "D#''", "E''"];  // oktáva 2
  const AVAILABLE_NOTES = [...NOTES_MALA_OKTAVA, ...NOTES_OKTAVA_1, ...NOTES_OKTAVA_2];
  const DIFFICULTY_LEVELS = [
    { value: 'easy', label: 'Snadné' },
    { value: 'medium', label: 'Střední' },
    { value: 'hard', label: 'Těžké' }
  ];

  useEffect(() => {
    fetchChords();
    // Reset formulář při změně tabu
    setShowAddForm(false);
    setEditingChord(null);
    // Aktualizovat quiz_type ve formData podle aktivní záložky
    setFormData(prev => ({ ...prev, quiz_type: activeQuizType }));
  }, [activeQuizType]);

  const fetchChords = async () => {
    try {
      setLoading(true);
      setError(null);

      // Načteme kvízy podle typu s jejich možnostmi
      const { data: chordsData, error: chordsError } = await supabase
        .from('piano_quiz_chords')
        .select(`
          *,
          piano_quiz_chord_options (*)
        `)
        .eq('quiz_type', activeQuizType)
        .order('display_order');

      if (chordsError) throw chordsError;

      // Pro chord typ načteme i teoretické otázky
      if (activeQuizType === 'chord' && chordsData) {
        const { data: theoryQuizzes } = await supabase
          .from('piano_quiz_chords')
          .select('id, name, category')
          .eq('quiz_type', 'theory');

        // Přidáme teoretické otázky k akordům
        const chordsWithTheory = chordsData.map(chord => {
          // Najdeme teoretickou otázku pro tento akord
          const theoryQuestion = theoryQuizzes?.find(theory => {
            // Pokud mají stejnou kategorii nebo obě nemají kategorii
            const categoryMatch = chord.category
              ? theory.category === chord.category
              : !theory.category;

            // A název teoretické otázky obsahuje název akordu
            const nameMatch = theory.name?.toLowerCase().includes(chord.name.toLowerCase());

            return categoryMatch && nameMatch;
          });

          return {
            ...chord,
            theoryQuestion
          };
        });

        setChords(chordsWithTheory);
      } else {
        setChords(chordsData || []);
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Nepodařilo se načíst kvízy: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChord = () => {
    setShowAddForm(true);
    setEditingChord(null);
    setFormData({
      name: '',
      quiz_type: activeQuizType,
      questionText: '', // NOVÉ: prázdný text otázky
      notes: activeQuizType === 'chord' ? [] : null,
      category: '',
      difficulty: 'easy',
      is_active: true,
      display_order: chords.length + 1,
      options: [
        { option_name: '', is_correct: true, display_order: 1 },
        { option_name: '', is_correct: false, display_order: 2 },
        { option_name: '', is_correct: false, display_order: 3 },
        { option_name: '', is_correct: false, display_order: 4 }
      ],
      theoryOptions: [
        { option_name: '', is_correct: true, display_order: 1 },
        { option_name: '', is_correct: false, display_order: 2 },
        { option_name: '', is_correct: false, display_order: 3 },
        { option_name: '', is_correct: false, display_order: 4 }
      ]
    });
  };

  const handleEditChord = async (chord) => {
    // Pokud už editujeme tento akord, zavřít editaci
    if (editingChord === chord.id) {
      setEditingChord(null);
      return;
    }

    setEditingChord(chord.id);
    setShowAddForm(false); // NEzobrazíme horní formulář, ale inline

    // Seřadíme možnosti podle display_order
    const sortedOptions = [...(chord.piano_quiz_chord_options || [])].sort(
      (a, b) => a.display_order - b.display_order
    );

    // Převedeme možnosti na správný formát s option_name
    const formattedOptions = sortedOptions.length > 0
      ? sortedOptions.map(opt => ({
          option_name: opt.option_name || '',
          is_correct: opt.is_correct || false,
          display_order: opt.display_order || 1
        }))
      : [
          { option_name: '', is_correct: true, display_order: 1 },
          { option_name: '', is_correct: false, display_order: 2 },
          { option_name: '', is_correct: false, display_order: 3 },
          { option_name: '', is_correct: false, display_order: 4 }
        ];

    // Pokud editujeme poslechový kvíz (chord), zkusíme najít existující teoretickou otázku
    let theoryQuestionText = '';
    let theoryOptionsData = [
      { option_name: '', is_correct: true, display_order: 1 },
      { option_name: '', is_correct: false, display_order: 2 },
      { option_name: '', is_correct: false, display_order: 3 },
      { option_name: '', is_correct: false, display_order: 4 }
    ];

    if (chord.quiz_type === 'chord') {
      try {
        let query = supabase
          .from('piano_quiz_chords')
          .select(`
            id,
            name,
            piano_quiz_chord_options (*)
          `)
          .eq('quiz_type', 'theory');

        // Správné porovnání s NULL
        if (chord.category) {
          query = query.eq('category', chord.category);
        } else {
          query = query.is('category', null);
        }

        const { data: theoryQuizzes } = await query;

        // Najdeme teoretickou otázku, která obsahuje název akordu
        if (theoryQuizzes && theoryQuizzes.length > 0) {
          const matching = theoryQuizzes.find(q =>
            q.name && q.name.toLowerCase().includes(chord.name.toLowerCase())
          );
          if (matching) {
            theoryQuestionText = matching.name;

            // Načteme možnosti teoretického kvízu
            if (matching.piano_quiz_chord_options && matching.piano_quiz_chord_options.length > 0) {
              const sortedTheoryOptions = [...matching.piano_quiz_chord_options].sort(
                (a, b) => a.display_order - b.display_order
              );
              theoryOptionsData = sortedTheoryOptions.map(opt => ({
                option_name: opt.option_name || '',
                is_correct: opt.is_correct || false,
                display_order: opt.display_order || 1
              }));
            }
          }
        }
      } catch (err) {
        console.error('Error loading theory question:', err);
      }
    }

    setFormData({
      name: chord.name,
      quiz_type: chord.quiz_type || 'chord',
      questionText: theoryQuestionText, // Načteme text teoretické otázky, pokud existuje
      notes: chord.notes ? sortNotesByKeyboard(chord.notes) : [],
      category: chord.category || '',
      difficulty: chord.difficulty,
      is_active: chord.is_active,
      display_order: chord.display_order,
      options: formattedOptions,
      theoryOptions: theoryOptionsData // NOVÉ: načteme možnosti teoretického kvízu
    });
  };

  const handleDuplicateChord = async (chord) => {
    try {
      const chordData = {
        name: `${chord.name} (kopie)`,
        quiz_type: chord.quiz_type,
        notes: chord.notes,
        category: chord.category || null,
        difficulty: chord.difficulty,
        is_active: chord.is_active,
        display_order: chords.length + 1
      };

      const { data: newChord, error: chordError } = await supabase
        .from('piano_quiz_chords')
        .insert([chordData])
        .select()
        .single();

      if (chordError) throw chordError;

      // Zkopírujeme options
      const optionsToCopy = chord.piano_quiz_chord_options?.map(opt => ({
        chord_id: newChord.id,
        option_name: opt.option_name,
        is_correct: opt.is_correct,
        display_order: opt.display_order
      })) || [];

      if (optionsToCopy.length > 0) {
        const { error: optionsError } = await supabase
          .from('piano_quiz_chord_options')
          .insert(optionsToCopy);

        if (optionsError) throw optionsError;
      }

      showSuccess('Akord byl úspěšně duplikován');
      fetchChords();
    } catch (err) {
      console.error('Error duplicating chord:', err);
      setError('Nepodařilo se duplikovat akord: ' + err.message);
    }
  };

  const handleDeleteChord = async (chordId) => {
    if (!confirm('Opravdu chcete smazat tento akord? Tato akce je nevratná.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('piano_quiz_chords')
        .delete()
        .eq('id', chordId);

      if (error) throw error;

      showSuccess('Akord byl úspěšně smazán');
      fetchChords();
    } catch (err) {
      console.error('Error deleting chord:', err);
      setError('Nepodařilo se smazat akord: ' + err.message);
    }
  };

  const handleSaveChord = async () => {
    try {
      // Validace
      if (!formData.name.trim()) {
        setError(activeQuizType === 'chord' ? 'Název akordu je povinný' : 'Text otázky je povinný');
        return;
      }
      if (activeQuizType === 'chord' && formData.notes.length === 0) {
        setError('Vyberte alespoň jednu notu');
        return;
      }

      setError(null);

      if (editingChord) {
        // UPDATE existujícího akordu
        const updateData_obj = {
          name: normalizeChordName(formData.name), // Normalizujeme název
          quiz_type: formData.quiz_type,
          difficulty: formData.difficulty,
          is_active: formData.is_active,
          display_order: formData.display_order,
          category: formData.category || null
        };

        // Přidat noty pouze pro akordový kvíz
        if (formData.quiz_type === 'chord') {
          updateData_obj.notes = sortNotesByKeyboard(formData.notes);
        } else {
          updateData_obj.notes = null;
        }

        const { data: updateData, error: updateError } = await supabase
          .from('piano_quiz_chords')
          .update(updateData_obj)
          .eq('id', editingChord)
          .select();

        // Pokud se nic neaktualizovalo, je problém s RLS
        if (!updateData || updateData.length === 0) {
          throw new Error('Aktualizace selhala - pravděpodobně nemáte oprávnění upravovat akordy (RLS policy)');
        }

        if (updateError) throw updateError;

        // Pro chord typ se možnosti NEGENERUJÍ ručně - generují se automaticky v UI
        // Možnosti ukládáme pouze pro teoretický kvíz

        // NOVÉ: Pokud je vyplněn text otázky, vytvoříme DRUHÝ záznam jako teoretický kvíz
        const filledTheoryOptions = formData.theoryOptions.filter(opt => opt.option_name && opt.option_name.trim());

        if (formData.questionText && formData.questionText.trim() && filledTheoryOptions.length === 4) {
          // Validace theoretical options
          const correctTheoryAnswers = filledTheoryOptions.filter(opt => opt.is_correct);
          if (correctTheoryAnswers.length !== 1) {
            setError('Teoretický kvíz musí mít právě jednu správnou odpověď');
            return;
          }

          // Nejprve zkontrolujeme, jestli už teoretický kvíz pro tento akord existuje
          let theoryQuery = supabase
            .from('piano_quiz_chords')
            .select('id, name')
            .eq('quiz_type', 'theory');

          // Správné porovnání s NULL
          if (formData.category) {
            theoryQuery = theoryQuery.eq('category', formData.category);
          } else {
            theoryQuery = theoryQuery.is('category', null);
          }

          const { data: allTheoryQuizzes } = await theoryQuery;

          // Najdeme teoretickou otázku, která obsahuje název akordu
          const existingTheory = allTheoryQuizzes?.find(q =>
            q.name && q.name.toLowerCase().includes(formData.name.toLowerCase())
          );

          if (existingTheory) {
            // Aktualizujeme existující teoretický kvíz
            const theoryUpdateData = {
              name: formData.questionText.trim(),
              difficulty: formData.difficulty,
              is_active: formData.is_active,
              display_order: formData.display_order + 1000
            };

            await supabase
              .from('piano_quiz_chords')
              .update(theoryUpdateData)
              .eq('id', existingTheory.id);

            // Aktualizujeme odpovědi - používáme theoryOptions!
            await supabase
              .from('piano_quiz_chord_options')
              .delete()
              .eq('chord_id', existingTheory.id);

            const theoryOptionsToInsert = filledTheoryOptions.map(opt => ({
              chord_id: existingTheory.id,
              option_name: normalizeNotes(opt.option_name),
              is_correct: opt.is_correct,
              display_order: opt.display_order
            }));

            await supabase
              .from('piano_quiz_chord_options')
              .insert(theoryOptionsToInsert);

            showSuccess('Akord i teoretický kvíz byly úspěšně aktualizovány');
          } else {
            // Vytvoříme nový teoretický kvíz
            const theoryData_obj = {
              name: formData.questionText.trim(),
              quiz_type: 'theory',
              notes: null,
              difficulty: formData.difficulty,
              is_active: formData.is_active,
              display_order: formData.display_order + 1000,
              category: formData.category || null
            };

            const { data: theoryQuiz, error: theoryInsertError } = await supabase
              .from('piano_quiz_chords')
              .insert([theoryData_obj])
              .select()
              .single();

            if (theoryInsertError) throw theoryInsertError;

            // Používáme theoryOptions!
            const theoryOptionsToInsert = filledTheoryOptions.map(opt => ({
              chord_id: theoryQuiz.id,
              option_name: normalizeNotes(opt.option_name),
              is_correct: opt.is_correct,
              display_order: opt.display_order
            }));

            await supabase
              .from('piano_quiz_chord_options')
              .insert(theoryOptionsToInsert);

            showSuccess('Akord byl úspěšně aktualizován a teoretický kvíz byl přidán');
          }
        } else {
          showSuccess('Akord byl úspěšně aktualizován');
        }
      } else {
        // INSERT nového kvízu
        const insertData_obj = {
          name: normalizeChordName(formData.name), // Normalizujeme název
          quiz_type: formData.quiz_type,
          difficulty: formData.difficulty,
          is_active: formData.is_active,
          display_order: formData.display_order,
          category: formData.category || null
        };

        // Přidat noty pouze pro akordový kvíz
        if (formData.quiz_type === 'chord') {
          insertData_obj.notes = sortNotesByKeyboard(formData.notes);
        } else {
          insertData_obj.notes = null;
        }

        const { data: newChord, error: insertError } = await supabase
          .from('piano_quiz_chords')
          .insert([insertData_obj])
          .select()
          .single();

        if (insertError) throw insertError;

        // Pro chord typ se možnosti NEGENERUJÍ ručně - generují se automaticky v UI
        // Možnosti ukládáme pouze pro teoretický kvíz

        // NOVÉ: Pokud je vyplněn text otázky, vytvoříme DRUHÝ záznam jako teoretický kvíz
        const filledTheoryOptions = formData.theoryOptions.filter(opt => opt.option_name && opt.option_name.trim());

        if (formData.questionText && formData.questionText.trim() && filledTheoryOptions.length === 4) {
          // Validace theoretical options
          const correctTheoryAnswers = filledTheoryOptions.filter(opt => opt.is_correct);
          if (correctTheoryAnswers.length !== 1) {
            setError('Teoretický kvíz musí mít právě jednu správnou odpověď');
            return;
          }

          const theoryData_obj = {
            name: formData.questionText.trim(), // Text otázky jako název
            quiz_type: 'theory',
            notes: null, // Teoretické otázky nemají noty
            difficulty: formData.difficulty,
            is_active: formData.is_active,
            display_order: formData.display_order + 1000, // Vyšší pořadí než akordové kvízy
            category: formData.category || null
          };

          const { data: theoryQuiz, error: theoryInsertError } = await supabase
            .from('piano_quiz_chords')
            .insert([theoryData_obj])
            .select()
            .single();

          if (theoryInsertError) throw theoryInsertError;

          // Používáme theoryOptions!
          const theoryOptionsToInsert = filledTheoryOptions.map(opt => ({
            chord_id: theoryQuiz.id,
            option_name: normalizeNotes(opt.option_name), // Normalizujeme tóny
            is_correct: opt.is_correct,
            display_order: opt.display_order
          }));

          const { error: theoryOptionsError } = await supabase
            .from('piano_quiz_chord_options')
            .insert(theoryOptionsToInsert);

          if (theoryOptionsError) throw theoryOptionsError;

          showSuccess('Akord i teoretický kvíz byly úspěšně přidány');
        } else {
          showSuccess('Akord byl úspěšně přidán');
        }
      }

      setShowAddForm(false);
      setEditingChord(null);
      fetchChords();
    } catch (err) {
      console.error('Error saving chord:', err);
      setError('Nepodařilo se uložit akord: ' + err.message);
    }
  };

  const handleToggleActive = async (chordId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('piano_quiz_chords')
        .update({ is_active: !currentStatus })
        .eq('id', chordId);

      if (error) throw error;

      showSuccess(`Akord byl ${!currentStatus ? 'aktivován' : 'deaktivován'}`);
      fetchChords();
    } catch (err) {
      console.error('Error toggling active status:', err);
      setError('Nepodařilo se změnit stav: ' + err.message);
    }
  };

  const handleNoteToggle = (note) => {
    setFormData(prev => ({
      ...prev,
      notes: prev.notes.includes(note)
        ? prev.notes.filter(n => n !== note)
        : [...prev.notes, note]
    }));
  };

  const handleOptionChange = (index, field, value) => {
    setFormData(prev => {
      const newOptions = [...prev.options];

      // Pokud měníme is_correct na true, ostatní nastavíme na false
      if (field === 'is_correct' && value === true) {
        newOptions.forEach((opt, i) => {
          opt.is_correct = i === index;
        });
      } else {
        newOptions[index] = { ...newOptions[index], [field]: value };
      }

      return { ...prev, options: newOptions };
    });
  };

  const handleTheoryOptionChange = (index, field, value) => {
    setFormData(prev => {
      const newOptions = [...prev.theoryOptions];

      // Pokud měníme is_correct na true, ostatní nastavíme na false
      if (field === 'is_correct' && value === true) {
        newOptions.forEach((opt, i) => {
          opt.is_correct = i === index;
        });
      } else {
        newOptions[index] = { ...newOptions[index], [field]: value };
      }

      return { ...prev, theoryOptions: newOptions };
    });
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Music size={48} color="var(--color-primary)" style={{ animation: 'pulse 1.5s infinite' }} />
        <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Načítám akordy...</p>
      </div>
    );
  }

  const getQuizTypeLabel = () => {
    const type = QUIZ_TYPES.find(t => t.id === activeQuizType);
    return type ? type.label : 'Kvízy';
  };

  const getQuizTypeIcon = () => {
    const type = QUIZ_TYPES.find(t => t.id === activeQuizType);
    const Icon = type ? type.icon : Music;
    return <Icon size={24} color="var(--color-primary)" />;
  };

  // Pokud je vybraná záložka != "chord", zobrazíme UniversalQuizManager
  if (activeQuizType !== 'chord') {
    const quizConfig = {
      theory: { title: 'Správa kvízů - Teorie', icon: BookOpen },
      interval: { title: 'Správa kvízů - Intervaly', icon: Music },
      scale: { title: 'Správa kvízů - Stupnice', icon: Music },
      rhythm: { title: 'Správa kvízů - Rytmus', icon: Music },
      mixed: { title: 'Správa kvízů - Mix', icon: Music }
    };

    const config = quizConfig[activeQuizType] || { title: 'Správa kvízů', icon: BookOpen };

    return (
      <PageCard>
        {/* Záložky pro typy kvízů */}
        <div style={{ marginBottom: '2rem' }}>
          <TabButtons
            tabs={QUIZ_TYPES}
            activeTab={activeQuizType}
            onTabChange={setActiveQuizType}
            options={{ layout: 'pill', size: 'sm' }}
          />
        </div>

        {/* Univerzální modul pro správu kvízů */}
        <UniversalQuizManager
          quizType={activeQuizType}
          title={config.title}
          icon={config.icon}
        />
      </PageCard>
    );
  }

  // Pro ostatní typy zobrazíme původní ChordManager
  return (
    <PageCard>
      {/* Záložky pro typy kvízů */}
      <div style={{ marginBottom: '2rem' }}>
        <TabButtons
          tabs={QUIZ_TYPES}
          activeTab={activeQuizType}
          onTabChange={setActiveQuizType}
          options={{ layout: 'pill', size: 'sm' }}
        />
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {getQuizTypeIcon()}
            Správa kvízů - {getQuizTypeLabel()}
          </h2>

          {/* Help Button */}
          <HelpButton onClick={() => setShowHelp(!showHelp)} isActive={showHelp} />
        </div>

        {!showAddForm && !editingChord && (
          <AddButton onClick={handleAddChord} />
        )}
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              background: 'rgba(45, 91, 120, 0.1)',
              border: '1px solid var(--color-secondary)',
              borderRadius: RADIUS.sm,
              padding: '0.75rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem'
            }}
          >
            <CheckCircle size={20} color="var(--color-secondary)" />
            <span style={{ color: 'var(--color-secondary)', fontWeight: '500' }}>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              background: 'rgba(181, 31, 101, 0.1)',
              border: '1px solid var(--color-primary)',
              borderRadius: RADIUS.sm,
              padding: '0.75rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem'
            }}
          >
            <AlertCircle size={20} color="var(--color-primary)" />
            <span style={{ color: 'var(--color-primary)', fontWeight: '500' }}>{error}</span>
            <X
              size={18}
              color="var(--color-primary)"
              style={{ marginLeft: 'auto', cursor: 'pointer' }}
              onClick={() => setError(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Panel */}
      <HelpPanel
        isOpen={showHelp}
        title="Nápověda - Správa akordů"
        content={{
          steps: [
            'Klikněte na "Přidat akord"',
            'Zadejte název akordu (např. "C dur", "Am", "F#m")',
            'Vyberte noty, které akord tvoří',
            'Nastavte obtížnost (snadné/střední/těžké)',
            'Zadejte 4 možnosti odpovědí a označte správnou',
            'Uložte akord'
          ],
          tips: [
            'Vždy musí být právě jedna správná odpověď',
            'Všechny 4 možnosti musí mít vyplněný název',
            'Neaktivní akordy se nezobrazí v kvízu',
            'Pořadí zobrazení určuje pole "Pořadí"',
            'Rozsah klaviatury: Malá oktáva (A., A#., H.) + Oktáva 1 (C-H) + Oktáva 2 (C²-E²)'
          ]
        }}
      />

      {/* Add/Edit Form */}
      <AnimatePresence mode="wait">
        {showAddForm && !editingChord && (
          <FormContainer
            as={motion.div}
            key={editingChord || 'new'}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>
              {editingChord
                ? (activeQuizType === 'chord' ? 'Upravit akord' : 'Upravit otázku')
                : (activeQuizType === 'chord' ? 'Přidat nový akord' : 'Přidat novou otázku')
              }
            </h4>

            {/* SEKCE 1: Poslechový kvíz (primary barva) - pouze pro akordový typ */}
            {formData.quiz_type === 'chord' && (
              <FormSection
                title="🎵 Poslechový kvíz"
                variant="primary"
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: BORDER.none,
                  boxShadow: SHADOW.default,
                  borderRadius: RADIUS.lg
                }}
              >

                {/* Název akordu */}
                <div style={{ marginBottom: '1rem' }}>
                  <FormLabel text="Název akordu" required />
                  <FormInput
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="např. C dur, A moll, Fis moll"
                  />
                </div>

                {/* Výběr not */}
                <div style={{ marginBottom: '0' }}>
                  <FormLabel text="Noty akordu (vyberte kliknutím)" required />

              {/* Malá oktáva - pouze a, ais, h */}
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
                  Malá oktáva (c - h, náš rozsah pouze a - h):
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {NOTES_MALA_OKTAVA.map(note => (
                    <NoteButton
                      key={note}
                      note={note.replace('.', '')}
                      selected={formData.notes.includes(note)}
                      onClick={() => handleNoteToggle(note)}
                      variant="secondary"
                    />
                  ))}
                </div>
              </div>

              {/* Oktáva 1 (c1 - h1) */}
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
                  Oktáva 1 (c1 - h1):
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {NOTES_OKTAVA_1.map(note => (
                    <NoteButton
                      key={note}
                      note={note}
                      selected={formData.notes.includes(note)}
                      onClick={() => handleNoteToggle(note)}
                      variant="primary"
                    />
                  ))}
                </div>
              </div>

              {/* Oktáva 2 - pouze c2 - e2 */}
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
                  Oktáva 2 (c2 - h2, náš rozsah pouze c2 - e2):
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {NOTES_OKTAVA_2.map(note => (
                    <NoteButton
                      key={note}
                      note={note.replace("''", "²")}
                      selected={formData.notes.includes(note)}
                      onClick={() => handleNoteToggle(note)}
                      variant="secondary"
                    />
                  ))}
                </div>
              </div>
                </div>

                <div style={{ marginTop: '0.625rem', fontSize: '0.75rem', color: '#64748b' }}>
                  Vybrané noty: {formData.notes.length > 0 ? sortNotesByKeyboard(formData.notes).join(', ') : 'žádné'}
                </div>

                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(45, 91, 120, 0.05)', borderRadius: RADIUS.lg, border: '1px solid rgba(45, 91, 120, 0.2)' }}>
                  <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                    💡 Možnosti odpovědí pro poslechový kvíz se <strong>generují automaticky</strong> z dostupných akordů v databázi. Nemusíte je zadávat ručně!
                  </p>
                </div>
              </FormSection>
            )}

            {/* Pro neakordové typy - zobrazit standardní název/otázku */}
            {formData.quiz_type !== 'chord' && (
              <div style={{ marginBottom: '1rem' }}>
                <FormLabel text="Text otázky" required />
                <FormTextarea
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Zadejte text otázky..."
                  rows={3}
                />
              </div>
            )}

            {/* Kategorie (volitelná) */}
            {formData.quiz_type !== 'chord' && (
              <div style={{ marginBottom: '1rem' }}>
                <FormLabel text="Kategorie (volitelná)" />
                <FormInput
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="např. Notová soustava, Hudební teorie..."
                />
              </div>
            )}

            {/* Obtížnost a Pořadí */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <FormLabel text="Obtížnost" />
                <FormSelect
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  options={DIFFICULTY_LEVELS}
                />
              </div>

              <div>
                <FormLabel text="Pořadí" />
                <FormInput
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <CheckboxLabel
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  label="Aktivní"
                />
              </div>
            </div>

            {/* SEKCE 2: Teoretický kvíz (secondary barva) - pouze pro akordový typ */}
            {formData.quiz_type === 'chord' && (
              <FormSection
                title="📝 Teoretický kvíz (volitelné)"
                variant="secondary"
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: BORDER.none,
                  boxShadow: SHADOW.default,
                  borderRadius: RADIUS.lg
                }}
              >

                {/* Text otázky */}
                <div style={{ marginBottom: '1rem' }}>
                  <FormLabel text="Text otázky (volitelné)" />
                  <FormTextarea
                    value={formData.questionText}
                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                    placeholder="např. Které tóny tvoří akord C dur?"
                    rows={2}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', marginBottom: 0 }}>
                    💡 Pokud vyplníte text otázky + 4 možnosti odpovědí níže, vytvoří se automaticky i teoretický kvíz. Teoretický kvíz je <strong>zcela volitelný</strong> a nezávislý na poslechovém kvízu.
                  </p>
                </div>

                {/* Možnosti odpovědí pro teoretický kvíz */}
                <div style={{ marginBottom: '0' }}>
                  <FormLabel text="Možnosti odpovědí pro teoretický kvíz (4 možnosti)" />
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', marginBottom: '0.75rem' }}>
                    💡 Zadejte 4 možnosti pro teoretickou otázku (např. jednotlivé tóny C A D H - oddělené mezerou - nebo jiné odpovědi). Tyto možnosti jsou SAMOSTATNÉ a neovlivní poslechový kvíz výše.
                  </p>
                  {formData.theoryOptions.map((option, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                        alignItems: 'center',
                        background: option.is_correct ? 'rgba(45, 91, 120, 0.05)' : 'transparent',
                        padding: '0.5rem',
                        borderRadius: RADIUS.lg,
                        border: option.is_correct ? '1px solid var(--color-secondary)' : '1px solid transparent'
                      }}
                    >
                      <span style={{ fontWeight: 600, minWidth: '25px', fontSize: '0.875rem' }}>{index + 1}.</span>
                      <FormInput
                        type="text"
                        value={option.option_name}
                        onChange={(e) => handleTheoryOptionChange(index, 'option_name', e.target.value)}
                        placeholder={`Možnost ${index + 1}`}
                        style={{ flex: 1 }}
                      />
                      <RadioLabel
                        checked={option.is_correct}
                        onChange={() => handleTheoryOptionChange(index, 'is_correct', true)}
                        name="correct_answer_theory"
                      />
                    </div>
                  ))}
                </div>
              </FormSection>
            )}

            {/* Pro neakordové typy - zobrazit možnosti odpovědí samostatně */}
            {formData.quiz_type !== 'chord' && (
              <div style={{ marginBottom: '1rem' }}>
                <FormLabel text="Možnosti odpovědí (4 možnosti)" required />
                {formData.options.map((option, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                      alignItems: 'center',
                      background: option.is_correct ? 'rgba(45, 91, 120, 0.05)' : 'transparent',
                      padding: '0.5rem',
                      borderRadius: RADIUS.lg,
                      border: option.is_correct ? '1px solid var(--color-secondary)' : '1px solid transparent'
                    }}
                  >
                    <span style={{ fontWeight: 600, minWidth: '25px', fontSize: '0.875rem' }}>{index + 1}.</span>
                    <FormInput
                      type="text"
                      value={option.option_name}
                      onChange={(e) => handleOptionChange(index, 'option_name', e.target.value)}
                      placeholder={`Možnost ${index + 1}`}
                      style={{ flex: 1 }}
                    />
                    <RadioLabel
                      checked={option.is_correct}
                      onChange={() => handleOptionChange(index, 'is_correct', true)}
                      name="correct_answer"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Tlačítka */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <CancelButton
                onClick={() => {
                  setShowAddForm(false);
                  setEditingChord(null);
                  setError(null);
                }}
              />
              <SaveButton onClick={handleSaveChord} />
            </div>
          </FormContainer>
        )}
      </AnimatePresence>

      {/* Seznam akordů */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {chords.map((chord) => (
          <React.Fragment key={chord.id}>
            {editingChord === chord.id ? (
              /* Inline editační formulář - plný formulář zobrazený přímo v kartě */
              <FormContainer
                as={motion.div}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>
                  Upravit akord
                </h4>

                {/* SEKCE 1: Poslechový kvíz (primary barva) */}
                <FormSection
                  title="🎵 Poslechový kvíz"
                  variant="primary"
                  style={{
                    background: 'rgba(255, 255, 255, 0.65)',
                    border: BORDER.none,
                    boxShadow: SHADOW.default,
                    borderRadius: RADIUS.lg
                  }}
                >
                  {/* Název akordu */}
                  <div style={{ marginBottom: '1rem' }}>
                    <FormLabel text="Název akordu" required />
                    <FormInput
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="např. C dur, A moll, Fis moll"
                    />
                  </div>

                  {/* Výběr not */}
                  <div style={{ marginBottom: '0' }}>
                    <FormLabel text="Noty akordu (vyberte kliknutím)" required />

                    {/* Malá oktáva - pouze a, ais, h */}
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
                        Malá oktáva (c - h, náš rozsah pouze a - h):
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {NOTES_MALA_OKTAVA.map(note => (
                          <NoteButton
                            key={note}
                            note={note.replace('.', '')}
                            selected={formData.notes.includes(note)}
                            onClick={() => handleNoteToggle(note)}
                            variant="secondary"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Oktáva 1 (c1 - h1) */}
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
                        Oktáva 1 (c1 - h1):
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {NOTES_OKTAVA_1.map(note => (
                          <NoteButton
                            key={note}
                            note={note}
                            selected={formData.notes.includes(note)}
                            onClick={() => handleNoteToggle(note)}
                            variant="primary"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Oktáva 2 - pouze c2 - e2 */}
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
                        Oktáva 2 (c2 - h2, náš rozsah pouze c2 - e2):
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {NOTES_OKTAVA_2.map(note => (
                          <NoteButton
                            key={note}
                            note={note.replace("''", "²")}
                            selected={formData.notes.includes(note)}
                            onClick={() => handleNoteToggle(note)}
                            variant="secondary"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.625rem', fontSize: '0.75rem', color: '#64748b' }}>
                    Vybrané noty: {formData.notes.length > 0 ? sortNotesByKeyboard(formData.notes).join(', ') : 'žádné'}
                  </div>

                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(45, 91, 120, 0.05)', borderRadius: RADIUS.lg, border: '1px solid rgba(45, 91, 120, 0.2)' }}>
                    <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                      💡 Možnosti odpovědí pro poslechový kvíz se <strong>generují automaticky</strong> z dostupných akordů v databázi. Nemusíte je zadávat ručně!
                    </p>
                  </div>
                </FormSection>

                {/* Obtížnost a Pořadí */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <FormLabel text="Obtížnost" />
                    <FormSelect
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      options={DIFFICULTY_LEVELS}
                    />
                  </div>

                  <div>
                    <FormLabel text="Pořadí" />
                    <FormInput
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <CheckboxLabel
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      label="Aktivní"
                    />
                  </div>
                </div>

                {/* SEKCE 2: Teoretický kvíz (secondary barva) */}
                <FormSection
                  title="📝 Teoretický kvíz (volitelné)"
                  variant="secondary"
                  style={{
                    background: 'rgba(255, 255, 255, 0.65)',
                    border: BORDER.none,
                    boxShadow: SHADOW.default,
                    borderRadius: RADIUS.lg
                  }}
                >
                  {/* Text otázky */}
                  <div style={{ marginBottom: '1rem' }}>
                    <FormLabel text="Text otázky (volitelné)" />
                    <FormTextarea
                      value={formData.questionText}
                      onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                      placeholder="např. Které tóny tvoří akord C dur?"
                      rows={2}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', marginBottom: 0 }}>
                      💡 Pokud vyplníte text otázky + 4 možnosti odpovědí níže, vytvoří se automaticky i teoretický kvíz. Teoretický kvíz je <strong>zcela volitelný</strong> a nezávislý na poslechovém kvízu.
                    </p>
                  </div>

                  {/* Možnosti odpovědí pro teoretický kvíz */}
                  <div style={{ marginBottom: '0' }}>
                    <FormLabel text="Možnosti odpovědí pro teoretický kvíz (4 možnosti)" />
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', marginBottom: '0.75rem' }}>
                      💡 Zadejte 4 možnosti pro teoretickou otázku (např. jednotlivé tóny C A D H - oddělené mezerou - nebo jiné odpovědi). Tyto možnosti jsou SAMOSTATNÉ a neovlivní poslechový kvíz výše.
                    </p>
                    {formData.theoryOptions.map((option, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                          alignItems: 'center',
                          background: option.is_correct ? 'rgba(45, 91, 120, 0.05)' : 'transparent',
                          padding: '0.5rem',
                          borderRadius: RADIUS.lg,
                          border: option.is_correct ? '1px solid var(--color-secondary)' : '1px solid transparent'
                        }}
                      >
                        <span style={{ fontWeight: 600, minWidth: '25px', fontSize: '0.875rem' }}>{index + 1}.</span>
                        <FormInput
                          type="text"
                          value={option.option_name}
                          onChange={(e) => handleTheoryOptionChange(index, 'option_name', e.target.value)}
                          placeholder={`Možnost ${index + 1}`}
                          style={{ flex: 1 }}
                        />
                        <RadioLabel
                          checked={option.is_correct}
                          onChange={() => handleTheoryOptionChange(index, 'is_correct', true)}
                          name="correct_answer_theory_edit"
                        />
                      </div>
                    ))}
                  </div>
                </FormSection>

                {/* Tlačítka */}
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <CancelButton
                    onClick={() => {
                      setEditingChord(null);
                      setError(null);
                    }}
                  />
                  <SaveButton onClick={handleSaveChord} />
                </div>
              </FormContainer>
            ) : (
              /* Normální karta akordu */
              <QuestionCard
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01, y: -2 }}
                isActive={chord.is_active}
              >
                <div style={{ flex: 1 }}>
                  {/* Řádek 1: Text otázky + chip obtížnosti a status vpravo */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1rem', flex: 1 }}>
                      {chord.theoryQuestion?.name || chord.name}
                    </h3>
                    <Chip
                      text={chord.difficulty === 'easy' ? '1' : chord.difficulty === 'medium' ? '2' : '3'}
                      variant="difficulty"
                      level={chord.difficulty === 'easy' ? 1 : chord.difficulty === 'medium' ? 2 : 3}
                    />
                    {!chord.is_active && (
                      <Chip text="Neaktivní" variant="inactive" />
                    )}
                  </div>

                  {/* Řádek 2: Chipy odpovědí + action buttony vpravo */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {chord.piano_quiz_chord_options
                      ?.sort((a, b) => a.display_order - b.display_order)
                      .map((opt, idx) => (
                        <Chip
                          key={idx}
                          text={opt.option_name}
                          variant="answer"
                          isCorrect={opt.is_correct}
                        />
                      ))}
                    <div style={{ display: 'flex', gap: '0.375rem', marginLeft: 'auto' }}>
                      <ActionButton
                        variant="edit"
                        onClick={() => handleEditChord(chord)}
                      />
                      <ActionButton
                        variant="duplicate"
                        onClick={() => handleDuplicateChord(chord)}
                      />
                      <ActionButton
                        variant="delete"
                        onClick={() => handleDeleteChord(chord.id)}
                      />
                    </div>
                  </div>
                </div>
              </QuestionCard>
            )}
          </React.Fragment>
        ))}

        {chords.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1.25rem' }}>
            <Music size={48} color="var(--color-primary)" style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
            <p style={{ marginTop: '1.25rem', color: '#64748b', fontSize: '1rem' }}>
              Zatím nejsou žádné akordy. Přidejte první akord pro kvíz!
            </p>
          </div>
        )}
      </div>
    </PageCard>
  );
};

export default QuizManager;
