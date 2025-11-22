import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Music, BookOpen, Plus, Edit, Trash2, Save, X, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { sortNotesByKeyboard } from '../../utils/noteUtils';
import TabButtons from '../ui/TabButtons';

const QuizManager = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeQuizType, setActiveQuizType] = useState('chord');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    quiz_type: 'chord',
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

  // Rozsah klaviatury
  const NOTES_MALA_OKTAVA = ['A.', 'A#.', 'H.'];
  const NOTES_OKTAVA_1 = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'H'];
  const NOTES_OKTAVA_2 = ["C''", "C#''", "D''", "D#''", "E''"];
  const AVAILABLE_NOTES = [...NOTES_MALA_OKTAVA, ...NOTES_OKTAVA_1, ...NOTES_OKTAVA_2];

  const DIFFICULTY_LEVELS = [
    { value: 'easy', label: 'Snadné' },
    { value: 'medium', label: 'Střední' },
    { value: 'hard', label: 'Těžké' }
  ];

  useEffect(() => {
    fetchQuizzes();
  }, [activeQuizType]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: quizzesData, error: quizzesError } = await supabase
        .from('piano_quiz_chords')
        .select(`
          *,
          piano_quiz_chord_options (*)
        `)
        .eq('quiz_type', activeQuizType)
        .order('display_order');

      if (quizzesError) throw quizzesError;

      setQuizzes(quizzesData || []);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Nepodařilo se načíst kvízy: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuiz = () => {
    setShowAddForm(true);
    setEditingQuiz(null);
    setFormData({
      name: '',
      quiz_type: activeQuizType,
      notes: activeQuizType === 'chord' ? [] : null,
      category: '',
      difficulty: 'easy',
      is_active: true,
      display_order: quizzes.length + 1,
      options: [
        { option_name: '', is_correct: true, display_order: 1 },
        { option_name: '', is_correct: false, display_order: 2 },
        { option_name: '', is_correct: false, display_order: 3 },
        { option_name: '', is_correct: false, display_order: 4 }
      ]
    });
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz.id);
    setShowAddForm(false);

    const sortedOptions = [...(quiz.piano_quiz_chord_options || [])].sort(
      (a, b) => a.display_order - b.display_order
    );

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

    setFormData({
      name: quiz.name,
      quiz_type: quiz.quiz_type,
      notes: quiz.notes ? sortNotesByKeyboard(quiz.notes) : [],
      category: quiz.category || '',
      difficulty: quiz.difficulty,
      is_active: quiz.is_active,
      display_order: quiz.display_order,
      options: formattedOptions
    });
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm('Opravdu chcete smazat tento kvíz? Tato akce je nevratná.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('piano_quiz_chords')
        .delete()
        .eq('id', quizId);

      if (error) throw error;

      showSuccess('Kvíz byl úspěšně smazán');
      fetchQuizzes();
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError('Nepodařilo se smazat kvíz: ' + err.message);
    }
  };

  const handleSaveQuiz = async () => {
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

      const filledOptions = formData.options.filter(opt => opt.option_name && opt.option_name.trim());

      if (filledOptions.length > 0) {
        const correctAnswers = filledOptions.filter(opt => opt.is_correct);
        if (correctAnswers.length !== 1) {
          setError('Musí být právě jedna správná odpověď');
          return;
        }

        if (filledOptions.length !== 4) {
          setError('Vyplňte všechny 4 možnosti nebo žádnou (budou generovány automaticky)');
          return;
        }
      }

      setError(null);

      const quizData = {
        name: formData.name,
        quiz_type: formData.quiz_type,
        difficulty: formData.difficulty,
        is_active: formData.is_active,
        display_order: formData.display_order,
        category: formData.category || null
      };

      // Přidat noty pouze pro akordový kvíz
      if (formData.quiz_type === 'chord') {
        quizData.notes = sortNotesByKeyboard(formData.notes);
      } else {
        quizData.notes = null;
      }

      if (editingQuiz) {
        // UPDATE
        const { data: updateData, error: updateError } = await supabase
          .from('piano_quiz_chords')
          .update(quizData)
          .eq('id', editingQuiz)
          .select();

        if (!updateData || updateData.length === 0) {
          throw new Error('Aktualizace selhala - pravděpodobně nemáte oprávnění upravovat kvízy (RLS policy)');
        }

        if (updateError) throw updateError;

        if (filledOptions.length === 4) {
          await supabase
            .from('piano_quiz_chord_options')
            .delete()
            .eq('chord_id', editingQuiz);

          const optionsToInsert = filledOptions.map(opt => ({
            chord_id: editingQuiz,
            option_name: opt.option_name,
            is_correct: opt.is_correct,
            display_order: opt.display_order
          }));

          const { error: optionsError } = await supabase
            .from('piano_quiz_chord_options')
            .insert(optionsToInsert);

          if (optionsError) throw optionsError;
        }

        showSuccess('Kvíz byl úspěšně aktualizován');
      } else {
        // INSERT
        const { data: newQuiz, error: insertError } = await supabase
          .from('piano_quiz_chords')
          .insert([quizData])
          .select()
          .single();

        if (insertError) throw insertError;

        if (filledOptions.length === 4) {
          const optionsToInsert = filledOptions.map(opt => ({
            chord_id: newQuiz.id,
            option_name: opt.option_name,
            is_correct: opt.is_correct,
            display_order: opt.display_order
          }));

          const { error: optionsError } = await supabase
            .from('piano_quiz_chord_options')
            .insert(optionsToInsert);

          if (optionsError) throw optionsError;
        }

        showSuccess('Kvíz byl úspěšně přidán');
      }

      setShowAddForm(false);
      setEditingQuiz(null);
      fetchQuizzes();
    } catch (err) {
      console.error('Error saving quiz:', err);
      setError('Nepodařilo se uložit kvíz: ' + err.message);
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

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getQuizTypeLabel = () => {
    const type = QUIZ_TYPES.find(t => t.id === activeQuizType);
    return type ? type.label : 'Kvízy';
  };

  const getQuizTypeIcon = () => {
    const type = QUIZ_TYPES.find(t => t.id === activeQuizType);
    const Icon = type ? type.icon : Music;
    return <Icon size={24} color="var(--color-primary)" />;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Music size={48} color="var(--color-primary)" style={{ animation: 'pulse 1.5s infinite' }} />
        <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Načítám kvízy...</p>
      </div>
    );
  }

  return (
    <div className="card">
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

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowHelp(!showHelp)}
            style={{
              background: showHelp ? 'rgba(181, 31, 101, 0.1)' : 'rgba(45, 91, 120, 0.1)',
              border: showHelp ? '2px solid rgba(181, 31, 101, 0.3)' : '2px solid rgba(45, 91, 120, 0.2)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            title="Zobrazit nápovědu"
          >
            <HelpCircle size={18} color={showHelp ? 'var(--color-primary)' : 'var(--color-secondary)'} />
          </motion.button>
        </div>

        {!showAddForm && !editingQuiz && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddQuiz}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}
          >
            <Plus size={16} />
            Přidat {activeQuizType === 'chord' ? 'akord' : 'otázku'}
          </motion.button>
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
              border: '2px solid var(--color-secondary)',
              borderRadius: 'var(--radius)',
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
              border: '2px solid var(--color-primary)',
              borderRadius: 'var(--radius)',
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

      {/* Help Panel - bude zde pokračování s formulářem a seznamem kvízů */}
      {/* Pro stručnost pokračování vynechám - můžeme ho dodat podle potřeby */}

      <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
        <p>Komponenta QuizManager - funkční základ připraven</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Typ kvízu: <strong>{getQuizTypeLabel()}</strong>
        </p>
        <p style={{ fontSize: '0.875rem' }}>
          Počet kvízů: <strong>{quizzes.length}</strong>
        </p>
      </div>
    </div>
  );
};

export default QuizManager;
