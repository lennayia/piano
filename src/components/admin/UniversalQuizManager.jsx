import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { BookOpen, Plus, CheckCircle, AlertCircle, Music, X } from 'lucide-react';
import { HelpPanel } from '../ui/TabButtons';
import { RADIUS } from '../../utils/styleConstants';
import { Chip, ActionButton, AddButton, HelpButton, CancelButton, SaveButton } from '../ui/ButtonComponents';
import { RadioLabel, FormLabel, FormTextarea, FormSelect, FormInput, CheckboxLabel, FormContainer } from '../ui/FormComponents';
import { QuestionCard } from '../ui/CardComponents';

const UniversalQuizManager = ({ quizType = 'theory', title = 'Správa kvízů', icon: Icon = BookOpen }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const DEFAULT_OPTIONS = [
    { option_name: '', is_correct: true, display_order: 1 },
    { option_name: '', is_correct: false, display_order: 2 },
    { option_name: '', is_correct: false, display_order: 3 },
    { option_name: '', is_correct: false, display_order: 4 }
  ];

  const DIFFICULTY_LEVELS = [
    { value: 'easy', label: 'Snadné' },
    { value: 'medium', label: 'Střední' },
    { value: 'hard', label: 'Těžké' }
  ];

  const getDifficultyLevel = (difficulty) => {
    const levels = { easy: 1, medium: 2, hard: 3 };
    return levels[difficulty] || 1;
  };

  const getTableNames = () => {
    const tableMap = {
      theory: {
        mainTable: 'piano_quiz_theory',
        optionsTable: 'piano_quiz_theory_options',
        foreignKey: 'theory_question_id'
      },
      interval: {
        mainTable: 'piano_quiz_interval',
        optionsTable: 'piano_quiz_interval_options',
        foreignKey: 'interval_question_id'
      },
      scale: {
        mainTable: 'piano_quiz_scale',
        optionsTable: 'piano_quiz_scale_options',
        foreignKey: 'scale_question_id'
      },
      rhythm: {
        mainTable: 'piano_quiz_rhythm',
        optionsTable: 'piano_quiz_rhythm_options',
        foreignKey: 'rhythm_question_id'
      },
      mixed: {
        mainTable: 'piano_quiz_mixed',
        optionsTable: 'piano_quiz_mixed_options',
        foreignKey: 'mixed_question_id'
      }
    };

    return tableMap[quizType] || {
      mainTable: 'piano_quiz_chords',
      optionsTable: 'piano_quiz_chord_options',
      foreignKey: 'chord_id'
    };
  };

  const [formData, setFormData] = useState({
    name: '',
    quiz_type: quizType,
    difficulty: 'easy',
    is_active: true,
    display_order: 0,
    options: DEFAULT_OPTIONS
  });

  const getHelpContent = () => {
    const baseSteps = [
      'Klikněte na "Přidat otázku"',
      'Zadejte text otázky',
      'Nastavte obtížnost (snadné/střední/těžké)',
      'Zadejte 4 možnosti odpovědí',
      'Označte správnou odpověď',
      'Uložte otázku'
    ];

    const baseTips = [
      'Vždy musí být právě jedna správná odpověď',
      'Všechny 4 možnosti musí mít vyplněný text',
      'Neaktivní otázky se nezobrazí v kvízu',
      'Pořadí zobrazení určuje pole "Pořadí"'
    ];

    // Specifický obsah pro teorii hudby
    if (quizType === 'theory') {
      return {
        steps: baseSteps,
        sections: [
          {
            title: 'Základní pravidla',
            tips: baseTips
          },
          {
            title: 'Témata otázek',
            tips: [
              'Otázky mohou pokrývat intervaly, stupnice, akordy, harmonii, notaci'
            ]
          },
          {
            title: 'Doporučení podle obtížnosti',
            items: [
              { label: 'Snadné', text: 'základní pojmy (durové/mollové akordy, jednoduché intervaly)' },
              { label: 'Střední', text: 'složitější teorie (septakordy, kvintakord, inverze)' },
              { label: 'Těžké', text: 'pokročilá harmonie (alterované akordy, modulace, tonální funkce)' }
            ]
          },
          {
            title: 'Tipy pro tvorbu otázek',
            tips: [
              'Formulujte otázky jasně a jednoznačně',
              'Odpovědi by měly být podobné obtížnosti, aby nebyla jasná hned na první pohled'
            ]
          }
        ]
      };
    }

    return { steps: baseSteps, tips: baseTips };
  };

  useEffect(() => {
    fetchQuestions();
  }, [quizType]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { mainTable, optionsTable } = getTableNames();

      // Pro nové typy (theory, interval, scale, rhythm, mixed) načítáme bez filtru
      // Pro chord používáme filtr podle quiz_type
      const useFilter = !['theory', 'interval', 'scale', 'rhythm', 'mixed'].includes(quizType);

      let query = supabase
        .from(mainTable)
        .select(`
          *,
          ${optionsTable} (*)
        `);

      if (useFilter) {
        query = query.eq('quiz_type', quizType);
      }

      query = query.order('display_order');

      const { data: questionsData, error: questionsError } = await query;

      if (questionsError) throw questionsError;

      setQuestions(questionsData || []);
    } catch (err) {
      setError('Nepodařilo se načíst otázky: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setShowAddForm(true);
    setEditingQuestion(null);
    setFormData({
      name: '',
      quiz_type: quizType,
      difficulty: 'easy',
      is_active: true,
      display_order: questions.length + 1,
      options: DEFAULT_OPTIONS
    });
  };

  const handleEditQuestion = (question) => {
    // Pokud už editujeme tuto otázku, zavřít editaci
    if (editingQuestion === question.id) {
      setEditingQuestion(null);
      return;
    }

    setEditingQuestion(question.id);
    setShowAddForm(false);

    // Název pole options závisí na typu tabulky
    const { optionsTable } = getTableNames();
    const optionsFieldName = optionsTable;

    const sortedOptions = [...(question[optionsFieldName] || [])].sort(
      (a, b) => a.display_order - b.display_order
    );

    const formattedOptions = sortedOptions.length > 0
      ? sortedOptions.map(opt => ({
          option_name: opt.option_name || '',
          is_correct: opt.is_correct || false,
          display_order: opt.display_order || 1
        }))
      : DEFAULT_OPTIONS;

    setFormData({
      name: question.name,
      quiz_type: question.quiz_type || quizType,
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
      const { mainTable } = getTableNames();

      const { error } = await supabase
        .from(mainTable)
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      showSuccess('Otázka byla úspěšně smazána');
      fetchQuestions();
    } catch (err) {
      setError('Nepodařilo se smazat otázku: ' + err.message);
    }
  };

  const handleDuplicateQuestion = async (question) => {
    try {
      const { mainTable, optionsTable, foreignKey } = getTableNames();

      const questionData = {
        name: `${question.name} (kopie)`,
        difficulty: question.difficulty,
        is_active: question.is_active,
        display_order: questions.length + 1,
      };

      // Pro nové typy kvízů (theory, interval, scale, rhythm, mixed) přidáme question_text
      if (['theory', 'interval', 'scale', 'rhythm', 'mixed'].includes(quizType)) {
        questionData.question_text = question.question_text || question.name;
        if (question.category) questionData.category = question.category;
      } else {
        // Pro chord přidáme quiz_type, notes a category
        questionData.quiz_type = question.quiz_type;
        questionData.notes = null;
        questionData.category = null;
      }

      const { data: newQuestion, error: questionError } = await supabase
        .from(mainTable)
        .insert([questionData])
        .select()
        .single();

      if (questionError) throw questionError;

      // Zkopírujeme options - název pole v datech závisí na typu tabulky
      const { optionsTable: optionsFieldName } = getTableNames();
      const optionsToCopy = question[optionsFieldName]?.map(opt => ({
        [foreignKey]: newQuestion.id,
        option_name: opt.option_name,
        is_correct: opt.is_correct,
        display_order: opt.display_order
      })) || [];

      if (optionsToCopy.length > 0) {
        const { error: optionsError } = await supabase
          .from(optionsTable)
          .insert(optionsToCopy);

        if (optionsError) throw optionsError;
      }

      showSuccess('Otázka byla úspěšně duplikována');
      fetchQuestions();
    } catch (err) {
      setError('Nepodařilo se duplikovat otázku: ' + err.message);
    }
  };

  const handleSaveQuestion = async () => {
    try {
      if (!formData.name.trim()) {
        setError('Text otázky je povinný');
        return;
      }

      const filledOptions = formData.options.filter(opt => opt.option_name && opt.option_name.trim());

      if (filledOptions.length !== 4) {
        setError('Vyplňte všechny 4 možnosti odpovědí');
        return;
      }

      const correctAnswers = filledOptions.filter(opt => opt.is_correct);
      if (correctAnswers.length !== 1) {
        setError('Musí být právě jedna správná odpověď');
        return;
      }

      setError(null);

      const { mainTable, optionsTable, foreignKey } = getTableNames();

      const questionData = {
        name: formData.name,
        difficulty: formData.difficulty,
        is_active: formData.is_active,
        display_order: formData.display_order,
      };

      // Pro nové typy kvízů (theory, interval, scale, rhythm, mixed) přidáme question_text
      if (['theory', 'interval', 'scale', 'rhythm', 'mixed'].includes(quizType)) {
        questionData.question_text = formData.name;
        if (formData.category) questionData.category = formData.category;
      } else {
        // Pro chord přidáme quiz_type, notes a category
        questionData.quiz_type = quizType;
        questionData.notes = null;
        questionData.category = null;
      }

      if (editingQuestion) {
        const { data: updateData, error: updateError } = await supabase
          .from(mainTable)
          .update(questionData)
          .eq('id', editingQuestion)
          .select();

        if (!updateData || updateData.length === 0) {
          throw new Error('Aktualizace selhala - pravděpodobně nemáte oprávnění upravovat otázky (RLS policy)');
        }

        if (updateError) throw updateError;

        await supabase
          .from(optionsTable)
          .delete()
          .eq(foreignKey, editingQuestion);

        const optionsToInsert = filledOptions.map(opt => ({
          [foreignKey]: editingQuestion,
          option_name: opt.option_name,
          is_correct: opt.is_correct,
          display_order: opt.display_order
        }));

        const { error: optionsError } = await supabase
          .from(optionsTable)
          .insert(optionsToInsert);

        if (optionsError) throw optionsError;

        showSuccess('Otázka byla úspěšně aktualizována');
      } else {
        const { data: newQuestion, error: insertError } = await supabase
          .from(mainTable)
          .insert([questionData])
          .select()
          .single();

        if (insertError) throw insertError;

        const optionsToInsert = filledOptions.map(opt => ({
          [foreignKey]: newQuestion.id,
          option_name: opt.option_name,
          is_correct: opt.is_correct,
          display_order: opt.display_order
        }));

        const { error: optionsError } = await supabase
          .from(optionsTable)
          .insert(optionsToInsert);

        if (optionsError) throw optionsError;

        showSuccess('Otázka byla úspěšně přidána');
      }

      setShowAddForm(false);
      setEditingQuestion(null);
      fetchQuestions();
    } catch (err) {
      setError('Nepodařilo se uložit otázku: ' + err.message);
    }
  };

  const handleToggleActive = async (questionId, currentStatus) => {
    try {
      const { mainTable } = getTableNames();

      const { error } = await supabase
        .from(mainTable)
        .update({ is_active: !currentStatus })
        .eq('id', questionId);

      if (error) throw error;

      showSuccess(`Otázka byla ${!currentStatus ? 'aktivována' : 'deaktivována'}`);
      fetchQuestions();
    } catch (err) {
      setError('Nepodařilo se změnit stav: ' + err.message);
    }
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Icon size={48} color="var(--color-primary)" style={{ animation: 'pulse 1.5s infinite' }} />
        <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Načítám otázky...</p>
      </div>
    );
  }

  const helpContent = getHelpContent();

  return (
    <>
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
            <Icon size={24} color="var(--color-primary)" />
            {title}
          </h2>

          <HelpButton onClick={() => setShowHelp(!showHelp)} isActive={showHelp} />
        </div>

        {!showAddForm && !editingQuestion && (
          <AddButton onClick={handleAddQuestion} iconOnly={true} />
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
        title={`Nápověda - ${title}`}
        content={helpContent}
      />

      {/* Add Form (pouze pro přidání nové otázky) */}
      <AnimatePresence mode="wait">
        {showAddForm && !editingQuestion && (
          <FormContainer
            as={motion.div}
            key={editingQuestion || 'new'}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>
              {editingQuestion ? 'Upravit otázku' : 'Přidat novou otázku'}
            </h4>

            {/* Text otázky */}
            <div style={{ marginBottom: '1rem' }}>
              <FormLabel text="Text otázky" required />
              <FormTextarea
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Zadejte text otázky..."
                rows={3}
              />
            </div>

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

            {/* Možnosti odpovědí */}
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

            {/* Tlačítka */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <CancelButton
                onClick={() => {
                  setShowAddForm(false);
                  setEditingQuestion(null);
                  setError(null);
                }}
              />
              <SaveButton onClick={handleSaveQuestion} />
            </div>
          </FormContainer>
        )}
      </AnimatePresence>

      {/* Seznam otázek */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {questions.map((question) => (
          <React.Fragment key={question.id}>
            {editingQuestion === question.id ? (
              /* Inline editační formulář */
              <FormContainer
                as={motion.div}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>
                  Upravit otázku
                </h4>

                {/* Text otázky */}
                <div style={{ marginBottom: '1rem' }}>
                  <FormLabel text="Text otázky" required />
                  <FormTextarea
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Zadejte text otázky..."
                    rows={3}
                  />
                </div>

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

                {/* Možnosti odpovědí */}
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

                {/* Tlačítka */}
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <CancelButton
                    onClick={() => {
                      setEditingQuestion(null);
                      setError(null);
                    }}
                  />
                  <SaveButton onClick={handleSaveQuestion} />
                </div>
              </FormContainer>
            ) : (
              /* Normální karta otázky */
              <QuestionCard
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01, y: -2 }}
                isActive={question.is_active}
              >
                <div style={{ flex: 1 }}>
                  {/* Řádek 1: Otázka + chip obtížnosti a status vpravo */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1rem', flex: 1 }}>{question.name}</h3>
                    <Chip
                      text={String(getDifficultyLevel(question.difficulty))}
                      variant="difficulty"
                      level={getDifficultyLevel(question.difficulty)}
                    />
                    {!question.is_active && (
                      <Chip text="Neaktivní" variant="inactive" />
                    )}
                  </div>

                  {/* Řádek 2: Chipy odpovědí + action buttony vpravo */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {(() => {
                      const { optionsTable } = getTableNames();
                      return question[optionsTable]
                        ?.sort((a, b) => a.display_order - b.display_order)
                        .map((opt, idx) => (
                          <Chip
                            key={idx}
                            text={opt.option_name}
                            variant="answer"
                            isCorrect={opt.is_correct}
                          />
                        ));
                    })()}
                    <div style={{ display: 'flex', gap: '0.375rem', marginLeft: 'auto' }}>
                      <ActionButton
                        variant="edit"
                        onClick={() => handleEditQuestion(question)}
                      />
                      <ActionButton
                        variant="duplicate"
                        onClick={() => handleDuplicateQuestion(question)}
                      />
                      <ActionButton
                        variant="delete"
                        onClick={() => handleDeleteQuestion(question.id)}
                      />
                    </div>
                  </div>
                </div>
              </QuestionCard>
            )}
          </React.Fragment>
        ))}

        {questions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1.25rem' }}>
            <Icon size={48} color="var(--color-primary)" style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
            <p style={{ marginTop: '1.25rem', color: '#64748b', fontSize: '1rem' }}>
              Zatím nejsou žádné otázky. Přidejte první otázku pro kvíz!
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default UniversalQuizManager;
