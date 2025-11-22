import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { BookOpen, Plus, Edit, Trash2, Save, X, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';

const TheoryQuizManager = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    question: '',
    difficulty: 'easy',
    is_active: true,
    display_order: 0,
    options: [
      { option_text: '', is_correct: true, display_order: 1 },
      { option_text: '', is_correct: false, display_order: 2 },
      { option_text: '', is_correct: false, display_order: 3 },
      { option_text: '', is_correct: false, display_order: 4 }
    ]
  });

  const DIFFICULTY_LEVELS = [
    { value: 'easy', label: 'Snadné' },
    { value: 'medium', label: 'Střední' },
    { value: 'hard', label: 'Těžké' }
  ];

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Načteme otázky s jejich možnostmi
      const { data: questionsData, error: questionsError } = await supabase
        .from('piano_quiz_theory')
        .select(`
          *,
          piano_quiz_theory_options (*)
        `)
        .order('display_order');

      if (questionsError) throw questionsError;

      setQuestions(questionsData || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Nepodařilo se načíst otázky: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setShowAddForm(true);
    setEditingQuestion(null);
    setFormData({
      question: '',
      difficulty: 'easy',
      is_active: true,
      display_order: questions.length + 1,
      options: [
        { option_text: '', is_correct: true, display_order: 1 },
        { option_text: '', is_correct: false, display_order: 2 },
        { option_text: '', is_correct: false, display_order: 3 },
        { option_text: '', is_correct: false, display_order: 4 }
      ]
    });
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question.id);
    setShowAddForm(false);

    // Seřadíme možnosti podle display_order
    const sortedOptions = [...(question.piano_quiz_theory_options || [])].sort(
      (a, b) => a.display_order - b.display_order
    );

    // Převedeme možnosti na správný formát
    const formattedOptions = sortedOptions.length > 0
      ? sortedOptions.map(opt => ({
          option_text: opt.option_text || '',
          is_correct: opt.is_correct || false,
          display_order: opt.display_order || 1
        }))
      : [
          { option_text: '', is_correct: true, display_order: 1 },
          { option_text: '', is_correct: false, display_order: 2 },
          { option_text: '', is_correct: false, display_order: 3 },
          { option_text: '', is_correct: false, display_order: 4 }
        ];

    setFormData({
      question: question.question,
      difficulty: question.difficulty,
      is_active: question.is_active,
      display_order: question.display_order,
      options: formattedOptions
    });
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Opravdu chcete smazat tuto otázku? Tato akce je nevratná.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('piano_quiz_theory')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      showSuccess('Otázka byla úspěšně smazána');
      fetchQuestions();
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Nepodařilo se smazat otázku: ' + err.message);
    }
  };

  const handleSaveQuestion = async () => {
    try {
      // Validace
      if (!formData.question.trim()) {
        setError('Text otázky je povinný');
        return;
      }

      // Zkontrolujeme jestli uživatel vyplnil všechny možnosti
      const filledOptions = formData.options.filter(opt => opt.option_text && opt.option_text.trim());

      if (filledOptions.length !== 4) {
        setError('Vyplňte všechny 4 možnosti odpovědí');
        return;
      }

      // Ověříme, že máme právě jednu správnou odpověď
      const correctAnswers = filledOptions.filter(opt => opt.is_correct);
      if (correctAnswers.length !== 1) {
        setError('Musí být právě jedna správná odpověď');
        return;
      }

      setError(null);

      if (editingQuestion) {
        // UPDATE existující otázky
        const { data: updateData, error: updateError } = await supabase
          .from('piano_quiz_theory')
          .update({
            question: formData.question,
            difficulty: formData.difficulty,
            is_active: formData.is_active,
            display_order: formData.display_order
          })
          .eq('id', editingQuestion)
          .select();

        if (!updateData || updateData.length === 0) {
          throw new Error('Aktualizace selhala - pravděpodobně nemáte oprávnění upravovat otázky (RLS policy)');
        }

        if (updateError) throw updateError;

        // Smažeme staré možnosti a vytvoříme nové
        await supabase
          .from('piano_quiz_theory_options')
          .delete()
          .eq('question_id', editingQuestion);

        const optionsToInsert = filledOptions.map(opt => ({
          question_id: editingQuestion,
          option_text: opt.option_text,
          is_correct: opt.is_correct,
          display_order: opt.display_order
        }));

        const { error: optionsError } = await supabase
          .from('piano_quiz_theory_options')
          .insert(optionsToInsert);

        if (optionsError) throw optionsError;

        showSuccess('Otázka byla úspěšně aktualizována');
      } else {
        // INSERT nové otázky
        const { data: newQuestion, error: insertError } = await supabase
          .from('piano_quiz_theory')
          .insert([{
            question: formData.question,
            difficulty: formData.difficulty,
            is_active: formData.is_active,
            display_order: formData.display_order
          }])
          .select()
          .single();

        if (insertError) throw insertError;

        const optionsToInsert = filledOptions.map(opt => ({
          question_id: newQuestion.id,
          option_text: opt.option_text,
          is_correct: opt.is_correct,
          display_order: opt.display_order
        }));

        const { error: optionsError } = await supabase
          .from('piano_quiz_theory_options')
          .insert(optionsToInsert);

        if (optionsError) throw optionsError;

        showSuccess('Otázka byla úspěšně přidána');
      }

      setShowAddForm(false);
      setEditingQuestion(null);
      fetchQuestions();
    } catch (err) {
      console.error('Error saving question:', err);
      setError('Nepodařilo se uložit otázku: ' + err.message);
    }
  };

  const handleToggleActive = async (questionId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('piano_quiz_theory')
        .update({ is_active: !currentStatus })
        .eq('id', questionId);

      if (error) throw error;

      showSuccess(`Otázka byla ${!currentStatus ? 'aktivována' : 'deaktivována'}`);
      fetchQuestions();
    } catch (err) {
      console.error('Error toggling active status:', err);
      setError('Nepodařilo se změnit stav: ' + err.message);
    }
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

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <BookOpen size={48} color="var(--color-primary)" style={{ animation: 'pulse 1.5s infinite' }} />
        <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Načítám otázky...</p>
      </div>
    );
  }

  return (
    <div className="card">
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
            <BookOpen size={24} color="var(--color-primary)" />
            Správa teoretického kvízu
          </h2>

          {/* Help Button */}
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

        {!showAddForm && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddQuestion}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}
          >
            <Plus size={16} />
            Přidat otázku
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

      {/* Help Panel */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, rgba(45, 91, 120, 0.05) 0%, rgba(181, 31, 101, 0.05) 100%)',
              borderRadius: 'var(--radius)',
              border: '2px solid rgba(45, 91, 120, 0.2)',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'rgba(45, 91, 120, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <HelpCircle size={20} color="var(--color-secondary)" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ marginBottom: '0.75rem', color: '#1e293b', fontSize: '1rem' }}>
                  Nápověda - Správa teoretického kvízu
                </h4>

                <div style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>📝 Jak přidat otázku:</strong>
                    <ol style={{ marginLeft: '1.5rem', marginBottom: '0' }}>
                      <li style={{ marginBottom: '0.25rem' }}>Klikněte na "Přidat otázku"</li>
                      <li style={{ marginBottom: '0.25rem' }}>Zadejte text otázky</li>
                      <li style={{ marginBottom: '0.25rem' }}>Nastavte obtížnost (snadné/střední/těžké)</li>
                      <li style={{ marginBottom: '0.25rem' }}>Zadejte 4 možnosti odpovědí</li>
                      <li style={{ marginBottom: '0.25rem' }}>Označte správnou odpověď</li>
                      <li>Uložte otázku</li>
                    </ol>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>💡 Tipy:</strong>
                    <ul style={{ marginLeft: '1.5rem', marginBottom: '0' }}>
                      <li style={{ marginBottom: '0.25rem' }}>Vždy musí být právě jedna správná odpověď</li>
                      <li style={{ marginBottom: '0.25rem' }}>Všechny 4 možnosti musí mít vyplněný text</li>
                      <li style={{ marginBottom: '0.25rem' }}>Neaktivní otázky se nezobrazí v kvízu</li>
                      <li>Pořadí zobrazení určuje pole "Pořadí"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Form */}
      <AnimatePresence mode="wait">
        {(showAddForm || editingQuestion) && (
          <motion.div
            key={editingQuestion || 'new'}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              background: 'rgba(181, 31, 101, 0.05)',
              borderRadius: 'var(--radius)',
              border: '2px solid rgba(181, 31, 101, 0.2)'
            }}
          >
            <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>
              {editingQuestion ? 'Upravit otázku' : 'Přidat novou otázku'}
            </h4>

            {/* Text otázky */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                Text otázky *
              </label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Zadejte text otázky..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid #ddd',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Obtížnost a Pořadí */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Obtížnost
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid #ddd',
                    fontSize: '0.875rem'
                  }}
                >
                  {DIFFICULTY_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Pořadí
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid #ddd',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: 'var(--radius)',
                  width: '100%',
                  fontSize: '0.875rem'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: 500 }}>Aktivní</span>
                </label>
              </div>
            </div>

            {/* Možnosti odpovědí */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 500, fontSize: '0.875rem' }}>
                Možnosti odpovědí (4 možnosti) *
              </label>
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
                    borderRadius: 'var(--radius)',
                    border: option.is_correct ? '2px solid var(--color-secondary)' : '2px solid transparent'
                  }}
                >
                  <span style={{ fontWeight: 600, minWidth: '25px', fontSize: '0.875rem' }}>{index + 1}.</span>
                  <input
                    type="text"
                    value={option.option_text}
                    onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                    placeholder={`Možnost ${index + 1}`}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: 'var(--radius)',
                      fontSize: '0.875rem'
                    }}
                  />
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      cursor: 'pointer',
                      padding: '0.5rem 0.75rem',
                      background: option.is_correct ? 'var(--color-secondary)' : 'rgba(0, 0, 0, 0.05)',
                      borderRadius: 'var(--radius)',
                      color: option.is_correct ? '#fff' : '#64748b',
                      fontWeight: 500,
                      minWidth: '110px',
                      justifyContent: 'center',
                      fontSize: '0.75rem'
                    }}
                  >
                    <input
                      type="radio"
                      name="correct_answer"
                      checked={option.is_correct}
                      onChange={() => handleOptionChange(index, 'is_correct', true)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    Správná
                  </label>
                </div>
              ))}
            </div>

            {/* Tlačítka */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowAddForm(false);
                  setEditingQuestion(null);
                  setError(null);
                }}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <X size={16} />
                Zrušit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveQuestion}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <Save size={16} />
                Uložit
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seznam otázek */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {questions.map((question) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01, y: -2 }}
            style={{
              background: question.is_active
                ? 'rgba(255, 255, 255, 0.9)'
                : 'rgba(200, 200, 200, 0.5)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(181, 31, 101, 0.2)',
              borderRadius: 'var(--radius)',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              boxShadow: '0 4px 15px rgba(181, 31, 101, 0.15)'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1rem' }}>{question.question}</h3>
                <span style={{
                  background: question.difficulty === 'easy' ? 'var(--color-secondary)' :
                             question.difficulty === 'medium' ? 'var(--color-primary)' : '#1e293b',
                  color: '#fff',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {question.difficulty === 'easy' ? 'Snadné' :
                   question.difficulty === 'medium' ? 'Střední' : 'Těžké'}
                </span>
                {!question.is_active && (
                  <span style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: '#fff',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    Neaktivní
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.875rem' }}>
                <strong style={{ color: '#64748b' }}>Možnosti odpovědí:</strong>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.375rem' }}>
                  {question.piano_quiz_theory_options
                    ?.sort((a, b) => a.display_order - b.display_order)
                    .map((opt, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: opt.is_correct ? 'var(--color-secondary)' : 'rgba(0, 0, 0, 0.1)',
                          color: opt.is_correct ? '#fff' : '#64748b',
                          padding: '0.25rem 0.625rem',
                          borderRadius: 'var(--radius)',
                          fontSize: '0.8125rem',
                          fontWeight: opt.is_correct ? '600' : '400'
                        }}
                      >
                        {opt.option_text}
                        {opt.is_correct && ' ✓'}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEditQuestion(question)}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  fontSize: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <Edit size={14} />
                Upravit
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDeleteQuestion(question.id)}
                className="btn btn-danger"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  fontSize: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <Trash2 size={14} />
                Smazat
              </motion.button>
            </div>
          </motion.div>
        ))}

        {questions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1.25rem' }}>
            <BookOpen size={48} color="var(--color-primary)" style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
            <p style={{ marginTop: '1.25rem', color: '#64748b', fontSize: '1rem' }}>
              Zatím nejsou žádné otázky. Přidejte první otázku pro kvíz!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TheoryQuizManager;
